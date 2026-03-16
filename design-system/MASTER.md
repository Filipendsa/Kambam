# MASTER.md - Design System Reference (Kanban - Operação Kambam)

## Design Language
- **Typography:** Inter (Sans-serif - Standard UI Font).
- **Spacing/Sizing Engine:** Múltiplos de 4px (ex: 4, 8, 12, 16, 24, 32, 48).
- **Primary Accent:** Aurora Purple (High contrast against dark/light).

## Themes (Light/Dark Mode)

### Dark Mode Tokens (Linear Benchmark)
- Base Background: `bg-zinc-950` or `#09090b`
- Surface (Cards/Modules): `bg-zinc-900` or `#18181b`
- Borders: `border-zinc-800` or `#27272a`
- Primary Text: `text-zinc-50` or `#fafafa`
- Muted Text: `text-zinc-400` or `#a1a1aa`
- Shadows: Deep, tight dark shadows.

### Light Mode Tokens (Stripe Benchmark)
- Base Background: `bg-zinc-50` or `#fafafa`
- Surface (Cards/Modules): `bg-white` or `#ffffff`
- Borders: `border-zinc-200` or `#e4e4e7`
- Primary Text: `text-zinc-950` or `#09090b`
- Muted Text: `text-zinc-500` or `#71717a`
- Shadows: Soft, diffused, elevated shadows (e.g., `shadow-sm`, `shadow-md` with low opacity).

## Components - Kanban Board

### Board Container
- Padding: 24px ou 32px
- Gap (Between Columns): 16px ou 24px
- Overflow-x: auto (Smooth scrolling)

### Column (Status)
- Width: 320px (Fixed or min-width)
- Title: Font-weight 600, Size 14px, muted color
- Background: Very subtle tint of surface color
- Gap (Between Cards): 8px

### Task Card
- Background: Mapped to Theme Surface Token
- Border: 1px solid modeled to Theme Border Token
- Border Radius: 8px ou 12px
- Padding: 16px
- Transition: 150ms ease
- Title: Font-weight 500, Size 14px, max 2 lines
- Description: Size 12px, truncated
- Hover State: Slightly lifted shadow and border tint (Aurora Purple hint)

### Badges / Tags
- Size: 12px font
- Padding: 2px 6px ou 4px 8px
- Border Radius: 4px
