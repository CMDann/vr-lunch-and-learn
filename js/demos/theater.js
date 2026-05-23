import * as THREE from 'three'

const BG = 0x06050a

/**
 * Theater slide — dark cinema interior.
 * Tiered seats, screen glow, subtle lighting.
 * YouTube iframe is overlaid via CSS and lives outside this scene.
 */
export function initTheaterScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setClearColor(BG, 1)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type    = THREE.PCFSoftShadowMap

  const scene  = new THREE.Scene()
  scene.fog    = new THREE.FogExp2(BG, 0.055)

  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 80)
  camera.position.set(0, 2.2, 10)
  camera.lookAt(0, 4.2, -6)

  // Ambient — very dark, slight blue cast
  scene.add(new THREE.AmbientLight(0x08091a, 6))

  // Screen fill light — blue-white glow from where screen is
  const screenLight = new THREE.PointLight(0x3355bb, 18, 22)
  screenLight.position.set(0, 5.5, -9)
  scene.add(screenLight)

  // Aisle floor lights
  const aisleColors = [0x220011, 0x110022, 0x002211]
  for (let i = 0; i < 3; i++) {
    const al = new THREE.PointLight(aisleColors[i], 0.8, 4)
    al.position.set(0, 0.1, 6 - i * 3)
    scene.add(al)
  }

  // Ceiling spotlights angled toward seats
  const spotL = new THREE.SpotLight(0x9999cc, 1.5, 20, 0.28, 0.7)
  spotL.position.set(-5, 9, 2)
  spotL.target.position.set(-2, 0, 2)
  scene.add(spotL)
  scene.add(spotL.target)

  const spotR = new THREE.SpotLight(0x9999cc, 1.5, 20, 0.28, 0.7)
  spotR.position.set(5, 9, 2)
  spotR.target.position.set(2, 0, 2)
  scene.add(spotR)
  scene.add(spotR.target)

  // Floor — dark carpet
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x120a0a, roughness: 1,
  })
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 40), floorMat
  )
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)

  // Side walls
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x0d0a10, roughness: 0.95,
  })
  for (const [x, ry] of [[-9, Math.PI / 2], [9, -Math.PI / 2]]) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(30, 12), wallMat)
    w.position.set(x, 4, -2)
    w.rotation.y = ry
    scene.add(w)
  }

  // Back wall
  const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 12), wallMat
  )
  backWall.position.set(0, 4, 12)
  backWall.rotation.y = Math.PI
  scene.add(backWall)

  // Ceiling
  const ceilMat = new THREE.MeshStandardMaterial({
    color: 0x080510, roughness: 0.95,
  })
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(18, 30), ceilMat)
  ceil.position.set(0, 9, -2)
  ceil.rotation.x = Math.PI / 2
  scene.add(ceil)

  // Screen surround — matte black frame behind iframe
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x030205, roughness: 0.9,
  })
  const screenFrame = new THREE.Mesh(
    new THREE.BoxGeometry(13, 7.6, 0.4), frameMat
  )
  screenFrame.position.set(0, 5.4, -12)
  scene.add(screenFrame)

  // Screen glow plane — dim blue-white behind iframe position
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x1a2850, transparent: true, opacity: 0.45,
  })
  const screenGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(11.8, 6.6), glowMat
  )
  screenGlow.position.set(0, 5.4, -11.7)
  scene.add(screenGlow)

  // Tiered seating rows
  const platformMat = new THREE.MeshStandardMaterial({
    color: 0x100810, roughness: 0.95,
  })
  const seatMat = new THREE.MeshStandardMaterial({
    color: 0x1a0a12, roughness: 0.9,
  })

  const NUM_ROWS = 7
  for (let row = 0; row < NUM_ROWS; row++) {
    const z    = 8.5 - row * 2.8
    const rise = row * 0.42
    const y    = rise

    // Row platform
    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(16, 0.28, 2.6), platformMat
    )
    platform.position.set(0, y, z)
    platform.receiveShadow = true
    scene.add(platform)

    // Seat backs + seats — 9 seats per row
    const SEATS = 9
    for (let s = 0; s < SEATS; s++) {
      const sx = (s - (SEATS - 1) / 2) * 1.65

      // Seat cushion
      const seat = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 0.18, 1.0), seatMat
      )
      seat.position.set(sx, y + 0.23, z + 0.3)
      scene.add(seat)

      // Backrest
      const back = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 0.9, 0.14), seatMat
      )
      back.position.set(sx, y + 0.7, z - 0.3)
      scene.add(back)
    }
  }

  // Aisle strip — faint centre line
  const aisleMat = new THREE.MeshBasicMaterial({
    color: 0x1a0a1a, transparent: true, opacity: 0.6,
  })
  const aisle = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 30), aisleMat
  )
  aisle.rotation.x = -Math.PI / 2
  aisle.position.set(0, 0.01, -2)
  scene.add(aisle)

  resize()

  let t = 0
  renderer.setAnimationLoop(() => {
    t += 0.004

    // Gentle screen flicker
    const flicker = 0.38 + Math.sin(t * 1.3) * 0.05
                  + Math.sin(t * 3.7) * 0.02
    glowMat.opacity   = flicker
    screenLight.intensity = 16 + Math.sin(t * 0.9) * 2

    // Subtle camera breathe
    camera.position.x = Math.sin(t * 0.18) * 0.12
    camera.position.y = 2.2 + Math.sin(t * 0.22) * 0.06
    camera.lookAt(0, 4.2, -6)

    renderer.render(scene, camera)
  })

  const ro = new ResizeObserver(resize)
  ro.observe(canvas)

  function resize() {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (w === 0 || h === 0) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
}
