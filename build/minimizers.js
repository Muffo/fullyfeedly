const TerserPlugin = require('terser-webpack-plugin');
const CssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = () => [
    new TerserPlugin({
        parallel: true,
        terserOptions: {
            ecma: 6
        }
    }),
    new CssAssetsPlugin({
        cssProcessorOptions: {
            autoprefixer: { disable: true },
            parser: require('postcss-safe-parser'),
            discardComments: {
                removeAll: true
            }
        }
    })
];
