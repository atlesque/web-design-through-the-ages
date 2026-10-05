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
    test('renders inside its monitor, with travel buttons and no errors', async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', (e) => errors.push(e.message))
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
      await page.goto(`/eras/${room}/`)
      await expect(page.locator('.stage .rig__screen main.era')).toBeVisible()
      await expect(page.locator('main.era .era-stamp')).toHaveCount(1)
      await expect(page.locator('main.era .era-cta a[rel="next"]')).toHaveCount(1)
      await expect(page.locator('main.era .era-cta a[rel="prev"]')).toHaveCount(1)
      await page.waitForTimeout(1500)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
      expect(overflow, 'horizontal overflow').toBeLessThanOrEqual(1)
      expect(errors).toEqual([])
      await page.screenshot({ path: `test-results/shots/${room.replace('/', '__')}-${test.info().project.name}.png` })
    })

    test('works without JavaScript', async ({ browser }) => {
      const ctx = await browser.newContext({ javaScriptEnabled: false })
      const page = await ctx.newPage()
      await page.goto(`/eras/${room}/`)
      await expect(page.locator('main.era')).not.toBeEmpty()
      await expect(page.locator('.era-cta a[rel="next"]')).toHaveAttribute('href', /^\/(eras\/[\w-]+\/)?$/)
      await ctx.close()
    })

    test('controls, travel buttons and curator pass axe', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto(`/eras/${room}/`)
      await page.locator('.hw-btn[aria-controls="curator"]').click()
      await expect(page.locator('#curator')).toHaveClass(/is-open/)
      await page.waitForTimeout(400)
      const results = await new AxeBuilder({ page }).include('.rig__controls').include('#curator').include('.era-cta').analyze()
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

test('travel stays in the app and swaps the hardware', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/eras/07-web-standards/')
  await expect(page.locator('.stage')).toHaveAttribute('data-kind', 'crt')
  await page.evaluate(() => ((window as unknown as { __stay: boolean }).__stay = true))
  await page.locator('.era-cta__next').click()
  await expect(page).toHaveURL(/\/eras\/08-blogs-myspace\//)
  await expect(page.locator('.stage')).toHaveAttribute('data-kind', 'lcd')
  await expect(page.locator('main.era[data-era="08"]')).toBeVisible()
  expect(await page.evaluate(() => (window as unknown as { __stay?: boolean }).__stay)).toBe(true)
  await page.goBack()
  await expect(page.locator('main.era[data-era="07"]')).toBeVisible()
  await expect(page.locator('.stage')).toHaveAttribute('data-kind', 'crt')
})

test('a swap scene can be skipped with Escape', async ({ page }) => {
  await page.goto('/eras/13-parallax/')
  await page.locator('body').press('ArrowRight')
  await expect(page.locator('.stage__skip')).toBeVisible()
  await page.locator('body').press('Escape')
  await expect(page.locator('.stage')).not.toHaveClass(/is-travelling/, { timeout: 2000 })
  await expect(page.locator('.stage')).toHaveAttribute('data-kind', 'phone')
  await expect(page.locator('main.era[data-era="14"]')).toBeVisible()
})

// Read from disk: Cloudflare Pages (and wrangler pages dev) never serve _headers itself.
test('headers file has a CSP for every room', () => {
  const text = readFileSync('.output/public/_headers', 'utf8')
  for (const room of rooms) expect(text).toContain(`/eras/${room}/\n  Content-Security-Policy:`)
})
