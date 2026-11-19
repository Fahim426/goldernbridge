"use client";

import Image from "next/image";
import { ArrowUpRight, ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useRef, useState } from "react";

const renders = [
  { file: "villa", name: "The double-height living room", category: "Interiors", alt: "A double-height villa living room with tall glazing, a pale sofa and a sculptural staircase." },
  { file: "lobby", name: "The arrival lobby", category: "Arrival", alt: "A reception desk with veined stone, a circular ceiling recess and slender pendant lights." },
  { file: "terrace", name: "The garden terrace", category: "Outdoor spaces", alt: "A planted outdoor dining terrace with a long stone counter and an open pergola." },
  { file: "details", name: "The façade in detail", category: "Architecture", alt: "A close-up of Liora’s fluted columns, glass balconies and planted terrace edges." },
  { file: "kitchen", name: "The open kitchen", category: "Interiors", alt: "A bright kitchen with a curved island, timber cabinetry and pale stone surfaces." },
  { file: "gym", name: "The residents’ gym", category: "Wellness", alt: "A light-filled gym with cardio equipment, a mirrored exercise wall and timber finishes." },
];

export default function ProjectGallery() {
  const dialog = useRef<HTMLDialogElement>(null);
  const swipeStart = useRef<number | null>(null);
  const [index, setIndex] = useState(0);
  const current = renders[index];
  const change = (step: number) => setIndex((position) => (position + step + renders.length) % renders.length);
  function show(start: number) {
    setIndex(start);
    dialog.current?.showModal();
  }

  return (
    <section className="lp-gallery" id="gallery" aria-labelledby="gallery-title">
      <div className="lp-shell">
        <div className="lp-section-heading">
          <div><p className="lp-eyebrow">Architectural gallery</p><h2 id="gallery-title">Inside <em>Liora.</em></h2></div>
          <button type="button" className="lp-text-link" onClick={() => show(0)}>View all {renders.length} images <ArrowUpRight size={17} /></button>
        </div>
        <div className="lp-gallery-grid">
          {renders.slice(0, 3).map((render, i) => (
            <button type="button" className="lp-gallery-tile" key={render.file} onClick={() => show(i)}>
              <Image src={`/images/liora-${render.file}.webp`} alt="" fill sizes={i === 0 ? "(max-width: 700px) 92vw, 55vw" : "(max-width: 700px) 44vw, 32vw"} />
              <span className="lp-gallery-caption"><span>{render.category}</span><strong>{render.name}</strong></span>
              <Expand size={17} className="lp-gallery-expand" aria-hidden="true" />
              <span className="sr-only">Enlarge image</span>
            </button>
          ))}
        </div>
      </div>
      <dialog ref={dialog} aria-labelledby="gallery-dialog-title" className="lp-lightbox"
        onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") { event.preventDefault(); change(1); }
          if (event.key === "ArrowLeft") { event.preventDefault(); change(-1); }
        }}>
        <div className="lp-lightbox-inner">
          <header><span>Architectural gallery</span><button type="button" aria-label="Close gallery" onClick={() => dialog.current?.close()}><X size={22} /></button></header>
          <div className="lp-lightbox-image"
            onTouchStart={(event) => { swipeStart.current = event.touches[0].clientX; }}
            onTouchEnd={(event) => {
              const start = swipeStart.current;
              swipeStart.current = null;
              if (start === null) return;
              const distance = event.changedTouches[0].clientX - start;
              if (Math.abs(distance) > 60) change(distance > 0 ? -1 : 1);
            }}>
            <Image src={`/images/liora-${current.file}.webp`} alt={current.alt} fill sizes="(max-width: 1100px) 95vw, 1060px" />
          </div>
          <footer>
            <span aria-live="polite" aria-atomic="true"><small>{index + 1} / {renders.length}</small><strong id="gallery-dialog-title">{current.name}</strong></span>
            <div><button aria-label="Previous gallery image" type="button" onClick={() => change(-1)}><ChevronLeft size={20} /></button><button aria-label="Next gallery image" type="button" onClick={() => change(1)}><ChevronRight size={20} /></button></div>
          </footer>
        </div>
      </dialog>
    </section>
  );
}
