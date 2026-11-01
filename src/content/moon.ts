import { L } from '../i18n';
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

const MOON_MEANINGS_EN: Record<MoonPhaseKey, MoonMeaning> = {
  new: {
    title: 'New Moon',
    energy: 'New beginnings · Stillness · Intention',
    meaning: 'The new moon is seen as a time of retreat and fresh starts. The sky is dark – a blank page for wishes, resolutions and intentions that may grow during the coming cycle.',
    questions: ['What would I like to invite into my life over the next four weeks?', 'What do I want to make more room for?', 'Which intention feels right now?'],
    rituals: ['Write down three intentions in the present tense (“I allow myself …”).', 'Light a candle and sit in silence for five minutes.', 'Tidy a small area to symbolically make space.'],
  },
  waxing: {
    title: 'Waxing Moon',
    energy: 'Growth · Building · Action',
    meaning: 'The waxing moon is associated with building and growth. Now is a good time to put plans into action, learn new things and nourish what you planted at the new moon.',
    questions: ['Which concrete step moves my intention forward?', 'What or who supports me right now?', 'Where may I be braver?'],
    rituals: ['Plan a small next step for each intention.', 'Care for a plant as a symbol of your growth.', 'Morning movement: ten minutes of stretching or walking.'],
  },
  full: {
    title: 'Full Moon',
    energy: 'Abundance · Clarity · Gratitude',
    meaning: 'The full moon brings light into everything that was hidden. Feelings can be more intense. It is a time of harvest, gratitude and clarity about what has been fulfilled – and what no longer serves.',
    questions: ['What has grown over the past weeks?', 'What am I grateful for today?', 'What is showing itself especially clearly to me right now?'],
    rituals: ['Write a gratitude list with ten points.', 'A walk in the moonlight, if possible.', 'Write down what you want to let go of – and mindfully burn or tear up the note.'],
  },
  waning: {
    title: 'Waning Moon',
    energy: 'Letting go · Cleansing · Rest',
    meaning: 'The waning moon is regarded as a time of letting go and completion. Now you may end old things, declutter, forgive and attune yourself to rest and regeneration.',
    questions: ['What may I now end or complete?', 'Which habit costs me strength?', 'Whom or what would I like to forgive – including myself?'],
    rituals: ['Declutter a drawer or a digital folder.', 'A warm bath with salt as a symbol of cleansing.', 'An evening meditation for letting go.'],
  },
};

export const moonMeaning = (k: MoonPhaseKey): MoonMeaning => L(MOON_MEANINGS[k], MOON_MEANINGS_EN[k]);
