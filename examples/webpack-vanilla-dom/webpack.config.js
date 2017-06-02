module.exports = {
  module: {
    rules: [
      {
        test: /\.css/,
        use: [
          'style-loader',
          {
            loader: 'stylesheet/loader',
            query: {
              sourceMap: true,
              bindings: 'vanilla-dom',
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
