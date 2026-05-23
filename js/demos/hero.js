import * as THREE from 'three'

const BG_DARK  = 0x0a0a0a
const BG_LIGHT = 0xf0ede7

/**
 * Hero slide — floating wireframe polyhedra in deep space.
 * BSD XR palette: near-black bg, white + cyan wireframes.
 * Responds to themechange event for light-mode projector use.
 */
export function initHeroScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setClearColor(BG_DARK, 1)

  const scene  = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 500)
  camera.position.set(0, 0, 40)

  // Star field
  const starGeo = new THREE.BufferGeometry()
  const starPos = new Float32Array(800 * 3)
  for (let i = 0; i < starPos.length; i++) {
    starPos[i] = (Math.random() - 0.5) * 300
  }
  starGeo.setAttribute(
    'position', new THREE.BufferAttribute(starPos, 3)
  )
  const starMat = new THREE.PointsMaterial({
    color: 0xffffff, size: 0.25, sizeAttenuation: true,
  })
  scene.add(new THREE.Points(starGeo, starMat))

  // Floating shapes
  const geoPool = [
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.OctahedronGeometry(1, 0),
    new THREE.TetrahedronGeometry(1, 0),
    new THREE.DodecahedronGeometry(1, 0),
  ]

  const shapeMats = []
  const shapes    = []
  for (let i = 0; i < 28; i++) {
    const geo    = geoPool[i % geoPool.length].clone()
    const isCyan = Math.random() > 0.65
    const mat    = new THREE.MeshBasicMaterial({
      color:       isCyan ? 0x00a8e8 : 0xffffff,
      wireframe:   true,
      transparent: true,
      opacity:     0.15 + Math.random() * 0.35,
    })
    mat.userData.isCyan = isCyan
    shapeMats.push(mat)

    const mesh = new THREE.Mesh(geo, mat)

    const r     = 8 + Math.random() * 22
    const theta = Math.random() * Math.PI * 2
    const phi   = Math.acos(2 * Math.random() - 1)

    mesh.position.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi) - 10
    )

    const s = 0.4 + Math.random() * 2.2
    mesh.scale.setScalar(s)

    mesh.userData = {
      ...mesh.userData,
      rx:    (Math.random() - 0.5) * 0.008,
      ry:    (Math.random() - 0.5) * 0.012,
      rz:    (Math.random() - 0.5) * 0.006,
      ox:    mesh.position.x,
      oy:    mesh.position.y,
      phase: Math.random() * Math.PI * 2,
    }

    shapes.push(mesh)
    scene.add(mesh)
  }

  document.addEventListener('themechange', ({ detail: { light } }) => {
    renderer.setClearColor(light ? BG_LIGHT : BG_DARK, 1)
    starMat.color.setHex(light ? 0x8899cc : 0xffffff)
    shapeMats.forEach(m => {
      if (!m.userData.isCyan) {
        m.color.setHex(light ? 0x1b3d9e : 0xffffff)
      }
    })
  })

  resize()

  let t = 0
  renderer.setAnimationLoop(() => {
    t += 0.004

    for (const m of shapes) {
      m.rotation.x += m.userData.rx
      m.rotation.y += m.userData.ry
      m.rotation.z += m.userData.rz
      m.position.x  = m.userData.ox + Math.sin(t + m.userData.phase) * 0.6
      m.position.y  = m.userData.oy + Math.cos(t * 0.7 + m.userData.phase) * 0.4
    }

    camera.position.x = Math.sin(t * 0.08) * 4
    camera.position.y = Math.cos(t * 0.06) * 2
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
