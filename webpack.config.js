const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            "@common": path.resolve(__dirname, 'src/common'),
            "@features": path.resolve(__dirname, 'src/features'),
            "@core": path.resolve(__dirname, 'src/core'),
            "src": path.resolve(__dirname, 'src'),
        },
        fallback: {
            "fs": require.resolve('browserify-fs'),
            "constants": require.resolve('constants-browserify'),
            "querystring": require.resolve('querystring'),
            "url": require.resolve('url'),
            "path": require.resolve('path-browserify'),
            "os": require.resolve('os-browserify/browser'),
            "http": require.resolve("stream-http"),
            "https": require.resolve("https-browserify"),
            "zlib": require.resolve("browserify-zlib"),
            "stream": require.resolve("stream-browserify"),
            "crypto": require.resolve('crypto-browserify'),
            "got": require.resolve('got'),
            "async_hooks": false,
            "electron": false,
            "child_process": false,
            "./package": false
        }
    },
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },
    devtool: 'inline-source-map',
    mode: 'production'
};
