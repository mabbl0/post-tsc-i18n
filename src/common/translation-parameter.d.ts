
/** the parameter for a translation */
export interface TranslationParam {
    /** path to the source directory */
    srcDir: string
    /** path to the output / dist directory */
    outDir: string
    /** indicate a unique output JS files (index.js for example) */
    uniqueOutFile?: string
}

/**
 * The parameter for the static translation
 */
export interface StaticTranslationParam extends TranslationParam {
    /** output language result after translation */
    outLang: string
    /** fallback language if outLang is not possible */
    fallbackLang?: string[]
}

/**
 * The parameter for the dynamic translation
 */
export interface DynamicTranslationParam extends TranslationParam {
    dynamicTrData: string
    idModuleName?: string
}