// SPECIES: Void Weaver
// MEDIUM: Chemical concentration gradients in fluid medium
// CONCEPT: "Come here"
// Structure: [gradient-direction: toward-speaker]
//            [primary-emitter: social/affiliation chemical]
//            [concentration: high at center, radially decreasing]
//            [decay: medium — sustained invitation, not a one-time burst]
//
// The speaker is at center. Affiliation chemical released at high concentration.
// Concentration falls off radially — the gradient points inward, toward the speaker.
// To follow the gradient is to approach the speaker. This is the message.
// Diffusion is not perfectly spherical: medium currents create asymmetry.
// The signal pulses slowly (sustained release, not a single burst).
// Color: warm amber-yellow = high concentration, dark = ambient medium.

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

// Fractional Brownian Motion for diffusion-realistic noise
float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    for (int i = 0; i < 4; i++) {
        v += a * noise(p);
        p = p * 2.1 + shift;
        a *= 0.5;
    }
    return v;
}

// Chemical diffusion field: realistic Fickian diffusion approximation
// The concentration falls off as ~1/r with Gaussian diffusion envelope
// Modified by medium currents (asymmetric) and noise (substrate heterogeneity)
float chemical_concentration(vec2 uv, vec2 src, float t) {
    // Distance from source
    vec2 offset = uv - src;

    // Medium current: slow drift in a diagonal direction
    // This creates the asymmetry that makes diffusion non-spherical
    vec2 current_dir = normalize(vec2(0.3, -0.15));
    float current_speed = 0.05;
    // Advection: concentration is stronger downwind (advection displaces the gradient)
    float advection = dot(offset, -current_dir);

    // Diffusion radius: grows slowly with time (sustained release keeps it centered)
    float effective_r = length(offset - current_dir * current_speed * t * 0.3);

    // Core concentration: falls off with distance
    float core = exp(-effective_r * effective_r / 0.06);

    // Sustained pulsing: the speaker keeps releasing
    float pulse = 0.85 + sin(t * 0.6) * 0.15;

    // Edge irregularity from turbulent diffusion (fbm noise)
    float edge_noise = fbm(uv * 4.5 + vec2(t * 0.07, t * 0.05)) * 0.25;
    float edge_dist = effective_r - 0.25;
    float edge_blend = smoothstep(0.0, 0.15, -edge_dist);
    float irregular_edge = edge_blend * (1.0 - edge_noise);

    // Outer halo: very faint trace at larger distances (old signal residue)
    float outer = exp(-effective_r * effective_r / 0.4) * 0.15;

    return (core * pulse + outer) * irregular_edge + outer * 0.3;
}

// Gradient direction visualization: arrows pointing toward concentration maximum
// This is representational — the gradient IS the directional signal
float gradient_arrow(vec2 uv, vec2 src, float scale) {
    // Vector pointing from uv toward src (the gradient direction)
    vec2 to_src = normalize(src - uv);
    vec2 perp = vec2(-to_src.y, to_src.x);

    // Sample concentration at uv and nearby points
    float c_here = chemical_concentration(uv, src, u_time);
    if (c_here < 0.05) return 0.0; // only show arrows where signal is detectable

    // Quantize into arrow grid
    float grid = scale;
    vec2 cell = floor(uv * grid) / grid + vec2(0.5 / grid);
    vec2 cell_to_src = normalize(src - cell);
    vec2 cell_perp = vec2(-cell_to_src.y, cell_to_src.x);

    // Arrow shaft
    vec2 local = (uv - cell) * grid;
    float shaft = abs(dot(local, cell_perp));
    float along = dot(local, cell_to_src);
    float arrow_len = 0.3;
    float arrow_shaft = exp(-shaft * shaft * 80.0) * smoothstep(-arrow_len, arrow_len * 0.5, along) * smoothstep(arrow_len, arrow_len * 0.5, along);

    // Arrowhead
    float head_dist = length(local - cell_to_src * arrow_len);
    float arrowhead = exp(-head_dist * head_dist * 60.0);

    return (arrow_shaft + arrowhead) * 0.25;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;
    float aspect = u_resolution.x / u_resolution.y;

    // Speaker position: slightly off-center (natural)
    vec2 speaker = vec2(0.52 * aspect, 0.51);

    // Chemical concentration field
    float conc = chemical_concentration(st, speaker, u_time);

    // Color palette: amber-yellow = affiliation chemical, dark = void medium
    vec3 void_col = vec3(0.015, 0.01, 0.008);
    vec3 trace_col = vec3(0.15, 0.09, 0.03);
    vec3 signal_col = vec3(0.75, 0.5, 0.1);
    vec3 peak_col = vec3(1.0, 0.82, 0.35);
    vec3 core_col = vec3(1.0, 0.95, 0.7);

    // Map concentration to color
    vec3 col = mix(void_col, trace_col, smoothstep(0.0, 0.08, conc));
    col = mix(col, signal_col, smoothstep(0.06, 0.25, conc));
    col = mix(col, peak_col, smoothstep(0.2, 0.55, conc));
    col = mix(col, core_col, smoothstep(0.5, 0.85, conc));

    // Gradient arrows: faint directional indicators in the mid-concentration zone
    float arrows = gradient_arrow(st, speaker, 8.0);
    col += vec3(0.4, 0.25, 0.05) * arrows * smoothstep(0.04, 0.15, conc);

    // Speaker body: a distinct small region
    float speaker_dist = length(st - speaker);
    float speaker_body = smoothstep(0.025, 0.015, speaker_dist);
    col = mix(col, vec3(0.9, 0.7, 0.3), speaker_body * 0.8);

    // Outer diffusion ring: the faint chemical halo marking the current extent
    float ring_r = 0.32 + sin(u_time * 0.4) * 0.015;
    float ring_dist = abs(length(st - speaker) - ring_r);
    float ring = exp(-ring_dist * ring_dist / 0.0008) * 0.2;
    col += vec3(0.3, 0.18, 0.04) * ring;

    // Slow time-based pulse: the speaker is still releasing
    float time_pulse = 0.92 + sin(u_time * 0.55) * 0.08;
    col *= time_pulse;

    col = col / (col + vec3(0.4));
    gl_FragColor = vec4(col, 1.0);
}
