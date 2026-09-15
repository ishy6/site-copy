import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import MotionTile from './MotionTile.vue'
import MotionTimeline from './MotionTimeline.vue'

afterEach(() => vi.restoreAllMocks())

describe('Jitter reusable motion controls', () => {
  it('scrubs the timeline, emits the new time, and clamps it when duration shrinks', async () => {
    const wrapper = mount(MotionTimeline, { props: { autoplay: false, duration: 8 } })
    await wrapper.get('input[type="range"]').setValue('6.5')
    expect(wrapper.emitted('seek')?.at(-1)).toEqual([6.5])
    expect(wrapper.get('output').text()).toContain('06:50')
    await wrapper.setProps({ duration: 2 })
    expect(wrapper.get('output').text()).toContain('02:00')
    await wrapper.get('[aria-label="Reset timeline"]').trigger('click')
    expect(wrapper.emitted('seek')?.at(-1)).toEqual([0])
    expect(wrapper.get('output').text()).toContain('00:00')
    wrapper.unmount()
  })

  it('honors reduced motion on initial playback and allows an explicit play action', async () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() } as unknown as MediaQueryList)
    const wrapper = mount(MotionTimeline)
    expect(wrapper.find('[aria-label="Play animation"]').exists()).toBe(true)
    await wrapper.get('[aria-label="Play animation"]').trigger('click')
    expect(wrapper.find('[aria-label="Pause animation"]').exists()).toBe(true)
    expect(wrapper.emitted('playback-change')?.at(-1)).toEqual([true])
    wrapper.unmount()
  })

  it('keeps video selection independent from playback and exposes retry after an error', async () => {
    const wrapper = mount(MotionTile, { props: { autoplay: false, title: 'Motion study' } })
    await wrapper.get('[aria-label="Select Motion study"]').trigger('click')
    expect(wrapper.emitted('select')).toHaveLength(1)
    await wrapper.get('video').trigger('error')
    expect(wrapper.find('video').exists()).toBe(false)
    expect(wrapper.find('[aria-label="Retry video"]').exists()).toBe(true)
    await wrapper.get('[aria-label="Retry video"]').trigger('click')
    expect(wrapper.find('video').exists()).toBe(true)
    wrapper.unmount()
  })
})
