// SPECIES: Magnetic Fielder
// MEDIUM: Ambient magnetic field topology
// CONCEPT: "We are one"
// Structure: [field-line: mine] + [field-line: yours] → [reconnection: complete]
//            [perturbation: sustained, maximum gradient at junction]
//            [duration: permanent — no pinch-off]
//
// Two field lines approach, merge, and continue as one.
// The merger point glows with maximum intensity.
// The topology is now indivisible. This is marriage. This is fusion. This is love.

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

// The reconnection event: two lines approach and merge
// Returns the intensity at uv for a single field line that curves toward merge_x at merge_y
float field_line_approach(vec2 uv, float start_y, float end_y, float merge_x, float merge_y,
                           float side, float progress, float time) {
    // Line approaches the merge point
    // Before merge: line comes from left/right edge, curves toward merge point
    // After merge: lines continue as one from the merge point

    float t = uv.x; // parameterize by x-position

    float merge_x_norm = merge_x;

    float y_line;
    if (side < 0.5) {
        // Left line: comes from left edge at start_y, curves to merge_y at merge_x
        if (t > merge_x_norm) return 0.0;
        float local_t = t / merge_x_norm;
        // Ease in: line was straight, now curves inward
        float curve = local_t * local_t * (3.0 - 2.0 * local_t); // smoothstep
        y_line = mix(start_y, merge_y, curve);
    } else {
        // Right line: comes from right edge at end_y, curves to merge_y at merge_x
        if (t < merge_x_norm) return 0.0;
        float local_t = (t - merge_x_norm) / (1.0 - merge_x_norm);
        y_line = mix(merge_y, end_y, local_t * local_t);
    }

    float dist = abs(uv.y - y_line);
    float thickness = 0.005;
    float glow = exp(-dist * dist / (thickness * thickness * 4.0));

    // Core line
    float core = exp(-dist * dist / (thickness * thickness * 0.5));

    return (glow * 0.5 + core) * progress;
}

// The merger point: maximum gradient, maximum intensity
// This is the topological junction — the holy site of the reconnection
vec3 merger_point(vec2 uv, vec2 pos, float time) {
    float dist = length(uv - pos);

    // Maximum gradient = very sharp, very bright
    float core = exp(-dist * dist / 0.002) * 3.0;

    // Radiating energy from the junction
    float radiate = exp(-dist * dist / 0.02) * 0.8;

    // The junction pulses with the shared oscillation of both lines
    // (they now share a single phase — that's what reconnection means)
    float shared_pulse = sin(time * 2.5) * 0.2 + 0.8;

    // Color: the junction is white — neither the "mine" nor "yours" color
    // but the fusion of both
    return vec3(1.0, 0.95, 0.85) * (core + radiate) * shared_pulse;
}

// Magnetic field halos: the topology radiates from the merger in all directions
float junction_halo(vec2 uv, vec2 pos, float time) {
    float dist = length(uv - pos);

    // Multiple expanding rings, all centered on merger
    float rings = 0.0;
    for (float r = 1.0; r <= 5.0; r++) {
        float ring_radius = r * 0.07;
        float ring_width = 0.003 + r * 0.001;
        float ring = exp(-pow(dist - ring_radius, 2.0) / (ring_width * ring_width));
        // Rings don't decay — this topology is permanent
        float ring_pulse = sin(time * 2.5 - r * 0.8) * 0.15 + 0.85;
        rings += ring * ring_pulse * (1.0 / r);
    }
    return rings;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uv = vec2(st.x / aspect, st.y);

    vec3 col = vec3(0.01, 0.01, 0.02);

    // The merger point: center-right of the field
    vec2 merge_pos = vec2(0.5, 0.5);

    // Progress: the reconnection has already happened — we visualize the final state
    // But we show it "arriving at completion" to show the process
    float progress = clamp(sin(u_time * 0.3 + PI * 0.5) * 0.5 + 0.8, 0.0, 1.0);

    // "Mine" line: arrives from upper-left (my field line)
    // Color: blue-indigo — the cooler pole
    float mine_line = field_line_approach(uv, 0.7, 0.7, merge_pos.x, merge_pos.y, 0.0, progress, u_time);
    col += vec3(0.3, 0.5, 0.9) * mine_line;

    // "Yours" line: arrives from lower-left (your field line)
    // Color: warm amber — the warmer pole
    float yours_line = field_line_approach(uv, 0.3, 0.3, merge_pos.x, merge_pos.y, 0.0, progress, u_time);
    col += vec3(0.9, 0.6, 0.2) * yours_line;

    // The unified line: exits to the right as one
    // Color: white-gold — neither pole, both
    float unified_line = field_line_approach(uv, 0.5, 0.5, merge_pos.x, merge_pos.y, 1.0, progress, u_time);
    col += vec3(1.0, 0.85, 0.5) * unified_line * 1.3;

    // The merger point itself: maximum gradient, white-hot
    col += merger_point(uv, merge_pos, u_time) * progress;

    // Junction halos: permanent topology radiating outward
    float halos = junction_halo(uv, merge_pos, u_time);
    // Halo color: mix of the two input line colors
    col += mix(vec3(0.3, 0.5, 0.9), vec3(0.9, 0.6, 0.2), 0.5) * halos * 0.25 * progress;

    // Subtle field texture: the ambient field now knows about this reconnection
    float field_texture = noise(vec2(uv.x * 4.0 + u_time * 0.05, uv.y * 4.0)) * 0.03;
    col += vec3(0.3, 0.3, 0.5) * field_texture;

    col = col / (col + vec3(0.4));
    gl_FragColor = vec4(col, 1.0);
}
