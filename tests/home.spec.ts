import { expect, test } from '@playwright/test'

const checkOverflow = async (page: import('@playwright/test').Page) => {
  const sizes = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }))
  expect(sizes.content, `document should fit ${sizes.viewport}px`).toBeLessThanOrEqual(sizes.viewport)
}

const revealPage = async (page: import('@playwright/test').Page) => {
  for (const reveal of await page.locator('.scroll-reveal').all()) {
    await reveal.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }))
    await page.waitForTimeout(90)
  }
  await page.waitForTimeout(850)
  const hiddenReveals = await page.locator('.scroll-reveal').evaluateAll((elements) => elements
    .filter((element) => Number(getComputedStyle(element).opacity) < 0.99)
    .map((element) => element.className))
  expect(hiddenReveals, 'scroll reveals should settle visibly after being reached').toEqual([])
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(500)
}

test('desktop path carousel, FAQ, meaningful links, and full-page render', async ({ page }) => {
  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  page.on('console', (message) => { if (message.type() === 'error') pageErrors.push(message.text()) })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.getByRole('heading', { name: /المعرفة تفتح/ })).toBeVisible()
  await expect(page.getByRole('tab')).toHaveCount(2)
  await expect(page.locator('.price-row')).toHaveCount(3)
  await expect(page.locator('.story-entry')).toHaveCount(3)
  await expect(page.getByText('أحمد محمد')).toBeAttached()
  await expect(page.getByText('سارة علي')).toBeAttached()
  await expect(page.getByText('يوسف إبراهيم')).toBeAttached()
  await checkOverflow(page)

  await page.getByRole('tab', { name: /ريادة الأعمال/ }).click()
  await expect(page.getByRole('tabpanel')).toContainText('دراسة السوق والمنافسين')
  await expect(page.getByRole('region', { name: /ريادة الأعمال/ })).toBeVisible()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('tab', { name: /تكنولوجيا المعلومات/ })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('tabpanel')).toContainText('هياكل البيانات والخوارزميات')
  await page.getByRole('button', { name: 'المسار التالي' }).click()
  await expect(page.getByRole('tabpanel')).toContainText('نموذج العمل التجاري')
  await page.getByRole('button', { name: 'المسار السابق' }).click()
  await expect(page.getByRole('tabpanel')).toContainText('هياكل البيانات والخوارزميات')

  await page.getByRole('button', { name: 'هل أحتاج إلى خبرة سابقة في البرمجة؟' }).click()
  await expect(page.locator('#faq-answer-1')).toBeVisible()
  await expect(page.locator('#faq-answer-0')).toBeHidden()
  expect(await page.locator('a[href="https://www.dodocosta.com/Auth/Login"]').count()).toBeGreaterThan(0)
  expect(await page.locator('a[href="https://www.dodocosta.com/Auth/Register"]').count()).toBeGreaterThan(0)

  const brokenHrefs = await page.locator('a[href]').evaluateAll((anchors) => anchors
    .map((anchor) => (anchor as HTMLAnchorElement).getAttribute('href')!)
    .filter((href) => href.startsWith('#') && !document.getElementById(decodeURIComponent(href.slice(1)))))
  expect(brokenHrefs).toEqual([])
  const unrelatedExternalLinks = await page.locator('a[href^="http"]:not([href^="https://www.dodocosta.com/"])').count()
  expect(unrelatedExternalLinks).toBe(0)

  await page.evaluate(() => window.scrollTo(0, 0))
  await revealPage(page)
  await page.screenshot({ path: 'test-results/dodo-1440-hero.png', animations: 'disabled' })
  await page.screenshot({ path: 'test-results/dodo-1440-full.png', fullPage: true, animations: 'disabled' })
  expect(pageErrors).toEqual([])
})

for (const width of [1280, 768, 390, 320]) {
  test(`responsive render fits ${width}px`, async ({ page }) => {
    const pageErrors: string[] = []
    page.on('pageerror', (error) => pageErrors.push(error.message))
    page.on('console', (message) => { if (message.type() === 'error') pageErrors.push(message.text()) })
    await page.setViewportSize({ width, height: width < 500 ? 844 : 950 })
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /المعرفة تفتح/ })).toBeVisible()
    await checkOverflow(page)
    await revealPage(page)
    await page.screenshot({ path: `test-results/dodo-${width}.png`, animations: 'disabled', fullPage: true })
    expect(pageErrors).toEqual([])
  })
}

test('mobile menu opens, closes with Escape, and its destinations work', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const menuButton = page.locator('.menu-toggle')
  await menuButton.click()
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true')
  const menu = page.locator('#mobile-navigation')
  await expect(menu.getByRole('link', { name: 'الأسعار' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  await menuButton.click()
  await menu.getByRole('link', { name: 'الأسعار' }).click()
  await expect(page).toHaveURL(/#pricing$/)
  await expect(page.locator('#pricing')).toBeInViewport()
  await checkOverflow(page)
})

test('touch swipe advances the learning journey', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const page = await context.newPage()
  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  page.on('console', (message) => { if (message.type() === 'error') pageErrors.push(message.text()) })
  await page.goto('http://127.0.0.1:4173/')
  await page.locator('.hero-shell').tap({ position: { x: 330, y: 310 } }).catch(() => undefined)
  await page.evaluate(() => {
    const target = document.querySelector('.hero-shell')!
    const touch = (type: string, x: number) => {
      const point = new Touch({ identifier: 1, target, clientX: x, clientY: 310 })
      const activeTouches = type === 'touchend' ? [] : [point]
      target.dispatchEvent(new TouchEvent(type, { bubbles: true, changedTouches: [point], touches: activeTouches, targetTouches: activeTouches }))
    }
    touch('touchstart', 330)
    touch('touchend', 70)
  })
  await expect(page.getByRole('tabpanel')).toContainText('نموذج العمل التجاري')
  expect(pageErrors).toEqual([])
  await context.close()
})
