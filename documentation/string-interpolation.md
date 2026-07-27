
# String interpolation

To translate your string using string interpolation use the `"${}"` indication in the translation data file.  

If the variable call in the string interpolation have the same order in every language, the `"${}"` indication can stay empty.  
But if the variable order is different bewteen two languages, use the an id in the `"${}"` indication.

## Static mode

In static mode, the string is replace by the translate in a string interpolation with the same placeholder, with the correct order.

The code source:
```ts
// src/code.ts
console.log(`The ${userName1}'s ${nbCow1} cows`);
console.log(`The ${userName2}'s ${nbCow2} cows`);
```

Become in JS file:
```js
// dist/code.js
console.log(`Les ${nbCow1} vaches  de ${userName1}`);
console.log(`Les ${nbCow2} vaches  de ${userName2}`);
```


## Dynamic mode

In dynamic mode, the string is replace by a way to access to its current translation, with the call of the `with` method:
```ts
  /**
  * Apply the translation with the arguments in run time
  * @param args the arguments give in run time
  * @returns the translation of this string interpolation
  */
  with(...args: string[]): string
```

Thus, the code source:
```ts
// src/code.ts
console.log(`The ${userName1}'s ${nbCow1} cows`);
console.log(`The ${userName2}'s ${nbCow2} cows`);
```

Become in the JS file:
```js
// dist/code.js
console.log( dynamic_translation_post_tsc_1.translate.code_0?.with(userName1, nbCow1) );
console.log( dynamic_translation_post_tsc_1.translate.code_0?.with(userName2, nbCow2) );
```

The order in the JS file is the same for the source language. But when the translation is call, the order can be reversed if needed.


## Examples in translation data file

### simple string interpolation

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

### string interpolation re-order

```json
{
    "srcLang": "en",
    "translations": [
        {
            "en": "The ${1}'s ${2} cows",
            "fr": "Les ${2} vaches  de ${1}"
        }
    ]
}
```

