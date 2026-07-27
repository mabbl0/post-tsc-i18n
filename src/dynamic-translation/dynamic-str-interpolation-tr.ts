import { log, LogLevel } from "../tool/log";
import { reStrInterContent, StrInterpolationTr } from "../common/str-interpolation-tr";
import { strInterTrAccess } from "./post-tsc-dynamic-tr";

/**
 * Prepare and process a dynamic translation
 * to a string interpolation `${}`
 */
export class DynamicStrInterpolationTr extends StrInterpolationTr {
    readonly idTr: string; // the id of this translation
    private trAccessStr: string; // the string to access to the translation object in run time

    /**
     * Prepare and process to a translation to a string interpolation `${}`
     * @param langFileSrcTr the source translation from the language file
     * @param idTr the id of this translation
     */
    constructor(langFileSrcTr: string, idTr: string) {
        super(langFileSrcTr);
        this.idTr = idTr;
        this.trAccessStr = "";

        this.ready = true;
        log(LogLevel.Debug, 'new Dynamic Str Interpolation Translation created');
        log(LogLevel.Debug, this);
    }

    /**
     * Prepare source file after tsc to the dynamic translation
     * for this translation
     * @param text the source file js text after tsc
     * @param trAccessStr the string to access to the translation object in run time
     * @returns the text with the update
     */
    applySrcUpdate(text: string, trAccessStr: string): string {
        log(LogLevel.Debug, 'apply one str interpolation Update for dynamic translation');
        this.trAccessStr = trAccessStr + this.idTr + strInterTrAccess;
        return text.replaceAll(this.reSrcTr, this.updateOneStr.bind(this));
    }

    /**
     * Update one string for the dynamic trnaslation
     * @param strInterText the text match in the file
     * @returns the string interpolation translated
     */
    private updateOneStr(strInterText: string): string {
        let strInterContentMatch = strInterText.match(reStrInterContent);
        if (strInterContentMatch == null) {
            return strInterText;
        }

        // the call to translation with the content in the source file
        let updatedStr = this.trAccessStr;
        for (let i = 0; i < strInterContentMatch.length-1; i++) {
            updatedStr += strInterContentMatch[i] + ',';
        }
        updatedStr += strInterContentMatch[ strInterContentMatch.length-1 ] + ')';
        return updatedStr;
    }
}