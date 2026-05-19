## SPECIES: Void Weaver
## SENSORIUM: Chemoreception at millimeter resolution across full body surface; perceives chemical concentration gradients as primary sense. Communication via chemical emissions into fluid medium.
## TEMPORALITY: Decay-based — time as dilution. Present = high concentration. Past = faded. Future = committed slow-decay deposit. Deep past = below detection threshold.
## SELFHOOD: Chemical signature identity — each individual's unique pheromone blend constitutes their name and personhood

---

# Chemolect: A Language for Gradient Field Intelligences

## Signal Units

The basic unit is a **chemical emission** — a release of one or more chemical species into the medium:
- **Chemical identity** (family): the semantic category (affiliative, territorial, urgency, historical, identity)
- **Concentration**: emphasis, certainty, urgency — continuous scale from trace to saturating
- **Decay rate**: the temporal register — how long this statement is meant to last
- **Gradient direction**: which way the concentration increases — spatial grammar, address, deixis
- **Co-release ratio**: when two chemicals are emitted simultaneously, their ratio encodes relationship and degree

No phonemes. No words. No grammar in the sequential sense. Just chemistry in space and time.

## Combinatorics

### Co-release (AND / COMPOUND MEANING)
Two chemicals released simultaneously. Meaning is not additive — the chemical interaction at receptor sites creates emergent semantics neither compound carries alone.

Example: `[affiliative-series] + [identity-series]` at gradient pointing toward speaker = "I am welcoming you specifically; come to me"

### Gradient Direction (TOWARD / FROM / SPATIAL GRAMMAR)
The direction of concentration increase is grammatically significant. Toward speaker = first person / invitation. Away from speaker = second person / command. Toward substrate = objective / permanent record. Diffuse = broadcast.

Example: `[urgency-series]` with gradient pointing away = "go — away from here — now"

### Concentration Ratio (DEGREE / COMPARISON)
The absolute and relative concentrations of co-released compounds encode quantity, degree, priority. Very high concentration of a primary = extreme emphasis. Equal concentrations of two compounds = equivalence/reciprocity.

### Inhibition (NOT / NEGATION)
Chemical suppression: releasing an inhibitor alongside a primary emitter physically prevents the primary from binding to receptors. Negation is a chemistry problem, not a grammatical particle.

Example: `[affiliative-series] + [affiliative-inhibitor]` = "I am withdrawing affiliation / no"

### Pulse Train (REPEAT / URGENCY / RHYTHM)
Brief high-concentration bursts of the same chemical in rapid succession. Pattern is recognizable. Some pulse rhythms are conventional (ritual greetings, warning sequences).

### Substrate Marking (DECLARE / PERMANENT / VOW)
Depositing a compound that bonds to the substrate surface rather than diffusing. This is the permanent register — declaration, territorial claim, identity monument. Not subject to dilution.

## Semantic Fields

Chemolect has no words. It has **chemical configurations**:

| Human Approximation | Chemolect Structure |
|---------------------|---------------------|
| "I am here" | Sustained low-level identity-series from body surface; spherical diffusion |
| "Come here" | High-concentration affiliative; gradient pointing toward speaker; medium decay |
| "Danger" | High-concentration threat-series; fast decay; strong directional gradient away |
| "This is mine" | Territorial-stable + identity-series bonded to substrate boundary line |
| "I remember you" | Historical-series at medium concentration, gradient toward the remembered individual's last known location |
| "Remember me" | Full identity-series at maximum fidelity, permanent substrate bond; BZ-like reaction-diffusion pattern |
| "I agree" | Pulse train of affiliative-series at moderate concentration, directed toward other |

## Example Utterances

### Utterance 1: "Come here"
```
Signal: [primary: affiliative-series, high concentration at source]
        [gradient: radially decreasing from speaker center]
        [decay: medium — sustained invitation]
        [diffusion: asymmetric from medium current]
        [pulse: slow rhythmic increase — speaker still releasing]

Visual: The speaker is at center. High concentration (bright amber-yellow) at the source.
        Concentration falls off radially following diffusion physics.
        The field is not a perfect circle — medium currents create asymmetry,
        and the diffusion edges are soft and biologically irregular.
        Faint directional arrows in the mid-concentration zone indicate gradient direction.
        The gradient points inward, toward the speaker: follow it to find them.
        A faint outer ring marks the current diffusion boundary, slowly expanding.
        The whole field pulses slowly (sustained release, not a one-time event).
```

### Utterance 2: "This is mine"
```
Signal: [primary: territorial-stable + identity-series]
        [deposit: substrate-bonded — this is a substrate mark, not a diffusion]
        [boundary: S-curved natural line, not geometrically perfect]
        [pattern: Turing reaction-diffusion along boundary — the identity fingerprint]
        [decay: near-permanent — slow-decay substrate bond]
        [inside: warm, chemically rich territory; outside: void]

Visual: A territorial boundary line curves across the field.
        The line is not straight — chemistry diffuses and bonds with natural irregularity.
        Along the boundary, a Turing-like activation-inhibition pattern creates
        a repeating motif: this is the speaker's identity signature, encoded in spot spacing.
        The spacing ratio between activation and inhibition scales is unique to this individual.
        Inside the boundary: the void_weaver's territory — slightly warmer color, higher chemistry.
        Outside: nearly void, just trace signals.
        The boundary breathes at near-zero frequency (permanent mark with slight biological rhythm).
```

### Utterance 3: "Remember me"
```
Signal: [primary: full identity-series at maximum fidelity]
        [deposit: permanent substrate bond — the most stable chemical available]
        [pattern: Belousov-Zhabotinsky oscillating + Turing fingerprint overlay]
        [decay: near-zero — this outlasts the speaker]
        [reaction front: slowly advancing outward]
        [core: richly textured inner deposit from earliest reaction]

Visual: A rich, complex reaction-diffusion pattern spreads from center.
        The inner core glows intensely — the original deposition point,
        where the chemical first bonded to substrate.
        BZ-like spiraling oscillations rotate slowly through the deposit.
        Turing spot patterns overlay the spirals: fine details that constitute
        the speaker's identity at maximum resolution.
        The reaction front advances slowly outward — still expanding.
        When it reaches equilibrium, the pattern will cycle stably forever.
        Color: amber-gold identity deposit against blue-teal substrate background.
        This is not communication to any specific individual.
        It is communication to time itself.
```

---

## GLSL Signal Visualization

The three shaders render Chemolect as chemical concentration fields.
Color encodes chemical concentration: amber-gold = high, dark void = ambient.
Spatial distribution and gradient direction are the primary carriers of meaning.

- `signals/chemolect_utterance_01.frag` — radial concentration gradient, invitation
- `signals/chemolect_utterance_02.frag` — territorial boundary, Turing identity mark
- `signals/chemolect_utterance_03.frag` — permanent identity monument, reaction-diffusion

---

*The void_weaver has no concept of "saying something and taking it back." Chemical emissions are released into a world that absorbs and holds them. The past is the residue of everything that was ever said. This is not a metaphor — the past is literally still present, at lower concentration, in the medium you are standing in.*
