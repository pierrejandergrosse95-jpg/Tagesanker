import type { Element } from '../core/astro/zodiac';
import type { MoonPhaseKey } from '../core/astro/moon';
import { lang } from '../i18n';

export type ImpulseTopic =
  | 'Weisheit des Tages' | 'Loslassen' | 'Selbstliebe' | 'Innere Stärke' | 'Wachstum'
  | 'Achtsamkeit' | 'Vertrauen' | 'Veränderung' | 'Inneres Kind' | 'Glaubenssätze';

export interface Impulse {
  id: string;
  topic: ImpulseTopic;
  text: string;
  question: string;
  elements?: Element[];
  moon?: MoonPhaseKey[];
}

export const IMPULSES: Impulse[] = [
  { id: 'w1', topic: 'Weisheit des Tages', text: 'Alles, was heute geschieht, führt dich ein Stück näher zu dem, was du wirklich brauchst.', question: 'Was hat dich heute überrascht?' },
  { id: 'w2', topic: 'Weisheit des Tages', text: 'Der Fluss erreicht das Meer, weil er nicht aufhört zu fließen – nicht, weil er schnell ist.', question: 'Wo darfst du heute langsamer sein?', elements: ['Feuer', 'Luft'] },
  { id: 'w3', topic: 'Weisheit des Tages', text: 'Was du heute säst, musst du nicht morgen ernten. Manches braucht einen ganzen Mondzyklus.', question: 'Welche Saat hast du in letzter Zeit gelegt?', moon: ['new', 'waxing'] },
  { id: 'w4', topic: 'Weisheit des Tages', text: 'Stille ist keine Leere. Sie ist der Raum, in dem Antworten auftauchen.', question: 'Wann warst du heute wirklich still?', elements: ['Wasser', 'Erde'] },
  { id: 'w5', topic: 'Weisheit des Tages', text: 'Du musst nicht den ganzen Weg sehen. Der nächste Schritt genügt.', question: 'Was ist dein nächster kleiner Schritt?' },
  { id: 'w6', topic: 'Weisheit des Tages', text: 'Ein Baum wächst auch im Winter – nur unter der Erde.', question: 'Was wächst gerade unsichtbar in dir?', elements: ['Erde'] },
  { id: 'l1', topic: 'Loslassen', text: 'Loslassen heißt nicht aufgeben. Es heißt, die Hände frei zu machen für das, was kommen will.', question: 'Was hältst du fest, obwohl es dir nicht mehr dient?', moon: ['waning', 'full'] },
  { id: 'l2', topic: 'Loslassen', text: 'Nicht jeder Gedanke verdient, dass du ihm folgst. Du darfst ihn vorbeiziehen lassen wie eine Wolke.', question: 'Welcher Gedanke darf heute weiterziehen?', moon: ['waning'] },
  { id: 'l3', topic: 'Loslassen', text: 'Der Vollmond zeigt, was fertig ist. Dankbarkeit macht das Abschiednehmen leichter.', question: 'Wofür bist du dankbar, auch wenn es endet?', moon: ['full'] },
  { id: 'l4', topic: 'Loslassen', text: 'Du kannst das Gestern nicht ändern – aber du kannst aufhören, es heute weiter zu tragen.', question: 'Was möchtest du heute ablegen?', elements: ['Erde', 'Wasser'], moon: ['waning'] },
  { id: 'l5', topic: 'Loslassen', text: 'Perfektion ist ein Gepäckstück, das du jederzeit abstellen darfst.', question: 'Wo genügt heute „gut genug“?', elements: ['Erde'] },
  { id: 'l6', topic: 'Loslassen', text: 'Kontrolle gibt Sicherheit – Vertrauen gibt Freiheit.', question: 'Was darfst du heute dem Leben überlassen?', elements: ['Wasser'] },
  { id: 's1', topic: 'Selbstliebe', text: 'Sprich heute mit dir wie mit einem Menschen, den du von Herzen liebst.', question: 'Was würdest du einer guten Freundin in deiner Lage sagen?' },
  { id: 's2', topic: 'Selbstliebe', text: 'Dein Wert hängt nicht an deiner Leistung. Du bist wertvoll, auch an Tagen, an denen wenig gelingt.', question: 'Was magst du an dir, ganz unabhängig von Leistung?', elements: ['Erde', 'Feuer'] },
  { id: 's3', topic: 'Selbstliebe', text: 'Pausen sind kein Luxus. Sie sind die Art, wie du dich selbst ernst nimmst.', question: 'Welche Pause schenkst du dir heute?' },
  { id: 's4', topic: 'Selbstliebe', text: 'Grenzen zu setzen ist ein Akt der Liebe – für dich und für die anderen.', question: 'Wo möchtest du klarer „Nein“ sagen?', elements: ['Wasser', 'Luft'] },
  { id: 's5', topic: 'Selbstliebe', text: 'Dein Körper trägt dich jeden Tag. Danke ihm heute bewusst dafür.', question: 'Was braucht dein Körper gerade?' },
  { id: 's6', topic: 'Selbstliebe', text: 'Du darfst dir selbst die Zuwendung geben, auf die du von anderen wartest.', question: 'Welche Geste der Fürsorge schenkst du dir heute?', elements: ['Wasser'] },
  { id: 'k1', topic: 'Innere Stärke', text: 'Stärke ist nicht, nie zu fallen. Stärke ist, sanft wieder aufzustehen.', question: 'Wann bist du zuletzt wieder aufgestanden?' },
  { id: 'k2', topic: 'Innere Stärke', text: 'In dir gibt es einen ruhigen Ort, den kein Sturm erreicht. Atme dorthin.', question: 'Wie fühlt sich dein ruhiger Ort an?', elements: ['Luft', 'Wasser'] },
  { id: 'k3', topic: 'Innere Stärke', text: 'Du hast schon so viele Tage geschafft, die du dir nicht zugetraut hättest.', question: 'Auf welche Herausforderung bist du stolz?', elements: ['Feuer'] },
  { id: 'k4', topic: 'Innere Stärke', text: 'Mut ist nicht die Abwesenheit von Angst, sondern die Entscheidung, trotzdem loszugehen.', question: 'Wovor hast du Respekt – und was ist dein mutiger Schritt?', elements: ['Feuer'], moon: ['waxing'] },
  { id: 'k5', topic: 'Innere Stärke', text: 'Deine Sensibilität ist keine Schwäche. Sie ist eine feine Antenne für das Leben.', question: 'Was hat deine Sensibilität dir heute gezeigt?', elements: ['Wasser'] },
  { id: 'k6', topic: 'Innere Stärke', text: 'Beständigkeit schlägt Intensität. Kleine Schritte jeden Tag bauen Berge.', question: 'Welche kleine Gewohnheit trägt dich?', elements: ['Erde'] },
  { id: 'g1', topic: 'Wachstum', text: 'Wachstum fühlt sich oft wie Unbehagen an. Es ist das Zeichen, dass etwas Neues Raum bekommt.', question: 'Wo spürst du gerade Wachstumsschmerzen?', moon: ['waxing'] },
  { id: 'g2', topic: 'Wachstum', text: 'Der Neumond ist ein leeres Blatt. Was möchtest du in den nächsten Wochen darauf schreiben?', question: 'Welche Absicht setzt du für diesen Zyklus?', moon: ['new'] },
  { id: 'g3', topic: 'Wachstum', text: 'Vergleiche dich nur mit der Person, die du gestern warst.', question: 'Was kannst du heute besser als vor einem Jahr?' },
  { id: 'g4', topic: 'Wachstum', text: 'Fehler sind Wegweiser, keine Urteile.', question: 'Was hat dich ein Fehler zuletzt gelehrt?', elements: ['Erde', 'Luft'] },
  { id: 'g5', topic: 'Wachstum', text: 'Neugier ist der Anfang jeder Veränderung. Frag heute einmal mehr „Warum?“.', question: 'Worüber möchtest du mehr erfahren?', elements: ['Luft', 'Feuer'] },
  { id: 'g6', topic: 'Wachstum', text: 'Der zunehmende Mond schenkt Rückenwind für alles, was du aufbauen willst.', question: 'Was möchtest du jetzt nähren und stärken?', moon: ['waxing'] },
  { id: 'a1', topic: 'Achtsamkeit', text: 'Spüre fünf Atemzüge lang nur deinen Atem. Mehr ist heute nicht nötig.', question: 'Wie fühlt sich dein Atem gerade an?' },
  { id: 'a2', topic: 'Achtsamkeit', text: 'Der jetzige Moment ist der einzige, in dem du wirklich leben kannst.', question: 'Was nimmst du jetzt gerade mit allen Sinnen wahr?', elements: ['Feuer', 'Luft'] },
  { id: 'a3', topic: 'Achtsamkeit', text: 'Iss heute eine Mahlzeit ganz bewusst – ohne Bildschirm, mit allen Sinnen.', question: 'Was hast du dabei geschmeckt, was dir sonst entgeht?', elements: ['Erde'] },
  { id: 'a4', topic: 'Achtsamkeit', text: 'Gefühle sind Besucher. Begrüße sie, höre ihnen zu und lass sie wieder gehen.', question: 'Welches Gefühl hat dich heute besucht?', elements: ['Wasser'] },
  { id: 'a5', topic: 'Achtsamkeit', text: 'Ein Spaziergang ohne Ziel ist ein Gespräch mit dir selbst.', question: 'Was ist dir draußen heute aufgefallen?' },
  { id: 'a6', topic: 'Achtsamkeit', text: 'Zwischen Reiz und Reaktion liegt ein Raum. In diesem Raum liegt deine Freiheit.', question: 'Wo hast du heute innegehalten, bevor du reagiert hast?', elements: ['Feuer'] },
  { id: 'v1', topic: 'Vertrauen', text: 'Vertraue dem Weg, auch wenn du ihn gerade nicht ganz siehst.', question: 'Was gibt dir gerade Halt?' },
  { id: 'v2', topic: 'Vertrauen', text: 'Was für dich bestimmt ist, wird dich finden – oft auf Umwegen.', question: 'Welcher Umweg hat sich im Nachhinein als richtig erwiesen?', elements: ['Wasser', 'Feuer'] },
  { id: 'v3', topic: 'Vertrauen', text: 'Deine Intuition spricht leise. Gib ihr heute einen Moment Gehör.', question: 'Was sagt dein Bauchgefühl zu einer offenen Frage?', elements: ['Wasser'], moon: ['new', 'full'] },
  { id: 'v4', topic: 'Vertrauen', text: 'Auch nach der dunkelsten Nacht kehrt das Licht zurück – so sicher wie der Mond wieder zunimmt.', question: 'Was hat dich in schweren Zeiten getragen?', moon: ['new', 'waning'] },
  { id: 'v5', topic: 'Vertrauen', text: 'Du bist nicht zu spät und nicht zu früh. Du bist in deinem Rhythmus.', question: 'Wo darfst du dich von fremden Zeitplänen lösen?', elements: ['Erde', 'Luft'] },
  { id: 'c1', topic: 'Veränderung', text: 'Veränderung ist die einzige Konstante. Wer mit ihr tanzt, statt gegen sie zu kämpfen, bleibt leicht.', question: 'Welche Veränderung möchtest du heute willkommen heißen?', elements: ['Luft'] },
  { id: 'c2', topic: 'Veränderung', text: 'Jedes Ende ist auch ein Anfang, der sich noch versteckt.', question: 'Welcher Anfang könnte sich hinter einem Ende verbergen?', moon: ['waning', 'new'] },
  { id: 'c3', topic: 'Veränderung', text: 'Du musst nicht alles auf einmal ändern. Eine Gewohnheit genügt.', question: 'Welche eine Sache möchtest du anders machen?', elements: ['Erde'] },
  { id: 'c4', topic: 'Veränderung', text: 'Wie der Mond darfst auch du Phasen haben. Nicht jeder Tag muss voll sein.', question: 'In welcher Phase befindest du dich gerade?' },
  { id: 'c5', topic: 'Veränderung', text: 'Die Raupe weiß nichts vom Schmetterling. Sie vertraut dem Prozess.', question: 'Welchem Prozess in deinem Leben darfst du Zeit geben?', elements: ['Wasser'] },
  { id: 'i1', topic: 'Inneres Kind', text: 'Das Kind in dir möchte gesehen werden. Was hätte es heute gern gespielt?', question: 'Was hat dir als Kind große Freude gemacht?' },
  { id: 'i2', topic: 'Inneres Kind', text: 'Sag deinem jüngeren Ich heute: „Du warst genug. Du bist genug.“', question: 'Was hättest du als Kind gebraucht zu hören?', elements: ['Wasser'] },
  { id: 'i3', topic: 'Inneres Kind', text: 'Spielerische Momente heilen. Erlaube dir heute etwas Unvernünftiges, das Freude macht.', question: 'Welche kleine Albernheit gönnst du dir?', elements: ['Feuer', 'Luft'] },
  { id: 'i4', topic: 'Inneres Kind', text: 'Wenn eine Reaktion größer ist als der Anlass, spricht oft eine alte Wunde. Begegne ihr mit Wärme.', question: 'Welche alte Erfahrung meldet sich gerade?', moon: ['full'] },
  { id: 'i5', topic: 'Inneres Kind', text: 'Staunen ist eine Fähigkeit, die nie verloren geht. Finde heute etwas, das dich staunen lässt.', question: 'Was hat dich heute zum Staunen gebracht?' },
  { id: 'b1', topic: 'Glaubenssätze', text: '„Ich muss es allein schaffen“ ist ein Glaubenssatz, kein Naturgesetz.', question: 'Wobei könntest du um Unterstützung bitten?', elements: ['Erde', 'Feuer'] },
  { id: 'b2', topic: 'Glaubenssätze', text: 'Prüfe einen Gedanken heute: Ist er wirklich wahr? Kannst du es absolut sicher wissen?', question: 'Welcher Gedanke über dich verdient eine Überprüfung?', elements: ['Luft'] },
  { id: 'b3', topic: 'Glaubenssätze', text: 'Was du über dich glaubst, formt, was du dir zutraust. Wähle heute einen freundlicheren Satz.', question: 'Welchen neuen Satz möchtest du über dich glauben?', moon: ['new', 'waxing'] },
  { id: 'b4', topic: 'Glaubenssätze', text: '„Ich darf erst ruhen, wenn alles erledigt ist“ – alles wird nie erledigt sein. Ruhe trotzdem.', question: 'Wann erlaubst du dir heute Ruhe?', elements: ['Erde'] },
  { id: 'b5', topic: 'Glaubenssätze', text: 'Die Stimme, die dich kritisiert, möchte dich schützen. Danke ihr – und entscheide trotzdem selbst.', question: 'Wovor möchte dich dein innerer Kritiker schützen?' },
  { id: 'b6', topic: 'Glaubenssätze', text: 'Du bist nicht deine Gedanken. Du bist die, die sie bemerkt.', question: 'Welcher Gedanke kehrt immer wieder?', elements: ['Wasser', 'Luft'], moon: ['waning'] },
];

/** Wochenimpulse je Element – rotieren über die Kalenderwoche. */
export const WEEKLY_IMPULSES: Record<Element, string[]> = {
  Feuer: [
    'Diese Woche lädt dich ein, deine Energie gezielt einzusetzen: Wähle ein Herzensprojekt und gib ihm deine beste Zeit.',
    'Dein inneres Feuer braucht auch Holz: Plane bewusst Momente der Erholung ein, damit die Flamme ruhig brennt.',
    'Mut zeigt sich diese Woche im Kleinen – in einem ehrlichen Gespräch oder einem ersten Schritt.',
    'Teile deine Begeisterung. Wer andere wärmt, wird selbst gewärmt.',
  ],
  Erde: [
    'Diese Woche geht es um Erdung: Ordne einen Bereich deines Lebens, der dich schon länger beschäftigt.',
    'Gönn dir Genuss ohne Rechtfertigung – gutes Essen, Natur, ein warmes Bad.',
    'Beständigkeit ist deine Superkraft. Bleib bei einer guten Gewohnheit, auch wenn niemand zusieht.',
    'Prüfe, was du trägst, das nicht deines ist. Verantwortung darf geteilt werden.',
  ],
  Luft: [
    'Diese Woche bringt Begegnungen und Gespräche. Höre genauso aufmerksam zu, wie du sprichst.',
    'Deine Gedanken fliegen schnell – halte die wichtigsten schriftlich fest, damit sie landen können.',
    'Gönn dir Phasen ohne Input: kein Handy, keine Nachrichten, nur deine eigenen Gedanken.',
    'Eine neue Idee möchte ausprobiert werden. Plane einen kleinen Test.',
  ],
  Wasser: [
    'Diese Woche lädt dich ein, deinen Gefühlen Raum zu geben. Schreibe abends drei Sätze ins Tagebuch.',
    'Achte darauf, wessen Stimmungen du übernimmst. Nicht jede Welle gehört zu deinem Meer.',
    'Kreativer Ausdruck heilt: Male, schreibe, singe – ohne Ziel.',
    'Umgib dich mit Menschen, bei denen du ganz du selbst sein darfst.',
  ],
};

/** Englische Fassung der Tagesimpulse (Schlüssel = id). */
export const IMPULSES_EN: Record<string, { text: string; question: string }> = {
  w1: { text: 'Everything that happens today brings you a little closer to what you truly need.', question: 'What surprised you today?' },
  w2: { text: 'The river reaches the sea because it never stops flowing – not because it is fast.', question: 'Where may you be slower today?' },
  w3: { text: 'What you sow today you do not have to harvest tomorrow. Some things need a whole moon cycle.', question: 'Which seed have you planted lately?' },
  w4: { text: 'Silence is not emptiness. It is the space in which answers appear.', question: 'When were you truly still today?' },
  w5: { text: 'You do not have to see the whole path. The next step is enough.', question: 'What is your next small step?' },
  w6: { text: 'A tree grows in winter too – only beneath the earth.', question: 'What is growing invisibly within you right now?' },
  l1: { text: 'Letting go does not mean giving up. It means freeing your hands for what wants to come.', question: 'What are you holding on to even though it no longer serves you?' },
  l2: { text: 'Not every thought deserves to be followed. You may let it pass by like a cloud.', question: 'Which thought may move on today?' },
  l3: { text: 'The full moon shows what is complete. Gratitude makes saying goodbye easier.', question: 'What are you grateful for, even as it ends?' },
  l4: { text: 'You cannot change yesterday – but you can stop carrying it into today.', question: 'What would you like to lay down today?' },
  l5: { text: 'Perfection is a piece of luggage you may put down at any time.', question: 'Where is “good enough” enough today?' },
  l6: { text: 'Control gives security – trust gives freedom.', question: 'What may you leave to life today?' },
  s1: { text: 'Speak to yourself today as you would to someone you love dearly.', question: 'What would you say to a good friend in your situation?' },
  s2: { text: 'Your worth does not depend on your performance. You are valuable even on days when little succeeds.', question: 'What do you like about yourself, regardless of achievement?' },
  s3: { text: 'Breaks are not a luxury. They are how you take yourself seriously.', question: 'Which break will you give yourself today?' },
  s4: { text: 'Setting boundaries is an act of love – for yourself and for others.', question: 'Where would you like to say “no” more clearly?' },
  s5: { text: 'Your body carries you every day. Thank it consciously today.', question: 'What does your body need right now?' },
  s6: { text: 'You may give yourself the attention you are waiting for from others.', question: 'Which gesture of care will you give yourself today?' },
  k1: { text: 'Strength is not never falling. Strength is getting up again gently.', question: 'When did you last get up again?' },
  k2: { text: 'Within you there is a calm place no storm can reach. Breathe into it.', question: 'How does your calm place feel?' },
  k3: { text: 'You have already managed so many days you would not have trusted yourself with.', question: 'Which challenge are you proud of?' },
  k4: { text: 'Courage is not the absence of fear but the decision to go anyway.', question: 'What do you respect – and what is your brave step?' },
  k5: { text: 'Your sensitivity is not a weakness. It is a fine antenna for life.', question: 'What did your sensitivity show you today?' },
  k6: { text: 'Consistency beats intensity. Small steps every day build mountains.', question: 'Which small habit carries you?' },
  g1: { text: 'Growth often feels like discomfort. It is the sign that something new is getting space.', question: 'Where do you feel growing pains right now?' },
  g2: { text: 'The new moon is a blank page. What would you like to write on it over the coming weeks?', question: 'Which intention do you set for this cycle?' },
  g3: { text: 'Compare yourself only with the person you were yesterday.', question: 'What can you do better today than a year ago?' },
  g4: { text: 'Mistakes are signposts, not verdicts.', question: 'What did a mistake teach you recently?' },
  g5: { text: 'Curiosity is the beginning of every change. Ask “why?” once more today.', question: 'What would you like to learn more about?' },
  g6: { text: 'The waxing moon gives tailwind to everything you want to build.', question: 'What would you like to nourish and strengthen now?' },
  a1: { text: 'Feel your breath for five breaths. Nothing more is needed today.', question: 'How does your breath feel right now?' },
  a2: { text: 'The present moment is the only one in which you can truly live.', question: 'What do you perceive right now with all your senses?' },
  a3: { text: 'Eat one meal mindfully today – without a screen, with all your senses.', question: 'What did you taste that usually escapes you?' },
  a4: { text: 'Feelings are visitors. Greet them, listen to them and let them go again.', question: 'Which feeling visited you today?' },
  a5: { text: 'A walk without a destination is a conversation with yourself.', question: 'What did you notice outside today?' },
  a6: { text: 'Between stimulus and response there is a space. In that space lies your freedom.', question: 'Where did you pause today before reacting?' },
  v1: { text: 'Trust the path, even if you cannot quite see it right now.', question: 'What gives you support right now?' },
  v2: { text: 'What is meant for you will find you – often by detours.', question: 'Which detour turned out to be right in hindsight?' },
  v3: { text: 'Your intuition speaks quietly. Give it a moment of attention today.', question: 'What does your gut feeling say about an open question?' },
  v4: { text: 'Even after the darkest night the light returns – as surely as the moon waxes again.', question: 'What carried you through difficult times?' },
  v5: { text: 'You are not too late and not too early. You are in your own rhythm.', question: 'Where may you free yourself from other people’s schedules?' },
  c1: { text: 'Change is the only constant. Whoever dances with it instead of fighting it stays light.', question: 'Which change would you like to welcome today?' },
  c2: { text: 'Every ending is also a beginning that is still hiding.', question: 'Which beginning could be hiding behind an ending?' },
  c3: { text: 'You do not have to change everything at once. One habit is enough.', question: 'Which one thing would you like to do differently?' },
  c4: { text: 'Like the moon, you may have phases too. Not every day has to be full.', question: 'Which phase are you in right now?' },
  c5: { text: 'The caterpillar knows nothing of the butterfly. It trusts the process.', question: 'Which process in your life may you give time?' },
  i1: { text: 'The child within you wants to be seen. What would it have liked to play today?', question: 'What brought you great joy as a child?' },
  i2: { text: 'Tell your younger self today: “You were enough. You are enough.”', question: 'What would you have needed to hear as a child?' },
  i3: { text: 'Playful moments heal. Allow yourself something unreasonable that brings joy today.', question: 'Which little silliness will you treat yourself to?' },
  i4: { text: 'When a reaction is bigger than its cause, an old wound is often speaking. Meet it with warmth.', question: 'Which old experience is making itself felt right now?' },
  i5: { text: 'Wonder is an ability that is never lost. Find something today that makes you marvel.', question: 'What made you marvel today?' },
  b1: { text: '“I have to manage everything alone” is a belief, not a law of nature.', question: 'Where could you ask for support?' },
  b2: { text: 'Examine a thought today: is it really true? Can you know it with absolute certainty?', question: 'Which thought about yourself deserves a review?' },
  b3: { text: 'What you believe about yourself shapes what you dare. Choose a kinder sentence today.', question: 'Which new sentence would you like to believe about yourself?' },
  b4: { text: '“I may only rest when everything is done” – everything will never be done. Rest anyway.', question: 'When will you allow yourself rest today?' },
  b5: { text: 'The voice that criticises you wants to protect you. Thank it – and decide for yourself anyway.', question: 'What does your inner critic want to protect you from?' },
  b6: { text: 'You are not your thoughts. You are the one who notices them.', question: 'Which thought keeps coming back?' },
};

const TOPICS_EN: Record<ImpulseTopic, string> = {
  'Weisheit des Tages': 'Wisdom of the day', Loslassen: 'Letting go', Selbstliebe: 'Self-love', 'Innere Stärke': 'Inner strength',
  Wachstum: 'Growth', Achtsamkeit: 'Mindfulness', Vertrauen: 'Trust', Veränderung: 'Change', 'Inneres Kind': 'Inner child', Glaubenssätze: 'Beliefs',
};

/** Impuls in der aktuellen Sprache. */
export function localImpulse(i: Impulse): Impulse {
  if (lang() !== 'en') return i;
  return { ...i, ...IMPULSES_EN[i.id] };
}
export const topicName = (t: ImpulseTopic) => (lang() === 'en' ? TOPICS_EN[t] : t);

export const WEEKLY_IMPULSES_EN: Record<Element, string[]> = {
  Feuer: [
    'This week invites you to use your energy purposefully: choose a project close to your heart and give it your best time.',
    'Your inner fire needs wood too: consciously plan moments of rest so the flame burns calmly.',
    'This week courage shows in small things – in an honest conversation or a first step.',
    'Share your enthusiasm. Whoever warms others is warmed themselves.',
  ],
  Erde: [
    'This week is about grounding: bring order to an area of your life that has been on your mind for a while.',
    'Enjoy pleasures without justification – good food, nature, a warm bath.',
    'Consistency is your superpower. Stick with a good habit, even when nobody is watching.',
    'Check what you are carrying that is not yours. Responsibility may be shared.',
  ],
  Luft: [
    'This week brings encounters and conversations. Listen as attentively as you speak.',
    'Your thoughts fly fast – write down the most important ones so they can land.',
    'Allow yourself phases without input: no phone, no news, only your own thoughts.',
    'A new idea wants to be tried out. Plan a small test.',
  ],
  Wasser: [
    'This week invites you to give your feelings space. Write three sentences in your journal each evening.',
    'Notice whose moods you take on. Not every wave belongs to your sea.',
    'Creative expression heals: paint, write, sing – without a goal.',
    'Surround yourself with people with whom you may be entirely yourself.',
  ],
};
