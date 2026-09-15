import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import ModularBikeConfigurator from './ModularBikeConfigurator.vue'
import FrameFitGuide from './FrameFitGuide.vue'
import RidePackageComparison from './RidePackageComparison.vue'
import { bikeFrames, matchingSizes } from './frame-data'
import { ridePackages } from './ride-data'

describe('ALSO modular selection', () => {
  it('reconciles frame sizes and totals across all three steps before saving', async () => {
    const wrapper = mount(ModularBikeConfigurator)
    await wrapper.get('input[value="bench"]').setValue(true)
    expect(wrapper.get('select').element.value).toBe('universal')
    expect(wrapper.text()).toContain('$3,550')
    await wrapper.get('.also-build__next').trigger('click')
    await wrapper.get('input[value="all-terrain"]').setValue(true)
    expect(wrapper.text()).toContain('$3,750')
    await wrapper.get('.also-build__next').trigger('click')
    await wrapper.get('input[value="sport"]').setValue(true)
    await wrapper.get('.also-build__next').trigger('click')
    expect(wrapper.text()).toContain('Bench / Universal')
    await wrapper.get('.also-build__next').trigger('click')
    await flushPromises()
    expect(wrapper.emitted('save')?.[0]?.[0]).toMatchObject({ frame: { id: 'bench' }, size: { id: 'universal' }, ridePackage: { id: 'all-terrain' }, cockpit: { id: 'sport' }, total: 3750 })
    expect(wrapper.text()).toContain('Your build is ready.')
    wrapper.unmount()
  })

  it('blocks missing modules and supports failed-save retry with a stable build snapshot', async () => {
    const save = vi.fn().mockRejectedValueOnce(new Error('Please retry')).mockResolvedValueOnce(undefined)
    const wrapper = mount(ModularBikeConfigurator, { props: { initialStep: 3, saveBuild: save } })
    await wrapper.get('.also-build__next').trigger('click')
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toBe('Please retry')
    await wrapper.get('.also-build__next').trigger('click')
    await flushPromises()
    expect(wrapper.emitted('success')).toHaveLength(1)
    await wrapper.setProps({ frames: [] })
    expect(wrapper.get('.also-build__next').attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })

  it('matches the original inclusive height ranges including overlap and out-of-range values', () => {
    const solo = bikeFrames[0]
    expect(matchingSizes(solo, 59).map(size => size.id)).toEqual(['small'])
    expect(matchingSizes(solo, 65).map(size => size.id)).toEqual(['small', 'large'])
    expect(matchingSizes(solo, 68).map(size => size.id)).toEqual(['small', 'large'])
    expect(matchingSizes(solo, 80).map(size => size.id)).toEqual(['large'])
    expect(matchingSizes(solo, 81)).toEqual([])
    expect(matchingSizes(bikeFrames[2], 65).map(size => size.id)).toEqual(['universal'])
  })

  it('keeps physical height constant across unit switches and clears recommendations outside ranges', async () => {
    const wrapper = mount(FrameFitGuide, { props: { initialHeight: 170 } })
    const unitButtons = wrapper.findAll('.also-fit__units button')
    await unitButtons[1]!.trigger('click')
    await wrapper.get('.also-fit__result button').trigger('click')
    expect(wrapper.emitted('select')?.[0]?.[0]).toMatchObject({ sizeId: 'small', heightCm: 170 })
    await wrapper.get('input[type="number"]').setValue(85)
    expect(wrapper.text()).toContain('Outside the listed size ranges')
    expect(wrapper.find('.also-fit__result button').exists()).toBe(false)
    await wrapper.get('select').setValue('bench')
    await wrapper.get('input[type="number"]').setValue(70)
    expect(wrapper.text()).toContain('Universal recommended')
    wrapper.unmount()
  })

  it('filters shared specification rows and emits the selected available package', async () => {
    const packages = ridePackages.map(item => ({ ...item, modes: 'Auto + Manual' }))
    const wrapper = mount(RidePackageComparison, { props: { packages } })
    expect(wrapper.text()).toContain('Ride modes')
    await wrapper.get('input[type="checkbox"]').setValue(true)
    expect(wrapper.text()).not.toContain('Ride modes')
    await wrapper.get('[aria-label="Select All Terrain"]').trigger('click')
    expect(wrapper.emitted('select')?.[0]?.[0]).toMatchObject({ id: 'all-terrain', price: 200 })
    await wrapper.setProps({ packages: packages.map(item => ({ ...item, available: false })) })
    expect(wrapper.get('[aria-label="Select Road"]').attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })
})
