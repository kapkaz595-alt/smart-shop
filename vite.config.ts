import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    'PORT environment variable is required but was not provided.',
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    'BASE_PATH environment variable is required but was not provided.',
  );
}

const rootDir = path.resolve(import.meta.dirname);

/**
 * 递归扫描项目根目录下所有 .html 文件，自动生成多页面构建入口。
 * 排除 node_modules / dist / .git / .github 等无关目录。
 * 这样以后新增页面（比如 admin/xxx.html）不用手动改配置。
 */
function findHtmlEntries(dir: string, base = dir): Record<string, string> {
  const entries: Record<string, string> = {};
  const skip = new Set(['node_modules', 'dist', '.git', '.github']);

  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(item.name)) continue;
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      Object.assign(entries, findHtmlEntries(fullPath, base));
    } else if (item.name.endsWith('.html')) {
      const relative = path
        .relative(base, fullPath)
        .replace(/\.html$/, '')
        .replace(/[\\/]/g, '-');
      entries[relative || 'index'] = fullPath;
    }
  }
  return entries;
}

/**
 * 自定义插件：把不会被 HTML/JS 静态引用分析到的文件
 *（sw.js 是运行时通过 navigator.serviceWorker.register() 动态注册的，
 * Vite 无法通过静态分析发现它）原样复制到构建输出目录。
 *
 * 注意：data/、images/ 已经移动到 public/ 目录下，
 * Vite 会自动处理 public/ 内容（dev 和 build 都生效），
 * 所以这里不再需要手动复制它们。
 */
function staticAssetsPlugin(root: string, files: string[], dirs: string[]) {
  const copyDir = (src: string, dest: string) => {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };

  return {
    name: 'smartshop-static-assets',
    writeBundle() {
      const outDir = path.resolve(root, 'dist/public');

      for (const file of files) {
        const src = path.join(root, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, path.join(outDir, file));
        }
      }

      for (const dir of dirs) {
        const src = path.join(root, dir);
        if (fs.existsSync(src)) {
          copyDir(src, path.join(outDir, dir));
        }
      }
    },
  };
}

export default defineConfig({
  base: basePath,
  root: rootDir,
  plugins: [
    staticAssetsPlugin(
      rootDir,
      ['sw.js', 'manifest.json', 'components.json', 'favicon.svg'],
      [],
    ),
  ],
  build: {
    outDir: path.resolve(rootDir, 'dist/public'),
    emptyOutDir: true,
    rollupOptions: {
      input: findHtmlEntries(rootDir),
    },
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
