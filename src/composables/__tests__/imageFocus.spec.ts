import { describe, expect, it } from 'vitest'

import { objectPositionStyle } from '../imageFocus'

describe('objectPositionStyle', () => {
  it('returns undefined without focus so images stay browser-centred', () => {
    expect(objectPositionStyle(undefined)).toBeUndefined()
  })

  it('maps focus axes to an object-position style, defaulting missing axes to centre', () => {
    expect(objectPositionStyle({ x: 25, y: 15 })).toEqual({ objectPosition: '25% 15%' })
    expect(objectPositionStyle({ y: 30 })).toEqual({ objectPosition: '50% 30%' })
    expect(objectPositionStyle({})).toEqual({ objectPosition: '50% 50%' })
  })
})
