/**
 * The hardware that frames each era. Consecutive eras that share a kind keep
 * the same monitor on the desk; a change of kind plays a swap sequence.
 */
export type MonitorKind = 'classic' | 'crt' | 'lcd' | 'phone'

export const monitorOrder: MonitorKind[] = ['classic', 'crt', 'lcd', 'phone']

const byEra: Record<string, MonitorKind> = {
  '01': 'classic',
  '02': 'classic',
  '03': 'crt',
  '04': 'crt',
  '05': 'crt',
  '06': 'crt',
  '07': 'crt',
  '08': 'lcd',
  '09': 'lcd',
  '10': 'lcd',
  '11': 'lcd',
  '12': 'lcd',
  '13': 'lcd',
  '14': 'phone',
  '15': 'phone',
  '16': 'phone',
  '17': 'phone',
}

export function monitorFor(eraId: string): MonitorKind {
  return byEra[eraId] ?? 'crt'
}

/** Rough real-world size of each device with its stand (cm), so the swap scenes keep a believable scale. */
export const physical: Record<MonitorKind, { width: number; height: number }> = {
  classic: { width: 26, height: 33 },
  crt: { width: 40, height: 39 },
  lcd: { width: 50, height: 39 },
  phone: { width: 7.5, height: 18 },
}
