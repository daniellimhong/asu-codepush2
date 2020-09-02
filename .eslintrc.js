module.exports = {
  extends: ["airbnb", "plugin:prettier/recommended"],
  parser: "babel-eslint",
  env: {
    jest: true
  },
  rules: {
    "prettier/prettier": "error",
    "no-use-before-define": "off",
    "react/jsx-filename-extension": "off",
    "react/jsx-one-expression-per-line": "off",
    "react/jsx-indent": "off",
    "react/prop-types": "off",
    "comma-dangle": "off",
    "no-console": "off",
    "no-else-return": "off",
    "no-plusplus": "off",
    "no-prototype-builtins": "off",
    "no-underscore-dangle": "off",
    "no-param-reassign": "off",
    camelcase: "off",
    radix: "off"
  },
  globals: {
    fetch: false
  }
};
