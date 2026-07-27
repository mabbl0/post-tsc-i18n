import { StaticStrInterpolationTr } from "./static-str-interpolation-tr";

/**
 * path and data ready for static translation
 */
export interface StaticLangFile {
    fileName: string
    /** different path to test */
    pathToJs: string[]
    tr: StaticTranslation[]
}

type StaticTranslation = SimpleStaticTranslation | StaticStrInterpolationTr;

/**
 * Static translation for one files
 */
interface SimpleStaticTranslation {
    srcTr: RegExp,
    outTr: string
}
