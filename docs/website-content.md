# Website content archive

Captured before stripping the public marketing site back to the bare logo
landing (2026-06-23). Everything here is the *old* AI-generated marketing copy,
preserved verbatim so it can be referenced, reused, or rewritten during the
redesign. The functional surfaces (login, reviewer portal, brand/admin consoles,
APIs) were left untouched — this archive is marketing only.

---

## Design language (as it was)

- **Aesthetic:** "blackout mono" — `#010101` ground, `#f8f8f8` ink, no color accent.
- **Type:** serif display = **Libre Baskerville** (`--font-serif`), mono labels =
  **Anonymous Pro** (`--font-mono`). Headlines mixed roman + *italic* emphasis
  spans rendered at 70% opacity.
- **Primitives** (`app/(marketing)/_components/ui.tsx`):
  - `Eyebrow` — mono, uppercase, `0.25em` tracking, `#7a7a7a`.
  - `Cta` — primary (white fill, dark text) or ghost (outline); trailing `→` / `↓` arrow.
  - `Marquee` — infinite-scroll band of terms, separated by `✦`.
  - `PathCard` — bordered card: eyebrow, two-line title, numbered bullet list, ghost CTA.
  - `Step` — numbered (`01`–`04`) heading + body.
  - `Faq` — `<details>` accordion with `+` → `×` toggle.

---

## Global chrome

### Nav
- Logo + wordmark "Blackwell" → `/`
- Links: **For brands** → `/brands`, **For reviewers** → `/reviewers`
- Right: **Sign in** → `/login`
- Behavior: transparent, gains bottom border after 12px scroll.

### Footer
- Wordmark + tagline: *"The generative-engine optimization layer for brands — and the review network that feeds it. We make products legible to AI."*
- **Platform:** For brands (`/brands`), For reviewers (`/reviewers`), Sign in (`/login`)
- **Company:** How it works (`/#how`), Why Blackwell (`/#thesis`), Contact (`mailto:founders@tryblackwell.com`)
- **Follow:** Instagram, X, LinkedIn
- Bottom bar: `© {year} Blackwell` · `tryblackwell.com`

---

## Home (`/`)

**Meta title:** Blackwell — Get your products recommended by AI
**Meta description:** Generative-engine optimization for brands. Blackwell structures your product data and builds the real reviews AI models trust, then puts you in front of them.

**Hero**
- Eyebrow: Generative engine optimization
- H1: Get your products *recommended* by AI.
- Body: AI is the new storefront. Blackwell structures your product data and builds the real reviews models trust — so when someone asks an AI what to buy, the answer is you.
- CTAs: **For brands** (`/brands`), **Become a reviewer** (`/reviewers`)
- Giant background wordmark: "Blackwell"

**Marquee surfaces:** ChatGPT · Gemini · Perplexity · Claude · Copilot · AI Overviews · Shopping agents

**Two paths**
- Eyebrow: Two sides, one engine
- H2: Brands get found. *People* get product.
- Body: A marketplace with the AI buying era built in. Brands fund real reviews; a network of everyday reviewers produces them. The result is the social proof models read.
- **PathCard — For brands** → "Be the answer when *AI gets asked.*" CTA: Explore for brands (`/brands`)
  - Structured product data models can actually read
  - Real reviews and video, produced by our network
  - The social proof AI weighs when it recommends
  - One fixed monthly fee — no per-post, no guesswork
- **PathCard — For reviewers** → "Free product for an *honest review.*" CTA: Become a reviewer (`/reviewers`)
  - Get real products, free — keep what we send
  - No following required; anyone 18+ can join
  - Your honest take becomes what AI reads
  - Matched to the categories you actually care about

**How it works** — Eyebrow: How it works · H2: From invisible to *recommended*.
- 01 **Audit** — We map how AI currently sees your brand — what it gets right, wrong, and misses entirely.
- 02 **Structure** — We rebuild your product data into clean, machine-readable ground truth models can parse.
- 03 **Review** — Our network receives your product, uses it, and produces structured reviews and video.
- 04 **Surface** — That social proof becomes the signal the engines weigh when they answer what to buy.

**Thesis** — Eyebrow: Why Blackwell · H2: The buying decision is moving *inside the model*.
- People increasingly ask AI what to buy instead of scrolling or searching. Models don't invent trust — they look for structured data and social proof. Most brands are invisible to them.
- We make brands legible to AI, and we build the review layer that feeds it — Reddit-level ground truth, with less noise and real incentives, dedicated to what's worth buying.
- Blockquote: We're building the layer of real, incentivized reviews that AI reads — *the ground truth for what to buy*.

**FAQ** — Eyebrow: Questions · H2: The short version.
- **What is generative-engine optimization?** GEO is to AI what SEO was to search. As people ask models what to buy, the brands that win are the ones whose product data is structured for machines and backed by real reviews. Blackwell does both.
- **Do reviewers have to be influencers?** No. Our network is everyday people 18 and over. What AI models look for is honest, structured social proof at volume — not follower counts. Real reviews from real users are the point.
- **How do brands pay?** A fixed monthly fee for the GEO program — structuring your product data and producing the reviews and video that feed the engines. No per-post pricing.
- **Where do the reviews end up?** Today we structure them as the social proof AI weighs when it answers product questions. Long term, we syndicate reviews directly to the platforms people ask — making Blackwell the source of ground truth for what's worth buying.

**Final CTA** — H2: Make your products *legible to AI*. · CTAs: For brands, Become a reviewer

---

## For brands (`/brands`)

**Meta title:** For brands — Blackwell
**Meta description:** Generative-engine optimization for brands. We structure your product data and produce the real reviews AI models trust, for one fixed monthly fee.

**Hero**
- Eyebrow: For brands
- H1: Be the product AI *recommends*.
- Body: When buyers ask a model what to get, it answers from structured data and social proof. Blackwell builds both for you — and keeps you in front of the engines that are becoming the storefront.
- CTAs: **Request access** (`#contact`), **Brand sign in** (`/login`)

**The program** — Eyebrow: The program · H2: What you're actually buying.
- **Structured product data** — We rebuild your catalog into clean, machine-readable ground truth — the specs, claims, and context models need to represent you correctly.
- **Real reviews & video** — Our reviewer network receives your product, actually uses it, and produces structured reviews and video — social proof at volume, not a single sponsored post.
- **Social proof AI trusts** — Research shows models lean on social proof when they recommend. We make sure yours exists, is structured, and is everywhere the engines look.
- **One fixed monthly fee** — A flat monthly program — auditing, structuring, and producing the proof that feeds the engines. No per-post pricing, no media-buying games.

**How it works** — H2: A standing program, not a campaign.
- 01 **Audit** — We benchmark how AI represents your brand and products today.
- 02 **Structure** — We rebuild your product data into machine-readable ground truth.
- 03 **Review** — We ship product to matched reviewers who produce structured proof.
- 04 **Surface** — That proof feeds the engines — and we track how your visibility moves.

**What's coming** — H2: The AI advertising layer.
- Today we make you legible to AI. Next, we syndicate reviews straight to the platforms people ask — the way review networks syndicated to retailers, but for LLMs.
- As the source of ground truth, Blackwell becomes where brands compete to be recommended. Early partners build their review base — and their standing with the engines — before that surface gets crowded.

**FAQ** — H2: What you're probably wondering.
- **What exactly do we pay for?** A fixed monthly GEO program: auditing how AI sees you, restructuring your product data, and producing structured reviews and video through our network. One flat fee, not per-post.
- **Do we have to send product to people?** Yes — that's how real reviews get made. We handle matching and logistics with our reviewer network. The reviewers don't need to be influencers; honest, structured proof at volume is what matters.
- **How is this different from influencer marketing?** Influencer marketing buys reach on social feeds. We build the structured social proof and product data that AI models read when someone asks them what to buy. Different surface, different game.
- **What's the long-term vision?** We syndicate reviews to the platforms people ask — the way Bazaarvoice syndicates to retailers, but for LLMs. Blackwell becomes the ground truth for AI product recommendations, and brands work through us to be seen.

**Contact CTA** — Eyebrow: Request access · H2: Let's get you in front of the models.
- Body: We onboard brands by hand right now. Tell us about your products and we'll set up your program.
- CTAs: **Book a call** (`mailto:founders@tryblackwell.com?subject=Blackwell for brands`), **Brand sign in** (`/login`)

---

## For reviewers (`/reviewers`)

**Meta title:** For reviewers — Blackwell
**Meta description:** Get real products for free and review them honestly. No following required — anyone 18+ can join. Your reviews shape what AI recommends.

**Hero**
- Eyebrow: For reviewers
- H1: Free product for an *honest* review.
- Body: Sign up in seconds with Google — no application. Get real products for free, share what you actually think, and help decide what AI recommends to everyone else. No following needed — just be 18 or older.
- CTAs: **Sign up free** (`/login`), **How it works** (`#how`)

**Why join** — Eyebrow: Why join · H2: Real product. Real opinions.
- **Free products, yours to keep** — Brands send real product at no cost. You use it, you keep it. The only thing we ask for in return is your honest review.
- **No following required** — You don't need to be an influencer or have any audience. If you're 18 or over and you'll give a real opinion, you can join.
- **Your review shapes AI** — Honest, structured reviews are what AI models read when people ask them what to buy. Your take becomes part of the ground truth.
- **Matched to your interests** — Tell us the categories you care about and we match you with products that fit — not random PR-box spam.

**How it works** — H2: Four steps to free product.
- 01 **Sign up** — Continue with Google and confirm you're 18+. No application, no password.
- 02 **Add interests** — Tell us the categories you like and where to ship — anytime, takes a minute.
- 03 **Receive product** — It ships to you free and it's yours to keep, no strings attached.
- 04 **Review** — Use it and leave an honest, structured review. That's what powers the network.

**FAQ** — H2: What you're probably wondering.
- **Do I need a following or to be an influencer?** No. Anyone 18 or over can join. We care about honest, useful reviews — not follower counts. Real opinions from real people are exactly the point.
- **Do I have to pay for anything?** Never. Products ship to you free and are yours to keep. Blackwell is paid by brands, not reviewers.
- **What do I have to do?** Use the product and leave an honest, structured review — and short video when it fits. That's it. Your genuine experience is what makes the network valuable.
- **Is there an application?** No. Sign up with Google, confirm you're 18 or older, and you're in. Add your interests and shipping details whenever you like so we can match you well.
- **How do I get matched?** Once you've added the categories you care about, we pair you with brands whose products fit. For now our team curates matches by hand.

**CTA** — H2: Get products. Shape *what AI knows*.
- Body: Sign up with Google in seconds. We'll match you when a product fits.
- CTA: **Sign up free** (`/login`)
