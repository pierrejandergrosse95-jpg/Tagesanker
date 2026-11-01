import { L } from '../i18n';
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

type MedText = Pick<Meditation, 'title' | 'subtitle' | 'steps'>;

const MEDITATIONS_EN: Record<string, MedText> = {
  morning: { title: 'Morning meditation', subtitle: 'Gently into the day', steps: ['Sit comfortably. Feel the ground beneath you.', 'Breathe in deeply three times and slowly out again.', 'Notice how your body feels this morning – without judging.', 'Ask yourself: with which attitude do I want to go through today?', 'Choose one word for your day. Breathe it in.', 'Imagine meeting a person today with this word.', 'Feel gratitude for this new day.', 'Slowly move your fingers and toes and open your eyes.'] },
  evening: { title: 'Evening meditation', subtitle: 'Laying down the day', steps: ['Make yourself comfortable and close your eyes.', 'Let the breath flow all by itself.', 'Let the day pass by like a film – without holding on.', 'What was beautiful today? Stay with this moment for a while.', 'What was difficult? Breathe into it and let it become a little lighter as you breathe out.', 'Mentally lay down the day like a coat on a hook.', 'Feel the heaviness of your body and the calm of the evening.'] },
  sleep: { title: 'Falling asleep', subtitle: 'Body scan for the night', steps: ['Lie on your back, arms loosely beside your body.', 'Feel your feet. Let them become heavy and warm.', 'Move your attention to your lower legs and knees. Let go.', 'Thighs and pelvis sink deeper into the mattress.', 'Your belly rises and falls all by itself.', 'Chest, shoulders and arms become soft.', 'Your face relaxes – forehead, eyes, jaw.', 'Now you may simply let go and drift into sleep.'] },
  stress: { title: 'Against stress', subtitle: 'Back to calm', steps: ['Pause. You may take a break now.', 'Breathe in for four seconds, hold briefly, breathe out for six seconds.', 'Silently name what is stressing you – just name it, do not solve it.', 'Place a hand on your heart. Feel the warmth.', 'Say inwardly: “This is a lot right now. And I am here.”', 'Feel your feet on the ground. You are supported.', 'What is the one next step that is enough?'] },
  selflove: { title: 'Self-love', subtitle: 'Being kind to yourself', steps: ['Sit upright and yet relaxed.', 'Place both hands on your heart.', 'Breathe warmth into your chest.', 'Say inwardly: “May I be kind to myself.”', '“May I accept myself as I am.”', '“May I give myself what I need.”', 'Think of something you appreciate about yourself. Let it sink in.', 'Thank yourself for this time.'] },
  calm: { title: 'Inner peace', subtitle: 'Arriving in the moment', steps: ['Close your eyes and arrive here.', 'Listen to the sounds around you – near and far.', 'Feel the air on your skin.', 'Direct your attention to your breath at the tip of your nose.', 'When thoughts come, let them drift past like leaves on a river.', 'Return gently to the breath again and again.', 'Rest in the stillness between two breaths.'] },
  focus: { title: 'Concentration', subtitle: 'A clear mind', steps: ['Sit upright, eyes half closed.', 'Count your breaths from one to ten.', 'If you lose count, kindly start again at one.', 'Feel how your mind becomes clearer with every breath.', 'Think of the one task that matters now.', 'Imagine completing it calmly and with focus.', 'Open your eyes and take this clarity with you.'] },
};

const BREATH_EN: Record<string, Pick<BreathPattern, 'name' | 'description'>> = {
  box: { name: 'Box breathing', description: '4 – 4 – 4 – 4 · calming and centring' },
  '478': { name: '4-7-8 breathing', description: 'For relaxing and falling asleep' },
  coherent: { name: 'Coherent breathing', description: '5.5 seconds in and out · balance' },
  calm: { name: 'Extended exhale', description: '4 in, 6 out · against stress' },
};

const PROMPTS_EN = [
  'What did me good today?', 'What would I like to let go of?', 'What am I proud of?', 'What do I really need right now?',
  'What would I like to do differently tomorrow?', 'Which moment today was special?', 'What am I grateful for today?',
  'What challenged me today – and what did I learn from it?', 'When did I feel alive today?', 'What would my future self advise me today?',
  'Which feeling was strongest today?', 'Whom would I like to thank?', 'What did I do for myself today?', 'Which boundary did I keep well today – or should I have kept?',
];

export const localMeditation = (m: Meditation): Meditation => L(m, { ...m, ...MEDITATIONS_EN[m.id] });
export const localBreath = (b: BreathPattern): BreathPattern => L(b, { ...b, ...BREATH_EN[b.id] });
/** Gespeicherte Reflexionsfragen sind deutsch – Anzeige in der aktuellen Sprache. */
export const localPrompt = (p: string): string => {
  const i = JOURNAL_PROMPTS.indexOf(p);
  return i >= 0 ? L(p, PROMPTS_EN[i]) : p;
};
