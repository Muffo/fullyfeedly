const { exec } = require('child_process');
const { EnvironmentPlugin } = require('webpack');
const ForkTsPlugin = require('fork-ts-checker-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const HtmlIncAssetsPlugin = require('html-webpack-tags-plugin');
const HardSourcePlugin = require('hard-source-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const BuildNotifPlugin = require('webpack-build-notifier');
const CssExtractPlugin = require('mini-css-extract-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const PostCompilePlugin = require('post-compile-webpack-plugin');
// Disabling this for now as it adds 2-4 seconds to inc. build time - look into finding out why
// const WebExtReloadPlugin = require('webpack-chrome-extension-reloader')

const initEnv = require('./env');
const { copyPatterns, htmlAssets } = require('./static-files');
const { output } = require('./config');

/**
 * @param {boolean} tslint Denotes whether or not to enable linting on this thread as well as type checking.
 */
const initTsPlugin = tslint =>
    new ForkTsPlugin({
        checkSyntacticErrors: true,
        async: false,
        tslint
    });

module.exports = function({
    webExtReloadPort = 9090,
    mode = 'development',
    template,
    notifsEnabled = false,
    isCI = false,
    shouldPackage = false,
    packagePath = '../dist',
    extPackageName = 'extension.zip',
    sourcePackageName = 'source-code.zip'
}) {
    const plugins = [
        new EnvironmentPlugin(initEnv({ mode })),
        new CopyPlugin(copyPatterns),
        new HtmlPlugin({
            title: 'Fully Feedly',
            chunks: ['options'],
            filename: 'options.html',
            template
        }),
        new HtmlIncAssetsPlugin({
            append: false,
            assets: htmlAssets
        }),
        new CssExtractPlugin({
            filename: '[name].css'
        })
    ];

    if (mode === 'development') {
        plugins.push(
            new HardSourcePlugin()
            // new WebExtReloadPlugin({
            //     port: webExtReloadPort,
            // }),
        );
    } else if (mode === 'production') {
    }

    // CI build doesn't need to use linting plugins
    if (isCI) {
        return [...plugins, initTsPlugin(false)];
    }

    if (notifsEnabled) {
        plugins.push(
            new BuildNotifPlugin({
                title: 'WebExt Build'
            })
        );
    }

    if (shouldPackage) {
        plugins.push(
            new ZipPlugin({
                path: packagePath,
                filename: extPackageName,
                exclude: [/\.map/]
            }),
            new PostCompilePlugin(() =>
                exec('git archive -o dist/source-code.zip master')
            )
        );
    }

    return [
        ...plugins,
        initTsPlugin(true),
        new StylelintPlugin({
            files: 'src/**/*.css',
            failOnError: mode === 'production'
        })
    ];
};
