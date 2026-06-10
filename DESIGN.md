# HaloHealth UI/UX Design System Specification (DESIGN.md)

## 1. Executive Summary

This document establishes the UI/UX Design System Specification and UI Audit for **HaloHealth** (an Impal application inspired by Halodoc). HaloHealth is a multi-user healthcare platform servicing two primary client groups:
1. **Patients**: Who browse specializations, select doctors, make consultations, consult via real-time chat, browse pharmacy products, and view transaction history.
2. **Doctors**: Who receive patient requests, manage active ongoing consultations, and exchange messages via a dedicated web dashboard.

### Core Objectives
* **Build Trust & Credibility**: Ensure every screen reflects medical precision, security, and professional calmness.
* **Establish Consistency**: Eliminate divergent aesthetic patterns (e.g., Teal vs. Red, gradients, inconsistent spacing) by unifying colors, layouts, and typography.
* **Accelerate Frontend Engineering**: Provide reusable semantic CSS variables and design tokens mapped directly to the codebase.
* **Guarantee Accessibility**: Adhere strictly to WCAG 2.1 AA standards for high readability in stressful health scenarios.

---

### Codebase & Architectural Audit
Based on the code analysis of the [Frontend](file:///c:/Users/mhmdm/OneDrive/Documents/GitHub/halodoc-impal/Frontend) workspace, the following design deviations and functional inconsistencies have been identified:

| File Location | Feature / Element | Audit Finding | Correction Required |
| :--- | :--- | :--- | :--- |
| [Navbar.jsx](file:///c:/Users/mhmdm/OneDrive/Documents/GitHub/halodoc-impal/Frontend/src/components/Navbar.jsx#L114) | Navigation Link | The patient menu uses `to="/my-consultations"`, which causes a routing mismatch (404 Not Found) since [App.jsx](file:///c:/Users/mhmdm/OneDrive/Documents/GitHub/halodoc-impal/Frontend/src/App.jsx#L61) maps this view to `path: "history"`. | Align navigation link to use `/history` to match the router. |
| [Footer.jsx](file:///c:/Users/mhmdm/OneDrive/Documents/GitHub/halodoc-impal/Frontend/src/components/Footer.jsx#L3) | Footer container | Uses the semantic ID `id="profile"` which conflicts with user profiles and breaks automation testing. | Rename to `id="footer"` or use standard semantic `<footer>` selector. |
| [ConsultationChat.jsx](file:///c:/Users/mhmdm/OneDrive/Documents/GitHub/halodoc-impal/Frontend/src/Pages/Consultations/ConsultationChat.jsx#L39) | Message Bubble | Employs a linear gradient (`bg-gradient-to-br from-teal-500 to-cyan-500`) and teal accents, deviating from both the brand identity and the "No Gradient" rule. | Replace with solid primary colors (e.g., `#FFF1F5` light pink for patient, `#F3F4F6` slate for doctor). |
| [SpecializationSelect.jsx](file:///c:/Users/mhmdm/OneDrive/Documents/GitHub/halodoc-impal/Frontend/src/Pages/Consultations/SpecializationSelect.jsx#L3-L94) | Specialization Cards | Uses a different gradient-based card background and icon styling for every single specialization, resulting in visual clutter. | Standardize all card containers using a single solid background and consistent typography scale. |
| [DoctorRequests.jsx](file:///c:/Users/mhmdm/OneDrive/Documents/GitHub/halodoc-impal/Frontend/src/Pages/Consultations/DoctorRequests.jsx#L72) | Request Cards | Uses gradients (`from-teal-500 to-cyan-400`) and emojis (`⏱`, `✕`, `✓`), creating a visual discrepancy against other modules. | Unify card surfaces using solid borders, drop shadows, and Lucide vector icons. |
| Shared Cards | [DoctorCard.jsx](file:///c:/Users/mhmdm/OneDrive/Documents/GitHub/halodoc-impal/Frontend/src/components/DoctorCard.jsx#L5) & [ProductCard.jsx](file:///c:/Users/mhmdm/OneDrive/Documents/GitHub/halodoc-impal/Frontend/src/components/ProductCard.jsx#L5) | The fallback image container uses a linear gradient (`bg-linear-to-b from-slate-100 to-slate-200`) violating the solid-only rule. | Change to solid `#F3F4F6` placeholder color. |
| Codebase-wide | Asset Icons | Deprecate all emojis in the UI interface. Consolidate to **Lucide Icons** as the single source. |

---

## 2. Design Philosophy

To design a trustworthy, professional, and accessible medical platform, HaloHealth is governed by three non-negotiable principles:

### I. No Gradient Rule
Under no circumstances are gradients allowed. Gradients represent consumer-facing startup landing pages or crypto dashboards; medical portals demand absolute clarity. 
* **Banned**: Linear, radial, mesh, or conic gradients, as well as glassmorphic gradient overlays.
* **Mandated**: Solid fill colors for backgrounds, buttons, and status indicator components.

### II. No Outline-Based Design
Avoid overloading interfaces with dark borders and thick frames, which create noise and visual tension.
* **Banned**: Heavy strokes, double borders, dark divider outlines, and distinct outlines around containers.
* **Mandated**: Establish layouts through **intentional negative space**, **subtle drop shadows (elevation)**, and **surface background hierarchy** (e.g., placing light surfaces on top of a soft muted background).

### III. Healthcare Visual Identity
The interface must present a calm, sterile, clean, and modern medical appearance.
* Brand colors should convey reliability and empathy.
* Copywriting must be clear and direct, focusing entirely on healthcare clarity instead of marketing hyperbole.

---

## 3. Color System

The color system uses Tailwind CSS v4 variables mapped inside [index.css](file:///c:/Users/mhmdm/OneDrive/Documents/GitHub/halodoc-impal/Frontend/src/index.css) to ensure absolute code-design alignment.

### Solid Palette Tokens

```css
@theme {
  --color-primary: #FF5C8A;       /* Primary medical brand color */
  --color-primary-hover: #E54D79; /* Button hover state */
  --color-primary-light: #FFF1F5; /* Background overlays / patient chat bubble */
  
  --color-success: #22C55E;       /* Active statuses, successful transactions */
  --color-success-light: #F0FDF4; /* Successful statuses backgrounds */
  
  --color-warning: #F59E0B;       /* Pending payments, processing requests */
  --color-warning-light: #FFFBEB; /* Warning statuses backgrounds */
  
  --color-error: #EF4444;         /* Expirations, cancellations, alerts */
  --color-error-light: #FEF2F2;   /* Error overlays */
  
  --color-text-primary: #1F2937;  /* High contrast readable copy (Slate 800) */
  --color-text-secondary: #6B7280;/* Subheadings, captions, secondary logs (Slate 500) */
  
  --color-background: #FFFFFF;    /* Base viewport canvas */
  --color-surface: #F9FAFB;       /* Muted cards, tables, layout sidebars */
  --color-border: #E5E7EB;        /* Soft dividers (Slate 200) */
}
```

### Semantic Usage Guidelines
1. **Primary (`#FF5C8A`)**: Reserved for core functional elements such as global navigation branding, primary action CTAs, and active toggle tabs.
2. **Success (`#22C55E`)**: Indicates a doctor is online, an ongoing consultation is active, or a payment has succeeded.
3. **Warning (`#F59E0B`)**: Denotes pending payment actions or temporary loading checkout periods.
4. **Error (`#EF4444`)**: Applied to cancelled consultation items, critical countdown warnings, or session timeouts.
5. **Surface (`#F9FAFB`)**: Used to separate passive dashboard panels, table headers, and form inputs from the pure white viewport background.

---

## 4. Typography System

The primary font family is **Plus Jakarta Sans**, a modern, highly legible sans-serif font optimized for digital screens. Fallback font stack is `Segoe UI, system-ui, sans-serif`.

### Font Settings

| Token Name | Font Size | Weight | Line Height | Letter Spacing | Ideal Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | 52px | Bold (700) | 1.15 (60px) | -0.02em | Hero headline |
| **Heading 1** | 32px | Bold (700) | 1.25 (40px) | -0.01em | Large page title |
| **Heading 2** | 24px | Semibold (600) | 1.30 (31px) | -0.01em | Section headers |
| **Heading 3** | 18px | Semibold (600) | 1.40 (25px) | 0.00em | Modal titles, card headings |
| **Heading 4** | 16px | Semibold (600) | 1.45 (23px) | 0.00em | Small cards, table headers |
| **Body Large** | 18px | Regular (400) | 1.50 (27px) | 0.00em | High priority body paragraphs |
| **Body** | 14px | Regular (400) | 1.55 (22px) | 0.00em | Global text readability |
| **Body Small** | 13px | Medium (500) | 1.50 (20px) | 0.01em | Secondary metadata, logs |
| **Caption** | 11px | Regular (400) | 1.40 (15px) | 0.02em | Timestamps, micro-labels |
| **Button** | 14px | Semibold (600) | 1.00 (14px) | 0.01em | Action buttons, tabs |

---

## 5. Golden Ratio Sizing System

To create natural visual balance across all screens, layout sizing, typography, and spacing utilize scales based on the Golden Ratio ($\phi = 1.618$).

### Typography Scale (px)
Standardized values rounded to the nearest viewport-friendly pixel:
$$\mathbf{11 \to 14 \to 18 \to 24 \to 32 \to 52}$$

### Spacing Scale (px)
Spacing margins and paddings must follow this progression:
* **Gap Extra Small (5px)**: Micro-padding between text lines and icons.
* **Gap Small (8px)**: Internal padding inside buttons, small input fields.
* **Gap Medium (13px)**: Layout gap between cards, inner padding of small cards.
* **Gap Large (21px)**: Standard spacing between major headings and sections.
* **Gap Extra Large (34px)**: Outer margins for dashboard sidebars and desktop grids.
* **Gap Double Extra Large (55px)**: Margin separating large layout sections.

### Layout Scale
Core interface dimensions are derived from Golden Ratio relationships to ensure consistency:
* **Max Container Width**: $1152\text{px}$ (Standard horizontal centering wrapper).
* **Sidebar Width**: $288\text{px}$ (Exactly $\frac{1}{4}$ of container width).
* **Forms Max Width**: $445\text{px}$ (Centered on login/register view).
* **Desktop Chat Width**: $720\text{px}$ (Main readability canvas).
* **Modal Dialog Width**: $550\text{px}$ (Centered checkout/confirmation dialog).
* **Card Dimensions**: Width $267\text{px}$ $\times$ Height $432\text{px}$ (Matches Golden Ratio proportions).

---

## 6. Frame & Layout Guidelines

The application layout shifts fluidly across four key responsive screen breakpoints:

```
[Mobile (390px)] --------> [Tablet (768px)] --------> [Laptop (1280px)] --------> [Desktop (1440px)]
  4 Columns                  8 Columns                  12 Columns                 12 Columns
  Margin: 13px               Margin: 34px               Margin: 96px               Margin: 144px
```

### 1. Desktop (1440px Base Frame)
* **Max-Width**: $1152\text{px}$ centered container
* **Grid**: 12 Columns
* **Left/Right Margin**: $144\text{px}$
* **Gutter Width**: $21\text{px}$

### 2. Laptop (1280px Base Frame)
* **Max-Width**: $1088\text{px}$ centered container
* **Grid**: 12 Columns
* **Left/Right Margin**: $96\text{px}$
* **Gutter Width**: $21\text{px}$

### 3. Tablet (768px Base Frame)
* **Max-Width**: $712\text{px}$ container
* **Grid**: 8 Columns
* **Left/Right Margin**: $34\text{px}$
* **Gutter Width**: $13\text{px}$

### 4. Mobile (390px Base Frame)
* **Max-Width**: Full viewport width
* **Grid**: 4 Columns or single-column stack
* **Left/Right Padding**: $13\text{px}$
* **Gutter Width**: $13\text{px}$

---

## 7. Icon System

HaloHealth mandates the consolidation of all graphic visual vectors to the **Lucide Icons** library. Emojis and raw custom SVG code blocks are deprecated to ensure consistent visual weights and line thickness.

### System Rules
* **Single Source**: `lucide-react` package.
* **Default Icon Stroke**: Standardize at `2px` for small icons and `1.75px` for medium/large icons.
* **Consistent Dimensions**:
  * **Micro (12px)**: Used for status indicators (e.g., green dot, unread counters).
  * **Small (16px)**: For contextual metadata labels (e.g., rating stars, experience badges).
  * **Medium (20px)**: The standard size for form inputs, sidebar items, navigation links, and button icons.
  * **Large (24px)**: Reserved for section headers, page hero points, and payment receipts.

### Icon Replacements for Codebase Consistency
To clean up emojis from the codebase, the following replacements must be executed:
* Replace `🩺` (Consultation) with `<Activity size={20} strokeWidth={1.75} />` or `<Stethoscope size={20} strokeWidth={1.75} />`
* Replace `💊` (Store) with `<Pill size={20} strokeWidth={1.75} />`
* Replace `📄` (Prescription) with `<FileText size={20} strokeWidth={1.75} />`
* Replace `💳` (Payment) with `<CreditCard size={20} strokeWidth={1.75} />`
* Replace `🏥` (General Practice) with `<Hospital size={20} strokeWidth={1.75} />`
* Replace `👶` (Pediatrician) with `<Baby size={20} strokeWidth={1.75} />`
* Replace `🧠` (Neurologist) with `<Brain size={20} strokeWidth={1.75} />`
* Replace `❤️` (Cardiologist) with `<Heart size={20} strokeWidth={1.75} />`

---

## 8. White Space Philosophy

White space is treated as an active structural layout element, not empty canvas space. Increasing whitespace reduces cognitive fatigue for users who may be seeking urgent medical advice.

### Implementation Rules
* **No Fillers Allowed**: Decorative background shapes, floating geometric blobs, and abstract background illustrations (such as those currently in `HeroSection.jsx` and `SpecializationSelect.jsx`) must be removed in favor of clean margins.
* **Breathing Room**: Keep a minimum vertical margin of $34\text{px}$ (Gap XL) between logical page sections (e.g., separating the hero banner from the specialties grid).
* **Grid Spacing**: Cards must be separated by a minimum gutter of $21\text{px}$.
* **Content Densities**: Maintain a minimum line height of `1.5` for all paragraph copy to ensure high readability.

---

## 9. Copywriting Guidelines

HaloHealth requires clear, professional, clinical, and reassuring copywriting. Marketing hype and buzzwords must be avoided.

```
       [Clinical & Trustworthy]               [Startup / Hype Buzzwords]
  "Hubungi dokter umum berlisensi"      vs.  "Teknologi AI kesehatan masa depan"
  "Tuliskan gejala yang Anda rasakan"    vs.  "Revolusi hidup sehat Anda hari ini"
```

### Lexicon Rules
* **Empathetic & Objective**: Frame text as instructions or diagnostic inputs rather than sales pitches.
* **No Marketing Hyperbole**: Do not use words such as: *"Next-generation"*, *"AI-powered"*, *"Revolutionize"*, *"Transform your life"*, *"Disrupting"*.
* **Standard Indonesian Localization**: Ensure correct formal grammar (Bahasa Baku) when communicating diagnoses, fees, and instructions.

### Examples
* **Good**: *"Hubungi dokter berlisensi untuk konsultasi medis"*
* **Bad**: *"Rasakan kecanggihan AI kesehatan terbaik masa kini"*
* **Good**: *"Ringkasan tagihan konsultasi"*
* **Bad**: *"Nikmati diskon spektakuler konsultasi kami"*

---

## 10. Component Standards

Every UI component in the codebase must follow these visual guidelines.

### I. Buttons
Buttons trigger system actions and must have distinct, solid styles. No gradient borders or gradient fills.

```
  [Primary Button]           [Secondary Button]          [Danger Button]
  Background: #FF5C8A        Background: #F9FAFB         Background: #FEF2F2
  Text: #FFFFFF              Text: #1F2937               Text: #EF4444
  Hover: #E54D79             Hover: #E5E7EB              Hover: #FCA5A5
```

* **Radius**: 12px (rounded-xl) for standard buttons, pill-shaped (rounded-full) for navigation chips.
* **Height**:
  * Large (CTAs): $48\text{px}$ height, internal padding $13\text{px}\times21\text{px}$.
  * Medium (Standard): $40\text{px}$ height, internal padding $8\text{px}\times13\text{px}$.
* **States**:
  * Hover: Solid background transitions ($150\text{ms}$ ease).
  * Focus: Outline ring of primary light (`#FFF1F5`) at $2\text{px}$ offset.
  * Disabled: Muted gray fill (`#E5E7EB`), text `#9CA3AF`, pointer-events none.

### II. Inputs & Text Areas
* **Structure**: Solid surface background (`#F9FAFB`), thin functional border (`#E5E7EB`), rounded corners $12\text{px}$.
* **States**:
  * Default: Gray placeholder text (`#9CA3AF`).
  * Focus: Border color changes to `#FF5C8A` (Primary), no outer outline, subtle shadow elevation.
  * Error: Border color shifts to `#EF4444`, with a descriptive error label below the field.

### III. Cards (Doctors & Products)
* **Background**: Solid `#FFFFFF` fill.
* **Borders & Shadows**: No thick outlines. Use a soft background border (`#F9FAFB`) combined with a light elevation shadow:
  ```css
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  ```
* **Image Container**: Solid light surface fill (`#F3F4F6`). Avoid multi-color gradients.

### IV. Modals
* **Backdrop Overlay**: Solid slate overlay (`#0F172A`) at `40%` opacity, with a soft backdrop blur ($4\text{px}$).
* **Container**: Solid `#FFFFFF`, rounded corners $21\text{px}$ (Gap Medium), shadow elevation scale `xl`.

### V. Toast Notifications
* **Visuals**: Positioned at the top-right viewport. Built as solid, high-contrast panels with a left accent color strip matching the status:
  * Success: Solid `#22C55E` accent strip.
  * Error: Solid `#EF4444` accent strip.
* **Elevation**: Shadow scale `lg`.

### VI. Loading & Empty States
* **Loading Indicators**: Use a clean, solid, rotating spinner colored in `#FF5C8A` (Primary). Avoid neon colors or flashing graphics.
* **Empty States**: Centered illustration placeholder containing a neutral vector graphic, a clear subheading (e.g., *"Belum ada konsultasi"*), and a main primary call-to-action button to help the user proceed.

---

## 11. Healthcare Chat Standards

Consultation chat is the core interaction point of the application. It must prioritize text legibility and clean separation of user messages over stylistic decoration.

### Message Bubbles

```
   Patient Bubble (Self)                     Doctor Bubble (Incoming)
  +-------------------------------+         +-------------------------------+
  | Halo Dokter, perut saya terasa|         | Halo, mari kita periksa lebih |
  | nyeri setelah makan.          |         | lanjut. Kapan keluhan mulai   |
  |                               |         | dirasakan?                    |
  |                         16:32 |         | 16:34                         |
  +-------------------------------+         +-------------------------------+
  Solid Fill: #FFF1F5 (Primary Light)       Solid Fill: #F3F4F6 (Slate 100)
  Text Color: #1F2937 (Slate 800)           Text Color: #1F2937 (Slate 800)
  Align: Right, Border-Radius: 16px         Align: Left, Border-Radius: 16px
  (Bottom-right: 4px)                       (Bottom-left: 4px)
```

### Technical Specs
* **Timestamps**: Rendered inline at the bottom-right corner of each message bubble. Text size `11px` (Caption), color `#6B7280` (Text Secondary). Maintain a minimum contrast ratio of `4.5:1` against the bubble background.
* **Chat Container Width**: Desktop max width is constrained to $720\text{px}$ to limit line length and prevent reading fatigue.
* **System Messages**: Action events (e.g., *"Sesi konsultasi dimulai"*, *"Dokter mengakhiri chat"*) must be centered, displayed in small bold text (`11px`), and styled in Slate-500 `#6B7280` inside a light surface background.
* **Medical Receipt Display**: Shared consultation summaries or medical prescriptions must render inside a structured white card containing clear table data, a solid background header, and a primary print/download icon button.

---

## 12. Accessibility Requirements

HaloHealth is designed for everyone, including patients using assistive technologies or browsing in low-light environments.

### WCAG 2.1 AA Checklist
* **Text Contrast**: All body text must maintain a minimum contrast ratio of `4.5:1` against its background. Interactive elements, borders, and subheadings must maintain a contrast ratio of at least `3:1`.
* **Keyboard Navigation**: All interactive elements (buttons, specialization selectors, input controls, custom dropdown fields) must support keyboard tab-focus states (`:focus-visible`) with a clear focus ring indicator.
* **ARIA Attributes**:
  * Forms and search fields must include descriptive `<label>` tags or explicit `aria-label` labels.
  * Responsive mobile dropdown buttons must include `aria-expanded` attributes to declare their toggled state.
  * Image elements must define explicit, readable `alt` fallback text.

---

## 13. Responsive Design Rules

Responsive layout grids must adapt fluidly across devices:

### Layout Grid Reflow
* **Desktop Grid**: Displays lists (e.g., Doctor List, Pharmacy Store, Consultation History) in a 4-column layout.
* **Tablet Grid**: Reflows to a 2-column layout.
* **Mobile Viewport**: Collapses lists to a single-column vertical list to maximize horizontal spacing for text content.

### Split-Panel Dashboards (Doctor View)
* **Desktop/Laptop**: Displays a split-pane layout: a persistent left sidebar containing active patient sessions ($288\text{px}$ width) and a right panel showing the active chat window.
* **Tablet/Mobile**: Collapses the split layout into a single-pane view. Users navigate between the patient directory and the active chat workspace via slide-in menus or dedicated back-button controls.

---

## 14. Design Consistency Checklist

Use this checklist during code reviews to verify that frontend pull requests comply with this specification:

* [ ] **Solid Colors Only**: Verify that all instances of linear gradients, radial gradients, and mesh gradients have been removed from the UI.
* [ ] **Outlines Removed**: Ensure container borders and thick frames are removed, replaced by clean background colors (`#F9FAFB`) and soft elevation shadows.
* [ ] **Colors Aligned**: Verify that teal and cyan buttons or headers have been replaced with the primary color system (`#FF5C8A`, `#FFF1F5`).
* [ ] **Lucide Vector Icons**: Confirm that raw emojis and inline SVG code have been removed from pages, replaced by standard Lucide React icons.
* [ ] **Broken Navigation Links Fixed**: Ensure all patient history buttons route to `/history` (matching the router) instead of `/my-consultations`.
* [ ] **Contrast Ratios Verified**: Check that micro-labels, dates, and timestamps in the consultation chat maintain a minimum contrast ratio of `4.5:1`.
* [ ] **Accessibility Compliance**: Confirm that form elements include valid accessibility labels, and interactive components support clear keyboard focus outlines.
