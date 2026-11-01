import { fromISO } from '../dates';
import { lang } from '../../i18n';
import type { ISODate, Profile } from '../types';
import { ascendant, moonLongitude, sunLongitude, toJD } from './ephemeris';

export type Element = 'Feuer' | 'Erde' | 'Luft' | 'Wasser';

export interface SignInfo {
  index: number;
  name: string;
  symbol: string;
  element: Element;
  modality: 'Kardinal' | 'Fix' | 'Beweglich';
  ruler: string;
  range: string;
  keywords: string[];
  traits: string;
  strengths: string[];
  challenges: string[];
  growth: string[];
}

export const SIGNS: SignInfo[] = [
  {
    index: 0, name: 'Widder', symbol: '♈', element: 'Feuer', modality: 'Kardinal', ruler: 'Mars', range: '21.03. – 20.04.',
    keywords: ['Aufbruch', 'Mut', 'Tatkraft'],
    traits: 'Der Widder steht in der astrologischen Deutung für Neubeginn und Lebensfeuer. Er geht voran, wo andere noch zögern, und schöpft Kraft aus Bewegung und Herausforderung.',
    strengths: ['Mut und Entschlossenheit', 'Begeisterungsfähigkeit', 'Ehrlichkeit und Direktheit', 'Schnelle Entscheidungen'],
    challenges: ['Ungeduld', 'Impulsive Reaktionen', 'Dinge beginnen, aber nicht beenden'],
    growth: ['Geduld als Stärke entdecken', 'Innehalten, bevor du reagierst', 'Energie bewusst dosieren'],
  },
  {
    index: 1, name: 'Stier', symbol: '♉', element: 'Erde', modality: 'Fix', ruler: 'Venus', range: '21.04. – 20.05.',
    keywords: ['Beständigkeit', 'Genuss', 'Sicherheit'],
    traits: 'Der Stier gilt als Zeichen der Erdung und der Sinnlichkeit. Er baut langsam, aber dauerhaft auf und findet Ruhe in Natur, Schönheit und verlässlichen Strukturen.',
    strengths: ['Ausdauer und Verlässlichkeit', 'Sinn für Schönheit und Genuss', 'Praktisches Denken', 'Loyalität'],
    challenges: ['Festhalten am Gewohnten', 'Sturheit', 'Sorge um Sicherheit'],
    growth: ['Veränderung als Chance sehen', 'Loslassen üben', 'Selbstwert unabhängig von Besitz spüren'],
  },
  {
    index: 2, name: 'Zwillinge', symbol: '♊', element: 'Luft', modality: 'Beweglich', ruler: 'Merkur', range: '21.05. – 21.06.',
    keywords: ['Neugier', 'Austausch', 'Leichtigkeit'],
    traits: 'Die Zwillinge stehen für Kommunikation, Wissbegier und geistige Beweglichkeit. Sie verbinden Menschen und Ideen und lieben Abwechslung.',
    strengths: ['Kommunikationstalent', 'Vielseitigkeit', 'Humor', 'Schnelle Auffassungsgabe'],
    challenges: ['Unruhe und Zerstreuung', 'Oberflächlichkeit aus Zeitmangel', 'Entscheidungsschwierigkeiten'],
    growth: ['Tiefe statt Breite zulassen', 'Bei einer Sache bleiben', 'Stille als Nahrung erleben'],
  },
  {
    index: 3, name: 'Krebs', symbol: '♋', element: 'Wasser', modality: 'Kardinal', ruler: 'Mond', range: '22.06. – 22.07.',
    keywords: ['Geborgenheit', 'Gefühl', 'Fürsorge'],
    traits: 'Der Krebs wird mit Heimat, Gefühlstiefe und Fürsorge verbunden. Er spürt Stimmungen fein und schafft Räume, in denen sich andere sicher fühlen.',
    strengths: ['Empathie', 'Fürsorglichkeit', 'Intuition', 'Treue'],
    challenges: ['Empfindlichkeit', 'Rückzug bei Verletzung', 'Sich selbst vergessen'],
    growth: ['Grenzen liebevoll setzen', 'Für sich selbst sorgen wie für andere', 'Gefühle aussprechen'],
  },
  {
    index: 4, name: 'Löwe', symbol: '♌', element: 'Feuer', modality: 'Fix', ruler: 'Sonne', range: '23.07. – 23.08.',
    keywords: ['Herz', 'Ausdruck', 'Großzügigkeit'],
    traits: 'Der Löwe steht für Herzenswärme, Kreativität und Selbstausdruck. Er möchte strahlen und andere mit seiner Lebensfreude anstecken.',
    strengths: ['Großzügigkeit', 'Kreativität', 'Führungsstärke', 'Wärme und Loyalität'],
    challenges: ['Bedürfnis nach Anerkennung', 'Stolz', 'Schwierigkeit, Schwäche zu zeigen'],
    growth: ['Selbstwert von innen nähren', 'Verletzlichkeit zulassen', 'Andere strahlen lassen'],
  },
  {
    index: 5, name: 'Jungfrau', symbol: '♍', element: 'Erde', modality: 'Beweglich', ruler: 'Merkur', range: '24.08. – 23.09.',
    keywords: ['Ordnung', 'Achtsamkeit', 'Dienst'],
    traits: 'Die Jungfrau gilt als Zeichen der Sorgfalt und des Unterscheidungsvermögens. Sie bringt Ordnung ins Chaos und achtet auf Gesundheit und Details.',
    strengths: ['Genauigkeit', 'Hilfsbereitschaft', 'Analytisches Denken', 'Verantwortungsbewusstsein'],
    challenges: ['Perfektionismus', 'Selbstkritik', 'Sorgen um Kleinigkeiten'],
    growth: ['„Gut genug“ annehmen', 'Milde mit sich selbst', 'Vertrauen statt Kontrolle'],
  },
  {
    index: 6, name: 'Waage', symbol: '♎', element: 'Luft', modality: 'Kardinal', ruler: 'Venus', range: '24.09. – 23.10.',
    keywords: ['Harmonie', 'Beziehung', 'Ästhetik'],
    traits: 'Die Waage sucht Ausgleich, Fairness und Schönheit. Sie denkt in Beziehungen und hat ein feines Gespür für Balance.',
    strengths: ['Diplomatie', 'Gerechtigkeitssinn', 'Charme', 'Sinn für Ästhetik'],
    challenges: ['Unentschlossenheit', 'Konflikte meiden', 'Eigene Wünsche zurückstellen'],
    growth: ['Klar „Nein“ sagen', 'Eigene Bedürfnisse ernst nehmen', 'Konflikte als Klärung sehen'],
  },
  {
    index: 7, name: 'Skorpion', symbol: '♏', element: 'Wasser', modality: 'Fix', ruler: 'Pluto / Mars', range: '24.10. – 22.11.',
    keywords: ['Tiefe', 'Wandlung', 'Intensität'],
    traits: 'Der Skorpion steht für Tiefe, Leidenschaft und Transformation. Er schaut hinter Fassaden und kann sich immer wieder neu erfinden.',
    strengths: ['Tiefgang', 'Willenskraft', 'Loyalität', 'Intuition'],
    challenges: ['Misstrauen', 'Alles-oder-nichts-Denken', 'Schwer verzeihen'],
    growth: ['Vertrauen wagen', 'Kontrolle abgeben', 'Vergebung als Befreiung erleben'],
  },
  {
    index: 8, name: 'Schütze', symbol: '♐', element: 'Feuer', modality: 'Beweglich', ruler: 'Jupiter', range: '23.11. – 21.12.',
    keywords: ['Sinn', 'Freiheit', 'Optimismus'],
    traits: 'Der Schütze sucht Weite, Sinn und Wahrheit. Er liebt Reisen – äußere wie innere – und trägt Zuversicht in die Welt.',
    strengths: ['Optimismus', 'Offenheit', 'Humor', 'Sinnsuche'],
    challenges: ['Ungeduld mit Details', 'Übertreibung', 'Verbindlichkeit'],
    growth: ['Im Hier und Jetzt ankommen', 'Versprechen bewusst geben', 'Freiheit und Nähe verbinden'],
  },
  {
    index: 9, name: 'Steinbock', symbol: '♑', element: 'Erde', modality: 'Kardinal', ruler: 'Saturn', range: '22.12. – 20.01.',
    keywords: ['Struktur', 'Verantwortung', 'Ausdauer'],
    traits: 'Der Steinbock steht für Zielstrebigkeit, Disziplin und Verantwortung. Er erklimmt seinen Berg Schritt für Schritt.',
    strengths: ['Disziplin', 'Verlässlichkeit', 'Realismus', 'Ausdauer'],
    challenges: ['Strenge mit sich selbst', 'Arbeit vor Freude', 'Gefühle zurückhalten'],
    growth: ['Pausen als Teil des Weges', 'Leichtigkeit erlauben', 'Erfolge feiern'],
  },
  {
    index: 10, name: 'Wassermann', symbol: '♒', element: 'Luft', modality: 'Fix', ruler: 'Uranus / Saturn', range: '21.01. – 19.02.',
    keywords: ['Freiheit', 'Vision', 'Gemeinschaft'],
    traits: 'Der Wassermann denkt voraus, liebt Unabhängigkeit und Ideen, die die Welt verbessern. Er ist individuell und zugleich gemeinschaftsorientiert.',
    strengths: ['Originalität', 'Toleranz', 'Zukunftsdenken', 'Teamgeist'],
    challenges: ['Emotionale Distanz', 'Eigensinn', 'Rastlosigkeit'],
    growth: ['Gefühle zulassen', 'Nähe als Freiheit erleben', 'Geerdet bleiben'],
  },
  {
    index: 11, name: 'Fische', symbol: '♓', element: 'Wasser', modality: 'Beweglich', ruler: 'Neptun / Jupiter', range: '20.02. – 20.03.',
    keywords: ['Mitgefühl', 'Intuition', 'Hingabe'],
    traits: 'Die Fische gelten als Zeichen der Einfühlung, der Kreativität und der Spiritualität. Sie spüren das Unsichtbare und fühlen mit allem Lebendigen.',
    strengths: ['Mitgefühl', 'Fantasie und Kreativität', 'Intuition', 'Hilfsbereitschaft'],
    challenges: ['Abgrenzung', 'Flucht in Tagträume', 'Selbstaufopferung'],
    growth: ['Grenzen als Selbstschutz', 'Träume in Schritte übersetzen', 'Die eigene Stimme stärken'],
  },
];

/** Grenzen (Monat 1–12, Tag) jeweils für den ersten Tag des Zeichens (Näherung ohne Geburtszeit). */
const CUSPS: [number, number, number][] = [
  [1, 21, 10], [2, 20, 11], [3, 21, 0], [4, 21, 1], [5, 21, 2], [6, 22, 3],
  [7, 23, 4], [8, 24, 5], [9, 24, 6], [10, 24, 7], [11, 23, 8], [12, 22, 9],
];

export function signFromDate(date: ISODate): SignInfo {
  const d = fromISO(date);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  let idx = 9; // Steinbock bis 20.01.
  for (const [cm, cd, sign] of CUSPS) if (m > cm || (m === cm && day >= cd)) idx = sign;
  return SIGNS[idx];
}

export const signFromLongitude = (lon: number): SignInfo => SIGNS[Math.floor((((lon % 360) + 360) % 360) / 30)];

/** Mitteleuropäische Zeit inkl. Sommerzeit (EU-Regel seit 1996, vereinfacht auch 1980–1995). */
export function germanTzOffset(date: ISODate, time = '12:00'): number {
  const d = fromISO(date);
  const y = d.getFullYear();
  if (y < 1980) return 60;
  const lastSunday = (month: number) => {
    const last = new Date(y, month + 1, 0);
    return last.getDate() - last.getDay();
  };
  const startDay = lastSunday(2);
  const endDay = lastSunday(y < 1996 ? 8 : 9);
  const endMonth = y < 1996 ? 8 : 9;
  const m = d.getMonth();
  const day = d.getDate();
  const hour = Number(time.slice(0, 2));
  const afterStart = m > 2 || (m === 2 && (day > startDay || (day === startDay && hour >= 2)));
  const beforeEnd = m < endMonth || (m === endMonth && (day < endDay || (day === endDay && hour < 3)));
  return afterStart && beforeEnd ? 120 : 60;
}

export interface NatalChart {
  sun: SignInfo;
  sunDeg: number;
  moon: SignInfo;
  moonDeg: number;
  asc?: SignInfo;
  ascDeg?: number;
}

/** Vereinfachtes Geburtshoroskop: Sonne, Mond und (mit Ort) Aszendent. */
export function natalChart(p: Profile): NatalChart | null {
  if (!p.birthDate) return null;
  const time = p.birthTime || '12:00';
  const offset = p.tzOffsetMin ?? germanTzOffset(p.birthDate, time);
  const [y, mo, d] = p.birthDate.split('-').map(Number);
  const [h, mi] = time.split(':').map(Number);
  const utcMs = Date.UTC(y, mo - 1, d, h, mi) - offset * 60000;
  const jd = toJD(new Date(utcMs));
  const sunDeg = sunLongitude(jd);
  const moonDeg = moonLongitude(jd);
  const chart: NatalChart = { sun: localSign(signFromLongitude(sunDeg)), sunDeg, moon: localSign(signFromLongitude(moonDeg)), moonDeg };
  if (p.birthTime && p.lat != null && p.lon != null) {
    chart.ascDeg = ascendant(jd, p.lat, p.lon);
    chart.asc = localSign(signFromLongitude(chart.ascDeg));
  }
  return chart;
}

/** Zeichen des Profils – mit Geburtszeit über die exakte Sonnenlänge, sonst über das Datum. */
export function profileSign(p?: Profile | null): SignInfo | null {
  if (!p?.birthDate) return null;
  if (p.birthTime) return natalChart(p)?.sun ?? localSign(signFromDate(p.birthDate));
  return localSign(signFromDate(p.birthDate));
}

export const fmtDeg = (lon: number) => {
  const inSign = lon % 30;
  return `${Math.floor(inSign)}° ${Math.round((inSign % 1) * 60)}′`;
};

/** Offline-Städteliste für den Geburtsort (Breite, östliche Länge). */
export const CITIES: { name: string; lat: number; lon: number }[] = [
  { name: 'Berlin', lat: 52.52, lon: 13.405 }, { name: 'Hamburg', lat: 53.551, lon: 9.993 },
  { name: 'München', lat: 48.137, lon: 11.575 }, { name: 'Köln', lat: 50.938, lon: 6.96 },
  { name: 'Frankfurt am Main', lat: 50.11, lon: 8.682 }, { name: 'Stuttgart', lat: 48.776, lon: 9.183 },
  { name: 'Düsseldorf', lat: 51.227, lon: 6.774 }, { name: 'Leipzig', lat: 51.34, lon: 12.375 },
  { name: 'Dortmund', lat: 51.514, lon: 7.468 }, { name: 'Essen', lat: 51.456, lon: 7.012 },
  { name: 'Bremen', lat: 53.079, lon: 8.802 }, { name: 'Dresden', lat: 51.05, lon: 13.738 },
  { name: 'Hannover', lat: 52.375, lon: 9.732 }, { name: 'Nürnberg', lat: 49.452, lon: 11.077 },
  { name: 'Duisburg', lat: 51.435, lon: 6.762 }, { name: 'Bochum', lat: 51.482, lon: 7.216 },
  { name: 'Wuppertal', lat: 51.256, lon: 7.151 }, { name: 'Bielefeld', lat: 52.03, lon: 8.532 },
  { name: 'Bonn', lat: 50.737, lon: 7.098 }, { name: 'Münster', lat: 51.961, lon: 7.626 },
  { name: 'Karlsruhe', lat: 49.007, lon: 8.404 }, { name: 'Mannheim', lat: 49.488, lon: 8.466 },
  { name: 'Augsburg', lat: 48.371, lon: 10.898 }, { name: 'Wiesbaden', lat: 50.082, lon: 8.24 },
  { name: 'Kiel', lat: 54.323, lon: 10.123 }, { name: 'Rostock', lat: 54.092, lon: 12.099 },
  { name: 'Magdeburg', lat: 52.131, lon: 11.64 }, { name: 'Erfurt', lat: 50.978, lon: 11.029 },
  { name: 'Mainz', lat: 49.993, lon: 8.247 }, { name: 'Saarbrücken', lat: 49.234, lon: 6.997 },
  { name: 'Potsdam', lat: 52.391, lon: 13.064 }, { name: 'Schwerin', lat: 53.635, lon: 11.401 },
  { name: 'Freiburg im Breisgau', lat: 47.999, lon: 7.842 }, { name: 'Regensburg', lat: 49.013, lon: 12.102 },
  { name: 'Würzburg', lat: 49.791, lon: 9.953 }, { name: 'Kassel', lat: 51.312, lon: 9.48 },
  { name: 'Osnabrück', lat: 52.279, lon: 8.047 }, { name: 'Chemnitz', lat: 50.827, lon: 12.921 },
  { name: 'Aachen', lat: 50.776, lon: 6.084 }, { name: 'Lübeck', lat: 53.866, lon: 10.687 },
  { name: 'Wien', lat: 48.208, lon: 16.373 }, { name: 'Graz', lat: 47.071, lon: 15.439 },
  { name: 'Salzburg', lat: 47.809, lon: 13.055 }, { name: 'Innsbruck', lat: 47.269, lon: 11.404 },
  { name: 'Zürich', lat: 47.377, lon: 8.541 }, { name: 'Bern', lat: 46.948, lon: 7.447 },
  { name: 'Basel', lat: 47.559, lon: 7.588 }, { name: 'Luxemburg', lat: 49.611, lon: 6.13 },
];

type SignText = Pick<SignInfo, 'name' | 'range' | 'keywords' | 'traits' | 'strengths' | 'challenges' | 'growth' | 'ruler'>;

/** Englische Fassung der Sternzeichen-Texte. */
const SIGNS_EN: SignText[] = [
  { name: 'Aries', range: 'Mar 21 – Apr 20', ruler: 'Mars', keywords: ['New beginnings', 'Courage', 'Drive'], traits: 'In astrological interpretation, Aries stands for new beginnings and the fire of life. It leads where others still hesitate and draws strength from movement and challenge.', strengths: ['Courage and determination', 'Enthusiasm', 'Honesty and directness', 'Quick decisions'], challenges: ['Impatience', 'Impulsive reactions', 'Starting things but not finishing them'], growth: ['Discover patience as a strength', 'Pause before you react', 'Dose your energy consciously'] },
  { name: 'Taurus', range: 'Apr 21 – May 20', ruler: 'Venus', keywords: ['Stability', 'Pleasure', 'Security'], traits: 'Taurus is considered the sign of grounding and sensuality. It builds slowly but lastingly and finds peace in nature, beauty and reliable structures.', strengths: ['Endurance and reliability', 'Sense of beauty and pleasure', 'Practical thinking', 'Loyalty'], challenges: ['Clinging to the familiar', 'Stubbornness', 'Worrying about security'], growth: ['See change as an opportunity', 'Practise letting go', 'Feel self-worth independent of possessions'] },
  { name: 'Gemini', range: 'May 21 – Jun 21', ruler: 'Mercury', keywords: ['Curiosity', 'Exchange', 'Lightness'], traits: 'Gemini stands for communication, thirst for knowledge and mental agility. It connects people and ideas and loves variety.', strengths: ['Talent for communication', 'Versatility', 'Humour', 'Quick understanding'], challenges: ['Restlessness and distraction', 'Superficiality for lack of time', 'Difficulty deciding'], growth: ['Allow depth instead of breadth', 'Stay with one thing', 'Experience silence as nourishment'] },
  { name: 'Cancer', range: 'Jun 22 – Jul 22', ruler: 'Moon', keywords: ['Belonging', 'Feeling', 'Care'], traits: 'Cancer is associated with home, emotional depth and care. It senses moods finely and creates spaces where others feel safe.', strengths: ['Empathy', 'Caring nature', 'Intuition', 'Faithfulness'], challenges: ['Sensitivity', 'Withdrawal when hurt', 'Forgetting oneself'], growth: ['Set boundaries lovingly', 'Care for yourself as you care for others', 'Put feelings into words'] },
  { name: 'Leo', range: 'Jul 23 – Aug 23', ruler: 'Sun', keywords: ['Heart', 'Expression', 'Generosity'], traits: 'Leo stands for warmth of heart, creativity and self-expression. It wants to shine and inspire others with its joy of life.', strengths: ['Generosity', 'Creativity', 'Leadership', 'Warmth and loyalty'], challenges: ['Need for recognition', 'Pride', 'Difficulty showing weakness'], growth: ['Nourish self-worth from within', 'Allow vulnerability', 'Let others shine'] },
  { name: 'Virgo', range: 'Aug 24 – Sep 23', ruler: 'Mercury', keywords: ['Order', 'Mindfulness', 'Service'], traits: 'Virgo is seen as the sign of care and discernment. It brings order to chaos and pays attention to health and detail.', strengths: ['Precision', 'Helpfulness', 'Analytical thinking', 'Sense of responsibility'], challenges: ['Perfectionism', 'Self-criticism', 'Worrying about small things'], growth: ['Accept “good enough”', 'Be gentle with yourself', 'Trust instead of control'] },
  { name: 'Libra', range: 'Sep 24 – Oct 23', ruler: 'Venus', keywords: ['Harmony', 'Relationship', 'Aesthetics'], traits: 'Libra seeks balance, fairness and beauty. It thinks in relationships and has a fine sense of balance.', strengths: ['Diplomacy', 'Sense of justice', 'Charm', 'Sense of aesthetics'], challenges: ['Indecisiveness', 'Avoiding conflict', 'Putting own wishes aside'], growth: ['Say “no” clearly', 'Take your own needs seriously', 'See conflict as clarification'] },
  { name: 'Scorpio', range: 'Oct 24 – Nov 22', ruler: 'Pluto / Mars', keywords: ['Depth', 'Transformation', 'Intensity'], traits: 'Scorpio stands for depth, passion and transformation. It looks behind facades and can reinvent itself again and again.', strengths: ['Depth', 'Willpower', 'Loyalty', 'Intuition'], challenges: ['Mistrust', 'All-or-nothing thinking', 'Difficulty forgiving'], growth: ['Dare to trust', 'Let go of control', 'Experience forgiveness as liberation'] },
  { name: 'Sagittarius', range: 'Nov 23 – Dec 21', ruler: 'Jupiter', keywords: ['Meaning', 'Freedom', 'Optimism'], traits: 'Sagittarius seeks wide horizons, meaning and truth. It loves journeys – outer and inner – and carries confidence into the world.', strengths: ['Optimism', 'Openness', 'Humour', 'Search for meaning'], challenges: ['Impatience with details', 'Exaggeration', 'Commitment'], growth: ['Arrive in the here and now', 'Make promises consciously', 'Combine freedom and closeness'] },
  { name: 'Capricorn', range: 'Dec 22 – Jan 20', ruler: 'Saturn', keywords: ['Structure', 'Responsibility', 'Endurance'], traits: 'Capricorn stands for determination, discipline and responsibility. It climbs its mountain step by step.', strengths: ['Discipline', 'Reliability', 'Realism', 'Endurance'], challenges: ['Strictness with oneself', 'Work before joy', 'Holding back feelings'], growth: ['Breaks as part of the path', 'Allow lightness', 'Celebrate successes'] },
  { name: 'Aquarius', range: 'Jan 21 – Feb 19', ruler: 'Uranus / Saturn', keywords: ['Freedom', 'Vision', 'Community'], traits: 'Aquarius thinks ahead, loves independence and ideas that make the world better. It is individual and community-minded at the same time.', strengths: ['Originality', 'Tolerance', 'Future thinking', 'Team spirit'], challenges: ['Emotional distance', 'Wilfulness', 'Restlessness'], growth: ['Allow feelings', 'Experience closeness as freedom', 'Stay grounded'] },
  { name: 'Pisces', range: 'Feb 20 – Mar 20', ruler: 'Neptune / Jupiter', keywords: ['Compassion', 'Intuition', 'Devotion'], traits: 'Pisces is regarded as the sign of empathy, creativity and spirituality. It senses the invisible and feels with all living things.', strengths: ['Compassion', 'Imagination and creativity', 'Intuition', 'Helpfulness'], challenges: ['Setting boundaries', 'Escaping into daydreams', 'Self-sacrifice'], growth: ['Boundaries as self-protection', 'Turn dreams into steps', 'Strengthen your own voice'] },
];

const ELEMENTS_EN: Record<Element, string> = { Feuer: 'Fire', Erde: 'Earth', Luft: 'Air', Wasser: 'Water' };
const MODALITY_EN: Record<SignInfo['modality'], string> = { Kardinal: 'Cardinal', Fix: 'Fixed', Beweglich: 'Mutable' };

/** Sternzeichen in der aktuellen Sprache (Element bleibt als Schlüssel deutsch, Anzeige über elementName). */
export function localSign(s: SignInfo): SignInfo {
  if (lang() !== 'en') return s;
  return { ...s, ...SIGNS_EN[s.index] };
}
export const elementName = (e: Element) => (lang() === 'en' ? ELEMENTS_EN[e] : e);
export const modalityName = (m: SignInfo['modality']) => (lang() === 'en' ? MODALITY_EN[m] : m);
