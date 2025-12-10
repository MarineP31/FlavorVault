## SSR Strategy & Architecture

> **Note:** This project is mobile-only (Expo/React Native). SSR is not applicable. These standards are preserved for reference if web support is added in the future.

- **Prefer Server Side Rendering (SSR)**: Use SSR for pages requiring data fetching at render time over CSR for better performance, SEO, and initial load times
- **Avoid Legacy Pages Router**: Do not use `getServerSideProps` or `getStaticProps`; adhere to App Router patterns for modern SSR implementation

## Server Components

- **Default to Server Components**: In App Router, default to Server Components; use Client Components only when requiring browser APIs, interactivity, or state management
- **Async Server Components**: Define Server Components as async functions to enable direct data fetching with await
- **Direct Data Fetching**: Fetch data directly within Server Components using async/await for initial page loads, direct database/file access, reducing client-side bundle size
- **No React Hooks**: Server Components cannot use hooks (useState, useEffect) as they execute solely on the server without browser environment access
- **Progressive Rendering with Suspense**: Implement Suspense boundaries for streaming dynamic content while keeping static parts instantly renderable

## Data Fetching & Caching

- **Fetch Caching Strategies**: Utilize Next.js fetch with caching options (default cached, `next: { revalidate }` for timed revalidation, `cache: 'no-store'` for always-fresh data)
- **Cache Invalidation**: Use `revalidatePath()` or `revalidateTag()` after mutations to update cached data and reflect changes across the application
