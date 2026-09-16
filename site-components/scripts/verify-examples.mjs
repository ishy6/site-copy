import { mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { marked } from 'marked'

const root = process.cwd()
const directory = await mkdtemp(join(root, 'node_modules/.implementation-examples-'))
let count = 0
try {
  await mkdir(join(directory, 'examples'))
  await symlink(resolve('src/library'), join(directory, 'library'), 'dir')
  for (const file of await readdir('implementation')) {
    if (file === 'README.md' || !file.endsWith('.md')) continue
    const tokens = marked.lexer(await readFile(join('implementation', file), 'utf8')).filter(token => token.type !== 'space')
    let example = 0
    for (const [index, token] of tokens.entries()) {
      const previous = tokens[index - 1]
      if (token.type !== 'code' || token.lang !== 'vue' || (previous?.type === 'html' && previous.text.includes('<!-- source:'))) continue
      example++
      count++
      await writeFile(join(directory, 'examples', `${file.slice(0, -3)}-${example}.vue`), token.text)
    }
  }
  await writeFile(join(directory, 'tsconfig.json'), JSON.stringify({
    extends: join(root, 'tsconfig.app.json'),
    compilerOptions: { tsBuildInfoFile: join(directory, 'examples.tsbuildinfo') },
    include: ['./examples/**/*.vue'],
    exclude: [],
  }, null, 2))
  const result = spawnSync(process.execPath, [join(root, 'node_modules/vue-tsc/bin/vue-tsc.js'), '--project', join(directory, 'tsconfig.json'), '--noEmit'], { stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) process.exitCode = result.status || 1
  else console.log(`Implementation examples passed Vue and TypeScript checks: ${count}.`)
} finally { await rm(directory, { recursive: true, force: true }) }
