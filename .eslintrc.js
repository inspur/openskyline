module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: 'standard',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // add your custom rules here
  'rules': {
    "indent": ['warn', 2],  //warn error
    "no-unused-vars": [0, { "vars": "all", "args": "none" }],
    // allow paren-less arrow functions
    'arrow-parens': 0,
    'no-undef': 0,
    'spaced-comment': [0, "never"],
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    //'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'no-debugger': 2,
    'semi': [1, "always"],
    'func-call-spacing': [0, "never"],
    "space-before-function-paren": [0, "always"],
    "key-spacing": ["warn", { "afterColon": true }],
    "quotes": [0, "single"],
    "eqeqeq": ["warn", "always"],
    "space-in-parens": [0, "never"],
    "space-infix-ops": [0, {"int32Hint": false}],
    "yoda": [0, "never", { "exceptRange": true }],
    "handle-callback-err": [0, "error"],
    "no-extra-bind": [0, "error"],
    "no-eval": 0,
    "no-useless-escape": 0,
    // allow async-await
    'generator-star-spacing': 0,
    'no-control-regex': 0
  }
}
