# Full-page figures for Quarto

`full-page-figures` adds an accessible "View full page" control to captioned
figures, Mermaid diagrams, tables, and visual code-cell outputs in Quarto HTML
documents and Reveal.js decks.

## Install

```powershell
quarto add brenobeirigo/quarto-full-page-figures --no-prompt
```

## Enable

Add the filter to a document or project configuration:

```yaml
filters:
  - full-page-figures
```

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
