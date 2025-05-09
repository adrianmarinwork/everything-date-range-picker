const path = require('path');

module.exports = {
  entry: './src/everything-date-range-picker.js',
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'everything-date-range-picker.js',
    library: 'EverythingDateRangePicker',
    libraryTarget: 'umd',
    libraryExport: 'default',
    globalObject: 'this',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
};
