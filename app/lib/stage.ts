/**
 * The bridge between the router (plugins/travel.client.ts) and the stage
 * layout, which owns the hardware and plays the transitions.
 */
export interface StageController {
  /** Called before the route changes; resolves when the old page may be swapped out. */
  depart(fromPath: string, toPath: string): Promise<void>
  /** Called when the new page has rendered. */
  arrive(): void
  /** Navigation failed or was cancelled. */
  abort(): void
  /** Jump to the end of whatever is playing. */
  skip(): void
  /** Switch the monitor on after the lobby's title screen has zoomed out into it. */
  boot(): Promise<void>
}

let current: StageController | null = null

export function registerStage(controller: StageController) {
  current = controller
  return () => {
    if (current === controller) current = null
  }
}

export function useStageController() {
  return current
}

/** "/eras/01-bbs/pre-web/" → "01-bbs/pre-web" */
export function roomPath(path: string) {
  const m = path.match(/^\/eras\/(.+?)\/?$/)
  return m ? m[1]! : null
}

export class Deferred<T = void> {
  promise: Promise<T>
  resolve!: (v: T) => void
  constructor() {
    this.promise = new Promise<T>((r) => (this.resolve = r))
  }
}
