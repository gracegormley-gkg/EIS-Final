"use client";

import { useState, useEffect } from "react";
import { getBasePath } from "../js/getBasePath";

interface WorkEntry {
  title: string;
  thumbnail: string;
  year: string;
  state: string;
  themes: string[];
  manifestUrl: string;
}

function slugFromUrl(manifestUrl: string): string {
  return manifestUrl.split("/").pop()?.replace(".json", "") ?? "";
}

function WorkCard({ work, base }: { work: WorkEntry; base: string }) {
  const slug = slugFromUrl(work.manifestUrl);
  const href = `${base}/works/${slug}.html`;
  return (
    <a href={href} className="eis-related-card">
      {work.thumbnail && (
        <div className="eis-related-card__thumb">
          <img src={work.thumbnail} alt="" loading="lazy" />
        </div>
      )}
      <p className="eis-related-card__title">{work.title}</p>
    </a>
  );
}

function RelatedSection({
  label,
  tag,
  works,
  base,
  searchVal,
}: {
  label: string;
  tag: string;
  works: WorkEntry[];
  base: string;
  searchVal: string;
}) {
  if (works.length === 0) return null;
  return (
    <div className="eis-related-section">
      <div className="eis-related-section__header">
        <span className="eis-related-section__label">{label}</span>
        <span className="eis-related-section__tag">{tag}</span>
        <a
          href={`${base}/search?q=${encodeURIComponent(searchVal)}`}
          className="eis-related-section__more"
        >
          Browse all →
        </a>
      </div>
      <div className="eis-related-section__grid">
        {works.map((w) => (
          <WorkCard key={w.manifestUrl} work={w} base={base} />
        ))}
      </div>
    </div>
  );
}

export default function EISRelatedWorks({
  manifestId,
}: {
  manifestId: string;
}) {
  const [sections, setSections] = useState<
    Array<{ label: string; tag: string; works: WorkEntry[]; searchVal: string }>
  >([]);
  const [loaded, setLoaded] = useState(false);
  const base = getBasePath();

  useEffect(() => {
    fetch(`${base}/eis-index.json`)
      .then((r) => r.json())
      .then((allWorks: WorkEntry[]) => {
        const current = allWorks.find((w) => w.manifestUrl === manifestId);
        const others = allWorks.filter((w) => w.manifestUrl !== manifestId);

        const themes = current?.themes ?? [];
        const year = current?.year ?? "";
        const state = current?.state ?? "";

        const byTheme = themes.length
          ? others
              .filter((w) => w.themes.some((t) => themes.includes(t)))
              .slice(0, 3)
          : [];

        const byYear = year
          ? others.filter((w) => w.year === year).slice(0, 3)
          : [];

        const byState =
          state && state !== "Federal / International"
            ? others.filter((w) => w.state === state).slice(0, 3)
            : [];

        const built = [];
        if (byTheme.length)
          built.push({
            label: "Same Theme",
            tag: themes[0],
            works: byTheme,
            searchVal: themes[0],
          });
        if (byYear.length)
          built.push({
            label: "Same Year",
            tag: year,
            works: byYear,
            searchVal: year,
          });
        if (byState.length)
          built.push({
            label: "Same State",
            tag: state,
            works: byState,
            searchVal: state,
          });

        setSections(built);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [base, manifestId]);

  if (!loaded || sections.length === 0) return null;

  return (
    <div className="eis-related-works">
      {sections.map((s) => (
        <RelatedSection key={s.label} {...s} base={base} />
      ))}
    </div>
  );
}
