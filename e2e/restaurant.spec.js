/**
 * End-to-end tests for the Ramey Ko Bhatti website.
 *
 * They drive a real browser against a running site. By default that is the
 * local dev server (http://localhost:5173). To test the live site instead:
 *   BASE_URL=https://rameykobhatti.netlify.app npx playwright test
 *
 * Note: the registration and reservation tests create real rows in the
 * database the site is connected to, so clean them up afterwards.
 */

import {expect, test} from '@playwright/test';

const PASSWORD = 'Test-password-123';

/**
 * Creates a unique test user so repeated runs do not collide.
 * @returns {{name: string, email: string}} fresh test account details
 */
const newUser = () => {
  const id = Date.now();
  return {name: `E2E User ${id}`, email: `e2e-${id}@example.com`};
};

/**
 * Registers a new account through the UI.
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {{name: string, email: string}} user - account to create
 */
const register = async (page, user) => {
  await page.goto('/login');
  await page.locator('.login-tabs button', {hasText: 'Register'}).click();
  await page.getByPlaceholder('Your name').fill(user.name);
  await page.getByPlaceholder('you@example.com').fill(user.email);
  await page.getByPlaceholder('Create a password').fill(PASSWORD);

  const response = page.waitForResponse('**/api/register');
  await page.locator('.login-submit-button').click();
  expect((await response).status()).toBe(201);
};

/**
 * Logs in through the UI.
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} email - account email
 * @param {string} password - account password
 * @returns {Promise<import('@playwright/test').Response>} the login response
 */
const login = async (page, email, password) => {
  await page.goto('/login');
  await page.locator('.login-tabs button', {hasText: 'Login'}).click();
  await page.getByPlaceholder('you@example.com').fill(email);
  await page.getByPlaceholder('Your password').fill(password);

  const response = page.waitForResponse('**/api/login');
  await page.locator('.login-submit-button').click();
  return response;
};

test('home page loads with the main navigation', async ({page}) => {
  await page.goto('/');

  await expect(page.getByRole('link', {name: 'OUR MENU'}).first()).toBeVisible();
  await expect(page.getByRole('link', {name: 'LUNCH'}).first()).toBeVisible();
  await expect(page.getByRole('link', {name: 'CONTACT'}).first()).toBeVisible();
});

test('menu page lists dishes from the API with prices', async ({page}) => {
  await page.goto('/menu');

  const cards = page.locator('.menu-item-card');
  await expect(cards.first()).toBeVisible({timeout: 60000});
  expect(await cards.count()).toBeGreaterThan(0);

  // every dish shows a price
  await expect(page.locator('.menu-price').first()).toContainText(/\d/);
});

test('a dish opens its details panel', async ({page}) => {
  await page.goto('/menu');

  await page.locator('.menu-details-button').first().click({timeout: 60000});

  await expect(page.locator('.details-panel')).toBeVisible();
});

test("lunch page highlights today's menu", async ({page}) => {
  await page.goto('/lunch');

  const todayLabel = page.locator('.today-lunch-label').first();
  await expect(todayLabel).toBeVisible({timeout: 60000});

  const isWeekend = [0, 6].includes(new Date().getDay());

  if (isWeekend) {
    await expect(todayLabel).toContainText('WEEKEND');
  } else {
    const dayName = new Date().toLocaleDateString('en-US', {weekday: 'long'});
    await expect(todayLabel).toContainText(dayName.toUpperCase());
    await expect(page.locator('.today-row').first()).toBeVisible();
  }
});

test('login fails with a wrong password', async ({page}) => {
  const response = await login(page, 'nobody@example.com', 'wrong-password');

  expect(response.status()).toBe(401);
  expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
});

test('a new customer can register and log in', async ({page}) => {
  const user = newUser();

  await register(page, user);
  const response = await login(page, user.email, PASSWORD);

  expect(response.status()).toBe(200);

  const token = await page.evaluate(() => localStorage.getItem('token'));
  expect(token).toBeTruthy();

  const stored = await page.evaluate(() => localStorage.getItem('user'));
  expect(JSON.parse(stored).role).toBe('customer');
});

test('a logged-in customer can book a table', async ({page}) => {
  const user = newUser();

  await register(page, user);
  await login(page, user.email, PASSWORD);

  await page.goto('/reservation');
  await page.getByPlaceholder('Your name').fill(user.name);
  await page.locator('input[type="number"]').fill('3');
  await page.locator('input[type="date"]').fill('2030-01-15');
  await page.locator('input[type="time"]').fill('18:30');

  const response = page.waitForResponse('**/api/reservations');
  await page.locator('.reservation-button').click();

  expect((await response).status()).toBe(201);
});
