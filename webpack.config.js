const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const dependencies = require('./package.json').dependencies;

const appDirectory = fs.realpathSync(process.cwd());
const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';
console.log("--------------------------------------------------------------- new config")
function createExternals() {
    // Libs provided by nRF Connect at runtime
    const coreLibs = [
        'react',
        'react-dom',
        'react-redux',
        'pc-ble-driver-js',
        'pc-nrfjprog-js',
        'serialport',
        'electron',
        'nrfconnect/core',
    ];

    // Libs provided by the app at runtime
    const appLibs = Object.keys(dependencies);

    return coreLibs.concat(appLibs).reduce((prev, lib) => (
        Object.assign(prev, { [lib]: lib })
    ), {});
}

let eslintConfig;
try {
    eslintConfig = require.resolve('./node_modules/pc-nrfconnect-devdep/config/eslintrc.json');
} catch (err) {
    eslintConfig = require.resolve('./eslintrc.json');
}

module.exports = {
    devtool: isProd ? 'hidden-source-map' : 'inline-cheap-source-map',
    entry: './index.jsx',
    output: {
        path: path.join(appDirectory, 'dist'),
        publicPath: './dist/',
        filename: 'bundle.js',
        libraryTarget: 'umd',
    },
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            use: [{
                loader: require.resolve('babel-loader'),
                options: {
                    cacheDirectory: true,
                }
            }, {
                loader: require.resolve('eslint-loader'),
                options: {
                    configFile: eslintConfig,
                }
            }],
            exclude: /node_modules/,
        }, {
            test: /\.json$/,
            loader: require.resolve('json-loader'),
        }, {
            test: /\.less$/,
            loaders: [
                require.resolve('style-loader'),
                require.resolve('css-loader'),
                require.resolve('less-loader'),
            ],
        }, {
            test: /\.(png|gif|ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
            loader: require.resolve('file-loader'),
        },/* {
            test: /\.rs$/,
            loader: 'rust-emscripten-loader',
            options: {
              release: true
            }
        }*/
    ],
    },
    resolve: {
        extensions: ['.js', '.jsx'],
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(nodeEnv),
            },
        }),
    ],
    target: 'electron-renderer',
    externals: createExternals(),
};
