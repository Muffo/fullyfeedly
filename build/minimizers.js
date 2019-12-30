const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CssAssetsPlugin = require('optimize-css-assets-webpack-plugin')

module.exports = () => [
    new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
        uglifyOptions: {
            output: { ascii_only: true },
        },
    }),
    new CssAssetsPlugin({
        cssProcessorOptions: {
            autoprefixer: { disable: true },
            parser: require('postcss-safe-parser'),
            discardComments: {
                removeAll: true,
            },
        },
    }),
]
