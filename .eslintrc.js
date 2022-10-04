module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  extends: 'standard',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  'rules': {
    'arrow-parens': 0,
    'dot-notation': 0,
    'eqeqeq': ['warn', 'always'],
    'func-call-spacing': [0, 'never'],
    'generator-star-spacing': 0,
    'generator-star-spacing': 0,
    'handle-callback-err': [0, 'error'],
    'import/first': 0,
    'indent': ['warn', 2],
    'key-spacing': ['warn', { 'afterColon': true }],
    'lines-between-class-members': 0,
    'n/handle-callback-err': 0,
    'no-async-promise-executor': 0,
    'no-case-declarations': 0,
    'no-control-regex': 0,
    'no-debugger': 2,
    'no-eval': 0,
    'no-extra-bind': [0, 'error'],
    'no-multi-spaces': 0,
    'no-multiple-empty-lines': 0,
    'no-prototype-builtins': 0,
    'no-undef': 0,
    'no-unused-expressions': 0,
    'no-unused-vars': [0, { 'vars': 'all', 'args': 'none' }],
    'no-use-before-define': 0,
    'no-useless-escape': 0,
    'no-useless-return': 0,
    'object-curly-spacing': 0,
    'prefer-const': 0,
    'prefer-promise-reject-errors': 0,
    'quote-props': 0,
    'quotes': [0, 'single'],
    'semi': [1, 'always'],
    'space-before-function-paren': [0, 'always'],
    'space-in-parens': [0, 'never'],
    'space-infix-ops': [0, {'int32Hint': false}],
    'spaced-comment': [0, 'never'],
    'yoda': [0, 'never', { 'exceptRange': true }],
    'n/no-callback-literal': 0,
    'array-callback-return': 0
  }
}
