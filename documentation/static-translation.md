# Static Translation

To apply a **static** translation, use the `i18n-post-tsc` module in static mode to inject the translation in the JS files, to get zero impact in your code source and zero performance impact.

The static translation is particularly adapted for the open source project with a specific use. For example a open source bot for a private discord server. 

# Working

In static mode, the `i18n-post-tsc` command:
- read the translation data files
- then replace in the JS files the string by their wanted tranlsations

# Usage

## Your TS code source

No need to adapt your code source. Write your code as usuall, in your favourite language.  
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

Then, the command in the static mode will translate the string in the new JS files:
```
npx i18n-post-tsc --mode static --srcDir src --outDir dist --outLang fr
```

The arguments for the static mode command:
- mode: 'static' or 'dynamic'. Required
- srcDir: indicate directory path to find the translation data files. Required
- outDir: indicate directory path to the JS files with the string to translate. Required
- outLang: indicate the language to translate. Required

- uniqueOutFile: indicate a unique output JS files (index.js for example). Not Required
- fallbackLang: indicate the fallback languages, in the case if the target language is not available for some translation. Not required


## Result

Your compiled project is ready with the wanted translation.  
The string are directly replaced by the wanted translation:

```ts
// dist/code.ts
console.log("bonjour tout le monde !!"); // "bonjour tout le monde !!"
const userName = "Jean";
console.log(`Bonjour ${userName}`); // "Bonjour Jean !!"
```
