import { log, LogLevel, setLogLevelByStr, StrLogLevel } from "../tool/log";
import { AccessDynamicStrInterTrJson, DynamicTranslationData, DynamicTranslationDataJson, LangTranslationsData, TranslationsDataJson } from "./translation-data";
import fs from 'fs';
import path from 'path';
import { AccessDynamicStrInterTr } from "./access-dynamic-str-inter-tr";


/** Initiat the global variable **/

/**
 * all data for the dynamic translation
 */
var dynamicTranslationData: DynamicTranslationData = {
    baseTranslation: {},
    nbBaseTr: 0,
    data: new Map<string, LangTranslationsData>(),
    dataNbTr: new Map<string,number>()
};

/**
 * the object to access to the current translation
 */
export var translate: LangTranslationsData = {};

interface InitDynamicTrParameter {
    /**
     * Output directory to find the dynamic translation data file
     */
    outDir: string,
    /**
     * Path to the data for the dynamic translation file from the output directory
     */
    dynamicTrData?: string,
    /**
     * the language to start the translation
     */
    langStart: string,
    /**
     * the fallback language if the first language translation is not available 
     */
    fallbackLang?: string[],
    /**
     * the log level
     */
    logLevel?: StrLogLevel
}

/**
 * Initiate the dynamic translation
 * @param initParameter parameter for the dynamic translation
 */
export function initDynamicTr(initParameter: InitDynamicTrParameter) {
    // TODO: return indication if the initialization is a successs
    setLogLevelByStr(initParameter.logLevel);
    
    let absPathToDynTrData: string;
    if(initParameter.dynamicTrData!=undefined) {
        absPathToDynTrData = path.resolve(initParameter.outDir, initParameter.dynamicTrData);
    }
    else {
        absPathToDynTrData = path.resolve(initParameter.outDir, "dynamicTrData.lang.json");
    }

    if(dynamicTranslationData.data.size == 0) {
        log(LogLevel.Info, `Initiate the dynamic translation data from '${absPathToDynTrData}'`);
    }
    else {
        log(LogLevel.Info, `Initiate new dynamic translation data from '${absPathToDynTrData}'`);
    }


    let dynamicTrJson = loadDynamicLangFile(absPathToDynTrData);
    log(LogLevel.Debug, 'dynamic data loaded:', dynamicTrJson);
    if( dynamicTrJson==undefined || !checkDynamicTrData(dynamicTrJson) ) {
        log(LogLevel.Error, `dynamic translation data from '${absPathToDynTrData}' lang file is incorrect`);
        return;
    }

    initDynamicTrData(dynamicTrJson, initParameter.fallbackLang);
    // change the lang to start lang
    lang(initParameter.langStart);
    log(LogLevel.Info, 'Sucessfully initiate the dynamic translation data');
}

/**
 * Load he data from the dynamic lang file
 * @param absPathToDynTrData Path to the data for the dynamic translation file from the output directory
 * @returns the content data readed, or undefined if fail
 */
function loadDynamicLangFile(absPathToDynTrData: string): DynamicTranslationDataJson | undefined {
    try {
        const fileContent = fs.readFileSync( absPathToDynTrData, 'utf-8');
        if(fileContent.length!=0) {
            return JSON.parse(fileContent) as DynamicTranslationDataJson;
        }
    } catch (error) {
        log(LogLevel.Error, 'Fail to read the dynamic translation data');
        log(LogLevel.Error, error);
    }
    return undefined;
}

/**
 * Check the data json from the dynamic lang file
 * @param dynamicTrJson the data json to check
 * @returns indicate if the data is correct
 */
function checkDynamicTrData(dynamicTrJson: DynamicTranslationDataJson | undefined): boolean {
    if(dynamicTrJson!=undefined && 
        dynamicTrJson.data != undefined && 
        dynamicTrJson.data.length!=0)
    {
        for (let i = 0; i < dynamicTrJson.data.length; i++) {
            if(dynamicTrJson.data[i].lang == undefined || dynamicTrJson.data[i].tr == undefined) {
                return false;
            }
        }
        return true;
    }
    return false;
}


/**
 * Initiate the data for the dynamic translation
 * @param dynamicTrJson the data for the dynamic translation file
 * @param fallbackLang the fallback language
 */
function initDynamicTrData(dynamicTrJson: DynamicTranslationDataJson, fallbackLang: string[]|undefined) {
    /*** Initiate data ***/

    // find the lang with the more translation (may be the source lang)
    let maxNbTr = 0;
    let langMaxTr: string[] = [];
    let langData: LangTranslationsData | undefined;
    let langNb: number|undefined;
    dynamicTrJson.data.forEach( langTrDataJson => {
        // do not erase the lang, in case of multiple initialization
        langData = dynamicTranslationData.data.get(langTrDataJson.lang);
        if(langData != undefined) {
            Object.assign(langData, parseJsonLangData(langTrDataJson.tr)); // complete and replace the property already in the object
            log(LogLevel.Debug, langTrDataJson.nbTr, 'new translations added to the', langTrDataJson.lang, 'language');
        }
        else {
            dynamicTranslationData.data.set(langTrDataJson.lang, parseJsonLangData(langTrDataJson.tr));
            log(LogLevel.Debug, 'language', langTrDataJson.lang, 'added with', langTrDataJson.nbTr, 'translations');
        }
        langNb = dynamicTranslationData.dataNbTr.get(langTrDataJson.lang);
        if(langNb != undefined) {
            dynamicTranslationData.dataNbTr.set(langTrDataJson.lang, langNb + langTrDataJson.nbTr);
        }
        else {
            dynamicTranslationData.dataNbTr.set(langTrDataJson.lang, langTrDataJson.nbTr);
        }
    

        if(langTrDataJson.nbTr > maxNbTr) {
            maxNbTr = langTrDataJson.nbTr;
            langMaxTr = [langTrDataJson.lang];
        }
        else if(langTrDataJson.nbTr == maxNbTr) {
            langMaxTr.push(langTrDataJson.lang);
        }
    });

    /*** The base translation ***/

    // intiate the translation to be sure to get a value for each translation
    let trData: LangTranslationsData | undefined;
    if(langMaxTr.length > 1 && langMaxTr.includes('en')) {
        // choose 'en' lang by default, if several choose
        trData = dynamicTranslationData.data.get('en');
        if(trData!=undefined) {
            Object.assign(dynamicTranslationData.baseTranslation, trData); // complete and replace the property already in the object
        }
    }
    else if(langMaxTr.length != 0) {
        trData = dynamicTranslationData.data.get( langMaxTr[0] );
        if(trData!=undefined) {
            Object.assign(dynamicTranslationData.baseTranslation, trData); // complete and replace the property already in the object
        }
    }

    // complete the base translation with the fallbasck lang
    if(fallbackLang!=undefined) {
        for (let i = fallbackLang.length-1 ; i >= 0 ; i--) { // reverse process
            trData = dynamicTranslationData.data.get( fallbackLang[i] );
            if(trData!=undefined) {
                Object.assign(dynamicTranslationData.baseTranslation, trData); // complete and replace the property already in the object
            } 
        }
    }

    // make sure the base translation is completed with all translation available
    let trKeys: string[];
    dynamicTranslationData.data.forEach(langTrData => {
        trKeys = Object.keys(langTrData);
        trKeys.forEach(k => {
            if(dynamicTranslationData.baseTranslation[k] == undefined) {
                dynamicTranslationData.baseTranslation[k] = langTrData[k];
            }
        });
    });
    dynamicTranslationData.nbBaseTr = Object.keys(dynamicTranslationData.baseTranslation).length;
    log(LogLevel.Debug, 'base translation completed with', dynamicTranslationData.nbBaseTr, 'translations:', dynamicTranslationData.baseTranslation);
}

/**
 * Parse the json data for 1 lang from the dynamic lang file
 * @param trDataJson the json data from the dynamic lang file
 */
function parseJsonLangData(trDataJson: TranslationsDataJson): LangTranslationsData {
    const keysIdTr = Object.keys(trDataJson);
    let langTrData: LangTranslationsData = {};
    keysIdTr.forEach( (idTr) => {
        if((trDataJson[idTr] as AccessDynamicStrInterTrJson).splitTr != undefined) {
            langTrData[idTr] = new AccessDynamicStrInterTr( (trDataJson[idTr] as AccessDynamicStrInterTrJson).splitTr, (trDataJson[idTr] as AccessDynamicStrInterTrJson).mapIdOrder );
        }
        else {
            langTrData[idTr] = trDataJson[idTr] as string;
        }
    });

    return langTrData;
}


/**
 * Change the translated lang
 * @param newLang the new lang to apply
 */
export function lang(newLang: string) {
    // TODO: return indication it is a successs
    if(dynamicTranslationData.nbBaseTr == 0) {
        // no data loaded
        log(LogLevel.Error, "No data to change translation language");
        return;
    }

    // find and apply the new lang
    let newTrData = dynamicTranslationData.data.get(newLang);
    if(newTrData!=undefined) {
        let nbNewTr = dynamicTranslationData.dataNbTr.get(newLang);
        if(nbNewTr!=undefined && nbNewTr>=dynamicTranslationData.nbBaseTr) {
            // the new tr to apply is complete
            Object.assign(translate, newTrData); // complete and replace the property already in the object
        }
        else {
            // re-initiate the translation with the base
            Object.assign(translate, dynamicTranslationData.baseTranslation);
            // then apply the translation choosen
            Object.assign(translate, newTrData); // complete and replace the property already in the object
        }
        log(LogLevel.Info, `Change language translation to '${newLang}'`);
        log(LogLevel.Debug, 'new translate:', translate);
    }
    else {
        log(LogLevel.Error, `the language '${newLang}' is not available with the dynamic translation data`);
    }
}


export default {translate, initDynamicTr, lang};