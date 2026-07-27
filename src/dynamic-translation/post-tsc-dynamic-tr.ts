import path from "path";
import fs from "fs";
import { addPathToJsFile, readLangFiles } from "../common/lang-files";
import { DynamicTranslationParam } from "../common/translation-parameter";
import { log, LogLevel } from "../tool/log";
import { LangFile, LangTranslation } from "../common/lang-file-type";
import { DynamicTranslationDataJson, PtscDynamicLangFile, PtscDynamicTrData, SimplePtscDynamicTrData } from "./translation-data";
import { fastReadWrite } from "../tool/file";
import { DynamicStrInterpolationTr } from "./dynamic-str-interpolation-tr";
import { reStrInter } from "../common/str-interpolation-tr";

const postTscModule = "dynamic-translation-post-tsc";
const postTscModuleName = "dynamic_translation_post_tsc";
const postTscTrAccess = ".translate.";
export const strInterTrAccess = "?.with("; // AccessDynamicStrInterTr.with

// (?<=const)\s*dynamic_translation[a-zA-Z_1-9]*(?=\s*\=\s*require\s*\(\s*\"[a-zA-Z1-9\._\/-]*dynamic-translation\"\s*\))
const reModuleNameRequire = new RegExp("(?<=const)\\s*" + RegExp.escape(postTscModuleName) + "[A-Z_1-9]*(?=\\s*\\=\\s*require\\s*\\(\\s*\\\"[a-zA-Z1-9\\._\\/-]*" + RegExp.escape(postTscModule) + "\\\"\\s*\\))", 'g');
const ptscRequire = `const ${postTscModuleName} = require("${postTscModule}");\n`;

/**
 * Read the lang files and prepare the data for a dynamic translation
 * @param dynamicParameter parameter to prepare the translation data for dynamic translation
 */
export function dynamicTranslationPostTsc(dynamicParameter: DynamicTranslationParam) {
    log(LogLevel.Verbose, `Dynamic Translation Post tsc for the '${dynamicParameter.srcDir}' source path`);
    
    let idModuleName = idModuleNameToIdentifer(dynamicParameter.idModuleName);
    readLangFiles(dynamicParameter.srcDir, dynamicParameter.uniqueOutFile, langFiles => {
        let dynamicLangFiles: PtscDynamicLangFile[] = [];
        let dynamicTranslationJson: DynamicTranslationDataJson = {
            data: []
        }
        processLangFilesData(langFiles, idModuleName, dynamicLangFiles, dynamicTranslationJson);

        let distAbsPath = path.resolve(dynamicParameter.outDir);
        saveDynamicTranslationData(distAbsPath, dynamicParameter.dynamicTrData, dynamicTranslationJson);

        syncUpdateFilesForDynamicTr(distAbsPath, dynamicLangFiles, 0);
    });

}

/**
 * Process the data from the 
 * @param langFiles the data from the lang files
 * @param dynamicLangFiles the lang file data for the post tsc dynamic translation
 * @param dynamicTranslationJson the dynamic translation data to save
 */
function processLangFilesData(langFiles: LangFile[], idModuleName: string, dynamicLangFiles: PtscDynamicLangFile[], dynamicTranslationJson: DynamicTranslationDataJson) {
    let dynamicLangF: PtscDynamicLangFile;
    let idTrBaseList: { name: string, nb: number }[] = [];
    let indexIdTr: number;
    let idTrBase: string, idTr: string, srcTr: string;
    let ptscData: PtscDynamicTrData | undefined
    for (let i = 0; i < langFiles.length; i++) {

        // initiate the translation object for the file
        dynamicLangF = {
            fileName: langFiles[i].pathFromSrc,
            pathToJs: [],
            data: []
        };

        // add the possible path to find the file
        addPathToJsFile(dynamicLangF.pathToJs, langFiles[i].pathFromSrc, langFiles[i].data.filePath);

        // get a unique idTr base for the file
        idTrBase = fileNameToIdTrBase(idModuleName, dynamicLangF.fileName);
        indexIdTr = idTrBaseList.findIndex(idTrB => idTrB.name == idTrBase);
        if (indexIdTr == -1) {
            idTrBaseList.push({ name: idTrBase, nb: 1 });
        }
        else {
            idTrBase += idTrBaseList[indexIdTr].nb + '_';
            idTrBaseList[indexIdTr].nb += 1;
        }


        // prepare and add every translation for the json save and the post tsc 
        langFiles[i].data.translations.forEach((trLangFile, j) => {
            srcTr = trLangFile[langFiles[i].data.srcLang];
            if (srcTr != undefined) {
                idTr = idTrBase + j;
                ptscData = addOneTrForPtsc(srcTr, idTr, dynamicLangF.data);
                if(ptscData!=undefined) {
                    addOneTrToJson(trLangFile, ptscData, idTr, dynamicTranslationJson);
                }
            }
        });

        dynamicLangFiles.push(dynamicLangF);
    }
}

/**
 * Get base of id translation for a file name
 * @param idModuleName the module name id 
 * @param fileName file name
 * @returns the base of id translation for the file
 */
function fileNameToIdTrBase(idModuleName: string, fileName: string): string {
    return idModuleName + stringToIdentifer( path.basename(fileName, '.js') );   // remove extension
}

/**
 * Get the identifer name from the id module name
 * @param idModuleName the module name id 
 * @returns the identifer for the id module name
 */
function idModuleNameToIdentifer(idModuleName: string|undefined): string {
    if(idModuleName!=undefined) {
        log(LogLevel.Verbose, `Module name '${idModuleName}' added to the identifers name`);
        return stringToIdentifer(idModuleName);
    }
    return '';
}

/**
 * Get an identifer name from a string
 * @param str the string to change
 * @returns the identifer from the string
 */
function stringToIdentifer(str: string): string {
    return str.replaceAll(/[^a-zA-Z0-9]+/g, '')   // remove all alphanumeric char
        .replace(/^(?=[0-9])/g, '_')        // add '_' if start with a number
         + '_';                             // add '_' at the end for the next step
}

/**
 * add one translation to the data to save
 * @param trLangFile a translation from a lang file
 * @param ptscDynTrData the data to update the js file with the dynamic str interpolation tr
 * @param idTr the id translation for this translation
 * @param dynamicTranslationJson the dynamic translation to save
 */
function addOneTrToJson(trLangFile: LangTranslation, ptscDynTrData: PtscDynamicTrData, idTr: string, dynamicTranslationJson: DynamicTranslationDataJson) {
    const keysLang = Object.keys(trLangFile);
    let langIndex: number;
    let mapNumIdOrder: number[] | undefined;
    keysLang.forEach((keyLang) => {
        langIndex = dynamicTranslationJson.data.findIndex(langDataTr => langDataTr.lang == keyLang);
        if (langIndex == -1) {
            langIndex = dynamicTranslationJson.data.length;
            dynamicTranslationJson.data.push({
                lang: keyLang,
                nbTr: 0,
                tr: {}
            });
        }

        if((ptscDynTrData as DynamicStrInterpolationTr).mapNumIdOrder != undefined) {
            // is a string interpolation tr
            mapNumIdOrder = (ptscDynTrData as DynamicStrInterpolationTr).mapNumIdOrder(trLangFile[keyLang]);
            if(mapNumIdOrder != undefined) {
                dynamicTranslationJson.data[langIndex].tr[idTr] = {
                    splitTr: trLangFile[keyLang].split(reStrInter),
                    mapIdOrder: mapNumIdOrder
                }
            }
        }
        else {
            // is a simple tr
            dynamicTranslationJson.data[langIndex].tr[idTr] = trLangFile[keyLang];
        }
        dynamicTranslationJson.data[langIndex].nbTr += 1;
    });
}

/**
 * Prepare the one translation for the post tsc
 * @param srcTr the source translation to find in the file
 * @param idTr the translation id
 * @param ptscDynTrData the dynamic translation data for the update file
 * @returns the data added
 */
function addOneTrForPtsc(srcTr: string, idTr: string, ptscDynTrData: PtscDynamicTrData[]): PtscDynamicTrData | undefined {
    if(DynamicStrInterpolationTr.isStrInterpolationTr(srcTr)) {
        // a string interpolation tr
        let dynStrInterTr = new DynamicStrInterpolationTr(srcTr, idTr);
        if(dynStrInterTr.rdy) {
            ptscDynTrData.push(dynStrInterTr);
            return dynStrInterTr;
        }
        return;
    }
    else {
        // a simple tr
        ptscDynTrData.push({
            srcTr: new RegExp("(\'|\"|\`)" + RegExp.escape(srcTr) + "(\'|\"|\`)", 'g'),
            idTr: idTr
        });
        return ptscDynTrData[ ptscDynTrData.length-1 ];
    }
}


/**
 * Save the dynamic translation data
 * @param distAbsPath the absolute path to the output directory
 * @param dynamicLangFile the dynamic lang file to save
 * @param dynamicTranslationJson the dynamic translation data to save
 */
function saveDynamicTranslationData(distAbsPath: string, dynamicLangFile: string, dynamicTranslationJson: DynamicTranslationDataJson) {
    let dynamicLangFabsPath = path.resolve(path.format({ dir: distAbsPath, base: dynamicLangFile }));
    fs.writeFile(dynamicLangFabsPath, JSON.stringify(dynamicTranslationJson), "utf-8", (err) => {
        if (err) {
            log(LogLevel.Error, "Fail to save the data fiel for the dynamic translation");
            throw err;
        }
        log(LogLevel.Verbose, "Sucessfully save the data for the dynamic translation", dynamicLangFabsPath);
    });
}


/**
 * Synchro update files for dynamic translation
 * @param distAbsPath absolute path to the output directory
 * @param dynamicLangFiles the dynamic lang files data
 * @param indexToUp the index to the files to update
 */
function syncUpdateFilesForDynamicTr(distAbsPath: string, dynamicLangFiles: PtscDynamicLangFile[], indexToUp: number) {
    if(indexToUp >= dynamicLangFiles.length) {
        log(LogLevel.Info, "Successfully update the project!");
        return;
    }

    updateFileForDynamicTr(distAbsPath, dynamicLangFiles[indexToUp], 
        () => syncUpdateFilesForDynamicTr(distAbsPath, dynamicLangFiles, indexToUp+1)
    );
}



/**
 * Update the js file after the tsc for the dynamic translation
 * @param distAbsPath the absolute path to the output directory
 * @param dynamicLangFiles the lang file data for the post tsc dynamic translation
 */
function updateFileForDynamicTr(distAbsPath: string, dynamicLangF: PtscDynamicLangFile, endCallback: ()=>void) {
    if (distAbsPath.length == 0) {
        log(LogLevel.Error, `empty absolute dist path: ${distAbsPath}`);
        return;
    }

    log(LogLevel.Verbose, `Start to update '${dynamicLangF.fileName}' file for the dynamic translation`);
    if (dynamicLangF.pathToJs.length == 0) {
        log(LogLevel.Error, `empty path to file ${dynamicLangF.fileName}`);
        return;
    }
    if (dynamicLangF.data.length == 0) {
        log(LogLevel.Error, `empty data for ${dynamicLangF.fileName}`);
        return;
    }


    readWriteFiles(distAbsPath, dynamicLangF, 0, endCallback);
}

/**
 * Recursive read and write to update a file
 * and try different path
 * @param distAbsPath the absolute path to the output directory
 * @param dynamicLangFile the lang file data for the post tsc dynamic translation
 * @param pathToTest the path index to test
 */
function readWriteFiles(distAbsPath: string, dynamicLangFile: PtscDynamicLangFile, pathToTest: number, endCallback: ()=>void) {
    if (pathToTest >= dynamicLangFile.pathToJs.length) {
        log(LogLevel.Error, `Fail to find the file to update: ${dynamicLangFile.fileName}`);
        return;
    }

    let absPath = path.format({ dir: distAbsPath, base: dynamicLangFile.pathToJs[pathToTest] });
    fastReadWrite(absPath,
        (dataReaded) => processFileUpdate(dataReaded, dynamicLangFile)
        , (err) => {
            // Error management
            if (err) {
                if (pathToTest + 1 < dynamicLangFile.pathToJs.length) {
                    log(LogLevel.Verbose, `try an other path, fail to find the path: ${absPath}`);
                    readWriteFiles(distAbsPath, dynamicLangFile, pathToTest + 1, endCallback);
                }
                else {
                    log(LogLevel.Error, err);
                    endCallback();
                }
            }
            else {
                log(LogLevel.Verbose, `Successfully update the '${dynamicLangFile.fileName}' file`);
                endCallback();
            }
        });
}

/**
 * update the file for the dynamic translation
 * @param dataReaded the data readed from the file
 * @param dynamicLangFile the data to apply
 */
function processFileUpdate(dataReaded: string, dynamicLangFile: PtscDynamicLangFile): string {
    log(LogLevel.Debug, 'start file update');

    // Get and update the module name
    let moduleNameUsed = postTscModuleName;
    let requireMatch = dataReaded.match(reModuleNameRequire);
    if( requireMatch == null || requireMatch.length==0) {
        dataReaded = ptscRequire + dataReaded;
    }
    else {
        moduleNameUsed = requireMatch[0].trim();
    }
    log(LogLevel.Debug, "module name used: ", moduleNameUsed);

    let trAccessStr = moduleNameUsed + postTscTrAccess;
    // find a replace the string by the access to the dynamic translation
    dynamicLangFile.data.forEach(dataTr => {
        log(LogLevel.Debug, dataTr);
        if((dataTr as DynamicStrInterpolationTr).applySrcUpdate != undefined) {
            dataReaded = (dataTr as DynamicStrInterpolationTr).applySrcUpdate(dataReaded, trAccessStr);
        }
        else {
            log(LogLevel.Debug, 'apply one simple update');
            dataReaded = dataReaded.replaceAll((dataTr as SimplePtscDynamicTrData).srcTr, trAccessStr + (dataTr as SimplePtscDynamicTrData).idTr);
        }
    });
    return dataReaded;
}

