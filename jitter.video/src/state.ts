import { reactive, ref } from 'vue'

export interface Profile {
  email: string
  name: string
  role: string
  experience: string
  workspace: string
  active: boolean
  complete: boolean
  step: number
}

export interface Project {
  id: string
  name: string
  text: string
  color: string
  template: number
  updated: number
}

export const templates = [
  { id: 1, name: 'The Track: Poster', category: 'Social media', color: '#e5ff53' },
  { id: 2, name: 'Image Stretch Transition', category: 'UI & product', color: '#bdd3f1' },
  { id: 3, name: 'The Track: Promo Reel', category: 'Social media', color: '#ece6de' },
  { id: 4, name: 'The Edit: Collection Teaser', category: 'Marketing', color: '#dce3d6' },
  { id: 5, name: 'Stretched Type Repeater', category: 'Typography', color: '#ffa084' },
  { id: 6, name: 'Ripple Effect', category: 'UI & product', color: '#b498f5' },
]

export const emptyProfile = (): Profile => ({ email: '', name: '', role: '', experience: '', workspace: '', active: false, complete: false, step: 0 })
export const storageWarning = ref('')

function readStored(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null')
  } catch {
    return null
  }
}

export function normalizeProfile(value: unknown): Profile {
  const result = emptyProfile()
  if (!value || typeof value !== 'object') return result
  const record = value as Record<string, unknown>
  for (const field of ['email', 'name', 'role', 'experience', 'workspace'] as const) {
    if (typeof record[field] === 'string') result[field] = record[field].slice(0, 200)
  }
  result.active = record.active === true && isEmail(result.email)
  result.complete = record.complete === true && Boolean(result.name.trim() && result.role && result.experience && result.workspace.trim())
  result.step = typeof record.step === 'number' ? Math.max(0, Math.min(3, Math.floor(record.step) || 0)) : 0
  return result
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export const profile = reactive<Profile>(normalizeProfile(readStored('jitter-demo-profile')))
function loadProjects(email: string): Project[] {
  const savedProjects = readStored(`jitter-demo-projects:${email}`)
  return Array.isArray(savedProjects) ? savedProjects.filter((item): item is Project =>
  item && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.text === 'string' &&
  typeof item.color === 'string' && /^#[\da-f]{6}$/i.test(item.color) && Number.isInteger(item.template) &&
  item.template >= 0 && item.template <= 6 && typeof item.updated === 'number',
  ) : []
}
export const projects = ref<Project[]>(loadProjects(profile.email))
export const pendingTemplate = ref<number | null>(null)

function store(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    storageWarning.value = ''
  } catch {
    storageWarning.value = 'Browser storage is unavailable. Your changes will only last until this page closes.'
  }
}

export function saveProfile() { store('jitter-demo-profile', profile) }
export function saveProjects() { store(`jitter-demo-projects:${profile.email}`, projects.value) }

export function verifyDemoEmail(email: string) {
  const normalized = email.trim().toLowerCase()
  if (!isEmail(normalized)) return false
  if (profile.email !== normalized) {
    Object.assign(profile, emptyProfile())
    projects.value = loadProjects(normalized)
  }
  profile.email = normalized
  profile.active = true
  saveProfile()
  return true
}

export function guardedPath(path: string): string {
  if (path === '/files' && !profile.complete) return profile.active ? '/onboarding' : '/join'
  if (['/onboarding', '/files'].includes(path) && !profile.active) return '/join'
  return path
}

export function createProject(template = 0) {
  const preset = templates.find(item => item.id === template)
  const project: Project = {
    id: crypto.randomUUID(), name: preset?.name || 'Untitled animation', text: 'Make it\nmove.',
    color: preset?.color || '#b498f5', template, updated: Date.now(),
  }
  projects.value.unshift(project)
  saveProjects()
  return project
}

export function signOut() {
  profile.active = false
  saveProfile()
}
