const DeclarationBundlerPlugin = require('./declaration-bundler-webpack-plugin');
const fs = require('fs');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const webpack = require('webpack');
const getExternals = require('./webpack.externals');

module.exports = function(name, dist, externals = getExternals(), prodMode) {
  const packageJson = require(path.resolve(`${ dist }/../package.json`));

  console.log(externals)

  const webpackConfig = {
    entry: './src/index.ts',
    externals: externals,
    devtool: '#eval-source-map',
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    output: {
      path: dist,
      publicPath: '/dist/',
      filename: `${ name }.js`,
      library: `${ name }.js`,
      libraryTarget: 'umd',
      umdNamedDefine: true
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
          options: {
            appendTsSuffixTo: [/\.vue$/],
          }
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
            loaders: {
              // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
              // the "scss" and "sass" values for the lang attribute to the right configs here.
              // other preprocessors should work out of the box, no loader config like this necessary.
              'scss': [
                'vue-style-loader',
                'css-loader',
                'sass-loader'
              ]
            }
            // other vue-loader options go here
          }
        },
        {
          test: /\.(scss|css)$/,
          use: [
            MiniCssExtractPlugin.loader, // process.env.NODE_ENV !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader', // translates css into commonJS
            'sass-loader' // compiles sass to css, using node sass by default
          ]
        },
        {
          test: /\.(woff(2)?|ttf|eot|svg|png|jpg|gif)(\?v=\d+\.\d+\.\d+)?$/,
          use: [{
            loader: 'file-loader',
            options: {
              name: 'assets/[name].[ext]?[hash]',
              publicPath: (url, resourcePath, context) => url
            }
          }]
        },
        {
          test: /\.js$/,
          exclude: file => (/node_modules/.test(file) && !/\.vue\.js/.test(file)),
          loader: 'babel-loader'
        }
      ]
    },
    plugins: [
      new VueLoaderPlugin(),
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: `${ name }.css`,
        chunkFilename: `${ name }.css`,
      }),
    ],
    resolve: {
      extensions: ['.ts', '.js', '.vue', '.json'],
      alias: {
        'vue$': 'vue/dist/vue.esm.js'
      }
    },
    devServer: {
      historyApiFallback: true,
      noInfo: true
    },
    performance: {
      hints: false
    }
  }

  if (process.env.NODE_ENV === 'production' || prodMode) {
    webpackConfig.devtool = '#source-map';
    // http://vue-loader.vuejs.org/en/workflow/production.html
    webpackConfig.plugins = (webpackConfig.plugins || []).concat([
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: '"production"'
        }
      }),
      new UglifyJsPlugin({
        test: /\.js($|\?)/i,
        exclude: /(node_modules)/,
        parallel: true,
        sourceMap: false
      }),
      new OptimizeCSSAssetsPlugin({}),
    ]);
  } else {
    webpackConfig.plugins.push(new HardSourceWebpackPlugin({ cacheDirectory: 'build-cache', }));
  }

  // only rebuild d.ts files when we are running in production mode or they does not exists
  if (process.env.NODE_ENV === 'production' || prodMode ||
    !fs.existsSync(`${ dist }/${ name }.d.ts`)) {
    webpackConfig.plugins.push(new DeclarationBundlerPlugin({
      moduleName: `'${ packageJson.name }'`,
      out: `${ name }.d.ts`,
    }));
  }

  return webpackConfig;
}