import { Compiler } from 'webpack';
import { promises as fs } from 'fs';
import path from 'path';
import { colorLog } from './log';
import manifest from '../manifest';

export class MakeManifestWebpackPlugin {
  private outDir: string;
  private manifestPath: string;

  constructor({ outDir }: { outDir: string }) {
    this.outDir = outDir;
    this.manifestPath = path.resolve(this.outDir, 'manifest.json');
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

      await fs.writeFile(this.manifestPath, JSON.stringify(manifest, null, 2));
      colorLog(`Manifest file copy complete: ${this.manifestPath}`, 'success');

      callback();
    });
  }
}
