import { describe, it, expect } from 'vitest'
import { STUDIES, VE_ESTIMATES, WANING_DATA, ROB_DATA } from '../data/studies'

describe('data integrity', () => {
  it('has exactly 6 studies', () => expect(STUDIES).toHaveLength(6))
  it('has 37 VE estimates', () => expect(VE_ESTIMATES).toHaveLength(37))
  it('every VE estimate references a valid study', () => {
    const ids = new Set(STUDIES.map(s => s.id))
    VE_ESTIMATES.forEach(e => expect(ids.has(e.studyId)).toBe(true))
  })
  it('waning data has entries for Bell, Baxter, Crowcroft, Liu', () => {
    const ids = new Set(WANING_DATA.map(w => w.studyId))
    expect(ids.has('Bell2019')).toBe(true)
    expect(ids.has('Baxter2013')).toBe(true)
    expect(ids.has('Crowcroft2021')).toBe(true)
    expect(ids.has('Liu2020')).toBe(true)
  })
  it('all 6 studies have RoB domains', () => {
    const ids = new Set(ROB_DATA.map(r => r.studyId))
    expect(ids.size).toBe(6)
  })
  it('Ward2005 uses RoB 2.0 with 5 domains', () => {
    const domains = ROB_DATA.filter(r => r.studyId === 'Ward2005')
    expect(domains[0].tool).toBe('RoB 2.0')
    expect(domains).toHaveLength(5)
  })
  it('all other studies use ROBINS-I with 7 domains', () => {
    ['Baxter2013','Bell2019','Liu2020','Witt2013','Crowcroft2021'].forEach(id => {
      const domains = ROB_DATA.filter(r => r.studyId === id)
      expect(domains[0].tool).toBe('ROBINS-I')
      expect(domains).toHaveLength(7)
    })
  })
})
