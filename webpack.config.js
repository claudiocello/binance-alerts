const path = require('path');
const webpack = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const isProd = (process.env.NODE_ENV === 'production');

const serverHost = 'localhost';
const serverPort = 8000;
const serverRoot = path.join(__dirname, '/');
const appEntry = './src/app.js';
const bundleDir = './public/bundles/';
const globalSass = './src/scss/globals.scss';

module.exports = {
  mode: process.env.NODE_ENV,
  entry: {
    app: appEntry,
  },
  output: {
    path: serverRoot,
    filename: path.join(bundleDir, '[name].min.js'),
  },
  stats: {
    colors: true,
  },
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif|svg|map|css|eot|woff|woff2|ttf)$/,
        loader: 'ignore-loader',
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.scss$/,
        use: [
          isProd ? MiniCssExtractPlugin.loader : 'vue-style-loader',
          'css-loader',
          'postcss-loader',
          {
            loader: 'sass-loader',
            options: {
              additionalData: `@import "${globalSass}";`
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: 'index.html'
    }),
    new MiniCssExtractPlugin({
      filename: path.join(bundleDir, '[name].min.css')
    })
  ],
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  devServer: {
    host: serverHost,
    port: serverPort,
    static: {
      directory: serverRoot,
    },
    client: {
      logging: 'info',
    },
    hot: true,
    compress: false,
  },
  performance: {
    hints: false
  }
};

if (isProd) {
  module.exports.plugins.push(
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  );
}
