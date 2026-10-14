# Landing page redesign: Bintang Megamall 30th Anniversary × Meritz Hotel

Date: 14.10.2026
Status: draft for owner review
Live site today: https://meritz-30th.netlify.app (Netlify, auto-deploys from GitHub `jeminajames28-stack/Meritz`, branch `main`)

## 1. Goal

Redesign the tenant campaign page so a shop manager on a phone understands in a few seconds what they get, registers their shop and voucher in about five minutes, and can sign up for Meritz Hotel TV advertising. The page must look current, in a 2026 editorial hotel style, keep the original colours, use GSAP for motion, and stay fast and smooth on mid-range Android phones.

## 2. Decisions taken with the owner

| Topic | Decision |
|---|---|
| Brand | Co-branded. Bintang Megamall 30th Anniversary logo and Meritz Hotel logo side by side. Logos only on light backgrounds |
| Direction | "A, Anniversary editorial", modernised: Instrument Serif + Geist, flat surfaces, thin rules, strict grid, few words, consistent spacing, no large empty areas |
| Colours | Original crimson family. The gold from the 30th logo is a small accent only |
| Header | No header bar. Logos scroll away with the first screen. Desktop: two small fixed corner buttons. Phone: split bottom bar after the first screen |
| "30 years" badge on the photo | Removed |
| Voucher campaign | Shops register shop details and one or more vouchers through the page's own form. Vouchers are promoted on in-mall screens and posters |
| TV advertising | Separate Meritz Hotel offer, registered through the owner's Google Form (QR code + button). No database change |
| TV ad wording | Exactly as on the flyer: "Free advertisement for 3 months", "Extend 4th month · Standard package · RM300 / month", "Long term option · 6-month commitment package · RM200 / month (pay for 6 months)" |
| Dates | No deadline known. A hidden "Registration closes …" slot is built in and switched on when a date is given |
| After submit | "Our campaign team will contact you to confirm your vouchers", plus WhatsApp and call buttons for Jonathan (until the owner names another contact) |
| Animation | GSAP replaces framer-motion |
| Inspiration | Awwwards Hotel / Restaurant collection, as the owner asked (Tandjung Sari, Velaa, Schlosshotel Kitzbühel, Vander), plus current Dribbble landing pages |

## 3. Audience and success criteria

Audience: owners, managers and marketing staff of Bintang Megamall shops, mostly on phones, English copy.

The redesign succeeds when:

1. On a 375 px phone, the headline, one sentence and the "Register your shop" button are visible without scrolling.
2. A tenant can finish the form one-handed in about five minutes, and nothing typed is lost if they leave and come back on the same device.
3. First-screen download is under 1 MB and Google PageSpeed (mobile) scores 90 or more.
4. All text and controls meet WCAG 2.2 AA.
5. Database contract is unchanged: the form still calls `register_tenant` with the same fields.

## 4. Scope

In scope: the landing page, the registration flow, motion, image optimisation, page metadata (title, description, share image, favicon).

Out of scope (each needs a separate decision): any database change, storing TV ad sign-ups in Supabase, file or logo uploads, a list of participating shops, live counters, a countdown, a language switch, dark mode, email confirmations.

## 5. Visual system

### 5.1 Colour tokens

Defined once in `tailwind.config.js` under `theme.extend.colors.brand`. No raw hex values in components.

| Token | Hex | Use | Measured contrast |
|---|---|---|---|
| `deepest` | `#3d081d` | Darkest maroon, rare accents | |
| `deep` | `#5a0d2a` | Headings, dark buttons, dark plan card | 13.15:1 on surface |
| `primary` | `#a20f43` | Main buttons, italic headline accent, links, focus ring | white on it 7.82:1; as text 7.47:1 on surface |
| `primary-hover` | `#7a1236` | Hover and pressed state of primary | white on it 10.67:1 |
| `pink` | `#f5b2c8` | Accent text on dark only | 7.92:1 on deep; never on light |
| `border` | `#edc5d2` | Dashed ticket divider, decorative outlines | decorative |
| `line` | `#ead7dd` | Thin rules between rows and sections (tint derived from `border` and `surface`) | decorative |
| `surface` | `#fff8fa` | Page background | |
| `soft` | `#fff0f4` | Selected or hover fills | |
| `blush` | `#f8e9ee` | Section 02 background, preview panel | |
| `ink` | `#1c1917` | Body text, field values | 16.71:1 on surface |
| `muted` | `#6f5360` | Secondary text, labels, helper text, placeholders | 6.51:1 on surface, 5.80:1 on blush |
| `input-border` | `#9a8790` | Field outlines (3:1 rule for controls) | 3.21:1 on surface |
| `gold` | `#c18912` | Thin gold rule on the long term plan; never as small text on light | |
| `gold-text` | `#87600d` | Small gold labels on light backgrounds | 5.41:1 on surface |
| `error` | `#b91c1c` | Field errors, always with an icon and text | 6.18:1 on surface |
| `error-soft` | `#fef2f2` | Error banner background | |

Success states reuse `primary-hover` with a check icon. No green is added.

### 5.2 Typography

Two families from Google Fonts with `display=swap` and `preconnect`: Instrument Serif (regular + italic) and Geist (400, 500).

| Role | Font | Phone | Desktop (≥ 1024 px) | Notes |
|---|---|---|---|---|
| Hero headline | Instrument Serif | 44 px / 0.95 | `clamp()` up to 96 px / 0.95 | One italic phrase in `primary` |
| Section heading | Instrument Serif | 34 px / 1.0 | 56 px / 1.0 | Sentence case, tracking -0.015em, one italic phrase allowed |
| Large numbers ("290", prices) | Instrument Serif | 64 px ("290"), 24-40 px prices | 120 px ("290"), 40 px prices | Tabular feel, no animation of font size |
| Label | Geist 500 | 12 px, 0.14em, uppercase | same | `gold-text` or `muted` |
| Body | Geist 400 | 16 / 24 px | 17 / 26 px | |
| Button | Geist 500 | 13 px, 0.08em, uppercase | same | Nothing under 12 px anywhere |
| Field text | Geist 400 | 16 px | 16 px | 16 px stops iOS zoom |

### 5.3 Spacing, shape, depth

- Spacing scale, used everywhere: 8 · 16 · 24 · 40 · 64 px (Tailwind `2 · 4 · 6 · 10 · 16`). Inside a block 8-24, between blocks 40, between sections 64 on desktop and 40 on phones. Side margin 40 px desktop, 24 px phone (16 px under 360 px wide).
- Radius: 6 px buttons and fields, 10-12 px photos and panels.
- Borders: 1 px `line` rules. No drop shadows except the floating corner buttons (one soft shadow).
- Icons: lucide-react only, 1.5 px stroke, used sparingly (error, check, arrow, external link, WhatsApp-style message icon).
- No gradients, no blur, no glass, no decorative blobs.

### 5.4 Signature elements

- Voucher ticket: white card, 1 px `line` border, dashed `border` divider before a value stub, two semicircle notches, shop name in Instrument Serif, value in `primary`. One shared component used in section 01, the live form preview, Review and Done.
- Photo collage: large mall photo with the hotel room photo overlapping its lower-left corner, framed by a 6 px `surface` border.

## 6. Page structure and copy

One scrolling page in this order. All copy below is final unless the owner changes it.

### 6.0 Top of page and persistent actions

- No header bar. A logo lockup (Bintang Megamall 30th logo, 1 px divider, Meritz Hotel logo) sits at the top of the first screen and scrolls away with it.
- Desktop: two small fixed buttons top-right: "Register your shop" (solid `primary`) and "TV advertising" (outlined). They fade in after the first screen has scrolled out of view. "Register your shop" opens the registration screen; "TV advertising" scrolls to section 02.
- Phone: a split bottom bar, 48 px tall, `surface` background, 1 px top rule: "Register shop" | "TV ads". It appears after the first screen, hides while scrolling down, returns on scroll up, respects the iPhone safe area, and is hidden on the registration screen. "Register shop" opens the registration screen; "TV ads" scrolls to section 02.

### 6.1 First screen

- Height: about 85-90 % of the viewport (`svh`) so the next section peeks in.
- Label: "Bintang Megamall × Meritz Hotel"
- Headline: "Thirty years. *Your shop's* turn."
- Sentence: "Add one voucher. We feature your shop on screens and posters across the mall."
- Primary button: "Register your shop" (opens the registration screen). Secondary link: "Advertise on hotel TVs" (scrolls to section 02).
- Optional chip (hidden until a date is set in `content.ts`): "Registration closes {date}" (no date decided yet).
- Visual: photo collage (desktop right column, 7 : 5 grid; phone below the buttons, top edge visible on the first screen).

### 6.2 Section 01 · Shop tenants

- Label: "01 · Shop tenants"
- Heading: "Three steps. *Five minutes.*"
- Steps (numbered rows with thin rules): "Shop details", "Your voucher", "Review & send"
- Preview panel (`blush`): label "Your voucher, as shoppers see it", a sample ticket ("Your Shop", "Storewide", "30%"), caption "Shown on screens and posters across Bintang Megamall."
- Button: "Register your shop"

### 6.3 Section 02 · Meritz TV advertising

- Background: `blush`.
- Label: "02 · Meritz Hotel · Exclusive for Bintang tenants"
- Heading: "Your ads, *our TVs.*"
- Large number: "290" with "hotel rooms + public areas"
- One line: "Reach hotel guests during their stay."
- Photo: hotel room with the in-room TV showing a shop ad (flyer crop until the original is supplied).
- Offer: label "Special offer", then "Free advertisement for 3 months"
- Plans, side by side on desktop, stacked on phone, separated by one 1 px rule, no filled cards:
  - "Extend 4th month" · "Standard package" · "RM300 / month"
  - "Long term option" · "6-month commitment package" · "RM200 / month (pay for 6 months)" (marked with a thin `gold` top rule)
- Desktop action row: the owner's QR code (about 120 px) · "Scan with your phone to register" · button "Open Google Form" · contact line "Artwork & questions: Jonathan · +60 10 978 0807" (tel link).
- Phone action row: no QR. Buttons "Register for TV ads" (Google Form) and "WhatsApp Jonathan", then the contact line "Artwork & questions: Jonathan · +60 10 978 0807" (tel link).
- Links: Google Form `https://forms.gle/8ug7ggcsWoBFGJxbA` (decoded from the owner's QR), WhatsApp `https://wa.me/60109780807`, phone `tel:+60109780807`. External links open in a new tab with `rel="noopener noreferrer"`.

### 6.4 Closing

- Heading: "Let's promote *together.*"
- Buttons: "Register your shop" (registration screen) and "Register for TV ads" (opens the Google Form in a new tab).

### 6.5 Footer

- Light background so both logos stay readable.
- Logo lockup, links "Official website" (bintangmegamall.com), "Directory", "Contact", and "Artwork & questions: Jonathan · +60 10 978 0807".
- Line: "© 2026 Bintang Megamall · Meritz Hotel".

### 6.6 Removed from the current page

"Celebrating every category" cards, the "Why advertise" icon row, decorative blobs, the hot-linked Pexels confetti image, the runtime QR from api.qrserver.com, and the hero button labelled "Register" that opened the mall website.

## 7. Registration flow

### 7.1 Navigation and state

- The registration screen has its own address: the page URL plus `#register`. Opening it pushes a history entry, so the browser Back button returns to the page. Deep links and future QR codes can point to it.
- Every view change and every step change scrolls to the top and moves focus to the step heading.
- Draft saving: tenant details, vouchers and current step are saved to `localStorage` (key `bmm30-registration-draft-v1`) 300 ms after the last change. On return the draft is restored with the note "We kept your unfinished registration." and a "Start over" link. The draft is cleared after a successful submit. All storage access is wrapped in try/catch; the form works without storage.

### 7.2 Layout

- Desktop: form on the left, live voucher ticket on the right, sticky while scrolling.
- Phone: one column, one field per row, compact ticket at the top of step 2.
- Progress: three-part bar plus the text "Step 2 of 3 · Your voucher" on every screen size.
- The bottom bar and corner buttons are hidden on this screen.

### 7.3 Steps

| Step | Fields | Behaviour |
|---|---|---|
| 1 · Shop details | Shop name · Unit / lot no. · Category (the 13 existing `SHOP_CATEGORIES`, values unchanged) · Contact person · Phone (`type="tel"`, `autocomplete="tel"`) · Email (`type="email"`, `autocomplete="email"`) | "Continue" validates the step |
| 2 · Your voucher | Offer title · Discount ("30%" or "RM50") · Short description (textarea) · Valid from · Valid until · Quantity (`inputmode="numeric"`) · Terms (textarea) | Ticket preview updates as you type. "Add another voucher" up to 20. Extra vouchers collapse to a list row (title + value) with Edit and Remove buttons (44 px, named for screen readers) |
| 3 · Review & send | All shop details and every voucher as a ticket | Dates shown as "1 Dec 2026". "Edit" jumps to the step and shows a "Back to review" button. "Send registration" shows a spinner, is disabled while sending, and cannot be double-submitted |
| Done | "You're in, {contact person}." · reference ID (first 8 characters of the returned id, uppercase) · "Our campaign team will contact you to confirm your vouchers." | Buttons "WhatsApp Jonathan", "Call Jonathan", "Register another shop", "Back to page". Line "Want your ad in 290 hotel rooms too?" linking to the Google Form |

### 7.4 Validation

Rules mirror the server function so nothing passes in the browser and fails on send.

| Field | Rule | Message |
|---|---|---|
| All tenant fields | Required after trimming, at most 200 characters | "{Field} is required" / "Keep this under 200 characters" |
| Category | One of `SHOP_CATEGORIES` | "Choose a category" |
| Phone | At least 7 digits; only digits, spaces, `+`, `-`, `(`, `)` | "Enter a phone number with at least 7 digits" |
| Email | Basic `name@domain.tld` shape | "Enter a valid email address" |
| Voucher text fields | Required after trimming, at most 5000 characters | "{Field} is required" |
| Valid from / until | Both required; until ≥ from; until not before today (Malaysia time) | "End date must be on or after the start date" / "End date can't be in the past" |
| Quantity | Whole number ≥ 1 | "Quantity must be at least 1" |
| Vouchers | 1 to 20 | "Add at least one voucher" / "You can add up to 20 vouchers" |

- Fields validate on blur and again on Continue. Continue moves focus to the first invalid field.
- Errors sit under the field: icon + text in `error`, linked with `aria-describedby`, field marked `aria-invalid`, announced through an `aria-live` region.
- Send errors: network failure shows "Couldn't send. Check your connection and try again." A server validation message shows "Some details need checking. Please review and try again." Raw database text is never shown.
- Validation lives in one pure module (`validation.ts`) covered by unit tests.

### 7.5 Data contract (unchanged)

`supabase.rpc('register_tenant', { p_tenant: { shop_name, unit_lot_number, category, contact_person, phone, email }, p_vouchers: [{ title, discount_value, description, valid_from: 'YYYY-MM-DD', valid_until: 'YYYY-MM-DD', quantity, terms }] })` returns the new tenant id. Values are trimmed before sending.

## 8. Motion (GSAP)

### 8.1 Setup

- Dependencies: add `gsap` and `@gsap/react`; remove `framer-motion`. Plugins: ScrollTrigger and SplitText (free for commercial use since 2025).
- All animations live in `useGSAP` hooks with a component scope, so they clean up on unmount.
- Starting states are set by GSAP inside the hook (layout effect, before paint). No content is hidden by CSS, so the page stays readable if scripts are slow.
- One `gsap.matchMedia()` setup with three conditions: desktop (`min-width: 1024px` and motion allowed), phone (`max-width: 1023px` and motion allowed), reduced motion (`prefers-reduced-motion: reduce`, everything shown in its final state).
- Shared tokens in `src/lib/motion.ts`: ease `power3.out` (enter) and `power2.in` (exit), durations 0.3 / 0.6 / 1.2 s, stagger 0.06 s.

### 8.2 Animation list

| Moment | Desktop | Phone | Reduced motion |
|---|---|---|---|
| First screen intro (one timeline) | Headline lines rise from a mask (SplitText lines), label/sentence/buttons fade up 16 px, mall photo reveals upward (clip-path inset), hotel photo slides into its corner. About 1.2 s | Same order, opacity and 16 px rise only, about 0.8 s | None |
| First screen scroll | Photos drift up to 24 px (scrubbed), stops when off screen | None | None |
| Section titles and rows | Fade up 16 px, stagger 0.06 s, once, via `ScrollTrigger.batch` | Same, smaller groups | None |
| Voucher ticket (section 01) | Settles from -2° and 16 px, once | Same | None |
| "290" | Counts from 0 to 290 once, 1.2 s | Same | Shows 290 |
| Long term plan | Gold rule draws across (scaleX), once | Same | Shown |
| Corner buttons / bottom bar | Corner buttons fade in after the first screen | Bar slides in, hides on scroll down, returns on scroll up (yPercent) | Always visible after the first screen, no sliding |
| Form step change | Outgoing step fades and moves 12 px left (0.2 s), incoming fades in (0.3 s), progress bar segment fills | Same, shorter | Instant |
| Live preview value change | Value scales 1 → 1.04 → 1 (0.2 s) | Same | None |
| Done | Check mark draws (stroke), reference ID fades in | Same | Shown |
| Button hover | Arrow moves 4 px right (CSS transition, not GSAP) | Press state on tap | Colour change only |

### 8.3 Performance rules

Animate only `transform` and `opacity` (plus the one clip-path reveal on desktop). No loops. No blur or backdrop filters. No scroll hijacking, horizontal scroll, preloader or video. ScrollTriggers are batched and use `once: true` where possible.

## 9. Performance and accessibility targets

| Measure | Target |
|---|---|
| First-screen transfer (phone) | under 1 MB |
| Hero photo on phone | under 120 KB (WebP, `srcset` 640 / 960 / 1188 w, `sizes`) |
| JavaScript | under 160 KB gzip |
| PageSpeed Insights, mobile | Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95 |
| Largest Contentful Paint | under 2.5 s (Lighthouse mobile simulation) |
| Cumulative Layout Shift | under 0.1 (every image has width/height or aspect-ratio) |
| Accessibility | WCAG 2.2 AA: contrast per section 5.1, 44 px targets, visible 2 px `primary` focus ring with 2 px offset (`pink` on dark), keyboard reachable, one `h1`, correct alt text for both logos and photos, labelled fields, zoom allowed |

Images are converted once by a script (Pillow, already installed) into WebP at the needed widths and committed under `src/images/optimised/`. Below-the-fold images use `loading="lazy"` and `decoding="async"`. The hero photo uses `fetchpriority="high"`.

## 10. Technical structure

Stack stays React 18 + Vite 5 + TypeScript strict + Tailwind 3.4, `@/` imports.

| File | Responsibility |
|---|---|
| `src/App.tsx` | Chooses landing or registration from the URL hash; holds the submit call to `register_tenant` |
| `src/content.ts` | All copy and constants: Google Form URL, WhatsApp and phone links, the "290" figure, optional deadline |
| `src/lib/motion.ts` | GSAP plugin registration, matchMedia conditions, shared eases and durations |
| `src/lib/useHashView.ts` | Hash routing with history entries and scroll/focus reset |
| `src/lib/format.ts` | Date formatting ("1 Dec 2026"), today in Malaysia time |
| `src/components/landing/Hero.tsx` | First screen and logo lockup |
| `src/components/landing/ShopTenants.tsx` | Section 01 |
| `src/components/landing/TvAdvertising.tsx` | Section 02 |
| `src/components/landing/Closing.tsx` | Closing band |
| `src/components/landing/Footer.tsx` | Footer |
| `src/components/landing/FloatingActions.tsx` | Desktop corner buttons and phone bottom bar |
| `src/components/ui/VoucherTicket.tsx` | Shared ticket card |
| `src/components/ui/Field.tsx` | Label, input or textarea or select, hint, error wiring |
| `src/components/register/RegistrationFlow.tsx` | Step state, draft restore and save, submit, error handling |
| `src/components/register/ShopStep.tsx`, `VoucherStep.tsx`, `ReviewStep.tsx`, `DoneScreen.tsx`, `Progress.tsx` | One step each |
| `src/components/register/validation.ts` | Pure validation rules (unit tested) |
| `src/components/register/draft.ts` | localStorage save, restore, clear |

Removed: `src/components/Categories.tsx`, `HowItWorks.tsx`, `PromoSection.tsx`, old `Hero.tsx`, old `RegistrationForm.tsx`, `src/lib/animations.ts`, unused helpers in `src/lib/hooks.ts`.

`index.html`: title "Bintang Megamall 30th Anniversary × Meritz Hotel · Tenant registration", meta description, Open Graph and Twitter image (1200 × 630: mall photo with both logos on a light `surface` panel, never on the photo), favicon from the Meritz flower (owner may swap), Google Fonts links, `lang="en"`, viewport without zoom limits.

Dev dependency: `vitest` for the validation, draft and format modules.

## 11. Verification before "done"

1. `npm run typecheck`, `npm run lint`, `npm run build` and the unit tests pass.
2. Local production preview checked in the browser at 375, 768, 1024 and 1440 px, plus one pass with the reduced-motion branch forced on.
3. Form walk-through with invalid input on every field, the 20-voucher limit, Edit and Back to review, draft restore after reload. No submit locally.
4. Owner approves the result. Commit and push to `main` only when the owner explicitly says so (Netlify then publishes in about a minute).
5. On the live site: PageSpeed Insights mobile run against the targets in section 9. A test registration on the live site only if the owner agrees at that time; the owner deletes it afterwards.

## 12. Owner inputs still needed

- The original hotel room photo (the flyer crop is about 340 px wide and looks soft).
- A registration deadline, if any, to switch on the date chip.
- Confirm Jonathan (+60 10 978 0807) is the contact shown after a voucher registration, or give another name and number.
- Favicon choice: Meritz flower (default) or the Bintang 30th mark.

## 13. Risks

| Risk | Mitigation |
|---|---|
| Hotel photo too small | Displayed at most about 360 px wide until the original arrives |
| Mall photo is 1188 px wide, soft on very wide screens | Collage keeps it at most about 560 px wide on desktop |
| Google Fonts is a third-party request | `display=swap`, two families only; can be self-hosted later |
| Google Form content is controlled outside this project | Page only links to it; button label says it opens a Google Form |
| Draft saved on a shared device | Stored only in that browser, cleared after submit, "Start over" clears it |

## 14. Changes after the independent review (14.10.2026)

These replace the matching lines above where they differ.

- Loading: the hero photo variants live in `public/hero/` with fixed names and are preloaded in `index.html`. The hero photo is not animated on phones. The registration screen and the Supabase client load only when `#register` opens.
- Hero photo budget: phone 100 KB or less (960 px WebP measures 92 KB), desktop 140 KB or less. First screen uses `min-height: 88svh` and is never clipped.
- Registration screen navigation: a top row with "Back to page" (step 1) or "Back" (steps 2 and 3), and "Back" next to "Continue" / "Send registration". System Back leaves the flow; the draft keeps the step.
- Floating actions: inside `<nav aria-label="Quick actions">`, solid fills ("TV advertising" uses a surface fill with a deep border), inset focus ring, and `inert` plus hidden visibility while hidden so Tab and screen readers skip them. Phone pages get bottom padding and `scroll-padding-bottom` for the bar.
- Closing band: `deep` background, white heading with the italic phrase in `pink`, white-filled and white-outlined buttons, pink focus ring. Dark means `deep` or `deepest` only, and `pink` is never placed on `primary`.
- Headline split: SplitText with `autoSplit` and the tween created in `onSplit`, line masks padded so descenders are not cut, split reverted after the intro.
- Voucher list focus: Add focuses the new title field, Remove focuses the next row (with a "Voucher removed" status), Edit focuses the first field, Continue opens the first voucher with an error. The live preview is hidden from screen readers.
- Autocomplete: Shop name `organization`, Contact person `name`, Phone `tel`, Email `email`, all other fields off.
- Validation messages: "Use 200 characters or fewer", "Keep this under 5,000 characters", quantity 1 to 100,000 ("Quantity must be between 1 and 100,000"). "Send registration" re-runs every rule and jumps to the step with the first error.
- "290": the counting digits are hidden from screen readers with a fixed-width box; a hidden "290 hotel rooms and public areas" is read instead.
- Step change animation: only the incoming step animates (fade in from 12 px), to keep step changes instant to the touch.
