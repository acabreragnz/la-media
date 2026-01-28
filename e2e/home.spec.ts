import { test, expect } from '@playwright/test'
import { HomePage } from './pages/home.page'
import { ROUTES } from './config/routes'

test.describe('Home Page', () => {
  let homePage: HomePage

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page)
    await homePage.navigate()
    await homePage.waitForLoad()
  })

  test('should display bank selection page', async () => {
    await expect(homePage.logoImage).toBeVisible()
    await expect(homePage.page.getByText(/Cotizaciones USD/i)).toBeVisible()
    await expect(homePage.brouCard).toBeVisible()
    await expect(homePage.itauCard).toBeVisible()
  })

  test('should navigate to BROU page when clicking BROU card', async ({ page }) => {
    await homePage.selectBank('brou')

    await expect(page).toHaveURL(ROUTES.BROU)
    await expect(page.getByText(/La Media BROU/i)).toBeVisible()
  })

  test('should navigate to Itaú page when clicking Itaú card', async ({ page }) => {
    await homePage.selectBank('itau')

    await expect(page).toHaveURL(ROUTES.ITAU)
    await expect(page.getByText(/La Media Itaú/i)).toBeVisible()
  })

  test('should display footer with credits', async ({ page }) => {
    await expect(page.getByText(/Hecho con 💙 por/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /@acabreragnz/i })).toHaveAttribute(
      'href',
      'https://github.com/acabreragnz'
    )
  })
})
