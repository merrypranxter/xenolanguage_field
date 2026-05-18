// SPECIES: Magnetic Fielder
// MEDIUM: Ambient magnetic field topology
// CONCEPT: "I am lost"
// Structure: [field-line: isolated]
//            + [perturbation: weak]
//            + [topology: disconnected from main field]
//            + [duration: sustained, no change]
//
// A single field line, disconnected, with a weak glow.
// No reconnection. No gradient. Just isolation in the void.

precision highp float;

uniform vec2 u_resolution;
uniform float u_time;

#define PI 3.14159265
#define TAU 6.28318530

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
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

// The isolated field line: alone, no reconnections, barely there
// It meanders slightly — even isolated, it responds to ambient field noise
float isolated_line(vec2 uv, float time) {
    // The line runs roughly through the vertical center
    // Tiny drift — it's trying to find something to connect to, but can't
    float slow_drift = sin(time * 0.15) * 0.04;
    float micro_wobble = noise(vec2(uv.y * 3.0, time * 0.1)) * 0.03 - 0.015;

    float line_x = 0.5 + slow_drift + micro_wobble;
    float dist = abs(uv.x - line_x);

    // Very thin, weak glow — low perturbation, low gradient
    float thickness = 0.004;
    float glow_width = 0.03;

    float line_core = exp(-dist * dist / (thickness * thickness));
    float line_glow = exp(-dist * dist / (glow_width * glow_width)) * 0.3;

    // Sustained but weak — this signal has been here a long time, unchanged
    // Slight amplitude breathe: not a pulse (that would imply connection), just
    // the minimum oscillation of a still-living field line
    float breathe = sin(time * 0.4) * 0.05 + 0.95;

    return (line_core + line_glow) * breathe;
}

// Ghost lines: the faint traces of the main field that used to be nearby
// Now disconnected, they've drifted away or faded to near-nothing
float ghost_lines(vec2 uv, float time) {
    float ghost = 0.0;
    for (float i = 0.0; i < 4.0; i++) {
        // Each ghost line is further from center, faded
        float base_x = 0.15 + i * 0.2;
        if (i >= 2.0) base_x = (i - 2.0) * 0.2 + 0.6;

        // Ghosts are very faint — they barely exist
        float fade = hash(vec2(i, 3.7));
        float dist = abs(uv.x - base_x);
        ghost += exp(-dist * dist / 0.0008) * fade * 0.08;
    }
    return ghost;
}

// The void: empty, no field activity
// In Magnetolect, the absence of field activity is as meaningful as its presence
float void_texture(vec2 uv, float time) {
    // Almost nothing here — just the residual noise of deep space
    float residual = noise(vec2(uv.x * 5.0 + time * 0.02, uv.y * 5.0 + time * 0.015));
    return residual * 0.03;
}

// Faint attempt at connection: the line tries to find the main field
// Every so often, a tiny perturbation extends toward the right... and dies
float reaching_perturbation(vec2 uv, float time) {
    // Very slow cycle — this has been happening for a long time
    float cycle = mod(time * 0.1, 1.0);
    if (cycle > 0.5) return 0.0; // only during "reaching" phase

    float reach_progress = cycle * 2.0; // 0 to 1 during reach phase
    float reach_length = reach_progress * 0.25; // how far the reach extends

    // The reach starts from the center of the isolated line, goes right
    float center_x = 0.5 + sin(time * 0.15) * 0.04;
    float reach_y = 0.5; // midpoint of the line (it tries from the center)

    float dist_y = abs(uv.y - reach_y);
    float dist_x = uv.x - center_x;

    if (dist_x < 0.0 || dist_x > reach_length) return 0.0;

    float perp = exp(-dist_y * dist_y / 0.001);
    float fade_envelope = exp(-(dist_x - reach_length * 0.5) * (dist_x - reach_length * 0.5) / 0.005);

    // The reach fades in and then out — hope, then nothing
    float intensity = sin(reach_progress * PI) * 0.25;

    return perp * fade_envelope * intensity;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uv = vec2(st.x / aspect, st.y);

    // Very dark background — the void is almost total
    vec3 col = vec3(0.005, 0.006, 0.01);

    // The void texture: background static
    col += vec3(0.04, 0.05, 0.08) * void_texture(uv, u_time);

    // Ghost field lines: what used to be there, barely present now
    float ghosts = ghost_lines(uv, u_time);
    col += vec3(0.1, 0.15, 0.25) * ghosts;

    // The isolated field line itself: the speaker
    float line = isolated_line(uv, u_time);
    // Cool, slightly desaturated — loss of connection means loss of vitality
    vec3 line_col = vec3(0.45, 0.55, 0.75);
    col += line_col * line;

    // Reaching perturbation: the attempt to reconnect
    float reach = reaching_perturbation(uv, u_time);
    col += vec3(0.5, 0.6, 0.8) * reach;

    // No gradient. No polarity dominance. No reconnection events.
    // This is what silence looks like in Magnetolect.

    // Very faint vignette inward — nothing here at the center either
    // Just... the line.

    col = col / (col + vec3(0.4));
    gl_FragColor = vec4(col, 1.0);
}
