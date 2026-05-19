// SPECIES: Void Weaver
// MEDIUM: Chemical concentration gradients in fluid medium
// CONCEPT: "Remember me" (a message to outlast the sender)
// Structure: [substrate-mark: permanent] + [identity-signature: maximum fidelity]
//            [decay: near-zero — bonds to substrate]
//            [pattern: reaction-diffusion monument — complex enough to be unique]
//
// The most permanent communication in Chemolect.
// The void_weaver releases their complete identity signature as a stable substrate deposit.
// The pattern is a rich, complex reaction-diffusion field — Belousov-Zhabotinsky-like
// oscillations combined with Turing spots. The pattern is stable (cyclic, not decaying).
// It spreads slowly outward as the reaction front advances.
// Color: amber/gold identity deposit glowing against blue-teal substrate background.

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

// Belousov-Zhabotinsky-like oscillating spiral reaction
// Simulated analytically using nested trig functions seeded with spatial noise
// The pattern oscillates slowly (it's in a stable limit cycle — permanent)
float bz_pattern(vec2 uv, float t) {
    vec2 center = vec2(0.5, 0.5);
    vec2 p = uv - center;
    float r = length(p);
    float theta = atan(p.y, p.x);

    // Multiple spiral arms with different winding numbers
    // Seeded from spatial noise to make the pattern unique (identity encoding)
    float seed1 = fbm(uv * 2.7 + vec2(0.0, 0.0));
    float seed2 = fbm(uv * 4.1 + vec2(17.3, 5.5));

    // First component: spiral oscillation (BZ-like rotating structure)
    float spiral1 = sin(r * 18.0 - theta * 3.0 - t * 0.7 + seed1 * TAU);
    float spiral2 = sin(r * 12.0 + theta * 2.0 + t * 0.5 + seed2 * TAU);
    float bz_combined = (spiral1 + spiral2) * 0.5;

    // Spatial envelope: pattern fills from center, expanding front
    float front_radius = 0.42;
    float front_fade = smoothstep(front_radius + 0.04, front_radius - 0.02, r);

    return bz_combined * front_fade;
}

// Turing pattern overlay: fine spots providing the unique fingerprint structure
// The void_weaver's identity is in the specific spatial frequency combination
float turing_identity(vec2 uv, float t) {
    // Identity-specific spatial frequencies (these would be unique per individual)
    // The ratio of these two scales IS the fingerprint
    float f1 = 22.0;
    float f2 = 11.0;

    float activator = noise(uv * f1 + vec2(0.0, t * 0.004));
    float inhibitor = noise(uv * f2 + vec2(t * 0.004, 0.0));
    float cross = noise(uv * (f1 + f2) * 0.5 + vec2(t * 0.002));

    // Activation-inhibition interaction
    float turing = activator * (1.0 + activator) - inhibitor * 1.2 - cross * 0.3;

    // Threshold to get spots
    float pattern = smoothstep(0.08, 0.22, turing);

    return pattern;
}

// Reaction front: the slowly advancing edge of the deposit
// The reaction is still spreading (the void_weaver put a lot of chemical here)
float reaction_front(vec2 uv, float t) {
    vec2 center = vec2(0.5, 0.5);
    float r = length(uv - center);

    // The front advances slowly outward
    float front_r = 0.38 + t * 0.012;
    front_r = min(front_r, 0.52); // eventually reaches equilibrium

    // The advancing front is a bright ring of active chemistry
    float front_dist = abs(r - front_r);
    float front_glow = exp(-front_dist * front_dist / 0.001) * 0.6;

    // Also add texture to the front itself
    float front_noise = noise(vec2(atan(uv.y - 0.5, uv.x - 0.5) * 3.0, t * 0.1));
    front_glow *= 0.7 + front_noise * 0.3;

    return front_glow;
}

// Inner deposit: the rich, dense core where the chemical bonded to substrate first
// This is the most permanent part — shows intricate texture
float inner_deposit(vec2 uv, float t) {
    vec2 center = vec2(0.5, 0.5);
    float r = length(uv - center);

    // Core is fully filled — the original deposition zone
    float core_r = 0.28;
    float in_core = smoothstep(core_r + 0.03, core_r - 0.02, r);

    // Rich texture from long-standing reaction-diffusion equilibrium
    float texture = fbm(uv * 8.0 + vec2(sin(t * 0.05) * 0.5, cos(t * 0.04) * 0.5)) * 0.5;
    float detailed = noise(uv * 22.0 + vec2(t * 0.02)) * 0.5;

    return in_core * (0.5 + texture * 0.3 + detailed * 0.2);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;
    float aspect = u_resolution.x / u_resolution.y;

    // Normalize position to a centered square for pattern computation
    // (the patterns should be approximately circular)
    vec2 uv = st;
    uv.x /= aspect;
    uv.x = uv.x + (aspect - 1.0) * 0.5; // re-center

    // All pattern components
    float bz = bz_pattern(uv, u_time);
    float turing = turing_identity(uv, u_time);
    float front = reaction_front(uv, u_time);
    float core = inner_deposit(uv, u_time);

    // Distance from center for radial masking
    vec2 center = vec2(0.5, 0.5);
    float r = length(uv - center);

    // Presence: is this point within the deposit at all?
    float deposit_presence = smoothstep(0.56, 0.50, r);

    // Color palette
    vec3 substrate_col = vec3(0.02, 0.04, 0.08); // blue-teal substrate background
    vec3 deposit_col = vec3(0.65, 0.42, 0.08);   // amber deposit
    vec3 active_col = vec3(0.9, 0.65, 0.15);     // bright gold: active reaction front
    vec3 peak_col = vec3(1.0, 0.88, 0.5);        // peak glow: most recent intense deposit
    vec3 turing_col = vec3(0.75, 0.5, 0.1);      // identity spots

    // Base: substrate
    vec3 col = substrate_col;

    // Faint substrate texture (the void)
    float void_noise = fbm(st * 3.0 + vec2(u_time * 0.01, 0.0)) * 0.03;
    col += vec3(0.02, 0.03, 0.05) * void_noise;

    // Layer in the deposit
    col = mix(col, deposit_col, deposit_presence * 0.7);

    // BZ oscillating structure
    float bz_pos = max(0.0, bz) * deposit_presence;
    float bz_neg = max(0.0, -bz) * deposit_presence;
    col += active_col * bz_pos * 0.5;
    col -= vec3(0.15, 0.1, 0.02) * bz_neg * 0.3;

    // Turing identity fingerprint
    col += turing_col * turing * deposit_presence * 0.6;

    // Dense inner core
    col = mix(col, peak_col, core * 0.7);

    // Reaction front: bright advancing ring
    col += active_col * front;

    // Center glow: the origin point of the deposit (maximum permanence)
    float center_glow = exp(-r * r / 0.003);
    col += peak_col * center_glow * 0.8;

    // Overall time modulation: very slow, cyclic (stable limit cycle)
    float slow_cycle = sin(u_time * 0.12) * 0.05 + 0.97;
    col *= slow_cycle;

    col = col / (col + vec3(0.4));
    gl_FragColor = vec4(col, 1.0);
}
