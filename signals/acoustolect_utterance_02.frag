// SPECIES: Pressure Choir
// MEDIUM: Resonant pressure waves in geological substrate
// CONCEPT: "I am calling out to see if you exist"
// Structure: [mid: query-ping, sharp onset, directed outward]
//            → [silence: waiting period]
//            ← [echo-monitoring: watching for return signal]
//            [amplitude: social register — seeking, not archival]
//
// An existential question asked through physics.
// The query is in the outgoing burst. The answer, if any, is in what returns.
// The Choir member has emitted into an uncertain direction
// and now waits to feel if anything in that direction has a body.
//
// Most of the time: nothing returns.
// The emptiness is also an answer.

precision highp float;

uniform vec2 u_resolution;
uniform float u_time;

#define PI 3.14159265
#define TAU 6.28318530

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float hash1(float p) {
    return fract(sin(p * 311.7) * 43758.5453);
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

// The outgoing ping: sharp, directional, a question asked into the void
// dir is the normalized emission direction (pointed at the unknown)
float query_ping(vec2 uv, vec2 source, vec2 dir, float speed, float time, float emit_t) {
    float elapsed = time - emit_t;
    if (elapsed < 0.0) return 0.0;

    float front = elapsed * speed;

    // Distance from source
    float dist = length(uv - source);

    // The ping is directional — it radiates in a forward arc
    float angle_to_point = atan(uv.y - source.y, uv.x - source.x);
    float emit_angle = atan(dir.y, dir.x);
    float angle_diff = abs(mod(angle_to_point - emit_angle + PI, TAU) - PI);

    // Narrow forward cone: ±45 degrees full power, fading to ±90
    float directionality = smoothstep(PI * 0.55, PI * 0.15, angle_diff);

    // Wavefront: the pulse is sharp (high-certainty query)
    float at_front = exp(-pow(dist - front, 2.0) / 0.002);

    // Behind-front trailing oscillation
    float trailing = 0.0;
    if (dist < front && dist > front - 0.12) {
        float t_local = (front - dist) / 0.12;
        trailing = sin(t_local * PI * 6.0) * exp(-t_local * 3.0) * 0.3;
    }

    return (at_front + max(0.0, trailing)) * directionality;
}

// Echo return: partial, uncertain — coming from an unknown body in the far direction
// The echo is not clean; it is shaped by whatever body reflected it
float echo_return(vec2 uv, vec2 source, vec2 dir, float speed, float time,
                  float emit_t, float echo_dist) {
    // Echo arrives from approximately echo_dist away in dir direction
    float round_trip_time = (echo_dist * 2.0) / speed;
    float elapsed = time - emit_t - round_trip_time;
    if (elapsed < 0.0) return 0.0;

    // Echo appears to come FROM the direction the ping went
    // i.e., it returns toward source from echo_dist along dir
    vec2 echo_source = source + dir * echo_dist * 2.0;

    float dist = length(uv - echo_source);
    float front = elapsed * speed;
    if (dist > front) return 0.0;

    // Echo is broader (diffuse reflection from body, not perfect mirror)
    float wave = sin((front - dist) * 8.0 * TAU) * 0.5 + 0.5;
    float envelope = exp(-dist * 1.8) * 0.3;

    // Echo is uncertain — comes in bursts, not clean
    float uncertainty = hash1(floor(elapsed * 3.0 + dist * 7.0));
    float partial = step(0.35, uncertainty); // only ~65% of the echo is present at any moment

    return wave * envelope * partial;
}

// The waiting silence: the space between emission and echo
// Visualized as a gentle awareness field — the emitter scanning for returns
float silence_field(vec2 uv, vec2 source, vec2 dir, float time, float emit_t, float speed) {
    float elapsed = time - emit_t;
    if (elapsed < 0.1) return 0.0;

    // The waiting zone: slightly ahead of the source in dir
    vec2 scan_center = source + dir * 0.15;
    float dist = length(uv - scan_center);

    // Slow, soft breathing: active listening
    float listen_pulse = sin(time * 0.9 + 0.5) * 0.04 + 0.06;
    float scan_field = exp(-dist * dist / 0.06) * listen_pulse;

    // Small scanning ripples: the listener probing
    float scan_ring_r = mod(elapsed * 0.06, 0.25);
    float scan_ring = exp(-pow(dist - scan_ring_r, 2.0) / 0.002) * 0.15;

    return scan_field + scan_ring;
}

// The emitter: single Choir member, not a group (this is a personal call)
vec3 emitter_node(vec2 uv, vec2 pos, float time) {
    float dist = length(uv - pos);

    // Characteristic signature: personal fundamental
    float pulse = sin(time * 1.8) * 0.12 + 0.88;
    float glow = exp(-dist * dist / 0.003) * pulse;
    float halo = exp(-dist * dist / 0.012) * pulse * 0.35;

    // Single emitter, medium amplitude — social register
    return vec3(0.55, 0.82, 0.9) * (glow + halo);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uv = vec2(st.x / aspect, st.y);

    // Very dark background — the void the question is asked into
    vec3 col = vec3(0.003, 0.005, 0.01);

    // Emitter: left-center
    vec2 emit_pos = vec2(0.22, 0.5);

    // Query direction: toward upper-right — the unknown region
    vec2 query_dir = normalize(vec2(0.85, 0.25));

    // Cyclic behavior: emit, wait, detect echo (or not), repeat
    float cycle_duration = 6.0;
    float cycle_t = mod(u_time, cycle_duration);

    float emit_t = 0.0; // emit at start of each cycle
    float speed = 0.22;

    // 1. The outgoing ping
    float ping = query_ping(uv, emit_pos, query_dir, speed, cycle_t, emit_t);
    // Sharp, bright, directional cyan-white
    col += vec3(0.5, 0.88, 0.95) * ping;

    // 2. The waiting silence (active from 0.3s onward)
    float silence = silence_field(uv, emit_pos, query_dir, cycle_t, emit_t + 0.3, speed);
    col += vec3(0.1, 0.2, 0.28) * silence;

    // 3. Echo returns: there IS something out there — but partially, uncertainly
    // First echo at 0.35 units distance (moderate range)
    float echo1 = echo_return(uv, emit_pos, query_dir, speed, cycle_t, emit_t, 0.35);
    col += vec3(0.4, 0.6, 0.45) * echo1 * 0.8;

    // Second, fainter echo from further away (different body? geological reflection?)
    float echo2 = echo_return(uv, emit_pos, query_dir, speed, cycle_t, emit_t, 0.55);
    col += vec3(0.3, 0.45, 0.35) * echo2 * 0.4;

    // 4. The emitter itself
    col += emitter_node(uv, emit_pos, u_time);

    // Ambient medium texture: minimal — this is a quiet environment, the question heard clearly
    float ambient = noise(vec2(uv.x * 5.0 + u_time * 0.012, uv.y * 5.0)) * 0.02;
    col += vec3(0.03, 0.04, 0.06) * ambient;

    // Vignette: darkness at the far edge — the unknown has no edge
    float vig = length(uv - vec2(0.5, 0.5));
    col *= 1.0 - vig * 0.5;

    col = col / (col + vec3(0.4));
    gl_FragColor = vec4(col, 1.0);
}
