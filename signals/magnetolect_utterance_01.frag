// SPECIES: Magnetic Fielder
// MEDIUM: Ambient magnetic field topology
// CONCEPT: "The storm is coming"
// Structure: [topology: planetary-scale field lines]
//            + [gradient: increasing across all lines]
//            + [polarity: North dominance increasing]
//            + [duration: building over many cycles]
//
// Field lines that were smooth and parallel begin to bunch and twist.
// Gradient increases uniformly. Pressure building in the topology itself.

precision highp float;

uniform vec2 u_resolution;
uniform float u_time;

#define PI 3.14159265
#define TAU 6.28318530

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float hash1(float p) {
    return fract(sin(p * 127.1) * 43758.5453);
}

// Smooth noise for field line distortion
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

// Magnetic field line: rendered as a streamline
// Returns distance to the nearest field line
float field_line_dist(vec2 uv, float line_index, float storm_progress, float time) {
    // Each field line starts from the left edge with a vertical offset
    float base_y = (line_index + 0.5) / 8.0;

    // Distortion: storm warps field lines — increases with storm_progress
    // Lines that were horizontal begin to bunch toward the top (North dominance)
    float warp_scale = 3.0 + storm_progress * 4.0;
    float time_drift = time * 0.1;
    float distortion = noise(vec2(uv.x * warp_scale + time_drift, line_index * 0.7))
                       * storm_progress * 0.25;

    // Bunching: lines compress toward top as North polarity strengthens
    float bunch = storm_progress * 0.15 * (1.0 - base_y); // top lines bunch more
    float y = base_y + distortion - bunch;

    float dist = abs(uv.y - y);

    // Line thickness increases with gradient (storm_progress increases "volume")
    float thickness = 0.004 + storm_progress * 0.006;
    return smoothstep(thickness * 2.0, 0.0, dist);
}

// Gradient intensity: how sharply field is changing in an area
// In Magnetolect this is "volume" — it means the storm signal is strong
float gradient_intensity(vec2 uv, float storm_progress, float time) {
    float nx = noise(vec2(uv.x * 4.0 + time * 0.15, uv.y * 4.0)) ;
    float ny = noise(vec2(uv.x * 4.0, uv.y * 4.0 + time * 0.12));

    // Gradient magnitude: estimate spatial rate of change
    float gx = noise(vec2(uv.x * 4.0 + 0.01 + time * 0.15, uv.y * 4.0)) - nx;
    float gy = noise(vec2(uv.x * 4.0, uv.y * 4.0 + 0.01 + time * 0.12)) - ny;
    float grad_mag = length(vec2(gx, gy)) * 20.0;

    return grad_mag * storm_progress;
}

// North polarity compression: top of field getting denser/brighter
float north_compression(vec2 uv, float storm_progress) {
    // Polarity dominance builds from top down
    float north_pull = uv.y * storm_progress;
    return north_pull * north_pull * 0.8;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;
    // Normalize to aspect-correct square
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uv = st;
    uv.x /= aspect;

    // Storm progress: builds slowly over time (duration: building over many cycles)
    float storm_progress = clamp(sin(u_time * 0.25) * 0.5 + 0.5, 0.0, 1.0);
    // More menacing: bias toward storm state
    storm_progress = storm_progress * storm_progress;

    vec3 col = vec3(0.0, 0.0, 0.02);

    // Ambient field glow (background magnetism)
    float ambient = noise(vec2(uv.x * 2.0 + u_time * 0.05, uv.y * 2.0)) * 0.05;
    col += vec3(0.05, 0.1, 0.2) * ambient;

    // Field lines: 8 horizontal lines, distorting with storm
    for (float i = 0.0; i < 8.0; i++) {
        float line_val = field_line_dist(uv, i, storm_progress, u_time);
        if (line_val > 0.0) {
            // Color shifts from blue-white (calm) to orange-red (storm, North polarity warning)
            vec3 calm_col = vec3(0.4, 0.6, 0.9);
            vec3 storm_col = vec3(0.9, 0.5, 0.2);
            vec3 line_col = mix(calm_col, storm_col, storm_progress);

            // Lines bunch toward top: higher lines are brighter in storm
            float height_factor = uv.y;
            col += line_col * line_val * (0.6 + storm_progress * height_factor * 0.8);
        }
    }

    // Gradient intensity overlay (volume of the storm signal)
    float grad = gradient_intensity(uv, storm_progress, u_time);
    col += vec3(0.3, 0.15, 0.05) * grad * 0.4;

    // North compression glow: the "incoming" direction brightens
    float north_glow = north_compression(uv, storm_progress);
    col += vec3(0.5, 0.3, 0.15) * north_glow * 0.3;

    // Pressure visualization: subtle radial compression toward top edge
    float pressure = storm_progress * (1.0 - exp(-uv.y * 3.0)) * 0.15;
    col += vec3(0.4, 0.25, 0.1) * pressure;

    // Polarity oscillation warning: rapid flicker near storm front (top zone)
    if (uv.y > 0.7) {
        float flicker_zone = (uv.y - 0.7) / 0.3;
        float flicker = sin(u_time * 8.0 + uv.x * 20.0) * 0.5 + 0.5;
        col += vec3(0.6, 0.2, 0.1) * flicker * flicker_zone * storm_progress * 0.3;
    }

    col = col / (col + vec3(0.5));
    gl_FragColor = vec4(col, 1.0);
}
