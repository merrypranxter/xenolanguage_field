// SPECIES: Pressure Singer
// MEDIUM: Mechanical substrate vibration
// CONCEPT: "We harmonize" (resonance lock — the most intimate communication)
// Structure: [fundamental: A] ≡ [fundamental: B] → [standing wave: shared, maximum amplitude]
//            [harmonic cascade: joint — overtones appear at combined series]
//            [resonance lock: phase-coherent, sustained]
//
// Two pressure_singers begin at slightly different frequencies.
// They slowly converge. The beat between them slows to zero.
// When they lock: a shared standing wave of maximum amplitude forms between them.
// Each singer has a base color (cool blue, warm amber).
// The shared region glows white-gold: the emergent combined signal.
// Overtones appear at joint harmonic intervals after the lock.

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

// Convergence progress: 0 = fully separated, 1 = fully locked
// The convergence takes some time, then locks permanently
float convergence_progress(float t) {
    float lock_time = 6.0; // time until lock
    float progress = clamp(t / lock_time, 0.0, 1.0);
    // Ease in: slow approach, then snap to lock
    return progress * progress * (3.0 - 2.0 * progress);
}

// Frequency of singer A: starts slightly lower, converges upward to locked frequency
float freq_A(float t) {
    float base = 12.0;
    float diff = 1.4; // initial frequency difference
    float conv = convergence_progress(t);
    return base - diff * (1.0 - conv);
}

// Frequency of singer B: starts slightly higher, converges downward to locked frequency
float freq_B(float t) {
    float base = 12.0;
    float diff = 1.4;
    float conv = convergence_progress(t);
    return base + diff * (1.0 - conv);
}

// Standing wave emanating from a source position
// Returns the wave field value (positive = compression, negative = rarefaction)
float singer_wave(vec2 uv, vec2 src, float freq, float t) {
    float r = length(uv - src);
    // Standing wave: outgoing + reflected
    float wave_out = sin(r * freq - t * freq * 0.9);
    float wave_in  = sin(r * freq + t * freq * 0.9);
    float standing = (wave_out + wave_in) * 0.5;
    // Amplitude decreases with distance (each singer's individual field)
    float spatial = exp(-r * r / 0.12);
    return standing * spatial;
}

// Joint harmonic overtone at integer ratio of the locked frequency
// Only appears fully after lock
float joint_harmonic(vec2 uv, vec2 midpoint, float harmonic_n, float locked_freq, float t, float lock_progress) {
    float r = length(uv - midpoint);
    float freq = locked_freq * harmonic_n;
    float wave_a = sin(r * freq - t * freq * 0.85);
    float wave_b = sin(r * freq + t * freq * 0.85);
    float standing = (wave_a + wave_b) * 0.5;
    float spatial = exp(-r * r / (0.08 / harmonic_n)); // higher harmonics are more localized
    // Harmonics fade in as lock completes
    float harmonic_presence = lock_progress * lock_progress;
    return standing * spatial * harmonic_presence * (1.0 / harmonic_n);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;
    float aspect = u_resolution.x / u_resolution.y;

    // The two singers
    vec2 singer_A = vec2(0.22, 0.5);
    vec2 singer_B = vec2(0.78 * aspect, 0.5);
    vec2 midpoint = (singer_A + singer_B) * 0.5;

    float conv = convergence_progress(u_time);
    float fA = freq_A(u_time);
    float fB = freq_B(u_time);
    float locked_freq = 12.0;

    // Individual wave fields
    float waveA = singer_wave(st, singer_A, fA, u_time);
    float waveB = singer_wave(st, singer_B, fB, u_time);

    // Combined interference: sum of both fields
    float combined = waveA + waveB;

    // Beat frequency: how fast the interference pattern oscillates
    // When beat approaches zero, we're at lock
    float beat_freq = abs(fA - fB);
    float beat_envelope = sin(u_time * beat_freq * 0.8); // the visible beat oscillation

    // Shared standing wave: forms between them at lock
    // At full convergence, the two waves are phase-coherent and form nodal lines
    float shared_field = 0.0;
    if (conv > 0.3) {
        float r_mid = length(st - midpoint);
        // The shared standing wave: much larger amplitude due to constructive interference
        float shared_wave_a = sin(r_mid * locked_freq - u_time * locked_freq * 0.9);
        float shared_wave_b = sin(r_mid * locked_freq + u_time * locked_freq * 0.9);
        float shared_standing = (shared_wave_a + shared_wave_b) * 0.5;
        float shared_spatial = exp(-r_mid * r_mid / 0.18); // extends between singers
        float lock_amplitude = (conv - 0.3) / 0.7; // grows as we lock
        shared_field = shared_standing * shared_spatial * lock_amplitude * 1.8;
    }

    // Joint harmonics cascade: appear after full lock
    float h2 = joint_harmonic(st, midpoint, 2.0, locked_freq, u_time, conv);
    float h3 = joint_harmonic(st, midpoint, 3.0, locked_freq, u_time, conv);
    float h4 = joint_harmonic(st, midpoint, 4.0, locked_freq, u_time, conv);

    // Color: Singer A = cool blue, Singer B = warm amber, shared zone = white-gold
    vec3 col_A = vec3(0.15, 0.45, 0.85); // cool blue
    vec3 col_B = vec3(0.85, 0.55, 0.15); // warm amber
    vec3 col_shared = vec3(1.0, 0.95, 0.75); // white-gold for the shared standing wave
    vec3 col_harmonic = vec3(0.9, 0.85, 0.6); // warm for the joint overtones

    vec3 col = vec3(0.01, 0.01, 0.015);

    // Singer A field contribution
    float comprA = max(0.0, waveA);
    float rarA = max(0.0, -waveA);
    col += col_A * comprA * 0.6;
    col += vec3(0.02, 0.05, 0.14) * rarA * 0.3;

    // Singer B field contribution
    float comprB = max(0.0, waveB);
    float rarB = max(0.0, -waveB);
    col += col_B * comprB * 0.6;
    col += vec3(0.14, 0.07, 0.02) * rarB * 0.3;

    // Beat: rapid oscillation before lock — makes the area between them shimmer
    float beat_region = exp(-pow(length(st - midpoint), 2.0) / 0.1);
    col += vec3(0.5, 0.45, 0.5) * abs(beat_envelope) * beat_region * (1.0 - conv) * 0.3;

    // Shared standing wave: the constructive interference region
    float shared_compr = max(0.0, shared_field);
    float shared_raref = max(0.0, -shared_field);
    col += col_shared * shared_compr * 0.85;
    col += vec3(0.05, 0.04, 0.02) * shared_raref * 0.4;

    // Joint harmonics
    float harmonic_total = abs(h2) + abs(h3) + abs(h4);
    col += col_harmonic * harmonic_total * 0.45;

    // Singer node glows
    float glowA = exp(-length(st - singer_A) * length(st - singer_A) / 0.006);
    float glowB = exp(-length(st - singer_B) * length(st - singer_B) / 0.006);
    // Nodes pulse toward the same phase as they lock
    float pulse_A = 0.7 + sin(u_time * fA) * 0.3;
    float pulse_B = 0.7 + sin(u_time * fB) * 0.3;
    col += col_A * glowA * 0.8 * pulse_A;
    col += col_B * glowB * 0.8 * pulse_B;

    // At full lock: the node glows merge toward white
    col += col_shared * glowA * conv * 0.4;
    col += col_shared * glowB * conv * 0.4;

    col = col / (col + vec3(0.4));
    gl_FragColor = vec4(col, 1.0);
}
