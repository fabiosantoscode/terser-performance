const fs = require('fs');
const Terser = require('..');
const { profileWrapFn } = require('./profiler');

const inputFileName = process.argv[2];

if (!inputFileName) {
  throw new Error('No input file name provided.')
}

const input = fs.readFileSync(inputFileName, 'utf-8');
const terserOptions = {
  warnings: false,
  safari10: true,
  output: { ecma: 6, comments: false, webkit: true },
  compress: {
    ecma: 6,
    pure_getters: true,
    passes: 3,
    global_defs: { ngDevMode: false, ngI18nClosureMode: false }
  },
  sourceMap: true,
  mangle: true
};


profileWrapFn(async () => {
  const { code } = await Terser.minify(input, terserOptions);
  fs.writeFileSync(`${inputFileName}.min.js`, code);
}, { type: process.argv[3] });
