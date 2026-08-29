# Full-page visuals for Quarto

`full-page-visuals` adds a compact, accessible fullscreen control to captioned
figures, Mermaid diagrams, tables, and visual code-cell outputs in Quarto HTML
documents and Reveal.js decks. The control overlays the visual, so it does not
consume figure space or alter the document layout.

## Install

```powershell
quarto add brenobeirigo/quarto-full-page-visuals --no-prompt
```

## Enable

Add the filter to a document or project configuration:

```yaml
filters:
  - full-page-figures
```

The filter identifier remains `full-page-figures` for compatibility with
projects that used earlier releases.

The extension enhances supported figures and tables automatically. Add the
`.no-full-page` class when an element should retain its normal rendering
without a full-page control.

```markdown
![A compact figure that should not open full page.](figure.svg){.no-full-page}
```

## Supported output

- Quarto HTML documents and websites
- Reveal.js presentations
- Captioned images and SVG figures
- Mermaid diagrams
- Captioned and uncaptioned tables
- Visual code-cell outputs that are not already wrapped in a figure

The control is omitted from print output.

## Accessibility and interaction

- The icon button has a caption-aware accessible name and a text tooltip.
- Keyboard focus is visible, and focus moves into and out of the dialog.
- The dialog closes through its button, the `Esc` key, or the backdrop.
- The control becomes more prominent on hover, keyboard focus, and touch-only
  devices.
