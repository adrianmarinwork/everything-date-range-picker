const path = require("path");

module.exports = {
  entry: "./src/everything-date-picker.js",
  output: {
    filename: "everything-date-range-picker.js",
    path: path.resolve(__dirname, "dist"),
    library: "EverythingDateRangePicker",
    libraryTarget: "umd",
    globalObject: "this",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};
