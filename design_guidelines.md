# bpETIP Design Guidelines

## Design Approach
**Design System Foundation:** Enterprise dashboard inspired by Linear's clarity, Stripe's sophistication, and modern financial platforms like Bloomberg Terminal. Focus on data density with breathing room, professional aesthetics, and information hierarchy optimized for tax intelligence workflows.

## Color System (User-Specified)

**Primary Brand:** Deep Cobalt `#0047AB` - Navigation headers, primary buttons, map overlays, active states
**Action/Accent:** Electric Orange `#FF6F20` - Critical CTAs, alert badges, high-priority indicators, download buttons
**Secondary:** Sky Blue `#89CFF0` - Charts, graphs, icons, supporting UI elements, low-risk indicators
**Background:** Clean White `#FFFFFF` - Main canvas, card backgrounds, modal overlays
**Text/Neutral:** Charcoal Grey `#333333` - Body text, labels, secondary interface elements

**Extended Palette for Risk Indicators:**
- Green `#22C55E` - Low risk status
- Yellow `#F59E0B` - Emerging risk
- Orange `#FF6F20` - Elevated risk (use accent)
- Red `#EF4444` - Immediate risk
- Black `#1F2937` - Critical alerts

## Typography System

**Font Stack:** 
- Primary: 'Inter' (Google Fonts) - UI, data, and body text
- Monospace: 'JetBrains Mono' - Numbers, codes, data tables

**Hierarchy:**
- Hero Dashboard Title: `text-3xl font-bold` (Deep Cobalt)
- Section Headers: `text-2xl font-semibold` (Charcoal Grey)
- Card Titles: `text-lg font-semibold` (Charcoal Grey)
- Body/Labels: `text-sm font-medium` (Charcoal Grey)
- Data Values: `text-base font-mono` (Charcoal Grey)
- Micro Text: `text-xs` (Charcoal Grey opacity 70%)

## Layout System

**Spacing Primitives:** Use Tailwind units `2, 4, 6, 8, 12, 16, 24` for consistent rhythm

**Dashboard Structure:**
```
├── Top Navigation Bar (h-16): Logo, Global Search, User Menu
├── Main Content Area (flex-1)
│   ├── Side Navigation (w-64): Collapsible module menu
│   └── Content Canvas (flex-1): Dynamic module views
```

**Grid Patterns:**
- Map View: Full-width hero (min-h-screen)
- Metric Cards: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` with `gap-6`
- Dashboard Panels: `grid-cols-1 lg:grid-cols-3` with `gap-8`
- Data Tables: Full-width with horizontal scroll

## Component Library

### Navigation
**Top Bar:** Fixed header with Deep Cobalt background, white text, search bar with Sky Blue focus ring, Electric Orange notification badge (count)

**Side Menu:** White background, Charcoal text, Deep Cobalt active state with left border accent, collapsible groups, icons from Heroicons

### Interactive World Map (Risk Radar)
**Visual Treatment:** 
- 3D globe rendered with D3.js or Mapbox GL
- Country markers as pulsing circles sized by tax footprint
- Color-coded by risk level (Green/Yellow/Orange/Red/Black)
- Hover shows tooltip with jurisdiction name + risk score
- Click opens slide-out panel (w-96) from right edge

**Map Controls:** Floating buttons (bottom-right) - Zoom in/out, 3D toggle, filter menu, time slider for historical view

### Risk Assessment Cards
**Structure:** White cards with `rounded-lg shadow-md p-6`, Electric Orange top border for high-priority
**Contents:** 
- Header: Jurisdiction flag icon + name + risk score badge
- 5-axis radar chart (Chart.js) with Sky Blue fill
- Metric grid below (4 columns): regulatory/audit/compliance/financial scores
- Action button row at bottom

### Data Visualization Standards
**Charts (Chart.js):**
- Line charts: Deep Cobalt primary line, Sky Blue secondary, Electric Orange highlights
- Bar charts: Sky Blue bars, Electric Orange for above-threshold values
- Radar charts: Sky Blue fill with 30% opacity, Deep Cobalt border
- Time-series: Confidence intervals as shaded regions

**Tables:**
- Header: Deep Cobalt background, white text, sticky on scroll
- Rows: Hover state with Sky Blue 10% background
- Alternate row shading: `bg-gray-50`
- Risk indicators: Colored dots in first column

### Status Indicators & Badges
- Alert badges: Electric Orange with white count
- Risk pills: Rounded badges with risk color background + white text
- Trend arrows: ↑ Red, → Yellow, ↓ Green with `text-sm`
- Pulse animations: CSS keyframes for new activity (2s cycle)

### Modal & Slide-out Panels
**Modals:** Centered overlay with `max-w-4xl`, white background, Deep Cobalt header
**Slide-outs:** Right-edge panels (w-96 to w-1/2), white background, close button (Electric Orange on hover)

### Forms & Inputs
- Input fields: White background, Charcoal border, Sky Blue focus ring
- Dropdowns: Custom styled with Sky Blue selected state
- Date pickers: Inline calendar with Deep Cobalt selected dates
- Search bars: Large prominent search with icon, Electric Orange search button

## Images & Icons

**Icons:** Heroicons (outline for nav, solid for status indicators) via CDN
**Map Assets:** Use Mapbox or D3.js globe libraries
**Country Flags:** Use flagcdn.com API for real-time flags
**No hero images needed** - This is a data-centric dashboard application

## Interaction Patterns

**Animations:** Minimal and purposeful
- Page transitions: 200ms fade
- Card hovers: Scale 1.02 with shadow increase (300ms)
- Map interactions: Smooth zoom/pan
- Alert pulses: Subtle opacity cycle for unread items
- Loading states: Skeleton screens with Sky Blue shimmer

**Responsiveness:**
- Desktop-first design (min-width 1280px optimal)
- Tablet: Collapsible sidebar, stacked metric cards
- Mobile: Bottom navigation, full-screen modals, simplified map view

## Dashboard Modules Layout

**Intelligent Risk Radar:** Full-screen map with floating metric summary panel (top-right, semi-transparent)

**Jurisdiction Deep Dive:** Split view - map on left (40%), tabbed panel on right (60%) showing feeds/scorecard/presence

**Regulatory Timeline:** Vertical timeline with date markers (left), event cards (right), color-coded impact tags

**Probability Score Visualizer:** Line chart (top 60%), data table (bottom 40%), confidence interval bands

**Cross-Reference Engine:** Alert list (left sidebar 30%), detail view (center 50%), action panel (right 20%)

**Portfolio Metrics:** 4-card metric summary (top), mixed chart grid below (2x2 layout)

This platform prioritizes information density, clarity, and rapid insight discovery for tax professionals managing complex global operations.