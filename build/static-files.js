/**
 * Everything in here gets injected into the generated HTML as link/script tags.
 * See: https://github.com/jharris4/html-webpack-include-assets-plugin#example
 */
exports.htmlAssets = [
    'lib/browser-polyfill.js',
    'lib/jquery.min.js',
    'lib/bootstrap.min.js',
    'lib/mousetrap.min.js',
    'lib/iosOverlay.js'
];

/**
 * Set the manifest version to be equal to `package.json` version.
 */
function transformManifestVersion(content) {
    const manifest = JSON.parse(content.toString());
    manifest.version = process.env.npm_package_version;
    return Buffer.from(JSON.stringify(manifest));
}

/**
 * Everything in here gets copied as-is to the output dir.
 * See: https://github.com/webpack-contrib/copy-webpack-plugin#usage
 */
exports.copyPatterns = [
    {
        from: 'src/manifest.json',
        to: '.',
        transform: transformManifestVersion
    },
    { from: 'src/img', to: 'img' },
    {
        from: 'node_modules/webextension-polyfill/dist/browser-polyfill.js',
        to: 'lib/'
    },
    {
        from: 'node_modules/bootstrap/dist/css/bootstrap.min.css',
        to: 'lib/'
    },
    {
        from: 'node_modules/bootstrap/dist/js/bootstrap.min.js',
        to: 'lib/'
    },
    {
        from: 'node_modules/jquery/dist/jquery.min.js',
        to: 'lib/'
    },
    {
        from: 'node_modules/mousetrap/mousetrap.min.js',
        to: 'lib/'
    },
    {
        from: 'node_modules/ios-notification-overlay/js/iosOverlay.js',
        to: 'lib/'
    },
    {
        from: 'src/fonts/*/*',
        to: 'fonts/[name].[ext]'
    },
    {
        from: 'src/_locales',
        to: '_locales'
    },
    {
        from: 'src/styles',
        to: 'styles'
    }
];
