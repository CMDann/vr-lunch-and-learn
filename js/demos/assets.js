import * as THREE          from 'three'
import { GLTFLoader }       from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls }    from 'three/addons/controls/OrbitControls.js'

const ASSETS = [
  {
    file:  'assets/G_VikingSword.glb',
    label: 'VIKING SWORD',
    id:    'stat-sword',
  },
  {
    file:  'assets/G_VikingShield_Knot1_Yellow-Black.glb',
    label: 'VIKING SHIELD',
    id:    'stat-shield',
  },
  {
    file:  'assets/SM_EagleFeather_GLB_1.glb',
    label: 'EAGLE FEATHER',
    id:    'stat-feather',
  },
]

// [solidX, wireX] for each model pair
const PAIR_X        = [[-5.5, -3.0], [-1.25, 1.25], [3.0, 5.5]]
const TARGET_HEIGHT = 4.2

/**
 * Assets demo — loads 3 GLBs, shows each solid next to its
 * wireframe copy. Writes triangle/vertex/bone stats to HTML.
 * Drag to orbit. Scroll to zoom.
 */
export function initAssetsScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setClearColor(0x060810, 1)
  renderer.shadowMap.enabled = true

  const scene  = new THREE.Scene()
  scene.fog    = new THREE.Fog(0x060810, 22, 45)
  const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 100)
  camera.position.set(0, 3, 15)

  // Orbit controls — drag to rotate, scroll to zoom, no pan
  const controls          = new OrbitControls(camera, canvas)
  controls.target.set(0, 2, 0)
  controls.enableDamping  = true
  controls.dampingFactor  = 0.06
  controls.enablePan      = false
  controls.minDistance    = 6
  controls.maxDistance    = 28
  controls.maxPolarAngle  = Math.PI / 1.85
  controls.autoRotate     = true
  controls.autoRotateSpeed = 0.6
  controls.update()

  // Pause auto-rotate while user interacts
  canvas.addEventListener('pointerdown', () => {
    controls.autoRotate = false
  })
  canvas.addEventListener('pointerup', () => {
    setTimeout(() => { controls.autoRotate = true }, 2500)
  })

  // Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({ color: 0x060810, roughness: 0.9 })
  )
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)
  scene.add(new THREE.GridHelper(40, 30, 0x111122, 0x0a0a14))

  // Lighting
  scene.add(new THREE.AmbientLight(0x1a1f30, 4))
  const key = new THREE.DirectionalLight(0xffffff, 3.5)
  key.position.set(4, 14, 10)
  key.castShadow = true
  scene.add(key)
  const fill = new THREE.DirectionalLight(0x00a8e8, 1.5)
  fill.position.set(-10, 5, -5)
  scene.add(fill)

  // Divider lines between pairs
  for (let i = 0; i < 2; i++) {
    const x   = [-2.3, 2.3][i]
    const pts = [
      new THREE.Vector3(x, 0, -5),
      new THREE.Vector3(x, 6, -5),
    ]
    scene.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({
        color:       0x222233,
        transparent: true,
        opacity:     0.5,
      })
    ))
  }

  const mixers = []
  const loader  = new GLTFLoader()

  ASSETS.forEach((asset, i) => {
    setStatLoading(asset.id, asset.label)

    loader.load(
      asset.file,
      (gltf) => {
        try {
          const stats  = collectStats(gltf.scene)
          populateStat(asset.id, asset.label, stats)

          // — Solid: original scene —
          const solid  = gltf.scene
          const solidY = fitToHeight(solid, TARGET_HEIGHT)
          solid.position.set(PAIR_X[i][0], solidY, 0)
          solid.traverse(n => {
            if (n.isMesh || n.isSkinnedMesh) n.castShadow = true
          })
          scene.add(solid)

          // — Wireframe: geometry-only copy, no skeleton —
          const wire = buildWireframe(gltf.scene, TARGET_HEIGHT)
          wire.position.set(PAIR_X[i][1], 0, 0)
          scene.add(wire)

          // Animate solid only
          if (gltf.animations?.length) {
            const mx = new THREE.AnimationMixer(solid)
            mx.clipAction(gltf.animations[0]).play()
            mixers.push(mx)
          }
        } catch (err) {
          console.error('Asset setup error:', asset.file, err)
          setStatError(asset.id, asset.label)
        }
      },
      undefined,
      (err) => {
        console.warn('Asset load failed:', asset.file, err)
        setStatError(asset.id, asset.label)
      }
    )
  })

  resize()

  const clock = new THREE.Clock()

  renderer.setAnimationLoop(() => {
    const dt = clock.getDelta()
    for (const mx of mixers) mx.update(dt)
    controls.update()
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

/**
 * Scale group so its tallest axis equals targetHeight.
 * Returns the y offset needed to floor-align the result.
 */
function fitToHeight(group, targetHeight) {
  const box    = new THREE.Box3().setFromObject(group)
  const size   = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)
  if (maxDim === 0) return 0

  group.scale.setScalar(targetHeight / maxDim)

  const box2 = new THREE.Box3().setFromObject(group)
  return -box2.min.y
}

/**
 * Build a wireframe group from raw mesh geometry.
 * Reads world-space transforms from the source meshes so
 * the wireframe matches the solid's proportions.
 * No skeleton cloning — guaranteed to work with any GLB.
 */
function buildWireframe(source, targetHeight) {
  const group  = new THREE.Group()
  const mat    = new THREE.MeshBasicMaterial({
    color:       0x00a8e8,
    wireframe:   true,
    transparent: true,
    opacity:     0.8,
  })

  source.updateWorldMatrix(true, true)

  source.traverse(n => {
    if (!n.isMesh && !n.isSkinnedMesh) return
    const mesh = new THREE.Mesh(n.geometry, mat)
    mesh.position.copy(n.getWorldPosition(new THREE.Vector3()))
    mesh.quaternion.copy(n.getWorldQuaternion(new THREE.Quaternion()))
    mesh.scale.copy(n.getWorldScale(new THREE.Vector3()))
    group.add(mesh)
  })

  const box    = new THREE.Box3().setFromObject(group)
  const size   = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)
  if (maxDim > 0) group.scale.setScalar(targetHeight / maxDim)

  const box2 = new THREE.Box3().setFromObject(group)
  group.position.y = -box2.min.y

  return group
}

/** Collect triangle / vertex / material / bone stats from a scene. */
function collectStats(root) {
  let tris = 0, verts = 0, bones = 0, skinned = false
  const matIds = new Set()

  root.traverse(n => {
    if (!n.isMesh && !n.isSkinnedMesh) return
    const geo = n.geometry
    if (geo.index) tris  += geo.index.count / 3
    else           tris  += (geo.attributes.position?.count ?? 0) / 3
    verts += geo.attributes.position?.count ?? 0
    const mArr = Array.isArray(n.material) ? n.material : [n.material]
    mArr.forEach(m => m && matIds.add(m.uuid))
    if (n.isSkinnedMesh) {
      skinned = true
      bones   = Math.max(bones, n.skeleton?.bones?.length ?? 0)
    }
  })

  return {
    tris:    Math.round(tris).toLocaleString(),
    verts:   verts.toLocaleString(),
    mats:    matIds.size,
    skinned,
    bones,
  }
}

function setStatLoading(id, label) {
  const el = document.getElementById(id)
  if (!el) return
  el.innerHTML = `
    <div class="as-name">${label}</div>
    <div class="as-loading">LOADING...</div>
  `
}

function setStatError(id, label) {
  const el = document.getElementById(id)
  if (!el) return
  el.innerHTML = `
    <div class="as-name">${label}</div>
    <div class="as-loading">LOAD FAILED</div>
  `
}

function populateStat(id, label, s) {
  const el = document.getElementById(id)
  if (!el) return
  el.innerHTML = `
    <div class="as-name">${label}</div>
    <div class="as-row">
      <span class="as-key">TRIANGLES</span>
      <span class="as-val">${s.tris}</span>
    </div>
    <div class="as-row">
      <span class="as-key">VERTICES</span>
      <span class="as-val">${s.verts}</span>
    </div>
    <div class="as-row">
      <span class="as-key">MATERIALS</span>
      <span class="as-val">${s.mats}</span>
    </div>
    <div class="as-row">
      <span class="as-key">SKINNED</span>
      <span class="as-val">${s.skinned ? 'YES' : 'NO'}</span>
    </div>
    ${s.skinned
      ? `<div class="as-row">
           <span class="as-key">BONES</span>
           <span class="as-val">${s.bones}</span>
         </div>`
      : ''}
  `
}
