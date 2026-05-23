# Section 02 — Designing an Experience

**Slides:** 7–15 | **Section label:** DESIGN

---

## Slide 7 — Design Principles

**SECTION 02**

### DESIGNING AN EXPERIENCE

1. COMFORT FIRST — NO MOTION SICKNESS
2. AFFORDANCES OVER INSTRUCTIONS
3. SPATIAL AUDIO GROUNDS PRESENCE
4. INTERACTION MUST FEEL PHYSICAL
5. LOCOMOTION DEFINES THE EXPERIENCE
6. PERFORMANCE IS A FEATURE — 72+ FPS

---

## Slide 8 — Interaction Modalities

**HOW USERS INTERACT**

### INTERACTION MODALITIES

**01 — GAZE** | LOW PRECISION / HANDS-FREE
Eyes as pointer. Dwell-based activation. Always available — no peripheral required. Fatigue accumulates fast. Use for awareness, not precision.

**02 — CONTROLLER** | HIGH PRECISION / HAPTICS
6DOF tracked input. Trigger, grip, thumbstick, face buttons. Haptic feedback. The workhorse of VR. Precise, reliable, and universally understood.

**03 — HAND TRACKING** | NATURAL / CONTEXT-DEPENDENT
No peripheral. Pinch to select, grab to manipulate. Feels natural — but occlusion, range limits, and latency demand careful affordance design.

**04 — VOICE** | AMBIENT / SUPPLEMENTAL
Ambient, hands-free commands. Strong for navigation and mode switching. On-device models have latency. Not suitable as a primary interaction layer.

---

## Slide 9 — Interaction Patterns

**DESIGN PATTERNS**

### INTERACTION PATTERNS

**[ NEAR ] — DIRECT MANIPULATION**
Reach into the world and grab. Intuitive because it mirrors physical reality. Requires spatial accuracy — arm fatigue is real above shoulder height.
> **RULE** — Keep interactive objects within comfortable reach. No gorilla arm.

**[ FAR ] — RAYCAST / POINTER**
Project a ray from hand or gaze. Hover to target, trigger to select. The dominant pattern in most XR applications. Works at any distance.
> **RULE** — Visual ray + cursor gives critical affordance feedback.

**[ MOVE ] — LOCOMOTION**
How users travel through virtual space. Teleport: safe, no sickness. Continuous: fast, disorienting for some. The choice shapes the entire experience feel.
> **RULE** — Offer teleport as fallback. Comfort is non-negotiable.

**[ UI ] — SPATIAL UI**
UI lives in world space — not screen space. Panels, menus, labels anchored to the environment or to objects. Head-locked UI causes nausea. Do not do it.
> **RULE** — No HUD. UI must exist in the world.

---

## Slide 10 — Live Build: Stage 1 / An Empty Scene

**STAGE 01 / 05**

### AN EMPTY SCENE

- A renderer, a camera, a scene
- The foundation of every XR experience
- 72fps minimum. Non-negotiable.

```javascript
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000)
const renderer = new THREE.WebGLRenderer()
renderer.setAnimationLoop(render)
```

---

## Slide 11 — Live Build: Stage 2 / Geometry

**STAGE 02 / 05**

### GEOMETRY

- Objects: vertices, faces, UVs
- World space vs local space
- Transform: position, rotation, scale

```javascript
const geo = new THREE.BoxGeometry(1, 1, 1)
const mat = new THREE.MeshBasicMaterial({ wireframe: true })
const mesh = new THREE.Mesh(geo, mat)
scene.add(mesh)
```

---

## Slide 12 — Live Build: Stage 3 / Lighting + Materials

**STAGE 03 / 05**

### LIGHTING + MATERIALS

- PBR materials respond to light
- Ambient + directional light setup
- Shadows cost — use with intention

```javascript
const mat = new THREE.MeshStandardMaterial({
  color: 0x1b3d9e,
  roughness: 0.4,
  metalness: 0.6
})
const light = new THREE.DirectionalLight(0xffffff, 1)
scene.add(light)
```

---

## Slide 13 — Real Assets / Solid vs Wireframe

**REAL ASSETS — BEHIND THE MESH**

### SOLID vs WIREFRAME

Three game-ready assets displayed side-by-side with their wireframe representation. Triangle, vertex, material, and bone counts shown for each.

| Asset | Format |
|---|---|
| VIKING SWORD | `G_VikingSword.glb` |
| VIKING SHIELD | `G_VikingShield_Knot1_Yellow-Black.glb` |
| EAGLE FEATHER | `SM_EagleFeather_GLB_1.glb` |

*Drag to rotate. Orbit controls enabled.*

---

## Slide 14 — Live Build: Stage 4 / Interaction

**STAGE 04 / 05**

### INTERACTION

- Raycasting detects intersections
- Same pattern works with XR controllers
- Hover to highlight — click to activate

```javascript
const ray = new THREE.Raycaster()
ray.setFromCamera(pointer, camera)
const hits = ray.intersectObjects(objects)
if (hits.length) {
  hits[0].object.material.emissive.set(0x00a8e8)
}
```

---

## Slide 15 — Live Build: Stage 5 / An Experience

**STAGE 05 / 05**

### AN EXPERIENCE

- Fog, particles, post-processing
- Environmental storytelling
- Every element earns its render cost

*HOVER OBJECTS TO INTERACT*
