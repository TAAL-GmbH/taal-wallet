import { Configuration } from 'webpack';
import 'webpack-dev-server';
import path from 'path';

const publicDir = path.resolve(__dirname, '..', 'demo');
const config: Configuration = {
  mode: 'development',
  devServer: {
    static: {
      directory: publicDir,
    },
    port: 8080,
    open: true,
  },
  entry: path.resolve(__dirname, '..', 'demo', 'index.ts'),
  devtool: 'cheap-source-map',
  watch: true,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: '../demo/tsconfig.json',
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  output: {
    filename: 'index.js',
  },
};

export default config;
