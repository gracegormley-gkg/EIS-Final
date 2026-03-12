import { useState, useEffect } from "react";
import "../styles/scroll-to-explore.css";

export default function ScrollExplore() {
  const [visible, setVisible] = useState(true);
 
  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY < window.innerHeight * 0.5);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
 
  return (
    <div className={`scroll-wrapper ${visible ? "visible" : "hidden"}`}>
      <div className="scroll-inner">
        <span className="scroll-label">Scroll to Explore</span>
        <div className="arrow-track">
          <div className="chevron" />
          <div className="chevron" />
          <div className="chevron" />
        </div>
      </div>
    </div>
  );
}