module.exports = {
  "parser": "babel-eslint",
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "error"
  },
  "globals": {
    "describe": true,
    "it": true,
    "expect": true,
    "beforeEach": true,
  }
};