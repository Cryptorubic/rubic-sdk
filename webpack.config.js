const path = require('path');

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
            "fs": false,
            "constants": false,
            "querystring": false,
            "url": false,
            "path": false,
            "os": false,
            "http": false,
            "https": false,
            "zlib": false,
            "stream": false,
            "crypto": false,
            "got": false,
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
