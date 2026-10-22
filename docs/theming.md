# Workbench theme

Workbench deliberately uses a different identity from the BLD8 UI showcase:
cool grey surfaces, cobalt primary actions, pale blue/lavender/peach accents and a
geometric W with a separated terminal. The same installed
controls keep their behaviour, geometry, keyboard support and motion.

## Palette

| Role | Colour |
|---|---|
| Canvas / panels | `#f3f4f7` / white |
| Primary / hover | `#3658e8` / `#2946c7`, with white text |
| Accent / hover | `#c9d9ff` / `#b7ccff`, with `#243d83` text |
| Lavender / ink | `#eee9fc` / `#65469b` |
| Peach / ink | `#fff0e6` / `#9a4f32` |
| Brand tile / mark / terminal | Cobalt-to-violet / white / `#ffbe98` |

Use pale blue for selection and secondary emphasis; primary actions use cobalt.
Ink text and white panels keep long responses calm and readable. Keep state colours
and labels distinct from decoration. Lavender identifies quiet inspector headers
and code/table surfaces; peach warms the workspace note and preview tag. Sample
cards use blue, lavender and peach tints with small matching edge details. These
colours are decorative, not a replacement for status labels or success/error tones.
The logo tile blends cobalt into violet; its white W has a peach terminal.

## Change the application theme

Edit `apps/web/src/app/theme.css`. The `html[data-workbench-theme="cobalt"]`
selector overrides the library's public CSS tokens without editing its source.
The attribute is set in the root layout. Its selector is more specific than the
library defaults, so component stylesheet order does not reset the theme.

| Tokens | Controls |
|---|---|
| `--bui-primary`, `--bui-primary-hover`, `--bui-primary-ink` | Primary actions and their text. |
| `--bui-accent`, `--bui-accent-hover`, `--bui-accent-ink` | Accent actions, selected controls and progress. |
| `--bui-canvas`, `--bui-bg`, `--bui-surface` | Page, panels and secondary surfaces. |
| `--bui-ink`, `--bui-muted`, `--bui-line`, `--bui-focus` | Text, separators and keyboard focus. |
| Radius and shadow tokens | Control edges, overlays, panels and elevation. |
| `--wb-*` | Workbench-specific navigation, branding, code and layout colours. |

Change foreground/background token pairs together and retain visible hover,
selected, disabled, error and keyboard-focus states. Semantic warning/success
colours remain distinct from the brand accent. Forced-colour overrides preserve
system colours; reduced-motion handling and library easing remain in place.

## Change the mark

The geometric W and separated terminal live in `src/components/brand-mark.tsx`.
The solid paths stay sharp without fonts, filters or strokes at small sizes.
Its container uses the theme's brand fill/text tokens. `src/app/icon.svg` carries
the same geometry and palette for the browser tab, including the two-tone tile
and peach terminal. The wordmark is composed in `app-frame.tsx`.
Small screens use the mark alone while the top bar retains the Workbench name.

## What remains upstream

All eighteen installed files under `src/components/ui/bld8` remain unchanged,
including the original style tokens, component source and licences. The canonical
BLD8 UI repository and its showcase are also independent of this app theme.
Future registry updates can be reviewed without mixing application branding into
the imported controls. Use the existing browser suite to check contrast,
containment, keyboard interactions and reduced motion after a palette change.
