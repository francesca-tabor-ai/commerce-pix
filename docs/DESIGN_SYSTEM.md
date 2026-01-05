# Commerce Pix Design System
**Version 1.0** | Modern Analytics Dashboard for E-commerce Image Generation

---

## 1. Brand Foundation

### Brand Keywords
- **Precision** — Data-driven image generation
- **Effortless** — Streamlined workflow
- **Intelligent** — AI-powered decisions
- **Trustworthy** — Consistent, compliant outputs
- **Sophisticated** — Premium quality results
- **Efficient** — Time-saving automation
- **Insightful** — Analytics-first approach

### Positioning Statement
> Commerce Pix transforms product photography workflows with AI-powered image generation, delivering marketplace-ready visuals backed by real-time analytics and compliance guardrails.

### Voice & Tone

**DO:**
- Use clear, active voice
- Lead with outcomes and value
- Show data, not just claims
- Acknowledge user expertise
- Be concise and specific
- Use technical terms correctly

**DON'T:**
- Use marketing buzzwords without substance
- Over-promise or hype features
- Patronize users with oversimplification
- Create unnecessary urgency
- Use exclamation marks excessively
- Hide complexity when transparency matters

---

## 2. Visual Identity System

### Color Palette

#### Primary
```
Gold (Primary)
#F1B400
Usage: CTAs, highlights, active states, key metrics
Accessibility: Use with dark text (7.5:1 contrast)
```

#### Backgrounds
```
Warm Canvas
#F4F5F0
Usage: Base layer, page background
```

```
Pure White
#FFFFFF
Usage: Card surfaces, elevated content
```

```
Warm White
#FAFAF7
Usage: Subtle backgrounds, alternating rows
```

#### Neutrals (Text & Structure)
```
Deep Slate
#1A1D1F
Usage: Primary text, headings
Contrast: 16.7:1 on #F4F5F0
```

```
Charcoal
#3D4246
Usage: Body text, secondary content
Contrast: 10.5:1 on #F4F5F0
```

```
Graphite
#6B7280
Usage: Muted text, labels, captions
Contrast: 5.2:1 on #F4F5F0
```

```
Slate
#9CA3AF
Usage: Disabled states, borders
```

```
Pearl
#D1D5DB
Usage: Dividers, inactive borders
```

```
Whisper
#E5E7EB
Usage: Subtle borders, table strokes
```

#### Semantic Colors

**Success**
```
Sage Primary: #10B981
Sage Light: #D1FAE5
Usage: Completed jobs, positive metrics
```

**Warning**
```
Amber Primary: #F59E0B
Amber Light: #FEF3C7
Usage: Rate limits, pending reviews
```

**Error**
```
Ruby Primary: #EF4444
Ruby Light: #FEE2E2
Usage: Failed jobs, validation errors
```

**Info**
```
Sky Primary: #3B82F6
Sky Light: #DBEAFE
Usage: Tips, informational alerts
```

### Gradients

**Subtle Gold Wash** (Hero areas, highlights)
```css
background: linear-gradient(135deg, #F1B400 0%, #F5C842 100%);
opacity: 0.08;
```

**Warm Depth** (Elevated cards, overlays)
```css
background: linear-gradient(180deg, 
  rgba(241, 180, 0, 0.03) 0%, 
  rgba(241, 180, 0, 0) 100%
);
```

**Glass Tint** (Glassmorphic surfaces)
```css
background: linear-gradient(135deg,
  rgba(255, 255, 255, 0.85) 0%,
  rgba(250, 250, 247, 0.75) 100%
);
```

### Accessibility Guidelines

- Body text: Minimum 4.5:1 contrast
- Large text (18px+): Minimum 3:1 contrast
- Interactive elements: Minimum 3:1 contrast
- Focus indicators: 3px solid #F1B400 with 2px offset
- Gold (#F1B400) text only with dark backgrounds

---

## 3. Typography (Inter)

### Type Scale

**H1 — Dashboard Title**
```
Size: 32px / 2rem
Weight: 600 (Semibold)
Line-height: 1.25 (40px)
Letter-spacing: -0.02em
Color: #1A1D1F
Usage: Main page titles
```

**H2 — Section Header**
```
Size: 24px / 1.5rem
Weight: 600 (Semibold)
Line-height: 1.3 (32px)
Letter-spacing: -0.01em
Color: #1A1D1F
Usage: Section titles, modal headers
```

**H3 — Card Title**
```
Size: 18px / 1.125rem
Weight: 600 (Semibold)
Line-height: 1.4 (25px)
Letter-spacing: -0.01em
Color: #1A1D1F
Usage: Card headers, subsection titles
```

**H4 — Label Header**
```
Size: 16px / 1rem
Weight: 500 (Medium)
Line-height: 1.5 (24px)
Letter-spacing: 0
Color: #3D4246
Usage: Form sections, list headers
```

**H5 — Subheading**
```
Size: 14px / 0.875rem
Weight: 500 (Medium)
Line-height: 1.5 (21px)
Letter-spacing: 0
Color: #6B7280
Text-transform: uppercase
Usage: Overlines, category labels
```

### Body Text

**Body Large**
```
Size: 16px / 1rem
Weight: 400 (Regular)
Line-height: 1.6 (26px)
Color: #3D4246
Usage: Primary content, descriptions
```

**Body Default**
```
Size: 14px / 0.875rem
Weight: 400 (Regular)
Line-height: 1.6 (22px)
Color: #3D4246
Usage: Standard UI text, table content
```

**Body Small**
```
Size: 13px / 0.8125rem
Weight: 400 (Regular)
Line-height: 1.5 (20px)
Color: #6B7280
Usage: Helper text, metadata
```

**Microcopy**
```
Size: 12px / 0.75rem
Weight: 400 (Regular)
Line-height: 1.5 (18px)
Color: #9CA3AF
Usage: Timestamps, tertiary labels
```

### Numeric/Analytics Text

**KPI Large**
```
Size: 48px / 3rem
Weight: 700 (Bold)
Line-height: 1.1 (53px)
Letter-spacing: -0.02em
Variant: Tabular nums
Color: #1A1D1F
Usage: Hero metrics, main KPIs
```

**KPI Medium**
```
Size: 32px / 2rem
Weight: 600 (Semibold)
Line-height: 1.2 (38px)
Variant: Tabular nums
Color: #1A1D1F
Usage: Card metrics
```

**KPI Small**
```
Size: 20px / 1.25rem
Weight: 600 (Semibold)
Line-height: 1.3 (26px)
Variant: Tabular nums
Color: #3D4246
Usage: Inline stats, table totals
```

**Percentage/Change**
```
Size: 14px / 0.875rem
Weight: 500 (Medium)
Variant: Tabular nums
Color: #10B981 (positive) / #EF4444 (negative)
Usage: Metric changes, trends
```

---

## 4. Glassmorphism Rules

### Core Glass Style

**Base Recipe**
```css
background: linear-gradient(135deg,
  rgba(255, 255, 255, 0.85) 0%,
  rgba(250, 250, 247, 0.75) 100%
);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.5);
box-shadow: 
  0 8px 32px 0 rgba(26, 29, 31, 0.08),
  inset 0 1px 0 0 rgba(255, 255, 255, 0.9);
```

**Elevated Glass** (Modal, popovers)
```css
background: linear-gradient(135deg,
  rgba(255, 255, 255, 0.95) 0%,
  rgba(250, 250, 247, 0.90) 100%
);
backdrop-filter: blur(32px);
border: 1px solid rgba(255, 255, 255, 0.7);
box-shadow: 
  0 20px 60px 0 rgba(26, 29, 31, 0.15),
  inset 0 1px 0 0 rgba(255, 255, 255, 1);
```

**Subtle Glass** (Tooltips, badges)
```css
background: rgba(255, 255, 255, 0.7);
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.4);
box-shadow: 0 4px 16px 0 rgba(26, 29, 31, 0.06);
```

### Usage Guidelines

**DO use glassmorphism for:**
- Stat cards on analytics pages
- Floating action panels
- Modal dialogs
- Dropdown menus
- Tooltips and popovers
- Notification toasts
- Sidebar navigation (collapsed)

**DON'T use glassmorphism for:**
- Entire page backgrounds
- Large content areas
- Tables (use solid white)
- Forms (use solid white)
- Text-heavy cards
- Mobile views (performance)

---

## 5. UI Design Tokens

### Spacing Scale

**Base unit: 4px**

```
xs:  4px   (0.25rem)  — Tight padding, icon gaps
sm:  8px   (0.5rem)   — Compact spacing
md:  12px  (0.75rem)  — Default inner padding
base: 16px (1rem)     — Standard spacing
lg:  24px  (1.5rem)   — Section spacing
xl:  32px  (2rem)     — Major section gaps
2xl: 48px  (3rem)     — Page section spacing
3xl: 64px  (4rem)     — Hero spacing
```

### Border Radius Scale

```
xs:   2px  — Badges, pills
sm:   4px  — Buttons, inputs
base: 8px  — Cards, panels
lg:   12px — Modals, large containers
xl:   16px — Hero elements
full: 9999px — Avatars, circular elements
```

### Shadow System

**Soft Shadows** (Layered depth)

```css
/* Level 1: Resting */
shadow-sm: 
  0 1px 2px 0 rgba(26, 29, 31, 0.05),
  0 1px 3px 0 rgba(26, 29, 31, 0.08);

/* Level 2: Hover / Interactive */
shadow-md:
  0 2px 8px 0 rgba(26, 29, 31, 0.08),
  0 4px 16px 0 rgba(26, 29, 31, 0.06);

/* Level 3: Elevated */
shadow-lg:
  0 8px 24px 0 rgba(26, 29, 31, 0.10),
  0 16px 48px 0 rgba(26, 29, 31, 0.08);

/* Level 4: Modal */
shadow-xl:
  0 20px 60px 0 rgba(26, 29, 31, 0.15),
  0 32px 80px 0 rgba(26, 29, 31, 0.10);

/* Gold Glow (Active states) */
shadow-gold:
  0 4px 16px 0 rgba(241, 180, 0, 0.20),
  0 8px 32px 0 rgba(241, 180, 0, 0.15);
```

### Border Styles

```css
/* Subtle */
border: 1px solid #E5E7EB;

/* Default */
border: 1px solid #D1D5DB;

/* Strong */
border: 1px solid #9CA3AF;

/* Interactive */
border: 1px solid #F1B400;

/* Focus */
border: 2px solid #F1B400;
outline: 3px solid rgba(241, 180, 0, 0.20);
outline-offset: 2px;
```

### Elevation Levels

```
Level 0: Flat (no shadow, #F4F5F0 bg)
Level 1: Resting (shadow-sm, white bg)
Level 2: Hover (shadow-md, white bg)
Level 3: Active (shadow-lg, white bg)
Level 4: Modal (shadow-xl, glass bg)
```

---

## 6. Core Components

### Sidebar Navigation

**Expanded State** (240px width)
```
Structure:
├─ Logo area (64px height)
├─ Navigation items
│  ├─ Icon (20px, left-aligned, 16px padding)
│  ├─ Label (14px, medium, 12px left of icon)
│  └─ Badge (optional, right-aligned)
└─ User profile footer (64px height)

Background: Glass (blur: 20px, opacity: 0.85)
Border: Right 1px solid rgba(255, 255, 255, 0.5)
Width: 240px
Padding: 16px (vertical), 12px (horizontal)

Nav Item:
Height: 40px
Padding: 8px 12px
Border-radius: 6px
Transition: all 150ms ease-out

States:
- Default: transparent bg, #6B7280 text
- Hover: rgba(241, 180, 0, 0.08) bg, #1A1D1F text
- Active: #F1B400 bg, #1A1D1F text, 600 weight
- Focus: 2px #F1B400 outline, 2px offset
```

**Collapsed State** (64px width)
```
Structure:
├─ Logo icon only (40px)
├─ Icon buttons (40px × 40px)
└─ User avatar (40px)

Center-aligned icons
Tooltip on hover (right-positioned)
Same glass background
```

### Top Header

```
Structure:
├─ Left: Breadcrumb / Page title
├─ Center: Global search (400px max-width)
└─ Right: Notifications + Settings + Profile

Height: 64px
Background: Solid white with shadow-sm
Border-bottom: 1px solid #E5E7EB
Padding: 0 24px
Sticky: top 0

Search bar:
- Glass background (subtle)
- 40px height
- 12px padding
- 20px icon (left)
- Placeholder: 14px, #9CA3AF
- Focus: Gold border + shadow-gold
```

### KPI Stat Cards

```
Structure:
├─ Header
│  ├─ Icon (24px, gold bg circle, 40px diameter)
│  └─ Label (14px, uppercase, medium, #6B7280)
├─ Metric
│  ├─ Value (48px, bold, tabular nums)
│  └─ Change (+12.5%, 14px, colored)
└─ Footer: Sparkline or secondary stat

Background: Glass
Border-radius: 12px
Padding: 24px
Min-height: 160px
Transition: transform 150ms, shadow 150ms

States:
- Default: shadow-md
- Hover: transform translateY(-2px), shadow-lg
- No click (read-only display)
```

### Chart Containers

```
Structure:
├─ Header
│  ├─ Title (18px, semibold)
│  └─ Actions (dropdowns, time range)
├─ Chart area (min-height: 280px)
└─ Footer: Legend or data table

Background: Solid white
Border: 1px solid #E5E7EB
Border-radius: 8px
Padding: 24px
Shadow: shadow-sm

Chart colors:
- Primary line/bar: #F1B400
- Secondary: #3B82F6
- Tertiary: #10B981
- Grid: #E5E7EB
- Axes: #9CA3AF
```

### Tables / List Rows

```
Structure:
├─ Header row
│  ├─ Column headers (14px, uppercase, medium, #6B7280)
│  └─ Sort indicators (12px chevrons)
└─ Data rows
   ├─ Cells (14px, #3D4246)
   └─ Actions (icons, right-aligned)

Background: Solid white
Border: 1px solid #E5E7EB
Border-radius: 8px

Header:
- Height: 44px
- Background: #FAFAF7
- Border-bottom: 2px solid #E5E7EB
- Padding: 12px 16px

Row:
- Height: 52px
- Padding: 12px 16px
- Border-bottom: 1px solid #E5E7EB

Row states:
- Default: white bg
- Hover: #FAFAF7 bg
- Selected: rgba(241, 180, 0, 0.05) bg, #F1B400 left border (3px)
- Focus: Gold outline
```

### Search + Filter Bar

```
Structure:
├─ Search input (flex-grow)
├─ Filter button (with count badge)
├─ Sort dropdown
└─ View toggle (grid/list icons)

Height: 48px
Background: Glass (subtle)
Border-radius: 8px
Padding: 6px
Gap: 8px between items

Search:
- Flex: 1
- Icon: 20px (left, #9CA3AF)
- Input: 14px, transparent bg
- Focus: Gold border on container

Filter button:
- Ghost variant
- Badge: pill, small, gold bg, count inside
- Active: Gold background
```

### Buttons

**Primary**
```
Background: #F1B400
Text: #1A1D1F, 14px, 600 weight
Height: 40px
Padding: 0 20px
Border-radius: 6px
Shadow: shadow-sm
Transition: all 150ms ease-out

States:
- Hover: darken(#F1B400, 8%), shadow-md
- Active: darken(#F1B400, 12%), shadow-sm
- Focus: shadow-gold outline
- Disabled: opacity 0.5, no pointer
```

**Secondary**
```
Background: white
Border: 1px solid #D1D5DB
Text: #3D4246, 14px, 500 weight
Height: 40px
Padding: 0 20px
Border-radius: 6px

States:
- Hover: #FAFAF7 bg, #9CA3AF border
- Active: #F4F5F0 bg
- Focus: Gold outline
```

**Ghost**
```
Background: transparent
Text: #6B7280, 14px, 500 weight
Height: 40px
Padding: 0 16px
Border-radius: 6px

States:
- Hover: rgba(241, 180, 0, 0.08) bg, #3D4246 text
- Active: rgba(241, 180, 0, 0.12) bg
- Focus: Gold outline
```

**Sizes:**
- Small: 32px height, 12px padding, 13px text
- Default: 40px height, 20px padding, 14px text
- Large: 48px height, 24px padding, 16px text

### Inputs & Dropdowns

**Text Input**
```
Height: 40px
Padding: 0 12px
Background: white
Border: 1px solid #D1D5DB
Border-radius: 6px
Text: 14px, #3D4246

States:
- Default: #D1D5DB border
- Hover: #9CA3AF border
- Focus: #F1B400 border (2px), shadow-gold
- Error: #EF4444 border, #FEE2E2 bg
- Disabled: #F4F5F0 bg, #9CA3AF text

Label:
- 14px, 500 weight, #3D4246
- Margin-bottom: 6px

Helper text:
- 13px, #6B7280
- Margin-top: 6px

Error text:
- 13px, #EF4444
- Margin-top: 6px
```

**Dropdown/Select**
```
Same as text input plus:
- Chevron icon (16px, right, 12px padding)
- Dropdown panel: Glass background (elevated)
- Options: 40px height, 12px padding
- Option hover: rgba(241, 180, 0, 0.08) bg
- Option selected: #F1B400 bg, checkmark icon
- Max-height: 320px (scrollable)
```

### Modal

```
Structure:
├─ Overlay (backdrop-blur: 4px, rgba(26, 29, 31, 0.40))
├─ Modal container
│  ├─ Header (24px title, close button)
│  ├─ Content (scrollable, max-height: 70vh)
│  └─ Footer (actions, right-aligned)

Background: Glass (elevated)
Border-radius: 12px
Max-width: 600px
Padding: 32px
Shadow: shadow-xl

Animation:
- Enter: scale(0.95) → scale(1), opacity 0 → 1, 200ms ease-out
- Exit: scale(1) → scale(0.95), opacity 1 → 0, 150ms ease-in

Close button:
- Top-right: 24px, 24px
- Ghost variant
- Icon: X (20px)
```

### Toast Notifications

```
Structure:
├─ Icon (20px, semantic color)
├─ Content
│  ├─ Title (14px, semibold)
│  └─ Message (13px, regular)
└─ Close button (ghost, 16px icon)

Background: Glass (subtle)
Border-left: 3px solid (semantic color)
Border-radius: 8px
Padding: 16px
Min-width: 320px
Max-width: 420px
Shadow: shadow-lg

Position: Top-right, 24px from edges
Stack: 12px gap between toasts

Animation:
- Enter: translateX(400px) → translateX(0), 200ms ease-out
- Exit: translateX(0) → translateX(400px), 150ms ease-in
- Auto-dismiss: 5 seconds (success), 7 seconds (info/warning), manual (error)
```

---

## 7. Micro-Interactions

### Timing & Easing

```css
/* Quick interactions */
--transition-fast: 100ms cubic-bezier(0.4, 0, 0.2, 1);

/* Default interactions */
--transition-base: 150ms cubic-bezier(0.4, 0, 0.2, 1);

/* Smooth animations */
--transition-smooth: 200ms cubic-bezier(0.4, 0, 0.2, 1);

/* Entrances */
--transition-enter: 200ms cubic-bezier(0, 0, 0.2, 1);

/* Exits */
--transition-exit: 150ms cubic-bezier(0.4, 0, 1, 1);
```

### Hover States

**Cards**
```css
transform: translateY(-2px);
box-shadow: shadow-lg;
transition: transform 150ms ease-out, box-shadow 150ms ease-out;
```

**Buttons**
```css
background: darken(5%);
box-shadow: shadow-md;
transform: translateY(-1px);
transition: all 150ms ease-out;
```

**Table Rows**
```css
background: #FAFAF7;
transition: background 100ms ease-out;
```

**Links**
```css
color: #F1B400;
text-decoration: underline;
text-decoration-color: rgba(241, 180, 0, 0.3);
text-underline-offset: 2px;
transition: text-decoration-color 150ms ease-out;

/* Hover */
text-decoration-color: rgba(241, 180, 0, 1);
```

### Focus States

**All interactive elements**
```css
outline: 3px solid rgba(241, 180, 0, 0.3);
outline-offset: 2px;
transition: outline 100ms ease-out;
```

### Loading States

**Skeleton Loader**
```css
background: linear-gradient(
  90deg,
  #E5E7EB 25%,
  #F4F5F0 50%,
  #E5E7EB 75%
);
background-size: 200% 100%;
animation: shimmer 1.5s ease-in-out infinite;

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

**Spinner**
```css
/* 20px gold ring, 2px border */
border: 2px solid rgba(241, 180, 0, 0.2);
border-top-color: #F1B400;
border-radius: 50%;
animation: spin 600ms linear infinite;

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

**Progress Bar**
```css
/* Container */
height: 4px;
background: #E5E7EB;
border-radius: 9999px;

/* Fill */
background: linear-gradient(90deg, #F1B400, #F5C842);
height: 100%;
border-radius: 9999px;
transition: width 200ms ease-out;
```

### Success Feedback

**Button Success**
```css
/* After click, show checkmark briefly */
background: #10B981;
transform: scale(0.95);
transition: all 100ms ease-out;

/* Then restore */
transform: scale(1);
transition: all 150ms ease-out;
```

**Form Success**
```css
border-color: #10B981;
background: rgba(209, 250, 229, 0.3);
transition: all 200ms ease-out;
```

**Toast Success**
```css
/* Slide in from right */
transform: translateX(0);
opacity: 1;
transition: all 200ms cubic-bezier(0, 0, 0.2, 1);
```

### Empty States

**Structure:**
```
├─ Illustration area (80px icon or 120px graphic)
├─ Heading (18px, semibold)
├─ Description (14px, muted)
└─ CTA button (primary or secondary)

Padding: 48px
Text-align: center
Max-width: 400px
Margin: 0 auto

Icon/graphic:
- Color: #F1B400 (primary element)
- Style: Line-based, simple
- Size: 80px
- Margin-bottom: 24px
```

---

## 8. Screen Layout Descriptions

### Dashboard Overview

```
┌─────────────────────────────────────────────────────────┐
│ Header: "Dashboard" | Search | Notifications | Profile │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─ KPI Row (4 glass cards) ────────────────────────┐  │
│ │ Generations | Cost | Success Rate | Active Jobs │  │
│ └─────────────────────────────────────────────────┘  │
│                                                         │
│ ┌─ Main Content (2 columns) ────────────────────────┐ │
│ │                                                    │ │
│ │ ┌─ Generation Activity ──┐  ┌─ Mode Breakdown ─┐ │ │
│ │ │ Line chart (7 days)   │  │ Donut chart      │ │ │
│ │ │ Tooltip on hover      │  │ Mode legend      │ │ │
│ │ │ Time range selector   │  │ Percentage bars  │ │ │
│ │ └───────────────────────┘  └──────────────────┘ │ │
│ │                                                    │ │
│ │ ┌─ Recent Jobs Table ──────────────────────────┐ │ │
│ │ │ Status | Mode | Created | Cost | Actions    │ │ │
│ │ │ [Rows with hover states]                     │ │ │
│ │ │ [View all link]                              │ │ │
│ │ └────────────────────────────────────────────┘ │ │
│ └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

Layout:
- Sidebar: 240px (fixed)
- Content: calc(100vw - 240px - 48px padding)
- KPI cards: 4 columns, equal width, 16px gap
- Main columns: 60% (left) / 40% (right), 24px gap
- Vertical spacing: 32px between sections
- Max-width: 1600px (centered)
```

### Revenue / Analytics Screen

```
┌─────────────────────────────────────────────────────────┐
│ Header: "Analytics" | Time Range Selector | Export     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─ Primary Metric Card (full-width glass) ──────────┐ │
│ │ Total Cost: $1,234.56 | +23% vs last period       │ │
│ │ Area chart (smooth curve, gold gradient fill)     │ │
│ └────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─ Secondary Metrics (3 columns) ───────────────────┐ │
│ │ Avg Cost | Generations | Cost per Mode            │ │
│ │ [Glass cards with sparklines]                      │ │
│ └────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─ Breakdown Section ──────────────────────────────┐  │
│ │                                                    │  │
│ │ ┌─ Cost by Mode ──┐  ┌─ Daily Breakdown ───────┐ │  │
│ │ │ Horizontal bars │  │ Table: Date | Gens |    │ │  │
│ │ │ Sorted by cost  │  │        Cost | Avg       │ │  │
│ │ │ Gold bars       │  │ [Sortable columns]      │ │  │
│ │ └─────────────────┘  └─────────────────────────┘ │  │
│ └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

Layout:
- Primary card: Full-width, 320px height, glass background
- Secondary metrics: 3 columns, equal width, 16px gap
- Breakdown: 40% (left bar chart) / 60% (right table), 24px gap
- Vertical spacing: 32px between sections
```

### Product Insights

```
┌─────────────────────────────────────────────────────────┐
│ Header: "Insights" | Filter: All Products ▾ | Search  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─ Summary Cards (3 columns) ───────────────────────┐ │
│ │ Projects | Total Assets | Avg per Project         │ │
│ │ [Glass cards with icons]                           │ │
│ └────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─ Projects List ────────────────────────────────────┐ │
│ │ ┌─ Project Card ──────────────────────────────┐   │ │
│ │ │ Project Name | 12 assets | Created 2 days ago │ │
│ │ │ ┌─ Asset Grid ─────────────────────────────┐ │ │
│ │ │ │ [Thumbnails: 4 per row, 80px squares]    │ │ │
│ │ │ └──────────────────────────────────────────┘ │ │
│ │ │ [View All] [Generate New]                     │ │
│ │ └─────────────────────────────────────────────┘   │ │
│ │                                                    │ │
│ │ [More project cards...]                            │ │
│ │                                                    │ │
│ │ [Load More button]                                 │ │
│ └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

Layout:
- Summary cards: 3 columns, equal width, 16px gap
- Project cards: Full-width, stacked, 16px gap
- Asset grid: 4 columns within card, 8px gap
- Thumbnails: Square, rounded corners (4px)
- Card padding: 24px
- Vertical spacing: 32px between sections
```

### Settings / Profile

```
┌─────────────────────────────────────────────────────────┐
│ Header: "Settings" | [Tab Navigation]                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─ Two-column Layout ─────────────────────────────┐   │
│ │                                                  │   │
│ │ ┌─ Left: Nav ─┐  ┌─ Right: Content ──────────┐ │   │
│ │ │ Profile     │  │ ┌─ Section: Profile ────┐ │ │   │
│ │ │ Account  ←  │  │ │ Avatar upload         │ │ │   │
│ │ │ Billing     │  │ │ Name input            │ │ │   │
│ │ │ API Keys    │  │ │ Email input           │ │ │   │
│ │ │ Preferences │  │ │ [Save Changes btn]    │ │ │   │
│ │ └─────────────┘  │ └───────────────────────┘ │ │   │
│ │                  │                            │ │   │
│ │                  │ ┌─ Section: Danger Zone ┐ │ │   │
│ │                  │ │ Delete account         │ │ │   │
│ │                  │ │ [Delete btn - red]     │ │ │   │
│ │                  │ └────────────────────────┘ │ │   │
│ │                  └────────────────────────────┘ │   │
│ └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

Layout:
- Two columns: 240px (nav) / flexible (content), 32px gap
- Nav: Sticky, solid white background
- Nav items: 40px height, 12px padding, active state with left gold border
- Content sections: Stacked, 32px gap
- Each section: White card, 24px padding
- Form groups: 24px gap
- Max-width: 800px for content area
```

---

## 9. Microcopy Pack

### Landing Page Hero

**Headline:**
> Transform product images into marketplace-ready visuals with AI precision

**Subhead:**
> Generate compliant Amazon listings, lifestyle scenes, and feature callouts in seconds. Track performance with real-time analytics and never miss a rate limit.

### Primary CTA Labels

1. **Start Generating** (hero CTA)
2. **Upload & Transform** (dashboard primary)
3. **Generate Variations** (asset gallery)
4. **View Analytics** (navigation)
5. **Upgrade Plan** (billing)
6. **Export Report** (analytics)

### Empty States

1. **No Projects Yet**
   - *Create your first project to start generating product images*
   
2. **No Generated Images**
   - *Upload a product image and select a mode to create your first generation*

3. **No Jobs Running**
   - *All generation jobs completed. Start a new generation to see activity here*

4. **No Search Results**
   - *No projects match your search. Try different keywords or create a new project*

5. **No Assets in Project**
   - *This project doesn't have any assets yet. Upload an image to get started*

6. **Rate Limit Reached**
   - *You've reached your generation limit. Limits reset in 47 seconds*

### Tooltips

1. **Generation Mode**
   - *Select how your product image should be styled: white background, lifestyle, feature callout, or packaging*

2. **Rate Limits**
   - *Track your usage across per-minute and daily limits to avoid interruptions*

3. **Signed URL**
   - *Temporary secure link to download or view your generated image (expires in 1 hour)*

4. **Prompt Payload**
   - *Structured parameters used to generate this image, including compliance overrides*

5. **Source Asset**
   - *Original input image used to create this generation*

6. **Cost Tracking**
   - *OpenAI API cost for this generation (DALL-E 2 edit: $0.02)*

### Success Messages

1. **Generation Complete**
   - *Image generated successfully! Your styled product image is ready to download*

2. **Project Created**
   - *Project created! Start uploading images to generate your first assets*

3. **Settings Saved**
   - *Your preferences have been saved and will apply to all future generations*

---

## Implementation Notes

### CSS Custom Properties

```css
:root {
  /* Colors */
  --color-primary: #F1B400;
  --color-bg-canvas: #F4F5F0;
  --color-bg-white: #FFFFFF;
  --color-bg-warm: #FAFAF7;
  --color-text-primary: #1A1D1F;
  --color-text-body: #3D4246;
  --color-text-muted: #6B7280;
  --color-border: #E5E7EB;
  
  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 0.75rem;
  --space-base: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  
  /* Radius */
  --radius-sm: 0.25rem;
  --radius-base: 0.5rem;
  --radius-lg: 0.75rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(26, 29, 31, 0.05);
  --shadow-md: 0 4px 6px rgba(26, 29, 31, 0.08);
  --shadow-lg: 0 10px 15px rgba(26, 29, 31, 0.10);
  
  /* Transitions */
  --transition-fast: 100ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 150ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Font Loading

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Tabular numbers for analytics */
.numeric {
  font-feature-settings: 'tnum';
  font-variant-numeric: tabular-nums;
}
```

---

**End of Design System v1.0**

