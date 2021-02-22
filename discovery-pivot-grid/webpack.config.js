/* global __dirname */

let path = require('path');

let webpack = require('webpack');
let CopyWebpackPlugin = require('copy-webpack-plugin');

let dir_src = path.resolve(__dirname, 'src');
let dir_html = path.resolve(__dirname, 'html');
let dir_build = path.resolve(__dirname, 'build');
let dir_discovery = path.resolve(__dirname, '../discovery-frontend/src/lib/pivot-grid');

let commonConfig = {
    entry: {
        'pivot': path.resolve(dir_src, 'index.js')
    },
    module: {
        loaders: [
            {
                loader: 'babel-loader',
                test: dir_src
            }
        ]
    },
    stats: {
        // Nice colored output
        colors: true
    }
};

let devConfig = Object.assign({}, commonConfig, {
    output: {
        path: dir_build,
        library: 'pivot',
        filename: 'pivot.grid.min.js'
    },
    devServer: {
        contentBase: dir_build
    },
    plugins: [
        // Simply copies the files over
        new CopyWebpackPlugin([
            { from: dir_html } // to: output.path,
        ]),
        // Avoid publishing files when compilation fails
        new webpack.NoErrorsPlugin()
    ]
});

let prodConfig = Object.assign({}, commonConfig, {
    output: {
        path: dir_discovery,
        library: 'pivot',
        filename: 'pivot.grid.min.js'
    },
    plugins: [
        // Avoid publishing files when compilation fails
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.UglifyJsPlugin({ minimize: true, compress: false })
    ]
});

module.exports = [ devConfig, prodConfig ];
