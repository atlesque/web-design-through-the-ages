import type { EraMeta } from '~/eras/types'

const modules = import.meta.glob<EraMeta>('../eras/*/meta.ts', { eager: true, import: 'default' })

/** All eras, sorted by their two-digit id. */
export const eras: EraMeta[] = Object.values(modules).sort((a, b) => a.id.localeCompare(b.id))

export function eraPath(era: Pick<EraMeta, 'slug'>) {
  return `/eras/${era.slug}/`
}

export function useEras() {
  return eras
}

export function findEra(slug: string) {
  return eras.find((e) => e.slug === slug)
}

export function neighbours(slug: string) {
  const i = eras.findIndex((e) => e.slug === slug)
  return {
    index: i,
    prev: i > 0 ? eras[i - 1] : undefined,
    next: i >= 0 && i < eras.length - 1 ? eras[i + 1] : undefined,
  }
}
