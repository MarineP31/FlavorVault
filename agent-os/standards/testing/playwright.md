## Playwright end-to-end testing guidelines

> **Note:** This project is mobile-only (Expo). Use **Maestro** for E2E testing instead. This standard is preserved for reference if web support is added in the future.

### Test Structure & Style

- **User-centric scenarios**: describe behavior from the user's point of view
- **Accessible selectors first**: `getByRole` → `getByLabelText` → `getByText` → `getByTestId`
- **Short, intention-revealing tests**: follow Arrange–Act–Assert; use `test.step` when it clarifies flow
- **Isolated specs**: no cross-test state; each spec is order-independent

### Assertions & Interactions

- **No sleeps or `waitForTimeout`**: rely on auto-wait and assert end state with `expect(...)`
- **Stable locators**: avoid brittle CSS/XPath/`nth-of-type`; prefer `locator()` with `{ has, hasText }`
- **Do not interact with hidden or disabled elements**
- **Assertions to prefer**: `toBeVisible`, `toHaveText`, `toHaveURL`, `toBeEnabled`, `toBeChecked`, `toHaveAttribute`
- **Non-DOM conditions**: use `expect.poll`

### Configuration & Environment

- **Do not manage servers in specs**: use `webServer` and `use.baseURL`; navigate with `page.goto('/')`
- **Retries and tracing**: keep retries low; enable tracing on first retry
- **Environment assumptions**: engine-agnostic; CI runs headless; standard viewport `1280x720`
- **Type safety**: write tests in TypeScript with `@playwright/test`
