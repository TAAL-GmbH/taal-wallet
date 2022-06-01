import HtmlWebpackPlugin from 'html-webpack-plugin';

export const generateHtmlFiles = (chunks: string[]) => {
  // devtools: resolve(pagesDir, 'devtools', 'index.html'),
  // panel: resolve(pagesDir, 'panel', 'index.html'),
  // content: resolve(pagesDir, 'content', 'index.ts'),
  // popup: resolve(pagesDir, 'popup', 'index.html'),
  // newtab: resolve(pagesDir, 'newtab', 'index.html'),
  // options: resolve(pagesDir, 'options', 'index.html'),
  // connection: resolve(pagesDir, 'connection', 'index.html'),
  // auth: resolve(pagesDir, 'auth', 'index.html'),
  // dialog: resolve(pagesDir, 'dialog', 'index.html'),

  return chunks.map(chunk => {
    return new HtmlWebpackPlugin({
      chunks: [chunk],
      template: 'config/index.ejs',
      inject: false,
      minify: false,
      filename: `${chunk}/index.html`,
    });
  });
};
