import { test, expect } from '@playwright/test'
import { BankPage } from './pages/bank.page'

/**
 * Input Validation Tests
 *
 * These tests verify that vue-currency-input properly validates numeric input.
 * We don't test XSS/HTML injection because Vue automatically escapes all output.
 */

test.describe('Currency Input Validation', () => {
  let bankPage: BankPage

  test.beforeEach(async ({ page }) => {
    bankPage = new BankPage(page, 'brou')
    await bankPage.navigate()
    await bankPage.waitForLoad()
  })

  test('should filter out letters and special characters', async () => {
    await bankPage.enterAmount('abc123@#$%^&*()')

    await expect(bankPage.currencyInput).toHaveValue('123')
  })

  test('should accept and format valid decimal numbers', async () => {
    await bankPage.enterAmount('100,50')

    await expect(bankPage.currencyInput).toHaveValue('100,50')
  })

  test('should prevent multiple decimal separators', async () => {
    await bankPage.enterAmount('100,50,30')

    await expect(bankPage.currencyInput).toHaveValue('100,50')
  })

  test('should filter negative signs', async () => {
    await bankPage.enterAmount('-50')

    await expect(bankPage.currencyInput).toHaveValue('50')
  })

  test('should filter emojis and unicode characters', async () => {
    await bankPage.enterAmount('😀100💰50🚀')

    await expect(bankPage.currencyInput).toHaveValue('10.050')
  })

  test('should handle zero and empty values', async () => {
    await bankPage.enterAmount('0')

    await expect(bankPage.currencyInput).toHaveValue('0')
  })

  test('should maintain validation after currency swap', async () => {
    await bankPage.enterAmount('100')
    await expect(bankPage.currencyInput).toHaveValue('100')

    await bankPage.swapCurrency()
    await expect(bankPage.currencyInput).toBeEditable()

    await bankPage.enterAmount('abc123')

    await expect(bankPage.currencyInput).toHaveValue('123')
  })
})

test.describe('Currency Input - UYU to USD Direction', () => {
  let bankPage: BankPage

  test.beforeEach(async ({ page }) => {
    bankPage = new BankPage(page, 'brou')
    await bankPage.navigate()
    await bankPage.waitForLoad()

    // Swap to UYU -> USD direction
    await bankPage.swapCurrency()
    await expect(bankPage.currencyInput).toBeEditable()
  })

  test('should filter invalid characters in reverse direction', async () => {
    await bankPage.enterAmount('3800abc@#$')

    await expect(bankPage.currencyInput).toHaveValue('3.800')
  })
})
