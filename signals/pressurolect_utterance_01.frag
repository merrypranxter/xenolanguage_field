// SPECIES: Pressure Singer
// MEDIUM: Mechanical substrate vibration
// CONCEPT: "The wall is thick here"
// Structure: [fundamental: low-medium frequency] + [transient harmonic: spatial-probe]
//            entrained to [resonance-return: delayed, attenuated]
//            [standing wave: amplitude-by-substrate-density]
//
// The pressure_singer emits a navigational probe pulse at high frequency.
// The substrate returns an echo — attenuated, delayed, arriving from one side.
// The interference between outgoing and incoming waves forms a standing node
// near the dense region. The node frequency is lower than the probe (heavy substrate).
// Color encodes pressure: dark blue = rarefaction, bright yellow/white = compression.

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

// Outgoing probe pulse: high-frequency navigational transient
// Expands as concentric rings from the singer's position
float probe_wave(vec2 uv, vec2 src, float freq, float t) {
    float r = length(uv - src);
    // Propagation front moves outward
    float front = t * 0.35;
    // Gaussian envelope around the propagation front
    float envelope = exp(-pow(r - front, 2.0) / 0.008);
    // High-frequency oscillation
    float wave = sin(r * freq - t * freq * 1.1);
    // Amplitude decays with distance (geometric spreading)
    float spreading = 1.0 / max(r * 8.0 + 0.5, 1.0);
    return envelope * wave * spreading;
}

// Echo return: the probe reflected off the dense wall on the right side
// Arrives later, from the right, reduced amplitude (absorbed by dense substrate)
float echo_wave(vec2 uv, vec2 wall_src, float freq, float t, float delay, float attenuation) {
    float r = length(uv - wall_src);
    float front = max(0.0, t - delay) * 0.35;
    float envelope = exp(-pow(r - front, 2.0) / 0.012);
    // Slightly detuned: the wall shifts phase on reflection
    float wave = sin(r * freq * 0.97 - (t - delay) * freq * 1.05);
    float spreading = 1.0 / max(r * 10.0 + 0.5, 1.0);
    return envelope * wave * spreading * attenuation;
}

// Standing wave: the low-frequency fundamental that forms near the dense region
// This is the "reading" — the singer's interpretation of the reflection data
// Lower frequency = denser/thicker substrate
float standing_wave(vec2 uv, vec2 node_center, float fund_freq, float t) {
    float r = length(uv - node_center);
    // Standing wave: two counter-propagating waves form nodes and antinodes
    float wave_a = sin(r * fund_freq * 14.0 - t * fund_freq * 0.8);
    float wave_b = sin(r * fund_freq * 14.0 + t * fund_freq * 0.8);
    float standing = (wave_a + wave_b) * 0.5;
    // Spatial envelope: concentrated near the node center
    float spatial = exp(-r * r / 0.06);
    return standing * spatial;
}

// Dense wall region: slight visual density on the right side of field
float dense_region(vec2 uv) {
    // Right side — the "thick wall"
    float wall_x = 0.78;
    float dist = uv.x - wall_x;
    if (dist < 0.0) return 0.0;
    float density = 1.0 - exp(-dist * 12.0);
    // Add slight noise texture (substrate heterogeneity)
    float tex = noise(uv * 15.0) * 0.3;
    return density * (0.7 + tex);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;

    float aspect = u_resolution.x / u_resolution.y;

    // Singer position: left-center
    vec2 singer = vec2(0.22, 0.5);
    // Wall reflection origin (virtual source behind the wall)
    vec2 wall_src = vec2(1.05, 0.5);
    // Standing wave node (where probe and echo form constructive interference)
    vec2 node_center = vec2(0.66, 0.5);

    // The probe repeats cyclically — the singer pings regularly
    float cycle = mod(u_time * 0.45, 1.0);
    float cycle_t = cycle * 2.2; // how far into this probe cycle we are

    // Outgoing probe: high frequency navigational pulse
    float probe_freq = 28.0;
    float probe = probe_wave(st, singer, probe_freq, cycle_t);

    // Echo return: arrives after travel time delay, reduced amplitude
    float echo_delay = 0.7; // travel time in cycle units
    float echo_att = 0.38;  // dense wall absorbs significant energy
    float echo = echo_wave(st, wall_src, probe_freq, cycle_t, echo_delay, echo_att);

    // Total interference: probe + echo
    float interference = probe + echo;

    // Standing wave reading: the low-frequency fundamental
    // Forms only when echo has returned and singer has integrated it
    float stand_presence = smoothstep(0.5, 0.9, cycle);
    float fund_freq = 0.45; // notably lower than probe — thick wall = low reading frequency
    float standing = standing_wave(st, node_center, fund_freq, u_time) * stand_presence;

    // Dense region visual texture
    float dense = dense_region(st);

    // Color mapping: dark blue = rarefaction, yellow-white = compression
    // This is a physical pressure representation
    vec3 rarefaction_col = vec3(0.02, 0.05, 0.18);
    vec3 ambient_col = vec3(0.04, 0.06, 0.12);
    vec3 compression_col = vec3(0.9, 0.85, 0.4);
    vec3 high_compression_col = vec3(1.0, 1.0, 0.95);

    vec3 col = ambient_col;

    // Add wave pressure as color deviation from ambient
    float total_pressure = interference + standing * 0.6;

    // Positive pressure (compression): toward yellow/white
    float compression = max(0.0, total_pressure);
    // Negative pressure (rarefaction): toward dark blue
    float rarefaction = max(0.0, -total_pressure);

    col += compression_col * compression * 0.7;
    col += high_compression_col * max(0.0, compression - 0.5) * 0.8;
    col -= rarefaction_col * rarefaction * 0.5;
    col = max(col, rarefaction_col * rarefaction);

    // Dense wall region: slightly greenish-grey tint (different substrate material)
    col = mix(col, vec3(0.08, 0.12, 0.1), dense * 0.4);

    // Standing wave nodes: slightly brighter to indicate the "reading"
    float node_glow = exp(-length(st - node_center) * length(st - node_center) / 0.012);
    col += vec3(0.2, 0.3, 0.4) * node_glow * stand_presence * 0.5;

    // Singer position: faint glow
    float singer_glow = exp(-length(st - singer) * length(st - singer) / 0.005);
    col += vec3(0.3, 0.5, 0.4) * singer_glow * 0.6;

    col = col / (col + vec3(0.4));
    gl_FragColor = vec4(col, 1.0);
}
