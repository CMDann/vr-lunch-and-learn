import * as THREE from 'three'
import { EffectComposer }   from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass }       from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass }  from 'three/addons/postprocessing/UnrealBloomPass.js'

const BG_DARK  = 0x020408
const BG_LIGHT = 0xf0ede7

/**
 * Demo Stage 5 — A full experience.
 * Fog, particles, bloom post-processing, point lights, interaction.
 * The same scene but now it FEELS like something.
 */
export function initDemo5(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setClearColor(BG_DARK, 1)
  renderer.shadowMap.enabled  = true
  renderer.toneMapping        = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2

  const scene  = new THREE.Scene()
  scene.fog    = new THREE.FogExp2(BG_DARK, 0.045)
  const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 200)

  // Post-processing
  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.5, 0.4, 0.8)
  composer.addPass(bloom)

  // Floor
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x060a10, roughness: 0.8, metalness: 0.1,
  })
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)

  // Grid overlay
  const grid = new THREE.GridHelper(30, 30, 0x0d1a4a, 0x060a10)
  grid.position.y = 0.01
  scene.add(grid)

  // Lights
  scene.add(new THREE.AmbientLight(0x030610, 2))

  const keyLight = new THREE.DirectionalLight(0x4488ff, 1.2)
  keyLight.position.set(8, 12, 8)
  keyLight.castShadow = true
  scene.add(keyLight)

  const rimLight = new THREE.DirectionalLight(0x00a8e8, 0.6)
  rimLight.position.set(-10, 4, -6)
  scene.add(rimLight)

  // Interactive objects with emissive materials
  const configs = [
    { geo: new THREE.BoxGeometry(1.2, 1.2, 1.2),    pos: [-2, 0.6, 0],  color: 0x1b3d9e },
    { geo: new THREE.SphereGeometry(0.8, 24, 16),    pos: [0, 0.8, -2],  color: 0x00a8e8 },
    { geo: new THREE.TorusGeometry(0.7, 0.25, 12, 40), pos: [2, 0.7, 0], color: 0x0055aa },
    { geo: new THREE.ConeGeometry(0.6, 1.4, 12),     pos: [0, 0.7, 2],   color: 0x0077cc },
    { geo: new THREE.IcosahedronGeometry(0.8, 0),    pos: [-1.5, 0.8, 2], color: 0x00ccff },
  ]

  const objects = configs.map(({ geo, pos, color }) => {
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
      color,
      roughness:         0.2,
      metalness:         0.8,
      emissive:          new THREE.Color(color),
      emissiveIntensity: 0.15,
    }))
    mesh.position.set(...pos)
    mesh.castShadow = true
    mesh.userData.baseEmissive = 0.15
    scene.add(mesh)

    // Point light per object for environment lighting
    const pl = new THREE.PointLight(color, 0.5, 4)
    pl.position.copy(mesh.position)
    scene.add(pl)
    mesh.userData.pointLight = pl

    return mesh
  })

  // Particle system
  const particleCount = 600
  const pPositions    = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    pPositions[i * 3]     = (Math.random() - 0.5) * 20
    pPositions[i * 3 + 1] = Math.random() * 6
    pPositions[i * 3 + 2] = (Math.random() - 0.5) * 20
  }
  const pGeo = new THREE.BufferGeometry()
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3))
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: 0x4488ff, size: 0.06, sizeAttenuation: true, transparent: true, opacity: 0.7,
  }))
  scene.add(particles)

  // Raycasting
  const raycaster = new THREE.Raycaster()
  const pointer   = new THREE.Vector2(-9, -9)
  let   hovered   = null

  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect()
    pointer.set(
      ((e.clientX - r.left) / r.width)  * 2 - 1,
      -((e.clientY - r.top)  / r.height) * 2 + 1
    )
  })

  resize()

  let t = 0
  renderer.setAnimationLoop(() => {
    t += 0.005

    // Particle drift
    const pos = pGeo.attributes.position.array
    for (let i = 1; i < particleCount * 3; i += 3) {
      pos[i] += 0.003
      if (pos[i] > 6) pos[i] = 0
    }
    pGeo.attributes.position.needsUpdate = true

    // Raycasting
    raycaster.setFromCamera(pointer, camera)
    const hits = raycaster.intersectObjects(objects)

    if (hovered && (!hits.length || hits[0].object !== hovered)) {
      hovered.material.emissiveIntensity = hovered.userData.baseEmissive
      hovered.userData.pointLight.intensity = 0.5
      hovered = null
    }
    if (hits.length) {
      const obj = hits[0].object
      if (obj !== hovered) {
        hovered = obj
        hovered.material.emissiveIntensity = 1.2
        hovered.userData.pointLight.intensity = 3
      }
    }

    // Animate objects
    objects.forEach((obj, i) => {
      obj.rotation.y += 0.008 + i * 0.002
      obj.position.y  = configs[i].pos[1] + Math.sin(t + i) * 0.18
      obj.userData.pointLight.position.copy(obj.position)
    })

    camera.position.set(
      Math.sin(t * 0.15) * 9,
      4 + Math.sin(t * 0.09) * 1,
      Math.cos(t * 0.15) * 9
    )
    camera.lookAt(0, 0.5, 0)

    composer.render()
  })

  document.addEventListener('themechange', ({ detail: { light } }) => {
    const bg = light ? BG_LIGHT : BG_DARK
    renderer.setClearColor(bg, 1)
    scene.fog.color.setHex(bg)
    floorMat.color.setHex(light ? 0xd8d5cf : 0x060a10)
  })

  const ro = new ResizeObserver(resize)
  ro.observe(canvas)

  function resize() {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    composer.setSize(w, h)
    bloom.resolution.set(w, h)
  }
}
