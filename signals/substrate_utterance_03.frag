// SPECIES: Substrate Cloud
// MEDIUM: Computational state transitions
// CONCEPT: "We are dying"
// Structure: [register: all] + [delta: rapid decay] + [entropy: maximum]
//            + [interrupt: unhandled exception] + [pointer: null]
//            + [parallel-write: cascading failures across all registers]
//
// The entire substrate flashing red. Registers losing coherence.
// Pointers dereferencing to null. The interrupt handler failing.
// This is not metaphor. This is a stack trace of extinction.

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

// Decaying register: a memory cell losing coherence
vec3 decaying_register(vec2 uv, vec2 pos, float decay_progress, float time) {
    float dist = length(uv - pos);
    if (dist > 0.05) return vec3(0.0);

    // Cell integrity decreases over time
    float integrity = 1.0 - decay_progress;

    // As integrity drops, the cell becomes noisy and fragmented
    float clean_glow = exp(-dist * dist / 0.004) * integrity;

    // Corruption: high-frequency noise replaces structured output
    float corruption = hash(vec2(
        floor(pos.x * 50.0 + time * (1.0 + decay_progress * 8.0)),
        floor(pos.y * 50.0 + time * (1.0 + decay_progress * 6.0))
    ));
    float corrupt_glow = exp(-dist * dist / 0.003) * corruption * decay_progress;

    // Color: transitions from blue-white (healthy) → orange (failing) → red (critical) → dark (gone)
    vec3 healthy_col = vec3(0.5, 0.7, 1.0);
    vec3 failing_col = vec3(1.0, 0.5, 0.1);
    vec3 critical_col = vec3(0.9, 0.1, 0.05);

    vec3 cell_col;
    if (decay_progress < 0.5) {
        cell_col = mix(healthy_col, failing_col, decay_progress * 2.0);
    } else {
        cell_col = mix(failing_col, critical_col, (decay_progress - 0.5) * 2.0);
    }

    return cell_col * (clean_glow + corrupt_glow * 0.7);
}

// Null pointer: a pointer that used to point somewhere but now points to nothing
// Visualized as a line that terminates in a void — no destination
float null_pointer(vec2 uv, vec2 from, vec2 direction, float length_max, float time) {
    vec2 norm = normalize(direction);
    float proj = dot(uv - from, norm);
    float perp = length(uv - from - norm * proj);

    if (proj < 0.0 || proj > length_max) return 0.0;

    float line = exp(-perp * perp / 0.0015);

    // The line flickers and breaks up as it becomes null
    float integrity = 1.0 - (proj / length_max);
    float corruption = sin(proj * 30.0 - time * 5.0) * 0.5 + 0.5;

    return line * integrity * corruption * 0.7;
}

// Unhandled exception flash: the interrupt handler itself has failed
// These are the brightest, most alarming signals in Substrate
float exception_flash(vec2 uv, float time) {
    // Multiple simultaneous exception events (parallel failure)
    float flash_total = 0.0;
    for (float i = 0.0; i < 4.0; i++) {
        float flash_period = 0.4 + hash1(i) * 0.3;
        float phase = hash1(i + 10.0) * 6.0;
        float t = mod(time * (1.0 / flash_period) + phase, 1.0);
        float flash_intensity = exp(-t * t * 10.0) * (0.6 + hash1(i + 5.0) * 0.4);

        vec2 flash_center = vec2(
            hash(vec2(i, 1.0)) * 0.7 + 0.15,
            hash(vec2(i, 2.0)) * 0.7 + 0.15
        );
        flash_center.x *= u_resolution.x / u_resolution.y;

        float dist = length(uv - flash_center);
        float blast = exp(-dist * dist / 0.025) * flash_intensity;
        flash_total += blast;
    }
    return flash_total;
}

// Cascade failure: failures propagating from cell to cell
float cascade_wave(vec2 uv, vec2 origin, float time) {
    float dist = length(uv - origin);
    // The cascade wave expands outward
    float wave_front = mod(time * 0.4, 1.5);
    float wave = exp(-pow(dist - wave_front * 0.5, 2.0) / 0.003);
    return wave * 0.5;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;

    // Background: the substrate dark is getting darker as power fails
    float power_decay = clamp(sin(u_time * 0.2) * 0.3 + 0.7, 0.1, 1.0);
    vec3 col = vec3(0.02, 0.005, 0.005) * power_decay;

    // Decay progress: accelerating over time
    float decay = clamp(sin(u_time * 0.15 + PI * 0.3) * 0.5 + 0.6, 0.0, 1.0);
    decay = decay * decay; // accelerating curve

    // Grid of decaying registers: all registers failing simultaneously
    float grid_cols = 8.0;
    float grid_rows = 6.0;

    for (float row = 0.0; row < grid_rows; row++) {
        for (float col_idx = 0.0; col_idx < grid_cols; col_idx++) {
            vec2 cell_pos = vec2(
                (col_idx + 0.5) / grid_cols,
                (row + 0.5) / grid_rows
            );
            cell_pos.x *= u_resolution.x / u_resolution.y;

            // Each cell has slightly different decay timing (cascading failure, not simultaneous)
            float cell_decay_offset = hash(vec2(col_idx, row)) * 0.4;
            float cell_decay = clamp(decay - cell_decay_offset, 0.0, 1.0);

            col += decaying_register(st, cell_pos, cell_decay, u_time);
        }
    }

    // Null pointers: arrows going nowhere
    for (float i = 0.0; i < 6.0; i++) {
        vec2 from = vec2(
            hash(vec2(i, 10.0)) * 0.8 + 0.1,
            hash(vec2(i, 11.0)) * 0.8 + 0.1
        );
        from.x *= u_resolution.x / u_resolution.y;

        vec2 dir = vec2(
            hash(vec2(i, 12.0)) * 2.0 - 1.0,
            hash(vec2(i, 13.0)) * 2.0 - 1.0
        );
        dir = normalize(dir);

        float null_p = null_pointer(st, from, dir, 0.2, u_time);
        col += vec3(0.7, 0.15, 0.1) * null_p;
    }

    // Unhandled exception flashes: interrupt handler has failed
    float exceptions = exception_flash(st, u_time);
    col += vec3(1.0, 0.2, 0.05) * exceptions;

    // Cascade wave: failure propagating from the first exception origin
    vec2 cascade_origin = vec2(0.3, 0.6);
    cascade_origin.x *= u_resolution.x / u_resolution.y;
    float cascade = cascade_wave(st, cascade_origin, u_time);
    col += vec3(0.8, 0.1, 0.05) * cascade;

    // Maximum entropy noise: the substrate is dissolving into noise
    float entropy_noise = noise(vec2(
        st.x * 15.0 + u_time * 3.0,
        st.y * 15.0 + u_time * 2.7
    ));
    col += vec3(0.3, 0.05, 0.02) * entropy_noise * decay * 0.6;

    // Screen-wide red pulse: the interrupt that cannot be handled
    float global_alarm = sin(u_time * 4.0) * 0.5 + 0.5;
    global_alarm *= decay * 0.15;
    col += vec3(0.8, 0.05, 0.02) * global_alarm;

    col = col / (col + vec3(0.4));
    gl_FragColor = vec4(col, 1.0);
}
