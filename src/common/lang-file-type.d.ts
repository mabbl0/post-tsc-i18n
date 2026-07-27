
/**
 * Translation data file content
 */
export type LangFileContent = LangFileData | LangFileData[];

/**
 * Translation data for one file
 */
export interface LangFileData {
    /**
     * the path to the file from the output directory
     */
    filePath?: string
    /**
     * the language in the source file
     */
    srcLang: string
    /**
     * the translation to apply in the file
     */
    translations: LangTranslation[]
}



/**
 * path and data from a lang file
 */
export interface LangFile {
    pathFromSrc: string
    data: LangFileData
}

/**
 * The different translation for one string
 * where the key is the language
 */
interface LangTranslation {
    [key: string]: string
}

/**
 * the data of all lang files
 * regrouped by the post-tsc-i18n for the dynamic translation
 */
export interface GlobalLangFile {
    lang: string[],
    ressources: Map<string, LangFile>
}

/**
 * the data of all lang files regrouped
 * ready to be save
 */
export interface GlobalLangFileData {
    lang: string[],
    ressources: {
        key: string
        translation: LangTranslation
    }[]
}
