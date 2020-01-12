const path = require("path");

module.exports = {
  entry: ["babel-polyfill", path.join(__dirname, "src/main.js")],
  output: {
    filename: "./bundle.js"
  },
  module: {
    loaders: [
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
      }
    ]
  },
  devtool: "source-map",
  devServer: {
    port: 7000
  }
};
