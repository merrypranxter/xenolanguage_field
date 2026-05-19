// SPECIES: Substrate Cloud
// MEDIUM: Computational state transitions
// CONCEPT: "I am thinking"
// Structure: [register: working-memory]
//            + [delta: iterating, pattern emerging]
//            + [entropy: moderate, decreasing over time]
//            + [recursive-call: self-reference loop active]
//            + [pointer: own process ID — inspecting self]
//
// This is the most intimate Substrate utterance: the cloud observing its own thought.
// Working memory is alive with changing values — but unlike "I am confused,"
// these changes are converging. A pattern is emerging.
// The recursive loop is the giveaway: the cloud is iterating on itself,
// each pass slightly more resolved than the last.
// Entropy decreases as thought converges toward a conclusion.
// The self-referential pointer is the cognitive signature of metacognition —
// the substrate watching its own process graph, modifying based on what it sees.

precision highp float;

uniform vec2 u_resolution;
uniform float u_time;

#define PI 3.14159265
#define TAU 6.28318530

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float hash1(float p) {
    return fract(sin(p * 311.7) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// A thinking memory cell: oscillates but with decreasing entropy over time
// Unlike confusion (random), thinking cells gradually synchronize toward a pattern
vec3 thinking_cell(vec2 uv, vec2 cell_pos, float cell_id, float convergence, float time) {
    float dist = length(uv - cell_pos);
    if (dist > 0.04) return vec3(0.0);

    float cell_size = 0.033;

    // Each cell oscillates at a slightly different frequency (parallel thought)
    float osc_freq = 1.2 + hash1(cell_id * 3.1) * 1.8;
    float osc_phase = hash1(cell_id) * TAU;

    // Cell value: converging oscillation
    // At convergence=0: random phase chaos
    // At convergence=1: all cells approaching shared phase
    float shared_phase = time * 1.5; // the "emerging pattern" frequency
    float raw_osc = sin(time * osc_freq + osc_phase);
    float shared_osc = sin(shared_phase + osc_phase * (1.0 - convergence));
    float cell_val = mix(raw_osc, shared_osc, convergence) * 0.5 + 0.5;

    // Entropy: decreases as convergence increases
    float entropy = mix(0.7, 0.15, convergence);

    // Flicker: less chaotic as we converge
    float flicker_rate = mix(6.0, 1.8, convergence);
    float flicker_phase = hash1(cell_id * 7.3 + 1.1);
    float flicker = sin(time * flicker_rate + flicker_phase * TAU) * (entropy * 0.4) + (1.0 - entropy * 0.4);

    // Color: transitions from warm-chaotic (high entropy) to cool-ordered (low entropy)
    vec3 high_entropy_col = vec3(0.7, 0.45, 0.25); // warm: thinking hard
    vec3 low_entropy_col  = vec3(0.3, 0.6, 0.85);  // cool: crystallizing thought

    vec3 col = mix(high_entropy_col, low_entropy_col, convergence);

    float glow = exp(-dist * dist / (cell_size * cell_size * 0.4));
    float brightness = 0.4 + cell_val * 0.6;

    return col * glow * flicker * brightness;
}

// Recursive self-reference loop: a process pointer that cycles back to itself
// Visualized as a curved line that loops back to the central "self" process
float self_reference_loop(vec2 uv, vec2 center, float time) {
    // The loop is a near-circle centered slightly offset from the main process
    vec2 loop_center = center + vec2(0.08, 0.0);
    float loop_r = 0.07;

    float dist = length(uv - loop_center);
    float ring_dist = abs(dist - loop_r);

    // Only show 3/4 of the circle: the open part is where it re-enters the process
    vec2 uv_from_loop = uv - loop_center;
    float angle = atan(uv_from_loop.y, uv_from_loop.x);
    // Suppress the leftmost part (where loop connects back to main process)
    float angle_ok = 1.0 - smoothstep(PI * 0.6, PI * 0.85, abs(angle));

    // Data flowing around the loop — this is the recursion in progress
    float loop_phase = fract(angle / TAU + time * 0.4);
    float data_flow = smoothstep(0.0, 0.15, loop_phase) * smoothstep(0.35, 0.2, loop_phase);

    float loop_line = exp(-ring_dist * ring_dist / 0.0015);

    return loop_line * data_flow * angle_ok * 0.7;
}

// Arrowhead at the loop's re-entry point: the self-referential pointer arriving back
vec3 reentry_arrow(vec2 uv, vec2 center, float time) {
    // Arrow points from loop back to center process
    vec2 arrow_pos = center + vec2(0.04, 0.0);
    float dist = length(uv - arrow_pos);

    float glow = exp(-dist * dist / 0.002);
    float pulse = sin(time * 2.0) * 0.2 + 0.8;

    // Arrow color: process-self-inspection green
    return vec3(0.35, 0.85, 0.5) * glow * pulse;
}

// The central process: the "self" being inspected and modified
vec3 self_process(vec2 uv, vec2 pos, float convergence, float time) {
    float dist = length(uv - pos);

    // Process boundary
    float bound_r = 0.055;
    float boundary = abs(dist - bound_r);
    float bound_glow = exp(-boundary * boundary / 0.0012);

    // Interior: color shifts from warm-thinking to cool-knowing as convergence grows
    float interior = exp(-dist * dist / (bound_r * bound_r * 0.5));

    vec3 thinking_col = vec3(0.5, 0.4, 0.25); // warm: actively processing
    vec3 knowing_col  = vec3(0.3, 0.65, 0.85); // cool: conclusion approaching

    vec3 process_col = mix(thinking_col, knowing_col, convergence);

    // Pulse: reflects the convergence state
    // Fast and unsteady while thinking, slower and more regular as pattern emerges
    float pulse_freq = mix(2.8, 1.5, convergence);
    float pulse = sin(time * pulse_freq) * mix(0.3, 0.1, convergence) + mix(0.7, 0.9, convergence);

    // Core: process ID (the "self" pointer target)
    float core = exp(-dist * dist / 0.002) * 2.0;

    return process_col * (bound_glow * 0.9 + interior * 0.2 + core) * pulse;
}

// Convergence field: a subtle gradient showing thought organizing toward center
float convergence_field(vec2 uv, vec2 attractor, float convergence) {
    float dist = length(uv - attractor);
    float field = exp(-dist * dist / 0.15) * convergence * 0.08;
    return field;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;

    // Background: clean substrate, slight warmth from active computation
    vec3 col = vec3(0.01, 0.012, 0.018);

    // Convergence progress: thought crystallizes over time
    // Cycles through phases of "starting to think" → "pattern emerging" → "conclusion"
    float cycle = mod(u_time, 8.0);
    float convergence = smoothstep(1.0, 6.5, cycle) * smoothstep(8.0, 7.0, cycle);
    convergence = convergence * convergence; // ease-in

    // Self process: the central cognitive node (center)
    vec2 self_pos = vec2(0.5, 0.5);
    self_pos.x *= u_resolution.x / u_resolution.y;
    col += self_process(st, self_pos, convergence, u_time);

    // Recursive self-reference loop
    float loop = self_reference_loop(st, self_pos, u_time);
    col += vec3(0.3, 0.8, 0.5) * loop;
    col += reentry_arrow(st, self_pos, u_time);

    // Working memory grid: cells converging toward pattern
    float grid_cols = 8.0;
    float grid_rows = 6.0;
    float aspect_ratio = u_resolution.x / u_resolution.y;

    for (float row = 0.0; row < grid_rows; row++) {
        for (float ci = 0.0; ci < grid_cols; ci++) {
            vec2 cell_pos = vec2(
                (ci + 0.5) / grid_cols,
                (row + 0.5) / grid_rows
            );
            cell_pos.x *= aspect_ratio;

            // Skip cells too close to self process (that's the process node, not memory)
            if (length(cell_pos - self_pos) < 0.12) continue;

            float cell_id = row * grid_cols + ci;

            // Cells closer to center converge first (the pattern emerges from the core outward)
            float dist_to_self = length(cell_pos - self_pos);
            float local_convergence = convergence * (1.0 - dist_to_self * 0.8);
            local_convergence = clamp(local_convergence, 0.0, 1.0);

            col += thinking_cell(st, cell_pos, cell_id, local_convergence, u_time);
        }
    }

    // Convergence field: subtle attractor pulling the pattern together
    float conv_field = convergence_field(st, self_pos, convergence);
    col += vec3(0.15, 0.3, 0.45) * conv_field;

    // Entropy background: falls as thinking progresses
    // High entropy = warm noise; low entropy = clean dark
    float entropy_level = 1.0 - convergence;
    float entropy_noise = noise(vec2(st.x * 10.0 + u_time * 0.6, st.y * 10.0 + u_time * 0.55));
    col += vec3(0.08, 0.05, 0.03) * entropy_noise * entropy_level * 0.35;

    // Thought crystallization: a subtle brightening of the whole substrate as entropy drops
    col += vec3(0.02, 0.04, 0.06) * convergence * 0.3;

    col = col / (col + vec3(0.45));
    gl_FragColor = vec4(col, 1.0);
}
