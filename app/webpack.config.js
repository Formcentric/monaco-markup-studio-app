const path = require("path");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = (env) => {
  const { mode = "development" } = env;
  return {
    entry: "./src/index.tsx",
    mode: mode,
    stats: "errors-only",
    output: {
      path: path.resolve(__dirname, "./dist"),
      filename: "bundle.js",
    },
    optimization: {
      minimize: mode === 'production',
    },
    plugins: [
      new webpack.ProgressPlugin({
        percentBy: "entries",
      }),
      new MiniCssExtractPlugin({ filename: "bundle.css" }),
      new CopyPlugin({
        patterns: [{ from: 'public' }],
      }),
      new MonacoWebpackPlugin({
        languages: ['typescript', 'javascript', 'css', 'xml']
      })
    ],
    resolve: {
      extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
      alias: {
        React: path.resolve("./node_modules/react")
      },
    },
    module: {
      rules: [
        {
          test: /\.(png|jpe?g|gif|woff(2)?|ttf|eot)$/i,
          type: "asset/resource",
          generator: {
            filename: "[name][ext]",
          },
        },
        {
          test: /\.[tj]sx?$/,
          exclude: /node_modules/,
          use: ["ts-loader"],
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, "css-loader"],
        },
      ],
    },
  };
};
