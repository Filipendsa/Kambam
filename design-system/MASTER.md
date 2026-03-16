# MASTER.md - Design System Reference (Kanban - Operação Kambam)

## Design Language
- **Benchmark:** Linear / Stripe (Premium, Clean, Minimalist).
- **Typography:** Inter (Sans-serif - Standard UI Font).
- **Spacing/Sizing Engine:** Múltiplos de 4px (ex: 4, 8, 12, 16, 24, 32, 48).
- **Primary Accent:** Aurora Purple (High contrast against dark/light).

## Components - Kanban Board

### Board Container
- Padding: 24px ou 32px
- Gap (Between Columns): 16px ou 24px
- Overflow-x: auto (Smooth scrolling)

### Column (Status)
- Width: 320px (Fixed or min-width)
- Title: Font-weight 600, Size 14px, muted color
- Background: Minimal/No background, very subtle border or simple spacing
- Gap (Between Cards): 8px

### Task Card
- Background: Surface color (e.g., bg-white in light, bg-zinc-900 in dark)
- Border: 1px solid subtle border (`border-border`)
- Border Radius: 8px ou 12px
- Padding: 16px
- Box-Shadow: Very subtle elevation (shadow-sm) on rest; slightly lifted on hover
- Transition: 150ms ease
- Title: Font-weight 500, Size 14px, max 2 lines
- Description: Size 12px, text-muted-foreground, truncated
- Footer: Flex container for Priority / Avatar / Due Date

### Badges / Tags
- Size: 12px font
- Padding: 2px 6px ou 4px 8px
- Border Radius: 4px
- Priority High: Red tinted
- Priority Medium: Orange/Yellow tinted
- Priority Low: Blue/Zinc tinted