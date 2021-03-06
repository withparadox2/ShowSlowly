const fs = require("fs")
const path = require("path")
const ZipPlugin = require("zip-webpack-plugin")
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin
const HtmlWebpackPlugin = require("html-webpack-plugin")

const distPath = process.env.PUBLISH_PAGES === "true" ? "docs" : "dist"

const enableAnalyzer = process.argv[3] === "-analyzer"

module.exports = {
  outputDir: distPath,
  productionSourceMap: true,
  runtimeCompiler: true,
  publicPath:
    process.env.NODE_ENV === "production" && !process.env.PUBLISH_PAGES
      ? "/Slowly/"
      : "./",
  chainWebpack: (config) => {
    config.plugin("define").tap((args) => {
      args[0]["SLOWLY_VERSION"] = readVersionContent()
      return args
    })
  },
  configureWebpack: (_) => {
    let plugins = [
      new HtmlWebpackPlugin({
        templateParameters: {
          NODE_ENV: process.env.NODE_ENV,
        },
        template: "public/index.html",
        filename: "index.html",
      }),
    ]

    if (enableAnalyzer) {
      plugins.push(new BundleAnalyzerPlugin())
    }
    if (process.env.NODE_ENV === "production" && !process.env.PUBLISH_PAGES) {
      plugins.push(
        new ZipPlugin({
          path: path.join(__dirname, distPath),
          filename: "dist.zip",
        })
      )
    }
    return {
      plugins,
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "./src"),
        },
        extensions: [".js", ".vue", ".json"],
      },
    }
  },
}

function readVersionContent() {
  const filePath = path.resolve(__dirname, "./public/change-log.json")
  const versions = JSON.parse(fs.readFileSync(filePath).toString())
  return JSON.stringify(versions[0])
}
