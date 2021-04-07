module.exports = {
  "plugins": [
    ["transform-class-properties", { "spec": true }],
    ["@babel/plugin-transform-classes", { "loose": true }],
    ["@babel/plugin-proposal-class-properties", { "loose": true }],
    "@babel/plugin-transform-runtime",
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    "@babel/plugin-proposal-function-sent",
    "@babel/plugin-proposal-export-namespace-from",
    "@babel/plugin-proposal-numeric-separator",
    "@babel/plugin-proposal-throw-expressions",
    "@babel/plugin-syntax-dynamic-import",
    "@babel/plugin-syntax-import-meta",
    "@babel/plugin-proposal-json-strings",
    "@babel/plugin-transform-modules-commonjs"
  ],
  "presets": [
    "@babel/preset-env"
  ]
};
