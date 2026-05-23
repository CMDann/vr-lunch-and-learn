import * as THREE from 'three'

const BG_DARK  = 0x0e0c0a
const BG_LIGHT = 0xf0ede7

/**
 * AR slide — holographic objects anchored to a real-world grid.
 * Simulates AR: warm-toned background (real world) + blue wireframe overlays.
 */
export function initARScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setClearColor(BG_DARK, 1)

  const scene  = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 100)
  camera.position.set(0, 4, 8)
  camera.lookAt(0, 0, 0)

  // Real-world floor
  const floorGeo = new THREE.PlaneGeometry(20, 20)
  const floorMat = new THREE.MeshBasicMaterial({ color: 0x1a1510 })
  const floor    = new THREE.Mesh(floorGeo, floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -0.01
  scene.add(floor)

  // AR grid overlay — stored as let so theme listener can replace it
  let grid = new THREE.GridHelper(16, 20, 0x1b3d9e, 0x0d1a4a)
  scene.add(grid)

  // Holographic objects
  const holoMat = () => new THREE.MeshBasicMaterial({
    color: 0x00a8e8,
    wireframe: true,
    transparent: true,
    opacity: 0.6,
  })

  const objects = []

  const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), holoMat())
  box.position.set(-2.5, 0.5, -1)
  objects.push(box)
  scene.add(box)

  const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 8), holoMat())
  sphere.position.set(0, 0.7, 0)
  objects.push(sphere)
  scene.add(sphere)

  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.4, 8), holoMat())
  cone.position.set(2.5, 0.7, -1)
  objects.push(cone)
  scene.add(cone)

  // Scan-ring anchors under each object
  for (const obj of objects) {
    const ringGeo = new THREE.RingGeometry(0.5, 0.55, 32)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00a8e8, side: THREE.DoubleSide, transparent: true, opacity: 0.4,
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = -Math.PI / 2
    ring.position.set(obj.position.x, 0.01, obj.position.z)
    scene.add(ring)
  }

  // Scan line plane (horizontal sweep)
  const scanGeo = new THREE.PlaneGeometry(20, 0.04)
  const scanMat = new THREE.MeshBasicMaterial({
    color: 0x00a8e8, transparent: true, opacity: 0.35, side: THREE.DoubleSide,
  })
  const scanLine = new THREE.Mesh(scanGeo, scanMat)
  scanLine.rotation.x = -Math.PI / 2
  scene.add(scanLine)

  resize()

  let t = 0
  renderer.setAnimationLoop(() => {
    t += 0.006

    // Gentle camera drift
    camera.position.set(
      Math.sin(t * 0.15) * 2,
      3.5 + Math.sin(t * 0.1) * 0.5,
      8 + Math.cos(t * 0.12) * 1
    )
    camera.lookAt(0, 0, 0)

    // Objects hover
    for (const obj of objects) {
      obj.position.y = Math.abs(Math.sin(t + obj.position.x)) * 0.4 + 0.4
      obj.rotation.y += 0.008
    }

    // Scan line sweeps
    scanLine.position.z = Math.sin(t * 0.8) * 8

    renderer.render(scene, camera)
  })

  document.addEventListener('themechange', ({ detail: { light } }) => {
    renderer.setClearColor(light ? BG_LIGHT : BG_DARK, 1)
    floorMat.color.setHex(light ? 0xd0cdc7 : 0x1a1510)
    scene.remove(grid)
    grid = new THREE.GridHelper(
      16, 20,
      light ? 0x4477aa : 0x1b3d9e,
      light ? 0x8899bb : 0x0d1a4a
    )
    scene.add(grid)
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
