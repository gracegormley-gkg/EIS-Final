"use client";

import { useState, useEffect } from "react";
import { getBasePath } from "../js/getBasePath";

const STATES = [
  "Alaska","Arizona","California","Colorado","Federal / International",
  "Florida","Georgia","Hawaii","Illinois","Iowa","Maryland","Massachusetts",
  "Michigan","Minnesota","Mississippi","Missouri","Montana","Nevada",
  "New Jersey","New Mexico","New York","North Carolina","Oklahoma","Oregon",
  "Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee",
  "Texas","Washington","West Virginia","Wisconsin","Wyoming",
];

const YEARS = ["1970","1972","1973","1974","1975","1976","1977","1978","1980","1981"];

const THEMES = [
  "Climate and Weather Modification","Energy Systems",
  "Governance and Institutional Control","Indigenous Narratives and Sovereignty",
  "Industrial Production and Materials","Place Based Development Conflicts",
  "Transportation Infrastructure","Urban Development","Water Systems",
  "Wildlife and Natural Areas",
];

type Section = "state" | "year" | "theme" | null;

function getActiveFilter(): string {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  return params.get("q") || "";
}

function navigate(value: string) {
  const base = getBasePath();
  const current = getActiveFilter();
  if (current === value) {
    window.location.href = `${base}/search`;
  } else {
    window.location.href = `${base}/search?q=${encodeURIComponent(value)}`;
  }
}

export default function EISFilterBar() {
  const [open, setOpen] = useState<Section>(null);
  const [active, setActive] = useState("");

  useEffect(() => {
    setActive(getActiveFilter());
  }, []);

  const sections: { id: Section; label: string; values: string[] }[] = [
    { id: "state", label: "State", values: STATES },
    { id: "year",  label: "Year",  values: YEARS },
    { id: "theme", label: "Theme", values: THEMES },
  ];

  const activeSection = active
    ? sections.find((s) => s.values.includes(active))?.id ?? null
    : null;

  return (
    <div className="eis-filter-bar">
      <div className="eis-filter-bar__tabs">
        <span className="eis-filter-bar__label">Filter by</span>
        {sections.map((s) => (
          <button
            key={s.id}
            className={[
              "eis-filter-tab",
              open === s.id ? "eis-filter-tab--open" : "",
              activeSection === s.id ? "eis-filter-tab--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setOpen(open === s.id ? null : s.id)}
          >
            {s.label}
            {activeSection === s.id && (
              <span className="eis-filter-tab__dot" />
            )}
          </button>
        ))}
        {active && (
          <button
            className="eis-filter-clear"
            onClick={() => navigate(active)}
          >
            Clear filter
          </button>
        )}
      </div>

      {open && (
        <div className="eis-filter-panel">
          {sections
            .find((s) => s.id === open)!
            .values.map((v) => (
              <button
                key={v}
                className={[
                  "eis-filter-pill",
                  active === v ? "eis-filter-pill--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => {
                  navigate(v);
                }}
              >
                {v}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
