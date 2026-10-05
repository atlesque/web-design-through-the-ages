import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { readdirSync, existsSync, readFileSync } from 'node:fs'

const eras = readdirSync('app/eras', { withFileTypes: true })
  .filter((d) => d.isDirectory() && /^\d\d-/.test(d.name))
  .map((d) => d.name)
const rooms = [
  ...eras,
  ...eras.flatMap((e) =>
    readdirSync(`app/eras/${e}`, { withFileTypes: true })
      .filter((d) => d.isDirectory() && existsSync(`app/eras/${e}/${d.name}/demo.html`))
      .map((d) => `${e}/${d.name}`),
  ),
]

test.describe('landing', () => {
  test('lists every era and links to it', async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem('wdta-booted', '1'))
    await page.goto('/')
    await expect(page.locator('.bento__tile')).toHaveCount(eras.length)
    await expect(page.locator('h1')).toContainText('Web design')
  })

  test('shell passes axe', async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem('wdta-booted', '1'))
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    const results = await new AxeBuilder({ page }).analyze()
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([])
  })
})

for (const room of rooms) {
  test.describe(`room ${room}`, () => {
    test('renders, has a time bar and no errors', async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', (e) => errors.push(e.message))
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
      await page.goto(`/eras/${room}/`)
      await expect(page.locator(`main.era`)).toBeVisible()
      await expect(page.locator('#timebar')).toBeVisible()
      await page.waitForTimeout(1500)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
      expect(overflow, 'horizontal overflow').toBeLessThanOrEqual(1)
      // axe can't judge contrast over the starfield/texture skins, so check the active notch directly
      const notch = await page.locator('.timebar__notch[aria-current="page"]').evaluate((el) => {
        const cs = getComputedStyle(el)
        return { color: cs.color, background: cs.backgroundColor }
      })
      expect(notch.color, 'active notch label matches its background').not.toBe(notch.background)
      expect(errors).toEqual([])
      await page.screenshot({ path: `test-results/shots/${room.replace('/', '__')}-${test.info().project.name}.png` })
    })

    test('works without JavaScript', async ({ browser }) => {
      const ctx = await browser.newContext({ javaScriptEnabled: false })
      const page = await ctx.newPage()
      await page.goto(`/eras/${room}/`)
      await expect(page.locator('main.era')).not.toBeEmpty()
      await expect(page.locator('#timebar a[aria-current="page"]')).toHaveCount(1)
      await ctx.close()
    })

    test('time bar and curator pass axe', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto(`/eras/${room}/`)
      await page.locator('.timebar__btn--curator').click()
      await expect(page.locator('#curator')).toHaveClass(/is-open/)
      await page.waitForTimeout(400)
      const results = await new AxeBuilder({ page }).include('#timebar').include('#curator').analyze()
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([])
    })
  })
}

test('keyboard: arrow right goes to the next era', async ({ page }) => {
  await page.goto(`/eras/${eras[1]}/`)
  await page.locator('body').press('ArrowRight')
  await expect(page).toHaveURL(new RegExp(`/eras/${eras[2]}/`))
})

// Read from disk: Cloudflare Pages (and wrangler pages dev) never serve _headers itself.
test('headers file has a CSP for every room', () => {
  const text = readFileSync('.output/public/_headers', 'utf8')
  for (const room of rooms) expect(text).toContain(`/eras/${room}/\n  Content-Security-Policy:`)
})
