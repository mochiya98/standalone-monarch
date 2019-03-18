const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = (_, { mode }) => {
  if (!mode) mode = process.env.NODE_ENV;
  const config = {
    entry: "./src/index.ts",
    output: {
      library: "StandaloneMonarch",
      libraryTarget: "umd",
      path: path.resolve("./dist/"),
      filename: "index.js",
      chunkFilename: "[name].js"
    },
    resolve: {
      modules: [path.resolve(__dirname, "src"), path.resolve(__dirname, "src/monaco-editor"), "node_modules"],
      extensions: [".js", ".ts"]
    },
    target: "web",
    module: {
      rules: [
        {
          test: /\.ts?$/,
          exclude: /node_modules/,
          use: [
            "cache-loader",
            {
              loader: "ts-loader",
              options: {
                compilerOptions: {noEmit:false},
              }
            }
          ]
        }
      ]
    },
    optimization: {
      splitChunks: {
        name: true,
        cacheGroups: {
          vendors: false
        }
      }
    }
  };
  if (mode !== "development") {
    config.optimization.minimizer = [
      new TerserPlugin({
        terserOptions: {
          mangle: {
            properties: {
              regex: /^_/
            }
          }
        }
      })
    ];
  }
  return config;
};
