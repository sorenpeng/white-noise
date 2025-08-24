### Debugging Plan for Production Build Errors

Here is a breakdown of the steps to resolve the TypeScript errors found during the `pnpm build` process.

#### 1. Address `<style jsx>` Errors

*   **Files Affected**:
    *   `src/components/DynamicBackground.tsx`
    *   `src/components/Toast.tsx`
*   **Error**: `Property 'jsx' does not exist on type 'DetailedHTMLProps<StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>'`
*   **Analysis**: The `<style jsx>` syntax is a feature specific to Next.js and is not supported by default in a Vite project.
*   **Solution**:
    1.  Remove the `<style jsx>` blocks from both components.
    2.  Create separate CSS files for each component (e.g., `DynamicBackground.module.css` and `Toast.module.css`).
    3.  Import the new CSS modules into their respective component files.
    4.  Apply the styles using the `className` prop and the imported style objects.

#### 2. Correct Invalid Component Props

*   **Files Affected**:
    *   `src/components/PulsingCircle.tsx`
    *   `src/components/ShaderBackground.tsx`
*   **Errors**:
    *   `Property 'spotsPerColor' does not exist on type 'IntrinsicAttributes & PulsingBorderProps'`.
    *   `Property 'backgroundColor' does not exist on type 'IntrinsicAttributes & MeshGradientProps'`.
    *   `Property 'wireframe' does not exist on type 'IntrinsicAttributes & MeshGradientProps'`.
*   **Analysis**: These components are being passed props that are not defined in their respective type definitions.
*   **Solution**:
    1.  **For `PulsingCircle.tsx`**: Review the `PulsingBorderProps` type definition. If `spotsPerColor` is a valid prop that was simply omitted, add it to the type. Otherwise, remove the `spotsPerColor` prop from the component invocation.
    2.  **For `ShaderBackground.tsx`**: Review the `MeshGradientProps` type definition. Remove the `backgroundColor` and `wireframe` props from the component invocation, as they appear to be unsupported. There might be alternative props to achieve the same effect (e.g., passing colors via a `colors` array).

#### 3. Resolve `EmotionParameters` Type Mismatch

*   **Files Affected**:
    *   `src/hooks/useAudioEngine.ts`
    *   `src/pages/Home.tsx`
    *   `src/types/ritualRadio.ts`
*   **Error**: `Property 'tempo' is missing...` and `Object literal may only specify known properties, and 'speed' does not exist...`
*   **Analysis**: There is a naming inconsistency between the `EmotionParameters` type and how it's being used. The type expects a `tempo` property, but the code is providing `speed`.
*   **Solution**:
    1.  In `src/hooks/useAudioEngine.ts`, when calling `updateAudioParameters`, change the property name from `speed` to `tempo`.
    2.  In `src/pages/Home.tsx`, when creating the `EmotionParameters` object, change the property name from `speed` to `tempo`. This will align the usage with the type definition in `src/types/ritualRadio.ts`.