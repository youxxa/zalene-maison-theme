# Zalene Maison Shopify Theme

Production-ready custom Shopify OS 2.0 theme for Zalene Maison, a luxury modest fashion brand shaped around French-Arabic minimalism, restrained gold accents, and mobile-first commerce.

## Folder Structure

```text
.
├── .github/
│   └── workflows/
│       └── deploy.yml
├── assets/
│   ├── base.css
│   ├── theme.js
│   ├── icon-facebook.svg
│   ├── icon-instagram.svg
│   ├── icon-pinterest.svg
│   ├── icon-tiktok.svg
│   └── icon-youtube.svg
├── config/
│   ├── settings_data.json
│   └── settings_schema.json
├── layout/
│   ├── password.liquid
│   └── theme.liquid
├── locales/
│   └── en.default.json
├── sections/
│   ├── announcement-bar.liquid
│   ├── bestsellers-carousel.liquid
│   ├── brand-story-strip.liquid
│   ├── care-values.liquid
│   ├── cart-drawer.liquid
│   ├── featured-collections-grid.liquid
│   ├── footer.liquid
│   ├── header.liquid
│   ├── homepage-hero.liquid
│   ├── instagram-grid-placeholder.liquid
│   ├── main-404.liquid
│   ├── main-cart.liquid
│   ├── main-collection.liquid
│   ├── main-page.liquid
│   ├── main-product.liquid
│   ├── newsletter-signup-strip.liquid
│   └── related-products.liquid
├── snippets/
│   ├── brand-logo.liquid
│   ├── cart-drawer-item.liquid
│   ├── icon-cart.liquid
│   ├── icon-chevron.liquid
│   ├── icon-close.liquid
│   ├── icon-menu.liquid
│   ├── icon-search.liquid
│   ├── product-card.liquid
│   ├── product-price.liquid
│   ├── responsive-image.liquid
│   ├── section-intro.liquid
│   ├── social-links.liquid
│   └── trust-badges.liquid
└── templates/
    ├── 404.liquid
    ├── cart.liquid
    ├── collection.json
    ├── index.json
    ├── page.liquid
    └── product.json
```

## Theme Architecture

- `layout/theme.liquid`: Global shell, root CSS variables, critical CSS, font loading, and persistent sections.
- `config/settings_schema.json`: All global theme settings exposed to Shopify Admin.
- `config/settings_data.json`: Default theme values for colors, typography, announcement bar, and commerce settings.
- `locales/en.default.json`: All storefront-facing English strings used by Liquid templates.
- `assets/base.css`: All global styling, schemes, spacing scales, and component/section presentation.
- `assets/theme.js`: All interaction logic including drawers, predictive search, AJAX cart, sticky header, sticky add to cart, accordions, and swipe behavior.
- `sections/`: One file per major storefront section or page-level section.
- `snippets/`: Reusable partials for icons, imagery, prices, product cards, brand output, social links, and trust badges.
- `templates/`: Shopify JSON/Liquid templates that assemble the storefront.

## How To Deploy Via GitHub

1. Push this theme to a GitHub repository connected to your Shopify workflow.
2. In GitHub, add these repository secrets:
   - `SHOPIFY_CLI_THEME_TOKEN`
   - `SHOPIFY_STORE`
3. Ensure the token has permission to push themes to the target store.
4. Push changes to `main`.
5. GitHub Actions runs `.github/workflows/deploy.yml` and pushes the theme with Shopify CLI.

The workflow is configured for unpublished theme deployment so it can be reviewed before publishing live.

## How To Customize Via Shopify Admin

- Go to `Online Store > Themes > Customize`.
- Edit homepage and merchandising modules through the section/block settings:
  - Hero, featured collections, brand story, bestsellers, values, Instagram placeholder, newsletter
  - Collection template filtering and pagination mode
  - Product template supporting content like size guide, details, and shipping copy
- Edit global brand controls through `Theme settings`:
  - Logo uploads and logo width
  - Core colors
  - Google Fonts URL and font family names
  - Button shape
  - Announcement bar
  - Social links
  - Free shipping threshold and cart upsells

## Guide For AI Agents

Use this map when you need to edit the theme safely and quickly.

- Colors: edit `config/settings_schema.json`, `config/settings_data.json`, and the root CSS variable bridge in [layout/theme.liquid](/Users/youxxa/Documents/New%20project/layout/theme.liquid:1).
- Typography: edit Google Fonts and font family settings in [config/settings_schema.json](/Users/youxxa/Documents/New%20project/config/settings_schema.json:1) and [layout/theme.liquid](/Users/youxxa/Documents/New%20project/layout/theme.liquid:1).
- Copy and translations: edit [locales/en.default.json](/Users/youxxa/Documents/New%20project/locales/en.default.json:1). Avoid hardcoding storefront English inside Liquid.
- Global styles: edit [assets/base.css](/Users/youxxa/Documents/New%20project/assets/base.css:1).
- Interactive behavior: edit [assets/theme.js](/Users/youxxa/Documents/New%20project/assets/theme.js:1).
- Header, footer, cart drawer, and global chrome: edit files in [sections](/Users/youxxa/Documents/New%20project/sections).
- Shared product card, icon, logo, and social output: edit files in [snippets](/Users/youxxa/Documents/New%20project/snippets).
- Homepage composition: edit [templates/index.json](/Users/youxxa/Documents/New%20project/templates/index.json:1) to reorder or replace sections.
- Collection page composition: edit [templates/collection.json](/Users/youxxa/Documents/New%20project/templates/collection.json:1).
- Product page composition: edit [templates/product.json](/Users/youxxa/Documents/New%20project/templates/product.json:1).
- Cart, page, and 404 routing templates: edit files in [templates](/Users/youxxa/Documents/New%20project/templates).

## Development Notes

- The theme is mobile-first and designed around a 375px baseline.
- All interactive elements target a minimum 48px touch area.
- Images use Shopify CDN output and lazy loading where appropriate.
- CSS follows semantic component naming and BEM-style structure.
- Each Liquid file includes an AI-edit guidance comment block at the top.
