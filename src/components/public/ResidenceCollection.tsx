"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const homes = [
  { title:"One bedroom", value:"ONE_BED", area:"839–915", photo:"bedroom-window", caption:"Typical residence · Bedroom" },
  { title:"Two bedrooms", value:"TWO_BED", area:"1,214–1,328", photo:"living", caption:"Typical residence · Living room" },
  { title:"Three bedrooms", value:"THREE_BED", area:"3,250–3,274", photo:"kitchen", caption:"Typical residence · Kitchen" },
  { title:"Four bedrooms", value:"FOUR_BED", area:"2,623–2,699", photo:"villa", caption:"Four-bedroom villa · Living room" },
];

export function ResourceLink({ resource, children }: { resource:"brochure"|"floor plan"; children:React.ReactNode }) {
  return <a className="lp-text-link" href="#enquiry" onClick={()=>window.dispatchEvent(new CustomEvent("liora:resource",{detail:resource}))}>{children}<ArrowUpRight size={16}/></a>
}

export default function ResidenceCollection() {
  const [selected,setSelected] = useState(0);
  const [visited,setVisited] = useState([0]);
  const [loaded,setLoaded] = useState<number[]>([]);
  const home = homes[selected];
  // Keep the previous print visible until the requested responsive image is ready.
  const visible = [...visited].reverse().find(index => loaded.includes(index)) ?? selected;
  function select(index:number) {
    setSelected(index);
    setVisited(order => [...order.filter(item=>item !== index),index]);
    window.dispatchEvent(new CustomEvent("liora:unit",{detail:homes[index].value}));
  }
  return <div className="res-folio lp-shell">
    <div className="folio-heading"><div><p className="cine-kicker">The residences</p><h2 id="residences-title">Rooms of <em>one’s own.</em></h2></div>
      <div className="res-selector" role="group" aria-label="Select a residence">{homes.map((item,i)=><button key={item.value} aria-label={(i+1)+' bed · '+item.title} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}<small> bed</small></button>)}</div>
    </div>
    <div className="res-stage">
      <figure>{visited.map(i=><Image key={i} src={'/images/liora-'+homes[i].photo+'.webp'} alt={i===visible ? homes[i].caption+' architectural render at Liora.' : ''}
        className={i===visible?'res-visible':'res-hidden'} fill sizes="(max-width: 760px) 100vw, 78vw"
        onLoad={()=>setLoaded(items=>items.includes(i)?items:[...items,i])}/>)}<figcaption>{homes[visible].caption}</figcaption></figure>
      <div className="res-spec"><p className="cine-kicker">Residence selection</p><h3>{home.title}</h3>
        <dl><dt>Floor area</dt><dd>{home.area} <small>sq ft</small></dd></dl>
        <a className="cine-cta" href="#enquiry" onClick={()=>select(selected)}>Enquire for details <ArrowUpRight size={16}/></a>
        <ResourceLink resource="floor plan">Request floor plans</ResourceLink>
      </div>
    </div>
  </div>
}
