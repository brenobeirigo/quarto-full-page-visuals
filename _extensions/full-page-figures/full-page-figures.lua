function Pandoc(doc)
  if quarto.doc.is_format("html") or FORMAT:match("html") then
    quarto.doc.add_html_dependency({
      name = "quarto-full-page-figures",
    version = "1.0.1",
      stylesheets = {"full-page-figures.css"},
      scripts = {"full-page-figures.js"},
    })
  end

  return doc
end
