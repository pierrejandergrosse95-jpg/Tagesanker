import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Emblem, type EmblemName } from './emblems';
import { Scene, type SceneProps } from './scenes';

/** Kopfbild eines Bereichs: Szene + Emblem + Titel (wie in der Gestaltungsvorlage). */
/** Bereichsbild aus public/areas (aus der Bildvorlage zugeschnitten). */
export type AreaImage = 'home' | 'calendar' | 'shifts' | 'health' | 'finance' | 'tasks' | 'notes' | 'habits' | 'spirit' | 'astro' | 'moon' | 'meditation' | 'tarot' | 'journal' | 'settings';
export const areaImage = (name: AreaImage, tile = false) => `./areas/${name}${tile ? '-tile' : ''}.jpg`;

export function HubHero({ title, sub, scene, image, emblem, back = true, actions, children, compact }: {
  title: string; sub?: string; scene?: SceneProps; image?: AreaImage; emblem?: EmblemName; back?: boolean | string; actions?: ReactNode; children?: ReactNode; compact?: boolean;
}) {
  const nav = useNavigate();
  return (
    <section className={`hub-hero ${image ? 'has-image' : ''} ${compact ? 'compact' : ''}`}>
      {image ? <img className="hub-img" src={areaImage(image)} alt="" /> : <Scene castle={false} {...scene} />}
      <div className="bar">
        {back ? (
          <button className="icon-btn" aria-label="←" onClick={() => (typeof back === 'string' ? nav(back) : nav(-1))}><ChevronLeft size={26} /></button>
        ) : <span style={{ width: 40 }} />}
        <h1>{title}</h1>
        {actions ?? <span style={{ width: 40 }} />}
      </div>
      {sub && <div className="sub">{sub}</div>}
      {emblem && !image && <Emblem name={emblem} className="emblem" />}
      {children}
    </section>
  );
}

export interface MenuItem {
  key: string;
  label: string;
  icon?: ReactNode;
  badge?: ReactNode;
  to?: string;
  onClick?: () => void;
  /** Aufklappbarer Inhalt statt Navigation */
  content?: ReactNode;
}

/** Liste aus Pergament-Knöpfen; Einträge navigieren, lösen eine Aktion aus oder klappen auf. */
export function ScrollMenu({ items, initialOpen }: { items: MenuItem[]; initialOpen?: string }) {
  const nav = useNavigate();
  const [open, setOpen] = useState<string | undefined>(initialOpen);
  return (
    <div className="scroll-menu">
      {items.map((it) => {
        const expanded = open === it.key && !!it.content;
        return (
          <div key={it.key}>
            <button
              className="scroll-btn"
              aria-expanded={it.content ? expanded : undefined}
              onClick={() => (it.content ? setOpen(expanded ? undefined : it.key) : it.onClick ? it.onClick() : it.to && nav(it.to))}
            >
              {it.icon && <span className="ic">{it.icon}</span>}
              <span className="lbl">{it.label}</span>
              {it.badge != null && <span className="badge">{it.badge}</span>}
              {it.content ? <ChevronDown size={20} className="chev" style={{ transform: expanded ? 'rotate(180deg)' : undefined, transition: 'transform .2s' }} /> : <ChevronRight size={20} className="chev" />}
            </button>
            {expanded && <div className="scroll-panel">{it.content}</div>}
          </div>
        );
      })}
    </div>
  );
}

/** Pergament-Kachel mit Bereichsbild (oder Emblem). */
export function EmblemTile({ emblem, image, label, onClick }: { emblem?: EmblemName; image?: AreaImage; label: string; onClick: () => void }) {
  return (
    <button className="emblem-tile" onClick={onClick}>
      {image ? <img className="tile-img" src={areaImage(image, true)} alt="" loading="lazy" /> : emblem && <Emblem name={emblem} />}
      <span>{label}</span>
    </button>
  );
}
