const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function capture() {
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('🚀 Launching Headless Chrome...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Desktop Landing Page Hero
  console.log('📸 1. Capturing Landing Page Hero...');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(screenshotsDir, 'landing_hero.png') });

  // 2. Full Landing Page
  console.log('📸 2. Capturing Full Landing Page...');
  await page.screenshot({ path: path.join(screenshotsDir, 'landing_page_full.png'), fullPage: true });

  // 3. Mobile Landing Page
  console.log('📸 3. Capturing Mobile Landing Page...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(screenshotsDir, 'landing_mobile.png') });

  // 4. Login Screen
  console.log('📸 4. Capturing Login Screen...');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(screenshotsDir, 'login.png') });

  // 5. Perform Login
  console.log('🔑 Logging into Dashboard as admin_demo...');
  await page.type('input[type="text"]', 'admin_demo');
  await page.type('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Wait for client-side navigation to /dashboard
  await page.waitForFunction(() => window.location.pathname.includes('/dashboard'), { timeout: 10000 });
  await new Promise(r => setTimeout(r, 2000));

  // 6. Capture Dark Mode Dashboard
  console.log('📸 5. Capturing Dark Mode Dashboard...');
  await page.screenshot({ path: path.join(screenshotsDir, 'dashboard_dark.png') });

  // 7. Click first ticket thread button to open Discussion Modal
  console.log('📸 6. Opening Discussion Modal & Capturing...');
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.innerText, b);
    if (text && text.includes('Thread')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(screenshotsDir, 'ticket_discussion_modal.png') });

  // Close modal
  const closeBtns = await page.$$('button');
  for (const b of closeBtns) {
    const text = await page.evaluate(el => el.innerText, b);
    if (text && text.includes('✕')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 600));

  // 8. Capture Light Mode Dashboard
  console.log('📸 7. Capturing Light Mode Dashboard...');
  const themeToggle = await page.$('button[title*="Light"]');
  if (themeToggle) {
    await themeToggle.click();
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(screenshotsDir, 'dashboard_light.png') });
  }

  // 9. Mobile Dashboard
  console.log('📸 8. Capturing Mobile Dashboard View...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(screenshotsDir, 'dashboard_mobile.png') });

  await browser.close();
  console.log('✅ All real screenshots captured successfully in /screenshots!');
}

capture().catch(err => {
  console.error('❌ Screenshot capture error:', err);
  process.exit(1);
});
