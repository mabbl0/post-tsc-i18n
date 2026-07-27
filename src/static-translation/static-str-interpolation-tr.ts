import { log, LogLevel } from "../tool/log";
import { reStrInter, StrInterpolationTr } from "../common/str-interpolation-tr";

/**
 * Prepare and process a static translation
 * to a string interpolation `${}`
 */
export class StaticStrInterpolationTr extends StrInterpolationTr {
    readonly outTrSplit: string[] // the output translation split between the ${}
    
    // map to link the id in the ${} with the output ${} order 
    readonly mapIdOutTrOrder: Map<string, number>

    /**
     * Prepare and process to a translation to a string interpolation `${}`
     * @param langFileSrcTr the source translation from the language file
     * @param langFileOutTr the output translation from the language file
     */
    constructor(langFileSrcTr: string, langFileOutTr: string) {
        super(langFileSrcTr);

        // map the id between the source and the output tr
        let mapIdOrder = this.mapIdOrder(langFileOutTr);
        if(mapIdOrder==undefined) {
            this.outTrSplit = [];
            this.mapIdOutTrOrder = new Map<string, number>()
            return;
        }
        this.mapIdOutTrOrder = mapIdOrder;
        
        // initiate the output translation split
        this.outTrSplit = '`'.concat(langFileOutTr, '`').split(reStrInter);

        this.ready = true;
        log(LogLevel.Debug, 'new Static Str Interpolation Translation created');
        log(LogLevel.Debug, this);
    }


    /**
     * apply the translation to a text
     * @param text the text to apply the translation
     * @returns the text with the translation
     */
    applyStaticTranslation(text: string): string {
        log(LogLevel.Debug, 'apply one str interpolation Translation');
        return text.replaceAll(this.reSrcTr, this.translateOneStr.bind(this));
    }


    /**
     * Translate one string for the static trnaslation
     * @param strInterText the text match in the file
     * @returns the string interpolation translated
     */
    private translateOneStr(strInterText: string): string {
        let strInterContentMatch = strInterText.match(reStrInter);
        if(strInterContentMatch == null || strInterContentMatch.length+1 != this.outTrSplit.length) {
            return strInterText;
        }

        // return the translation with ${} order give by the id
        let outTrArr: string[] = [];
        let outTrIndexOrder: number|undefined;
        for (let i = 0; i < strInterContentMatch.length; i++) {
            outTrArr.push(this.outTrSplit[i]);

            if(this.strInterSrcId[i].length == 0) {
                // no str inter id
                outTrArr.push(strInterContentMatch[i]);
            }
            else {
                outTrIndexOrder = this.mapIdOutTrOrder.get(this.strInterSrcId[i]);
                if(outTrIndexOrder == undefined) {
                    throw `string interpolation id '${this.strInterSrcId[i]}' not found in the id map`;
                }
                outTrArr.push(strInterContentMatch[outTrIndexOrder]);
            }
        }
        outTrArr.push(this.outTrSplit[this.outTrSplit.length-1]);

        return ''.concat(...outTrArr);
    }

}