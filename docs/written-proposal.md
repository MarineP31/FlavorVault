# FlavorVault — Written Proposal

## The Problem

Home cooks accumulate recipes from dozens of sources: handwritten family cards, cookbook pages, screenshots, browser bookmarks, social media saves, and PDFs shared by friends. These recipes live in fragmented, unsearchable silos. When it comes time to plan meals for the week, there is no unified place to browse a personal collection, select what to cook, and generate a shopping list.

Existing solutions fall short in three ways:

1. **Manual entry is tedious.** Most recipe apps require users to type every ingredient and instruction by hand. For someone with dozens of paper recipes, this is a non-starter.
2. **The workflow is disconnected.** Saving a recipe, planning a meal, and building a grocery list are treated as separate tasks across separate apps — or done on paper.
3. **Cloud-first apps create friction.** Many recipe platforms require accounts, push social features, and store personal data on remote servers, raising privacy concerns and adding complexity.

## Target Audience

FlavorVault targets three overlapping user segments:

| Segment | Profile | Pain Point |
|---------|---------|------------|
| **Meal Preppers** | Adults 25–45 who plan weekly meals in advance | Need a fast way to go from "what should I cook?" to "what do I buy?" |
| **Home Cooks with Paper Collections** | Anyone with recipes in cookbooks, binders, or handwritten cards | Want to digitize without typing everything manually |
| **Busy Professionals** | Time-constrained individuals who value efficiency | Need an all-in-one tool that eliminates context-switching between apps |

**Primary persona — Sarah (32):** An organized home chef who meal preps every Sunday. She has recipes scattered across a cookbook shelf, a Pinterest board, and a Notes app. She wants one place to store everything, plan the week, and walk into the grocery store with a categorized list on her phone.

**Secondary persona — Marcus (28):** A busy professional who wants to cook more at home but doesn't have time to manually organize recipes. He shares recipe links from his browser and expects them to just work.

## The Solution

FlavorVault is a mobile recipe management app for iOS and Android that covers the entire cooking lifecycle in a single tool:

- **Capture from anywhere.** Photograph a cookbook page — on-device OCR (Google ML Kit / Apple Vision) extracts the recipe automatically. Share a URL from the browser and structured data is parsed via JSON-LD. Or type it in manually.
- **Organize and search.** Tag recipes by cuisine, dietary restriction, meal type, or cooking method. Filter and search across the entire collection.
- **Plan meals.** Queue recipes into a weekly meal plan.
- **Auto-generate a shopping list.** Ingredients from all planned meals are compiled, deduplicated, quantity-aggregated, and sorted by store aisle (Produce, Dairy, Meat, Pantry, Frozen, Bakery).

The key technical differentiator is **zero-cost, offline OCR** — text extraction runs entirely on-device using native ML frameworks, requiring no cloud API calls, no internet connection, and no per-scan fees.

## Monetization Strategy

FlavorVault uses a **freemium model** with a single "Pro" subscription tier, managed through RevenueCat for cross-platform billing on both the App Store and Google Play.

### Free Tier

All core features are available for free with no ads:

- Manual recipe creation and editing
- Recipe import from URLs
- Meal planning
- Shopping list generation
- Tag management and search

The free tier is intentionally generous. The goal is to build a large, engaged user base and establish trust before asking users to pay.

### Pro Tier ("FlavorVault Pro")

The Pro subscription unlocks OCR-powered recipe scanning — the feature with the highest perceived value and the strongest "wow factor" during onboarding:

- **Unlimited OCR scans** from photos
- **Smart text extraction** with confidence scoring
- **Batch recipe digitization** (scan multiple pages in sequence)

### Pricing

| Plan | Price | Notes |
|------|-------|-------|
| Monthly | $2.99/month | Low-commitment entry point |
| Annual | $19.99/year | ~44% savings vs monthly — positioned as "Best Value" |
| Lifetime | $39.99 one-time | For power users who want permanent access |

### Why This Works

1. **Clear value gate.** Free users can do everything except scan. The moment they try to photograph a recipe and are prompted to upgrade, the value proposition is immediately obvious — they can see the extracted text and just need to unlock it.
2. **Low price, high retention.** At $2.99/month, the subscription is an easy impulse decision. The annual plan offers enough savings to drive upgrades.
3. **No ads, ever.** This is a trust signal. Users are more willing to pay when the free experience is clean and respectful.
4. **RevenueCat handles complexity.** Subscription management, receipt validation, cross-platform entitlements, and analytics are handled by RevenueCat — reducing engineering overhead to near-zero.

### Revenue Projections (Conservative)

| Metric | Year 1 |
|--------|--------|
| Free downloads | 10,000 |
| Free-to-Pro conversion | 5% (500 subscribers) |
| Average revenue per subscriber | $24/year (weighted across plans) |
| **Projected annual revenue** | **$12,000** |

These numbers assume organic growth only (no paid acquisition). With App Store Optimization and targeted marketing to the meal-prep community, conversion rates of 8–12% are realistic for a well-executed utility app.

### Future Revenue Opportunities (Phase 2–3)

- **Cloud sync as a Pro feature** — cross-device access as an additional reason to subscribe
- **Nutrition API integration** — automatic calorie and macro tracking, appealing to fitness-focused meal preppers
- **Grocery delivery partnerships** — affiliate revenue from Instacart or similar services (send shopping list directly to delivery)
- **Recipe collections marketplace** — curated recipe packs (e.g., "30 Quick Weeknight Dinners") as one-time purchases

## Conclusion

FlavorVault solves a real, everyday problem with a technically differentiated approach. On-device OCR removes the biggest barrier to recipe digitization — manual data entry — while the integrated meal planning and shopping list workflow delivers immediate, recurring value. The freemium model with a low-priced Pro tier monetizes the highest-value feature without degrading the free experience, creating a sustainable business built on user trust.
