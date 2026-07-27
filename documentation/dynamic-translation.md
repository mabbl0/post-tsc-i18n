# Dynamic Translation

To apply a **dynamic** translation, use the `i18n-post-tsc` module in dynamic mode to prepapre the JS files and the translation data, and the `dynamic-translation-post-tsc` package in your code to initiate the data and change the language to use.


# Working

In dynamic mode, the `i18n-post-tsc` command:
- read the translation data files
- associate an id translation to every translation
- replace in the JS files the string by the direct access to their translation (with their id translation)
- then generate a dynamic translation data file, with all the translation

At the start execution, the `dynamic-translation-post-tsc` initialization:
- read the dynamic translation data file
- prepare a base translation for every translation, in the case if wanted language is not available for some translation
- and initiate the translation to the started language 

In run time, the replaced string access directly to their current translation.

the `dynamic-translation-post-tsc` package gives the possibility to change the language.

# Usage

## Your TS code source

Write your code as usuall, in your favourite language.  
Use the `'`, `"` or `` ` `` delimeters for your string.  
Be free to use the [string interpolation](https://github.com/mabbl0/i18n-post-tsc/blob/main/documentation/string-interpolation.md): `` `${}` ``

Two files can be code in two differents languages.
But, all the string in one file must be in the same language. 

```ts
// src/code.ts
console.log("hello everyone!!"); // "bonjour tout le monde !!"
const userName = "Jean";
console.log(`Hello ${userName}!`); // "Bonjour Jean !!"
```

### Run time Initialization

At the start of your code execution, initiate the data with the `dynamic-translation-post-tsc` package:

```ts
// src/code.ts
import dynamic_translation_post_tsc from "dynamic-translation-post-tsc";

dynamic_translation_post_tsc.initDynamicTr({
    outDir: 'dist',
    langStart: 'fr'
});
```

The parameters for the `initDynamicTr` function are:
- outDir: Output directory to find the dynamic translation data file. Required
- langStart: The language to start the translation. Required

- dynamicTrData: Path to the data for the dynamic translation file from the output directory. "dynamicTrData.lang.json" by default. Not required
- fallbackLang: the fallback language if the wanted language translation is not available. Not required

### Run time language change

In run time, change the wanted language with the `dynamic-translation-post-tsc` package:

```ts
// src/code.ts
import dynamic_translation_post_tsc from "dynamic-translation-post-tsc";

dynamic_translation_post_tsc.lang('en');
```

Indicate the wanted language in parameter.

## The translation data files

Same for the static or dynamic mode, the translation data files indicates to the `i18n-post-tsc` module the files to find, the string to replace, and the their possibles translations in differents languages.  
One data file can include the translation for one or several files.  
The data translations files are `json` files, with the `.lang.json` extension.

- `index.lang.json`:
```json
{
    "filePath": "code.js",
    "srcLang": "en",
    "translations": [
        {
            "en": "hello everyone!!",
            "fr": "bonjour tout le monde !!",
            "bzh": "demat d'an holl !!"
        },
        {
            "en": "Hello ${}!",
            "fr": "Bonjour ${} !"
        }
    ]
}
```

See the [translation data files documentation](https://github.com/mabbl0/i18n-post-tsc/blob/main/documentation/translation-data-files.md) for more details.

## The i18n-post-tsc command

Use the `i18n-post-tsc` command **after** to compile your TS project:
```
npx tsc
```

Then, the command in the dynamic mode will prepare the string to access to their translation in the new JS files, and generated an intermediary data file:
```
npx i18n-post-tsc --mode dynamic --srcDir src --outDir dist
```

The arguments for the dynamic mode command:
- mode: 'static' or 'dynamic'. Required
- srcDir: indicate directory path to find the translation data files. Required
- outDir: indicate directory path to the JS files with the string to translate. Required

- uniqueOutFile: indicate a unique output JS files (index.js for example). Not Required
- dynamicTrData: indicate the path from the outDir, to save the data file for the dynamic translation. "dynamicTrData.lang.json" by default. Not required
- idModuleName: indicate an identifier name to add to every translation id. Not required


## Result

Your compiled project is ready with a dynamic translation.  
A dynamic translation data file is generated in the output directory ("dynamicTrData.lang.json" by default).

The string are replaced by an access to their current translation:

```js
// dist/code.js
const dynamic_translation_post_tsc_1 = require("dynamic-translation-post-tsc");

console.log( dynamic_translation_post_tsc_1.translate.code_0 ); // "bonjour tout le monde !!"
dynamic_translation_post_tsc_1.lang('en');
const userName = "Jean";
console.log( dynamic_translation_post_tsc_1.translate.code_1?.with(userName) ); // "Bonjour Jean !!"
```

The `.translate` object contains the current translation.  
The `code_0` and `code_1` are the id translation to indicate the translation to apply.  
The `?.with` is the method for the string interpolation to access to their current translation and apply the code parameters.
