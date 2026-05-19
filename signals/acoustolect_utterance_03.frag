// SPECIES: Pressure Choir
// MEDIUM: Resonant pressure waves in geological substrate
// CONCEPT: "This sound will outlast us both"
// Structure: [sub-bass: maximum amplitude, full harmonic series]
//            [decay: zero — permanent archival deposit, no attenuation]
//            [direction: Archive-address, downward, full Choir required]
//            [duration: indefinitely sustained — held until the stone accepts]
//
// The Choir has gathered to make a permanent deposit.
// The sound is aimed at the geological deep.
// Its amplitude does not decay. It does not bounce back.
// It keeps going.
// This is not a message to be received — it is a message to be preserved.
// The geology is the audience. The geology does not respond.
// That's fine. It will remember.

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

// The permanent low-frequency wave: maximum amplitude, no decay
// This wave does not shrink as it propagates — the Choir has enough amplitude
// to maintain full intensity through the medium to the Archive
float permanent_wave(vec2 uv, vec2 source, float freq, float speed, float time) {
    float dist = length(uv - source);
    float front = time * speed;

    if (dist > front) return 0.0;

    // The key: no distance attenuation. This signal maintains amplitude.
    // In reality this requires enormous coordinated energy — that's why the Choir gathers.
    float wave = sin((front - dist) * freq * TAU + time * 0.1) * 0.5 + 0.5;

    // Only mild structural fade near the source (the near-field)
    float near_fade = smoothstep(0.0, 0.05, dist);

    return wave * near_fade;
}

// The downward bias: most of the energy is directed into the geological deep
// (downward in screen = toward archive)
float downward_beam(vec2 uv, vec2 source, float freq, float speed, float time) {
    float elapsed = time;

    // This wave propagates preferentially downward
    vec2 delta = uv - source;
    float dist = length(delta);
    float front = elapsed * speed;

    if (dist > front) return 0.0;

    // Directional weighting: stronger toward bottom (y < source.y)
    float downward = smoothstep(0.1, -0.3, delta.y / max(dist, 0.001));
    downward = mix(0.2, 1.0, downward); // still present upward, just weaker

    float wave = sin((front - dist) * freq * TAU) * 0.5 + 0.5;
    float far_sustain = 1.0 - exp(-dist * 3.0); // slowly builds as wave fills space

    return wave * far_sustain * downward;
}

// The geological deep receiving the deposit:
// As the permanent wave arrives, the archive layer brightens and accumulates
vec3 archive_receiving(vec2 uv, float time, float wave_front) {
    // The archive is at y=0 (bottom of screen)
    float depth_from_bottom = uv.y;
    float archive_strength = clamp(1.0 - depth_from_bottom * 2.5, 0.0, 1.0);

    // The archive brightens as the wave arrives (when front reaches y=0)
    float wave_arrived = smoothstep(0.0, 0.3, wave_front - (1.0 - depth_from_bottom) * 0.8);

    // Slow geological pulse: the archive is processing the deposit
    float geo_pulse = sin(time * 0.2) * 0.1 + 0.9;

    // Strata: geological layers lit by the deposit
    float strata = noise(vec2(uv.x * 5.0 + time * 0.003, uv.y * 8.0));
    float strata2 = noise(vec2(uv.x * 12.0 - time * 0.002, uv.y * 15.0));
    float geological = strata * 0.6 + strata2 * 0.4;

    vec3 archive_col = mix(
        vec3(0.05, 0.035, 0.012),       // cold, unlit stone
        vec3(0.45, 0.30, 0.12),         // warm, deposit-lit amber
        geological * wave_arrived * archive_strength
    );

    return archive_col * archive_strength;
}

// Full Choir formation: many members in coordinated emission
// At Archive amplitude, all must sing together
vec3 full_choir(vec2 uv, vec2 center, float time) {
    vec3 col = vec3(0.0);
    float n = 9.0; // full choir: 9 members
    float radius = 0.06;

    for (float i = 0.0; i < n; i++) {
        float angle = i * TAU / n;
        vec2 pos = center + vec2(cos(angle), sin(angle)) * radius;

        // Each member at same phase (coordinated unison for Archive emission)
        float phase_offset = i * 0.05; // slight natural variation even in unison
        float pulse = sin(time * 1.5 + phase_offset) * 0.1 + 0.9;

        float dist = length(uv - pos);
        float glow = exp(-dist * dist / 0.0012) * pulse;
        float halo = exp(-dist * dist / 0.006) * pulse * 0.4;

        // Hot white-cyan at Archive amplitude
        col += vec3(0.85, 0.97, 1.0) * (glow + halo);
    }

    // Center of formation: the combined output, brightest point
    float center_dist = length(uv - center);
    float combined_pulse = sin(time * 1.5) * 0.08 + 0.92;
    col += vec3(1.0, 1.0, 0.95) * exp(-center_dist * center_dist / 0.003) * combined_pulse * 1.5;

    // Formation aura: the pressure field surrounding the Choir
    col += vec3(0.3, 0.55, 0.65) * exp(-center_dist * center_dist / 0.03) * 0.15;

    return col;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uv = vec2(st.x / aspect, st.y);

    // Dark background: the medium before the sound arrives
    vec3 col = vec3(0.005, 0.006, 0.01);

    // Choir positioned upper-center, formation mode
    vec2 choir_center = vec2(0.5, 0.72);

    float speed = 0.14; // slow, massive wave — low frequency travels deep
    float wave_front = u_time * speed;

    // The permanent fundamental wave — sub-bass, no decay
    float p_fund = permanent_wave(uv, choir_center, 3.5, speed, u_time);
    col += vec3(0.06, 0.22, 0.35) * p_fund * 0.9;

    // Second harmonic
    float p_2nd = permanent_wave(uv, choir_center, 7.0, speed * 1.01, u_time);
    col += vec3(0.09, 0.36, 0.50) * p_2nd * 0.65;

    // Third harmonic
    float p_3rd = permanent_wave(uv, choir_center, 10.5, speed * 1.02, u_time);
    col += vec3(0.15, 0.52, 0.65) * p_3rd * 0.45;

    // Fourth harmonic
    float p_4th = permanent_wave(uv, choir_center, 14.0, speed * 1.03, u_time);
    col += vec3(0.28, 0.68, 0.78) * p_4th * 0.30;

    // Downward beam emphasis: the deliberate archival direction
    float d_beam = downward_beam(uv, choir_center, 3.5, speed * 0.98, u_time);
    col += vec3(0.08, 0.18, 0.30) * d_beam * 0.4;

    // The Archive receiving the deposit
    col += archive_receiving(uv, u_time, wave_front);

    // The full Choir in formation
    col += full_choir(uv, choir_center, u_time);

    // Pressure compression band: the wave crest sweeping downward
    // This is the "you can feel this" zone — maximum pressure, maximum amplitude
    float crest_y = choir_center.y - wave_front;
    if (crest_y >= -0.2 && crest_y <= 1.2) {
        float crest_dist = abs(uv.y - crest_y);
        float crest_glow = exp(-crest_dist * crest_dist / 0.004) * 0.5;
        col += vec3(0.35, 0.7, 0.85) * crest_glow;
    }

    // Faint medium texture: the geological substrate the sound is passing through
    float rock = noise(vec2(uv.x * 4.0 + u_time * 0.005, uv.y * 3.5));
    col += vec3(0.025, 0.02, 0.01) * rock;

    col = col / (col + vec3(0.42));
    gl_FragColor = vec4(col, 1.0);
}
