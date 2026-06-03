// WGSL compute shader: one simple N-body-style integration step.
// Each invocation advances one particle by summing pairwise gravity from a
// sample of others, then integrating velocity and position. The workload is
// deliberately compute-bound so the GPU's parallelism is visible.

export const NBODY_WGSL = /* wgsl */ `
struct Particle {
  pos: vec2<f32>,
  vel: vec2<f32>,
};

struct Params {
  count: u32,
  dt: f32,
};

@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<uniform> params: Params;

const G: f32 = 0.0005;
const SOFTEN: f32 = 0.01;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= params.count) {
    return;
  }

  var p = particles[i];
  var acc = vec2<f32>(0.0, 0.0);

  // Sum gravitational pull from every other particle.
  for (var j: u32 = 0u; j < params.count; j = j + 1u) {
    if (j == i) {
      continue;
    }
    let d = particles[j].pos - p.pos;
    let dist2 = d.x * d.x + d.y * d.y + SOFTEN;
    let inv = 1.0 / sqrt(dist2);
    acc = acc + d * (G * inv * inv);
  }

  p.vel = p.vel + acc * params.dt;
  p.pos = p.pos + p.vel * params.dt;

  // Soft-bounce off the [-1, 1] viewport bounds so particles stay on screen.
  if (p.pos.x < -1.0 || p.pos.x > 1.0) { p.vel.x = p.vel.x * -0.8; }
  if (p.pos.y < -1.0 || p.pos.y > 1.0) { p.vel.y = p.vel.y * -0.8; }
  p.pos = clamp(p.pos, vec2<f32>(-1.0, -1.0), vec2<f32>(1.0, 1.0));

  particles[i] = p;
}
`;
