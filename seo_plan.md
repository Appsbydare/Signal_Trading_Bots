## SEO & Content Plan

### Goals
- Improve visibility for “telegram trading bot”, “telegram signal copier”, “MT5 automation software”, and long-tail prop-firm queries.
- Provide high-quality content for indexing and internal linking.
- Add structured data and social metadata so previews look polished.

---

### Resource / Blog Launch Plan
Create a “Resources” page (and `/resources` route) that lists initial deep-dive articles. First batch:

1. **How to Automate Telegram Signals into MT5 (Step-by-Step)**  
   - Outline: requirements (bot, MT5, VPS), mapping signals, demo-first checklist, risk guardrails.  
   - CTA: link to specs and pricing.

2. **Prop Firm Traders’ Guide to Telegram Copiers**  
   - Compare daily loss limits, hidden comments, passing challenges.  
   - Showcase our guardrails and discrete trade comments.

3. **Choosing a VPS for MT5 Automation**  
   - Factors: latency, uptime, Windows licensing, monitoring.  
   - Link back to execution/security strip.

Structure each article with headings (`h2`, `h3`), include keyword-rich alt text, and add internal links back to hero CTAs, specs, and comparison sections.

Once the framework is live, add a lightweight “Latest resources” module on the homepage (3 cards) for freshness.

---

### Structured Data & Metadata Tasks
1. **FAQ Schema**  
   - Convert existing `faqs` array into JSON-LD (SoftwareApplication + FAQPage).  
   - Embed via `<script type="application/ld+json">` in `src/app/schema-org.tsx`.

2. **SoftwareApplication Schema**  
   - Fields: name, description, operatingSystem (“Windows 10/11, VPS”), applicationCategory (“BusinessApplication”), offers (planned pricing tiers), and URL.

3. **Open Graph / Twitter images**  
   - Generate custom 1200×630 image (hero text + logo) and add to `metadata.openGraph.images` plus `twitter.images`.  
   - Update `public/og-home.png` (placeholder until final design).

4. **Sitemap & robots already in place** – just ensure new `/resources` route is included.

---

### Next Steps
- Build `/resources` route + page component, wire article data via simple JSON.  
- Add “Resources” teaser on homepage once content is ready.  
- Implement schema + OG updates in `schema-org.tsx` and `layout.tsx`.


