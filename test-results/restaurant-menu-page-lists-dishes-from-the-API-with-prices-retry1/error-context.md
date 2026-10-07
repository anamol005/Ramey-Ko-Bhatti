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
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('.menu-item-card').first() with timeout 60000ms
  - waiting for locator('.menu-item-card').first()
  - Target page, context or browser has been closed

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

```
Error: browserContext._wrapApiCall: Target page, context or browser has been closed
```