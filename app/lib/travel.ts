/**
 * Swap scenes between pieces of hardware, written with the Web Animations API.
 *
 * A scene is a Timeline that starts with the earlier era's device ("A") on the
 * desk and ends with the later one ("B"). Travelling forward plays it; going
 * back plays the very same timeline in reverse, so every scene works both ways.
 * Every clip shares one end time (delay + duration + endDelay) so a reversed
 * timeline stays in sync.
 */
import { physical, type MonitorKind } from './monitors'

export interface Clip {
  el: Element
  keyframes: Keyframe[]
  at: number
  dur: number
  easing: string
}

export class Timeline {
  clips: Clip[] = []

  add(el: Element | null | undefined, keyframes: Keyframe[], at: number, dur: number, easing = 'ease-in-out') {
    if (el) this.clips.push({ el, keyframes, at, dur, easing })
    return this
  }

  get total() {
    return this.clips.reduce((t, c) => Math.max(t, c.at + c.dur), 0)
  }

  play(reverse = false) {
    const total = this.total
    return this.clips.map((c) => {
      const a = c.el.animate(c.keyframes, {
        delay: c.at,
        duration: c.dur,
        endDelay: total - c.at - c.dur,
        easing: c.easing,
        fill: 'both',
      })
      if (reverse) a.reverse()
      return a
    })
  }
}

/** Camera: one function list everywhere so keyframes interpolate per function. */
export const cam = (x: number, y: number, rx: number, ry: number, s = 1) =>
  `translate3d(${x}px, ${y}px, 0px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(${s}, ${s}, ${s})`
export const CAM_REST = cam(0, 0, 0, 0, 1)

/** A device's pose on the desk, around its bottom centre. */
export const pose = (x: number, y: number, z: number, ry: number, k: number) =>
  `translate3d(${x}px, ${y}px, ${z}px) rotateY(${ry}deg) scale3d(${k}, ${k}, ${k})`
export const POSE_REST = pose(0, 0, 0, 0, 1)

export interface KindSize {
  /** Device width and full height (with stand) at reading size, in px. */
  W: number
  rigH: number
}

export interface Geometry {
  vw: number
  vh: number
  /** Pixels per centimetre in the pulled-back shot. */
  cm: number
  size: (kind: MonitorKind) => KindSize
  /** The desk line (bottom of the device) when `kind` is on the desk at reading size. */
  deskY: (kind: MonitorKind) => number
  /** Scale that shrinks `kind` from reading size to its real-world size on the desk. */
  k: (kind: MonitorKind) => number
}

export function makeGeometry(vw: number, vh: number, size: (kind: MonitorKind) => KindSize): Geometry {
  const cm = Math.min(vw * 0.0065, vh * 0.0078)
  return {
    vw,
    vh,
    cm,
    size,
    deskY: (kind) => vh / 2 + size(kind).rigH / 2,
    k: (kind) => (physical[kind].width * cm) / size(kind).W,
  }
}

/** The establishing shot: looking down at the desk from a little to the right. */
export function pulledCam(g: Geometry, deskKind: MonitorKind) {
  return cam(0, g.vh * 0.7 - g.deskY(deskKind), -12, -24, 1)
}

// ---------------------------------------------------------------------------
// Power

export function powerOff(rig: HTMLElement, kind: MonitorKind): Animation[] {
  const overlay = rig.querySelector('.rig__power')
  const scroll = rig.querySelector('.rig__scroll')
  const out: Animation[] = []
  if (kind === 'crt' || kind === 'classic') {
    // The picture collapses to a bright line, then a dot.
    if (scroll) {
      out.push(
        scroll.animate(
          [
            { clipPath: 'inset(0% 0% 0% 0%)', filter: 'brightness(1)' },
            { clipPath: 'inset(49.6% 0% 49.6% 0%)', filter: 'brightness(4)', offset: 0.7 },
            { clipPath: 'inset(49.8% 49.8% 49.8% 49.8%)', filter: 'brightness(6)' },
          ],
          { duration: 380, easing: 'ease-in', fill: 'forwards' },
        ),
      )
    }
    if (overlay) out.push(overlay.animate([{ opacity: 0 }, { opacity: 0, offset: 0.6 }, { opacity: 1 }], { duration: 420, fill: 'forwards' }))
  } else if (overlay) {
    out.push(overlay.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, easing: 'ease-in', fill: 'forwards' }))
  }
  return out
}

export function powerOn(rig: HTMLElement, kind: MonitorKind): Animation[] {
  const overlay = rig.querySelector('.rig__power')
  const scroll = rig.querySelector('.rig__scroll')
  const out: Animation[] = []
  if (kind === 'crt' || kind === 'classic') {
    if (scroll) {
      out.push(
        scroll.animate(
          [
            { clipPath: 'inset(49.6% 0% 49.6% 0%)', filter: 'brightness(4)' },
            { clipPath: 'inset(0% 0% 0% 0%)', filter: 'brightness(1.6)', offset: 0.55 },
            { clipPath: 'inset(0% 0% 0% 0%)', filter: 'brightness(1)' },
          ],
          { duration: 560, easing: 'ease-out' },
        ),
      )
    }
    if (overlay) out.push(overlay.animate([{ opacity: 1 }, { opacity: 0, offset: 0.15 }, { opacity: 0 }], { duration: 560, fill: 'forwards' }))
  } else if (overlay) {
    out.push(overlay.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 480, easing: 'ease-out', fill: 'forwards' }))
  }
  return out
}

// ---------------------------------------------------------------------------
// Scenes

export interface SceneParts {
  g: Geometry
  kindA: MonitorKind
  kindB: MonitorKind
  /** The stage's desk kind during the scene (the destination). */
  deskKind: MonitorKind
  A: HTMLElement
  B: HTMLElement
  camera: HTMLElement
  mover?: HTMLElement | null
  moverFront?: HTMLElement | null
  held?: HTMLElement | null
}

export interface Scene {
  /** Which ends of the scene are the pulled-back establishing shot. */
  pulledA: boolean
  pulledB: boolean
  /** Who appears in it: decides what the stage renders before building. */
  cast: 'none' | 'carry' | 'phone'
  build: (p: SceneParts) => Timeline
}

/** A walk cycle: the body dips on every step (units are the mover's SVG units). */
const bob = (steps: number) =>
  Array.from({ length: steps * 2 + 1 }, (_, i) => ({ transform: `translateY(${i % 2 ? -4.5 : 0}px)` }))

const moverAt = (x: number, cm: number) => `translate3d(${x}px, 0px, ${-3 * cm}px)`

/** Any other pair: the old device slides off, the new one slides on. */
const slide: Scene = {
  pulledA: true,
  pulledB: true,
  cast: 'none',
  build({ g, kindA, kindB, deskKind, A, B, camera }) {
    const kA = g.k(kindA)
    const kB = g.k(kindB)
    const off = g.vw * 0.75
    const lift = 12 * g.cm
    const tl = new Timeline()
    tl.add(camera, [{ transform: pulledCam(g, deskKind) }, { transform: pulledCam(g, deskKind) }], 0, 1700, 'linear')
    tl.add(
      A,
      [
        { transform: pose(0, 0, 0, 0, kA) },
        { transform: pose(-off * 0.08, -lift, 0, 4, kA), offset: 0.25 },
        { transform: pose(-off, -lift, 0, 12, kA) },
      ],
      0,
      900,
      'cubic-bezier(.5,0,.8,.4)',
    )
    tl.add(
      B,
      [
        { transform: pose(off, -lift, 0, -12, kB) },
        { transform: pose(off * 0.06, -lift, 0, -3, kB), offset: 0.8 },
        { transform: pose(0, 0, 0, 0, kB) },
      ],
      600,
      1100,
      'cubic-bezier(.2,.6,.3,1)',
    )
    return tl
  },
}

/**
 * CRT → flat screen: the CRT is unplugged and dragged away, then the mover
 * walks in carrying the flat screen, sets it down and leaves.
 */
const carry: Scene = {
  pulledA: true,
  pulledB: true,
  cast: 'carry',
  build({ g, kindA, kindB, deskKind, A, B, camera, mover, moverFront }) {
    const kA = g.k(kindA)
    const kB = g.k(kindB)
    const cm = g.cm
    const off = g.vw * 0.8
    const lift = 9 * cm
    const tl = new Timeline()
    const cable = A.querySelector('.rig__cable')
    const led = A.querySelector('.rig__led')
    const body = mover?.querySelector('.mv-bob')
    const armsCarry = mover?.querySelector('.mv-arms-carry')
    const armsDown = mover?.querySelector('.mv-arms-down')
    const hands = moverFront?.querySelector('.mv-hands-carry')

    tl.add(camera, [{ transform: pulledCam(g, deskKind) }, { transform: pulledCam(g, deskKind) }], 0, 3600, 'linear')

    // Unplug: the cable pops out of the back and flops onto the desk.
    tl.add(
      cable,
      [
        { transform: 'translateZ(calc(-0.75 * var(--D))) translate(0px, 0px) rotate(0deg)' },
        { transform: 'translateZ(calc(-0.75 * var(--D))) translate(14%, -6%) rotate(-6deg)', offset: 0.35 },
        { transform: 'translateZ(calc(-0.75 * var(--D))) translate(30%, 18%) rotate(14deg)' },
      ],
      0,
      400,
      'ease-out',
    )
    tl.add(
      led,
      [
        { background: '#48e06a', boxShadow: '0 0 6px #48e06a' },
        { background: '#3a3a33', boxShadow: '0 0 0 transparent' },
      ],
      200,
      60,
      'step-end',
    )
    // The CRT is slid off the desk to the left.
    tl.add(
      A,
      [
        { transform: pose(0, 0, 0, 0, kA) },
        { transform: pose(-off * 0.05, -2 * cm, 0, 3, kA), offset: 0.2 },
        { transform: pose(-off, -4 * cm, 0, 10, kA) },
      ],
      380,
      700,
      'cubic-bezier(.55,0,.85,.35)',
    )
    // The mover walks in with the flat screen held out in front.
    const walkIn = { at: 1100, dur: 1200 }
    const walkEase = 'cubic-bezier(.25,.6,.35,1)'
    const front = (x: number, y: number) => `translate3d(${x}px, ${y}px, ${0.5 * cm}px)`
    tl.add(mover, [{ transform: moverAt(off, cm) }, { transform: moverAt(0, cm) }], walkIn.at, walkIn.dur, walkEase)
    tl.add(moverFront, [{ transform: front(off, -lift) }, { transform: front(0, -lift) }], walkIn.at, walkIn.dur, walkEase)
    tl.add(B, [{ transform: pose(off, -lift, 0, 0, kB) }, { transform: pose(0, -lift, 0, 0, kB) }], walkIn.at, walkIn.dur, walkEase)
    tl.add(body, bob(7), walkIn.at, walkIn.dur, 'linear')
    // Set it down, let go, step out of shot.
    tl.add(B, [{ transform: pose(0, -lift, 0, 0, kB) }, { transform: pose(0, 0, 0, 0, kB) }], 2300, 300, 'ease-in-out')
    tl.add(moverFront, [{ transform: front(0, -lift) }, { transform: front(0, 0) }], 2300, 300, 'ease-in-out')
    tl.add(hands, [{ opacity: 1 }, { opacity: 0 }], 2620, 100, 'linear')
    tl.add(armsCarry, [{ opacity: 1 }, { opacity: 0 }], 2620, 100, 'linear')
    tl.add(armsDown, [{ opacity: 0 }, { opacity: 1 }], 2620, 100, 'linear')
    tl.add(mover, [{ transform: moverAt(0, cm) }, { transform: moverAt(off, cm) }], 2700, 900, 'cubic-bezier(.5,0,.75,.4)')
    tl.add(body, bob(5), 2700, 900, 'linear')
    return tl
  },
}

/** Where the mover holds the phone, in the mover's own box (px from its top left). */
export function phoneHold(cm: number) {
  return { x: 45 * cm, y: 57 * cm }
}

/**
 * Flat screen → phone: the mover steps in beside the flat screen holding a
 * phone, and the camera flies into their hand until the phone is the frame.
 */
const phone: Scene = {
  pulledA: true,
  pulledB: false,
  cast: 'phone',
  build({ g, kindA, kindB, deskKind, A, B, camera, mover, held }) {
    const kA = g.k(kindA)
    const kP = g.k('phone')
    const cm = g.cm
    const off = g.vw * 0.8
    const stand = (kA * g.size(kindA).W) / 2 + 34 * cm
    const tl = new Timeline()
    const body = mover?.querySelector('.mv-bob')
    const armsCarry = mover?.querySelector('.mv-arms-carry')
    const armsHold = mover?.querySelector('.mv-arms-hold')

    // The camera lands where the phone in the hand fills the screen exactly as
    // the real phone frame does at rest (bottom centre on the desk line).
    const deskY = g.deskY(deskKind)
    const O = { x: g.vw / 2, y: deskY }
    const hold = phoneHold(cm)
    const Q = { x: g.vw / 2 - 30 * cm + stand + hold.x, y: deskY - 75 * cm + hold.y }
    const T = { x: g.vw / 2, y: g.deskY('phone') }
    const S = 1 / kP
    const zoom = cam(T.x - O.x - S * (Q.x - O.x), T.y - O.y - S * (Q.y - O.y), 0, 0, S)
    void kindB

    tl.add(armsCarry, [{ opacity: 0 }, { opacity: 0 }], 0, 10, 'linear')
    tl.add(armsHold, [{ opacity: 1 }, { opacity: 1 }], 0, 10, 'linear')
    // The mover stands 3 cm back; the phone is held at the desk plane (z = 0)
    // so the zoom below lands on it exactly.
    const inHand = `translate3d(0px, 0px, ${3 * cm}px) scale3d(${kP}, ${kP}, ${kP})`
    tl.add(held, [{ transform: inHand }, { transform: inHand }], 0, 10, 'linear')
    tl.add(B, [{ opacity: 0 }, { opacity: 0 }], 0, 10, 'linear')
    tl.add(A, [{ transform: pose(0, 0, 0, 0, kA) }, { transform: pose(0, 0, 0, 0, kA) }], 0, 10, 'linear')
    tl.add(mover, [{ transform: moverAt(off, cm) }, { transform: moverAt(stand, cm) }], 0, 1400, 'cubic-bezier(.25,.6,.35,1)')
    tl.add(body, bob(6), 0, 1400, 'linear')
    tl.add(camera, [{ transform: pulledCam(g, deskKind) }, { transform: zoom }], 1150, 2100, 'cubic-bezier(.6,0,.25,1)')
    // Close in, only the phone and the hand holding it are left.
    tl.add(mover?.querySelector('.mover__svg'), [{ opacity: 1 }, { opacity: 0 }], 2600, 650, 'ease-in')
    tl.add(A, [{ opacity: 1 }, { opacity: 0 }], 2600, 650, 'ease-in')
    return tl
  },
}

export function pickScene(kindA: MonitorKind, kindB: MonitorKind): Scene {
  if (kindA === 'crt' && kindB === 'lcd') return carry
  if (kindA === 'lcd' && kindB === 'phone') return phone
  return slide
}

export function settle(anims: Animation[]) {
  return Promise.all(anims.map((a) => a.finished.catch(() => undefined))).then(() => undefined)
}
