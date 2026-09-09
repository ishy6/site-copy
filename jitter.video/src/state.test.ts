import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createProject, emptyProfile, guardedPath, isEmail, normalizeProfile, profile, projects, saveProfile, signOut, storageWarning, verifyDemoEmail } from './state'

beforeEach(() => {
  localStorage.clear()
  Object.assign(profile, emptyProfile())
  projects.value = []
  storageWarning.value = ''
  vi.restoreAllMocks()
})

describe('local demo profile', () => {
  it('validates email addresses without accepting malformed values', () => {
    expect(isEmail(' creator@example.com ')).toBe(true)
    for (const email of ['', 'name', '@example.com', 'name@example', 'name @example.com']) expect(isEmail(email)).toBe(false)
  })

  it('rejects invalid demo email and never activates a session', () => {
    expect(verifyDemoEmail('invalid')).toBe(false)
    expect(profile.active).toBe(false)
  })

  it('normalizes stored data and rejects incomplete completion flags', () => {
    expect(normalizeProfile(null)).toEqual(emptyProfile())
    const normalized = normalizeProfile({ email: 'not-email', name: 42, complete: true, active: true, step: 50 })
    expect(normalized.active).toBe(false)
    expect(normalized.complete).toBe(false)
    expect(normalized.name).toBe('')
    expect(normalized.step).toBeLessThanOrEqual(3)
  })

  it('guards setup and workspace routes before demo verification', () => {
    expect(guardedPath('/files')).toBe('/join')
    expect(guardedPath('/onboarding')).toBe('/join')
    verifyDemoEmail('creator@example.com')
    expect(guardedPath('/files')).toBe('/onboarding')
    Object.assign(profile, { name: 'Alex', role: 'Designer', experience: 'Just getting started', workspace: 'Studio', complete: true })
    expect(guardedPath('/files')).toBe('/files')
    expect(guardedPath('/templates')).toBe('/templates')
  })

  it('persists a normalized demo email and retains progress after signing back in', () => {
    verifyDemoEmail(' Alex@EXAMPLE.com ')
    Object.assign(profile, { name: 'Alex', role: 'Designer', step: 2 })
    saveProfile()
    signOut()
    expect(profile.active).toBe(false)
    verifyDemoEmail('alex@example.com')
    expect(profile.name).toBe('Alex')
    expect(profile.step).toBe(2)
    expect(JSON.parse(localStorage.getItem('jitter-demo-profile')!).active).toBe(true)
  })

  it('creates distinct persistent projects from a template or blank canvas', () => {
    const blank = createProject()
    const template = createProject(2)
    expect(blank.name).toBe('Untitled animation')
    expect(template.name).toBe('Image Stretch Transition')
    expect(template.color).toBe('#bdd3f1')
    expect(blank.id).not.toBe(template.id)
    expect(projects.value).toHaveLength(2)
    expect(JSON.parse(localStorage.getItem('jitter-demo-projects:')!)).toHaveLength(2)
  })

  it('keeps the app usable and warns when browser storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Storage blocked') })
    expect(() => verifyDemoEmail('creator@example.com')).not.toThrow()
    expect(profile.active).toBe(true)
    expect(storageWarning.value).toContain('storage is unavailable')
  })

  it('retains previous local files when switching between demo emails', () => {
    verifyDemoEmail('first@example.com')
    const original = createProject(1)
    verifyDemoEmail('second@example.com')
    expect(projects.value).toHaveLength(0)
    createProject(2)
    verifyDemoEmail('first@example.com')
    expect(projects.value).toHaveLength(1)
    expect(projects.value[0]?.id).toBe(original.id)
  })
})
