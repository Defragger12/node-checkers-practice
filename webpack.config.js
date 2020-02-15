const path = require('path');
const webpack = require('webpack');

module.exports = {
    context: path.resolve(__dirname, './src'),
    entry: {
        checkers: ['@babel/polyfill', './client/checkers', './client/dragmanager']
    },
    output: {
        path: path.resolve(__dirname, './public/scripts'),
        filename: '[name].bundle.js',
    },
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: [/node_modules/],
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"]
                    }
                }
            }
        ]
    }
};