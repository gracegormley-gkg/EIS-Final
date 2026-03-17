import React, {useEffect, useRef, useState} from "react";

const GRAPH_CDN_URL = "https://esm.sh/graphology@0.25.4?bundle";
const SIGMA_CDN_URL = "https://esm.sh/sigma@3.0.0?bundle";
const COLLECTION_URL =
  "https://raw.githubusercontent.com/gracegormley-gkg/canumpy-/main/collection.json";

const CANOPY_BASE_URL = "https://nulib-ds.github.io/EIS-Final";

// Canopy truncates slugs to 50 chars and appends .html
function manifestToCanopyUrl(manifestId) {
  const filename = manifestId
    .split("/")
    .pop()
    .replace(/\.json$/, "");
  const slug = filename.slice(0, 50);
  return `${CANOPY_BASE_URL}/works/${slug}.html`;
}

const themeColors = {
  theme1: "#3b82f6",
  theme2: "#16a34a",
  theme3: "#f59e0b",
  theme4: "#94a3b8",
  theme5: "#f97316",
  theme6: "#7dd3fc",
  theme7: "#78716c",
  theme8: "#b45309",
  theme9: "#1d4ed8",
  theme10: "#a21caf",
};

const themes = [
  {
    id: "theme1",
    label: "Water Systems",
    subnodes: [
      {id: "theme1_1", label: "Rivers & Streams"},
      {id: "theme1_2", label: "Groundwater"},
      {id: "theme1_3", label: "Wetlands"},
    ],
  },
  {
    id: "theme2",
    label: "Wildlife and Natural Areas",
    subnodes: [
      {id: "theme2_1", label: "Protected Areas"},
      {id: "theme2_2", label: "Endangered Species"},
    ],
  },
  {
    id: "theme3",
    label: "Energy Systems",
    subnodes: [
      {id: "theme3_1", label: "Renewables"},
      {id: "theme3_2", label: "Fossil Fuels"},
      {id: "theme3_3", label: "Nuclear"},
      {id: "theme3_4", label: "Grid Infrastructure"},
    ],
  },
  {
    id: "theme4",
    label: "Transportation Infrastructure",
    subnodes: [
      {id: "theme4_1", label: "Road Transport"},
      {id: "theme4_2", label: "Rail Transport"},
      {id: "theme4_3", label: "Air Transport"},
    ],
  },
  {
    id: "theme5",
    label: "Urban Development",
    subnodes: [
      {id: "theme5_1", label: "Housing"},
      {id: "theme5_2", label: "Zoning"},
    ],
  },
  {
    id: "theme6",
    label: "Climate and Weather Modification",
    subnodes: [
      {id: "theme6_1", label: "Emissions"},
      {id: "theme6_2", label: "Geoengineering"},
      {id: "theme6_3", label: "Extreme Events"},
      {id: "theme6_4", label: "Carbon Sinks"},
    ],
  },
  {
    id: "theme7",
    label: "Industrial Production and Materials",
    subnodes: [
      {id: "theme7_1", label: "Mining"},
      {id: "theme7_2", label: "Manufacturing"},
      {id: "theme7_3", label: "Waste"},
    ],
  },
  {
    id: "theme8",
    label: "Place Based Development Conflicts",
    subnodes: [
      {id: "theme8_1", label: "Land Use"},
      {id: "theme8_2", label: "Resource Rights"},
    ],
  },
  {
    id: "theme9",
    label: "Governance and Institutional Control",
    subnodes: [
      {id: "theme9_1", label: "Federal Policy"},
      {id: "theme9_2", label: "Local Policy"},
      {id: "theme9_3", label: "International Agreements"},
      {id: "theme9_4", label: "Enforcement"},
    ],
  },
  {
    id: "theme10",
    label: "Indigenous Narratives and Sovereignty",
    subnodes: [
      {id: "theme10_1", label: "Land Rights"},
      {id: "theme10_2", label: "Cultural Preservation"},
      {id: "theme10_3", label: "Self-Governance"},
    ],
  },
];

const fixedPositions = {
  theme1: {x: -0.6, y: 0.4},
  theme2: {x: -0.5, y: -0.1},
  theme6: {x: -0.2, y: 0.4},
  theme3: {x: 0.0, y: 0.1},
  theme4: {x: 0.3, y: 0.3},
  theme7: {x: 0.3, y: -0.1},
  theme5: {x: 0.6, y: 0.2},
  theme9: {x: 0.6, y: -0.2},
  theme8: {x: 0.2, y: -0.4},
  theme10: {x: -0.3, y: -0.5},
};

if (typeof document !== "undefined" && !document.getElementById("sigma-font")) {
  const link = document.createElement("link");
  link.id = "sigma-font";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap";
  document.head.appendChild(link);
}

// Helper: extract a metadata value by label from a IIIF manifest
function getMetaValue(manifest, labelName) {
  if (!manifest.metadata) return null;
  const entry = manifest.metadata.find(
    (m) => m.label?.none?.[0]?.toLowerCase() === labelName.toLowerCase(),
  );
  return entry?.value?.none?.[0] ?? null;
}

// Fetch all manifests in parallel and return enriched doc objects
async function loadDocuments() {
  const collectionRes = await fetch(COLLECTION_URL);
  const collection = await collectionRes.json();

  const manifestItems = collection.items ?? [];

  const manifests = await Promise.all(
    manifestItems.map(async (item) => {
      try {
        const res = await fetch(item.id);
        const manifest = await res.json();
        const themesRaw = getMetaValue(manifest, "Themes") ?? "";
        const docThemes = themesRaw
          .split(/[,;]/)
          .map((t) => t.trim())
          .filter(Boolean);

        return {
          id: item.id,
          label: item.label?.none?.[0] ?? "Untitled",
          summary: item.summary?.none?.[0] ?? "",
          thumbnail: item.thumbnail?.[0]?.id ?? null,
          homepage: item.homepage?.[0]?.id ?? null,
          themes: docThemes,
        };
      } catch {
        return null;
      }
    }),
  );

  return manifests.filter(Boolean);
}

// ─── Document Panel ──────────────────────────────────────────────────────────

function DocPanel({theme, docs, onClose}) {
  const color = themeColors[theme?.id] ?? "#94a3b8";
  const filtered = docs.filter((d) =>
    d.themes.some((t) => t.toLowerCase() === theme?.label?.toLowerCase()),
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: "360px",
        height: "100%",
        background: "#fff",
        boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
        display: "flex",
        flexDirection: "column",
        zIndex: 10,
        fontFamily: "'DM Sans', sans-serif",
        overflowY: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 20px 16px",
          borderBottom: `3px solid ${color}`,
          background: "#fafafa",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: color,
                marginBottom: "4px",
              }}
            >
              Theme
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#0f172a",
                lineHeight: 1.3,
              }}
            >
              {theme?.label}
            </div>
            <div style={{fontSize: "13px", color: "#64748b", marginTop: "4px"}}>
              {filtered.length} document{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94a3b8",
              fontSize: "20px",
              lineHeight: 1,
              padding: "2px 4px",
              borderRadius: "4px",
              flexShrink: 0,
            }}
            aria-label="Close panel"
          >
            ×
          </button>
        </div>
      </div>

      {/* Document list */}
      <div style={{overflowY: "auto", flex: 1, padding: "12px"}}>
        {filtered.length === 0 ? (
          <div
            style={{
              color: "#94a3b8",
              fontSize: "14px",
              padding: "24px 8px",
              textAlign: "center",
            }}
          >
            No documents found for this theme.
          </div>
        ) : (
          filtered.map((doc) => (
            <a
              key={doc.id}
              href={manifestToCanopyUrl(doc.id)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                gap: "12px",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "8px",
                textDecoration: "none",
                color: "inherit",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                transition: "box-shadow 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f1f5f9";
                e.currentTarget.style.boxShadow = `0 0 0 2px ${color}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f8fafc";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {doc.thumbnail && (
                <img
                  src={doc.thumbnail}
                  alt=""
                  style={{
                    width: "52px",
                    height: "68px",
                    objectFit: "cover",
                    borderRadius: "4px",
                    flexShrink: 0,
                    border: "1px solid #e2e8f0",
                  }}
                />
              )}
              <div style={{minWidth: 0}}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#0f172a",
                    lineHeight: 1.4,
                    marginBottom: "6px",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {doc.label}
                </div>
                {doc.summary && (
                  <div
                    style={{
                      fontSize: "11.5px",
                      color: "#64748b",
                      lineHeight: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {doc.summary}
                  </div>
                )}
                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "11px",
                    color: color,
                    fontWeight: 500,
                  }}
                >
                  Open on site →
                </div>
              </div>
            </a>
          ))
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "10px 16px",
          borderTop: "1px solid #e2e8f0",
          fontSize: "11px",
          color: "#94a3b8",
          flexShrink: 0,
          background: "#fafafa",
        }}
      >
        Northwestern University Libraries · Environmental Impact Statement
        Collection
      </div>
    </div>
  );
}

// ─── Loading overlay ──────────────────────────────────────────────────────────

function LoadingOverlay({progress, total}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(255,255,255,0.92)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 20,
        fontFamily: "'DM Sans', sans-serif",
        gap: "16px",
      }}
    >
      <div style={{fontSize: "14px", color: "#475569", fontWeight: 500}}>
        Loading collection…
      </div>
      {total > 0 && (
        <>
          <div
            style={{
              width: "200px",
              height: "4px",
              background: "#e2e8f0",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.round((progress / total) * 100)}%`,
                background: "#3b82f6",
                borderRadius: "2px",
                transition: "width 0.2s",
              }}
            />
          </div>
          <div style={{fontSize: "12px", color: "#94a3b8"}}>
            {progress} / {total} manifests
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

// Scale doc count → node size (sqrt scaling, clamped)
function docCountToSize(count) {
  const MIN = 12,
    MAX = 38;
  if (count <= 0) return MIN;
  return Math.min(MAX, Math.max(MIN, Math.sqrt(count) * 7));
}

export default function SigmaExample({...rest}) {
  const containerRef = useRef(null);
  const graphRef = useRef(null); // graphology Graph instance
  const originalNodeAttrsRef = useRef({}); // shared so camera handler stays in sync
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadTotal, setLoadTotal] = useState(0);

  // Load all documents once
  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const collectionRes = await fetch(COLLECTION_URL);
        const collection = await collectionRes.json();
        const manifestItems = collection.items ?? [];
        setLoadTotal(manifestItems.length);

        let loaded = 0;
        const results = await Promise.all(
          manifestItems.map(async (item) => {
            try {
              const res = await fetch(item.id);
              const manifest = await res.json();
              const themesRaw = getMetaValue(manifest, "Themes") ?? "";
              const docThemes = themesRaw
                .split(/[,;]/)
                .map((t) => t.trim())
                .filter(Boolean);

              const doc = {
                id: item.id,
                label: item.label?.none?.[0] ?? "Untitled",
                summary: item.summary?.none?.[0] ?? "",
                thumbnail: item.thumbnail?.[0]?.id ?? null,
                homepage: item.homepage?.[0]?.id ?? null,
                themes: docThemes,
              };
              loaded++;
              if (!cancelled) setLoadProgress(loaded);
              return doc;
            } catch {
              loaded++;
              if (!cancelled) setLoadProgress(loaded);
              return null;
            }
          }),
        );

        if (!cancelled) {
          setDocs(results.filter(Boolean));
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load collection:", err);
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  // Once docs load, resize theme nodes by document count
  useEffect(() => {
    if (loading || docs.length === 0 || !graphRef.current) return;
    const graph = graphRef.current;
    const originalNodeAttrs = originalNodeAttrsRef.current;

    themes.forEach((theme) => {
      const count = docs.filter((d) =>
        d.themes.some((t) => t.toLowerCase() === theme.label.toLowerCase()),
      ).length;
      const size = docCountToSize(count);

      // Update the live graph node
      if (graph.hasNode(theme.id)) {
        graph.setNodeAttribute(theme.id, "size", size);
      }
      // Keep originalNodeAttrs in sync so focus/fade logic uses the right base size
      if (originalNodeAttrs[theme.id]) {
        originalNodeAttrs[theme.id].size = size;
      }
    });
  }, [docs, loading]);

  // Build the Sigma graph
  useEffect(() => {
    if (!containerRef.current) return;
    let renderer;

    const run = async () => {
      const {default: Graph} = await import(GRAPH_CDN_URL);
      const {default: Sigma} = await import(SIGMA_CDN_URL);

      const graph = new Graph();
      graphRef.current = graph;

      themes.forEach((theme) => {
        graph.addNode(theme.id, {
          label: theme.label,
          size: 20, // placeholder — updated after docs load
          color: themeColors[theme.id],
          x: fixedPositions[theme.id].x,
          y: fixedPositions[theme.id].y,
        });
      });

      themes.forEach((themeA, i) => {
        themes.forEach((themeB, j) => {
          if (i < j)
            graph.addEdge(themeA.id, themeB.id, {size: 1, color: "#d1d5db"});
        });
      });

      const themeState = {};

      themes.forEach((theme) => {
        const center = fixedPositions[theme.id];
        const subs = theme.subnodes;
        const subEdgeKeys = [];

        subs.forEach((sub, i) => {
          graph.addNode(sub.id, {
            label: sub.label,
            size: 8,
            color: themeColors[theme.id],
            x: center.x + Math.cos((2 * Math.PI * i) / subs.length) * 0.12,
            y: center.y + Math.sin((2 * Math.PI * i) / subs.length) * 0.12,
            hidden: true,
          });
          subEdgeKeys.push(
            graph.addEdge(theme.id, sub.id, {
              color: themeColors[theme.id],
              size: 1.5,
              hidden: true,
            }),
          );
          themes.forEach((other) => {
            if (other.id !== theme.id)
              subEdgeKeys.push(
                graph.addEdge(sub.id, other.id, {
                  color: "#d1d5db",
                  size: 1,
                  hidden: true,
                }),
              );
          });
        });

        subs.forEach((subA, i) => {
          subs.forEach((subB, j) => {
            if (i < j)
              subEdgeKeys.push(
                graph.addEdge(subA.id, subB.id, {
                  color: themeColors[theme.id],
                  size: 1,
                  hidden: true,
                }),
              );
          });
        });

        themeState[theme.id] = {
          subnodes: subs,
          subEdgeKeys,
          expanded: false,
          mainEdgeKeys: [],
        };
      });

      renderer = new Sigma(graph, containerRef.current, {
        renderEdgeLabels: false,
        labelFont: "DM Sans, sans-serif",
        labelWeight: "400",
        labelColor: {color: "#1e293b"},
        labelBackgroundColor: "rgba(255,255,255,0.85)",
        labelPadding: 4,
        labelRenderedSizeThreshold: 1,
        labelSizeRatio: 3,
        zoomToSizeRatioFunction: (x) => x,
      });

      themes.forEach((theme) => {
        const state = themeState[theme.id];
        const subIds = new Set(state.subnodes.map((s) => s.id));
        state.mainEdgeKeys = graph
          .edges(theme.id)
          .filter((key) => !subIds.has(graph.opposite(theme.id, key)));
      });

      const FADED_NODE_COLOR = "#d1d5db";
      const FADED_EDGE_COLOR = "#e5e7eb";
      const FADED_NODE_SIZE_FACTOR = 0.85;

      const originalNodeAttrs = originalNodeAttrsRef.current;
      themes.forEach((theme) => {
        originalNodeAttrs[theme.id] = {color: themeColors[theme.id], size: 20};
        theme.subnodes.forEach((sub) => {
          originalNodeAttrs[sub.id] = {color: themeColors[theme.id], size: 8};
        });
      });
      const originalEdgeAttrs = {};
      graph.edges().forEach((key) => {
        originalEdgeAttrs[key] = {
          color: graph.getEdgeAttribute(key, "color"),
          size: graph.getEdgeAttribute(key, "size"),
        };
      });

      const resetAllVisuals = () => {
        themes.forEach((theme) => {
          graph.setNodeAttribute(
            theme.id,
            "color",
            originalNodeAttrs[theme.id].color,
          );
          graph.setNodeAttribute(
            theme.id,
            "size",
            originalNodeAttrs[theme.id].size,
          );
          theme.subnodes.forEach((sub) => {
            graph.setNodeAttribute(
              sub.id,
              "color",
              originalNodeAttrs[sub.id].color,
            );
            graph.setNodeAttribute(
              sub.id,
              "size",
              originalNodeAttrs[sub.id].size,
            );
          });
        });
        graph.edges().forEach((key) => {
          graph.setEdgeAttribute(key, "color", originalEdgeAttrs[key].color);
          graph.setEdgeAttribute(key, "size", originalEdgeAttrs[key].size);
        });
      };

      const applyFocusVisuals = (focusedTheme) => {
        const focusedState = themeState[focusedTheme.id];
        const activeNodeIds = new Set(
          focusedState.expanded
            ? focusedState.subnodes.map((s) => s.id)
            : [focusedTheme.id],
        );
        const activeEdgeKeys = new Set();
        activeNodeIds.forEach((nodeId) => {
          graph.edges(nodeId).forEach((key) => {
            if (!graph.getEdgeAttribute(key, "hidden")) activeEdgeKeys.add(key);
          });
        });
        themes.forEach((theme) => {
          if (!activeNodeIds.has(theme.id)) {
            graph.setNodeAttribute(theme.id, "color", FADED_NODE_COLOR);
            graph.setNodeAttribute(
              theme.id,
              "size",
              originalNodeAttrs[theme.id].size * FADED_NODE_SIZE_FACTOR,
            );
          }
          theme.subnodes.forEach((sub) => {
            if (!activeNodeIds.has(sub.id)) {
              graph.setNodeAttribute(sub.id, "color", FADED_NODE_COLOR);
              graph.setNodeAttribute(
                sub.id,
                "size",
                originalNodeAttrs[sub.id].size * FADED_NODE_SIZE_FACTOR,
              );
            }
          });
        });
        graph.edges().forEach((key) => {
          if (graph.getEdgeAttribute(key, "hidden")) return;
          if (activeEdgeKeys.has(key)) {
            graph.setEdgeAttribute(
              key,
              "color",
              themeColors[focusedTheme.id] + "99",
            );
            graph.setEdgeAttribute(key, "size", 1.8);
          } else {
            graph.setEdgeAttribute(key, "color", FADED_EDGE_COLOR);
            graph.setEdgeAttribute(key, "size", 0.5);
          }
        });
      };

      const expandTheme = (theme) => {
        const state = themeState[theme.id];
        if (state.expanded) return;
        state.expanded = true;
        graph.setNodeAttribute(theme.id, "hidden", true);
        state.mainEdgeKeys.forEach((key) =>
          graph.setEdgeAttribute(key, "hidden", true),
        );
        state.subnodes.forEach((sub) =>
          graph.setNodeAttribute(sub.id, "hidden", false),
        );
        state.subEdgeKeys.forEach((key) =>
          graph.setEdgeAttribute(key, "hidden", false),
        );
      };

      const collapseTheme = (theme) => {
        const state = themeState[theme.id];
        if (!state.expanded) return;
        state.expanded = false;
        graph.setNodeAttribute(theme.id, "hidden", false);
        state.mainEdgeKeys.forEach((key) =>
          graph.setEdgeAttribute(key, "hidden", false),
        );
        state.subnodes.forEach((sub) =>
          graph.setNodeAttribute(sub.id, "hidden", true),
        );
        state.subEdgeKeys.forEach((key) =>
          graph.setEdgeAttribute(key, "hidden", true),
        );
      };

      const EXPAND_ZOOM_RATIO = 1 / 2.5;
      const PROXIMITY = 0.35;

      renderer.getCamera().on("updated", () => {
        const camera = renderer.getCamera();
        const {ratio} = camera.getState();
        const zoomedIn = ratio < EXPAND_ZOOM_RATIO;

        if (!zoomedIn) {
          themes.forEach((theme) => collapseTheme(theme));
          resetAllVisuals();
          return;
        }

        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        const graphCenter = renderer.viewportToGraph({
          x: containerWidth / 2,
          y: containerHeight / 2,
        });

        let closest = null;
        let closestDist = Infinity;
        themes.forEach((theme) => {
          const pos = fixedPositions[theme.id];
          const dx = pos.x - graphCenter.x;
          const dy = pos.y - graphCenter.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < closestDist) {
            closestDist = dist;
            closest = theme;
          }
        });

        if (!closest || closestDist > PROXIMITY) {
          themes.forEach((theme) => collapseTheme(theme));
          resetAllVisuals();
          return;
        }

        themes.forEach((theme) => {
          if (theme.id === closest.id) expandTheme(theme);
          else collapseTheme(theme);
        });
        resetAllVisuals();
        applyFocusVisuals(closest);
      });

      // Click a theme node → open doc panel
      renderer.on("clickNode", ({node}) => {
        const theme = themes.find((t) => t.id === node);
        if (theme) {
          setSelectedTheme((prev) => (prev?.id === theme.id ? null : theme));
        }
      });

      // Click background → close panel
      renderer.on("clickStage", () => {
        setSelectedTheme(null);
      });
    };

    void run();
    return () => {
      renderer?.kill?.();
    };
  }, []);

  return (
    <div style={{position: "relative", width: "100%", height: "100%"}}>
      {loading && <LoadingOverlay progress={loadProgress} total={loadTotal} />}

      <div
        ref={containerRef}
        style={{
          width: selectedTheme ? "calc(100% - 360px)" : "100%",
          height: "100%",
          transition: "width 0.3s ease",
        }}
        {...rest}
      />

      {selectedTheme && !loading && (
        <DocPanel
          theme={selectedTheme}
          docs={docs}
          onClose={() => setSelectedTheme(null)}
        />
      )}

      {/* Hint */}
      {!loading && !selectedTheme && (
        <div
          style={{
            position: "absolute",
            bottom: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(15,23,42,0.75)",
            color: "#fff",
            fontSize: "12px",
            padding: "6px 14px",
            borderRadius: "20px",
            pointerEvents: "none",
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "0.02em",
            whiteSpace: "nowrap",
          }}
        >
          Click a theme node to browse linked documents
        </div>
      )}
    </div>
  );
}
