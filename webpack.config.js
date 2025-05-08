const path = require('path');

module.exports = {
  entry: './src/everything-date-range-picker.js',
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'everything-date-range-picker.js',
    library: 'EverythingDateRangePicker',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
