import * as THREE from 'three'

/**
 * Demo Stage 3 — Lighting + PBR materials.
 * Same geometry, now responding to light. Looks 3D.
 */
export function initDemo3(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setClearColor(0x0a0a0a, 1)
  renderer.shadowMap.enabled = true

  const scene  = new THREE.Scene()
  scene.fog    = new THREE.Fog(0x0a0a0a, 20, 40)
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200)

  // Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 })
  )
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)

  // Lighting
  scene.add(new THREE.AmbientLight(0x111133, 1.5))

  const sun = new THREE.DirectionalLight(0xffffff, 1.5)
  sun.position.set(6, 10, 6)
  sun.castShadow = true
  scene.add(sun)

  const fill = new THREE.DirectionalLight(0x1b3d9e, 0.8)
  fill.position.set(-8, 3, -4)
  scene.add(fill)

  // PBR materials
  const colors = [0xcccccc, 0x1b3d9e, 0x00a8e8, 0x888888, 0xaaaaaa]
  const makeMat = (i) => new THREE.MeshStandardMaterial({
    color: colors[i % colors.length],
    roughness: 0.3 + (i % 3) * 0.2,
    metalness: 0.5 + (i % 2) * 0.3,
  })

  const geos = [
    new THREE.BoxGeometry(1.2, 1.2, 1.2),
    new THREE.SphereGeometry(0.8, 24, 16),
    new THREE.TorusGeometry(0.7, 0.25, 12, 40),
    new THREE.ConeGeometry(0.6, 1.4, 12),
    new THREE.IcosahedronGeometry(0.8, 0),
  ]
  const positions = [[-2, 0.6, 0], [0, 0.8, -2], [2, 0.7, 0], [0, 0.7, 2], [-1.5, 0.8, 2]]

  const objects = geos.map((geo, i) => {
    const mesh = new THREE.Mesh(geo, makeMat(i))
    mesh.position.set(...positions[i])
    mesh.castShadow = true
    scene.add(mesh)
    return mesh
  })

  resize()

  let t = 0
  renderer.setAnimationLoop(() => {
    t += 0.005

    objects.forEach((obj, i) => {
      obj.rotation.y += 0.007 + i * 0.002
      obj.rotation.x += 0.003
    })

    camera.position.set(
      Math.sin(t * 0.18) * 9,
      4 + Math.sin(t * 0.1) * 1,
      Math.cos(t * 0.18) * 9
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
