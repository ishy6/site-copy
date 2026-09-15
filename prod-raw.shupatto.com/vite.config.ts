import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

export default defineConfig({
  plugins: [vue(), {
    name: 'shupatto-static-routes',
    async closeBundle() {
      const manifest = JSON.parse(await readFile('public/reference/manifest.json', 'utf8'));
      const html = await readFile('dist/index.html', 'utf8');
      for (const route of Object.keys(manifest.pages)) {
        if (route === '/') continue;
        const directory = path.join('dist', route);
        await mkdir(directory, { recursive: true });
        await writeFile(path.join(directory, 'index.html'), html);
      }
      await writeFile('dist/404.html', html);
    },
  }],
});
