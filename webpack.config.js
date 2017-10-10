var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: path.join(__dirname, 'src', 'index.js'),
  output: {
    path: path.join(__dirname, 'src', 'static', 'js'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: path.join(__dirname, 'src'),
        loader: 'babel-loader', 
        query: {
          cacheDirectory: 'babel_cache',
          presets: ['react', 'es2015']
        }
      },
      { 
        test: /\.css$/, loader: "style-loader!css-loader" 
      },
      {
        test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192' 
      }      
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.css']
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
      mangle: true,
      sourcemap: false,
      beautify: false,
      dead_code: true
    }),
    new webpack.DefinePlugin({
        "process.env": {
            BROWSER: JSON.stringify(true)
        }
    })
  ]
};