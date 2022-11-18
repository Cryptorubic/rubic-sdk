const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = function(env, argv) {
    const isProduction = argv.mode === 'production';
    return {
        entry: './src/index.ts',
        module: {
            rules: [
                {
                    test: /\.ts?$/,
                    use: [
                        {
                            loader: require.resolve('ts-loader'),
                            options: {
                                compiler: 'ttypescript',
                            },
                        },
                    ], 
                    exclude: ['/node_modules', '/lib'],
                },
                {
                    test: /\.m?js/,
                    resolve: {
                        fullySpecified: false
                    }
                }
            ]
        },
        plugins: [
            new webpack.IgnorePlugin({
                checkResource(resource) {
                    // "@ethereumjs/common/genesisStates" consists ~800KB static files which are no more needed
                    return /(.*\/genesisStates\/.*\.json)/.test(resource)
                },
            }),
            new webpack.ProvidePlugin({
                Buffer: ['buffer', 'Buffer'],
                process: 'process/browser'
            }),
            new webpack.SourceMapDevToolPlugin({
                test: [/\.ts$/],
                exclude: 'vendor',
                filename: "app.[hash].js.map",
                append: "//# sourceMappingURL=[url]",
                moduleFilenameTemplate: '[resource-path]',
                fallbackModuleFilenameTemplate: '[resource-path]',
            }),
        ],
        resolve: {
            extensions: ['.ts', '.js'],
            alias: {
                "src": path.resolve(__dirname, 'src'),
                // To avoid blotting up the `bn.js` library all over the packages
                // use single library instance.
                "bn.js": path.resolve(__dirname, 'node_modules/bn.js')
            }, 
            fallback: {
                "path": false,
                "os": false,
                "url": require.resolve("url"),
                "http": require.resolve("http-browserify"),
                "https": require.resolve("https-browserify"),
                "stream": require.resolve("stream-browserify"),
                "crypto": require.resolve("crypto-browserify")
            }
        },
        output: {
            filename: 'rubic-sdk.min.js',
            path: path.resolve(__dirname, 'dist'),
            library: 'RubicSDK',
            clean: true
        },
        // optimization: {
        //     minimizer: [new TerserPlugin({
        //         extractComments: false
        //     })],
        // },
        devtool: 'source-map',
        mode: 'development',
    }
};
