# About

`dynamic-translation-post-tsc` is a package working with the `i18n-post-tsc` module, for a dynamic translation for your TS project.  
The idea is to inject the translation after the tsc compilation into the JS code, to not impact your TS code.

The `i18n-post-tsc` module can apply a **Static** or **Dynamic** translation.  
For the **Dynamic** translation you need to use the `dynamic-translation-post-tsc` package.

`dynamic-translation-post-tsc` features:  
- Simple and minimum performance impact.
- Easy to implement. Minimum impact in your existing code.
- **Dynamic translation**. The access to the translation is injected in the JS files. You just need to initiation and change the language in run time.
- [String interpolation](https://github.com/mabbl0/i18n-post-tsc/blob/main/documentation/string-interpolation.md) "`${}`" translation.
- Translation data file to contain the translation for one or several files.

# Install

The `i18n-post-tsc` module to inject the modification into the JS files:

```
npm install i18n-post-tsc --save-dev
```

The `dynamic-translation-post-tsc` module for the dynamic translation in run time:

```
npm install dynamic-translation-post-tsc
```

# Usage

Add a [translation data file](https://github.com/mabbl0/i18n-post-tsc/blob/main/documentation/translation-data-files.md):
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

Write your TS code with the string in the language you want.  
Use in your code the `dynamic-translation-post-tsc` module to initiate the data, and to change the target language:

```ts
// src/code.ts
import dynamic_translation_post_tsc from "dynamic-translation-post-tsc";

dynamic_translation_post_tsc.initDynamicTr({
    outDir: 'dist',
    langStart: 'fr'
});

console.log("hello everyone!!"); // "bonjour tout le monde !!"
dynamic_translation_post_tsc.lang('en');
const userName = "Jean";
console.log(`Hello ${userName}!`); // "Hello Jean!"
```

Compile your TS project to obtain the JS code files:
```
npx tsc
```

Then, run the `i18n-post-tsc` command with the `dynamic` mode to apply the translation in your JS code:

```
npx i18n-post-tsc --mode dynamic --srcDir src --outDir dist
```

The `i18n-post-tsc` module replace the string in your JS files to access to their current translation.  
In run time, the `dynamic-translation-post-tsc` module initiates the data, and enables the replaced string to access to their current translation.

See the [dynamic translation documentation](https://github.com/mabbl0/i18n-post-tsc/blob/main/documentation/dynamic-translation.md) for more details.
