# v22 Responsive No-Main-Scroll Layout

## Goal
The main screen should not scroll as a full page. Only internal widgets/panels should scroll when needed.

## Implemented
- `html, body` use fixed viewport height and hidden page overflow.
- Left parameter panel scrolls internally.
- Main dashboard uses CSS grid rows.
- View panel and right results rail scroll internally.
- KPI widgets are compact.
- Parameter groups are collapsible.
- Mobile layout is supported with a collapsible parameter area.

## Mobile behavior
- A Parameters button appears at the top.
- The parameter panel can collapse to preserve screen space.
- Tabs are horizontally scrollable.
- KPI and summary widgets reflow to 2 columns.
- Internal panels scroll as needed.
