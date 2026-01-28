import { type Page, type Locator } from '@playwright/test'
import { ROUTES } from '../config/routes'

export class HomePage {
  constructor(public readonly page: Page) {}

  // Selectors as getters
  get logoImage(): Locator {
    return this.page.locator('img[alt="La Media"]')
  }

  get brouCard(): Locator {
    return this.page.getByRole('link', { name: /BROU/i })
  }

  get itauCard(): Locator {
    return this.page.getByRole('link', { name: /Itaú/i })
  }

  // Actions
  async navigate(): Promise<void> {
    await this.page.goto(ROUTES.HOME)
  }

  async selectBank(bank: 'brou' | 'itau'): Promise<void> {
    const card = bank === 'brou' ? this.brouCard : this.itauCard
    await card.click()
    await this.page.waitForURL(`**/${bank}`)
  }

  async waitForLoad(): Promise<void> {
    await this.logoImage.waitFor({ state: 'visible' })
  }
}
