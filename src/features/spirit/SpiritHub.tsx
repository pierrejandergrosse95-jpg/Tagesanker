import { BookHeart, Flower2, Layers, Moon, Sparkles, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToday } from '../../core/hooks';
import { t, quote } from '../../i18n';
import { MoonGlyph } from '../../ui/components';
import { HubHero, ScrollMenu } from '../../ui/hub';
import { moonName } from './moonText';
import { useDailySpirit } from './useSpirit';

export default function SpiritHub() {
  const day = useToday();
  const nav = useNavigate();
  const spirit = useDailySpirit(day);
  return (
    <div className="screen">
      <HubHero title={t('Spiritualität')} sub={t('Meine innere Reise')} back={false} scene={{ variant: 'lanterns', lanterns: 10, seed: 41 }} emblem="crystal" />
      {spirit && (
        <button className="parchment-card mb" style={{ width: '100%', textAlign: 'center' }} onClick={() => nav('/spirit/impulse')}>
          <div style={{ fontFamily: 'var(--display)', fontSize: 14, letterSpacing: '0.06em' }}>{t('Tagesimpuls')}</div>
          <p className="serif" style={{ fontSize: 18, fontStyle: 'italic', marginTop: 4 }}>{quote(spirit.impulse.text)}</p>
        </button>
      )}
      <ScrollMenu items={[
        { key: 'profile', label: t('Mein Geburtsprofil'), icon: <Star size={20} />, badge: spirit?.sign ? `${spirit.sign.symbol} ${spirit.sign.name}` : undefined, to: '/spirit/profile' },
        { key: 'meditation', label: t('Meditation & Achtsamkeit'), icon: <Flower2 size={20} />, to: '/spirit/meditation' },
        { key: 'moon', label: t('Mondkalender'), icon: spirit ? <MoonGlyph illumination={spirit.moon.illumination} waxing={spirit.moon.waxing} size={22} /> : <Moon size={20} />, badge: spirit ? moonName(spirit.moon) : undefined, to: '/spirit/moon' },
        { key: 'impulse', label: t('Tagesimpuls'), icon: <Sparkles size={20} />, to: '/spirit/impulse' },
        { key: 'tarot', label: t('Tarot & Orakelkarten'), icon: <Layers size={20} />, to: '/spirit/tarot' },
        { key: 'journal', label: t('Mein Tagebuch'), icon: <BookHeart size={20} />, to: '/spirit/journal' },
      ]} />
    </div>
  );
}
