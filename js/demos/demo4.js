import * as THREE from 'three'

const BG_DARK  = 0x0a0a0a
const BG_LIGHT = 0xf0ede7
const ARENA    = 4.2
const GRAVITY  = -12
const DAMPING  = 0.82

/**
 * Demo Stage 4 — Interaction: collision physics.
 * Objects bounce off walls and each other.
 * Hover highlights via raycasting. Click launches toward center.
 */
export function initDemo4(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setClearColor(BG_DARK, 1)

  const scene  = new THREE.Scene()
  scene.fog    = new THREE.Fog(BG_DARK, 20, 40)
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200)

  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x111111, roughness: 0.9,
  })
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20), floorMat
  )
  floor.rotation.x = -Math.PI / 2
  scene.add(floor)

  scene.add(new THREE.AmbientLight(0x111133, 1.5))
  const sun = new THREE.DirectionalLight(0xffffff, 1.5)
  sun.position.set(6, 10, 6)
  scene.add(sun)
  const fill = new THREE.DirectionalLight(0x1b3d9e, 0.8)
  fill.position.set(-8, 3, -4)
  scene.add(fill)

  const specs = [
    { geo: new THREE.BoxGeometry(1.2, 1.2, 1.2),       r: 0.85 },
    { geo: new THREE.SphereGeometry(0.8, 24, 16),      r: 0.80 },
    { geo: new THREE.TorusGeometry(0.7, 0.25, 12, 40), r: 0.75 },
    { geo: new THREE.ConeGeometry(0.6, 1.4, 12),       r: 0.80 },
    { geo: new THREE.IcosahedronGeometry(0.8, 0),      r: 0.80 },
  ]

  const bodies = specs.map((s, i) => {
    const mesh = new THREE.Mesh(
      s.geo,
      new THREE.MeshStandardMaterial({
        color:             0x888888,
        roughness:         0.4,
        metalness:         0.6,
        emissive:          new THREE.Color(0x000000),
        emissiveIntensity: 0,
      })
    )
    const angle = (i / specs.length) * Math.PI * 2
    mesh.position.set(
      Math.cos(angle) * 2.0,
      s.r + 2 + i * 1.2,
      Math.sin(angle) * 2.0
    )
    scene.add(mesh)
    return {
      mesh,
      r: s.r,
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        -Math.random() * 2,
        (Math.random() - 0.5) * 3
      ),
    }
  })

  const meshes     = bodies.map(b => b.mesh)
  const raycaster  = new THREE.Raycaster()
  const pointer    = new THREE.Vector2(-9, -9)
  let   hovered    = null

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect()
    pointer.set(
      ((e.clientX - rect.left) / rect.width)  * 2 - 1,
      -((e.clientY - rect.top)  / rect.height) * 2 + 1
    )
  })

  canvas.addEventListener('click', () => {
    if (!hovered) return
    const body = bodies.find(b => b.mesh === hovered)
    if (!body) return
    const dir = body.mesh.position.clone().normalize().negate()
    dir.y = 0.8
    dir.normalize()
    body.vel.addScaledVector(dir, 7)
  })

  resize()

  const clock = new THREE.Clock()
  let   t     = 0

  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05)
    t += dt

    for (const b of bodies) {
      b.vel.y += GRAVITY * dt
      b.mesh.position.addScaledVector(b.vel, dt)

      const speed = b.vel.length()
      b.mesh.rotation.x += speed * dt * 0.4
      b.mesh.rotation.z += b.vel.x * dt * 0.25

      if (b.mesh.position.y < b.r) {
        b.mesh.position.y = b.r
        b.vel.y  = Math.abs(b.vel.y) * DAMPING
        b.vel.x *= 0.97
        b.vel.z *= 0.97
      }

      for (const axis of ['x', 'z']) {
        const wall = ARENA - b.r
        if (b.mesh.position[axis] > wall) {
          b.mesh.position[axis] = wall
          b.vel[axis] = -Math.abs(b.vel[axis]) * DAMPING
        } else if (b.mesh.position[axis] < -wall) {
          b.mesh.position[axis] = -wall
          b.vel[axis] = Math.abs(b.vel[axis]) * DAMPING
        }
      }
    }

    // Elastic sphere-sphere collisions
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a    = bodies[i]
        const b    = bodies[j]
        const diff = b.mesh.position.clone().sub(a.mesh.position)
        const dist = diff.length()
        const min  = a.r + b.r
        if (dist >= min || dist < 0.001) continue
        const overlap = (min - dist) / 2
        const norm    = diff.divideScalar(dist)
        a.mesh.position.addScaledVector(norm, -overlap)
        b.mesh.position.addScaledVector(norm,  overlap)
        const relVel = a.vel.clone().sub(b.vel)
        const dot    = relVel.dot(norm)
        if (dot > 0) {
          a.vel.addScaledVector(norm, -dot)
          b.vel.addScaledVector(norm,  dot)
        }
      }
    }

    // Raycasting — hover highlight
    raycaster.setFromCamera(pointer, camera)
    const hits = raycaster.intersectObjects(meshes)

    if (hovered && (!hits.length || hits[0].object !== hovered)) {
      hovered.material.emissive.set(0x000000)
      hovered.material.emissiveIntensity = 0
      hovered = null
    }
    if (hits.length) {
      const obj = hits[0].object
      if (obj !== hovered) {
        hovered = obj
        hovered.material.emissive.set(0x00a8e8)
        hovered.material.emissiveIntensity = 0.6
      }
    }

    camera.position.set(
      Math.sin(t * 0.18) * 9,
      4 + Math.sin(t * 0.1) * 1,
      Math.cos(t * 0.18) * 9
    )
    camera.lookAt(0, 1, 0)

    renderer.render(scene, camera)
  })

  document.addEventListener('themechange', ({ detail: { light } }) => {
    const bg = light ? BG_LIGHT : BG_DARK
    renderer.setClearColor(bg, 1)
    scene.fog.color.setHex(bg)
    floorMat.color.setHex(light ? 0xd8d5cf : 0x111111)
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
