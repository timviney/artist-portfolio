import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SiteFooter from '../SiteFooter.vue'

describe('SiteFooter', () => {
  it('renders the seeded social links as labelled icons', () => {
    const wrapper = mount(SiteFooter)
    const links = wrapper.findAll('.site-footer__social a')

    expect(links.map((link) => link.attributes('aria-label'))).toEqual(['Instagram'])
    expect(links[0].attributes('href')).toBe('https://www.instagram.com/maxyoungacts/')
    for (const link of links) {
      expect(link.find('svg').exists()).toBe(true)
    }
  })

  it('renders the copyright line with the artist name and current year', () => {
    const wrapper = mount(SiteFooter)
    expect(wrapper.find('.site-footer__copyright').text()).toBe(
      `© ${new Date().getFullYear()} Max Pavlovsky`,
    )
  })
})
