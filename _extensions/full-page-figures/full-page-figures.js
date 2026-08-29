(function () {
  "use strict";

  const visualSelector = [
    "img",
    "svg",
    "canvas",
    "video",
    "iframe",
    "object",
    "pre.mermaid",
  ].join(", ");

  function pageRoots() {
    return document.querySelectorAll("main, .reveal .slides");
  }

  function captionFor(candidate, index) {
    const caption = candidate.querySelector("figcaption, caption")?.textContent
      ?.replace(/\s+/g, " ")
      ?.trim();

    if (caption) {
      return caption;
    }

    const adjacentCaption = candidate.nextElementSibling?.matches(".caption")
      ? candidate.nextElementSibling.textContent.replace(/\s+/g, " ").trim()
      : "";

    if (adjacentCaption) {
      return adjacentCaption;
    }

    const imageAlt = (
      candidate.matches("img[alt]")
        ? candidate.getAttribute("alt")
        : candidate.querySelector("img[alt]")?.getAttribute("alt")
    )?.trim();

    if (imageAlt) {
      return imageAlt;
    }

    const kind = candidate.matches("table, .quarto-float-tbl")
      ? "Table"
      : "Visual";
    return `${kind} ${index + 1}`;
  }

  function collectCandidates() {
    const candidates = new Set();

    pageRoots().forEach(function (root) {
      root.querySelectorAll("figure").forEach(function (figure) {
        if (figure.querySelector(visualSelector)) {
          candidates.add(figure);
        }
      });

      root.querySelectorAll(".cell-output-display").forEach(function (output) {
        if (!output.querySelector("figure") && output.querySelector(visualSelector)) {
          candidates.add(output);
        }
      });

      root.querySelectorAll(".quarto-float-tbl").forEach(function (tableFloat) {
        if (tableFloat.querySelector("table")) {
          candidates.add(tableFloat);
        }
      });

      root.querySelectorAll("table").forEach(function (table) {
        if (!table.closest(".quarto-float-tbl")) {
          candidates.add(table);
        }
      });

      root.querySelectorAll("[id^='fig-']").forEach(function (visual) {
        if (visual.matches(visualSelector) && !visual.closest("figure")) {
          candidates.add(visual);
        }
      });
    });

    return [...candidates]
      .filter(function (candidate) {
        return !candidate.closest(".no-full-page, .qfp-dialog");
      })
      .sort(function (left, right) {
        return left.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING
          ? -1
          : 1;
      });
  }

  function createDialog() {
    const dialog = document.createElement("dialog");
    dialog.className = "qfp-dialog";
    dialog.setAttribute("aria-labelledby", "qfp-caption");
    dialog.innerHTML = [
      '<div class="qfp-header">',
      '  <p id="qfp-caption" class="qfp-caption"></p>',
      '  <button type="button" class="qfp-close"',
      '    aria-label="Close full-page visual">Close</button>',
      "</div>",
      '<div class="qfp-content"></div>',
    ].join("");
    const host = document.querySelector(".reveal") || document.body;
    host.append(dialog);
    return dialog;
  }

  function initializeFullPageFigures() {
    const dialog = createDialog();
    const content = dialog.querySelector(".qfp-content");
    const caption = dialog.querySelector(".qfp-caption");
    const closeButton = dialog.querySelector(".qfp-close");
    let active = null;

    function restoreVisual() {
      if (!active) {
        return;
      }

      active.candidate.classList.remove("qfp-active");
      if (
        active.nextSibling &&
        active.nextSibling.parentNode === active.parent
      ) {
        active.parent.insertBefore(active.candidate, active.nextSibling);
      } else {
        active.parent.append(active.candidate);
      }
      active.button.focus();
      active = null;
      document.documentElement.classList.remove("qfp-modal-open");
    }

    function closeDialog() {
      if (dialog.open) {
        dialog.close();
      } else {
        restoreVisual();
      }
    }

    function enhance(candidate, index) {
      if (candidate.dataset.qfpEnhanced === "true") {
        return;
      }

      candidate.dataset.qfpEnhanced = "true";
      const visualCaption = captionFor(candidate, index);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "qfp-open";
      button.innerHTML = [
        '<svg aria-hidden="true" focusable="false" viewBox="0 0 16 16">',
        '  <path fill="currentColor" d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5M.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5"/>',
        "</svg>",
      ].join("");
      button.title = "View full page";
      button.setAttribute("aria-label", `View full page: ${visualCaption}`);

      const toolbar = document.createElement("div");
      toolbar.className = "qfp-toolbar";
      toolbar.append(button);
      candidate.parentNode.insertBefore(toolbar, candidate);

      button.addEventListener("click", function () {
        active = {
          candidate,
          parent: candidate.parentNode,
          nextSibling: candidate.nextSibling,
          button,
        };
        caption.textContent = visualCaption;
        candidate.classList.add("qfp-active");
        content.append(candidate);
        document.documentElement.classList.add("qfp-modal-open");
        dialog.showModal();
        closeButton.focus();
      });
    }

    function scan() {
      collectCandidates().forEach(enhance);
    }

    closeButton.addEventListener("click", closeDialog);
    dialog.addEventListener("close", restoreVisual);
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) {
        closeDialog();
      }
    });

    scan();
    const observer = new MutationObserver(scan);
    pageRoots().forEach(function (root) {
      observer.observe(root, { childList: true, subtree: true });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeFullPageFigures, {
      once: true,
    });
  } else {
    initializeFullPageFigures();
  }
})();
