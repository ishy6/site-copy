import { mount } from '@vue/test-utils'
import { effectScope, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useSlides, useSlideSwipe } from './carousel'
import ToolkitCarousel from './ToolkitCarousel.vue'
import StackedGallery from './StackedGallery.vue'
import PricingPlans from './PricingPlans.vue'
import ExpandingNavigation from './ExpandingNavigation.vue'
import TestimonialSlider from './TestimonialSlider.vue'
import { toolkitItems } from './toolkit'
import { showcaseItems } from './showcases'

afterEach(() => vi.useRealTimers())

describe('Osmo core interactions', () => {
  it('normalizes indices and preserves user selection as data grows', async () => {
    const scope = effectScope()
    const length = ref(3)
    const initial = ref(-1)
    const slides = scope.run(() => useSlides(length, initial))!
    expect(slides.index.value).toBe(2)
    slides.select(1)
    length.value = 4
    await nextTick()
    expect(slides.index.value).toBe(1)
    initial.value = 8
    await nextTick()
    expect(slides.index.value).toBe(0)
    slides.onKeydown(new KeyboardEvent('keydown', { key: 'End' }))
    expect(slides.counter.value).toBe('4 / 4')
    length.value = 0
    await nextTick()
    expect(slides.counter.value).toBe('0 / 0')
    scope.stop()
  })

  it('suppresses the pointer click after a swipe while preserving taps and vertical scrolling', () => {
    const move = vi.fn()
    const swipe = useSlideSwipe(move)
    swipe.begin(new PointerEvent('pointerdown', { clientX: 20, clientY: 20, button: 0 }))
    swipe.end(new PointerEvent('pointerup', { clientX: 100, clientY: 25 }))
    expect(move).toHaveBeenCalledWith(-1)
    const click = new MouseEvent('click', { detail: 1, cancelable: true })
    swipe.suppressDraggedClick(click)
    expect(click.defaultPrevented).toBe(true)
    swipe.begin(new PointerEvent('pointerdown', { clientX: 20, clientY: 20, button: 0 }))
    swipe.end(new PointerEvent('pointerup', { clientX: 80, clientY: 120 }))
    expect(move).toHaveBeenCalledTimes(1)
    const tap = new MouseEvent('click', { detail: 1, cancelable: true })
    swipe.suppressDraggedClick(tap)
    expect(tap.defaultPrevented).toBe(false)
  })

  it('keeps toolkit tabs, focus and selection payload in sync', async () => {
    const wrapper = mount(ToolkitCarousel, { attachTo: document.body })
    await wrapper.find('[role="tab"]').trigger('keydown', { key: 'End' })
    expect(document.activeElement).toBe(wrapper.findAll('[role="tab"]')[2]!.element)
    await wrapper.find('.osmo-button').trigger('click')
    expect(wrapper.emitted('select')?.[0]).toEqual([toolkitItems[2]])
    wrapper.unmount()
  })

  it('moves keyboard focus to the visible stacked project', async () => {
    const wrapper = mount(StackedGallery, { attachTo: document.body })
    const first = wrapper.find<HTMLButtonElement>('.active button')
    first.element.focus()
    await first.trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(wrapper.find('.active button').element)
    await wrapper.find('.active button').trigger('click')
    expect(wrapper.emitted('select')?.[0]).toEqual([showcaseItems[1]])
    wrapper.unmount()
  })

  it('uses the selected billing period for both visible pricing and checkout payload', async () => {
    const wrapper = mount(PricingPlans)
    await wrapper.findComponent({ name: 'BillingSwitch' }).find('button').trigger('click')
    expect(wrapper.find('.osmo-pricing__price strong').text()).toBe('€25')
    await wrapper.find('.osmo-button').trigger('click')
    expect(wrapper.emitted('select')?.[0]).toEqual([{ id: 'solo', billing: 'quarterly', monthlyPrice: 25 }])
    wrapper.unmount()
  })

  it('closes navigation with Escape and restores the trigger', async () => {
    const wrapper = mount(ExpandingNavigation, { attachTo: document.body })
    await wrapper.find('.osmo-nav__group button').trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('.osmo-nav__body').exists()).toBe(false)
    expect(document.activeElement).toBe(wrapper.find('[aria-label="Toggle menu"]').element)
    wrapper.unmount()
  })

  it('starts explicit playback while its button retains focus and cleans up timers', async () => {
    vi.useFakeTimers()
    const wrapper = mount(TestimonialSlider, { props: { interval: 1000 }, attachTo: document.body })
    const original = wrapper.find('blockquote p').text()
    await wrapper.trigger('mouseenter')
    wrapper.find<HTMLButtonElement>('[aria-label="Play testimonials"]').element.focus()
    await wrapper.find('[aria-label="Play testimonials"]').trigger('click')
    await vi.advanceTimersByTimeAsync(1000)
    expect(wrapper.find('blockquote p').text()).not.toBe(original)
    await wrapper.find('[aria-label="Pause testimonials"]').trigger('click')
    const paused = wrapper.find('blockquote p').text()
    await vi.advanceTimersByTimeAsync(1000)
    expect(wrapper.find('blockquote p').text()).toBe(paused)
    wrapper.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
