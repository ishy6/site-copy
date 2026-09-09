<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, FileVideo, Folder, Grid2X2, HelpCircle, LayoutTemplate, LogOut, MoreHorizontal, Pause, Play, Plus, Search, Settings2, Sparkles, Trash2, X, Download } from 'lucide-vue-next'
import { createProject, pendingTemplate, profile, projects, saveProfile, saveProjects, signOut, templates } from '../state'
import type { Project } from '../state'
import VideoTile from './VideoTile.vue'

const emit = defineEmits<{ navigate: [path: string] }>()
const section = ref('All files')
const search = ref('')
const activeProject = ref<Project | null>(null)
const editor = ref<HTMLDialogElement>()
const settings = ref<HTMLDialogElement>()
const deleteDialog = ref<HTMLDialogElement>()
const deleteTarget = ref<Project | null>(null)
const workspaceName = ref(profile.workspace)
const playing = ref(true)
const toast = ref('')
const onboardingDismissed = ref(false)
const filteredProjects = computed(() => projects.value.filter(project => project.name.toLowerCase().includes(search.value.toLowerCase())))
const visibleTemplates = computed(() => templates.filter(template => template.name.toLowerCase().includes(search.value.toLowerCase())))
const firstName = computed(() => profile.name.split(' ')[0] || 'there')

async function openProject(project: Project) { activeProject.value = project; playing.value = true; await nextTick(); editor.value?.showModal() }
function newProject(template = 0) { openProject(createProject(template)) }
function updateProject() { if (activeProject.value) { activeProject.value.updated = Date.now(); saveProjects() } }
function closeEditor() { updateProject(); editor.value?.close(); activeProject.value = null }
function saveWorkspace() { if (!workspaceName.value.trim()) return; profile.workspace = workspaceName.value.trim(); saveProfile(); settings.value?.close(); toast.value = 'Workspace name updated.' }
function confirmDelete(project: Project) { deleteTarget.value = project; deleteDialog.value?.showModal() }
function deleteProject() { projects.value = projects.value.filter(project => project.id !== deleteTarget.value?.id); saveProjects(); deleteDialog.value?.close(); deleteTarget.value = null; toast.value = 'Project deleted from this browser.' }
function logout() { signOut(); emit('navigate', '/') }
function exportDesign() {
  if (!activeProject.value) return
  const escape = (text: string) => text.replace(/[<>&"']/g, character => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[character]!)
  const lines = activeProject.value.text.split('\n').slice(0, 5).map((line, index) => `<tspan x="70" dy="${index === 0 ? 0 : 110}">${escape(line)}</tspan>`).join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080"><rect width="1080" height="1080" fill="${activeProject.value.color}"/><text x="70" y="250" font-family="Arial,sans-serif" font-size="100" font-weight="bold" fill="#19181b">${lines}</text><text x="70" y="1000" font-family="Arial,sans-serif" font-size="22">Made with the Jitter local demo</text></svg>`
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${activeProject.value.name.replace(/[^a-z\d\- ]/gi, '').trim() || 'jitter-design'}.svg`
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  toast.value = 'Static SVG downloaded. Video export is not connected in this demo.'
}
onMounted(() => {
  if (pendingTemplate.value) { const template = pendingTemplate.value; pendingTemplate.value = null; newProject(template) }
})
</script>

<template>
  <main id="main-content" class="workspace-page" tabindex="-1">
    <aside class="workspace-sidebar"><a href="/" class="workspace-logo" aria-label="Jitter homepage" @click.prevent="emit('navigate', '/')"><img src="/assets/jitter.svg" alt="Jitter" width="71" /></a><button class="workspace-selector" @click="workspaceName = profile.workspace; settings?.showModal()"><span class="workspace-initial">{{ profile.workspace.charAt(0).toUpperCase() }}</span><b>{{ profile.workspace }}</b><ChevronDown :size="15" /></button><span class="sidebar-label">WORKSPACE <span>FREE</span></span><nav aria-label="Workspace navigation"><button v-for="item in [{ name: 'All files', icon: Folder }, { name: 'Templates', icon: LayoutTemplate }]" :key="item.name" :class="{ active: section === item.name }" @click="section = item.name; search = ''"><component :is="item.icon" :size="18" />{{ item.name }}<span v-if="item.name === 'All files'">{{ projects.length }}</span></button></nav><div class="sidebar-bottom"><div class="sidebar-tip"><Sparkles :size="20" /><b>A little inspiration?</b><p>Your next idea might be one template away.</p><button @click="section = 'Templates'">Find your starting point <ArrowRight :size="15" /></button></div><button @click="workspaceName = profile.workspace; settings?.showModal()"><Settings2 :size="18" /> Workspace settings</button><a href="https://help.jitter.video/" target="_blank" rel="noreferrer"><HelpCircle :size="18" /> Help & tutorials <ArrowUpRight :size="13" /></a><button @click="logout"><LogOut :size="18" /> Sign out of demo</button><div class="sidebar-user"><span>{{ profile.name.charAt(0).toUpperCase() }}</span><div><b>{{ profile.name }}</b><small>Local demo account</small></div></div></div></aside>
    <div class="workspace-main"><header class="workspace-toolbar"><span>{{ profile.workspace }} <span>/</span> {{ section }}</span><div><span class="saved-indicator"><span></span> Saved in this browser</span><button class="button dark" @click="newProject()"><Plus :size="17" /> New file</button></div></header><div class="workspace-content"><div class="workspace-heading"><div><span class="eyebrow">Your creative playground</span><h1>{{ section === 'Templates' ? 'A little inspiration.' : `Let’s make moves, ${firstName}.` }}</h1><p>{{ section === 'Templates' ? 'Pick a starting point. Make it something entirely yours.' : 'Good things start with a first frame. What will yours be?' }}</p></div><span class="greeting-spark" aria-hidden="true">✳</span></div>
      <section v-if="section === 'All files' && !onboardingDismissed" class="welcome-banner"><button class="icon-button dismiss-welcome" aria-label="Dismiss welcome guide" @click="onboardingDismissed = true"><X :size="16" /></button><div><span class="eyebrow">YOU’RE IN. LET’S BEGIN.</span><h2>Your first animation<br />is closer than you think.</h2><p>Start with a template, change a few things,<br />and make a little magic.</p><button class="button dark" @click="section = 'Templates'"><Play :size="15" /> Start with a template <ArrowRight :size="17" /></button></div><div class="welcome-art"><span>hello<span>motion.</span></span><i>✳</i><small>YOUR NEXT GREAT IDEA STARTS HERE ↗</small></div></section>
      <div class="files-heading"><h2>{{ section }} <span>{{ section === 'All files' ? projects.length : templates.length }}</span></h2><div><label class="file-search"><Search :size="16" /><input v-model="search" type="search" :placeholder="section === 'All files' ? 'Search files…' : 'Search templates…'" :aria-label="section === 'All files' ? 'Search files' : 'Search templates'" /></label><Grid2X2 :size="19" /></div></div>
      <div v-if="section === 'All files'" class="project-grid"><button v-if="!search" class="new-file-tile" @click="newProject()"><span><Plus :size="29" /></span><b>Create a new file</b><small>A blank canvas, a fresh start.</small></button><article v-for="project in filteredProjects" :key="project.id" class="project-card"><button class="project-preview" :style="{ background: project.color }" :aria-label="`Open ${project.name}`" @click="openProject(project)"><span>{{ project.text }}</span><i>✳</i></button><div class="project-meta"><button @click="openProject(project)"><b>{{ project.name }}</b><small>Saved locally · {{ new Date(project.updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}</small></button><button class="icon-button" :aria-label="`Delete ${project.name}`" @click="confirmDelete(project)"><Trash2 :size="16" /></button></div></article></div>
      <div v-else class="workspace-template-grid"><button v-for="template in visibleTemplates" :key="template.id" @click="newProject(template.id)"><VideoTile :source="`/assets/template-${template.id}.mp4`" :label="template.name" /><span><b>{{ template.name }}</b><ArrowUpRight :size="17" /></span><small>{{ template.category }}</small></button></div><p v-if="search && !(section === 'All files' ? filteredProjects.length : visibleTemplates.length)" class="empty-search">No matches for “{{ search }}”. Try a different search.</p>
      <div class="workspace-note"><Check :size="14" /> Your workspace is ready. Projects stay in this browser, not in the cloud.</div>
    </div></div>
  </main>

  <dialog ref="editor" aria-label="Motion design editor" class="editor-dialog" @close="activeProject = null"><template v-if="activeProject"><header class="editor-header"><button class="icon-button" aria-label="Back to files" @click="closeEditor"><ArrowLeft :size="19" /></button><img src="/assets/jitter.svg" alt="Jitter" width="55" /><input v-model="activeProject.name" aria-label="File name" maxlength="90" @input="updateProject" /><span class="editor-save"><Check :size="14" /> Saved locally</span><button class="button dark" @click="exportDesign"><Download :size="16" /> Export SVG</button><button class="icon-button" aria-label="Close editor" @click="closeEditor"><X :size="20" /></button></header><div class="editor-body"><aside class="editor-layers"><span>Layers</span><div><FileVideo :size="16" /> Artboard</div><button class="selected"><span>T</span> Headline</button><p>Local design playground<br />Customize your first frame.</p></aside><div class="editor-canvas"><div :class="['editable-artboard', { playing }]" :style="{ background: activeProject.color }"><span>{{ activeProject.text }}</span><i aria-hidden="true">✳</i><small>MAKE YOUR FIRST MOVE ↗</small></div><span class="canvas-scale">1080 × 1080 · Preview</span></div><aside class="editor-properties"><h3>Design</h3><label for="design-text">Headline</label><textarea id="design-text" v-model="activeProject.text" rows="4" maxlength="100" @input="updateProject"></textarea><label for="design-color">Background</label><div class="color-control"><input id="design-color" v-model="activeProject.color" type="color" @input="updateProject" /><span>{{ activeProject.color.toUpperCase() }}</span></div><h3>Animation</h3><span class="animation-chip"><Sparkles :size="16" /> Gentle entrance</span><p>Play to preview a simple CSS animation. Export saves a static SVG, not a video.</p></aside></div><footer class="editor-timeline"><button class="icon-button" :aria-label="playing ? 'Pause animation' : 'Play animation'" @click="playing = !playing"><Pause v-if="playing" :size="18" /><Play v-else :size="18" /></button><span>00:00 <small>/ 00:04</small></span><div class="timeline-track"><div class="time-ruler"><span v-for="tick in 5" :key="tick">{{ tick - 1 }}s</span></div><div class="timeline-clip">Headline · Gentle entrance</div><i :class="{ playing }"></i></div><MoreHorizontal :size="20" /></footer></template></dialog>
  <dialog ref="settings" aria-label="Workspace settings" class="settings-dialog"><button class="icon-button modal-close" aria-label="Close workspace settings" @click="settings?.close()"><X :size="20" /></button><Settings2 :size="26" /><h2>Your workspace</h2><form @submit.prevent="saveWorkspace"><label for="edit-workspace">Workspace name</label><input id="edit-workspace" v-model="workspaceName" class="setup-input" maxlength="70" required /><p>Free plan · {{ profile.email }}<br />Everything is stored in this browser.</p><button class="button dark" :disabled="!workspaceName.trim()">Save changes <Check :size="17" /></button></form><button class="settings-signout" @click="settings?.close(); logout()"><LogOut :size="15" /> Sign out of demo</button></dialog>
  <dialog ref="deleteDialog" aria-label="Delete file confirmation" class="settings-dialog"><Trash2 :size="26" /><h2>Delete this file?</h2><p>“{{ deleteTarget?.name }}” will be removed from this browser. This can’t be undone.</p><div class="dialog-actions"><button class="button pale" @click="deleteDialog?.close()">Keep file</button><button class="button danger" @click="deleteProject">Delete file</button></div></dialog>
  <div v-if="toast" class="toast" role="status"><Check :size="17" /><span>{{ toast }}</span><button class="icon-button" aria-label="Dismiss notification" @click="toast = ''"><X :size="16" /></button></div>
</template>
