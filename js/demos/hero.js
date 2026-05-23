import * as THREE from 'three'

/**
 * Hero slide — floating wireframe polyhedra in deep space.
 * BSD XR palette: near-black bg, white + cyan wireframes.
 */
export function initHeroScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setClearColor(0x0a0a0a, 1)

  const scene  = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 500)
  camera.position.set(0, 0, 40)

  // Star field
  const starGeo = new THREE.BufferGeometry()
  const starPos = new Float32Array(800 * 3)
  for (let i = 0; i < starPos.length; i++) {
    starPos[i] = (Math.random() - 0.5) * 300
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({
    color: 0xffffff, size: 0.25, sizeAttenuation: true
  })))

  // Floating shapes
  const geoPool = [
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.OctahedronGeometry(1, 0),
    new THREE.TetrahedronGeometry(1, 0),
    new THREE.DodecahedronGeometry(1, 0),
  ]

  const shapes = []
  for (let i = 0; i < 28; i++) {
    const geo = geoPool[i % geoPool.length].clone()
    const isCyan = Math.random() > 0.65
    const mat = new THREE.MeshBasicMaterial({
      color: isCyan ? 0x00a8e8 : 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.15 + Math.random() * 0.35,
    })
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
      rx: (Math.random() - 0.5) * 0.008,
      ry: (Math.random() - 0.5) * 0.012,
      rz: (Math.random() - 0.5) * 0.006,
      ox: mesh.position.x,
      oy: mesh.position.y,
      phase: Math.random() * Math.PI * 2,
    }

    shapes.push(mesh)
    scene.add(mesh)
  }

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
