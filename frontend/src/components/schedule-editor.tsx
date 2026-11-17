'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface TimeRange {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface ScheduleData {
  id: number;
  startDate: string;
  endDate: string | null;
  timezone: string;
  timeRanges: TimeRange[];
}

interface Props {
  entityType: string;
  entityId: number;
}

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const TIMEZONE = 'America/Bogota';
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

interface Row {
  startTime: string;
  endTime: string;
}

/** Filas por día (0 = Domingo … 6 = Sábado). Un día sin rangos muestra una fila vacía. */
type Rows = Record<number, Row[]>;

function emptyRows(): Rows {
  return Object.fromEntries(DAYS.map((_, d) => [d, [{ startTime: '', endTime: '' }]])) as Rows;
}

function fromRanges(ranges: TimeRange[]): Rows {
  const rows = emptyRows();
  for (const r of ranges) {
    rows[r.dayOfWeek] = [...(rows[r.dayOfWeek] ?? []).filter((x) => x.startTime || x.endTime), { startTime: r.startTime, endTime: r.endTime }];
  }
  return rows;
}

/** Filas → rangos válidos. Devuelve error si hay un rango incompleto o invertido. */
function toRanges(rows: Rows): { ranges: TimeRange[]; error: string } {
  const ranges: TimeRange[] = [];
  for (let d = 0; d < DAYS.length; d++) {
    for (const row of rows[d] ?? []) {
      if (!row.startTime && !row.endTime) continue;
      if (!TIME_RE.test(row.startTime) || !TIME_RE.test(row.endTime)) {
        return { ranges: [], error: `Completa las dos horas del día ${DAYS[d]}.` };
      }
      if (row.startTime >= row.endTime) {
        return { ranges: [], error: `En ${DAYS[d]}, la hora de inicio debe ser menor que la de fin.` };
      }
      ranges.push({ dayOfWeek: d, startTime: row.startTime, endTime: row.endTime });
    }
  }
  return { ranges, error: '' };
}

const INPUT = 'h-9 w-[110px] rounded-[8px] border border-[#E3E5DF] bg-white px-2.5 text-[13px] text-[#17201C] focus:border-[#CDD1C9] focus:outline-none';

export function ScheduleEditor({ entityType, entityId }: Props) {
  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [rows, setRows] = useState<Rows>(emptyRows);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<ScheduleData[]>(`/schedules/${entityType}/${entityId}`)
      .then((list) => {
        const first = list[0] ?? null;
        setSchedule(first);
        setRows(first ? fromRanges(first.timeRanges) : emptyRows());
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'No se pudieron cargar los horarios'))
      .finally(() => setLoading(false));
  }, [entityType, entityId]);

  function updateRow(day: number, i: number, patch: Partial<Row>) {
    setSaved(false);
    setRows((r) => ({ ...r, [day]: r[day].map((row, j) => (j === i ? { ...row, ...patch } : row)) }));
  }

  function addRow(day: number) {
    setSaved(false);
    setRows((r) => ({ ...r, [day]: [...r[day], { startTime: '', endTime: '' }] }));
  }

  function removeRow(day: number, i: number) {
    setSaved(false);
    setRows((r) => {
      const next = r[day].filter((_, j) => j !== i);
      return { ...r, [day]: next.length ? next : [{ startTime: '', endTime: '' }] };
    });
  }

  async function save() {
    const { ranges, error: validation } = toRanges(rows);
    if (validation) {
      setError(validation);
      return;
    }
    setError('');
    setSaving(true);
    setSaved(false);
    try {
      if (schedule) {
        const updated = await api.put<ScheduleData>(`/schedules/${schedule.id}`, { timeRanges: ranges });
        setSchedule(updated);
        setRows(fromRanges(updated.timeRanges));
      } else if (ranges.length > 0) {
        const created = await api.post<ScheduleData>('/schedules', {
          entityType,
          entityId,
          startDate: new Date().toISOString().split('T')[0],
          timezone: TIMEZONE,
          timeRanges: ranges,
        });
        setSchedule(created);
        setRows(fromRanges(created.timeRanges));
      }
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron guardar los horarios');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-[13px] text-[#8D9590]">Cargando horarios…</p>;

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        {DAYS.map((name, d) => (
          <div key={d} className="flex items-start gap-4">
            <span className="w-[92px] flex-shrink-0 pt-2 text-[14px] text-[#17201C]">{name}</span>
            <div className="flex-1 space-y-2">
              {rows[d].map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="time"
                    aria-label={`${name}: hora de inicio ${i + 1}`}
                    value={row.startTime}
                    onChange={(e) => updateRow(d, i, { startTime: e.target.value })}
                    className={INPUT}
                  />
                  <span className="text-[13px] text-[#8D9590]" aria-hidden="true">-</span>
                  <input
                    type="time"
                    aria-label={`${name}: hora de fin ${i + 1}`}
                    value={row.endTime}
                    onChange={(e) => updateRow(d, i, { endTime: e.target.value })}
                    className={INPUT}
                  />
                  {(rows[d].length > 1 || row.startTime || row.endTime) && (
                    <button
                      type="button"
                      onClick={() => removeRow(d, i)}
                      aria-label={`Quitar horario de ${name} ${i + 1}`}
                      className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[#8D9590] transition-colors hover:bg-[#F6F6F3] hover:text-[#B42318]"
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9.5h6.6L12 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => addRow(d)}
              aria-label={`Agregar horario a ${name}`}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[20px] leading-none text-[#17201C] transition-colors hover:bg-[#F6F6F3]"
            >
              +
            </button>
          </div>
        ))}
      </div>

      {error && (
        <p role="alert" className="rounded-[8px] border border-[#F4C7C3] bg-[#FDECEA] px-3 py-2 text-[13px] text-[#B42318]">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-[12px] text-[#2F7D5B]">Horarios guardados</span>}
        <button type="button" onClick={save} disabled={saving} className="btn btn-secondary btn-sm">
          {saving ? 'Guardando…' : 'Guardar horarios'}
        </button>
      </div>
    </div>
  );
}
