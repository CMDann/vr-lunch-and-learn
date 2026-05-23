import * as THREE     from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { clone as skeletonClone } from 'three/addons/utils/SkeletonUtils.js'

const ASSETS = [
  { file: 'assets/G_VikingSword.glb',                       label: 'VIKING SWORD',  id: 'stat-sword'   },
  { file: 'assets/G_VikingShield_Knot1_Yellow-Black.glb',   label: 'VIKING SHIELD', id: 'stat-shield'  },
  { file: 'assets/SM_EagleFeather_GLB_1.glb',               label: 'EAGLE FEATHER', id: 'stat-feather' },
]

// [solidX, wireX] for each model pair — spread across -7 → 7
const PAIR_X = [[-6.5, -4.2], [-1.1, 1.1], [4.2, 6.5]]
const TARGET_HEIGHT = 2.8

/**
 * Assets demo — loads 3 GLBs, shows each solid next to its wireframe clone.
 * Counts real triangle / vertex / bone stats and writes them to the HTML stat cards.
 */
export function initAssetsScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setClearColor(0x060810, 1)
  renderer.shadowMap.enabled = true

  const scene  = new THREE.Scene()
  scene.fog    = new THREE.Fog(0x060810, 22, 45)
  const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 100)
  camera.position.set(0, 2.5, 13)
  camera.lookAt(0, 1, 0)

  // Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({ color: 0x060810, roughness: 0.9 })
  )
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)
  scene.add(new THREE.GridHelper(30, 24, 0x111122, 0x0a0a14))

  // Lighting
  scene.add(new THREE.AmbientLight(0x1a1f30, 3))
  const key = new THREE.DirectionalLight(0xffffff, 2)
  key.position.set(4, 12, 8)
  key.castShadow = true
  scene.add(key)
  scene.add(Object.assign(new THREE.DirectionalLight(0x00a8e8, 0.7), {
    position: new THREE.Vector3(-8, 4, -4),
  }))

  // Divider lines between pairs
  for (let i = 0; i < 2; i++) {
    const x   = [-2.6, 2.6][i]
    const pts = [new THREE.Vector3(x, 0, -4), new THREE.Vector3(x, 5, -4)]
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0x222233, transparent: true, opacity: 0.5 })
    )
    scene.add(line)
  }

  const mixers = []
  const loader  = new GLTFLoader()

  ASSETS.forEach((asset, i) => {
    setStatLoading(asset.id, asset.label)

    loader.load(asset.file, (gltf) => {
      const stats = collectStats(gltf.scene)
      populateStat(asset.id, asset.label, stats)

      // — Solid version —
      const solid = skeletonClone(gltf.scene)
      fitToHeight(solid, TARGET_HEIGHT)
      solid.position.set(PAIR_X[i][0], 0, 0)
      solid.traverse(n => { if (n.isMesh || n.isSkinnedMesh) n.castShadow = true })
      scene.add(solid)

      // — Wireframe version —
      const wire = skeletonClone(gltf.scene)
      fitToHeight(wire, TARGET_HEIGHT)
      wire.position.set(PAIR_X[i][1], 0, 0)
      wire.traverse(n => {
        if (n.isMesh || n.isSkinnedMesh) {
          n.material = new THREE.MeshBasicMaterial({
            color:       0x00a8e8,
            wireframe:   true,
            transparent: true,
            opacity:     0.8,
          })
        }
      })
      scene.add(wire)

      // Animations
      if (gltf.animations?.length) {
        const clip = gltf.animations[0]
        ;[solid, wire].forEach(root => {
          const mx = new THREE.AnimationMixer(root)
          mx.clipAction(clip).play()
          mixers.push(mx)
        })
      }
    }, undefined, err => {
      console.warn(`Asset load failed: ${asset.file}`, err)
      setStatError(asset.id, asset.label)
    })
  })

  resize()

  const clock = new THREE.Clock()
  let   t = 0

  renderer.setAnimationLoop(() => {
    const dt = clock.getDelta()
    t += dt

    for (const mx of mixers) mx.update(dt)

    camera.position.x = Math.sin(t * 0.07) * 1.2
    camera.position.y = 2.2 + Math.sin(t * 0.05) * 0.4
    camera.lookAt(0, 1, 0)

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

/** Scale and floor-align a group so its tallest axis equals targetHeight. */
function fitToHeight(group, targetHeight) {
  const box    = new THREE.Box3().setFromObject(group)
  const size   = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)
  if (maxDim === 0) return
  group.scale.multiplyScalar(targetHeight / maxDim)

  const box2   = new THREE.Box3().setFromObject(group)
  const center = box2.getCenter(new THREE.Vector3())
  group.position.x -= center.x
  group.position.z -= center.z
  group.position.y -= box2.min.y
}

/** Traverse a scene and collect mesh statistics. */
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
  el.innerHTML = `<div class="as-name">${label}</div><div class="as-loading">LOADING...</div>`
}

function setStatError(id, label) {
  const el = document.getElementById(id)
  if (!el) return
  el.innerHTML = `<div class="as-name">${label}</div><div class="as-loading">LOAD FAILED</div>`
}

function populateStat(id, label, s) {
  const el = document.getElementById(id)
  if (!el) return
  el.innerHTML = `
    <div class="as-name">${label}</div>
    <div class="as-row"><span class="as-key">TRIANGLES</span><span class="as-val">${s.tris}</span></div>
    <div class="as-row"><span class="as-key">VERTICES</span><span class="as-val">${s.verts}</span></div>
    <div class="as-row"><span class="as-key">MATERIALS</span><span class="as-val">${s.mats}</span></div>
    <div class="as-row"><span class="as-key">SKINNED</span><span class="as-val">${s.skinned ? 'YES' : 'NO'}</span></div>
    ${s.skinned ? `<div class="as-row"><span class="as-key">BONES</span><span class="as-val">${s.bones}</span></div>` : ''}
  `
}
