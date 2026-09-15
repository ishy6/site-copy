import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ProductFinishCard from './ProductFinishCard.vue'
import CatalogSearch from './CatalogSearch.vue'

describe('MAKR reusable components', () => {
  it('changes the image and selected item together, and resets confirmation on finish change', async () => {
    const wrapper = mount(ProductFinishCard)
    await wrapper.get('button[aria-label="Black"]').trigger('click')
    expect(wrapper.get('img').attributes('src')).toContain('BLK.avif')
    await wrapper.get('.makr-finish__add').trigger('click')
    expect(wrapper.emitted('add')?.[0]?.[0]).toMatchObject({ title: 'Field Pouch', finish: { id: 'black' }, price: 88 })
    expect(wrapper.text()).toContain('Added to selection')
    await wrapper.setProps({ initialFinish: 'fern' })
    expect(wrapper.get('img').attributes('src')).toContain('GRN.avif')
    expect(wrapper.text()).not.toContain('Added to selection')
    wrapper.unmount()
  })

  it('does not allow unavailable or missing finishes to be selected for purchase', async () => {
    const wrapper = mount(ProductFinishCard, { props: { finishes: [{ id: 'black', label: 'Black', color: '#111', image: '/pouch.jpg', available: false }] } })
    expect(wrapper.get('.makr-finish__add').attributes('disabled')).toBeDefined()
    await wrapper.get('.makr-finish__add').trigger('click')
    expect(wrapper.emitted('add')).toBeUndefined()
    await wrapper.setProps({ finishes: [] })
    expect(wrapper.text()).toContain('No finishes available')
    expect(wrapper.get('.makr-finish__add').attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })

  it('requires every search term and recovers the catalog after clearing an empty result', async () => {
    const wrapper = mount(CatalogSearch)
    await wrapper.get('input').setValue('  POUCH   black ')
    expect(wrapper.findAll('.makr-search__product')).toHaveLength(1)
    expect(wrapper.get('.makr-search__product').attributes('href')).toContain('field-pouch-blk')
    await wrapper.get('input').setValue('pouch wallet')
    expect(wrapper.findAll('.makr-search__product')).toHaveLength(0)
    expect(wrapper.text()).toContain('No objects found')
    await wrapper.get('button[aria-label="Clear search"]').trigger('click')
    expect(wrapper.findAll('.makr-search__product')).toHaveLength(3)
    expect(wrapper.emitted('search')?.at(-1)).toEqual([''])
    wrapper.unmount()
  })
})
