module.exports = {
  entry: {
    "canto34": './src/canto34.js',
    "canto34-expect": './src/canto34-expect.js',
    "canto34-syntax": './src/canto34-syntax.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  output: {
    path: __dirname + '/dist',
    publicPath: '/',
    //filename: 'canto34.js'
  },
  devServer: {
    contentBase: './dist'
  }
};