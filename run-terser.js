const fs = require('fs');
const Terser = require('terser');
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
  mangle: true
};


profileWrapFn(() => {
  const result = Terser.minify(input, terserOptions);
  if (result.error) {
    throw new Error(result.error);
  } else {
    fs.writeFileSync(`${inputFileName}.min.js`, result.code);
  }
}, { type: process.argv[3] });
