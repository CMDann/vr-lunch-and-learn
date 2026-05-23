import { loadEnv }        from './env.js'
import { initAIDemo }     from './ai-demo.js'
import { initHeroScene }  from './demos/hero.js'
import { initAssetsScene } from './demos/assets.js'
import { initVRScene }   from './demos/vr.js'
import { initARScene }   from './demos/ar.js'
import { initDemo1 }     from './demos/demo1.js'
import { initDemo2 }     from './demos/demo2.js'
import { initDemo3 }     from './demos/demo3.js'
import { initDemo4 }     from './demos/demo4.js'
import { initDemo5 }     from './demos/demo5.js'
import { initAIScene }   from './demos/ai-scene.js'
import { initEndScene }  from './demos/end.js'
import { initAndyScene } from './demos/andy.js'

const TOTAL = 36

/** Map slide index → { canvasId, init function } */
const DEMOS = {
  0:  { id: 'canvas-hero',   init: initHeroScene },
  4:  { id: 'canvas-vr',    init: initVRScene },
  5:  { id: 'canvas-ar',    init: initARScene },
  10: { id: 'canvas-demo1',  init: initDemo1 },
  11: { id: 'canvas-demo2',  init: initDemo2 },
  12: { id: 'canvas-demo3',  init: initDemo3 },
  13: { id: 'canvas-assets', init: initAssetsScene },
  14: { id: 'canvas-demo4',  init: initDemo4 },
  15: { id: 'canvas-demo5',  init: initDemo5 },
  19: { id: 'canvas-ai',    init: initAIScene },
  23: { id: 'canvas-end',   init: initEndScene },
  34: { id: 'canvas-andy',  init: initAndyScene },
}

let current = 0
const initialized = new Set()

/**
 * Transition to a slide by index.
 */
function goTo(index) {
  if (index < 0 || index >= TOTAL) return

  const prev = document.querySelector('.slide.active')
  if (prev) prev.classList.remove('active')

  current = index
  const next = document.querySelector(`[data-slide="${index}"]`)
  if (next) next.classList.add('active')

  updateChrome()
  maybeInitDemo(index)
}

/**
 * Initialize a Three.js demo for a slide — once only.
 */
function maybeInitDemo(index) {
  const entry = DEMOS[index]
  if (!entry || initialized.has(index)) return
  const canvas = document.getElementById(entry.id)
  if (!canvas) return
  try {
    entry.init(canvas)
    initialized.add(index)
  } catch (err) {
    console.error(`Demo init failed for slide ${index}:`, err)
  }
}

/**
 * Update progress bar, counter, and section dots.
 */
function updateChrome() {
  document.getElementById('progress-fill').style.width =
    `${((current + 1) / TOTAL) * 100}%`

  document.getElementById('slide-counter').textContent =
    `${String(current + 1).padStart(2, '0')} / ${String(TOTAL).padStart(2, '0')}`

  const activeSection = document
    .querySelector(`[data-slide="${current}"]`)
    ?.dataset.section

  document.querySelectorAll('.section-dot').forEach(dot => {
    dot.classList.toggle('active', dot.dataset.section === activeSection)
  })
}

// ── Keyboard navigation ─────────────────────────────────────────────────────

document.addEventListener('keydown', e => {
  const tag = document.activeElement?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return

  if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'ArrowDown') {
    e.preventDefault()
    goTo(current + 1)
  }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault()
    goTo(current - 1)
  }
  if (e.key === 'Home') goTo(0)
  if (e.key === 'End')  goTo(TOTAL - 1)
})

// ── Button navigation ────────────────────────────────────────────────────────

document.getElementById('btn-next').addEventListener('click', () => goTo(current + 1))
document.getElementById('btn-prev').addEventListener('click', () => goTo(current - 1))

// ── Section dot navigation ───────────────────────────────────────────────────

document.querySelectorAll('.section-dot').forEach(dot => {
  dot.addEventListener('click', () => {
    const section = dot.dataset.section
    const first = document.querySelector(
      `#slides-container [data-section="${section}"]`
    )
    if (first) goTo(parseInt(first.dataset.slide, 10))
  })
})

// ── Touch / swipe ────────────────────────────────────────────────────────────

let touchStartX = 0

document.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].clientX
}, { passive: true })

document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX
  if (Math.abs(dx) < 50) return
  goTo(dx < 0 ? current + 1 : current - 1)
}, { passive: true })

// ── Theme toggle ─────────────────────────────────────────────────────────────

document.getElementById('btn-theme').addEventListener('click', () => {
  const html    = document.documentElement
  const logo    = document.getElementById('logo')
  const goLight = html.dataset.theme !== 'light'

  if (goLight) {
    html.dataset.theme = 'light'
    logo.src = 'bsd-branding-repo/logos/logo-light.png'
  } else {
    delete html.dataset.theme
    logo.src = 'bsd-branding-repo/logos/logo-dark.png'
  }

  document.dispatchEvent(
    new CustomEvent('themechange', { detail: { light: goLight } })
  )
})

// ── Boot ─────────────────────────────────────────────────────────────────────

loadEnv().then(() => {
  initAIDemo()
})

goTo(0)
