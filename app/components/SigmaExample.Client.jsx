import React, {useEffect, useRef} from "react";

const GRAPH_CDN_URL = "https://esm.sh/graphology@0.25.4?bundle";
const SIGMA_CDN_URL = "https://esm.sh/sigma@3.0.0?bundle";

export default function SigmaExample({...rest}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let renderer;

    const run = async () => {
      const {default: Graph} = await import(GRAPH_CDN_URL);
      const {default: Sigma} = await import(SIGMA_CDN_URL);

      const themes = [
        {id: "theme1", label: "Water Systems", count: 100},
        {id: "theme2", label: "Wildlife and Natural Areas", count: 120},
        {id: "theme3", label: "Energy Systems", count: 130},
        {id: "theme4", label: "Transportation Infrastructure", count: 140},
        {id: "theme5", label: "Urban Development", count: 150},
        {id: "theme6", label: "Climate and Weather Modification", count: 130},
        {id: "theme7", label: "Industrial Production and Materials", count: 130},
        {id: "theme8", label: "Place Based Development Conflicts", count: 130},
        {id: "theme9", label: "Governance and Institutional Control", count: 150},
        {id: "theme10", label: "Indigenous Narratives and Sovereignty", count: 130}
      ];

      const graph = new Graph();

// define colors 
const themeColors = {
  theme1: "#0ea5e9", // water
  theme2: "#22c55e", // wildlife
  theme3: "#f97316", // energy
  theme4: "#6366f1", // transport
  theme5: "#e11d48", // urban

  theme6: "#38bdf8",  // climate & weather (sky / atmosphere)
  theme7: "#64748b",  // industrial production (steel / materials)
  theme8: "#a16207",  // place-based conflicts (land / earth)
  theme9: "#0f766e",  // governance (institutions / stability)
  theme10: "#7c3aed", // Indigenous narratives & sovereignty (heritage / power)
};

const fixedPositions = {
  theme1:  { x: -0.6, y:  0.4 },
  theme2:  { x: -0.4, y:  0.7 },
  theme6:  { x: -0.2, y:  0.4 },

  theme3:  { x:  0.0, y:  0.1 },
  theme4:  { x:  0.3, y:  0.3 },
  theme7:  { x:  0.3, y: -0.1 },

  theme5:  { x:  0.6, y:  0.2 },
  theme9:  { x:  0.6, y: -0.2 },
  theme8:  { x:  0.2, y: -0.4 },

  theme10: { x: -0.3, y: -0.5 },
};

// add nodes  

      
themes.forEach((theme) => {
  if (!graph.hasNode(theme.id)) {
    graph.addNode(theme.id, {
      label: theme.label,
      size: Math.sqrt(theme.count) * 2,
      color: themeColors[theme.id],
      x: fixedPositions[theme.id].x,
      y: fixedPositions[theme.id].y,
    });
  }
});


// add edges 
themes.forEach((themeA, i) => {
  themes.forEach((themeB, j) => {
    if (i < j) {
      graph.addEdge(themeA.id, themeB.id, {
        size: 1,
        color: "#d1d5db",
      });
    }
  });
});
      
// create render 
renderer = new Sigma(graph, containerRef.current, {
  renderEdgeLabels: false,
});
};
    void run();

    return () => {
      renderer?.kill?.();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{width: "100%", minHeight: "400px", height: "100%"}}
      {...rest}
    />
  );
}
