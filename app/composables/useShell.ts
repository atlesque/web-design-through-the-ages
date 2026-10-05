/** Shell UI state shared by the stage (hardware buttons, keys) and the curator panel. */
export function useShell() {
  const curatorOpen = useState('curator-open', () => false)
  const readable = useState('readable', () => false)
  const helpOpen = useState('help-open', () => false)

  function setReadable(on: boolean) {
    readable.value = on
    if (import.meta.client) {
      document.documentElement.classList.toggle('readable', on)
      try {
        localStorage.setItem('wdta-readable', on ? '1' : '0')
      } catch {
        /* storage unavailable: keep in memory only */
      }
    }
  }

  function restoreReadable() {
    try {
      if (localStorage.getItem('wdta-readable') === '1') setReadable(true)
    } catch {
      /* ignore */
    }
  }

  return { curatorOpen, readable, helpOpen, setReadable, restoreReadable }
}
