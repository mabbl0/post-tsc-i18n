import { describe, expect, test } from "vitest";
import { LogLevel, setLogLevel } from "../../tool/log";
import { staticTranslation } from '../../static-translation/static-translation';
import fs from 'fs';

const pathToTestDir = './src/test/static-tr/files-to-test';
const pathToTmpDir = pathToTestDir + '-tmp';
setLogLevel(LogLevel.None);

describe('Static File Translation', () => {
    
    test(`Static Files Translation in ${pathToTestDir} directory`, async () => {
        // copy the file to translate to a tempory directory
        fs.cpSync(pathToTestDir, pathToTmpDir, 
            {force: true, recursive: true});

        staticTranslation({
            srcDir: pathToTmpDir,
            outDir: pathToTmpDir,
            uniqueOutFile: undefined,
            outLang: 'bzh',
            fallbackLang: ['fr']
        });

        // wait 100ms for the translation finish
        await new Promise(resolve => setTimeout(resolve, 100));
        

        /** The simple translation **/
        let file1Tr = fs.readFileSync(pathToTmpDir + '/code.js').toString();
        // the correct bzh translation
        expect(file1Tr.indexOf("Demat d'an holl !")).to.not.equal(-1);
        // the fr fallback translation if no bzh translation
        expect(file1Tr.indexOf("Qui est là ?")).to.not.equal(-1);
        // the no translation, if string include in bigger one
        expect(file1Tr.indexOf("Who is here? in the bottle?")).to.not.equal(-1);


        /** The string interpolation translation **/
        let file2Tr = fs.readFileSync(pathToTmpDir + '/sub-dir/sub-code.js').toString();
        // translate the string interpolation
        expect(file2Tr.indexOf("`peut être ${i} personne ? ${i * 2} ?`")).to.not.equal(-1);
        // translate reverse the string interpolation, tanks to id
        expect(file2Tr.indexOf("`les ${nbCar} voitures de ${personName}`")).to.not.equal(-1);

        
        /** Multiple simple translation from one file **/
        let file3Tr = fs.readFileSync(pathToTmpDir + '/code-1.js').toString();
        let file4Tr = fs.readFileSync(pathToTmpDir + '/sub-dir/sub-code-1.js').toString();
        // the correct fallback translation
        expect(file3Tr.indexOf("Bonjour les filles en bleue ?")).to.not.equal(-1);
        // the correct fallback translation
        expect(file4Tr.indexOf("Salut toi en rouge")).to.not.equal(-1);


        // delete the tempory directory
        fs.rmSync(pathToTmpDir, {force: true, recursive: true});
    });
});
