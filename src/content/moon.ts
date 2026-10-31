import type { MoonPhaseKey } from '../core/astro/moon';

export interface MoonMeaning {
  title: string;
  energy: string;
  meaning: string;
  questions: string[];
  rituals: string[];
}

export const MOON_MEANINGS: Record<MoonPhaseKey, MoonMeaning> = {
  new: {
    title: 'Neumond',
    energy: 'Neubeginn · Stille · Absicht',
    meaning:
      'Der Neumond gilt als Zeit des Rückzugs und des Neuanfangs. Der Himmel ist dunkel – ein leeres Blatt für Wünsche, Vorsätze und Absichten, die im kommenden Zyklus wachsen dürfen.',
    questions: ['Was möchte ich in den nächsten vier Wochen in mein Leben einladen?', 'Wofür will ich mir mehr Raum schaffen?', 'Welche Absicht fühlt sich jetzt stimmig an?'],
    rituals: ['Schreibe drei Absichten in der Gegenwartsform auf („Ich gönne mir …“).', 'Zünde eine Kerze an und sitze fünf Minuten in Stille.', 'Räume einen kleinen Bereich auf, um symbolisch Platz zu schaffen.'],
  },
  waxing: {
    title: 'Zunehmender Mond',
    energy: 'Wachstum · Aufbau · Handeln',
    meaning:
      'Der zunehmende Mond wird mit Aufbau und Wachstum verbunden. Jetzt ist eine gute Zeit, Pläne in die Tat umzusetzen, Neues zu lernen und das zu nähren, was du am Neumond gesät hast.',
    questions: ['Welcher konkrete Schritt bringt meine Absicht voran?', 'Was oder wer unterstützt mich gerade?', 'Wo darf ich mutiger sein?'],
    rituals: ['Plane für jede Absicht einen kleinen nächsten Schritt.', 'Pflege eine Pflanze bewusst als Symbol für dein Wachstum.', 'Bewegung am Morgen: zehn Minuten Dehnen oder Spazierengehen.'],
  },
  full: {
    title: 'Vollmond',
    energy: 'Fülle · Klarheit · Dankbarkeit',
    meaning:
      'Der Vollmond bringt Licht in alles, was im Verborgenen lag. Gefühle können intensiver sein. Es ist eine Zeit der Ernte, der Dankbarkeit und der Klarheit darüber, was sich erfüllt hat – und was nicht mehr dient.',
    questions: ['Was ist in den letzten Wochen gewachsen?', 'Wofür bin ich heute dankbar?', 'Was zeigt sich mir gerade besonders deutlich?'],
    rituals: ['Schreibe eine Dankbarkeitsliste mit zehn Punkten.', 'Ein Spaziergang im Mondlicht, wenn möglich.', 'Notiere, was du loslassen möchtest – und verbrenne oder zerreiße den Zettel achtsam.'],
  },
  waning: {
    title: 'Abnehmender Mond',
    energy: 'Loslassen · Reinigen · Ruhe',
    meaning:
      'Der abnehmende Mond gilt als Zeit des Loslassens und Abschließens. Jetzt darfst du Altes beenden, ausmisten, vergeben und dich auf Ruhe und Regeneration einstimmen.',
    questions: ['Was darf ich jetzt beenden oder abschließen?', 'Welche Gewohnheit kostet mich Kraft?', 'Wem oder was möchte ich vergeben – auch mir selbst?'],
    rituals: ['Miste eine Schublade oder einen digitalen Ordner aus.', 'Ein warmes Bad mit Salz als Symbol der Reinigung.', 'Abendmeditation zum Loslassen.'],
  },
};
