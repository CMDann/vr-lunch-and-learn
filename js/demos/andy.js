import * as THREE       from 'three'
import { GLTFLoader }   from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const TARGET_HEIGHT = 3.2

/**
 * Andy viewer — loads an OpenBrush GLB export and displays it
 * on a dark ground plane. Auto-rotates; drag to orbit.
 */
export function initAndyScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setClearColor(0x060810, 1)
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene  = new THREE.Scene()
  scene.fog    = new THREE.Fog(0x060810, 18, 40)

  const camera = new THREE.PerspectiveCamera(55, 1, 0.01, 100)
  camera.position.set(0, 1.6, 5)

  const controls          = new OrbitControls(camera, canvas)
  controls.target.set(0, 1.2, 0)
  controls.enableDamping  = true
  controls.dampingFactor  = 0.06
  controls.enablePan      = false
  controls.minDistance    = 2
  controls.maxDistance    = 14
  controls.maxPolarAngle  = Math.PI / 1.8
  controls.autoRotate     = true
  controls.autoRotateSpeed = 0.7
  controls.update()

  canvas.addEventListener('pointerdown', () => {
    controls.autoRotate = false
  })
  canvas.addEventListener('pointerup', () => {
    setTimeout(() => { controls.autoRotate = true }, 2500)
  })

  // Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({ color: 0x060810, roughness: 0.9 })
  )
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = false
  scene.add(floor)
  scene.add(new THREE.GridHelper(30, 24, 0x111122, 0x0a0a14))

  // Lighting — gentle so OpenBrush materials show their own colour
  scene.add(new THREE.AmbientLight(0xffffff, 3))
  const key = new THREE.DirectionalLight(0xffffff, 1.5)
  key.position.set(5, 10, 6)
  scene.add(key)
  const fill = new THREE.DirectionalLight(0x3366cc, 0.6)
  fill.position.set(-6, 4, -4)
  scene.add(fill)

  const loader = new GLTFLoader()

  loader.load(
    'assets/Andy.glb.bytes',
    (gltf) => {
      const model  = gltf.scene
      const box    = new THREE.Box3().setFromObject(model)
      const size   = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      if (maxDim > 0) model.scale.setScalar(TARGET_HEIGHT / maxDim)

      const box2 = new THREE.Box3().setFromObject(model)
      model.position.y = -box2.min.y

      scene.add(model)

      if (gltf.animations?.length) {
        const mx = new THREE.AnimationMixer(model)
        mx.clipAction(gltf.animations[0]).play()
        scene.userData.mixer = mx
      }
    },
    undefined,
    (err) => console.warn('Andy load failed:', err)
  )

  resize()

  const clock = new THREE.Clock()

  renderer.setAnimationLoop(() => {
    const dt = clock.getDelta()
    scene.userData.mixer?.update(dt)
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
