module.exports = ({ mode }) => {
    const env = {
        VERSION: process.env.npm_package_version,
        NODE_ENV: mode
    };

    return env;
};
