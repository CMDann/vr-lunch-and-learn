import * as THREE from 'three'

/**
 * AI Scene — neural network node visualization.
 * Nodes pulse. Signals travel along connections.
 */
export function initAIScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setClearColor(0x020408, 1)

  const scene  = new THREE.Scene()
  scene.fog    = new THREE.FogExp2(0x020408, 0.04)
  const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 200)
  camera.position.set(0, 0, 18)

  // Layer structure: input → hidden1 → hidden2 → output
  const layers = [5, 8, 8, 5]
  const layerX = [-9, -3, 3, 9]
  const nodes  = []

  layers.forEach((count, li) => {
    const spread = (count - 1) * 1.5
    for (let ni = 0; ni < count; ni++) {
      const y = ni * 1.5 - spread / 2 + (Math.random() - 0.5) * 0.2
      const z = (Math.random() - 0.5) * 2

      const geo  = new THREE.SphereGeometry(0.18, 12, 8)
      const mat  = new THREE.MeshStandardMaterial({
        color: 0x00a8e8,
        emissive: 0x00a8e8,
        emissiveIntensity: 0.3,
        roughness: 0.2,
        metalness: 0.6,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(layerX[li], y, z)
      mesh.userData = { layer: li, index: ni, phase: Math.random() * Math.PI * 2 }
      nodes.push(mesh)
      scene.add(mesh)
    }
  })

  // Connections between adjacent layers
  const connections = []
  const layerNodes  = layers.map((_, li) => nodes.filter(n => n.userData.layer === li))

  for (let li = 0; li < layers.length - 1; li++) {
    const from = layerNodes[li]
    const to   = layerNodes[li + 1]
    for (const f of from) {
      for (const t of to) {
        if (Math.random() > 0.35) {
          const pts = [f.position.clone(), t.position.clone()]
          const geo = new THREE.BufferGeometry().setFromPoints(pts)
          const mat = new THREE.LineBasicMaterial({
            color: 0x1b3d9e, transparent: true, opacity: 0.2,
          })
          const line = new THREE.Line(geo, mat)
          line.userData = {
            from: f.position,
            to:   t.position,
            signal: Math.random(),
            speed:  0.004 + Math.random() * 0.006,
          }
          connections.push(line)
          scene.add(line)
        }
      }
    }
  }

  // Signal spheres traveling along connections
  const sigMat  = new THREE.MeshBasicMaterial({ color: 0x00a8e8 })
  const signals = connections.slice(0, 30).map(line => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 4), sigMat.clone())
    mesh.userData.progress = Math.random()
    mesh.userData.line     = line
    scene.add(mesh)
    return mesh
  })

  // Lights
  scene.add(new THREE.AmbientLight(0x050a18, 3))
  scene.add(Object.assign(new THREE.DirectionalLight(0x4488ff, 1), { position: new THREE.Vector3(5, 8, 5) }))

  resize()

  let t = 0
  renderer.setAnimationLoop(() => {
    t += 0.005

    // Pulse nodes
    nodes.forEach(n => {
      const p = 0.5 + Math.sin(t * 2 + n.userData.phase) * 0.25
      n.material.emissiveIntensity = p * 0.6
      n.scale.setScalar(0.9 + p * 0.2)
    })

    // Travel signals
    signals.forEach(sig => {
      sig.userData.progress += sig.userData.line.userData.speed
      if (sig.userData.progress > 1) sig.userData.progress = 0
      const p = sig.userData.progress
      const from = sig.userData.line.userData.from
      const to   = sig.userData.line.userData.to
      sig.position.lerpVectors(from, to, p)

      // Flash the line when signal is at it
      const brightness = Math.max(0, 1 - Math.abs(p - 0.5) * 4)
      sig.userData.line.material.opacity = 0.2 + brightness * 0.5
    })

    camera.position.set(
      Math.sin(t * 0.1) * 3,
      Math.sin(t * 0.07) * 2,
      18 + Math.cos(t * 0.08) * 2
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
