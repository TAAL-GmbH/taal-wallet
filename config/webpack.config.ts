import { Configuration, ProvidePlugin } from 'webpack';
import path from 'path';
import CopyPluginWebpackPlugin from 'copy-webpack-plugin';
import { MakeManifestWebpackPlugin } from '../src/utils/MakeManifestWebpackPlugin';
import tsconfig from '../tsconfig.json';
import { generateHtmlFiles } from './generateHtmlFiles';

const alias: Record<string, string> = {};

Object.entries(tsconfig.compilerOptions.paths).forEach(item => {
  const key = item[0].replace(/\/\*$/, '');
  const val = item[1][0].replace(/\/\*$/, '');
  alias[key] = path.resolve(__dirname, '..', val);
});

const publicDir = path.resolve(__dirname, '..', 'public');
const outDir = path.resolve(__dirname, '..', 'dist');
const pagesDir = path.resolve(__dirname, '..', 'src', 'pages');

const config: Configuration = {
  mode: 'development',
  entry: {
    background: `${pagesDir}/background/index.ts`,
    content: './src/pages/content/index.ts',
    popup: './src/pages/popup/index.tsx',
    options: './src/pages/options/index.tsx',
    dialog: './src/pages/dialog/index.tsx',
  },
  devtool: 'cheap-source-map',
  externals: {
    // crypto: 'crypto',
  },
  watch: true,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpg|gif|svg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    alias,
    fallback: {
      buffer: require.resolve('buffer'),
      assert: require.resolve('assert'),
      process: require.resolve('process'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  output: {
    filename: '[name]/index.js',
    path: path.resolve(__dirname, '..', 'dist/src/pages/'),
  },
  plugins: [
    new ProvidePlugin({
      process: ['process'],
      Buffer: ['buffer', 'Buffer'],
    }),
    new MakeManifestWebpackPlugin({ outDir }),
    new CopyPluginWebpackPlugin({
      patterns: [{ from: publicDir, to: outDir }],
    }),
    ...generateHtmlFiles(['popup', 'options', 'dialog']),
  ],
};

export default config;
