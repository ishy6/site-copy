import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import App from '../src/App.vue'
import FlagBelt from '../src/FlagBelt.vue'
import { wiseQuoteProfiles } from '../src/wiseCurrencyData'

let wrapper: VueWrapper | undefined

async function settle() {
  await nextTick()
  await nextTick()
}

function linkWithText(text: string) {
  const link = wrapper?.findAll('a').find((item) => item.text().trim() === text)
  if (!link) throw new Error(`Missing link: ${text}`)
  return link
}

function selectorButton(code: string) {
  const button = selectorOptionsForCode(code)[0]
  if (!button) throw new Error(`Missing selector option: ${code}`)
  return button
}

function selectorOptionsForCode(code: string) {
  return wrapper?.findAll('.selector-list [role="option"]')
    .filter((item) => item.find('b').text() === code) ?? []
}

function selectorPlacement() {
  const style = (wrapper?.get('.selector-sheet').element as HTMLElement).style
  return {
    top: Number.parseFloat(style.getPropertyValue('--selector-top')),
    left: Number.parseFloat(style.getPropertyValue('--selector-left')),
    maxHeight: Number.parseFloat(style.getPropertyValue('--selector-max-height')),
  }
}

function domRect(top: number, left: number, width: number, height: number): DOMRect {
  return {
    top,
    right: left + width,
    bottom: top + height,
    left,
    width,
    height,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect
}

beforeEach(() => {
  sessionStorage.clear()
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false })))
  wrapper = mount(App, { attachTo: document.body })
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
  document.body.style.overflow = ''
  sessionStorage.clear()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('Wise flag belt scroll interaction', () => {
  function mountBelt(reducedMotion = false) {
    wrapper?.unmount()
    const frames = new Map<number, FrameRequestCallback>()
    let frameId = 0
    const preference = new EventTarget() as MediaQueryList
    Object.defineProperty(preference, 'matches', { value: reducedMotion, writable: true })
    vi.stubGlobal('matchMedia', vi.fn(() => preference))
    vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
      frames.set(++frameId, callback)
      return frameId
    }))
    vi.stubGlobal('cancelAnimationFrame', vi.fn((identifier: number) => frames.delete(identifier)))
    wrapper = mount(FlagBelt, { attachTo: document.body })
    const element = wrapper.get('.flag-belt-viewport').element as HTMLElement
    const bounds = vi.spyOn(element, 'getBoundingClientRect')
      .mockReturnValue(domRect(window.innerHeight - 200, 0, 1280, 160))
    const flush = () => {
      const pending = [...frames.values()]
      frames.clear()
      pending.forEach((callback) => callback(0))
    }
    return { element, bounds, flush, frames, preference }
  }

  it('extends the rounded arrow background and rotates flags in both scroll directions', () => {
    const { element, bounds, flush } = mountBelt()
    flush()
    expect(element.style.getPropertyValue('--belt-arrow-width')).toBe('160px')
    expect(element.style.getPropertyValue('--belt-rotation')).toBe('80deg')
    bounds.mockReturnValue(domRect(window.innerHeight - 450, 0, 1280, 160))
    window.dispatchEvent(new Event('scroll'))
    flush()
    expect(element.style.getPropertyValue('--belt-arrow-width')).toBe('360px')
    expect(element.style.getPropertyValue('--belt-rotation')).toBe('180deg')
    bounds.mockReturnValue(domRect(window.innerHeight - 100, 0, 1280, 160))
    window.dispatchEvent(new Event('scroll'))
    flush()
    expect(element.style.getPropertyValue('--belt-arrow-width')).toBe('80px')
    expect(element.style.getPropertyValue('--belt-rotation')).toBe('40deg')
    expect(wrapper?.findAll('img.big-flag')).toHaveLength(20)
  })

  it('batches scroll events and skips animation outside the viewport', () => {
    const { element, bounds, flush, frames } = mountBelt()
    bounds.mockReturnValue(domRect(window.innerHeight + 100, 0, 1280, 160))
    window.dispatchEvent(new Event('scroll'))
    window.dispatchEvent(new Event('scroll'))
    expect(frames.size).toBe(1)
    flush()
    expect(element.style.getPropertyValue('--belt-rotation')).toBe('')
    bounds.mockReturnValue(domRect(-200, 0, 1280, 160))
    window.dispatchEvent(new Event('scroll'))
    flush()
    expect(element.style.getPropertyValue('--belt-arrow-width')).toBe('')
  })

  it('respects reduced motion and resets when the preference changes', () => {
    const { element, flush, preference } = mountBelt(true)
    flush()
    expect(element.style.getPropertyValue('--belt-rotation')).toBe('')
    Object.defineProperty(preference, 'matches', { value: false })
    preference.dispatchEvent(new Event('change'))
    flush()
    expect(element.style.getPropertyValue('--belt-rotation')).toBe('80deg')
    Object.defineProperty(preference, 'matches', { value: true })
    preference.dispatchEvent(new Event('change'))
    expect(element.style.getPropertyValue('--belt-rotation')).toBe('')
    expect(element.style.getPropertyValue('--belt-arrow-width')).toBe('')
  })

  it('recalculates on resize and removes pending work on unmount', () => {
    const { element, bounds, flush, frames } = mountBelt()
    flush()
    bounds.mockReturnValue(domRect(window.innerHeight - 300, 0, 390, 96))
    window.dispatchEvent(new Event('resize'))
    flush()
    expect(element.style.getPropertyValue('--belt-arrow-width')).toBe('240px')
    window.dispatchEvent(new Event('scroll'))
    expect(frames.size).toBe(1)
    wrapper?.unmount()
    wrapper = undefined
    expect(frames.size).toBe(0)
    window.dispatchEvent(new Event('scroll'))
    window.dispatchEvent(new Event('resize'))
    expect(frames.size).toBe(0)
  })
})

describe('Wise source navigation contracts', () => {
  it('uses the real Wise destinations instead of local demo dialogs', () => {
    expect(linkWithText('登录').attributes('href')).toBe('https://wise.com/login')
    expect(linkWithText('开设账户').attributes('href')).toBe(
      'https://wise.com/register?redirectUrl=%2Fonboarding%3Forigin%3DSTANDARD',
    )
    expect(linkWithText('注册').attributes('href')).toBe('https://wise.com/register')
    expect(wrapper?.find('.demo-dialog').exists()).toBe(false)
  })

  it('builds live send and comparison links from calculator state', async () => {
    await wrapper?.get('#send-amount').setValue('1234')
    await settle()

    const compareUrl = new URL(linkWithText('显示更多供应商').attributes('href'))
    expect(compareUrl.origin + compareUrl.pathname).toBe('https://wise.com/hk/compare')
    expect(Object.fromEntries(compareUrl.searchParams)).toEqual({
      sendAmount: '10000',
      sourceCurrency: 'HKD',
      targetCurrency: 'USD',
    })

    const sendUrl = new URL(linkWithText('汇款').attributes('href'))
    expect(sendUrl.origin + sendUrl.pathname).toBe('https://wise.com/register')
    expect(sendUrl.searchParams.get('redirectUrl')).toBe(
      '/onboarding?intent=SEND&amount=1234&sourceCurrency=HKD&targetCurrency=USD',
    )
  })

  it('keeps the complete decimal draft visible while editing the send amount', async () => {
    const sendInput = wrapper?.get('#send-amount')
    await sendInput?.trigger('focus')
    await settle()

    expect((sendInput?.element as HTMLInputElement).value).toBe('10,000.00')
    expect(wrapper?.find('.send-amount-value .amount-decimals').exists()).toBe(false)

    await sendInput?.setValue('1234.')
    await settle()
    expect((sendInput?.element as HTMLInputElement).value).toBe('1234.')
    expect(wrapper?.find('.send-amount-value .amount-decimals').exists()).toBe(false)

    await sendInput?.setValue('1234.5')
    await settle()
    expect((sendInput?.element as HTMLInputElement).value).toBe('1234.5')
    expect(wrapper?.find('.send-amount-value .amount-decimals').exists()).toBe(false)

    await sendInput?.trigger('blur')
    await settle()
    expect((sendInput?.element as HTMLInputElement).value).toBe('1,234')
    expect(wrapper?.get('.send-amount-value .amount-decimals').text()).toBe('.50')
  })

  it('exposes the missing Wise Platform groups and links', async () => {
    const platformNav = wrapper?.findAll('.nav-products > a')[2]
    expect(platformNav.attributes('href')).toBe('https://wise.com/platform/')
    await platformNav.trigger('mouseenter')
    await settle()

    expect(wrapper?.get('.mega-menu').text()).toContain('消费管理')
    expect(wrapper?.get('.mega-menu').text()).toContain('人力平台')
    expect(wrapper?.get('.mega-menu').text()).toContain('活动')
    expect(wrapper?.findAll('.mega-menu .product-link-icon')).toHaveLength(4)
    expect(linkWithText('消费管理').attributes('href')).toBe('https://wise.com/platform/spend-management/')
    expect(linkWithText('人力平台').attributes('href')).toBe('https://wise.com/platform/workforce-platforms/')
    await wrapper?.findAll('.nav-products > a')[1].trigger('mouseenter')
    await settle()
    expect(linkWithText('联系销售').attributes('href')).toBe('https://wise.com/gb/business/contact?click_cta_id=gb_bhomepage_top')
  })

  it('closes the desktop product menu when focus leaves the header', async () => {
    const platformNav = wrapper?.findAll('.nav-products > a')[2]
    await platformNav.trigger('focus')
    await settle()
    expect(wrapper?.find('.mega-menu').exists()).toBe(true)

    const outside = wrapper?.get('.hero-button')
    outside?.element.focus()
    await wrapper?.get('.site-header').trigger('focusout', { relatedTarget: outside?.element })
    await settle()

    expect(wrapper?.find('.mega-menu').exists()).toBe(false)
  })

  it('clears an open product menu before opening the language drawer', async () => {
    await wrapper?.findAll('.nav-products > a')[2].trigger('focus')
    await settle()
    expect(wrapper?.find('.mega-menu').exists()).toBe(true)

    await wrapper?.get('.language-button').trigger('click')
    await settle()

    expect(wrapper?.find('.language-drawer').exists()).toBe(true)
    expect(wrapper?.find('.mega-menu').exists()).toBe(false)
  })

  it('opens source-defined external destinations in a protected new tab', async () => {
    await wrapper?.findAll('.nav-products > a')[2].trigger('mouseenter')
    await settle()

    const externalLinks = [
      linkWithText('浏览 API 文档'),
      linkWithText('注册 Wise Connect'),
      ...(wrapper?.findAll('.review-card a') ?? []),
      ...(wrapper?.findAll('.social-links a') ?? []),
    ]

    for (const link of externalLinks) {
      expect(link.attributes('target')).toBe('_blank')
      expect(link.attributes('rel')?.split(/\s+/)).toEqual(expect.arrayContaining(['noopener', 'noreferrer']))
    }
  })

  it('keeps the four mobile-visible coverage destinations in source order', () => {
    expect(wrapper?.findAll('.coverage-grid a').slice(0, 4).map((link) => link.text())).toEqual([
      '汇款到东帝汶',
      '汇款到中国大陆',
      '汇款到中国台湾',
      '汇款到中国香港',
    ])
  })
})

describe('Wise overlays and focus', () => {
  it('matches the source hero without a conditional region and keeps its app ratings', () => {
    expect(wrapper?.find('.location-banner').exists()).toBe(false)
    const heroRatings = wrapper?.findAll('.hero-copy .rating-stack a') ?? []
    expect(heroRatings).toHaveLength(2)
    expect(heroRatings.map((link) => link.text())).toEqual([
      'App Store 评分 4.8 ★，共 15万 条评论',
      'Google Play 评分 4.8 ★，共 128万 条评论',
    ])
    expect(wrapper?.find('.app-card .rating-stack').exists()).toBe(true)
  })

  it('maps country and language choices to real Wise locale URLs', async () => {
    const drawerOpener = wrapper?.get('.language-button')
    await drawerOpener?.trigger('click')
    await settle()

    expect(wrapper?.find('.language-drawer select').exists()).toBe(false)
    const comboboxes = wrapper?.findAll('.language-drawer [role="combobox"]') ?? []
    expect(comboboxes).toHaveLength(2)
    expect(comboboxes[0].attributes('aria-haspopup')).toBe('dialog')
    expect(comboboxes[1].attributes('aria-haspopup')).toBe('dialog')

    await comboboxes[0].trigger('click')
    await settle()
    expect(wrapper?.findAll('.locale-option-list [role="option"]')).toHaveLength(20)
    expect(wrapper?.findAll('.locale-popover')).toHaveLength(1)
    expect(wrapper?.get('.locale-popover').classes()).toContain('locale-popover--language')
    expect(wrapper?.get('.locale-popover').attributes('id')).toBe(comboboxes[0].attributes('aria-controls'))
    expect(wrapper?.get('.locale-option-list').attributes('aria-label')).toBe('语言')
    await wrapper?.findAll('.locale-option-list [role="option"]')
      .find((option) => option.text() === '中文（简体)')
      ?.trigger('click')
    await settle()

    await comboboxes[1].trigger('click')
    await settle()
    expect(wrapper?.findAll('.locale-option-list [role="option"]')).toHaveLength(216)
    expect(wrapper?.find('.locale-option-list [role="option"].active').exists()).toBe(false)
    const countrySearch = wrapper?.get('.locale-search input')
    expect(document.activeElement).toBe(countrySearch?.element)
    expect(wrapper?.get('.locale-popover').attributes('id')).toBe(comboboxes[1].attributes('aria-controls'))
    expect(wrapper?.get('.locale-option-list').attributes('aria-label')).toBe('国家/地区')
    await countrySearch?.setValue('中国大陆')
    await settle()
    await wrapper?.findAll('.locale-option-list [role="option"]')
      .find((option) => option.text() === '中国大陆')
      ?.trigger('click')
    await settle()
    expect(linkWithText('确认更改').attributes('href')).toBe('https://wise.com/zh-cn/')

    await comboboxes[0].trigger('click')
    await settle()
    await wrapper?.findAll('.locale-option-list [role="option"]')
      .find((option) => option.text() === 'English (UK)')
      ?.trigger('click')
    await settle()
    expect(linkWithText('确认更改').attributes('href')).toBe('https://wise.com/cn/')

    await comboboxes[1].trigger('click')
    await settle()
    await wrapper?.get('.locale-search input').setValue('英国')
    await settle()
    await wrapper?.findAll('.locale-option-list [role="option"]')
      .find((option) => option.text() === '英国')
      ?.trigger('click')
    await settle()
    expect(linkWithText('确认更改').attributes('href')).toBe('https://wise.com/gb/')

    await comboboxes[0].trigger('click')
    await settle()
    await wrapper?.findAll('.locale-option-list [role="option"]')
      .find((option) => option.text() === 'Français')
      ?.trigger('click')
    await settle()
    expect(linkWithText('确认更改').attributes('href')).toBe('https://wise.com/gb/?lang=fr')
  })

  it('uses keyboard selection and closes locale layers one Escape at a time', async () => {
    const drawerOpener = wrapper?.get('.language-button')
    drawerOpener?.element.focus()
    await drawerOpener?.trigger('click')
    await settle()

    const countryCombobox = wrapper?.findAll('.locale-combobox')[1]
    await countryCombobox.trigger('click')
    await settle()
    expect(document.body.style.overflow).toBe('hidden')
    expect(wrapper?.findAll('.locale-popover')).toHaveLength(1)

    const countrySearch = wrapper?.get('.locale-search input')
    await countrySearch?.setValue('英国')
    await settle()
    await countrySearch?.trigger('keydown', { key: 'Enter', isComposing: true })
    await settle()
    expect(wrapper?.find('.locale-popover').exists()).toBe(true)
    await countrySearch?.trigger('keydown', { key: 'Enter' })
    await settle()
    expect(wrapper?.find('.locale-popover').exists()).toBe(false)
    expect(wrapper?.findAll('.locale-combobox')[1].text()).toContain('英国')
    expect(document.activeElement).toBe(countryCombobox.element)
    expect(document.body.style.overflow).toBe('hidden')

    const languageCombobox = wrapper?.findAll('.locale-combobox')[0]
    await languageCombobox.trigger('click')
    await settle()
    ;(wrapper?.get('.locale-popover-head').element as HTMLElement).style.display = 'none'
    const localeList = wrapper?.get('.locale-option-list')
    expect(document.activeElement).toBe(localeList?.element)

    const backwardTab = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true })
    window.dispatchEvent(backwardTab)
    await settle()
    expect(backwardTab.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(localeList?.element)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await settle()
    expect(wrapper?.find('.locale-popover').exists()).toBe(false)
    expect(wrapper?.find('.language-drawer').exists()).toBe(true)
    expect(document.activeElement).toBe(languageCombobox.element)
    expect(document.body.style.overflow).toBe('hidden')

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await settle()
    expect(wrapper?.find('.language-drawer').exists()).toBe(false)
    expect(document.activeElement).toBe(drawerOpener?.element)
    expect(document.body.style.overflow).toBe('')
  })

  it('moves to the last country when ArrowUp is first pressed', async () => {
    await wrapper?.get('.language-button').trigger('click')
    await settle()
    await wrapper?.findAll('.locale-combobox')[1].trigger('click')
    await settle()

    const search = wrapper?.get('.locale-search input')
    const options = wrapper?.findAll('.locale-option-list [role="option"]') ?? []
    expect(search?.attributes('aria-activedescendant')).toBeUndefined()

    await search?.trigger('keydown', { key: 'ArrowUp' })
    await settle()

    expect(search?.attributes('aria-activedescendant')).toBe(options.at(-1)?.attributes('id'))
  })

  it('restores selector focus after Escape', async () => {
    const opener = wrapper?.get('button[aria-label="选择收款货币"]')
    opener?.element.focus()
    await opener?.trigger('click')
    await settle()
    expect(document.activeElement).toBe(wrapper?.get('.selector-search input').element)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await settle()
    expect(wrapper?.find('.selector-sheet').exists()).toBe(false)
    expect(document.activeElement).toBe(opener?.element)
  })

  it('cycles desktop selector focus from its listbox past the CSS-hidden mobile close button', async () => {
    await wrapper?.get('button[aria-label="选择收款货币"]').trigger('click')
    await settle()

    ;(wrapper?.get('.selector-mobile-head').element as HTMLElement).style.display = 'none'
    wrapper?.get('.selector-list').element.focus()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', cancelable: true }))
    await settle()

    expect(document.activeElement).toBe(wrapper?.get('.selector-search input').element)
  })

  it('opens the source-style fee dialog, switches views, and restores focus', async () => {
    const opener = wrapper?.get('.fee-row')
    opener?.element.focus()
    await opener?.trigger('click')
    await settle()

    expect(wrapper?.get('.fee-dialog').attributes('role')).toBe('dialog')
    expect(wrapper?.get('.fee-dialog-handle').exists()).toBe(true)
    expect(wrapper?.get('.fee-detail-list').text()).toContain('银行转账手续费')
    expect(wrapper?.get('.fee-dialog-total').text()).toContain('54.76 HKD')
    expect(document.activeElement).toBe(wrapper?.get('.fee-dialog-close').element)

    const detailsTab = wrapper?.get('input[value="details"]')
    expect(detailsTab?.attributes('name')).toBe('segmented-control')
    expect(wrapper?.get('input[value="compare"]').attributes('name')).toBe('segmented-control')
    await detailsTab?.trigger('keydown', { key: 'ArrowRight' })
    await settle()
    expect((wrapper?.get('input[value="compare"]').element as HTMLInputElement).checked).toBe(true)
    expect(wrapper?.get('.fee-compare-table img[alt="Bank of East Asia"]').exists()).toBe(true)
    const comparisonRows = wrapper?.findAll('.fee-compare-row') ?? []
    expect(comparisonRows.map((row) => row.text())).toEqual([
      '1,268.51 USD',
      '1,262.91 USD-5.60 USD',
      '1,261.39 USD-7.12 USD',
      '1,243.41 USD-25.10 USD',
      '1,219.20 USD-49.30 USD',
    ])
    expect(comparisonRows[0].classes()).toContain('fee-compare-row-wise')
    expect(comparisonRows[0].get('img').attributes('src')).toBe('https://wise.com/public-resources/assets/logos/wise-personal/logo_white.svg')
    expect(wrapper?.get('.fee-data-link').attributes()).toMatchObject({ target: '_blank', rel: 'noopener noreferrer' })

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await settle()
    expect(wrapper?.find('.fee-dialog').exists()).toBe(false)
    expect(document.activeElement).toBe(opener?.element)
  })

  it('wraps the fee radio selection at both keyboard boundaries', async () => {
    await wrapper?.get('.fee-row').trigger('click')
    await settle()

    const details = wrapper?.get('input[value="details"]')
    const compare = wrapper?.get('input[value="compare"]')
    await details?.trigger('keydown', { key: 'ArrowLeft' })
    await settle()
    expect((compare?.element as HTMLInputElement).checked).toBe(true)
    expect(document.activeElement).toBe(compare?.element)

    await compare?.trigger('keydown', { key: 'ArrowRight' })
    await settle()
    expect((details?.element as HTMLInputElement).checked).toBe(true)
    expect(document.activeElement).toBe(details?.element)
  })

  it('opens the full rate and volume-discount dialogs and restores focus', async () => {
    const rateOpener = wrapper?.get('.info-pill')
    rateOpener?.element.focus()
    await rateOpener?.trigger('click')
    await settle()

    expect(wrapper?.get('.rate-dialog').attributes('role')).toBe('dialog')
    expect(wrapper?.get('.rate-dialog').text()).toContain('我们的汇率公开透明')
    expect(wrapper?.findAll('.rate-provider-row')).toHaveLength(5)
    expect((wrapper?.get('input[value="month"]').element as HTMLInputElement).checked).toBe(true)
    expect((wrapper?.get('.rate-chart polyline').attributes('points').split(' ')).length).toBeGreaterThan(90)
    expect(wrapper?.get('.rate-provider-row img[alt="Wise"]').attributes('src')).toBe('https://wise.com/public-resources/assets/logos/wise-personal/logo_white.svg')
    expect(wrapper?.get('.rate-provider-row img[alt="Bank of East Asia"]').attributes('src')).toBe('https://dq8dwmysp7hk1.cloudfront.net/logos/bank-of-east-asia--white.svg')
    expect(wrapper?.get('.rate-data-link').attributes()).toMatchObject({ target: '_blank', rel: 'noopener noreferrer' })
    expect(document.body.style.overflow).toBe('hidden')

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await settle()
    expect(wrapper?.find('.rate-dialog').exists()).toBe(false)
    expect(document.activeElement).toBe(rateOpener?.element)

    const discountOpener = wrapper?.get('.discount-note')
    discountOpener?.element.focus()
    await discountOpener?.trigger('click')
    await settle()
    expect(wrapper?.get('.discount-dialog').text()).toContain('折扣从 25,000 USD 开始适用')
    expect(wrapper?.findAll('.discount-benefits article')).toHaveLength(3)
    await wrapper?.get('.discount-dialog-actions button').trigger('click')
    await settle()
    expect(wrapper?.find('.discount-dialog').exists()).toBe(false)
    expect(document.activeElement).toBe(discountOpener?.element)
  })

  it('uses the source dynamic-rate copy and nudge without fabricated provider rows', async () => {
    await wrapper?.get('button[aria-label="选择收款货币"]').trigger('click')
    await settle()
    await wrapper?.get('.selector-search input').setValue('ALL')
    await selectorButton('ALL').trigger('click')
    await settle()

    expect(wrapper?.get('.hero').classes()).toContain('has-dynamic-quote')

    await wrapper?.get('.info-pill').trigger('click')
    await settle()

    const rateDialog = wrapper?.get('.rate-dialog')
    const expectedRate = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(wiseQuoteProfiles.ALL.rate)
    expect(rateDialog?.get('h2').text()).toBe(`1 HKD = ${expectedRate} ALL`)
    expect(rateDialog?.get('.rate-lock-copy strong').text()).toBe('不保证此汇率')
    expect(rateDialog?.get('.rate-lock-copy p').text()).toBe('当我们收到您的款项时，我们将使用实时汇率兑换您的资金。')
    expect(rateDialog?.find('.rate-provider-table').exists()).toBe(false)
    expect(rateDialog?.findAll('.rate-provider-row')).toHaveLength(0)
    expect(rateDialog?.text()).toContain('我们目前暂无这些货币及汇款金额的对比数据，但我们会持续努力，为您提供更多货币、价位及提供商的对比信息。')
  })

  it('requests six-month rate history with the Wise month contract', async () => {
    await wrapper?.get('.info-pill').trigger('click')
    await settle()
    await wrapper?.get('input[value="halfYear"]').setValue()
    await settle()

    const rateRequests = vi.mocked(fetch).mock.calls
      .map(([input]) => new URL(String(input), window.location.origin))
      .filter((url) => url.pathname === '/wise-rates')
    const request = rateRequests.at(-1)

    expect(request?.searchParams.get('length')).toBe('6')
    expect(request?.searchParams.get('unit')).toBe('month')
    expect(request?.searchParams.get('resolution')).toBe('daily')
  })

  it('opens one provider rate explanation at a time and dismisses it outside', async () => {
    const wiseHelp = wrapper?.get('button[aria-label="真实的中间市场汇率"]')
    await wiseHelp?.trigger('click')
    await settle()
    expect(wrapper?.get('.provider-help-popover').text()).toContain('没有汇率差价，没有隐性利润')

    await wrapper?.findAll('button[aria-label="汇率加价"]')[0].trigger('click')
    await settle()
    expect(wrapper?.findAll('.provider-help-popover')).toHaveLength(1)
    expect(wrapper?.get('.provider-help-popover').text()).toContain('33.65 HKD 汇率加价')

    await wrapper?.get('.comparison-section').trigger('click')
    await settle()
    expect(wrapper?.find('.provider-help-popover').exists()).toBe(false)
  })

  it('updates the provider-help body lock when crossing the mobile breakpoint', async () => {
    const width = vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(390)
    window.dispatchEvent(new Event('resize'))
    await settle()
    await wrapper?.findAll('.provider-help-mobile')[0].trigger('click')
    await settle()
    expect(document.body.style.overflow).toBe('hidden')
    expect(document.activeElement).toBe(wrapper?.get('.provider-help-sheet').element)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }))
    await settle()
    expect(document.activeElement).toBe(wrapper?.get('.provider-help-sheet-close').element)

    wrapper?.get('.provider-help-sheet').element.focus()

    width.mockReturnValue(800)
    window.dispatchEvent(new Event('resize'))
    await settle()
    expect(document.body.style.overflow).toBe('')
    expect(document.activeElement).toBe(wrapper?.get('.provider-help-desktop .provider-help-button').element)

    width.mockReturnValue(390)
    window.dispatchEvent(new Event('resize'))
    await settle()
    expect(document.body.style.overflow).toBe('hidden')
    expect(document.activeElement).toBe(wrapper?.get('.provider-help-sheet').element)

    wrapper?.get('.hero-button').element.focus()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }))
    await settle()
    expect(document.activeElement).toBe(wrapper?.get('.provider-help-sheet-close').element)
  })

  it('closes the mobile menu and restores visible navigation when leaving mobile', async () => {
    const width = vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(390)
    window.dispatchEvent(new Event('resize'))
    await settle()

    await wrapper?.get('button[aria-label="打开导航菜单"]').trigger('click')
    await settle()
    expect(wrapper?.find('.mobile-menu').exists()).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')

    width.mockReturnValue(800)
    window.dispatchEvent(new Event('resize'))
    await settle()

    expect(wrapper?.find('.mobile-menu').exists()).toBe(false)
    expect(document.body.style.overflow).toBe('')
    expect(document.activeElement).toBe(wrapper?.get('.nav-products > a').element)
  })

  it('keeps focus when entering and leaving a mobile submenu', async () => {
    await wrapper?.get('button[aria-label="打开导航菜单"]').trigger('click')
    await settle()
    const platform = wrapper?.get('button[data-mobile-panel="platform"]')
    platform?.element.focus()
    await platform?.trigger('click')
    await settle()
    expect(document.activeElement).toBe(wrapper?.get('.menu-back').element)

    await wrapper?.get('.menu-back').trigger('click')
    await settle()
    expect(document.activeElement).toBe(wrapper?.get('button[data-mobile-panel="platform"]').element)
  })

  it('sorts live provider comparison by the amount the recipient receives', async () => {
    wrapper?.unmount()
    document.body.innerHTML = ''
    vi.useFakeTimers()
    const quote = {
      props: {
        pageProps: {
          data: {
            initialQuote: {
              rate: 0.12755,
              paymentOptions: [{
                payIn: 'BANK_TRANSFER',
                fee: { total: 102.77 },
                targetAmount: 1262.38,
                disabledReason: null,
                formattedEstimatedDelivery: '在星期二或之前',
              }],
            },
          },
        },
      },
    }
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      text: async () => `<script id="__NEXT_DATA__" type="application/json">${JSON.stringify(quote)}</script>`,
    })))
    wrapper = mount(App, { attachTo: document.body })

    await vi.advanceTimersByTimeAsync(360)
    await settle()
    await wrapper.get('.fee-row').trigger('click')
    await wrapper.get('input[value="details"]').trigger('keydown', { key: 'ArrowRight' })
    await settle()

    expect(wrapper.findAll('.fee-compare-row img').map((logo) => logo.attributes('alt')).slice(0, 2)).toEqual(['Hang Seng', 'Wise'])
    expect(wrapper.findAll('.fee-compare-row').map((row) => row.text()).slice(0, 2)).toEqual([
      '1,262.92 USD',
      '1,262.38 USD-0.54 USD',
    ])
  })

  it('keeps the provider markup percentage from the live homepage response', async () => {
    wrapper?.unmount()
    document.body.innerHTML = ''
    vi.useFakeTimers()
    const quote = {
      props: {
        pageProps: {
          data: {
            initialQuote: {
              rate: 0.12755,
              paymentOptions: [{
                payIn: 'BANK_TRANSFER',
                fee: { total: 54.76 },
                targetAmount: 1268.52,
                disabledReason: null,
                formattedEstimatedDelivery: '在星期二或之前',
              }],
            },
            moneyTransferComparison: {
              providers: [
                {
                  alias: 'wise',
                  name: 'Wise',
                  logos: { circle: { svgUrl: 'wise' } },
                  quotes: [{ fee: 54.76, markup: 0, rate: 0.12755, receivedAmount: 1268.52 }],
                },
                {
                  alias: 'paypal',
                  name: 'PayPal',
                  logos: { circle: { svgUrl: 'paypal' } },
                  quotes: [{ fee: 38.99, markup: 4.05, rate: 0.1224, receivedAmount: 1219.140757 }],
                },
              ],
            },
          },
        },
      },
    }
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      text: async () => `<script id="__NEXT_DATA__" type="application/json">${JSON.stringify(quote)}</script>`,
    })))
    wrapper = mount(App, { attachTo: document.body })

    await vi.advanceTimersByTimeAsync(360)
    await settle()
    await wrapper.findAll('button[aria-label="汇率加价"]')[0].trigger('click')
    await settle()

    const help = wrapper.get('.provider-help-popover').text()
    expect(help).toContain('贵 4.05%。')
    expect(help).toContain('402.87 HKD 汇率加价')
    expect(help).toContain('38.99 HKD 汇款手续费')
    expect(help).toContain('441.86 HKD')
  })
})

describe('Wise currency selector regressions', () => {
  it('keeps the homepage comparison state independent from the hero calculator', async () => {
    const initialComparison = wrapper?.get('.providers').text()
    await wrapper?.get('button[aria-label="选择收款货币"]').trigger('click')
    await settle()
    await wrapper?.get('.selector-search input').setValue('DZD')
    await selectorButton('DZD').trigger('click')
    await settle()

    expect(wrapper?.get('button[aria-label="选择收款货币"]').text()).toContain('DZD')
    expect(wrapper?.findAll('.comparison-currency-control')[1].text()).toContain('USD')
    expect(wrapper?.get('.providers').text()).toBe(initialComparison)

    await wrapper?.get('.comparison-controls input').setValue('25000')
    const comparisonTarget = wrapper?.findAll('.comparison-currency-control button')[1]
    await comparisonTarget?.trigger('click')
    await settle()
    await wrapper?.get('.selector-search input').setValue('GBP')
    await selectorButton('GBP').trigger('click')
    await settle()

    expect(wrapper?.get('#send-amount').attributes('value')).toBe('10,000')
    expect(wrapper?.get('button[aria-label="选择收款货币"]').text()).toContain('DZD')
    expect(wrapper?.findAll('.comparison-currency-control')[1].text()).toContain('GBP')
    const compareUrl = new URL(linkWithText('显示更多供应商').attributes('href'))
    expect(Object.fromEntries(compareUrl.searchParams)).toEqual({
      sendAmount: '25000',
      sourceCurrency: 'HKD',
      targetCurrency: 'GBP',
    })
  })

  it('maps Albania to ALL and updates the calculator currency', async () => {
    await wrapper?.get('.destination-button').trigger('click')
    await settle()
    await wrapper?.get('.selector-search input').setValue('阿尔巴尼亚')

    const albania = wrapper?.findAll('.selector-list button').find((item) => item.text().includes('阿尔巴尼亚'))
    if (!albania) throw new Error('Missing Albania destination')
    await albania.trigger('click')
    await settle()

    expect(wrapper?.get('.destination-button').text()).toContain('阿尔巴尼亚')
    expect(wrapper?.get('button[aria-label="选择收款货币"]').text()).toContain('ALL')
    expect(wrapper?.get('.rate-line').text()).toContain('ALL')
    expect(wrapper?.get('#receive-amount').attributes('value')).toBe(
      new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(wiseQuoteProfiles.ALL.targetAmount),
    )
    expect(wrapper?.get('.fee-row').text()).toContain(`${wiseQuoteProfiles.ALL.fee.toFixed(2)} HKD`)
    expect(wrapper?.get('.summary-row').text()).toMatch(/\d+月\d+日星期.之前/)
    expect(wrapper?.findAll('[role="status"]')).toHaveLength(2)
    expect(wrapper?.text()).toContain('我们目前无法保证汇率')
    expect(wrapper?.text()).toContain('动态收费每 60 秒更新一次')
    expect(wrapper?.find('.saving-line').exists()).toBe(false)

    await wrapper?.get('.fee-row').trigger('click')
    await settle()
    expect(wrapper?.get('.fee-detail-list').text()).toContain('我们的费用188.15 HKD')
    expect(wrapper?.get('.fee-detail-list').text()).toContain(`动态收费${(wiseQuoteProfiles.ALL.fee - 188.15).toFixed(2)} HKD`)
  })

  it('keeps a calculator selector horizontally inside the desktop viewport', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1280)
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(720)
    vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1280)
    vi.spyOn(wrapper!.get('.calculator-body').element, 'getBoundingClientRect').mockReturnValue(domRect(32, 720, 480, 640))

    const opener = wrapper?.get('button[aria-label="选择收款货币"]')
    vi.spyOn(opener!.element, 'getBoundingClientRect').mockReturnValue(domRect(560, 1040, 160, 44))

    await opener?.trigger('click')
    await settle()

    const placement = selectorPlacement()
    expect(placement.left).toBeGreaterThanOrEqual(16)
    expect(placement.left + 384).toBeLessThanOrEqual(1280 - 16)
  })

  it('opens destination and comparison selectors above controls near the viewport bottom', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1280)
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(720)
    vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1280)

    const destination = wrapper?.get('.destination-button')
    const destinationAnchor = destination?.element.querySelector<HTMLElement>(':scope > span:last-child')
    vi.spyOn(destination!.element, 'getBoundingClientRect').mockReturnValue(domRect(650, 900, 240, 40))
    vi.spyOn(destinationAnchor!, 'getBoundingClientRect').mockReturnValue(domRect(650, 1040, 100, 40))
    await destination?.trigger('click')
    await settle()
    let placement = selectorPlacement()
    expect(placement.top).toBeLessThan(650)
    expect(placement.maxHeight).toBeGreaterThanOrEqual(320)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await settle()

    const comparison = wrapper?.findAll('.comparison-currency-control button')[1]
    vi.spyOn(comparison!.element, 'getBoundingClientRect').mockReturnValue(domRect(650, 920, 200, 50))
    await comparison?.trigger('click')
    await settle()
    placement = selectorPlacement()
    expect(placement.top).toBeLessThan(650)
    expect(placement.maxHeight).toBeGreaterThanOrEqual(320)
  })

  it('shows the exact non-duplicated source and HKD target option counts', async () => {
    await wrapper?.get('button[aria-label="选择汇出货币"]').trigger('click')
    await settle()
    expect(wrapper?.findAll('.selector-list [role="option"]')).toHaveLength(32)
    expect(selectorOptionsForCode('ALL')).toHaveLength(0)
    for (const code of ['EUR', 'HKD', 'USD']) expect(selectorOptionsForCode(code)).toHaveLength(1)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await settle()
    await wrapper?.get('button[aria-label="选择收款货币"]').trigger('click')
    await settle()
    expect(wrapper?.findAll('.selector-list [role="option"]')).toHaveLength(102)
    expect(selectorOptionsForCode('HKD')).toHaveLength(0)
    for (const code of ['EUR', 'GBP', 'USD']) expect(selectorOptionsForCode(code)).toHaveLength(1)
  })

  it('does not select or close a currency while an IME composition is active', async () => {
    await wrapper?.get('button[aria-label="选择收款货币"]').trigger('click')
    await settle()
    const search = wrapper?.get('.selector-search input')
    await search?.setValue('DZD')
    await settle()

    await search?.trigger('keydown', { key: 'Enter', isComposing: true })
    await settle()

    expect(wrapper?.find('.selector-sheet').exists()).toBe(true)
    expect(wrapper?.get('button[aria-label="选择收款货币"]').text()).toContain('USD')
  })

  it.each(['EUR', 'ALL'] as const)('keeps a typed %s recipient amount exact', async (code) => {
    await wrapper?.get('button[aria-label="选择收款货币"]').trigger('click')
    await settle()
    await wrapper?.get('.selector-search input').setValue(code)
    await selectorButton(code).trigger('click')
    await settle()

    const receive = wrapper?.get('#receive-amount')
    await receive?.setValue('1000')
    await settle()

    expect(Number((receive?.element as HTMLInputElement).value.replaceAll(',', ''))).toBeCloseTo(1000, 2)
  })

  it('updates target coverage when the source currency has a restricted route', async () => {
    await wrapper?.get('button[aria-label="选择汇出货币"]').trigger('click')
    await settle()
    await selectorButton('ARS').trigger('click')
    await settle()

    expect(wrapper?.get('button[aria-label="选择收款货币"]').text()).toContain('ARS')
    expect(wrapper?.get('.destination-button').text()).toContain('阿根廷')
    await wrapper?.get('button[aria-label="选择收款货币"]').trigger('click')
    await settle()
    expect(wrapper?.findAll('.selector-list [role="option"]')).toHaveLength(1)
  })

  it('supports listbox arrow navigation and Enter selection', async () => {
    await wrapper?.get('button[aria-label="选择收款货币"]').trigger('click')
    await settle()
    const search = wrapper?.get('.selector-search input')
    await search?.setValue('DZD')
    await search?.trigger('keydown', { key: 'ArrowDown' })
    await search?.trigger('keydown', { key: 'Enter' })
    await settle()

    expect(wrapper?.find('.selector-sheet').exists()).toBe(false)
    expect(wrapper?.get('button[aria-label="选择收款货币"]').text()).toContain('DZD')
    expect(wrapper?.get('.destination-button').text()).toContain('阿尔及利亚')
  })

  it('keeps the current USD quote visible for a destination without its own HKD route', async () => {
    await wrapper?.get('.destination-button').trigger('click')
    await settle()
    await wrapper?.get('.selector-search input').setValue('安哥拉')
    const angola = wrapper?.findAll('.selector-list [role="option"]').find((item) => item.text().includes('安哥拉'))
    if (!angola) throw new Error('Missing Angola destination')
    await angola.trigger('click')
    await settle()

    expect(wrapper?.get('.destination-button').text()).toContain('安哥拉')
    expect(wrapper?.find('.calculator-body').exists()).toBe(true)
    expect(wrapper?.get('button[aria-label="选择收款货币"]').text()).toContain('USD')
    expect(wrapper?.get('#receive-amount').attributes('value')).toBe('1,268.51')
  })

  it('maps USD back to the United States instead of South Korea', async () => {
    await wrapper?.get('button[aria-label="选择收款货币"]').trigger('click')
    await settle()
    await selectorButton('THB').trigger('click')
    await settle()

    await wrapper?.get('button[aria-label="选择收款货币"]').trigger('click')
    await settle()
    await selectorButton('USD').trigger('click')
    await settle()

    expect(wrapper?.get('.destination-button').text()).toContain('美国')
    expect(wrapper?.get('.destination-button').text()).not.toContain('韩国')
  })
})
