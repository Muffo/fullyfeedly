// NOTE: Loader `include` paths are relative to this module
const path = require('path')
const CssExtractPlugin = require('mini-css-extract-plugin')

const threadLoader = {
    loader: 'thread-loader',
    options: {
        poolTimeout: Infinity, // Threads won't timeout/need to be restarted on inc. builds
        workers: require('os').cpus().length - 1,
    },
}

const tsLoader = {
    loader: 'ts-loader',
    options: {
        happyPackMode: true,
    },
}

const injectStylesLoader = {
    loader: 'style-loader',
}

const extractStylesLoader = {
    loader: CssExtractPlugin.loader,
}

const cssModulesLoader = {
    loader: 'css-loader',
    options: {
        modules: true,
        importLoaders: 1,
    },
}

const cssVanillaLoader = {
    loader: 'css-loader',
}

const postcssLoader = {
    loader: 'postcss-loader',
}

const urlLoader = {
    loader: 'url-loader',
    options: {
        limit: 8192,
    },
}

const svgLoader = {
    test: /\.svg$/,
    include: /node_modules/, // Only resolve SVG imports from node_modules (imported CSS) - for now
    loader: 'svg-inline-loader',
}

module.exports = ({ mode, context, isCI = false, injectStyles = false }) => {
    // style-loader's general method of inserting <style> tags into the `document` doesn't
    //  seem to play nicely with the content_script. It would be nice to find a work-around
    //  later as style-loader is nicer for dev.
    const styleLoader = injectStyles ? injectStylesLoader : extractStylesLoader

    const main = {
        test: /\.(j|t)sx?$/,
        include: path.resolve(context, './src'),
        use: [tsLoader],
    }

    if (mode !== 'production') {
        main.use = [threadLoader, ...main.use]
    }

    const imgLoader = {
        test: /\.(png|jpg|gif|svg)$/,
        include: path.resolve(context, './img'),
        use: [urlLoader],
    }

    const cssModules = {
        test: /\.css$/,
        include: path.resolve(context, './src'),
        use: [styleLoader, cssModulesLoader, postcssLoader],
    }

    return [main, imgLoader, cssModules]
}
