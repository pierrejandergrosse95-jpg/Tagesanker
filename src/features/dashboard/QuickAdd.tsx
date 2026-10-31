import { Briefcase, CalendarDays, CheckSquare, Euro, Plus, StickyNote } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { today } from '../../core/dates';
import type { CalEvent, FinanceEntry, Task } from '../../core/types';
import { Sheet } from '../../ui/components';
import { blankEvent, EventEditor } from '../calendar/Calendar';
import { EntryEditor } from '../finance/Finance';
import { createNote } from '../notes/Notes';
import { ShiftDaySheet } from '../shifts/Shifts';
import { blankTask, TaskEditor } from '../tasks/Tasks';

/** „+“-Schnellerfassung für die häufigsten Einträge. */
export default function QuickAdd() {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [task, setTask] = useState<Task | null>(null);
  const [event, setEvent] = useState<CalEvent | null>(null);
  const [entry, setEntry] = useState<FinanceEntry | null>(null);
  const [shiftDay, setShiftDay] = useState<string | null>(null);

  const pick = (fn: () => void) => {
    setOpen(false);
    fn();
  };
  const options = [
    { label: 'Aufgabe', icon: CheckSquare, run: () => setTask(blankTask()) },
    { label: 'Termin', icon: CalendarDays, run: () => setEvent(blankEvent(today())) },
    { label: 'Schicht', icon: Briefcase, run: () => setShiftDay(today()) },
    { label: 'Ausgabe', icon: Euro, run: () => setEntry({ kind: 'expense', title: '', amount: 0, category: 'Lebensmittel', date: today(), monthly: 0 }) },
    { label: 'Notiz', icon: StickyNote, run: async () => nav(`/notes/${await createNote()}`) },
  ];

  return (
    <>
      <button className="fab" aria-label="Schnell hinzufügen" onClick={() => setOpen(true)}><Plus size={28} /></button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Hinzufügen">
        <div className="grid3">
          {options.map(({ label, icon: Icon, run }) => (
            <button key={label} className="card tap center" style={{ padding: '14px 6px' }} onClick={() => pick(run)}>
              <span className="tile" style={{ minHeight: 0, alignItems: 'center' }}><span className="icon-wrap"><Icon size={20} /></span></span>
              <div className="small bold" style={{ marginTop: 6 }}>{label}</div>
            </button>
          ))}
        </div>
      </Sheet>
      <TaskEditor task={task} onClose={() => setTask(null)} />
      <EventEditor event={event} onClose={() => setEvent(null)} />
      <EntryEditor entry={entry} onClose={() => setEntry(null)} />
      <ShiftDaySheet date={shiftDay} onClose={() => setShiftDay(null)} />
    </>
  );
}
