const TOOLTIP_DATA_KEY = "glossaryTooltipsBound";

const escapeRegExp = term => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildTermRegex = term => new RegExp(`\\b(${escapeRegExp(term)})\\b`, "gi");

const buildCombinedRegex = terms => {
  if (!terms.length) return null;
  const escapedTerms = terms.map(escapeRegExp).filter(Boolean);
  if (!escapedTerms.length) return null;
  return new RegExp(`\\b(${escapedTerms.join("|")})\\b`, "gi");
};

const normalizeGlossary = glossary => {
  const normalized = {};
  for (const [term, definition] of Object.entries(glossary)) {
    normalized[term.toLowerCase()] = { term, definition };
  }
  return normalized;
};

export function identifyGlossaryMatches(text, glossary) {
  const matches = {};
  if (!text || !glossary) return matches;

  for (const term in glossary) {
    if (!Object.prototype.hasOwnProperty.call(glossary, term)) continue;
    const regex = buildTermRegex(term);
    if (regex.test(text)) matches[term] = glossary[term];
  }
  return matches;
}

export function highlightGlossaryTerms(container, glossary) {
  if (!container || !glossary) return;
  const terms = Object.keys(glossary);
  if (!terms.length) return;

  const regexTemplate = buildCombinedRegex(terms);
  if (!regexTemplate) return;

  const { source, flags } = regexTemplate;
  const createRegex = () => new RegExp(source, flags);
  const normalizedGlossary = normalizeGlossary(glossary);

  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (!node.textContent || !node.textContent.trim()) {
          return NodeFilter.FILTER_REJECT;
        }
        const parent = node.parentElement;
        if (parent && parent.closest(".glossary-term")) {
          return NodeFilter.FILTER_REJECT;
        }
        const regex = createRegex();
        return regex.test(node.textContent)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    },
  );

  const nodesToProcess = [];
  while (walker.nextNode()) {
    nodesToProcess.push(walker.currentNode);
  }

  for (const node of nodesToProcess) {
    const text = node.textContent;
    if (!text) continue;
    const regex = createRegex();
    let match;
    let lastIndex = 0;
    const fragment = document.createDocumentFragment();

    while ((match = regex.exec(text)) !== null) {
      const { index } = match;
      const matchText = match[0];
      if (index > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, index)));
      }
      const span = document.createElement("span");
      span.className = "glossary-term";
      span.textContent = matchText;
      const normalized = normalizedGlossary[matchText.toLowerCase()];
      if (normalized) {
        span.setAttribute("data-definition", normalized.definition);
      }
      fragment.appendChild(span);
      lastIndex = index + matchText.length;
    }

    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    node.replaceWith(fragment);
  }
}

export function renderGlossary(glossary, container) {
  container.innerHTML = "<h2>Glossary</h2>";
  for (const [term, definition] of Object.entries(glossary)) {
    const item = document.createElement("div");
    item.className = "glossary-item";
    item.id = `glossary-${term}`;
    item.innerHTML = `<strong>${term}</strong>: ${definition}`;
    container.appendChild(item);
  }
}

export function attachGlossaryTooltips(container) {
  if (!container || container.dataset[TOOLTIP_DATA_KEY]) return;
  container.dataset[TOOLTIP_DATA_KEY] = "true";

  container.addEventListener("mouseover", e => {
    const target = e.target instanceof Element ? e.target : null;
    const term = target?.closest(".glossary-term");
    if (!term) return;

    const tooltip = document.createElement("div");
    tooltip.textContent = term.getAttribute("data-definition");
    tooltip.className = "glossary-tooltip";
    document.body.appendChild(tooltip);

    const rect = term.getBoundingClientRect();
    const ttRect = tooltip.getBoundingClientRect();
    let left = rect.left + rect.width / 2 - ttRect.width / 2;
    const top = rect.bottom + 8;

    left = Math.max(8, Math.min(left, window.innerWidth - ttRect.width - 8));
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.style.position = "fixed";

    term.addEventListener("mouseleave", () => tooltip.remove(), { once: true });
  });
}
