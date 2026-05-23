import * as THREE from 'three'

/**
 * Demo Stage 4 — Raycasting / interaction.
 * Hover to highlight, click to launch.
 * Same pattern used in VR with controller raycasts.
 */
export function initDemo4(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setClearColor(0x0a0a0a, 1)

  const scene  = new THREE.Scene()
  scene.fog    = new THREE.Fog(0x0a0a0a, 20, 40)
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200)

  // Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 })
  )
  floor.rotation.x = -Math.PI / 2
  scene.add(floor)

  scene.add(new THREE.AmbientLight(0x111133, 1.5))
  const sun = new THREE.DirectionalLight(0xffffff, 1.5)
  sun.position.set(6, 10, 6)
  scene.add(sun)
  const fillLight = new THREE.DirectionalLight(0x1b3d9e, 0.8)
  fillLight.position.set(-8, 3, -4)
  scene.add(fillLight)

  const geos = [
    new THREE.BoxGeometry(1.2, 1.2, 1.2),
    new THREE.SphereGeometry(0.8, 24, 16),
    new THREE.TorusGeometry(0.7, 0.25, 12, 40),
    new THREE.ConeGeometry(0.6, 1.4, 12),
    new THREE.IcosahedronGeometry(0.8, 0),
  ]
  const positions = [[-2, 0.6, 0], [0, 0.8, -2], [2, 0.7, 0], [0, 0.7, 2], [-1.5, 0.8, 2]]

  const objects = geos.map((geo, i) => {
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.4,
      metalness: 0.6,
      emissive: 0x000000,
      emissiveIntensity: 0,
    }))
    mesh.position.set(...positions[i])
    mesh.userData.spinning = false
    mesh.userData.spinSpeed = 0
    scene.add(mesh)
    return mesh
  })

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

  canvas.addEventListener('click', () => {
    if (hovered) {
      hovered.userData.spinning  = !hovered.userData.spinning
      hovered.userData.spinSpeed = 0.08
    }
  })

  resize()

  let t = 0
  renderer.setAnimationLoop(() => {
    t += 0.005

    raycaster.setFromCamera(pointer, camera)
    const hits = raycaster.intersectObjects(objects)

    // Reset all
    if (hovered && (!hits.length || hits[0].object !== hovered)) {
      hovered.material.emissive.set(0x000000)
      hovered.material.emissiveIntensity = 0
      hovered = null
    }

    // Highlight hit
    if (hits.length) {
      const obj = hits[0].object
      if (obj !== hovered) {
        hovered = obj
        hovered.material.emissive.set(0x00a8e8)
        hovered.material.emissiveIntensity = 0.6
      }
    }

    // Spin activated objects
    objects.forEach((obj, i) => {
      if (obj.userData.spinning) {
        obj.userData.spinSpeed = Math.min(obj.userData.spinSpeed + 0.003, 0.1)
        obj.rotation.y += obj.userData.spinSpeed
      } else {
        obj.rotation.y += 0.007 + i * 0.002
        obj.rotation.x += 0.003
      }
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
