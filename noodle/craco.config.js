const webpack = require('webpack');
const git = require('git-rev-sync');
const CracoAlias = require('craco-alias');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

let gitCommitHash;
try {
    gitCommitHash = git.short();
} catch (error) {
    console.warn('Warning: Git metadata not available in production build.');
    gitCommitHash = 'unknown'; // Fallback value
}

console.log('Customizing Webpack');

module.exports = {
    plugins: [
        {
            plugin: CracoAlias,
            options: {
                source: 'tsconfig',
                baseUrl: '.',
                tsConfigPath: './tsconfig.extend.json',
            },
        },
    ],
    webpack: {
        plugins: [
            // Define global variables for the app
            new webpack.DefinePlugin({
                'process.env.GIT_COMMIT_HASH': JSON.stringify(gitCommitHash),
                VERSION: JSON.stringify(gitCommitHash), // Alternative version variable
            }),
        ],
        configure: (config, { env, paths }) => {
            // Add any additional Webpack plugins or settings here
            config.plugins.push(new CopyPlugin({
                patterns: [{ from: 'public', to: 'public' }],
            }));

            // Uncomment these lines if you need to ensure `react` and `react-dom` resolve correctly
            // config.resolve.alias = config.resolve.alias || {};
            // config.resolve.alias.react = path.resolve(__dirname, 'node_modules/react');
            // config.resolve.alias['react-dom'] = path.resolve(__dirname, 'node_modules/react-dom');

            return config;
        },
    },
    devServer: (devServerConfig) => {
        devServerConfig.historyApiFallback = {
            disableDotRule: true,
        };
        return devServerConfig;
    },
};

