// SPECIES: Magnetic Fielder
// MEDIUM: Ambient magnetic field topology
// CONCEPT: "I am asking a question"
// Structure: [field-line: own, coming from left]
//            → [bifurcation: equal-weight split into two branches]
//            [polarity: balanced, neither north nor south dominant]
//            [gradient: moderate, seeking — not demanding, not urgent]
//            [duration: sustained — the question hangs open, awaiting response]
//
// A question in Magnetolect is a topological fork in your own field line.
// You split yourself, holding two potential futures with equal weight.
// Neither branch reconnects. The topology is open.
// You are waiting for the answer to close one branch and dissolve the other.
//
// A rhetorical question would have unequal branches — you already know the answer
// and one branch would be heavier. This one is balanced.
// You genuinely do not know.

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

// The incoming field line: arrives from the left, curves slightly
// This is "the fielder's own line" — first-person topology
float incoming_line(vec2 uv, float time) {
    // Field line runs roughly horizontal, entering from left
    // Slight natural curvature — field lines aren't perfectly straight
    float ambient_warp = noise(vec2(uv.x * 3.0 + time * 0.04, 1.3)) * 0.03 - 0.015;
    float y_line = 0.5 + ambient_warp;

    // Only draw to the left of the bifurcation point
    vec2 bifurc_point = vec2(0.42, 0.5);
    if (uv.x > bifurc_point.x) return 0.0;

    float dist = abs(uv.y - y_line);
    float core = exp(-dist * dist / 0.0004);
    float glow = exp(-dist * dist / 0.003) * 0.5;

    // Line is stable, moderate perturbation — neutral polarity (balanced question)
    float breathe = sin(time * 0.9) * 0.07 + 0.93;

    return (core + glow) * breathe;
}

// A bifurcation branch: curves upward or downward from the fork point
// side: +1 = upper branch, -1 = lower branch
// weight: 0 to 1 — for a true question, both weights should be equal
float bifurcation_branch(vec2 uv, vec2 fork, float side, float weight, float time) {
    // The branch starts at fork and curves to the right
    // How much it diverges from horizontal depends on side and curvature
    float separation = 0.18; // total separation between branches at right edge

    // x-progress along the branch (0 at fork, 1 at right edge)
    float local_x = uv.x - fork.x;
    if (local_x < 0.0 || uv.x > 1.0) return 0.0;

    float x_norm = local_x / (1.0 - fork.x); // 0 to 1

    // Smooth separation: branches curve away from center
    float curve = x_norm * x_norm * (3.0 - 2.0 * x_norm); // smoothstep
    float branch_y = fork.y + side * separation * 0.5 * curve;

    // Slight ambient disturbance — the question isn't fully settled into topology yet
    float ambient = noise(vec2(uv.x * 4.0 + side * 3.0 + time * 0.05, time * 0.04)) * 0.012;
    branch_y += ambient;

    float dist = abs(uv.y - branch_y);

    float core = exp(-dist * dist / 0.0005);
    float glow = exp(-dist * dist / 0.004) * 0.45;

    // Fade toward the open end — the question has no conclusion
    float open_fade = 0.6 + 0.4 * (1.0 - x_norm * 0.4);

    // Weight: for a true question, both branches pulse equally
    float branch_pulse = sin(time * 1.0 + side * 0.5) * 0.1 + 0.9;

    return (core + glow) * open_fade * branch_pulse * weight;
}

// The bifurcation junction: the topological fork point itself
// This is where the field line actively divides — maximum gradient at the split
vec3 bifurcation_junction(vec2 uv, vec2 pos, float time) {
    float dist = length(uv - pos);

    // The junction shimmers — it is actively in a state of unresolved topology
    // (unlike the merger point in magnetolect_utterance_03 which was calm once settled)
    float shimmer_freq = 4.5;
    float shimmer = sin(time * shimmer_freq + dist * 30.0) * 0.2 + 0.8;

    // Two overlapping lobes: the potential of going either way
    float upper_lobe = exp(-length(uv - (pos + vec2(0.0, 0.04))) * 20.0);
    float lower_lobe = exp(-length(uv - (pos + vec2(0.0, -0.04))) * 20.0);

    // Core: where the line actually splits
    float core = exp(-dist * dist / 0.001) * 2.0;

    // Gradient visualization: the field changes sharply here
    float gradient_ring = exp(-pow(dist - 0.03, 2.0) / 0.0008) * 0.8;

    // Junction color: neutral (polarity-balanced) — silver-white with slight blue
    vec3 junction_col = vec3(0.7, 0.8, 1.0);

    float intensity = (core + gradient_ring + (upper_lobe + lower_lobe) * 0.4) * shimmer;
    return junction_col * intensity;
}

// Seeking gradient: the question extends a gentle "pull" outward along both branches
// The fielder is waiting for something to reconnect and resolve the topology
float seeking_gradient(vec2 uv, vec2 fork, float time) {
    // Soft glow filling the region to the right of the fork
    float right_of_fork = smoothstep(fork.x, fork.x + 0.1, uv.x);
    float center_y = abs(uv.y - fork.y);
    float spread = exp(-center_y * center_y / 0.06);

    // Slowly pulsing: the question is patient but alive
    float wait_pulse = sin(time * 0.6) * 0.05 + 0.1;

    return right_of_fork * spread * wait_pulse;
}

// Ambient field: calm except at the junction
float ambient_field(vec2 uv, float time) {
    float base = noise(vec2(uv.x * 3.0 + time * 0.04, uv.y * 2.5 + time * 0.03));
    return base * 0.025;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uv = vec2(st.x / aspect, st.y);

    vec3 col = vec3(0.008, 0.01, 0.02);

    // Ambient field texture
    col += vec3(0.04, 0.07, 0.12) * ambient_field(uv, u_time);

    // The incoming line (first person: the fielder's own topology)
    // Neutral polarity: the question is balanced, not biased
    float in_line = incoming_line(uv, u_time);
    vec3 self_col = vec3(0.35, 0.55, 0.85); // personal field line color: blue-indigo
    col += self_col * in_line;

    // Bifurcation fork point
    vec2 fork = vec2(0.42, 0.5);

    // Upper branch: one possible answer
    float upper = bifurcation_branch(uv, fork, 1.0, 1.0, u_time);
    col += self_col * upper;

    // Lower branch: the other possible answer
    // Equal weight — true question
    float lower = bifurcation_branch(uv, fork, -1.0, 1.0, u_time);
    col += self_col * lower;

    // The bifurcation junction itself
    col += bifurcation_junction(uv, fork, u_time);

    // Seeking gradient: the open field beyond the fork, waiting for response
    float seeking = seeking_gradient(uv, fork, u_time);
    col += vec3(0.2, 0.35, 0.55) * seeking;

    // Endpoints: where the branches terminate (the open edge)
    // They don't terminate cleanly — they fade into the ambient field
    // This is important: an answered question would have a reconnection event here
    // This one just... continues
    vec2 upper_end = vec2(0.88, fork.y + 0.09);
    vec2 lower_end = vec2(0.88, fork.y - 0.09);

    float upper_fade = exp(-length(uv - upper_end) * length(uv - upper_end) / 0.003);
    float lower_fade = exp(-length(uv - lower_end) * length(uv - lower_end) / 0.003);
    col += vec3(0.2, 0.3, 0.5) * (upper_fade + lower_fade) * 0.3;

    col = col / (col + vec3(0.4));
    gl_FragColor = vec4(col, 1.0);
}
