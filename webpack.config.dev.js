'use strict';

const path = require('path');
const webpack = require('webpack');


module.exports = {
    env : process.env.NODE_ENV,
    entry: {
        app: path.resolve(path.resolve(__dirname, 'example'), 'bootstrap.js'),
        vendor: []
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name].js',
        publicPath: '/'
    },
    stats: {
        colors: true,
        reasons: true
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    module: {
        loaders: [
            {
                exclude: /(node_modules|bower_components)/,
                test: /\.jsx?$/,
                loaders: ['babel?presets[]=stage-0&presets[]=es2015&plugins[]=transform-class-properties']
            },
            {
                exclude: /(node_modules|bower_components)/,
                test: /\.less?$/,
                loaders: ['style', 'css', 'less']
            }
        ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js'),
        new webpack.NoErrorsPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
            __DEV__: JSON.stringify(JSON.parse(process.env.DEBUG || 'false'))
        })
    ],
    devServer: {
        contentBase: path.resolve(__dirname, 'example'),
        port: 3000
    },
    devtool: 'eval'
};