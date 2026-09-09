import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useHeroParallax } from './useHeroParallax'

let wrapper: VueWrapper
let frameTime: number
let frameId: number
let frames: Map<number, FrameRequestCallback>
let media: Map<string, { matches: boolean; addEventListener: ReturnType<typeof vi.fn>; removeEventListener: ReturnType<typeof vi.fn> }>

function movePointer(clientX: number, clientY: number, pointerType = 'mouse') {
  const event = new MouseEvent('pointermove', { clientX, clientY })
  Object.defineProperty(event, 'pointerType', { value: pointerType })
  window.dispatchEvent(event)
}

function advanceFrames(count = 60) {
  for (let index = 0; index < count; index++) {
    frameTime += 1000 / 60
    const pending = [...frames.values()]
    frames.clear()
    pending.forEach(callback => callback(frameTime))
  }
}

function coordinates() {
  const style = (wrapper.element as HTMLElement).style
  return [Number(style.getPropertyValue('--hero-mouse-x')), Number(style.getPropertyValue('--hero-mouse-y'))]
}

beforeEach(async () => {
  frameTime = 0
  frameId = 0
  frames = new Map()
  media = new Map()
  vi.stubGlobal('innerWidth', 1280)
  vi.stubGlobal('innerHeight', 720)
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
    frames.set(++frameId, callback)
    return frameId
  }))
  vi.stubGlobal('cancelAnimationFrame', vi.fn((id: number) => frames.delete(id)))
  vi.stubGlobal('matchMedia', vi.fn((query: string) => {
    const result = { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }
    media.set(query, result)
    return result
  }))
  wrapper = mount(defineComponent({
    setup() {
      const hero = ref<HTMLElement | null>(null)
      useHeroParallax(hero)
      return () => h('section', { ref: hero })
    },
  }))
  await nextTick()
})

afterEach(() => {
  wrapper.unmount()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('hero card pointer parallax', () => {
  it('uses viewport coordinates and keeps responding below the hero', () => {
    movePointer(200, 550)
    advanceFrames()
    expect(coordinates()[0]).toBeCloseTo(-0.6875, 4)
    expect(coordinates()[1]).toBeCloseTo(0.5277778, 4)
    expect(frames.size).toBe(0)
  })

  it('eases both axes and coalesces rapid pointer events into one frame', () => {
    movePointer(1100, 150)
    movePointer(1280, 0)
    expect(frames.size).toBe(1)
    expect(coordinates()).toEqual([0, 0])
    advanceFrames(1)
    expect(coordinates()[0]).toBeCloseTo(0.15)
    expect(coordinates()[1]).toBeCloseTo(-0.15)
    advanceFrames()
    expect(coordinates()).toEqual([1, -1])
    movePointer(640, 360)
    advanceFrames()
    expect(coordinates()).toEqual([0, 0])
  })

  it('does not snap back when the pointer leaves the hero element', async () => {
    movePointer(1100, 150)
    advanceFrames()
    const before = coordinates()
    await wrapper.trigger('pointerleave')
    advanceFrames()
    expect(coordinates()).toEqual(before)
  })

  it('ignores touch input, compact viewports and reduced-motion preferences', () => {
    movePointer(1100, 150, 'touch')
    expect(frames.size).toBe(0)
    media.get('(max-width: 900px)')!.matches = true
    movePointer(1100, 150)
    expect(frames.size).toBe(0)
    media.get('(max-width: 900px)')!.matches = false
    media.get('(prefers-reduced-motion: reduce)')!.matches = true
    movePointer(1100, 150)
    expect(frames.size).toBe(0)
  })

  it('resets motion when preferences change and releases listeners on unmount', () => {
    movePointer(1100, 150)
    advanceFrames(1)
    const preference = media.get('(prefers-reduced-motion: reduce)')!
    preference.matches = true
    preference.addEventListener.mock.calls[0]![1]()
    expect(coordinates()).toEqual([0, 0])
    expect(frames.size).toBe(0)
    preference.matches = false
    movePointer(1100, 150)
    wrapper.unmount()
    expect(frames.size).toBe(0)
    expect(preference.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    movePointer(1100, 150)
    expect(frames.size).toBe(0)
  })
})
