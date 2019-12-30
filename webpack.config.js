const initConfig = require('./build');

module.exports = (env = {}) => {
    const conf = initConfig({
        context: __dirname,
        mode: env.prod ? 'production' : 'development',
        notifsEnabled: !!env.notifs,
        isCI: !!env.ci,
        shouldPackage: !!env.package
    });

    return conf;
};
