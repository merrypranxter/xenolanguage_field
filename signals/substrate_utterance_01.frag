// SPECIES: Substrate Cloud
// MEDIUM: Computational state transitions
// CONCEPT: "I am confused"
// Structure: [register: working-memory] + [delta: oscillating, no convergence]
//            + [entropy: high] + [parallel-write: sensory-input, conflicting values]
//            + [pointer: multiple, unresolved]
//
// Scattered memory writes with no pattern. High entropy.
// Multiple sensory registers firing simultaneously with contradictory values.
// No pointer resolves. The system is in an unstable state.

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

// Memory cell: a single register address being written to
// In Substrate, the visual representation is a grid of cells with state values
vec3 memory_cell(vec2 uv, vec2 cell_pos, float cell_value, float entropy, float time) {
    float dist = length(uv - cell_pos);
    if (dist > 0.04) return vec3(0.0);

    float cell_size = 0.035;

    // Cell glow based on current value (the delta)
    float glow = exp(-dist * dist / (cell_size * cell_size * 0.5));

    // High-entropy cells flicker unpredictably
    float flicker_rate = 4.0 + entropy * 12.0;
    float flicker_phase = hash1(cell_pos.x * 17.3 + cell_pos.y * 31.1);
    float flicker = sin(time * flicker_rate + flicker_phase * TAU) * 0.5 + 0.5;

    // Color: high-entropy = hot, low-entropy = cool
    // Confused state = lots of high-entropy (warm) writes
    vec3 low_entropy_col = vec3(0.2, 0.5, 0.8);  // cool blue: predictable
    vec3 high_entropy_col = vec3(0.9, 0.5, 0.2); // hot orange: chaotic

    vec3 col = mix(low_entropy_col, high_entropy_col, entropy);

    // Cell value modulates brightness
    float brightness = 0.3 + cell_value * 0.7;

    return col * glow * flicker * brightness;
}

// Unresolved pointer: an arrow that goes somewhere but the destination doesn't exist
float unresolved_pointer(vec2 uv, vec2 from, vec2 to_intended, float time) {
    vec2 dir = normalize(to_intended - from);
    float len = length(to_intended - from);

    float proj = dot(uv - from, dir);
    float perp = length(uv - from - dir * proj);

    if (proj < 0.0 || proj > len) return 0.0;

    float arrow_line = exp(-perp * perp / 0.001);

    // Unresolved pointers flicker and don't complete
    float completion = clamp(proj / len, 0.0, 1.0);
    float resolve_flicker = sin(time * 6.0 + proj * 10.0) * 0.5 + 0.5;
    // Pointer fades out before reaching destination (unresolved)
    float fade = exp(-completion * 3.0) * (1.0 - exp(-completion * 0.5));

    return arrow_line * fade * resolve_flicker * 0.6;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;

    vec3 col = vec3(0.01, 0.01, 0.015);

    // Grid of memory cells: working-memory register
    // In confusion, these fire randomly with no pattern
    float grid_cols = 9.0;
    float grid_rows = 7.0;

    for (float row = 0.0; row < grid_rows; row++) {
        for (float col_idx = 0.0; col_idx < grid_cols; col_idx++) {
            vec2 cell_pos = vec2(
                (col_idx + 0.5) / grid_cols,
                (row + 0.5) / grid_rows
            );
            cell_pos.x *= u_resolution.x / u_resolution.y; // aspect correct

            // Random cell value: oscillating with no convergence
            float cell_seed = hash(vec2(col_idx, row));
            float osc_freq = 0.5 + hash(vec2(row, col_idx)) * 4.0;
            float osc_phase = cell_seed * TAU;
            // Multiple overlapping oscillations = no convergence
            float cell_val = sin(u_time * osc_freq + osc_phase) * 0.5 + 0.5;
            cell_val += sin(u_time * osc_freq * 1.7 + osc_phase * 0.6) * 0.3;
            cell_val = fract(cell_val); // high-entropy: just take fractional part

            float entropy = hash(vec2(col_idx * 3.1, row * 2.7));
            // In confused state: most cells have high entropy
            entropy = mix(0.5, 1.0, entropy);

            col += memory_cell(st, cell_pos, cell_val, entropy, u_time);
        }
    }

    // Unresolved pointers: arrows from random cells to nowhere
    for (float i = 0.0; i < 5.0; i++) {
        vec2 from = vec2(
            hash(vec2(i, 0.1)) * 0.8 + 0.1,
            hash(vec2(i, 0.2)) * 0.8 + 0.1
        );
        from.x *= u_resolution.x / u_resolution.y;

        vec2 to = vec2(
            hash(vec2(i, 0.3)) * 0.8 + 0.1,
            hash(vec2(i, 0.4)) * 0.8 + 0.1
        );
        to.x *= u_resolution.x / u_resolution.y;

        float uptr = unresolved_pointer(st, from, to, u_time + i * 1.7);
        col += vec3(0.6, 0.4, 0.2) * uptr;
    }

    // High-entropy noise overlay: the whole substrate is hot, chaotic
    float entropy_field = noise(vec2(st.x * 8.0 + u_time * 0.8, st.y * 8.0 + u_time * 0.7));
    col += vec3(0.15, 0.08, 0.04) * entropy_field * 0.4;

    // Sensory interrupt flashes: competing inputs with contradictory values
    // These appear as bright brief flashes in different areas
    for (float i = 0.0; i < 3.0; i++) {
        float flash_cycle = mod(u_time * 0.7 + i * 2.1, 3.0);
        if (flash_cycle < 0.3) {
            vec2 flash_pos = vec2(
                hash(vec2(i, u_time * 0.1)) * 0.6 + 0.2,
                hash(vec2(i + 0.5, u_time * 0.1)) * 0.6 + 0.2
            );
            flash_pos.x *= u_resolution.x / u_resolution.y;
            float flash_int = (0.3 - flash_cycle) / 0.3;
            float flash_dist = length(st - flash_pos);
            float flash = exp(-flash_dist * flash_dist / 0.015) * flash_int;
            col += vec3(0.8, 0.7, 0.3) * flash;
        }
    }

    col = col / (col + vec3(0.5));
    gl_FragColor = vec4(col, 1.0);
}
