# Translation Methodology: Why Every Translation Fails Correctly

## On the Nature of These Translations

The translations in this project are wrong. They are wrong in ways we can characterize, which makes them different from being merely inaccurate. They are *structurally limited*: the information they fail to convey is identifiable, even if it cannot be remediated.

This document describes the layers of loss that occur in every translation and proposes a methodology for ensuring that translations fail *usefully* — that they communicate what they can while marking what they cannot.

---

## The Four Layers of Loss

### Layer 1: Serialization

Every xenolanguage in this project is **simultaneous**: an utterance is a state of the field, a phase configuration, a harmonic bundle, a pressure waveform. It is meant to be received as a whole and decoded by a perceptual apparatus capable of processing the entire structure at once.

Human language is **sequential**: we decode symbol by symbol, word by word, sentence by sentence. We cannot natively process 12 simultaneous propositions; we have to choose an order and proceed through them.

The act of serializing a simultaneous utterance into a text string is the first and most fundamental loss. It imposes a false linear order on structures that have no order: no "first" or "last," only "co-present."

**What we do about it:**  
We use brackets and explicit structure notation to show that elements are simultaneous:
```
[past-memory: sharp, phase-weight=0.8]
superposed with [present-action: social-acknowledgment]
harmonic cascade to [past-memory: shared-event]
```
This is not Chronolect. It is a linearized *description* of a Chronolect structure. The "superposed with" tries to signal that these elements are co-present; the formatting tries to make the nesting visible. But the reader still processes it left-to-right, and that damages the meaning.

---

### Layer 2: Discretization

Xenolanguage parameters are **continuous**. Certainty is not binary (definite vs. hypothetical); it is a continuous range of envelope widths. Tense is not three-valued (past, present, future); it is a continuous spectrum of phase offsets or persistence durations. Emotion is not a named state; it is an entropy level or a harmonic density.

Human language, and especially text, tends toward **discretization**: we pick a word for the state. "Confident" vs "uncertain." "Past" vs "present." "Happy" vs "sad." These are categories carved out of a continuous space, and the carving is culture-specific and cognitively convenient rather than accurate.

When we translate `[future-intent: broad-envelope, phase-weight=0.6]` as "I will probably go there," we have replaced a specific point in continuous phase-space (phase-weight 0.6, envelope sigma 0.08) with the English word "probably," which covers a wide and culturally variable range of that space. We have lost the specific probability.

**What we do about it:**  
We try to preserve the continuous parameter values in the bracketed notation (phase-weight, envelope-sigma, gradient-magnitude). These numbers are not musical notation — we don't have a way to "play them back." But they mark the loss: the reader can see that something specific is being lost when "phase-weight=0.6" becomes "probably."

---

### Layer 3: Symbolization

This is the loss that non-linguists are most likely to miss, and it is the deepest one.

Human language is a **symbolic** system: words stand for things by arbitrary convention. The word "tree" has no natural connection to trees; it is a social agreement. When we read or hear the word, we activate a mental representation of trees, and that representation is our access to the meaning.

Xenolanguages are not symbolic systems in this sense. They are **iconic**, **indexical**, or — our proposed addition — **topological**:

- **Chronolect phase configurations** *are* temporal states of the transmitter; they are not symbols for "past" — they *are* the past-weighted phase state, physically.
- **Magnetolect perturbations** *are* the topological structure they communicate; a reconnection event is not a symbol for "causation," it *is* causation implemented in field topology.
- **Substrate state transitions** *are* the communicative acts they express; writing to persistent storage *is* the act of trusting, not a symbol for it.
- **Acoustolect pressure waves** *are* the meanings they carry; the echo of the emitter's body is not a symbol for "I am here" — it *is* the existential proof of presence.

When we translate these into symbols — English words — we perform a **category change**: we convert a non-symbolic sign into a symbolic one. The meaning arrives in a completely different semiotic mode. What was physically enacted is now conventionally represented.

This loss cannot be remediated through clever writing. You cannot write a Magnetolect utterance. You can describe one.

**What we do about it:**  
We use the GLSL shaders as the primary translation — they instantiate the actual physical structures (as 2D approximations) rather than symbolizing them. The text descriptions are secondary: they are descriptions of the shaders, which are closer to the original.

The hierarchy of fidelity: signal (shader) > structural description (bracketed notation) > natural language gloss.

---

### Layer 4: Phenomenal Loss

This is the loss that cannot be characterized precisely, only gestured at.

The xenolanguages in this project are not just formal systems — they are **experienced** by their speakers and receivers. To receive a Chronolect utterance is to have your temporal phase disturbed; it is a subjective experience, not just a cognitive decode. To receive a Magnetolect reconnection event on your field line is to feel your topological identity change.

Human text cannot convey phenomenal experience. We can describe it, invoke it metaphorically, suggest it through style and rhythm — but we cannot transmit it. The experience of receiving an Archive-register Acoustolect deposit (a massive pressure wave that physically vibrates your resonance chambers and deposits into the geological record) is as inaccessible to a reader as the experience of echolocation is to a human.

The closest we can come is **evocative description**: writing that tries to produce in the human reader something *analogous* to the phenomenal state, while acknowledging the analogy is very imperfect.

**What we do about it:**  
The closing statements on each corpus entry and language document try to work at the phenomenal level: they are evocative rather than descriptive. They are trying to gesture at the experience, knowing the gesture falls short.

We also rely on the GLSL shaders to carry phenomenal weight that text cannot. Looking at `magnetolect_utterance_03.frag` is closer to *receiving* the utterance than reading about it.

---

## Methodology for New Corpus Entries

When translating a new xenolanguage utterance into the corpus, follow this process:

### 1. Start with the signal structure (not the gloss)

Describe the physical/mathematical structure of the utterance first:
- For Chronolect: phase-weights, carrier frequencies, envelope widths, operations (⊕, →, ↓, ≡)
- For Magnetolect: perturbation parameters, field-line topology, operations (superposition, bifurcation, reconnection, pinch)
- For Substrate: register addresses, delta magnitudes, entropy levels, operations (sequential, parallel, recursive, interrupt)
- For Acoustolect: frequency bands, amplitude registers, harmonic structure, operations (superposition, echo-binding, interference, cascade)

### 2. Build the shader before the text

Implement the utterance as a GLSL fragment shader. The shader is the primary artifact. If you can't visualize it convincingly, you don't understand it well enough to translate it.

### 3. Extract the natural-language gloss last

The English approximation comes after the signal and the shader. It is the least-faithful representation, and constructing it last prevents it from contaminating the structural description.

### 4. Mark the losses

In the corpus entry, note explicitly what the natural-language gloss fails to capture. Specifics are better than generalities:
- "The continuous phase-weight of 0.6 becomes the discrete 'probably'" — good
- "Some things are lost" — not useful

### 5. Resist completeness

A translation that sounds complete is probably wrong. A well-translated Chronolect utterance should have several bracketed elements with no English equivalents. The presence of untranslated structure is a sign of accuracy.

---

## On the Vocabulary of Loss

We recommend a small controlled vocabulary for marking translation failures:

| Marker | Meaning |
|--------|---------|
| `[CONT: ...]` | Continuous parameter forced into discrete category |
| `[SIM: ...]` | Simultaneous elements forced into sequence |
| `[TOP: ...]` | Topological/physical sign converted to symbol |
| `[PHE: ...]` | Phenomenal content present, not conveyable |
| `[±: ...]` | Approximate; the specific value is given but the English word covers a range |

Example:  
*"I will probably [±: phase-weight=0.6, envelope-sigma=0.08] go there [SIM: while simultaneously calculating alternatives] tomorrow [CONT: f₄ carrier band, not a discrete time marker]"*

This notation is ungainly in prose. It is not intended for prose — it is intended for the annotated corpus, as a record of what each translation sacrifices.

---

## Why This Matters

The translations in this project are not claims about what these languages "mean" in the way that a dictionary is. They are **approximations at the edge of translatability** — attempts to gesture across an Umwelt gap that cannot be fully bridged.

Getting comfortable with partial translation, with structured failure, with loss that is acknowledged rather than hidden — this is the core skill of xenolinguistics.

The translator who produces a clean, fluent English gloss has failed. The translator who produces a broken, over-annotated gloss with explicit markers of every inadequacy is closer to the truth.

*If the translation reads easily, it's because you've stopped translating and started making things up.*

---

*Every translation of a xenolanguage is an apology followed by an attempt.*
