// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: ["expo", "prettier", "react-native"], //integrate with prettier
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "error",
    "react-native/no-unused-styles": "error", // eslint-plugin-react-native,
  },
};
