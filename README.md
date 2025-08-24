# Ritual Radio

## Introduction: From a Spark of an Idea to a Deployed Product

This document chronicles the journey of creating "Ritual Radio," a white noise application developed for the Trae Solo Mini Hackathon. In just a few hours, a simple concept—transforming a user's mood into a personalized soundscape—was brought to life. This is the story of how it happened, from the initial brainstorming and planning to the technical implementation, debugging, and final deployment.

## The Core Concept: "Ritual Radio"

The project began with a simple yet powerful idea: what if you could capture your mood in a single gesture and have it instantly transformed into a unique audio-visual experience? This concept, which we named "Ritual Radio," was designed to be a departure from traditional white noise apps. Instead of complex controls and menus, we opted for a minimalist, gesture-based interface that would feel intuitive and personal.

The core interaction was designed to be a three-step process:

1.  **Idle:** The user is greeted with a simple prompt: "Draw today's mood in one stroke."
2.  **Drawing:** The user draws a continuous line on the screen, with the characteristics of the line—speed, displacement, and curvature—being captured in real-time.
3.  **Playing:** As soon as the user lifts their finger, the drawn line transforms into a unique soundscape and visual animation that reflects the "emotion" of the drawing.

This "one-stroke emotion" concept was the guiding principle behind all subsequent design and development decisions.

## The Technical Blueprint: A 3-Hour Action Plan

With a clear concept in mind, the next step was to create a technical plan that could be executed within the tight timeframe of the hackathon. The plan, detailed in `plan.md`, outlined the key technologies and a phased approach to development:

*   **Audio Core:** We chose **Tone.js**, a powerful Web Audio framework, to build the audio engine. This allowed for the rapid creation of a signal chain that included oscillators, noise synthesizers, filters, and reverb.
*   **Visuals and Animation:** For the visual component, we decided to use **variable fonts** (Roboto Flex) to create a "breathing" text effect that would synchronize with the audio. The background would be a dynamic gradient generated based on the user's input.
*   **User Input:** We used **Pointer Events** to capture the user's drawing gestures, allowing for a unified experience across desktop and mobile devices.

The development process was broken down into a tight schedule, with specific time allocations for setting up the project, building the audio engine, creating the animations, and preparing for the demo.

## Building the Audio Engine: The Heart of the Experience

The core of "Ritual Radio" is its ability to translate a user's drawing into a unique soundscape. This was achieved through a parameterized audio engine, as described in `core-audio-logic.md`. The engine is built around three key parameters:

*   **Energy:** This parameter, derived from the vertical displacement of the user's drawing, controls the overall volume and the "wetness" of the reverb, creating a sense of space and fullness.
*   **Brightness:** Determined by the speed of the user's drawing, this parameter controls a low-pass filter, making the sound brighter and crisper or warmer and more muffled.
*   **Tempo:** The rate of change in the curve's amplitude is mapped to the tempo of the audio, controlling the "breathing" speed of the soundscape and the synchronized text animations.

This parametric approach allowed for a wide range of audio-visual experiences to be generated from a single, simple input.