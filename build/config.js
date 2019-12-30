const path = require('path');

const initLoaderRules = require('./loaders');
const initPlugins = require('./plugins');
const initMinimizers = require('./minimizers');

const extensions = ['.ts', '.tsx'];

const entry = {
    background: './src/background/index.ts',
    content_script: './src/content/index.ts',
    options: './src/options/index.ts'
};

const htmlTemplate = path.resolve(__dirname, '../src/options.html');

const output = {
    path: path.resolve(__dirname, '../extension'),
    filename: '[name].js'
};

exports.extensions = extensions;
exports.entry = entry;
exports.htmlTemplate = htmlTemplate;
exports.output = output;

module.exports = ({ context = __dirname, mode = 'development', ...opts }) => {
    const conf = {
        context,
        entry,
        output,
        mode,
        devtool:
            mode === 'development'
                ? 'inline-cheap-module-source-map'
                : 'source-map',
        plugins: initPlugins({
            ...opts,
            mode,
            template: htmlTemplate
        }),
        module: {
            rules: initLoaderRules({ ...opts, mode, context })
        },
        resolve: {
            extensions,
            symlinks: false,
            mainFields: ['browser', 'main', 'module'],
            alias: {
                src: path.resolve(context, './src')
            }
        },
        stats: {
            assetsSort: 'size',
            children: false,
            cached: false,
            cachedAssets: false,
            entrypoints: false,
            excludeAssets: /\.(png|svg)/,
            maxModules: 5
        },
        performance: {
            hints: false
        }
    };

    if (mode === 'production') {
        conf.optimization = {
            minimizer: initMinimizers()
        };
    }

    // CI doesn't need source-maps
    if (opts.isCI) {
        delete conf.devtool;
    }

    return conf;
};
