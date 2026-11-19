"use client";

import Image from "next/image";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const sections = [
  ["Architecture", "#overview"],
  ["Residences", "#residences"],
  ["Gallery", "#gallery"],
  ["Location", "#location"],
] as const;

export default function ProjectHeader() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const nav = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    }
    function closeOnOutside(event: PointerEvent) {
      if (event.target instanceof Node && !nav.current?.contains(event.target)) setOpen(false);
    }
    const desktop = window.matchMedia("(min-width: 861px)");
    const onResize = () => { if (desktop.matches) setOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("pointerdown", closeOnOutside);
    desktop.addEventListener("change", onResize);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("pointerdown", closeOnOutside);
      desktop.removeEventListener("change", onResize);
    };
  }, [open]);

  return (
    <header className="lp-header" ref={nav}>
      <div className="lp-shell lp-header-inner">
        <a href="#top" className="lp-brand" aria-label="Golden Bridge, back to the top" onClick={() => setOpen(false)}>
          <Image src="/brand/golden-bridge-white.webp" width={220} height={36} alt="Golden Bridge" loading="eager" fetchPriority="high" unoptimized />
        </a>
        <span className="nav-signature" aria-label="Liora">LIORA</span>
        <nav className="lp-desktop-nav" aria-label="Project navigation">
          {sections.map(([text, url]) => <a href={url} key={url}>{text}</a>)}
        </nav>
        <a href="#enquiry" className="lp-btn lp-btn-gold lp-header-cta" onClick={() => setOpen(false)}>Enquire now <ArrowUpRight size={16} /></a>
        <button type="button" className="lp-menu-toggle" ref={toggle} aria-expanded={open} aria-controls="project-menu" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {open && (
        <nav id="project-menu" aria-label="Mobile project navigation" className="lp-mobile-nav">
          {sections.map(([text, url]) => <a href={url} key={url} onClick={() => setOpen(false)}>{text}<ArrowUpRight size={17} /></a>)}
        </nav>
      )}
    </header>
  );
}
