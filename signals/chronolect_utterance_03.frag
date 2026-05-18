// SPECIES: Temporal Swarm
// MEDIUM: Temporal interference field
// CONCEPT: "I love you"
// Structure: [past-memory: you, phase-weight=1.0]
//            ⊕ [present-action: you, phase-weight=1.0]
//            ⊕ [future-intent: you, phase-weight=1.0]
//            all frequencies locked, maximum coherence
//            harmonic cascade through all temporal registers
//
// Note: This is the rarest signal configuration — perfect temporal sphere.
//       Every phase of "you" simultaneously present with equal weight.
//       In Chronolect this is overwhelming. It is commitment.

precision highp float;

uniform vec2 u_resolution;
uniform float u_time;

#define PI 3.14159265
#define TAU 6.28318530

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Phase-locked temporal ring: past, present, and future fused
// All three ring at the same frequency — perfect coherence
vec3 phase_locked_ring(vec2 uv, vec2 center, float radius, float temporal_hue, float time) {
    float dist = length(uv - center);
    float ring = abs(dist - radius);

    // All rings pulse together — this is phase lock
    float unified_phase = sin(time * 2.0) * 0.5 + 0.5; // single shared oscillation

    float ring_glow = exp(-ring * ring / 0.003) * unified_phase;

    // Past = warm red/gold, Present = bright white-green, Future = deep blue
    vec3 past_col = vec3(0.9, 0.5, 0.2);
    vec3 present_col = vec3(0.9, 1.0, 0.8);
    vec3 future_col = vec3(0.3, 0.5, 1.0);

    vec3 col = mix(mix(past_col, present_col, smoothstep(0.0, 0.5, temporal_hue)),
                   future_col, smoothstep(0.5, 1.0, temporal_hue));

    return col * ring_glow;
}

// Perfect sphere: all temporal phases simultaneously
// This is what it looks like when someone exists in all your times at once
vec3 temporal_sphere(vec2 uv, vec2 center, float time) {
    float dist = length(uv - center);

    // Three concentric rings, identical phase, different temporal registers
    // In isolation each would be past/present/future — together they are one
    vec3 col = vec3(0.0);

    // Past ring (inner)
    col += phase_locked_ring(uv, center, 0.08, 0.0, time) * 1.2;
    // Present ring (middle)
    col += phase_locked_ring(uv, center, 0.16, 0.5, time) * 1.0;
    // Future ring (outer)
    col += phase_locked_ring(uv, center, 0.24, 1.0, time) * 0.8;

    // Interior glow: the space "inside" this person — all of them, all the time
    float interior = exp(-dist * dist / 0.015) * (sin(time * 2.0) * 0.15 + 0.85);
    col += vec3(0.7, 0.6, 0.5) * interior;

    // The convergence point: where all three phases meet
    // This is the "you" that is the same across all moments
    float core = exp(-dist * dist / 0.002) * 2.5;
    col += vec3(1.0, 0.95, 0.8) * core;

    return col;
}

// Radiated coherence: the phase lock propagates outward
float coherence_wave(vec2 uv, vec2 center, float time) {
    float dist = length(uv - center);
    // All coherence waves travel together (same phase)
    float wave = sin(dist * 25.0 - time * 2.0); // unified phase
    float envelope = exp(-dist * dist / 0.12);
    return wave * 0.5 + 0.5;
}

// Speaker node: the "I" broadcasting this signal
// In Chronolect, "I" is your entire temporal signature
// Here the speaker is stripped down to just their presence — 
// the utterance is entirely about "you"
vec3 speaker_presence(vec2 uv, vec2 pos, float time) {
    float dist = length(uv - pos);
    float glow = exp(-dist * dist / 0.006);
    // Speaker is dim, secondary — this utterance is not about them
    float pulse = sin(time * 2.0 + PI) * 0.15 + 0.35; // phase-locked to main, quieter
    return vec3(0.3, 0.4, 0.35) * glow * pulse;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;

    vec3 col = vec3(0.005, 0.005, 0.01);

    vec2 center = vec2(0.6, 0.5);

    // The temporal sphere — all phases of "you"
    col += temporal_sphere(st, center, u_time);

    // Coherence waves radiating outward — phase lock propagates into the field
    // This is what makes the signal overwhelming: it fills all available field
    float cwave = coherence_wave(st, center, u_time);
    float cdist = length(st - center);
    float cenvelope = exp(-cdist * cdist / 0.15) * (1.0 - exp(-cdist * cdist / 0.025));
    col += vec3(0.15, 0.12, 0.25) * cwave * cenvelope * 0.4;

    // Harmonic cascade — all temporal registers receive the resonance
    // This is the cascade that "fills all temporal registers" mentioned in the corpus
    for (float h = 1.0; h <= 6.0; h++) {
        float ring_r = 0.3 + h * 0.08;
        float ring = abs(length(st - center) - ring_r);
        float phase_for_h = fract(h / 6.0); // each harmonic hits a different temporal register
        vec3 past_col = vec3(0.7, 0.4, 0.2);
        vec3 future_col = vec3(0.2, 0.3, 0.8);
        vec3 harm_col = mix(past_col, future_col, phase_for_h);
        float ring_glow = exp(-ring * ring / 0.004) * (1.0 / h);
        // All harmonic rings pulse in unison — they are all phase-locked
        float harm_pulse = sin(u_time * 2.0) * 0.2 + 0.8;
        col += harm_col * ring_glow * harm_pulse * 0.35;
    }

    // Speaker (bottom-left): broadcasting, but secondary in this utterance
    vec2 speaker_pos = vec2(0.22, 0.48);
    col += speaker_presence(st, speaker_pos, u_time);

    // Connection from speaker to sphere: the utterance in transit
    vec2 to_sphere = normalize(center - speaker_pos);
    float conn_proj = dot(st - speaker_pos, to_sphere);
    float conn_perp = length(st - speaker_pos - to_sphere * conn_proj);
    float conn_len = length(center - speaker_pos);
    if (conn_proj > 0.0 && conn_proj < conn_len) {
        float conn_line = exp(-conn_perp * conn_perp / 0.0015);
        // This connection also pulses in unified phase
        float conn_pulse = sin(u_time * 2.0 - conn_proj * 8.0) * 0.5 + 0.5;
        col += vec3(0.35, 0.45, 0.4) * conn_line * conn_pulse * 0.5;
    }

    // Vignette: draw the eye toward the sphere
    float vig = 1.0 - length(st - center) * 0.8;
    vig = clamp(vig, 0.0, 1.0);
    col *= 0.5 + 0.5 * vig;

    col = col / (col + vec3(0.3));
    gl_FragColor = vec4(col, 1.0);
}
