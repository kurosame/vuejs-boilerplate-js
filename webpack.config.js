const path = require('path')
const webpack = require('webpack')
const autoprefixer = require('autoprefixer')
const stylelint = require('stylelint')
const Copy = require('copy-webpack-plugin')
const Clean = require('clean-webpack-plugin')
const StyleLint = require('stylelint-webpack-plugin')

module.exports = {
  entry: {
    bundle: ['./src/index.html', './src/index.js']
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  devServer: {
    contentBase: 'dist',
    historyApiFallback: true,
    open: true,
    port: 8000,
    proxy: {
      '/api/*': 'http://localhost:3000'
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader',
            options: {
              loaders: {
                js: 'babel-loader?cacheDirectory!eslint-loader'
              },
              postcss: [
                autoprefixer({
                  browsers: ['last 2 versions', 'IE 11']
                }),
                stylelint()
              ]
            }
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        use: 'babel-loader?cacheDirectory',
        exclude: /node_modules/
      },
      {
        test: /\.vue$|\.js$/,
        use: 'eslint-loader',
        exclude: /node_modules/
      },
      {
        test: /\.html$/,
        use: 'file-loader?name=[name].[ext]'
      },
      {
        test: /index\.html$/,
        use: [
          {
            loader: 'string-replace-loader',
            query: {
              multiple: [
                {
                  search: '<!-- scriptsVendor -->',
                  replace: `<script src=\"/vendor.js?${new Date().getTime()}\"></script>`
                },
                {
                  search: '<!-- scripts -->',
                  replace: `<script src=\"/bundle.js?${new Date().getTime()}\"></script>`
                }
              ]
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new Copy([
      {
        from: 'assets',
        to: 'assets'
      }
    ]),
    new Clean(['dist/**/*'], {
      root: `${__dirname}/..`,
      verbose: false
    }),
    new StyleLint(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    process.env.NODE_ENV === 'production'
      ? new webpack.optimize.UglifyJsPlugin()
      : () => {},
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require('./dist/vendor-manifest.json')
    })
  ],
  resolve: {
    extensions: ['.vue', '.js'],
    alias: { '@': path.resolve(__dirname, 'src') }
  },
  devtool: '#inline-source-map'
}
