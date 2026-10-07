# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: restaurant.spec.js >> menu page lists dishes from the API with prices
- Location: e2e\restaurant.spec.js:68:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.menu-item-card').first()
Expected: visible
Timeout: 60000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('.menu-item-card').first() with timeout 60000ms
  - waiting for locator('.menu-item-card').first()

```

```yaml
- heading "Page not found" [level=1]
- paragraph: Looks like you’ve followed a broken link or entered a URL that doesn’t exist on this site.
- separator
- paragraph:
  - text: If this is your site, and you weren’t expecting a 404 for this path, please visit Netlify’s
  - link "“page not found” support guide":
    - /url: https://answers.netlify.com/t/support-guide-i-ve-deployed-my-site-but-i-still-see-page-not-found/125?utm_source=404page&utm_campaign=community_tracking
  - text: for troubleshooting tips.
- iframe
```

# Test source

```ts
  1   | /**
  2   |  * End-to-end tests for the Ramey Ko Bhatti website.
  3   |  *
  4   |  * They drive a real browser against a running site. By default that is the
  5   |  * local dev server (http://localhost:5173). To test the live site instead:
  6   |  *   BASE_URL=https://rameykobhatti.netlify.app npx playwright test
  7   |  *
  8   |  * Note: the registration and reservation tests create real rows in the
  9   |  * database the site is connected to, so clean them up afterwards.
  10  |  */
  11  | 
  12  | import {expect, test} from '@playwright/test';
  13  | 
  14  | const PASSWORD = 'Test-password-123';
  15  | 
  16  | /**
  17  |  * Creates a unique test user so repeated runs do not collide.
  18  |  * @returns {{name: string, email: string}} fresh test account details
  19  |  */
  20  | const newUser = () => {
  21  |   const id = Date.now();
  22  |   return {name: `E2E User ${id}`, email: `e2e-${id}@example.com`};
  23  | };
  24  | 
  25  | /**
  26  |  * Registers a new account through the UI.
  27  |  * @param {import('@playwright/test').Page} page - Playwright page
  28  |  * @param {{name: string, email: string}} user - account to create
  29  |  */
  30  | const register = async (page, user) => {
  31  |   await page.goto('/login');
  32  |   await page.locator('.login-tabs button', {hasText: 'Register'}).click();
  33  |   await page.getByPlaceholder('Your name').fill(user.name);
  34  |   await page.getByPlaceholder('you@example.com').fill(user.email);
  35  |   await page.getByPlaceholder('Create a password').fill(PASSWORD);
  36  | 
  37  |   const response = page.waitForResponse('**/api/register');
  38  |   await page.locator('.login-submit-button').click();
  39  |   expect((await response).status()).toBe(201);
  40  | };
  41  | 
  42  | /**
  43  |  * Logs in through the UI.
  44  |  * @param {import('@playwright/test').Page} page - Playwright page
  45  |  * @param {string} email - account email
  46  |  * @param {string} password - account password
  47  |  * @returns {Promise<import('@playwright/test').Response>} the login response
  48  |  */
  49  | const login = async (page, email, password) => {
  50  |   await page.goto('/login');
  51  |   await page.locator('.login-tabs button', {hasText: 'Login'}).click();
  52  |   await page.getByPlaceholder('you@example.com').fill(email);
  53  |   await page.getByPlaceholder('Your password').fill(password);
  54  | 
  55  |   const response = page.waitForResponse('**/api/login');
  56  |   await page.locator('.login-submit-button').click();
  57  |   return response;
  58  | };
  59  | 
  60  | test('home page loads with the main navigation', async ({page}) => {
  61  |   await page.goto('/');
  62  | 
  63  |   await expect(page.getByRole('link', {name: 'OUR MENU'}).first()).toBeVisible();
  64  |   await expect(page.getByRole('link', {name: 'LUNCH'}).first()).toBeVisible();
  65  |   await expect(page.getByRole('link', {name: 'CONTACT'}).first()).toBeVisible();
  66  | });
  67  | 
  68  | test('menu page lists dishes from the API with prices', async ({page}) => {
  69  |   await page.goto('/menu');
  70  | 
  71  |   const cards = page.locator('.menu-item-card');
> 72  |   await expect(cards.first()).toBeVisible({timeout: 60000});
      |                               ^ Error: expect(locator).toBeVisible() failed
  73  |   expect(await cards.count()).toBeGreaterThan(0);
  74  | 
  75  |   // every dish shows a price
  76  |   await expect(page.locator('.menu-price').first()).toContainText(/\d/);
  77  | });
  78  | 
  79  | test('a dish opens its details panel', async ({page}) => {
  80  |   await page.goto('/menu');
  81  | 
  82  |   await page.locator('.menu-details-button').first().click({timeout: 60000});
  83  | 
  84  |   await expect(page.locator('.details-panel')).toBeVisible();
  85  | });
  86  | 
  87  | test("lunch page highlights today's menu", async ({page}) => {
  88  |   await page.goto('/lunch');
  89  | 
  90  |   const todayLabel = page.locator('.today-lunch-label').first();
  91  |   await expect(todayLabel).toBeVisible({timeout: 60000});
  92  | 
  93  |   const isWeekend = [0, 6].includes(new Date().getDay());
  94  | 
  95  |   if (isWeekend) {
  96  |     await expect(todayLabel).toContainText('WEEKEND');
  97  |   } else {
  98  |     const dayName = new Date().toLocaleDateString('en-US', {weekday: 'long'});
  99  |     await expect(todayLabel).toContainText(dayName.toUpperCase());
  100 |     await expect(page.locator('.today-row').first()).toBeVisible();
  101 |   }
  102 | });
  103 | 
  104 | test('login fails with a wrong password', async ({page}) => {
  105 |   const response = await login(page, 'nobody@example.com', 'wrong-password');
  106 | 
  107 |   expect(response.status()).toBe(401);
  108 |   expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
  109 | });
  110 | 
  111 | test('a new customer can register and log in', async ({page}) => {
  112 |   const user = newUser();
  113 | 
  114 |   await register(page, user);
  115 |   const response = await login(page, user.email, PASSWORD);
  116 | 
  117 |   expect(response.status()).toBe(200);
  118 | 
  119 |   const token = await page.evaluate(() => localStorage.getItem('token'));
  120 |   expect(token).toBeTruthy();
  121 | 
  122 |   const stored = await page.evaluate(() => localStorage.getItem('user'));
  123 |   expect(JSON.parse(stored).role).toBe('customer');
  124 | });
  125 | 
  126 | test('a logged-in customer can book a table', async ({page}) => {
  127 |   const user = newUser();
  128 | 
  129 |   await register(page, user);
  130 |   await login(page, user.email, PASSWORD);
  131 | 
  132 |   await page.goto('/reservation');
  133 |   await page.getByPlaceholder('Your name').fill(user.name);
  134 |   await page.locator('input[type="number"]').fill('3');
  135 |   await page.locator('input[type="date"]').fill('2030-01-15');
  136 |   await page.locator('input[type="time"]').fill('18:30');
  137 | 
  138 |   const response = page.waitForResponse('**/api/reservations');
  139 |   await page.locator('.reservation-button').click();
  140 | 
  141 |   expect((await response).status()).toBe(201);
  142 | });
  143 | 
```