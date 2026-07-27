import { describe, expect, test } from "vitest";
import { LogLevel, setLogLevel } from "../../tool/log";
import { staticTranslation } from '../../static-translation/static-translation';
import fs from 'fs';

const pathToTestDir = './src/test/static-tr/files-to-test-override';
const pathToTmpDir = pathToTestDir + '-tmp';
const uniqueOutFile = "index.js";
setLogLevel(LogLevel.None);

describe('Static File Translation', () => {
    
    test(`Static Files Translation in ${pathToTestDir} directory with a unique output file`, async () => {
        // copy the file to translate to a tempory directory
        fs.cpSync(pathToTestDir, pathToTmpDir, 
            {force: true, recursive: true});

        staticTranslation({
            srcDir: pathToTmpDir,
            outDir: pathToTmpDir,
            uniqueOutFile: uniqueOutFile,
            outLang: 'bzh',
            fallbackLang: ['fr']
        });

        // wait 100ms for the translation finish
        await new Promise(resolve => setTimeout(resolve, 100));
        
        /** The simple translation **/
        let file = fs.readFileSync(pathToTmpDir + '/' + uniqueOutFile).toString();
        // the correct bzh translation
        expect(file.indexOf("Demat d'an holl !")).to.not.equal(-1);
        // the fr fallback translation if no bzh translation
        expect(file.indexOf("Qui est là ?")).to.not.equal(-1);
        // the no translation, if string include in bigger one
        expect(file.indexOf("Who is here? in the bottle?")).to.not.equal(-1);

        /** The string interpolation translation **/
        // translate the string interpolation
        expect(file.indexOf("`peut être ${i} personne ? ${i * 2} ?`")).to.not.equal(-1);
        // translate reverse the string interpolation, tanks to id
        expect(file.indexOf("`les ${nbCar} voitures de ${personName}`")).to.not.equal(-1);

        // delete the tempory directory
        fs.rmSync(pathToTmpDir, {force: true, recursive: true});
    });
});
