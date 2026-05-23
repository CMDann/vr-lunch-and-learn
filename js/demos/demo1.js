import * as THREE from 'three'

/**
 * Demo Stage 1 — An empty scene.
 * Grid, axes. Nothing else. The foundation.
 */
export function initDemo1(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setClearColor(0x0a0a0a, 1)

  const scene  = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200)
  camera.position.set(6, 4, 6)
  camera.lookAt(0, 0, 0)

  scene.add(new THREE.GridHelper(10, 10, 0x222222, 0x181818))
  scene.add(new THREE.AxesHelper(3))

  resize()

  let t = 0
  renderer.setAnimationLoop(() => {
    t += 0.005

    camera.position.set(
      Math.sin(t * 0.25) * 8,
      4 + Math.sin(t * 0.15) * 1,
      Math.cos(t * 0.25) * 8
    )
    camera.lookAt(0, 0, 0)

    renderer.render(scene, camera)
  })

  const ro = new ResizeObserver(resize)
  ro.observe(canvas)

  function resize() {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
}
