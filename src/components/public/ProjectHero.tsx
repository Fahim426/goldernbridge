"use client";

import { getImageProps } from "next/image";
import { ArrowDown, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const views = [
  { file: "arrival", label: "The elevation", alt: "Liora’s symmetrical front elevation with planted balconies, fluted columns and a gold roofline." },
  { file: "architecture", label: "The corner", alt: "A three-quarter view of the residences and their landscaped podium." },
  { file: "portico", label: "The portico", alt: "Stone columns framing the illuminated residential entrance at dusk." },
];

export default function ProjectHero() {
  const [index, setIndex] = useState(0);
  const stage = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const media = matchMedia("(pointer:fine) and (min-width:861px) and (prefers-reduced-motion:no-preference)");
    function move(event:PointerEvent) {
      if (!element || !media.matches) return;
      const bounds = element.getBoundingClientRect();
      element.style.setProperty("--camera-x", ((event.clientX-bounds.left)/bounds.width * 7 - 3.5) + "px");
      element.style.setProperty("--camera-y", ((event.clientY-bounds.top)/bounds.height * 5 - 2.5) + "px");
    }
    function reset() { element?.style.removeProperty("--camera-x"); element?.style.removeProperty("--camera-y"); }
    element.addEventListener("pointermove",move,{passive:true});
    element.addEventListener("pointerleave",reset);
    media.addEventListener("change",reset);
    return () => {
      element.removeEventListener("pointermove",move);
      element.removeEventListener("pointerleave",reset);
      media.removeEventListener("change",reset);
    };
  },[]);
  const view = views[index];
  const photo = { alt: view.alt, sizes: "100vw", width: 2400, height: 2076 };
  const desktop = getImageProps({ ...photo, src: "/images/liora-" + view.file + ".webp", loading: "eager", fetchPriority: "high" }).props;
  const mobile = getImageProps({ ...photo, src: "/images/liora-arrival-mobile.webp", width:920, height:1460 }).props;
  function step(direction: number) {
    setIndex(current => (current + direction + views.length) % views.length);
  }
  return <section className="arrival" ref={stage} aria-labelledby="arrival-title" aria-roledescription="carousel">
    <div className="arrival-scene" key={view.file}>
      <picture>{index === 0 && <>
        <source type="image/avif" media="(max-width: 650px)" srcSet="/images/liora-arrival-480.avif 480w, /images/liora-arrival-800.avif 800w" sizes="100vw"/>
        <source media="(max-width: 650px)" srcSet={mobile.srcSet} sizes="100vw"/>
      </>}
        {/* getImageProps supplies the optimized art-directed picture sources. */}
        <img {...desktop} alt={view.alt}/>
      </picture>
      <div className="arrival-atmosphere"/>
      <div className={'arrival-type ' + (index===0?'behind-roof':'')}><h1 id="arrival-title">LIORA</h1></div>
    </div>
    <div className="arrival-front">
      <div className="arrival-copy"><p className="cine-kicker">Dubai Islands · Residences by JaiedCo</p>
        <p className="arrival-line">Island living,<br/><em>in a different light.</em></p>
        <a href="#enquiry" className="cine-cta">Private enquiry <ArrowUpRight size={17}/></a>
      </div>
      <div className="arrival-controls"><span aria-live="polite">0{index+1} / 03 <i/> {view.label}</span><button type="button" onClick={()=>step(-1)} aria-label="Previous exterior view"><ChevronLeft/></button><button type="button" onClick={()=>step(1)} aria-label="Next exterior view"><ChevronRight/></button></div>
    </div>
    <a className="arrival-scroll" href="#overview"><ArrowDown size={15}/> Discover Liora</a>
  </section>
}
