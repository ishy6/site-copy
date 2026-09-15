import { getSource, siteById } from './registry'
import type { ComponentEntry } from './registry/types'

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
  const files: Record<string, Uint8Array> = {}
  await Promise.all(entry.files.map(async file => {
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
  saveFile(`${entry.id}.zip`, zipSync(files) as Uint8Array<ArrayBuffer>, 'application/zip')
}
