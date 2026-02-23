import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));

    console.log("Navigating to production site...");
    await page.goto('https://nsep-2025.vercel.app/register?ref=STU514A843D16V1', { waitUntil: 'networkidle' });

    await page.waitForTimeout(2000);

    // Check if the form is actually visible
    const isGateVisible = await page.locator('text="Registration by Referral Only"').count();
    console.log("Is Gate Visible?", isGateVisible > 0);

    const refCodeValue = await page.inputValue('#referredByCenter').catch(() => 'not found');
    console.log("Referred By value in form:", refCodeValue);

    await page.fill('#name', 'Playwright Tester');
    await page.fill('#fatherName', 'Tester Father');
    await page.fill('#mobile', '9898989898');
    await page.fill('#email', 'playwright_test1@example.com');
    await page.fill('#password', 'password123');

    await page.click('button:has-text("Select Class Level")');
    await page.click('div[role="option"]:has-text("Class 5")');

    await page.click('button:has-text("Pay")');
    console.log("Clicked Pay & Continue");

    await page.waitForTimeout(3000);

    const errors = await page.locator('.text-red-500, .border-red-500, .text-destructive, [role="alert"]').allInnerTexts();
    console.log("VALIDATION ERRORS:", errors);

    const toasters = await page.locator('.group.pointer-events-auto').allInnerTexts();
    console.log("TOASTERS:", toasters);

    const currentUrl = page.url();
    console.log("Current URL:", currentUrl);

    await browser.close();
})();
