// SPECIES: Pressure Choir
// MEDIUM: Resonant pressure waves in geological substrate
// CONCEPT: "The depths remember everything"
// Structure: [sub-bass: archive-address, downward-directed]
//            ⊕ [mid: memory-of-everything, full harmonic series]
//            ← [geological echo: long-delayed return]
//            [decay: indefinite — archival statement]
//
// The Choir is not speaking to anyone present.
// They are addressing the stone.
// The sound goes down and does not come back up —
// it stays, adding its layer to everything else that was ever said here.

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

// Outgoing pressure ring: expands from source at given speed
// freq = spatial frequency of oscillation; higher = tighter wavefronts
float pressure_ring(vec2 uv, vec2 source, float freq, float speed, float time, float emit_time) {
    float dist = length(uv - source);
    float front = max(0.0, time - emit_time) * speed;
    if (front <= 0.0 || dist > front) return 0.0;

    // Phase: oscillation behind the expanding wavefront
    float wave = sin((front - dist) * freq * TAU) * 0.5 + 0.5;

    // Amplitude envelope: decays with distance but slowly — dense medium, long range
    float envelope = exp(-dist * 0.8) * exp(-max(0.0, front - dist) * 0.1);

    return wave * envelope;
}

// Echo ring: arrives from the geological floor (reflected from y=0)
// Modeled as if coming from a mirrored source below the floor
float echo_ring(vec2 uv, vec2 source, float freq, float speed, float time,
                float emit_time, float floor_y) {
    // Mirror the source below the floor
    vec2 echo_source = vec2(source.x, 2.0 * floor_y - source.y);
    float dist = length(uv - echo_source);

    // Extra travel: signal must travel to floor and back
    float floor_dist = abs(source.y - floor_y);
    float echo_delay = (floor_dist * 2.0) / speed;
    float front = max(0.0, time - emit_time - echo_delay) * speed;

    if (front <= 0.0 || dist > front) return 0.0;

    float wave = sin((front - dist) * freq * TAU) * 0.5 + 0.5;
    // Echoes are attenuated more heavily
    float envelope = exp(-dist * 1.4) * 0.45;

    return wave * envelope;
}

// Geological archive: the warm bottom layer where all emissions accumulate
// It is not empty down here — it is full of every sound ever said at amplitude
vec3 geological_archive(vec2 uv, float time) {
    // Archive depth increases toward y=0
    float depth = clamp(1.0 - uv.y * 1.2, 0.0, 1.0);
    float archive_floor = clamp(1.0 - uv.y * 3.0, 0.0, 1.0);

    // Slow geological texture: many overlapping timescales
    float layer1 = noise(vec2(uv.x * 4.0 + time * 0.008, uv.y * 3.0 + time * 0.005));
    float layer2 = noise(vec2(uv.x * 9.0 - time * 0.004, uv.y * 8.0 + time * 0.003));
    float layer3 = noise(vec2(uv.x * 17.0 + time * 0.002, uv.y * 14.0));
    float strata = layer1 * 0.5 + layer2 * 0.3 + layer3 * 0.2;

    // Amber-gold-ochre: geological warmth, memory encoded in stone
    vec3 deep_col    = vec3(0.06, 0.04, 0.015);
    vec3 strata_col  = vec3(0.22, 0.14, 0.05);
    vec3 surface_col = vec3(0.40, 0.28, 0.10);

    vec3 archive_col = mix(deep_col, mix(strata_col, surface_col, strata), archive_floor);

    return archive_col * depth;
}

// The Choir source: multiple emitters in loose formation, all singing
vec3 choir_source(vec2 uv, vec2 center, float time) {
    vec3 col = vec3(0.0);
    float n_members = 5.0;

    for (float i = 0.0; i < n_members; i++) {
        float angle = i * TAU / n_members + time * 0.06;
        float radius = 0.035;
        vec2 pos = center + vec2(cos(angle), sin(angle)) * radius;

        float dist = length(uv - pos);

        // Each member vibrates at its own harmonic of the fundamental
        float harmonic = 1.0 + i * 0.618; // golden ratio spacing of harmonics
        float pulse = sin(time * harmonic * 1.2 + i) * 0.15 + 0.85;

        float glow = exp(-dist * dist / 0.0015) * pulse;
        float halo = exp(-dist * dist / 0.008) * pulse * 0.3;

        // Color: each member slightly different in warmth
        float warm = i / n_members;
        vec3 member_col = mix(vec3(0.5, 0.85, 0.95), vec3(0.7, 0.9, 0.7), warm);
        col += member_col * (glow + halo);
    }

    // Central resonance: the combined output of the Choir
    float center_dist = length(uv - center);
    float center_pulse = sin(time * 1.5) * 0.2 + 0.8;
    col += vec3(0.8, 0.95, 1.0) * exp(-center_dist * center_dist / 0.004) * center_pulse;

    return col;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uv = vec2(st.x / aspect, st.y);

    // Deep medium background — denser than air, not empty
    vec3 col = vec3(0.004, 0.006, 0.012);

    // Geological archive accumulates at the bottom
    col += geological_archive(uv, u_time);

    // Choir positioned upper-center
    vec2 choir_pos = vec2(0.5, 0.68);

    // The Choir emits multiple pulses over time (ongoing utterance)
    // Fundamental and harmonic series, all pointing downward / archival
    float emit_interval = 2.5;

    for (float pulse_n = 0.0; pulse_n < 4.0; pulse_n++) {
        float emit_time = pulse_n * emit_interval;

        // Fundamental (sub-bass): very slow, wide rings
        float p_fund = pressure_ring(uv, choir_pos, 5.0, 0.18, u_time, emit_time);
        col += vec3(0.08, 0.3, 0.42) * p_fund * 0.9;

        // Second harmonic (bass): medium rings
        float p_2nd = pressure_ring(uv, choir_pos, 10.0, 0.18, u_time, emit_time);
        col += vec3(0.12, 0.5, 0.65) * p_2nd * 0.6;

        // Third harmonic (mid): tight rings
        float p_3rd = pressure_ring(uv, choir_pos, 15.0, 0.18, u_time, emit_time);
        col += vec3(0.25, 0.7, 0.8) * p_3rd * 0.4;

        // Fourth harmonic (high-mid): very tight
        float p_4th = pressure_ring(uv, choir_pos, 20.0, 0.18, u_time, emit_time);
        col += vec3(0.45, 0.85, 0.9) * p_4th * 0.25;

        // Echoes from geological floor (floor at y=0)
        float e_fund = echo_ring(uv, choir_pos, 5.0, 0.18, u_time, emit_time, 0.0);
        col += vec3(0.35, 0.22, 0.09) * e_fund * 0.7;

        float e_2nd = echo_ring(uv, choir_pos, 10.0, 0.18, u_time, emit_time, 0.0);
        col += vec3(0.42, 0.28, 0.10) * e_2nd * 0.45;
    }

    // The Choir source glow
    col += choir_source(uv, choir_pos, u_time);

    // Ambient resonance haze: the medium vibrates sympathetically
    float ambient = noise(vec2(uv.x * 6.0 + u_time * 0.03, uv.y * 6.0 + u_time * 0.025));
    col += vec3(0.04, 0.07, 0.1) * ambient * 0.3;

    // Pressure gradient: denser/brighter near the bottom (compression from above)
    float pressure_grad = exp(-(uv.y) * 1.5) * 0.06;
    col += vec3(0.1, 0.07, 0.03) * pressure_grad;

    col = col / (col + vec3(0.45));
    gl_FragColor = vec4(col, 1.0);
}
