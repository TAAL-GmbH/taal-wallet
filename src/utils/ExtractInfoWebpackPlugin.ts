import { Compiler } from 'webpack';
import { promises as fs } from 'fs';
import path from 'path';
import { colorLog } from './log';
import packageJson from '../../package.json';

export class ExtractInfoWebpackPlugin {
  private outDir: string;
  private infoFilePath: string;

  constructor({ outDir }: { outDir: string }) {
    this.outDir = outDir;
    this.infoFilePath = path.resolve(this.outDir, 'info.json');
  }

  apply(compiler: Compiler) {
    compiler.hooks.emit.tapAsync('MakeManifestWebpackPlugin', async (compilation, callback) => {
      const folderExists = await fs
        .access(this.outDir)
        .then(() => true)
        .catch(() => false);

      if (!folderExists) {
        await fs.mkdir(this.outDir);
      }

      const json = {
        version: packageJson.version,
      };

      await fs.writeFile(this.infoFilePath, JSON.stringify(json, null, 2));
      colorLog(`Info file creation complete: ${this.infoFilePath}`, 'success');

      callback();
    });
  }
}
