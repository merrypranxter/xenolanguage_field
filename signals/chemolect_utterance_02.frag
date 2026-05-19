// SPECIES: Void Weaver
// MEDIUM: Chemical concentration gradients in fluid medium
// CONCEPT: "This is mine"
// Structure: [substrate-mark: boundary deposit] + [identity-signature: at mark]
//            [decay: very slow — permanent territorial claim]
//            [concentration: moderate, sustained along boundary line]
//
// A territorial boundary line across the field.
// Not a straight line — chemistry diffuses and the boundary has natural curvature.
// The identity signature of the speaker is embedded in the chemical pattern:
// a reaction-diffusion (Turing) motif that repeats along the boundary.
// Inside: slightly warmer, the void_weaver's chemical home territory.
// Outside: nearly void, just trace signals.
// The line itself has complex biological chemistry: activation-inhibition patterns.

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

float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p = p * 2.1 + shift;
        a *= 0.5;
    }
    return v;
}

// Turing-like reaction-diffusion pattern along the boundary
// Simulated analytically: activation-inhibition creates spots/stripes
// Identity fingerprint pattern: the ratio of activation scale to inhibition scale
// is unique to this individual and constitutes their "name" in the substrate
float turing_pattern(vec2 p, float activation_scale, float inhibition_scale, float t) {
    // Seed the space-time with correlated noise at two scales
    float activator = noise(p * activation_scale + vec2(t * 0.003, 0.0));
    float inhibitor = noise(p * inhibition_scale + vec2(0.0, t * 0.003));

    // The Turing mechanism: activator self-promotes, inhibitor suppresses activator
    // Approximate steady-state pattern inline
    float pattern = activator - inhibitor * 0.6;

    // Threshold to get spots/stripes
    float threshold = 0.1 + fbm(p * 2.3) * 0.15;
    float spots = smoothstep(threshold, threshold + 0.08, pattern);

    return spots;
}

// The boundary line: a natural curve across the field, not geometrically perfect
// Returns signed distance: negative = inside territory, positive = outside
float boundary_sdf(vec2 uv, float t) {
    // A gentle S-curve boundary
    // Slow drift over time (very slow: permanent mark with slight biological degradation)
    float drift = t * 0.002;
    float curve = 0.12 * sin(uv.y * 2.8 + 0.6) + 0.06 * sin(uv.y * 5.1 + 1.2);
    float base_x = 0.48 + curve;
    float d = uv.x - base_x;
    // Add medium-scale noise (chemical heterogeneity along boundary)
    float edge_noise = fbm(vec2(uv.y * 3.0 + drift, uv.y * 1.1)) * 0.04;
    return d - edge_noise;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;
    float aspect = u_resolution.x / u_resolution.y;

    // Boundary signed distance
    float bsdf = boundary_sdf(st, u_time);
    bool inside = bsdf < 0.0;
    float boundary_dist = abs(bsdf);

    // Is this point on the boundary itself?
    float on_boundary = smoothstep(0.04, 0.005, boundary_dist);
    // Is this within the boundary zone (a bit broader)?
    float near_boundary = smoothstep(0.12, 0.0, boundary_dist);

    // Identity signature: Turing-like pattern embedded in the boundary
    // Two spatial scales: the ratio is the void_weaver's unique identifier
    float activation_scale = 18.0;  // characteristic spot size
    float inhibition_scale = 9.0;   // characteristic inhibition range
    float turing = turing_pattern(st, activation_scale, inhibition_scale, u_time);

    // The identity pattern is strongest on the boundary itself
    float identity_signal = turing * on_boundary;

    // Color scheme
    vec3 void_col = vec3(0.01, 0.01, 0.015);
    vec3 outside_col = vec3(0.02, 0.015, 0.01);
    // Inside territory: slightly warmer chemistry
    vec3 inside_col = vec3(0.04, 0.03, 0.015);
    // Boundary line: the territorial chemical deposit (amber-brown)
    vec3 boundary_col = vec3(0.55, 0.38, 0.12);
    // Identity signature pattern: brighter amber
    vec3 identity_col = vec3(0.9, 0.65, 0.2);
    // Trace in the outside region (chemical seepage)
    vec3 trace_col = vec3(0.06, 0.04, 0.015);

    vec3 col;

    if (inside) {
        // Interior: home territory, slightly chemically rich
        float interior_richness = fbm(st * 3.0 + vec2(u_time * 0.008, 0.0)) * 0.5;
        col = mix(inside_col, vec3(0.07, 0.05, 0.02), interior_richness);
        // Faint concentration gradient inside (residual chemistry)
        float center_x = 0.25 * aspect;
        float dist_center = length(st - vec2(center_x, 0.5));
        float interior_glow = exp(-dist_center * dist_center / 0.15) * 0.1;
        col += vec3(0.12, 0.09, 0.04) * interior_glow;
    } else {
        // Exterior: mostly void, occasional trace
        float trace = fbm(st * 5.0 + vec2(0.0, u_time * 0.005)) * 0.06;
        col = mix(void_col, outside_col, trace);
    }

    // Boundary zone: blend toward boundary color
    col = mix(col, boundary_col, near_boundary * 0.7);

    // Identity signature: the Turing pattern overlaid on the boundary
    col = mix(col, identity_col, identity_signal * 0.85);

    // The boundary line glows slightly from the slow-decay chemical
    col += boundary_col * on_boundary * 0.3;

    // Very slow time pulse: the permanent mark breathes at near-zero frequency
    float slow_pulse = 0.97 + sin(u_time * 0.08) * 0.03;
    col *= slow_pulse;

    col = col / (col + vec3(0.4));
    gl_FragColor = vec4(col, 1.0);
}
