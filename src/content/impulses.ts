import type { Element } from '../core/astro/zodiac';
import type { MoonPhaseKey } from '../core/astro/moon';

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
