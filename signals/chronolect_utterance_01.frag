// SPECIES: Temporal Swarm
// MEDIUM: Temporal interference field
// CONCEPT: "I remember the last time we met"

precision highp float;

uniform vec2 u_resolution;
uniform float u_time;

#define PI 3.14159265
#define TAU 6.28318530

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Temporal node: each point in the swarm is a "moment"
// Nodes have phase (which time they represent) and coherence (how well they lock to the signal)

vec3 temporal_node(vec2 uv, vec2 pos, float phase, float coherence, float time) {
    float dist = length(uv - pos);
    
    // Node glow: sharper = higher coherence
    float glow = exp(-dist * dist / (0.02 + (1.0 - coherence) * 0.05));
    
    // Temporal color: phase maps to hue (not aesthetic — representational)
    // Past = red/warm, Present = green, Future = blue/cool
    float temporal_hue = phase; // 0=past, 0.5=present, 1.0=future
    vec3 past_col = vec3(0.8, 0.3, 0.2);
    vec3 present_col = vec3(0.2, 0.7, 0.4);
    vec3 future_col = vec3(0.2, 0.4, 0.9);
    
    vec3 col = mix(mix(past_col, present_col, smoothstep(0.0, 0.5, temporal_hue)), 
                   future_col, smoothstep(0.5, 1.0, temporal_hue));
    
    // Coherence: phase-locked nodes pulse together
    float pulse = sin(time * 2.0 + phase * TAU) * 0.5 + 0.5;
    pulse = mix(0.3, 1.0, pulse); // low coherence = dimmer, less modulation
    
    return col * glow * pulse * coherence;
}

// Wave packet: signal propagating between nodes
float wave_packet(vec2 uv, vec2 from, vec2 to, float phase, float time) {
    vec2 dir = to - from;
    float len = length(dir);
    vec2 norm = dir / len;
    
    // Distance along the path
    float proj = dot(uv - from, norm);
    float perp = length(uv - from - norm * proj);
    
    // Packet envelope: localized in space
    float packet_pos = mod(time * 0.5, len);
    float envelope = exp(-pow(proj - packet_pos, 2.0) / 0.02);
    
    // Cross-section
    float cross = exp(-perp * perp / 0.005);
    
    // Phase oscillation
    float oscillation = sin(proj * 20.0 - time * 5.0 + phase * TAU) * 0.5 + 0.5;
    
    return envelope * cross * oscillation;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;
    
    vec3 col = vec3(0.01, 0.015, 0.02);
    
    // Swarm nodes: scattered "moments"
    for (float i = 0.0; i < 12.0; i++) {
        float fi = i;
        vec2 pos = vec2(
            hash(vec2(fi, 1.0)) * 0.8 + 0.1,
            hash(vec2(fi, 2.0)) * 0.8 + 0.1
        );
        
        // Phase: some past, some present, some future
        float phase = fract(fi / 12.0 + 0.1);
        
        // Coherence: this utterance is about shared memory, so past nodes are highly coherent
        float coherence = mix(0.6, 1.0, 1.0 - phase); // past = more coherent
        
        // Special: "shared event" node — maximum coherence
        float is_shared = step(0.9, hash(vec2(fi, 3.0)));
        coherence = mix(coherence, 1.0, is_shared);
        
        col += temporal_node(st, pos, phase, coherence, u_time);
        
        // Entrainment lines: past nodes lock to present
        if (phase < 0.3) {
            // Find present node (phase ~ 0.5)
            vec2 present_pos = vec2(0.5, 0.5); // center = present anchor
            float packet = wave_packet(st, pos, present_pos, phase, u_time);
            vec3 entrain_col = vec3(0.6, 0.4, 0.3) * packet;
            col += entrain_col;
        }
    }
    
    // Superposition glow: where past and present overlap
    float superposition = 0.0;
    for (float i = 0.0; i < 6.0; i++) {
        float fi = i;
        vec2 pos = vec2(hash(vec2(fi, 4.0)), hash(vec2(fi, 5.0))) * 0.6 + 0.2;
        superposition += exp(-length(st - pos) * length(st - pos) / 0.01);
    }
    col += vec3(0.3, 0.2, 0.4) * superposition * 0.1;
    
    // Temporal lens: center of gaze is "now"
    float now_dist = length(st - vec2(0.5, 0.5));
    float now_focus = exp(-now_dist * now_dist / 0.1);
    col *= 0.7 + 0.3 * now_focus;
    
    // Harmonic cascade rings: causation spreading outward
    for (float h = 1.0; h <= 3.0; h++) {
        float ring = abs(length(st - vec2(0.5, 0.5)) - h * 0.15);
        float ring_glow = exp(-ring * ring / 0.002);
        col += vec3(0.1, 0.15, 0.2) * ring_glow * (1.0 / h);
    }
    
    col = col / (col + vec3(0.5));
    gl_FragColor = vec4(col, 1.0);
}
