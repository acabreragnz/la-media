import { type Page, type Locator } from '@playwright/test'
import { ROUTES, type RouteValue } from '../config/routes'

type BankId = 'brou' | 'itau'

export class BankPage {
  constructor(
    public readonly page: Page,
    public readonly bankId: BankId
  ) {}

  // Selectors as getters
  get currencyInput(): Locator {
    return this.page.locator('input[placeholder="0,00"]')
  }

  get swapButton(): Locator {
    return this.page.getByRole('button', { name: /intercambiar/i })
  }

  get pageTitle(): Locator {
    const bankName = this.bankId === 'brou' ? 'BROU' : 'Itaú'
    return this.page.getByText(new RegExp(`La Media ${bankName}`, 'i'))
  }

  get conversionResult(): Locator {
    return this.page.locator('[data-testid="conversion-result"]')
  }

  // Actions
  async navigate(): Promise<void> {
    const route = ROUTES[this.bankId.toUpperCase() as keyof typeof ROUTES] as RouteValue
    await this.page.goto(route)
  }

  async enterAmount(amount: string): Promise<void> {
    await this.currencyInput.fill(amount)
  }

  async swapCurrency(): Promise<void> {
    await this.swapButton.click()
  }

  async waitForLoad(): Promise<void> {
    await this.pageTitle.waitFor({ state: 'visible' })
    await this.currencyInput.waitFor({ state: 'visible' })
  }

  async getInputValue(): Promise<string> {
    return (await this.currencyInput.inputValue()) || ''
  }
}
