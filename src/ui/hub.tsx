import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Emblem, type EmblemName } from './emblems';
import { Scene, type SceneProps } from './scenes';

/** Kopfbild eines Bereichs: Szene + Emblem + Titel (wie in der Gestaltungsvorlage). */
export function HubHero({ title, sub, scene, emblem, back = true, actions, children }: {
  title: string; sub?: string; scene: SceneProps; emblem?: EmblemName; back?: boolean | string; actions?: ReactNode; children?: ReactNode;
}) {
  const nav = useNavigate();
  return (
    <section className="hub-hero">
      <Scene castle={false} {...scene} />
      <div className="bar">
        {back ? (
          <button className="icon-btn" aria-label="←" onClick={() => (typeof back === 'string' ? nav(back) : nav(-1))}><ChevronLeft size={26} /></button>
        ) : <span style={{ width: 40 }} />}
        <h1>{title}</h1>
        {actions ?? <span style={{ width: 40 }} />}
      </div>
      {sub && <div className="sub">{sub}</div>}
      {emblem && <Emblem name={emblem} className="emblem" />}
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

/** Pergament-Kachel mit Emblem. */
export function EmblemTile({ emblem, label, onClick }: { emblem: EmblemName; label: string; onClick: () => void }) {
  return (
    <button className="emblem-tile" onClick={onClick}>
      <Emblem name={emblem} />
      <span>{label}</span>
    </button>
  );
}
