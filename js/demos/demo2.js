import * as THREE from 'three'

/**
 * Demo Stage 2 — Add geometry.
 * Wireframe objects in world space. Same camera.
 */
export function initDemo2(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setClearColor(0x0a0a0a, 1)

  const scene  = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200)
  camera.position.set(6, 4, 6)

  scene.add(new THREE.GridHelper(10, 10, 0x222222, 0x181818))

  const wireMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })

  const box     = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), wireMat.clone())
  box.position.set(-2, 0.6, 0)

  const sphere  = new THREE.Mesh(new THREE.SphereGeometry(0.8, 12, 8), wireMat.clone())
  sphere.position.set(0, 0.8, -2)

  const torus   = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.25, 8, 20), wireMat.clone())
  torus.position.set(2, 0.7, 0)

  const cone    = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.4, 8), wireMat.clone())
  cone.position.set(0, 0.7, 2)

  const ico     = new THREE.Mesh(new THREE.IcosahedronGeometry(0.8, 0), wireMat.clone())
  ico.position.set(-1.5, 0.8, 2)

  const objects = [box, sphere, torus, cone, ico]
  objects.forEach(o => scene.add(o))

  resize()

  let t = 0
  renderer.setAnimationLoop(() => {
    t += 0.005

    objects.forEach((obj, i) => {
      obj.rotation.y += 0.008 + i * 0.002
      obj.rotation.x += 0.003
    })

    camera.position.set(
      Math.sin(t * 0.2) * 9,
      4 + Math.sin(t * 0.12) * 1,
      Math.cos(t * 0.2) * 9
    )
    camera.lookAt(0, 0.5, 0)

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
