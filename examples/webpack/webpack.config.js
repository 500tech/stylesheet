module.exports = {
  module: {
    loaders: [
      {        
        test: /\.css/,
        loaders: [
          {
            loader: 'reactive-css/loader',
            query: {
              bindings: 'react',
            },
          },
          {
            loader: 'css-loader',
            query: {
              modules: true,
            },
          },
        ],
      },
    ],
  },
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
  },
  entry: './src/index.js',
  output: {
    filename: 'dist/bundle.js',
  },
  devtool: 'sourcemaps',
};