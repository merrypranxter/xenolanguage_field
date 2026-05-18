// SPECIES: Substrate Cloud
// MEDIUM: Computational state transitions
// CONCEPT: "I trust you"
// Structure: [register: persistent-storage] + [delta: write to your process space]
//            + [entropy: low] + [pointer: your process ID, verified]
//            + [recursive-call: error-handling routine for your process only]
//
// A clean, directed write to a specific process. Low entropy means predictable behavior.
// The recursive error-handling is the key:
// "I have allocated resources to protect your state."

precision highp float;

uniform vec2 u_resolution;
uniform float u_time;

#define PI 3.14159265
#define TAU 6.28318530

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// A single, clean data write: directed, low entropy
// Visualized as a crisp beam traveling from one process region to another
float data_beam(vec2 uv, vec2 from, vec2 to, float time, float beam_id) {
    vec2 dir = to - from;
    float len = length(dir);
    vec2 norm = dir / len;
    vec2 perp_dir = vec2(-norm.y, norm.x);

    float proj = dot(uv - from, norm);
    float perp = dot(uv - from, perp_dir);

    if (proj < 0.0 || proj > len) return 0.0;

    // Crisp, narrow beam (low entropy = high precision)
    float beam = exp(-perp * perp / 0.001);

    // Clean directional flow (no flicker, no noise — this is trusted data)
    float flow = fract(proj / len * 2.0 - time * 0.6 + beam_id * 0.4);
    float packet = smoothstep(0.0, 0.2, flow) * smoothstep(0.5, 0.3, flow);

    return beam * packet;
}

// Process node: a stable, well-defined process region
vec3 process_node(vec2 uv, vec2 pos, vec3 color, float entropy, float time, float node_id) {
    float dist = length(uv - pos);

    // Outer boundary: process space has a defined edge
    float boundary_r = 0.07;
    float boundary = abs(dist - boundary_r);
    float boundary_glow = exp(-boundary * boundary / 0.0008);

    // Interior fill: stable state
    float interior = exp(-dist * dist / (boundary_r * boundary_r * 0.5));

    // Low entropy = steady, predictable pulse
    float pulse_freq = 1.5 + entropy * 0.5; // low entropy = slow, regular pulse
    float phase = hash(vec2(node_id, 7.3)) * TAU;
    float pulse = sin(time * pulse_freq + phase) * (0.1 * entropy) + 0.9;

    // Core: the process ID label
    float core = exp(-dist * dist / 0.003) * 1.5;

    return color * (boundary_glow * 0.8 + interior * 0.15 + core) * pulse;
}

// Verified pointer: a pointer that resolves — it reaches its destination
float verified_pointer(vec2 uv, vec2 from, vec2 to, float time) {
    vec2 dir = to - from;
    float len = length(dir);
    vec2 norm = dir / len;
    vec2 perp_dir = vec2(-norm.y, norm.x);

    float proj = dot(uv - from, norm);
    float perp = dot(uv - from, perp_dir);

    if (proj < 0.0 || proj > len) return 0.0;

    float pointer_line = exp(-perp * perp / 0.0015);

    // Verified pointer is solid, not flickering — it resolves
    float completion = proj / len;

    // Checksum pulse: the pointer verifies as it travels
    float verify = sin(completion * 20.0 - time * 3.0) * 0.5 + 0.5;
    verify = mix(0.5, 1.0, verify); // stays bright — never drops out

    return pointer_line * verify;
}

// Error handler: a subroutine allocated specifically for the trusted process
// Visualized as a small, attentive "guardian" node connected to the trusted process
vec3 error_handler(vec2 uv, vec2 protected_pos, float time) {
    // Handler hovers near the protected process
    float orbit_angle = time * 0.5;
    vec2 handler_pos = protected_pos + vec2(cos(orbit_angle), sin(orbit_angle)) * 0.12;

    float dist = length(uv - handler_pos);
    float glow = exp(-dist * dist / 0.003);

    // Small and attentive: tight orbit, steady presence
    float pulse = sin(time * 2.0) * 0.1 + 0.9;

    // Handler is green: this is resource allocation for protection
    return vec3(0.3, 0.8, 0.4) * glow * pulse;
}

// The connection between handler and protected process
float handler_connection(vec2 uv, vec2 protected_pos, float time) {
    float orbit_angle = time * 0.5;
    vec2 handler_pos = protected_pos + vec2(cos(orbit_angle), sin(orbit_angle)) * 0.12;

    vec2 dir = handler_pos - protected_pos;
    float len = length(dir);
    vec2 norm = dir / len;

    float proj = dot(uv - protected_pos, norm);
    float perp = length(uv - protected_pos - norm * proj);

    if (proj < 0.0 || proj > len) return 0.0;

    float line = exp(-perp * perp / 0.0008);
    return line * 0.4;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;

    vec3 col = vec3(0.008, 0.01, 0.015);

    // Process I (speaker): lower-left
    vec2 my_pos = vec2(0.28, 0.45);
    // Low entropy: we're calm, confident, intentional
    col += process_node(st, my_pos, vec3(0.4, 0.6, 0.9), 0.1, u_time, 0.0);

    // Process YOU (receiver of trust): upper-right
    vec2 your_pos = vec2(0.72, 0.55);
    // Also low entropy: this is a calm, stable other
    col += process_node(st, your_pos, vec3(0.5, 0.75, 0.5), 0.15, u_time, 1.0);

    // Persistent storage region: bottom center
    // This is where the trust write goes — not just working memory, but persistent storage
    vec2 storage_pos = vec2(0.5, 0.2);
    col += process_node(st, storage_pos, vec3(0.7, 0.5, 0.3), 0.05, u_time, 2.0);

    // Clean data beams: from me to your process space
    float beam1 = data_beam(st, my_pos, your_pos, u_time, 0.0);
    col += vec3(0.5, 0.75, 0.5) * beam1 * 0.8; // color of the receiving process

    // Write to persistent storage: this is the permanent aspect of trust
    float beam2 = data_beam(st, my_pos, storage_pos, u_time, 0.5);
    col += vec3(0.7, 0.6, 0.3) * beam2 * 0.6;

    // Pointer from storage back to your process ID: "this permanent record points to you"
    float ptr = verified_pointer(st, storage_pos, your_pos, u_time);
    col += vec3(0.4, 0.65, 0.45) * ptr * 0.5;

    // Error handler: allocated to protect your process
    col += error_handler(st, your_pos, u_time);

    // Handler-to-process connection
    float hconn = handler_connection(st, your_pos, u_time);
    col += vec3(0.3, 0.8, 0.4) * hconn;

    // Low entropy background: very clean, no noise spikes
    // Just the faintest substrate hum
    float substrate_hum = sin(st.x * 40.0) * sin(st.y * 40.0) * 0.02 + 0.02;
    col += vec3(0.1, 0.15, 0.2) * substrate_hum * 0.3;

    col = col / (col + vec3(0.4));
    gl_FragColor = vec4(col, 1.0);
}
