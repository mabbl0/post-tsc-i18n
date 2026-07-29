#!/usr/bin/env node

import yargs from 'yargs';
import { staticTranslation } from '../static-translation/static-translation';
import { LogLevel, setLogLevel, setLogLevelByStr, StrLogLevel } from '../tool/log';
import { dynamicTranslationPostTsc } from '../dynamic-translation/post-tsc-dynamic-tr';

// TODO: add a config file with the arg option

type PtiMode = 'static' | 'dynamic';

interface ParsedArgs extends yargs.Arguments {
    verbose: boolean
    log: StrLogLevel

    mode: PtiMode
    srcDir: string
    outDir: string
    uniqueOutFile: string

    outLang: string
    fallbackLang?: string[]

    dynamicTrData: string
    idModuleName?: string
}

function parseArgs(): ParsedArgs {
    return yargs( process.argv.slice(2) ).parserConfiguration({})
        .usage('Usage: $0 [options]')
        .demandCommand(0)
        .option('verbose', {
            alias: "v",
            type: 'boolean',
            default: "false",
            description: "the translation is executate with a verbose log level"
        })
        .option('log', {
            type: 'string',
            choices: ['none', 'error', 'warning', 'info', 'verbose', 'debug'],
            default: "info",
            description: "the log level for the execution"
        })

        // common parameter
        .option('mode', {
            alias: "m",
            demandOption: true,
            type: 'string',
            choices: ['static', 'dynamic'],
            description: "execution mode. Static to translate once after ts compilation. Dynamic to change translation language in run time."
        })
        .option('srcDir', {
            alias: "s",
            type: 'string',
            default: "src",
            description: "the source directory"
        })
        .option('outDir', {
            alias: "o",
            type: 'string',
            default: "dist",
            description: "the output directory"
        })
        .option('uniqueOutFile', {
            type: 'string',
            description: "indicate a unique output JS files (index.js for example)"
        })

        // static mode parameter
        .option('outLang', {
            alias: "l",
            type: 'string',
            description: "the output language for the static translation"
        })
        .option('fallbackLang', {
            alias: "f",
            type: 'array',
            description: "the fallback language for the static translation"
        })

        // dynamic mode parameter
        .option('dynamicTrData', {
            type: 'string',
            default: "dynamicTrData.lang.json",
            description: "path to save the data file for the dynamic translation"
        })
        .option('idModuleName', {
            type: 'string',
            description: "identifer name form the module to add to every identifer in dynamic translation"
        })
        .version()
        .strict()
        .example('$0 --mode static --srcDir src --outDir dist --outLang fr', '')
        .example('$0 --mode dynamic --srcDir src --outDir dist', '')

        .argv as ParsedArgs;
}



function main(): void {
	const args = parseArgs();
    // TODO: verbose by default
    if(args.verbose) {
        setLogLevel(LogLevel.Verbose);
    }
    else {
        setLogLevelByStr(args.log);
    }

    switch (args.mode) {
        case 'static':
            if(!args.srcDir || !args.outDir || !args.outLang) {
                throw "Static mode require the options: srcDir ; outDir ; outLang";
            }

            staticTranslation({
                srcDir: args.srcDir,
                outDir: args.outDir,
                uniqueOutFile: args.uniqueOutFile,
                outLang: args.outLang,
                fallbackLang: args.fallbackLang
            });
            break;
        case 'dynamic':
            if(!args.srcDir || !args.outDir) {
                throw "Dynamic mode require the options: srcDir ; outDir";
            }

            dynamicTranslationPostTsc({
                srcDir: args.srcDir,
                outDir: args.outDir,
                uniqueOutFile: args.uniqueOutFile,
                dynamicTrData: args.dynamicTrData,
                idModuleName: args.idModuleName
            })
            break;
        default:
            throw "mode unknow";
    }
}



try {
	main();
} catch (e) {
    console.error(`Error: ${(e)}`);
	process.exit(1);
}
