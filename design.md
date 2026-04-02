web application/stitch/projects/8867116231352536994/screens/3499c02ee52146939c597e5766b1f4fe
# Design Specification: FlowCash Dashboard

## 1. Overview
FlowCash is a modern, high-contrast financial management dashboard designed with a "soft-tech" aesthetic. It prioritizes clarity, ease of use, and a premium feel through the use of bold monochrome elements and highly rounded corners.

## 2. Visual Language

### 2.1 Color Palette
- **Primary Background:** `#F5F5F5` (Off-white) - Provides a soft, neutral base.
- **Surface/Card Background:** `#FFFFFF` (Pure White) - Used for elevated content areas.
- **Primary Accent:** `#000000` (Solid Black) - Used for high-emphasis buttons, active states, and hero sections.
- **Secondary Text/Icons:** `#666666` (Medium Gray) - For subtext and inactive icons.
- **Border/Divider:** `#E5E5E5` (Light Gray) - Subtle separation where needed.

### 2.2 Typography
- **Primary Font:** Sans-serif (e.g., Inter, Geist, or Roboto).
- **Header 1 (Welcome):** Bold, 24px-28px.
- **Section Headers:** Semi-bold, 18px-20px.
- **Body Text:** Regular, 14px-16px.
- **Labels/Small Text:** Medium, 12px.

### 2.3 UI Components & Shapes
- **Corner Radius:** Global radius of `24px` to `32px` for all cards and primary containers.
- **Buttons:**
  - *Primary:* Black background, white text, pill-shaped.
  - *Secondary:* White background, black border/text, pill-shaped.
- **Shadows:** Soft, diffused drop shadows (`box-shadow: 0 4px 20px rgba(0,0,0,0.05)`) on white cards.

## 3. Layout Structure

### 3.1 Sidebar (Navigation)
- **Width:** 260px (Fixed).
- **Logo:** "FlowCash" with a spark/sparkle icon.
- **Nav Items:** Vertical stack with icon + label.
- **Active State:** Black pill background with white text/icon.
- **Promotion Card:** Dark themed "Get Premium" card at the bottom with a 3D rocket illustration.

### 3.2 Main Content Area
- **Header:** Personalized greeting ("Hello, [User]") and a primary CTA button (+ Add Expense).
- **Hero Statistics:** A full-width black card containing:
    - User Profile (Avatar, Name, Role).
    - Income/Outcome summary boxes with directional arrows.

### 3.3 Dashboard Grid (Three Columns)
- **Column 1 (Recent Transactions):** White card list. Each entry features a progress ring/circle for category-specific budget usage.
- **Column 2 (Quick Add):** Dark themed form container for rapid data entry.
- **Column 3 (Analytics):**
    - **Reports Card:** Interactive line chart for monthly expense tracking.
    - **Spending Breakdown:** Donut chart with a central percentage and color-coded legend.

## 4. Interaction Design
- **Hover States:** Smooth transitions (0.2s) for all interactive elements. Buttons should slightly scale or change opacity.
- **Form Focus:** High-contrast focus rings for input fields in the "Quick Add" section.
- **Charts:** Use a library like `Recharts` for animated, responsive data visualizations.

## 5. Responsiveness
- **Desktop (1280px+):** Full three-column layout with fixed sidebar.
- **Tablet (768px - 1279px):** Sidebar collapses to icons only; grid shifts to 2 columns.
- **Mobile (<768px):** Sidebar becomes a bottom navigation bar or hamburger menu; all cards stack vertically in a single column.
