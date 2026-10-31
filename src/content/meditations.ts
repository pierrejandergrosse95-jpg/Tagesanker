export interface Meditation {
  id: string;
  title: string;
  subtitle: string;
  category: 'Tageszeit' | 'Gefühl' | 'Fokus';
  /** Anleitungsschritte – werden gleichmäßig über die gewählte Dauer verteilt angezeigt. */
  steps: string[];
}

export const MEDITATIONS: Meditation[] = [
  {
    id: 'morning', title: 'Morgenmeditation', subtitle: 'Sanft in den Tag', category: 'Tageszeit',
    steps: [
      'Setz dich bequem hin. Spüre den Boden unter dir.',
      'Atme dreimal tief ein und langsam wieder aus.',
      'Nimm wahr, wie dein Körper sich heute Morgen anfühlt – ohne zu bewerten.',
      'Frage dich: Mit welcher Haltung möchte ich heute durch den Tag gehen?',
      'Wähle ein Wort für deinen Tag. Atme es ein.',
      'Stell dir vor, wie du heute mit diesem Wort einem Menschen begegnest.',
      'Spüre Dankbarkeit für diesen neuen Tag.',
      'Bewege langsam Finger und Zehen und öffne die Augen.',
    ],
  },
  {
    id: 'evening', title: 'Abendmeditation', subtitle: 'Den Tag ablegen', category: 'Tageszeit',
    steps: [
      'Mach es dir bequem und schließe die Augen.',
      'Lass den Atem ganz von allein fließen.',
      'Lass den Tag wie einen Film an dir vorbeiziehen – ohne festzuhalten.',
      'Was war heute schön? Verweile kurz bei diesem Moment.',
      'Was war schwer? Atme hinein und lass es mit dem Ausatmen ein wenig leichter werden.',
      'Lege den Tag gedanklich ab, wie einen Mantel an der Garderobe.',
      'Spüre die Schwere deines Körpers und die Ruhe des Abends.',
    ],
  },
  {
    id: 'sleep', title: 'Einschlafen', subtitle: 'Body-Scan zur Nachtruhe', category: 'Tageszeit',
    steps: [
      'Leg dich auf den Rücken, die Arme locker neben dem Körper.',
      'Spüre deine Füße. Lass sie schwer und warm werden.',
      'Wandere mit der Aufmerksamkeit zu den Unterschenkeln und Knien. Lass los.',
      'Oberschenkel und Becken sinken tiefer in die Matratze.',
      'Dein Bauch hebt und senkt sich ganz von allein.',
      'Brust, Schultern und Arme werden weich.',
      'Dein Gesicht entspannt sich – Stirn, Augen, Kiefer.',
      'Du darfst jetzt einfach loslassen und in den Schlaf gleiten.',
    ],
  },
  {
    id: 'stress', title: 'Gegen Stress', subtitle: 'Zurück in die Ruhe', category: 'Gefühl',
    steps: [
      'Halte inne. Du darfst jetzt eine Pause machen.',
      'Atme vier Sekunden ein, halte kurz, atme sechs Sekunden aus.',
      'Benenne still, was dich gerade stresst – nur benennen, nicht lösen.',
      'Lege eine Hand auf dein Herz. Spüre die Wärme.',
      'Sag innerlich: „Das ist gerade viel. Und ich bin hier.“',
      'Spüre deine Füße am Boden. Du bist getragen.',
      'Was ist der eine nächste Schritt, der genügt?',
    ],
  },
  {
    id: 'selflove', title: 'Selbstliebe', subtitle: 'Freundlich mit dir sein', category: 'Gefühl',
    steps: [
      'Setz dich aufrecht und doch entspannt hin.',
      'Lege beide Hände auf dein Herz.',
      'Atme Wärme in deinen Brustraum.',
      'Sprich innerlich: „Möge ich freundlich mit mir sein.“',
      '„Möge ich mich so annehmen, wie ich bin.“',
      '„Möge ich mir geben, was ich brauche.“',
      'Denke an etwas, das du an dir schätzt. Lass es wirken.',
      'Bedanke dich bei dir selbst für diese Zeit.',
    ],
  },
  {
    id: 'calm', title: 'Innere Ruhe', subtitle: 'Ankommen im Moment', category: 'Gefühl',
    steps: [
      'Schließe die Augen und komme hier an.',
      'Lausche den Geräuschen um dich herum – nah und fern.',
      'Spüre die Luft an deiner Haut.',
      'Richte die Aufmerksamkeit auf deinen Atem an der Nasenspitze.',
      'Wenn Gedanken kommen, lass sie wie Blätter auf einem Fluss vorbeiziehen.',
      'Kehre immer wieder sanft zum Atem zurück.',
      'Ruhe in der Stille zwischen zwei Atemzügen.',
    ],
  },
  {
    id: 'focus', title: 'Konzentration', subtitle: 'Klarer Geist', category: 'Fokus',
    steps: [
      'Setz dich aufrecht hin, die Augen halb geschlossen.',
      'Zähle deine Atemzüge von eins bis zehn.',
      'Wenn du dich verzählst, beginne freundlich wieder bei eins.',
      'Spüre, wie dein Geist mit jedem Atemzug klarer wird.',
      'Denke an die eine Aufgabe, die jetzt wichtig ist.',
      'Stell dir vor, wie du sie ruhig und fokussiert erledigst.',
      'Öffne die Augen und nimm diese Klarheit mit.',
    ],
  },
];

export interface BreathPattern {
  id: string;
  name: string;
  description: string;
  /** Phasen in Sekunden: Einatmen, Halten, Ausatmen, Halten */
  phases: [number, number, number, number];
}

export const BREATH_PATTERNS: BreathPattern[] = [
  { id: 'box', name: 'Box-Atmung', description: '4 – 4 – 4 – 4 · beruhigt und zentriert', phases: [4, 4, 4, 4] },
  { id: '478', name: '4-7-8-Atmung', description: 'Zum Entspannen und Einschlafen', phases: [4, 7, 8, 0] },
  { id: 'coherent', name: 'Kohärente Atmung', description: '5,5 Sekunden ein und aus · Balance', phases: [5.5, 0, 5.5, 0] },
  { id: 'calm', name: 'Verlängertes Ausatmen', description: '4 ein, 6 aus · gegen Stress', phases: [4, 0, 6, 0] },
];

export const JOURNAL_PROMPTS = [
  'Was hat mir heute gutgetan?',
  'Was möchte ich loslassen?',
  'Worauf bin ich stolz?',
  'Was brauche ich gerade wirklich?',
  'Was möchte ich morgen anders machen?',
  'Welcher Moment heute war besonders?',
  'Wofür bin ich heute dankbar?',
  'Was hat mich heute herausgefordert – und was habe ich daraus gelernt?',
  'Wann habe ich mich heute lebendig gefühlt?',
  'Was würde mein zukünftiges Ich mir heute raten?',
  'Welches Gefühl war heute am stärksten?',
  'Wem möchte ich danken?',
  'Was habe ich heute für mich selbst getan?',
  'Welche Grenze habe ich heute gut gewahrt – oder hätte ich wahren sollen?',
];

export const EMOTIONS = [
  'Freude', 'Dankbarkeit', 'Ruhe', 'Zuversicht', 'Liebe', 'Stolz', 'Neugier',
  'Müdigkeit', 'Unruhe', 'Traurigkeit', 'Ärger', 'Angst', 'Überforderung', 'Einsamkeit',
];
