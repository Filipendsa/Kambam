# MASTER.md - Design System Reference (Kanban - Premium Redesign)

## Design Language
- **Estética:** Dark Premium / Monocromático com Alto Contraste (Inspirado em interfaces SaaS de luxo como Linear e Chronicon).
- **Typography:** Inter (Sans-serif - Standard UI Font). Fontes secundárias/monospaced para tags.
- **Spacing/Sizing Engine:** Múltiplos de 4px (ex: 4, 8, 12, 16, 24, 32, 48). Espaçamentos internos muito amplos (breathing room).

## Themes (Light/Dark Mode)

### Dark Mode Tokens (Behance Premium Ref)
- **Base Background:** Preto absoluto (`bg-black` ou `#000000`)
- **Surface (Cards):** Quase preto (`bg-zinc-950` ou `#050505`)
- **Interactive Surface (Hover):** Neutro muito escuro (`bg-zinc-900` ou `#111111`)
- **Borders:** Incrivelmente sutis, translúcidas (`border border-white/5` ou `border border-white/10`)
- **Primary Text:** Branco puro (`text-white`)
- **Muted Text:** Cinza escuro/prata (`text-zinc-400` ou `text-zinc-500`)
- **Primary Accent:** Branco (Botões primários são blocos sólidos brancos com texto preto)
- **Shadows:** Não usa drop-shadows convencionais. Confia no contraste de bordas `white/10` para criar profundidade contra o fundo preto absoluto.

### Light Mode Tokens
- Manter o padrão do Next-themes (modo dark será forçado ou dominante).
- Se presente: Base `#F9FAFB`, Cards `#FFFFFF`, Borders `#E5E7EB`, Text `#09090B`.

## Components - Kanban Board

### Board Container
- Padding: 32px
- Gap (Between Columns): 24px
- Overflow-x: auto (Smooth scrolling)
- Background global: `bg-black`

### Column (Status)
- Width: Fixed 340px (mais larga para respirar)
- Title: Font-weight 500, Size 14px, `text-white/80`, acompanhado de contadores em pílulas (`bg-white/10 text-white/70 rounded-full px-2 py-0.5`).
- Background: Transparente. Sem fundo na coluna. Apenas uma linha sutil no topo (`border-t border-white/10`) para ancorar o título.
- Gap (Between Cards): 12px

### Task Card
- Background: `bg-zinc-950` (Black surface)
- Border: `border border-white/5` (Muito sutil)
- Border Radius: 16px (arredondamento luxuoso, mas não circular)
- Padding: 20px (Espaçamento superior)
- Title: Font-weight 500, Size 15px, `text-white`, leading comprimido.
- Description: Removida ou Size 13px `text-zinc-500` (se houver).
- Badges: Pill-shaped (`rounded-full`), fundo translúcido `bg-white/5`, borda `border-white/10`, texto em 11px/12px `text-zinc-400`.
- Hover State: Borda ilumina levemente para `border-white/20`, fundo para `bg-zinc-900`. Transição lenta (`transition-all duration-300`).

### Avatars
- Miniaturas circulares (24x24) com borda fina preta (`border-2 border-black`) para sobrepor quando encadeados. Fica no rodapé do card alinhado à direita.
