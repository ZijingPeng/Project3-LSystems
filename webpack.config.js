const path = require("path");

module.exports = {
  entry: ["babel-polyfill", path.join(__dirname, "src/main.js")],
  output: {
    filename: "./bundle.js",
    publicPath: "/"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        query: {
          presets: ["env"]
        }
      },
      {
        test: /\.glsl$/,
        loader: "webpack-glsl"
      },
      {
        test: /\.obj$/,
        loader: "url-loader",
        options: {
          esModule: false,
          publicPath: 'images/'
        }
      }
    ]
  },
  devtool: "source-map",
  devServer: {
    port: 7000
  }
};
