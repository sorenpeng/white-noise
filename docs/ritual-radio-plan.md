# Plan for Reconstructing Page Interaction: Ritual Radio

This document outlines the plan to refactor the user interaction based on the "Ritual Radio" concept.

## 1. Core Concepts

- **One-stroke Emotion**: The user expresses their current emotion by drawing a single, continuous curve on the screen.
    - **Energy**: Determined by the overall vertical displacement of the curve.
    - **Brightness**: Determined by the average speed of the touchpoint.
    - **Tempo**: Determined by the rate of change in the curve's local amplitude.
- **Instant Feedback**: The audio-visual experience begins less than 800ms after the user's finger or mouse is lifted from the screen.
- **Minimalist UI**: The interface will consist of a full-screen Canvas and a text prompt. There will be no explicit UI controls like sliders or buttons. All interactions are gesture-based.

## 2. User Flow (3-Step Process)

1.  **Entry (`idle` state)**
    *   **Trigger**: User lands on the page.
    *   **System Response**:
        *   Display the prompt: "把今天的心情画成一笔" (Draw today's mood in one stroke).
        *   Show a soft, blurry gradient background.
        *   Display a non-animating indicator for the gesture area.

2.  **Drawing (`drawing` state)**
    *   **Trigger**: `PointerDown` followed by `PointerMove` for at least 200ms.
    *   **System Response**:
        *   Render a 2px semi-transparent trail in real-time under the user's pointer.
        *   Provide subtle haptic feedback (10ms).
    *   **Backend Logic**: Dynamically record an array of pointer positions and corresponding timestamps.

3.  **Generation & Playback (`generating` -> `playing` state)**
    *   **Trigger**: `PointerUp`.
    *   **System Response**:
        *   The drawn trail blurs and merges into the background.
        *   The subtitle "Ritual Radio 开始播放" (Ritual Radio starts playing) fades in.
        *   Audio and font animations start based on the generated parameters.
        *   The page title updates to a "5:00" countdown timer.
    *   **Backend Logic**: Map the characteristics of the drawn trail to `energy`, `brightness`, and `tempo` parameters. Transition state to `playing`.

4.  **Completion/Reset**
    *   **Trigger**: The 5-minute countdown finishes, or the user clicks the "↺ 再来一笔" (Try another stroke) button.
    *   **System Response**: The application resets to the `idle` state.
    *   **Optional**: When the countdown ends, the system can automatically switch to a low-speed "pre-sleep loop" mode.

## 3. Visual Layer Details

- **Curve Rendering**:
    - Use Bezier smoothing for a fluid, continuous line.
    - Apply a 30px inner-shadow to the start and end points of the curve.
    - A 4px blurred halo surrounds the pointer, with its color transitioning from warm orange (low brightness) to electric blue (high brightness).
- **Font Animation (Breathing Effect)**:
    - Use the `Roboto Flex` variable font.
    - Animate the `wght` axis between 300 and 900, and the `GRAD` axis between -50 and +100.
    - The animation's rhythm is synchronized with the `tempo`.
    - `energy` controls the amplitude of the `wght` variation.
    - `brightness` controls the offset of the `GRAD` variation.
- **Background Gradient**:
    - The base HSL color is mapped from the three core parameters:
        - **H (Hue)**: 200°–340° (Calm to Passionate)
        - **S (Saturation)**: 30%–70%
        - **L (Lightness)**: 15%–65%
    - The gradient's angle rotates 360° slowly every 8 seconds.

## 4. Audio Layer Details

- **Parameter Mapping**:
    - **Energy**: Mapped to `Master Gain` and `Reverb Wet` (0.3 to 0.8). Low energy feels intimate and close; high energy creates a vast, spacious soundscape.
    - **Brightness**: Mapped to a `Low-pass Cutoff` filter (300 Hz to 4 kHz). Darker moods have a muffled, low-frequency sound; brighter moods are crisp and high-frequency.
    - **Tempo**: Mapped to `Transport BPM` (50 to 110). This controls the "breathing" speed of the audio and synchronized text animations.

## 5. State Machine (4 States)

- **`idle`**: Waiting for user input.
- **`drawing`**: Actively collecting user's gesture data (trajectory).
- **`generating`**: (≤ 800 ms) Calculating parameters and scheduling audio/visual resources.
- **`playing`**: 5-minute countdown is active, and the audio-visual experience is running.

- **Transitions**:
    - `idle` → `drawing` (on `PointerDown`)
    - `drawing` → `generating` (on `PointerUp`, if trajectory length > 200px)
    - `generating` → `playing` (once all resources are ready)
    - `playing` → `idle` (when countdown reaches 0 or user clicks reset)

## 6. Edge Cases and Usability

- **Short Trajectory**: If the user only clicks or draws a very short line, show a toast notification: "再长一点，让我听见你的情绪～" (A little longer, let me hear your emotion~).
- **WebAudio Activation**: On mobile, if the WebAudio context has not been activated, prompt the user with "点我开启声音" (Click me to enable sound) upon the first interaction.
- **Dark Mode Support**: In the `idle` state, the background should respect the system's dark mode settings. Once an emotion is drawn, the generated color scheme will take precedence.

## 7. Visualization Models (For Development)

- **Component Tree**: `App` → `CanvasLayer (Handles Gestures)` + `AudioEngine` + `TypographyLayer` + `HUD (Heads-Up Display for countdown/reset)`
- **Sequence Diagram**: Key objects include `User`, `GestureHandler`, `ParameterMapper`, `AudioSynthesizer`, `VisualSynthesizer`, `HUD`.
- **State Diagram**: A diagram with four state nodes and labeled transition arrows for `PointerDown`, `PointerUp`, `TimerEnd`, and `ResetClick`.