import * as THREE from 'three'

const BG_DARK  = 0x020408
const BG_LIGHT = 0xf0ede7

/**
 * VR slide — immersive virtual room interior.
 * Camera orbits slowly inside. A glowing orb pulses at center.
 * Responds to themechange: room structure, grid, and rings adapt.
 */
export function initVRScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setClearColor(BG_DARK, 1)

  const scene  = new THREE.Scene()
  scene.fog    = new THREE.FogExp2(BG_DARK, 0.04)

  const camera = new THREE.PerspectiveCamera(80, 1, 0.1, 200)
  camera.position.set(0, 1.6, 0)

  // Room wireframe — store mat for theme updates
  const roomSize = 12
  const roomGeo  = new THREE.BoxGeometry(roomSize, roomSize, roomSize)
  const roomMat  = new THREE.MeshBasicMaterial({
    color:       0x1b3d9e,
    side:        THREE.BackSide,
    wireframe:   true,
    transparent: true,
    opacity:     0.25,
  })
  scene.add(new THREE.Mesh(roomGeo, roomMat))

  // Floor grid — let so theme listener can replace it
  let grid = new THREE.GridHelper(roomSize, 16, 0x222244, 0x111133)
  grid.position.y = -roomSize / 2 + 0.01
  scene.add(grid)

  // Central orb
  const orbGeo  = new THREE.SphereGeometry(0.8, 32, 32)
  const orbMat  = new THREE.MeshStandardMaterial({
    color:             0x00a8e8,
    emissive:          0x00a8e8,
    emissiveIntensity: 1.2,
    roughness:         0.1,
    metalness:         0.3,
  })
  const orb = new THREE.Mesh(orbGeo, orbMat)
  scene.add(orb)

  const orbLight = new THREE.PointLight(0x00a8e8, 2, 15)
  scene.add(orbLight)

  scene.add(new THREE.AmbientLight(0x0a1020, 1))

  // Floating rings — store mats for theme updates
  const ringMats = []
  for (let i = 0; i < 3; i++) {
    const ringMat = new THREE.MeshBasicMaterial({
      color:       0x1b3d9e,
      transparent: true,
      opacity:     0.5,
    })
    ringMats.push(ringMat)
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.2 + i * 0.8, 0.015, 6, 60),
      ringMat
    )
    ring.rotation.x = Math.PI / 2 + i * 0.4
    ring.userData.rotSpeed = 0.003 + i * 0.002
    scene.add(ring)
  }

  document.addEventListener('themechange', ({ detail: { light } }) => {
    const bg = light ? BG_LIGHT : BG_DARK
    renderer.setClearColor(bg, 1)
    scene.fog.color.setHex(bg)

    roomMat.color.setHex(light ? 0x3366cc : 0x1b3d9e)
    roomMat.opacity = light ? 0.55 : 0.25

    ringMats.forEach(m => m.color.setHex(light ? 0x3366cc : 0x1b3d9e))

    scene.remove(grid)
    grid = new THREE.GridHelper(
      roomSize, 16,
      light ? 0x336699 : 0x222244,
      light ? 0x6699bb : 0x111133
    )
    grid.position.y = -roomSize / 2 + 0.01
    scene.add(grid)
  })

  resize()

  let t = 0
  renderer.setAnimationLoop(() => {
    t += 0.005

    camera.position.set(
      Math.sin(t * 0.3) * 4,
      1.6 + Math.sin(t * 0.2) * 0.3,
      Math.cos(t * 0.3) * 4
    )
    camera.lookAt(0, 0.5, 0)

    const pulse = 0.9 + Math.sin(t * 2) * 0.15
    orb.scale.setScalar(pulse)
    orbMat.emissiveIntensity  = 1 + Math.sin(t * 2) * 0.4
    orbLight.intensity        = 2 + Math.sin(t * 2) * 0.8

    scene.children.forEach(obj => {
      if (obj.userData.rotSpeed) obj.rotation.z += obj.userData.rotSpeed
    })

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
