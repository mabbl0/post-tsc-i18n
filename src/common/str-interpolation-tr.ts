import { log, LogLevel } from "../tool/log";

// regex to find the ${} content
export const reStrInter = /\$\{[^\}]*\}/g;
export const reStrInterContent = /(?<=\$\{)[^\}]*(?=\})/g;

/**
 * Prepare and process a static or dynamic translation
 * to a string interpolation `${}`
 */
export class StrInterpolationTr {
    readonly reSrcTr: RegExp // regex to find the sring to translate in the source language
    readonly strInterSrcId: string[] // the id of the string interpolation in source translation
    protected ready: boolean;

    /**
     * Prepare and process to a translation to a string interpolation `${}`
     * @param langFileSrcTr the source translation from the language file
     */
    constructor(langFileSrcTr: string) {
        this.ready = false;

        // initiate the id in the ${}
        let srcTrMatch = langFileSrcTr.match(reStrInterContent);
        if(srcTrMatch == null) {
            log(LogLevel.Error, `translation '${langFileSrcTr}' should have a string interpolation \${}`);
            this.strInterSrcId = [];
            this.reSrcTr = /./g;
            return;
        }
        this.strInterSrcId = srcTrMatch;
        
        // initiate regex to find the source to translate
        let srcTrSplit = langFileSrcTr.split(reStrInterContent);
        let strReSrcTr = '\`';
        for (let i = 0; i < srcTrSplit.length-1; i++) {
            strReSrcTr += RegExp.escape(srcTrSplit[i]) + '.*';
        }
        strReSrcTr += RegExp.escape(srcTrSplit[srcTrSplit.length-1]) + '\`';
        this.reSrcTr = new RegExp(strReSrcTr, 'g');
    }

    get rdy() {
        return this.ready;
    }

    /**
     * map the id between the string interpolation source and a output tr
     * @param outTr the output translation to map with the source
     * @returns the map id order between the source and a output translation
     */
    mapIdOrder(outTr: string): Map<string, number> | undefined {
        let outTrMatch = outTr.match(reStrInterContent);
        if(outTrMatch == null) {
            log(LogLevel.Error, `translation '${outTr}' should have a string interpolation \${}`);
            return;
        }

        if(outTrMatch.length != this.strInterSrcId.length) {
            log(LogLevel.Error, `translation '${outTr}' should have the same number of string interpolation in the tranlsation '${this.strInterSrcId}'`);
            return;
        }

        // map the id between the source and a output tr
        let mapIdOrder = new Map<string, number>();
        let outIdIndex: number;
        for (let i = 0; i < this.strInterSrcId.length; i++) {
            if(this.strInterSrcId[i].length == 0) {
                continue;
            }
            outIdIndex = outTrMatch.indexOf(this.strInterSrcId[i]);
            if(outIdIndex==-1) {
                log(LogLevel.Error, `string interpolation id '${this.strInterSrcId[i]}' in the output translation '${outTr}' not found`);
                return;
            }
            mapIdOrder.set(this.strInterSrcId[i], outIdIndex);
        }

        return mapIdOrder;
    }

    /**
     * map the id to order the string interpolation content
     * between the source file and a translation
     * @param outTr the translation string with the ${}
     * @returns the order between the source and a translation
     */
    mapNumIdOrder(outTr: string): number[] | undefined {
        let outTrMatch = outTr.match(reStrInterContent);
        if(outTrMatch == null) {
            log(LogLevel.Error, `translation '${outTr}' should have a string interpolation \${}`);
            return;
        }

        if(outTrMatch.length != this.strInterSrcId.length) {
            log(LogLevel.Error, `translation '${outTr}' should have the same number of string interpolation in the tranlsation '${this.strInterSrcId}'`);
            return;
        }

        // map the id between the source and a output tr
        let mapNumIdOrder: number[] = [];
        let outIdIndex: number;
        for (let i = 0; i < this.strInterSrcId.length; i++) {
            if(this.strInterSrcId[i].length == 0) {
                continue;
            }
            outIdIndex = outTrMatch.indexOf(this.strInterSrcId[i]);
            if(outIdIndex==-1) {
                log(LogLevel.Error, `string interpolation id '${this.strInterSrcId[i]}' in the output translation '${outTr}' not found`);
                return;
            }
            mapNumIdOrder.push(outIdIndex);
        }

        return mapNumIdOrder;
    }
    
    /**
     * indicate if the translation is a string interpolation translation
     * @param langFileTr the translation from the language file
     * @returns indicate if the translation is a string interpolation translation
     */
    static isStrInterpolationTr(langFileTr: string): boolean {
        return langFileTr.search(reStrInter) != -1;
    }
}