const BuildStatusPlugin = require('build-status-webpack-plugin')
const DefinePlugin      = require('webpack/lib/DefinePlugin')
const path              = require('path')

const buildPath         = path.resolve(__dirname, '../../dist')
const extensions        = [ '.js', '.json', '.jsx' ]

const entry = [
  'react-hot-loader/patch',
  "./src"
]


const options = { sourceMap: true }

const rules = [
  {
    test:     /\.jsx?$/,
    loader:   'babel-loader',
    exclude:  /node_modules/
  },

  {
    test:       /\.less$/,
    use:        [
      { loader: 'style-loader' },
      { loader: 'css-loader',  options },
      { loader: 'less-loader', options }
    ],
  }
]


module.exports = {
  mode: "development",
  entry,
  module: { rules },
  resolve: { extensions },
  devtool: 'cheap-module-source-map',

  plugins: [
    new BuildStatusPlugin({}),
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'global.RUNTIME':       JSON.stringify('client'),
    }),
  ],

  output: {
    path:                   buildPath,
    library:                'trinity',
    filename:               '[name].js',
    publicPath:             '/',
    libraryTarget:          'umd2',
    jsonpFunction:          'run',
    // hotUpdateFunction:      'update',
    // hotUpdateMainFilename:  'update.[hash].json',
    // hotUpdateChunkFilename: 'update.[hash].[id].js',
  },

  devServer: {
    publicPath:         '/',
    logLevel:           'silent',
    historyApiFallback: true,
    serverSideRender:   true,
    compress:           false,
    quiet:              true,
    hot:                true,
    port:               3000,
  }

}
