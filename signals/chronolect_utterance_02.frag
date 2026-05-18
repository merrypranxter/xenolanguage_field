// SPECIES: Temporal Swarm
// MEDIUM: Temporal interference field
// CONCEPT: "I will probably go there tomorrow"
// Structure: [future-intent: broad-envelope, phase-weight=0.6]
//            entrained to [present-action: spatial-calculation]
//            with harmonic cascade to [future-intent: alternative-paths]

precision highp float;

uniform vec2 u_resolution;
uniform float u_time;

#define PI 3.14159265
#define TAU 6.28318530

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Broad-envelope future node: diffuse, probabilistic, uncertain
vec3 future_node_broad(vec2 uv, vec2 pos, float phase_weight, float time) {
    float dist = length(uv - pos);

    // Broad envelope = high uncertainty = large, soft glow
    float sigma = 0.08 + (1.0 - phase_weight) * 0.06;
    float glow = exp(-dist * dist / (sigma * sigma));

    // Future color: cool blue, desaturated for uncertainty
    vec3 col = mix(vec3(0.15, 0.3, 0.8), vec3(0.4, 0.5, 0.9), phase_weight);

    // Broad nodes pulse slowly — they are not sharp certainties
    float pulse = sin(time * 0.8 + phase_weight * TAU) * 0.3 + 0.7;

    return col * glow * pulse * phase_weight;
}

// Sharp present-action node: spatial calculation anchor
vec3 present_node_sharp(vec2 uv, vec2 pos, float time) {
    float dist = length(uv - pos);
    float glow = exp(-dist * dist / 0.008);

    // Present = green/white, sharp
    vec3 col = vec3(0.4, 0.9, 0.6);

    // Sharp nodes pulse faster — they are immediate
    float pulse = sin(time * 3.0) * 0.2 + 0.8;

    return col * glow * pulse;
}

// Ghost path: alternative future trajectories
float ghost_path(vec2 uv, vec2 from, vec2 to, float path_id, float time) {
    vec2 dir = to - from;
    float len = length(dir);
    vec2 norm = dir / len;

    float proj = dot(uv - from, norm);
    float perp = abs(dot(uv - from, vec2(-norm.y, norm.x)));

    // Only draw within path extent
    if (proj < 0.0 || proj > len) return 0.0;

    // Ghost paths are thin, dashed, faint
    float path_width = exp(-perp * perp / 0.003);
    float dash = step(0.5, fract(proj * 8.0 - time * 0.3 + path_id));
    float fade = sin(proj / len * PI); // fade at endpoints

    return path_width * dash * fade * 0.4;
}

// Entrainment line: present anchoring future
float entrainment_line(vec2 uv, vec2 from, vec2 to, float time) {
    vec2 dir = to - from;
    float len = length(dir);
    vec2 norm = dir / len;

    float proj = dot(uv - from, norm);
    float perp = abs(dot(uv - from, vec2(-norm.y, norm.x)));

    if (proj < 0.0 || proj > len) return 0.0;

    float line = exp(-perp * perp / 0.002);

    // Entrainment flows from present toward future (direction matters)
    float flow = fract(proj / len - time * 0.4);
    float pulse = smoothstep(0.0, 0.3, flow) * smoothstep(1.0, 0.7, flow);

    return line * pulse * 0.7;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;

    vec3 col = vec3(0.01, 0.01, 0.02);

    // Present-action node: spatial calculation (bright, sharp, at center-left)
    vec2 present_pos = vec2(0.38, 0.5);
    col += present_node_sharp(st, present_pos, u_time);

    // Primary future-intent node: diffuse glow at center-right
    // Broad envelope = high uncertainty about exact destination
    vec2 future_main = vec2(0.7, 0.52);
    col += future_node_broad(st, future_main, 0.6, u_time);

    // Alternative future nodes: ghost images of paths not taken
    vec2 future_alt1 = vec2(0.68, 0.72);
    vec2 future_alt2 = vec2(0.72, 0.3);
    vec2 future_alt3 = vec2(0.82, 0.55);
    col += future_node_broad(st, future_alt1, 0.3, u_time) * 0.5;
    col += future_node_broad(st, future_alt2, 0.25, u_time) * 0.4;
    col += future_node_broad(st, future_alt3, 0.2, u_time) * 0.35;

    // Entrainment: present anchors / pulls toward primary future
    float entrain = entrainment_line(st, present_pos, future_main, u_time);
    col += vec3(0.3, 0.5, 0.7) * entrain;

    // Ghost paths to alternative futures
    float ghost1 = ghost_path(st, present_pos, future_alt1, 0.0, u_time);
    float ghost2 = ghost_path(st, present_pos, future_alt2, 1.7, u_time);
    float ghost3 = ghost_path(st, present_pos, future_alt3, 3.1, u_time);
    col += vec3(0.2, 0.35, 0.65) * ghost1;
    col += vec3(0.2, 0.35, 0.65) * ghost2;
    col += vec3(0.2, 0.35, 0.65) * ghost3;

    // Spatial calculation shimmer: present node radiates calculation
    for (float i = 0.0; i < 5.0; i++) {
        float angle = i * TAU / 5.0 + u_time * 0.5;
        vec2 spoke_dir = vec2(cos(angle), sin(angle));
        float spoke_proj = dot(st - present_pos, spoke_dir);
        float spoke_perp = length(st - present_pos - spoke_dir * spoke_proj);
        float spoke = exp(-spoke_perp * spoke_perp / 0.001) 
                      * step(0.0, spoke_proj) 
                      * exp(-spoke_proj * 8.0)
                      * 0.3;
        col += vec3(0.4, 0.8, 0.5) * spoke;
    }

    // Probability haze: broad diffuse cloud around future zone
    float future_haze = exp(-pow(length(st - vec2(0.72, 0.52)) - 0.0, 2.0) / 0.04);
    col += vec3(0.05, 0.08, 0.2) * future_haze * 0.15;

    // Harmonic cascade rings from primary future node
    for (float h = 1.0; h <= 4.0; h++) {
        float ring_r = h * 0.08;
        float ring = abs(length(st - future_main) - ring_r);
        float ring_glow = exp(-ring * ring / 0.003) * (1.0 / h);
        // Each harmonic fades and shifts color toward violet
        float frac_h = (h - 1.0) / 3.0;
        vec3 harmonic_col = mix(vec3(0.15, 0.25, 0.8), vec3(0.4, 0.1, 0.6), frac_h);
        col += harmonic_col * ring_glow * 0.12
             * (sin(u_time * 1.2 + h) * 0.3 + 0.7);
    }

    col = col / (col + vec3(0.4));
    gl_FragColor = vec4(col, 1.0);
}
