import { getSource, siteById } from './registry'
import type { ComponentEntry } from './registry/types'
import { getImplementation } from './implementation'

export function saveFile(name: string, content: BlobPart, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function exportComponent(entry: ComponentEntry) {
  const { strToU8, zipSync } = await import('fflate')
  const { marked } = await import('marked')
  const { sourceReference } = await import('./implementation-content')
  const files: Record<string, Uint8Array> = {}
  const implementation = await getImplementation(entry.id)
  files[`implementation/${entry.id}.md`] = strToU8(implementation)
  const sourceFiles = new Set(entry.files)
  marked.walkTokens(marked.lexer(implementation), token => {
    if (token.type !== 'link') return
    const reference = sourceReference(token.href)
    if (reference) sourceFiles.add(reference.path)
  })
  await Promise.all([...sourceFiles].map(async file => {
    const source = await getSource(file)
    if (!source) throw new Error(`缺少源码文件：${file}`)
    files[`src/${file}`] = strToU8(source)
  }))
  for (const asset of entry.assets ?? []) {
    const response = await fetch(asset)
    if (!response.ok) throw new Error(`素材下载失败：${asset}`)
    files[`public${asset}`] = new Uint8Array(await response.arrayBuffer())
  }
  const theme = entry.site === 'osmo' ? `@font-face { font-family: 'Haffer'; src: url('/assets/osmo/haffer.ttf'); font-weight: 100 900; font-display: swap; }\n${entry.assets?.some(asset => asset.includes('brisa')) ? "@font-face { font-family: 'Brisa Pro'; src: url('/assets/osmo/brisa.woff2'); font-display: swap; }\n" : ''}` : ''
  if (theme) files['src/component-fonts.css'] = strToU8(theme)
  files['README.md'] = strToU8(`# ${entry.title}\n\n${entry.summary}\n\n## 来源\n\n${siteById[entry.site].domain}\n原始文件: ${entry.source}\n提取方式: ${entry.sourceKind}\n\n## 集成\n\n1. 将 src/library 内文件放入项目，保留组件之间的相对路径。\n2. 将 public/assets 内素材合并至项目的 public/assets，或修改源码内的素材地址。\n3. 安装 Vue 3.5+ 和 lucide-vue-next 1.x。${theme ? "\n4. 在应用入口导入 src/component-fonts.css。" : ''}\n\n## 示例\n\n\`\`\`vue\n${entry.usage}\n\`\`\`\n\n示例中的事件处理函数与 v-model 状态由宿主应用提供。外部业务行为通过 props / emits 接入。\n\n## 可调参数\n\n${entry.props.map(prop => `- ${prop.name}: ${prop.type}, 默认 ${JSON.stringify(prop.default)}${prop.description ? `; ${prop.description}` : ''}`).join('\n')}\n\n素材来自本仓库对应站点，仅用于本地展示；导出不改变原字体、图片和视频的授权范围。\n`)
  const guide = `\n## 实现详解\n\n[阅读 ${entry.title} 的实现详解](implementation/${entry.id}.md)。文档逐项说明参数、事件处理函数、状态计算、DOM/CSS 更新、键盘行为和接入边界，并附上真实源码摘录与行号。\n\n文档链接涉及的源码与测试文件一并提供，保持相对路径。测试文件用于对照阅读；若要执行测试，请在完整 site-components 项目中安装开发依赖后运行 npm test，因为同一测试文件可能覆盖其他组件。\n`
  files['README.md'] = strToU8(new TextDecoder().decode(files['README.md']) + guide)
  saveFile(`${entry.id}.zip`, zipSync(files) as Uint8Array<ArrayBuffer>, 'application/zip')
}
