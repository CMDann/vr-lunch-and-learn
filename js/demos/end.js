import * as THREE from 'three'

const BG_DARK  = 0x020408
const BG_LIGHT = 0xf0ede7

/**
 * End slide — same floating cosmos as hero,
 * but with a slow zoom-out and deeper brand-blue glow.
 */
export function initEndScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setClearColor(BG_DARK, 1)

  const scene  = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 500)
  camera.position.set(0, 0, 30)

  // Star field
  const starPos = new Float32Array(600 * 3)
  for (let i = 0; i < starPos.length; i++) starPos[i] = (Math.random() - 0.5) * 300
  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({
    color: 0x4488ff, size: 0.3, transparent: true, opacity: 0.7,
  })))

  // Floating shapes — more blue dominant
  const geoPool = [
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.OctahedronGeometry(1, 0),
    new THREE.DodecahedronGeometry(1, 0),
  ]

  const shapes = []
  for (let i = 0; i < 30; i++) {
    const geo  = geoPool[i % geoPool.length].clone()
    const cyan = Math.random() > 0.4
    const mat  = new THREE.MeshBasicMaterial({
      color:       cyan ? 0x00a8e8 : 0x1b3d9e,
      wireframe:   true,
      transparent: true,
      opacity:     0.12 + Math.random() * 0.3,
    })
    const mesh = new THREE.Mesh(geo, mat)

    const r     = 8 + Math.random() * 28
    const theta = Math.random() * Math.PI * 2
    const phi   = Math.acos(2 * Math.random() - 1)
    mesh.position.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi) - 10
    )
    mesh.scale.setScalar(0.5 + Math.random() * 2.5)

    mesh.userData = {
      rx:    (Math.random() - 0.5) * 0.007,
      ry:    (Math.random() - 0.5) * 0.01,
      ox:    mesh.position.x,
      oy:    mesh.position.y,
      phase: Math.random() * Math.PI * 2,
    }
    shapes.push(mesh)
    scene.add(mesh)
  }

  resize()

  let t = 0
  renderer.setAnimationLoop(() => {
    t += 0.003

    shapes.forEach(m => {
      m.rotation.x += m.userData.rx
      m.rotation.y += m.userData.ry
      m.position.x  = m.userData.ox + Math.sin(t + m.userData.phase) * 0.5
      m.position.y  = m.userData.oy + Math.cos(t * 0.7 + m.userData.phase) * 0.4
    })

    // Slow zoom out
    camera.position.z = 30 + t * 2

    camera.position.x = Math.sin(t * 0.06) * 3
    camera.position.y = Math.cos(t * 0.05) * 2
    camera.lookAt(0, 0, 0)

    renderer.render(scene, camera)
  })

  document.addEventListener('themechange', ({ detail: { light } }) => {
    renderer.setClearColor(light ? BG_LIGHT : BG_DARK, 1)
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
