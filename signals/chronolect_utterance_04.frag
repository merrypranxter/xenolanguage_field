// SPECIES: Temporal Swarm
// MEDIUM: Temporal interference field
// CONCEPT: "Someone just died"
// Structure: [deceased's phase signature: full harmonic series, was sharp]
//            + [decay: continuous broadening, amplitude loss, frequency drift]
//            + [entrained nodes: disrupted, flickering]
//            + [grief: surviving nodes shift past-weighted]
//            + [temporal register: all — the dead speak briefly before silence]
//
// In Chronolect, death is not a discrete event.
// The dead member's phase signature persists in the temporal field —
// it was real, it shaped the field's structure, it cannot simply stop.
// But it broadens. It drifts. The sharp certainty of a living signal
// becomes a diffuse uncertainty, spreading into noise.
// The swarm is still entrained to it. Their lines still point there.
// They are still expecting a signal that is no longer sharp enough to decode.
// This is grief in a language where time is a field:
// the person is still technically present, but they are becoming past,
// and past is becoming noise.

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

// The decaying phase signature of the deceased
// Once it was sharp — a bright, coherent ring. Now it spreads.
vec3 decaying_signature(vec2 uv, vec2 center, float time) {
    float dist = length(uv - center);

    // Decay progress: the signature has been decaying for a while
    // Cycle slowly to show ongoing decay state, not the moment of death
    float decay = clamp(sin(time * 0.12) * 0.4 + 0.6, 0.1, 0.95);
    decay = decay * decay; // accelerating curve

    // Envelope width: broadens as coherence decays
    // Was sharp (0.003), now broad (0.015 + decay * 0.06)
    float sigma = 0.004 + decay * 0.08;

    // Three rings: past (innermost), present (middle), future (outer)
    // The dead's signature occupies all temporal registers — that is the horror of it
    vec3 col = vec3(0.0);

    for (float r = 1.0; r <= 3.0; r++) {
        float ring_r = r * 0.075;
        float ring_dist = abs(dist - ring_r);
        float ring = exp(-ring_dist * ring_dist / (sigma * sigma));

        // Frequency drift: the signal is losing its phase lock
        float drift = noise(vec2(dist * 5.0, time * 0.3 + r * 2.7)) * decay * 0.5;
        float phase = sin(time * 1.8 + drift * TAU + r * PI * 0.5) * 0.5 + 0.5;

        // Was warm (living) — now cold (dying) — approaching grey noise
        vec3 living_col = mix(
            vec3(0.7, 0.4, 0.2),   // past (warm)
            mix(vec3(0.4, 0.8, 0.5), vec3(0.2, 0.4, 0.9), (r - 1.0) / 2.0) // present/future
        , clamp((r - 1.0) / 2.0, 0.0, 1.0));
        vec3 dying_col = vec3(0.25, 0.22, 0.28); // grey-violet: the color of phase noise

        vec3 ring_col = mix(living_col, dying_col, decay);
        col += ring_col * ring * phase * (1.0 - decay * 0.7);
    }

    // Core: was brilliant — now faint
    float core_sigma = 0.003 + decay * 0.02;
    float core_glow = exp(-dist * dist / (core_sigma * core_sigma)) * (1.0 - decay * 0.85);
    col += vec3(0.6, 0.55, 0.5) * core_glow;

    return col;
}

// Surviving swarm nodes: grief-shifted toward past register
// They are still entrained to where the dead node was — their lines still point there
vec3 grief_node(vec2 uv, vec2 pos, float phase, float entrained_to_dead,
                float time, float node_id) {
    float dist = length(uv - pos);

    // All grief-shifted nodes are past-weighted: warm red-gold
    float normal_hue = phase;
    float grief_hue = phase * 0.3; // pulled toward 0 (past)
    float actual_hue = mix(normal_hue, grief_hue, entrained_to_dead);

    vec3 past_col = vec3(0.65, 0.35, 0.2);
    vec3 present_col = vec3(0.2, 0.65, 0.4);
    vec3 future_col = vec3(0.2, 0.35, 0.85);
    vec3 col = mix(mix(past_col, present_col, smoothstep(0.0, 0.5, actual_hue)),
                   future_col, smoothstep(0.5, 1.0, actual_hue));

    // Coherence reduced: grief disrupts phase lock
    float coherence = 0.85 - entrained_to_dead * 0.45;

    // Disrupted pulse: tries to lock to the dead signal but can't
    float dead_phase = time * 1.8; // what the dead signal's frequency was
    float node_drift = hash1(node_id) * 0.4;
    float pulse = sin(dead_phase + node_drift) * 0.35 + 0.65;

    float sigma = 0.012 + (1.0 - coherence) * 0.025;
    float glow = exp(-dist * dist / (sigma * sigma)) * coherence;

    return col * glow * pulse;
}

// Entrainment lines: still pointing at the dead node, flickering
float grief_entrainment(vec2 uv, vec2 from, vec2 to_dead, float time, float node_id) {
    vec2 dir = to_dead - from;
    float len = length(dir);
    vec2 norm = dir / len;

    float proj = dot(uv - from, norm);
    float perp = abs(dot(uv - from, vec2(-norm.y, norm.x)));

    if (proj < 0.0 || proj > len) return 0.0;

    float line = exp(-perp * perp / 0.0018);

    // The line flickers: the dead signal is no longer coherent enough to maintain entrainment
    float flicker_rate = 2.5 + hash1(node_id) * 3.0;
    float phase_noise = noise(vec2(proj * 4.0, time * 0.5 + node_id));
    float flicker = sin(time * flicker_rate + phase_noise * TAU) * 0.4 + 0.6;
    flicker *= smoothstep(1.0, 0.6, proj / len); // fades as it approaches the dead node

    return line * flicker * 0.5;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;

    vec3 col = vec3(0.008, 0.007, 0.01);

    // The dead node's position: center-right
    vec2 dead_pos = vec2(0.62, 0.52);

    // Decaying phase signature of the deceased
    col += decaying_signature(st, dead_pos, u_time);

    // Diffuse phase noise spreading from the dead node:
    // its signal is becoming indistinguishable from background
    float phase_noise_field = noise(vec2(
        (st.x - dead_pos.x) * 12.0 + u_time * 0.4,
        (st.y - dead_pos.y) * 12.0 + u_time * 0.35
    ));
    float noise_dist = length(st - dead_pos);
    float noise_halo = exp(-noise_dist * noise_dist / 0.05);

    // The decay progress (matched to decaying_signature function)
    float decay = clamp(sin(u_time * 0.12) * 0.4 + 0.6, 0.1, 0.95);
    decay = decay * decay;

    col += vec3(0.12, 0.1, 0.18) * phase_noise_field * noise_halo * decay * 0.4;

    // Surviving nodes: scattered around, all grief-shifted toward past
    float node_data[12];
    // Manually encode: x, y, phase, entrained_strength per node
    vec2 node_positions[6];
    node_positions[0] = vec2(0.2, 0.3);
    node_positions[1] = vec2(0.3, 0.7);
    node_positions[2] = vec2(0.15, 0.55);
    node_positions[3] = vec2(0.45, 0.2);
    node_positions[4] = vec2(0.5, 0.78);
    node_positions[5] = vec2(0.25, 0.48);

    for (float i = 0.0; i < 6.0; i++) {
        vec2 npos = node_positions[int(i)];
        float nphase = hash(vec2(i, 11.0)); // random phase
        float entrain = 0.5 + hash(vec2(i, 13.0)) * 0.4; // how strongly entrained to dead node

        col += grief_node(st, npos, nphase, entrain, u_time, i);

        // Entrainment line to dead node
        float entrain_line = grief_entrainment(st, npos, dead_pos, u_time, i);
        vec3 entrain_col = vec3(0.35, 0.25, 0.35); // grief color: muted purple
        col += entrain_col * entrain_line * entrain;
    }

    // Past-register pull: the whole field is weighted toward memory
    // A subtle warm reddish tint in the bottom-left (past region)
    float past_pull = exp(-length(st - vec2(0.15, 0.25)) * length(st - vec2(0.15, 0.25)) / 0.08);
    col += vec3(0.08, 0.04, 0.02) * past_pull * 0.3;

    // Harmonic decay rings: what's left of the full cascade
    for (float h = 1.0; h <= 4.0; h++) {
        float ring_r = h * 0.12;
        float ring_dist = abs(length(st - dead_pos) - ring_r);
        float sigma_h = 0.003 + decay * 0.015 * h;
        float ring = exp(-ring_dist * ring_dist / (sigma_h * sigma_h));
        // Each harmonic decays at slightly different rate
        float h_decay = clamp(decay + (h - 1.0) * 0.08, 0.0, 1.0);
        col += vec3(0.15, 0.12, 0.2) * ring * (1.0 - h_decay * 0.8) * 0.2;
    }

    col = col / (col + vec3(0.45));
    gl_FragColor = vec4(col, 1.0);
}
