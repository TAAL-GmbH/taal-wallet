import * as fs from 'fs';
import * as path from 'path';
import colorLog from './log';
import { PluginOption } from 'vite';

const { resolve } = path;

const root = resolve(__dirname, '..', '..');
const contentStyle = resolve(root, 'src', 'pages', 'content', 'style.css');
const outDir = resolve(__dirname, '..', '..', 'public');

export default function copyFiles(): PluginOption {
  return {
    name: 'copy-files',
    buildEnd() {
      fs.copyFileSync(contentStyle, resolve(outDir, 'contentStyle.css'));

      colorLog(`contentStyle copied`, 'success');
    },
  };
}
