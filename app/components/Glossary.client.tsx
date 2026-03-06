import React, { useEffect } from "react";
import { glossaryTerms } from "../js/glossary-terms.js";
import {
  attachGlossaryTooltips,
  highlightGlossaryTerms,
  identifyGlossaryMatches,
  renderGlossary,
} from "../js/glossary-functions.js";

interface GlossaryClientProps {
  contentSelector?: string;
  glossarySelector?: string;
}

export default function GlossaryClient({
  contentSelector = ".canopy-work--secondary",
  glossarySelector = "#glossary-section",
}: GlossaryClientProps) {
  useEffect(() => {
    const content = document.querySelector(contentSelector);
    const glossaryContainer = document.querySelector(glossarySelector);

    if (!(content instanceof HTMLElement) || !(glossaryContainer instanceof HTMLElement)) {
      return;
    }

    const observerConfig: MutationObserverInit = {
      childList: true,
      characterData: true,
      subtree: true,
    };

    let observer: MutationObserver | null = null;

    const applyGlossary = () => {
      observer?.disconnect();

      const textToScan = content.textContent || "";
      if (textToScan.trim()) {
        const matches = identifyGlossaryMatches(textToScan, glossaryTerms);
        highlightGlossaryTerms(content, matches);
        renderGlossary(matches, glossaryContainer);
        attachGlossaryTooltips(content);
      } else {
        glossaryContainer.innerHTML = "";
      }

      observer?.observe(content, observerConfig);
    };

    observer = new MutationObserver(mutations => {
      if (!mutations.length) return;
      applyGlossary();
    });

    applyGlossary();

    return () => observer?.disconnect();
  }, [contentSelector, glossarySelector]);

  return null;
}
