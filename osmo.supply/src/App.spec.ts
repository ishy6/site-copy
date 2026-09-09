// @vitest-environment happy-dom

import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import App from './App.vue'

const stylesheet = readFileSync(resolve(process.cwd(), 'src/style.css'), 'utf8')

class IntersectionObserverMock {
  static instances: IntersectionObserverMock[] = []
  readonly elements: Element[] = []
  constructor(private callback: IntersectionObserverCallback) { IntersectionObserverMock.instances.push(this) }
  readonly root = null
  readonly rootMargin = '0px'
  readonly thresholds = [0]

  observe(element: Element) {
    this.elements.push(element)
    element.classList.add('is-visible')
    this.callback([{ target: element, isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
  }

  setVisible(element: Element, visible: boolean) {
    this.callback([{ target: element, isIntersecting: visible } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
  }

  disconnect() {}
  unobserve() {}
  takeRecords() { return [] }
}

let wrapper: VueWrapper | undefined

function stubReducedMotion(matches: boolean, footerMobile = false) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)'
        ? matches
        : query === '(max-width: 800px)' && footerMobile,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

function renderApp() {
  wrapper = mount(App, { attachTo: document.body })
  return wrapper
}

async function flushUi() {
  await nextTick()
  await nextTick()
}

async function fillNewsletter(page: VueWrapper) {
  await page.get<HTMLInputElement>('#newsletter-name').setValue(' Dennis ')
  await page.get<HTMLInputElement>('#newsletter-email').setValue('dennis@example.com')
  await page.get<HTMLInputElement>('.check-field input').setValue(true)
}

beforeEach(() => {
  IntersectionObserverMock.instances = []
  vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)
  stubReducedMotion(false)
  Object.defineProperty(HTMLMediaElement.prototype, 'play', {
    configurable: true,
    value: vi.fn().mockResolvedValue(undefined),
  })
  Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    value: vi.fn(),
  })
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  vi.useRealTimers()
  document.body.className = ''
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('Osmo homepage contracts', () => {
  it('expands the existing navigation without replacing its toggle or wordmark', async () => {
    const page = renderApp()
    const navigation = page.get('.site-nav').element
    const toggle = page.get('[aria-label="Open menu"]').element
    const logo = page.get('.site-nav .brand-wordmark').element
    expect(page.get('.menu-expansion').attributes('inert')).toBeDefined()
    for (let cycle = 0; cycle < 3; cycle++) {
      await page.get('[aria-label="Open menu"]').trigger('click')
      await flushUi()
      expect(page.get('#site-menu').element).toBe(page.get('.header-shell').element)
      expect(page.get('.site-nav').element).toBe(navigation)
      expect(page.get('[aria-label="Close menu"]').element).toBe(toggle)
      expect(page.get('.site-nav .brand-wordmark').element).toBe(logo)
      expect(page.get('.menu-expansion').attributes('inert')).toBeUndefined()
      await page.get('[aria-label="Close menu"]').trigger('click')
      await flushUi()
      expect(page.get('.menu-expansion').attributes('inert')).toBeDefined()
      expect(page.get('.site-nav').element).toBe(navigation)
    }
  })

  it('keeps both vertical cursor arrows mounted while the pointer changes direction', async () => {
    const page = renderApp()
    await flushUi()
    const arrows = page.findAll('.motion-cursor__arrows svg').map((arrow) => arrow.element)
    expect(arrows).toHaveLength(2)
    await page.get('.latest-capsule [data-motion-cursor="previous"]').trigger('pointermove', { pointerType: 'mouse', clientX: 500, clientY: 100 })
    expect(page.get('.motion-cursor').attributes('data-direction')).toBe('previous')
    await page.get('.quote-panel [data-motion-cursor="next"]').trigger('pointermove', { pointerType: 'mouse', clientX: 500, clientY: 300 })
    expect(page.get('.motion-cursor').attributes('data-direction')).toBe('next')
    expect(page.findAll('.motion-cursor__arrows svg').map((arrow) => arrow.element)).toEqual(arrows)
    expect(page.get('.latest-capsule [data-motion-cursor="previous"] svg').classes()).toContain('lucide-arrow-up')
    expect(page.get('.quote-panel [data-motion-cursor="next"] svg').classes()).toContain('lucide-arrow-down')
  })

  it('uses text-only pricing buttons and larger rotation origins for full-width CTAs', () => {
    const page = renderApp()
    expect(page.findAll('.price-card > a > svg')).toHaveLength(0)
    expect(page.find('.pricing-link > svg').exists()).toBe(false)
    const soloLabel = page.get('.price-card > a .button-roll')
    expect(soloLabel.attributes('style')).toContain('--roll-origin: 9480%')
    expect(page.get('.pricing-link .button-roll').attributes('style')).toContain('--roll-origin: 3520%')
    expect(page.get('.platform-content').find('.dashboard-frame').exists()).toBe(true)
    expect(page.get('.platform-content').find('.platform-foot').exists()).toBe(true)
  })

  it('uses the source full-width button duration and respects reduced motion', async () => {
    const page = renderApp()
    await flushUi()
    const animate = vi.fn().mockReturnValue({ cancel: vi.fn() })
    const fullButton = page.get('.price-card > a')
    const normalButton = page.get('.pricing-link')
    for (const label of [...fullButton.findAll('.button-roll__label'), ...normalButton.findAll('.button-roll__label')]) {
      Object.defineProperty(label.element, 'animate', { configurable: true, value: animate })
    }
    await fullButton.trigger('pointerenter')
    expect(animate).toHaveBeenCalledTimes(2)
    expect(animate.mock.calls[0]?.[1]).toEqual({ duration: 750, delay: 0, easing: 'cubic-bezier(.625,.05,0,1)', fill: 'forwards' })
    expect(animate.mock.calls[1]?.[1]).toEqual({ duration: 750, delay: 75, easing: 'cubic-bezier(.625,.05,0,1)', fill: 'forwards' })
    await normalButton.trigger('pointerenter')
    expect(animate.mock.calls[2]?.[1]).toEqual({ duration: 500, delay: 0, easing: 'cubic-bezier(.625,.05,0,1)', fill: 'forwards' })
    stubReducedMotion(true)
    await fullButton.trigger('pointerenter')
    expect(animate).toHaveBeenCalledTimes(4)
  })

  it('does not restart button rotation on rapid re-entry or pointer and focus overlap', async () => {
    const page = renderApp()
    const button = page.get('.pricing-link')
    const cancel = vi.fn()
    let finish: () => void = () => {}
    const finished = new Promise<void>((resolve) => { finish = resolve })
    const animate = vi.fn().mockReturnValue({ cancel, playState: 'running', pending: false, finished })
    for (const label of button.findAll('.button-roll__label')) {
      Object.defineProperty(label.element, 'animate', { configurable: true, value: animate })
    }
    await button.trigger('pointerenter')
    await button.trigger('focusin')
    await button.trigger('pointerleave')
    await button.trigger('pointerenter')
    expect(animate).toHaveBeenCalledTimes(2)
    expect(cancel).not.toHaveBeenCalled()
    finish()
    await flushUi()
    expect(cancel).toHaveBeenCalledTimes(2)
    await button.trigger('pointerenter')
    expect(animate).toHaveBeenCalledTimes(4)
  })

  it('uses shared motion for text controls and modal action buttons', async () => {
    const page = renderApp()
    for (const selector of ['.nav-menu-button', '.menu-mobile-actions a', '.product-tabs button', '.billing-switch button', '.price-benefits a', '.footer-group-toggle', '.footer-actions > a']) {
      expect(page.findAll(selector).every((button) => button.find('.button-roll').exists())).toBe(true)
    }
    await page.get('button[data-modal-trigger="about"]').trigger('click')
    await flushUi()
    expect(page.findAll('.about-actions a').every((button) => button.find('.button-roll').exists())).toBe(true)
    expect(page.get('.modal-close').find('.button-roll').exists()).toBe(true)
  })

  it('starts nested button labels from their interactive parent and cancels on unmount', async () => {
    const page = renderApp()
    const button = page.get('.menu-feature')
    const cancel = vi.fn()
    const animate = vi.fn().mockReturnValue({ cancel, playState: 'running', finished: new Promise(() => {}) })
    for (const label of button.findAll('.button-roll__label')) {
      Object.defineProperty(label.element, 'animate', { configurable: true, value: animate })
    }
    await button.trigger('focusin')
    expect(animate).toHaveBeenCalledTimes(2)
    page.unmount()
    wrapper = undefined
    expect(cancel).toHaveBeenCalledTimes(2)
  })

  it('does not animate disabled text buttons', async () => {
    const page = renderApp()
    const button = page.get<HTMLButtonElement>('.newsletter button[type="submit"]')
    const animate = vi.fn()
    for (const label of button.findAll('.button-roll__label')) {
      Object.defineProperty(label.element, 'animate', { configurable: true, value: animate })
    }
    button.element.disabled = true
    await button.trigger('pointerenter')
    expect(animate).not.toHaveBeenCalled()
  })

  it('retains reveal visibility through repeated product drags and cancellation', async () => {
    vi.useFakeTimers()
    const page = renderApp()
    await flushUi()
    const stage = page.get<HTMLElement>('.product-stage')
    vi.spyOn(stage.element, 'setPointerCapture').mockImplementation(() => {})
    vi.spyOn(stage.element, 'hasPointerCapture').mockReturnValue(false)
    for (let pointerId = 1; pointerId <= 14; pointerId++) {
      await stage.trigger('pointerdown', { button: 0, pointerId, clientX: 500, clientY: 200 })
      await stage.trigger('pointermove', { pointerId, clientX: 150, clientY: 200 })
      expect(stage.attributes('data-revealed')).toBe('true')
      await stage.trigger('pointerup', { pointerId, clientX: 150, clientY: 200 })
      vi.advanceTimersByTime(1000)
      await flushUi()
      expect(stage.attributes('data-revealed')).toBe('true')
      expect(page.findAll('.product-feature:not(.is-outside)').length).toBeGreaterThanOrEqual(3)
      expect(page.get('.product-feature--active').classes()).not.toContain('is-outside')
    }
    await stage.trigger('pointerdown', { button: 0, pointerId: 20, clientX: 500, clientY: 200 })
    await stage.trigger('pointermove', { pointerId: 20, clientX: 200, clientY: 200 })
    await stage.trigger('lostpointercapture', { pointerId: 20 })
    vi.advanceTimersByTime(1000)
    await flushUi()
    expect(stage.classes()).not.toContain('is-dragging')
    expect(stage.attributes('data-revealed')).toBe('true')
  })

  it('keeps showcase nodes mounted, follows dragging, and suppresses the release click', async () => {
    vi.useFakeTimers()
    const page = renderApp()
    await flushUi()
    const stage = page.get<HTMLElement>('.showcase-stage')
    const cards = page.findAll('.showcase-stage > article').map((card) => card.element)
    vi.spyOn(stage.element, 'setPointerCapture').mockImplementation(() => {})
    vi.spyOn(stage.element, 'hasPointerCapture').mockReturnValue(false)
    const before = page.get('.showcase-stage > article').attributes('style')
    await stage.trigger('pointerdown', { button: 0, pointerId: 1, clientX: 500, clientY: 200 })
    await stage.trigger('pointermove', { pointerId: 1, clientX: 200, clientY: 200 })
    expect(page.get('.showcase-stage > article').attributes('style')).not.toBe(before)
    await stage.trigger('pointerup', { pointerId: 1, clientX: 200, clientY: 200 })
    await page.get('.showcase-stage .is-active .showcase-card-trigger').trigger('click')
    expect(page.find('[role="dialog"]').exists()).toBe(false)
    vi.advanceTimersByTime(1000)
    await flushUi()
    expect(page.findAll('.showcase-stage > article').map((card) => card.element)).toEqual(cards)
    expect(stage.attributes('data-revealed')).toBe('true')
    expect(page.get('.showcase-controls > span').text()).toBe('02 / 07')
    await page.get('.showcase-stage .is-active .showcase-card-trigger').trigger('click')
    expect(page.find('[aria-label="showcase dialog"]').exists()).toBe(true)
  })

  it('uses directional hit areas for updates and quotes and preserves footer glyphs', async () => {
    const page = renderApp()
    await flushUi()
    await page.get('.latest-capsule [data-motion-cursor="previous"]').trigger('click')
    expect(page.get('.latest-capsule').attributes('style')).toContain('--slide-direction: -1')
    expect(page.get('.latest-capsule__copy strong').text()).toBe('Interactive Dots Grid (Background)')
    await page.get('.quote-panel [data-motion-cursor="previous"]').trigger('click')
    expect(page.get('.quote-panel').attributes('style')).toContain('--slide-direction: -1')
    expect(page.get('.quote-controls > span').text()).toBe('6 / 6')
    expect(page.findAll('.footer-wordmark path')).toHaveLength(7)
    expect(page.findAll('.level-ring')).toHaveLength(3)
    expect(page.findAll('.level-type--counter')).toHaveLength(1)
  })

  it('keeps the hero decorative rather than hover-paused or draggable', async () => {
    const page = renderApp()
    await flushUi()
    const deck = page.get('.hero-deck')
    await deck.trigger('pointerdown', { pointerId: 1, clientX: 100 })
    await deck.trigger('pointermove', { pointerId: 1, clientX: 400 })
    expect(deck.classes()).not.toContain('dragging')
    expect(deck.attributes('style')).toBeUndefined()
    expect(page.findAll('.hero-card')).toHaveLength(18)
  })

  it('pauses offscreen carousels and resumes them without skipping slides', async () => {
    vi.useFakeTimers()
    const page = renderApp()
    await flushUi()
    const capsule = page.get('.latest-capsule').element
    const observer = IntersectionObserverMock.instances.find((instance) => instance.elements.includes(capsule))!
    observer.setVisible(capsule, false)
    vi.advanceTimersByTime(9000)
    await flushUi()
    expect(page.get('.latest-capsule__copy strong').text()).toBe('Interactive Line Graph (SVG)')
    observer.setVisible(capsule, true)
    await page.get('.latest-section').trigger('mouseenter')
    vi.advanceTimersByTime(3000)
    await flushUi()
    expect(page.get('.latest-capsule__copy strong').text()).toBe('Infinite Dome Grid')
  })

  it('switches concentric portrait layers in sequence and opens about from the portrait', async () => {
    vi.useFakeTimers()
    const page = renderApp()
    await flushUi()
    expect(page.findAll('.creator-layer')).toHaveLength(3)
    vi.advanceTimersByTime(1800)
    await flushUi()
    expect(page.get('.creator-layer--2 .is-active').attributes('src')).toContain('ilja')
    expect(page.get('.creator-layer--0 .is-active').attributes('src')).toContain('dennis')
    await page.get('.creator-portraits').trigger('click')
    expect(page.find('[role="dialog"]').exists()).toBe(true)
  })

  it('moves the map and its highlight together and resets the progress on navigation', async () => {
    vi.useFakeTimers()
    const page = renderApp()
    await flushUi()
    expect(page.get('.globe-map').attributes('style')).toContain('translate(-80%, -40%) scale(3)')
    vi.advanceTimersByTime(2000)
    await flushUi()
    expect(Number(page.get('.globe-progress circle:last-child').attributes('stroke-dashoffset'))).toBeCloseTo(-0.5)
    await page.get('button[title="Next testimonial"]').trigger('click')
    expect(page.get('.globe-map').attributes('style')).toContain('translate(15%, 25%) scale(4)')
    expect(page.get('.globe-country.is-active').attributes('src')).toContain('map-uk.svg')
    expect(page.get('.globe-progress circle:last-child').attributes('stroke-dashoffset')).toBe('0')
  })
  it('opens and closes the source-shaped menu and restores focus', async () => {
    const page = renderApp()
    const opener = page.get<HTMLButtonElement>('button[aria-label="Open menu"]')
    opener.element.focus()

    await opener.trigger('click')
    await flushUi()

    const menu = page.get('#site-menu')
    expect(menu.attributes('role')).toBe('dialog')
    expect(menu.text()).toContain('The Vault')
    expect(menu.text()).toContain('Page Transition Course')
    expect(menu.text()).toContain('Osmo Showcase')
    expect(menu.get('a[href="https://www.osmo.supply/collection"]').attributes('href')).toBe('https://www.osmo.supply/collection')
    expect(document.body.classList.contains('is-locked')).toBe(true)
    expect(document.activeElement).toBe(menu.get('button[aria-label="Close menu"]').element)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushUi()

    expect(page.find('#site-menu').exists()).toBe(false)
    expect(document.body.classList.contains('is-locked')).toBe(false)
    expect(document.activeElement).toBe(opener.element)
  })

  it('closes the menu from its backdrop and restores focus', async () => {
    const page = renderApp()
    const opener = page.get<HTMLButtonElement>('button[aria-label="Open menu"]')
    opener.element.focus()

    await opener.trigger('click')
    await flushUi()
    await page.get('.menu-layer').trigger('mousedown')
    await flushUi()

    expect(page.find('#site-menu').exists()).toBe(false)
    expect(document.body.classList.contains('is-locked')).toBe(false)
    expect(document.activeElement).toBe(opener.element)
  })

  it('opens the complete About dialog and closes it with Escape', async () => {
    const page = renderApp()
    const opener = page.get<HTMLButtonElement>('button[data-modal-trigger="about"]')
    opener.element.focus()

    await opener.trigger('click')
    await flushUi()

    const dialog = page.get('[role="dialog"][aria-label="about dialog"]')
    expect(dialog.text()).toContain('A platform by...')
    expect(dialog.text()).toContain('Dennis')
    expect(dialog.text()).toContain('Ilja')
    expect(dialog.text()).toContain('120+')
    expect(dialog.text()).toContain('38')
    expect(dialog.findAll('.about-gallery img')).toHaveLength(3)
    expect(dialog.get('[data-modal-close="about"]').attributes('title')).toBe('Close')

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushUi()

    expect(page.find('[aria-label="about dialog"]').exists()).toBe(false)
    expect(document.activeElement).toBe(opener.element)
  })

  it('opens the fullscreen Reel, exposes playback controls, and stops on close', async () => {
    const page = renderApp()
    const opener = page.get<HTMLButtonElement>('[data-player-control-open="reel"]')
    opener.element.focus()

    await opener.trigger('click')
    await flushUi()

    const dialog = page.get('[role="dialog"][aria-label="reel dialog"]')
    expect(dialog.get('video source').attributes('src')).toContain('Osmo-V12-Reel-Tiny_compressed-transcode.mp4')
    expect(dialog.get('[data-player-control-toggle="reel"]').attributes('title')).toBe('Pause reel')

    await dialog.get('.reel-canvas').trigger('click')
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled()
    expect(dialog.get('[data-player-control-toggle="reel"]').attributes('title')).toBe('Play reel')

    await dialog.get('.reel-canvas').trigger('click')
    await flushPromises()
    expect(dialog.get('[data-player-control-toggle="reel"]').attributes('title')).toBe('Pause reel')

    const mute = dialog.get<HTMLButtonElement>('[data-player-control-mute="reel"]')
    expect(mute.attributes('title')).toBe('Mute reel')
    await mute.trigger('click')
    expect(mute.attributes('title')).toBe('Unmute reel')
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled()

    await dialog.get('[data-player-control-close="reel"]').trigger('click')
    await flushUi()

    expect(page.find('[aria-label="reel dialog"]').exists()).toBe(false)
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled()
    expect(document.activeElement).toBe(opener.element)
  })

  it('restores focus to the current trigger after opening About and then Reel', async () => {
    const page = renderApp()
    const aboutOpener = page.get<HTMLButtonElement>('button[data-modal-trigger="about"]')
    const reelOpener = page.get<HTMLButtonElement>('[data-player-control-open="reel"]')

    aboutOpener.element.focus()
    await aboutOpener.trigger('click')
    await flushUi()
    await page.get('[data-modal-close="about"]').trigger('click')
    await flushUi()
    expect(document.activeElement).toBe(aboutOpener.element)

    reelOpener.element.focus()
    await reelOpener.trigger('click')
    await flushPromises()
    await page.get('[data-player-control-close="reel"]').trigger('click')
    await flushUi()
    expect(document.activeElement).toBe(reelOpener.element)
  })

  it('shows the Play state when browser autoplay rejects', async () => {
    vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(new DOMException('Autoplay blocked'))
    const page = renderApp()

    await page.get('[data-player-control-open="reel"]').trigger('click')
    await flushPromises()
    await flushUi()

    expect(page.get('[data-player-control-toggle="reel"]').attributes('title')).toBe('Play reel')
  })

  it('does not autoplay either reel video when reduced motion is requested', async () => {
    stubReducedMotion(true)
    const page = renderApp()
    const preview = page.get<HTMLVideoElement>('.reel-player__preview video')

    expect(preview.attributes('autoplay')).toBeUndefined()
    expect(preview.element.autoplay).toBe(false)

    await page.get('[data-player-control-open="reel"]').trigger('click')
    await flushPromises()
    await flushUi()

    const dialog = page.get('[role="dialog"][aria-label="reel dialog"]')
    const video = dialog.get<HTMLVideoElement>('video')
    expect(video.attributes('autoplay')).toBeUndefined()
    expect(video.element.autoplay).toBe(false)
    expect(dialog.get('[data-player-control-toggle="reel"]').attributes('title')).toBe('Play reel')
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled()
  })

  it('opens the source-shaped Showcase resources dialog and restores focus on Escape', async () => {
    const page = renderApp()
    const opener = page.get<HTMLButtonElement>('.showcase-card-trigger')
    opener.element.focus()

    await opener.trigger('click')
    await flushUi()

    const dialog = page.get('[role="dialog"][aria-label="showcase dialog"]')
    expect(dialog.get('h2').text()).toBe('Nick Ho')
    expect(dialog.findAll('.showcase-modal__authors a')).toHaveLength(2)
    expect(dialog.findAll('.used-resource-card')).toHaveLength(7)
    expect(dialog.text()).toContain('Number Odometer')
    expect(dialog.get('img[src*="radial-cards-slider-gsap"]').attributes('src')).toBe('https://osmo.b-cdn.net/resource-img/radial-cards-slider-gsap-1440x900-v2.avif')
    expect(dialog.get('.showcase-modal__actions a').attributes('href')).toBe('https://nickho-motorsports.nl/')
    expect(dialog.get('.showcase-modal__actions a:first-child svg').classes()).toContain('lucide-arrow-up-right')

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushUi()

    expect(page.find('[aria-label="showcase dialog"]').exists()).toBe(false)
    expect(document.activeElement).toBe(opener.element)
  })

  it('closes a modal from its backdrop and releases the page lock', async () => {
    const page = renderApp()
    const opener = page.get<HTMLButtonElement>('.showcase-card-trigger')
    opener.element.focus()

    await opener.trigger('click')
    await flushUi()
    expect(document.body.classList.contains('is-locked')).toBe(true)

    await page.get('.modal-layer').trigger('mousedown')
    await flushUi()

    expect(page.find('[aria-label="showcase dialog"]').exists()).toBe(false)
    expect(document.body.classList.contains('is-locked')).toBe(false)
    expect(document.activeElement).toBe(opener.element)
  })

  it('shows all seven showcase positions and wraps in both directions', async () => {
    const page = renderApp()
    const counter = page.get('.showcase-controls > span')
    expect(counter.text()).toBe('01 / 07')
    expect(page.get('.showcase-card-trigger').attributes('aria-label')).toBe('View resources used on Nick Ho')

    await page.get('button[title="Previous project"]').trigger('click')
    await flushUi()
    expect(counter.text()).toBe('07 / 07')
    expect(page.get('.showcase-stage .is-active .showcase-card-trigger').attributes('aria-label')).toBe('View resources used on a-lign studio')

    await page.get('button[title="Next project"]').trigger('click')
    await flushUi()
    expect(counter.text()).toBe('01 / 07')
    expect(page.get('.showcase-card-trigger').attributes('aria-label')).toBe('View resources used on Nick Ho')
  })

  it('cycles testimonials and exposes all six entries through the counter', async () => {
    const page = renderApp()
    expect(page.get('.quote-controls > span').text()).toBe('1 / 6')
    expect(page.get('.quote-panel h2').text()).toContain('creative challenge')

    await page.get('button[title="Next testimonial"]').trigger('click')
    await flushUi()

    expect(page.get('.quote-controls > span').text()).toBe('2 / 6')
    expect(page.get('.quote-panel h2').text()).toContain('GSAP stamp of approval')

    await page.get('button[title="Previous testimonial"]').trigger('click')
    await flushUi()
    expect(page.get('.quote-controls > span').text()).toBe('1 / 6')
  })

  it.each([
    ['latest updates', '.latest-capsule__controls', '.latest-capsule__copy strong', 3000, 'Infinite Dome Grid'],
    ['testimonials', '.quote-controls', '.quote-panel h2', 4000, 'GSAP stamp of approval'],
  ])('keeps the %s carousel paused until both hover and keyboard focus have left', async (_name, sectionSelector, contentSelector, interval, nextContent) => {
    vi.useFakeTimers()
    const page = renderApp()
    await flushUi()
    const section = page.get<HTMLElement>(sectionSelector)
    const initialContent = page.get(contentSelector).text()

    await section.trigger('mouseenter')
    await section.trigger('focusin')
    await section.trigger('mouseleave')
    vi.advanceTimersByTime(interval)
    await flushUi()
    expect(page.get(contentSelector).text()).toBe(initialContent)

    await section.trigger('mouseenter')
    await section.trigger('focusout', { relatedTarget: null })
    vi.advanceTimersByTime(interval)
    await flushUi()
    expect(page.get(contentSelector).text()).toBe(initialContent)

    await section.trigger('mouseleave')
    vi.advanceTimersByTime(interval)
    await flushUi()
    expect(page.get(contentSelector).text()).toContain(nextContent)
  })

  it('uses the current live-site resources and community artwork', () => {
    const page = renderApp()
    expect(page.get('.latest-capsule__copy strong').text()).toBe('Interactive Line Graph (SVG)')
    expect(page.get('.latest-capsule__copy small').text()).toContain('Earlier today')
    expect(page.get('.latest-capsule__copy em').text()).toBe('Dropdowns & Information')
    expect(page.get('.latest-community-proof').text()).toContain('Join 3K+ others')
    expect(page.findAll('.latest-community-proof img')).toHaveLength(4)
    expect(page.get('.latest-credit').attributes('src')).toContain('osmo-micrographic-1.avif')
    expect(page.findAll('.globe-country')).toHaveLength(6)
    expect(page.findAll('.globe-country.is-active')).toHaveLength(1)
    expect(page.get('.globe-country').attributes('src')).toContain('map-vnm.svg')
  })

  it('keeps FAQ as a source link rather than an invented homepage section', () => {
    const page = renderApp()
    expect(page.find('section.faq-section').exists()).toBe(false)
    expect(page.get('a[href="https://www.osmo.supply/faq"]').text()).toContain('FAQs')
  })

  it('exposes desktop footer groups as expanded without adding inert toggles to the tab order', () => {
    const page = renderApp()
    const toggles = page.findAll<HTMLButtonElement>('.footer-group-toggle')
    expect(toggles.map((toggle) => toggle.attributes('aria-expanded'))).toEqual(['true', 'true', 'true'])
    expect(toggles.map((toggle) => toggle.attributes('tabindex'))).toEqual(['-1', '-1', '-1'])
    expect(page.findAll('.footer-group.open')).toHaveLength(3)
  })

  it('matches the mobile footer accordion defaults and exposes all product links', async () => {
    stubReducedMotion(false, true)
    const page = renderApp()
    const toggles = page.findAll<HTMLButtonElement>('.footer-group-toggle')
    expect(toggles.map((toggle) => toggle.attributes('aria-expanded'))).toEqual(['false', 'false', 'true'])
    expect(toggles.map((toggle) => toggle.attributes('tabindex'))).toEqual(['0', '0', '0'])
    expect(page.findAll('#footer-products > *')).toHaveLength(6)
    expect(page.get('[data-o-support="1"]').text()).toBe('Support')

    await toggles[0]?.trigger('click')
    await flushUi()

    expect(toggles.map((toggle) => toggle.attributes('aria-expanded'))).toEqual(['true', 'false', 'false'])
  })

  it('uses source-site destinations for navigation and membership actions', () => {
    const page = renderApp()
    expect(page.get('.nav-login').attributes('href')).toBe('https://www.osmo.supply/login')
    expect(page.get('.nav-join').attributes('href')).toBe('https://www.osmo.supply/plans')
    expect(page.get('.showcase-ticker').attributes('href')).toBe('https://www.osmo.supply/showcase')
    expect(page.get('a[href="https://www.osmo.supply/product/vault"]').attributes('href')).toBe('https://www.osmo.supply/product/vault')
    expect(page.get('a[href="https://www.osmo.supply/product/page-transition-course"]').attributes('href')).toBe('https://www.osmo.supply/product/page-transition-course')
    expect(page.get('.latest-capsule__card').element.tagName).toBe('DIV')
    expect(page.get('.check-field__label a').attributes('href')).toBe('https://www.osmo.supply/legal/privacy-policy')

    const internalRouteLinks = page.findAll('a[href]').filter((link) => {
      const href = link.attributes('href') ?? ''
      return href.startsWith('/') && !href.startsWith('/assets/')
    })
    expect(internalRouteLinks).toHaveLength(0)
    expect(page.text()).not.toContain('local replica')
    expect(page.text()).not.toContain('demo plan')
  })

  it('updates official plan destinations and prices with the billing period', async () => {
    const page = renderApp()
    const planLinks = page.findAll('.price-card > a')
    expect(planLinks[0]?.attributes('href')).toBe('https://www.osmo.supply/plans/subscription?type=annual')
    expect(planLinks[1]?.attributes('href')).toBe('https://www.osmo.supply/plans/team-subscription?type=annual')
    expect(page.findAll('.price strong').map((price) => price.text())).toEqual(['20', '16'])
    expect(page.findAll('.price del').map((price) => price.text())).toEqual(['25', '20'])
    expect(page.findAll('.price-benefits strong').map((count) => count.text())).toEqual(['212', '212'])
    expect(page.findAll('.price-benefits')).toHaveLength(2)

    await page.get('.billing-switch button:first-child').trigger('click')
    await flushUi()

    expect(planLinks[0]?.attributes('href')).toBe('https://www.osmo.supply/plans/subscription?type=quarterly')
    expect(planLinks[1]?.attributes('href')).toBe('https://www.osmo.supply/plans/team-subscription?type=quarterly')
    expect(page.findAll('.price strong').map((price) => price.text())).toEqual(['25', '20'])
    expect(page.get('.price-sticker').text()).toContain('20% per user!')
    expect(page.findAll('.price del')).toHaveLength(0)

    await page.get('.billing-switch button:nth-child(2)').trigger('click')
    await flushUi()
    expect(page.findAll('.price strong').map((price) => price.text())).toEqual(['20', '16'])
    expect(planLinks[0]?.attributes('href')).toBe('https://www.osmo.supply/plans/subscription?type=annual')
    expect(planLinks[1]?.attributes('href')).toBe('https://www.osmo.supply/plans/team-subscription?type=annual')
    expect(page.findAll('.price-card > p').every((description) => description.text().includes('annually'))).toBe(true)
  })

  it('renders the full showcase stack and mobile-only navigation actions', async () => {
    const page = renderApp()
    expect(page.findAll('.showcase-stage > article')).toHaveLength(7)
    expect(page.findAll('.showcase-stage > article[inert]')).toHaveLength(6)

    await page.get('button[aria-label="Open menu"]').trigger('click')
    await flushUi()

    const menu = page.get('#site-menu')
    expect(menu.get('.menu-explore').text()).toContain('Osmo Showcase')
    expect(menu.get('.menu-explore').text()).toContain('Collection')
    expect(menu.get('.menu-explore').text()).toContain('Pricing')
    expect(menu.findAll('.menu-mobile-actions a')).toHaveLength(2)
    expect(menu.get('.menu-mobile-actions').text()).toContain('Member Login')
    expect(menu.get('.menu-mobile-actions').text()).toContain('Join Osmo')
  })

  it('keeps Easings visibly unavailable instead of exposing a fake link', async () => {
    const page = renderApp()
    await page.get('[role="tab"]:nth-child(4)').trigger('click')
    await flushUi()

    const easingsPanel = page.get('[role="tabpanel"]')
    expect(easingsPanel.get('h3').text()).toBe('Easings')
    expect(easingsPanel.find('a').exists()).toBe(false)
    expect(page.get('.footer-disabled').text()).toContain('Easings')

    await page.get('button[aria-label="Open menu"]').trigger('click')
    await flushUi()
    const menuEasings = page.get('.menu-minor-links .is-muted')
    expect(menuEasings.text()).toContain('Easings')
    expect(menuEasings.element.tagName).toBe('SPAN')
  })

  it('keeps links in inactive product cards out of the keyboard tab order', async () => {
    const page = renderApp()
    expect(page.get('.product-feature--active a').attributes('tabindex')).toBeUndefined()
    expect(page.findAll('.product-feature[aria-hidden="true"] a').every((link) => link.attributes('tabindex') === '-1')).toBe(true)

    await page.get('[role="tab"]:nth-child(2)').trigger('click')
    await flushUi()

    expect(page.get('.product-feature--active a').attributes('href')).toBe('https://www.osmo.supply/product/page-transition-course')
    expect(page.get('.product-feature--active a').attributes('tabindex')).toBeUndefined()
    expect(page.findAll('.product-feature[aria-hidden="true"] a').every((link) => link.attributes('tabindex') === '-1')).toBe(true)
  })

  it('captures carousel pointers only after a real drag so nested controls remain clickable', async () => {
    const page = renderApp()
    const productStage = page.get<HTMLElement>('.product-stage')
    let productHasCapture = false
    const productCapture = vi.spyOn(productStage.element, 'setPointerCapture').mockImplementation(() => { productHasCapture = true })
    const productRelease = vi.spyOn(productStage.element, 'releasePointerCapture').mockImplementation(() => { productHasCapture = false })
    vi.spyOn(productStage.element, 'hasPointerCapture').mockImplementation(() => productHasCapture)
    const productLink = page.get<HTMLAnchorElement>('.product-feature--active a')

    await productLink.trigger('pointerdown', { button: 0, clientX: 200, pointerId: 7 })
    expect(productCapture).not.toHaveBeenCalled()
    await productLink.trigger('pointerup', { button: 0, clientX: 200, pointerId: 7 })
    expect(productRelease).not.toHaveBeenCalled()

    await productStage.trigger('pointerdown', { button: 0, clientX: 200, pointerId: 8 })
    await productStage.trigger('pointermove', { button: 0, clientX: 180, pointerId: 8 })
    expect(productCapture).toHaveBeenCalledWith(8)
    expect(productStage.classes()).toContain('is-dragging')
    expect(page.get('.product-feature--active').attributes('style')).not.toContain('--product-angle: 0deg')
    await productStage.trigger('pointerup', { button: 0, clientX: 130, pointerId: 8 })
    expect(productRelease).toHaveBeenCalledWith(8)
    expect(page.get('[role="tab"]:nth-child(2)').attributes('aria-selected')).toBe('true')
    expect(productStage.classes()).not.toContain('is-dragging')

    const showcaseStage = page.get<HTMLElement>('.showcase-stage')
    const showcaseCapture = vi.spyOn(showcaseStage.element, 'setPointerCapture').mockImplementation(() => {})
    vi.spyOn(showcaseStage.element, 'hasPointerCapture').mockReturnValue(false)
    const authorLink = page.get<HTMLAnchorElement>('.showcase-caption__authors > a')
    await authorLink.trigger('pointerdown', { button: 0, clientX: 200, pointerId: 9 })
    expect(showcaseCapture).not.toHaveBeenCalled()
    await authorLink.trigger('pointerup', { button: 0, clientX: 200, pointerId: 9 })
  })

  it('submits the official newsletter payload and shows success', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 } as Response)
    vi.stubGlobal('fetch', fetchMock)
    const page = renderApp()
    await fillNewsletter(page)

    await page.get('.newsletter form').trigger('submit')
    await flushPromises()
    await flushUi()

    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://osmo.outseta.com/api/v1/public/email/lists/z9Mzy7W4/subscriptions')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toEqual({
      EmailList: { Uid: 'z9Mzy7W4' },
      Person: { FirstName: 'Dennis', Email: 'dennis@example.com' },
      Source: 'embed',
    })
    expect(page.get('[role="status"]').text()).toBe("Amazing, we'll keep you in the loop! 🚀")
    expect(page.get<HTMLButtonElement>('.newsletter button[type="submit"]').element.disabled).toBe(true)
  })

  it('uses the source native required-field validation before newsletter submission', () => {
    const page = renderApp()
    const form = page.get<HTMLFormElement>('.newsletter form')
    const name = page.get<HTMLInputElement>('#newsletter-name')
    const email = page.get<HTMLInputElement>('#newsletter-email')

    expect(form.attributes('novalidate')).toBeUndefined()
    expect(name.attributes('required')).toBeDefined()
    expect(email.attributes('required')).toBeDefined()
    expect(form.element.checkValidity()).toBe(false)
  })

  it('keeps keyboard focus visible on dialog controls and the custom checkbox', () => {
    expect(stylesheet).toContain('.check-field input:focus-visible + .check-field__control')
    expect(stylesheet).toContain('.modal-close:focus-visible')
    expect(stylesheet).toContain('.menu-close-button:focus-visible')
    expect(stylesheet).toContain('.o--CloseLink--close:focus-visible')
    expect(stylesheet).not.toMatch(/\.modal-close:focus,\s*\.menu-close-button:focus\s*\{\s*outline:\s*0/)
  })

  it.each([
    ['a non-success response', () => Promise.resolve({ ok: false, status: 500 } as Response)],
    ['a network failure', () => Promise.reject(new TypeError('Network unavailable'))],
  ])('shows the source error state after %s', async (_scenario, responseFactory) => {
    const fetchMock = vi.fn().mockImplementation(responseFactory)
    vi.stubGlobal('fetch', fetchMock)
    const page = renderApp()
    await fillNewsletter(page)

    await page.get('.newsletter form').trigger('submit')
    await flushPromises()
    await flushUi()

    const message = page.get('[role="status"]')
    expect(message.classes()).toContain('error')
    expect(message.text()).toBe('Something went wrong while submitting.')
    expect(page.get<HTMLButtonElement>('.newsletter button[type="submit"]').element.disabled).toBe(false)
  })
})
