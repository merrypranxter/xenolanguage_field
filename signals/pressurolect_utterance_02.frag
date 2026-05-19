// SPECIES: Pressure Singer
// MEDIUM: Mechanical substrate vibration
// CONCEPT: "I am afraid"
// Structure: [fundamental: disrupted, irregular amplitude] 
//            + [high-frequency harmonics: multiple, uncoordinated]
//            [beat frequency: trembling — fundamental vs. first harmonic]
//            [damping: attempted, failed]
//
// Fear in Pressurolect is broken resonance. The standing wave that constitutes
// identity is disrupted. High-frequency overtones appear uncoordinated and chaotic.
// The normal harmonic series is detuned — the fear response throws harmonics off
// their integer ratios. Attempted damping (trying to be calm) briefly reduces
// amplitude, then the harmonics surge back with increased disorder.
// Colors: cold pressure palette, with harmonic spikes shifting toward red-amber.

precision highp float;

uniform vec2 u_resolution;
uniform float u_time;

#define PI 3.14159265
#define TAU 6.28318530

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float hash1(float x) {
    return fract(sin(x * 127.1) * 43758.5453);
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

// The disrupted standing wave: the singer's identity resonance, normally clean
// but now jittering, irregular, unable to hold steady
float disrupted_standing_wave(vec2 uv, vec2 center, float t) {
    float r = length(uv - center);

    // Normal standing wave: two counter-propagating waves
    // Fear disrupts the fundamental frequency — it wobbles
    float freq_wobble = sin(t * 2.3) * 0.08 + sin(t * 5.1) * 0.04;
    float base_freq = 12.0 + freq_wobble * 12.0;

    float wave_a = sin(r * base_freq - t * 1.8);
    float wave_b = sin(r * base_freq + t * 1.8);
    float standing = (wave_a + wave_b) * 0.5;

    // Irregular amplitude: fear makes the singer's resonance unstable
    float amp_jitter = sin(t * 7.3) * 0.3 + sin(t * 11.7) * 0.2 + sin(t * 3.1) * 0.2;
    float amplitude = 0.5 + amp_jitter;

    // Spatial envelope — slightly off-center due to instability
    float jitter_x = sin(t * 4.7) * 0.015;
    float jitter_y = sin(t * 6.1) * 0.012;
    vec2 shifted = center + vec2(jitter_x, jitter_y);
    float spatial = exp(-length(uv - shifted) * length(uv - shifted) / 0.05);

    return standing * spatial * amplitude;
}

// Detuned overtone: a harmonic at almost-but-not-quite an integer ratio
// These create beats with the fundamental — the "trembling" of fear
float detuned_harmonic(vec2 uv, vec2 center, float harmonic_ratio, float detune, float t, float phase_offset) {
    float r = length(uv - center);
    float freq = 12.0 * harmonic_ratio * (1.0 + detune); // detuned from integer harmonic
    float wave_a = sin(r * freq - t * harmonic_ratio * 1.8 + phase_offset);
    float wave_b = sin(r * freq + t * harmonic_ratio * 1.8 + phase_offset);
    float standing = (wave_a + wave_b) * 0.5;
    float spatial = exp(-r * r / 0.04);
    return standing * spatial;
}

// Chaotic high-frequency overtone: uncoordinated spike
// Appears and disappears, not anchored to the fundamental
float chaotic_overtone(vec2 uv, vec2 center, float seed, float t) {
    // Overtone center drifts slightly
    float dx = hash1(seed * 2.1) * 0.08 - 0.04;
    float dy = hash1(seed * 3.7) * 0.08 - 0.04;
    vec2 ot_center = center + vec2(dx, dy);

    float r = length(uv - ot_center);

    // High frequency, random phase, brief bursts
    float burst_cycle = mod(t * 0.8 + hash1(seed) * TAU, 1.0);
    float burst = exp(-pow(burst_cycle - 0.1, 2.0) / 0.005);

    float freq = 40.0 + hash1(seed * 5.3) * 30.0;
    float wave = sin(r * freq - t * freq * 0.7);
    float spatial = exp(-r * r / 0.008);

    return wave * spatial * burst;
}

// Attempted damping: a brief suppression of amplitude that fails
// The signal briefly quiets, then surges back with extra harmonic noise
float damping_attempt(float t) {
    // Damping attempts happen cyclically
    float cycle = mod(t * 0.35, 1.0);
    // Brief window of reduced amplitude
    float attempt = exp(-pow(cycle - 0.15, 2.0) / 0.003);
    // But then it surges back (failed damping)
    float surge = exp(-pow(cycle - 0.25, 2.0) / 0.004) * 1.4;
    return 1.0 - attempt * 0.7 + surge * 0.5;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;

    // Singer center — slightly off-center (fear displaces even positional stability)
    float center_jitter_x = sin(u_time * 1.3) * 0.02;
    float center_jitter_y = sin(u_time * 1.9) * 0.015;
    vec2 center = vec2(0.5 + center_jitter_x, 0.5 + center_jitter_y);
    center.x *= u_resolution.x / u_resolution.y;

    // Damping modulation
    float damp = damping_attempt(u_time);

    // Background: slightly warmer than normal (physiological fear response)
    vec3 col = vec3(0.03, 0.02, 0.02);

    // Disrupted fundamental standing wave
    float fundamental = disrupted_standing_wave(st, center, u_time);
    float comp_fund = max(0.0, fundamental);
    float raref_fund = max(0.0, -fundamental);

    vec3 fund_col = mix(vec3(0.1, 0.25, 0.5), vec3(0.6, 0.7, 0.9), comp_fund);
    col += fund_col * comp_fund * 0.5 * damp;
    col += vec3(0.02, 0.04, 0.12) * raref_fund * 0.3;

    // Beat between fundamental and first harmonic (the "trembling")
    // Harmonic at 2x fundamental, slightly detuned: creates slow beat oscillation
    float h1 = detuned_harmonic(st, center, 2.0, 0.04, u_time, 0.0);
    float h2 = detuned_harmonic(st, center, 3.0, -0.06, u_time, 1.1);
    float h3 = detuned_harmonic(st, center, 1.5, 0.09, u_time, 2.3); // non-integer: really wrong

    // Beat frequency between fundamental and h1: the visible trembling
    float beat = fundamental * h1; // interference product
    // The beat creates an oscillating color component
    float beat_intensity = abs(beat);

    // Harmonic spikes: shift toward red-amber when high
    float harmonic_energy = abs(h1) + abs(h2) + abs(h3) * 0.7;
    vec3 harmonic_col = mix(vec3(0.5, 0.6, 0.8), vec3(0.85, 0.4, 0.15), min(harmonic_energy, 1.0));
    col += harmonic_col * harmonic_energy * 0.35 * damp;

    // Beat trembling: a rapid amber-red shimmer over the fundamental
    col += vec3(0.7, 0.35, 0.1) * beat_intensity * 0.6;

    // Chaotic high-frequency overtones: uncoordinated spikes
    float chaos_total = 0.0;
    for (float i = 0.0; i < 5.0; i++) {
        float chaos = chaotic_overtone(st, center, i * 1.7 + 0.3, u_time);
        chaos_total += abs(chaos);
        col += vec3(0.8, 0.45, 0.2) * abs(chaos) * 0.5;
    }

    // Surge after failed damping: extra harmonic burst
    float surge = max(0.0, damp - 1.0);
    col += vec3(0.9, 0.5, 0.2) * surge * chaos_total * 0.8;

    // Substrate background: faint noise texture showing medium disturbance
    float substrate = noise(st * 12.0 + u_time * 0.2) * 0.04;
    col += vec3(0.04, 0.05, 0.08) * substrate;

    // Identity glow at center: the struggling standing wave signature
    float identity_glow = exp(-length(st - center) * length(st - center) / 0.01);
    col += vec3(0.3, 0.5, 0.7) * identity_glow * 0.3 * (0.7 + sin(u_time * 8.0) * 0.3);

    col = col / (col + vec3(0.4));
    gl_FragColor = vec4(col, 1.0);
}
