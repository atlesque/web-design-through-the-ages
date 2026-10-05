import { roomPath, useStageController } from '~/lib/stage'

/**
 * Era-to-era navigation stays inside the app so the monitor can persist and
 * the stage can animate between rooms. The stage decides how: a view
 * transition morph when the hardware stays, a swap scene when it changes.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()

  window.addEventListener('popstate', (e) => {
    // Safari's swipe-back already animates; don't play ours on top.
    if ((e as PopStateEvent & { hasUAVisualTransition?: boolean }).hasUAVisualTransition) useStageController()?.skip()
  })

  router.beforeResolve(async (to, from) => {
    if (to.path === from.path) return
    const a = roomPath(from.path)
    const b = roomPath(to.path)
    const stage = useStageController()
    if (!a || !b || !stage) return
    await stage.depart(a, b)
  })

  const abort = () => useStageController()?.abort()
  router.onError(abort)
  nuxtApp.hook('app:error', abort)
  nuxtApp.hook('vue:error', abort)
  nuxtApp.hook('page:finish', () => useStageController()?.arrive())
})
