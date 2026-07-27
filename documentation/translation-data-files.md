
# Translation data files

Same for the static or dynamic mode, the translation data files indicates to the `i18n-post-tsc` module the files to find, the string to replace, and the their possibles translations in differents languages.

One data file can include the translation for one or several files.

At the `i18n-post-tsc` command run, the `overrideOutFile` parameter override every output JS file path to a unique file (index.js for example).

The translation data files are `json` files, with the `.lang.json` extension.

## JSON file format

The JSON files must have the following `LangFileContent` format:

```ts
/**
 * Translation data file content
 */
type LangFileContent = LangFileData | LangFileData[];

/**
 * Translation data for one file
 */
interface LangFileData {
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
 * The different translation for one string
 * where the key is the language
 */
interface LangTranslation {
    [key: string]: string
}
```

By default the `filePath` is the path and the name to the tranlsation data file.  
But the `overrideOutFile` parameter override every output file path to a unique file.


## Examples

### one file, same path

Project organisation for this example:
```
|-dist
    |-code.js
|-src
    |-code.lang.json
    |-code.ts
```

`code.lang.json` content:
```json
{
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

### one file, different path

Project organisation for this example:
```
|-dist
    |-index.js
|-src
    |-code.lang.json
    |-code.ts
```

`code.lang.json` content:
```json
{
    "filePath": "index.js",
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

### multiple files

Project organisation for this example:
```
|-dist
    |-code1.js
    |-sub-dir
        |-code2.js
|-src
    |-index.lang.json
    |-code1.ts
    |-sub-dir
        |-code2.ts
```

`index.lang.json` content:
```json
[
  {
      "filePath": "code1.js",
      "srcLang": "en",
      "translations": [
          {
            "en": "hello everyone!!",
            "fr": "bonjour tout le monde !!",
            "bzh": "demat d'an holl !!"
          }
      ]
  },
  {
      "filePath": "sub-dir/code2.js",
      "srcLang": "en",
      "translations": [
          {
            "en": "Hello ${}!",
            "fr": "Bonjour ${} !"
          }
      ]
  }
]
```


### multiple translation data files with a unique output file

In dynamic or static mode, the `i18n-post-tsc` command can be ran with the `uniqueOutFile` parameter:
```
npx i18n-post-tsc --mode dynamic --srcDir src --outDir dist --uniqueOutFile index.js
```

Project organisation for this example:
```
|-dist
    |-index.js
|-src
    |-code1.lang.json
    |-code1.ts
    |-sub-dir
        |-code2.lang.json
        |-code2.ts
```

`code1.lang.json` content:
```json
{
    "srcLang": "en",
    "translations": [
        {
            "en": "hello everyone!!",
            "fr": "bonjour tout le monde !!",
            "bzh": "demat d'an holl !!"
        }
    ]
}
```

`code2.lang.json` content:
```json
{
    "srcLang": "en",
    "translations": [
        {
          "en": "Hello ${}!",
          "fr": "Bonjour ${} !"
        }
    ]
}
```


