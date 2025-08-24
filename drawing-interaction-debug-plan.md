# 调试与修复计划：恢复核心绘制交互

本文档旨在解决在替换了新的 `ShaderBackground` 组件后，应用核心的“划线交互”功能失效的问题。我们将根据 `ritual-radio-plan.md` 的核心设计，恢复并优化用户绘制体验。

## 1. 问题分析 (Problem Analysis)

在集成了 `ShaderBackground` 作为新的动态背景后，原有的 `RitualCanvas` 组件无法再响应用户的鼠标或触摸事件。

- **根本原因推测**: 新的 `ShaderBackground` 组件及其内部的 `MeshGradient` 元素位于页面顶层或具有更高的 `z-index`，并且捕获了所有的指针事件（pointer events）。这导致事件无法“穿透”背景层，到达下方的 `RitualCanvas` 绘图画布，使得用户的所有绘制操作都无法被监听。

## 2. 调试步骤 (Debugging Steps)

为了验证上述推测，我们需要进行以下检查：

1.  **事件传播验证**:
    -   **方法**: 在 `RitualCanvas` 组件的 `onStartDrawing`, `onAddPoint`, `onEndDrawing` 等事件处理器中临时加入 `console.log` 语句。
    -   **目的**: 检查当用户在屏幕上进行绘制操作时，控制台是否有相应的日志输出。如果没有，则证明事件确实被上层元素拦截了。

2.  **CSS层叠上下文检查 (Stacking Context)**:
    -   **方法**: 使用浏览器开发者工具的“元素”面板，检查 `ShaderBackground`、其内部的 `MeshGradient` 元素，以及 `RitualCanvas` 的 `z-index`、`position` 和 `opacity` 等属性。
    -   **目的**: 明确各个元素的视觉层级关系，确认 `RitualCanvas` 是否被其他不透明或可交互的元素完全遮挡。

3.  **指针事件穿透测试**:
    -   **方法**: 在开发者工具中，手动为 `ShaderBackground` 及其子元素（特别是绝对定位的 `MeshGradient`）添加 `pointer-events: none;` 样式。
    -   **目的**: 观察添加此样式后，绘制交互是否恢复。如果恢复，则证明问题就是由指针事件拦截引起的。

## 3. 实施计划 (Implementation Plan)

在定位问题后，我们将按以下步骤进行修复，以确保交互的恢复和稳定性。

1.  **修改 `ShaderBackground.tsx`**:
    -   **核心操作**: 为内部的两个 `MeshGradient` 组件的 `style` 属性或 `className` 添加 `pointer-events: none`。
    -   **代码示例**:
        ```tsx
        <MeshGradient
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: 'none' }}
          // ... other props
        />
        <MeshGradient
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: 'none', opacity: getOpacity() }}
          // ... other props
        />
        ```
    -   **理由**: 这将使着色器背景层在视觉上存在，但对鼠标和触摸事件“透明”，允许事件向下传递到 `RitualCanvas`。

2.  **调整 `Home.tsx` 的布局和层级**:
    -   **目标**: 确保 `RitualCanvas` 在正确的层级，既能在背景之上，又不会遮挡最终播放状态下的UI元素。
    -   **建议结构**:
        ```tsx
        <ShaderBackground>
          {/* 主要内容区域，包含状态文本等 */}
          <div className="relative z-20 w-full h-full">
            {renderContent()}
          </div>

          {/* Canvas绘制层 - z-index介于背景和前景UI之间 */}
          {(ritualState.currentState === 'idle' || ritualState.currentState === 'drawing') && (
            <div className="absolute inset-0 z-10">
              <RitualCanvas {...props} />
            </div>
          )}
          
          {/* 其他顶层UI，如脉冲圆圈 */}
          <div className="absolute bottom-8 right-8 z-30">
            <PulsingCircle {...props} />
          </div>

          {/* Toast提示 */}
        </ShaderBackground>
        ```
    -   **理由**: 通过明确的 `z-index` 划分（背景 `z-0`，画布 `z-10`，内容 `z-20`，前景 `z-30`），可以建立一个清晰、无冲突的层叠上下文，确保事件和视觉元素的正确表现。

3.  **（可选）优化 `RitualCanvas.tsx` 的视觉效果**:
    -   **背景适应性**: 新的着色器背景比之前的纯色背景更复杂。需要检查绘制出的线条轨迹是否清晰可见。
    -   **调整建议**: 可能需要调整 `RitualCanvas` 中绘制线条的颜色（例如，使用对比度更高的白色或动态反色）、宽度或模糊/发光效果，以确保在任何背景颜色下都有良好的可见性。

## 4. 验证阶段 (Validation)

完成上述修改后，需要对完整的用户流程进行测试，以确保所有功能正常：

1.  **`idle` 状态**: 页面加载后，应能看到背景和绘制提示。
2.  **`drawing` 状态**: 在屏幕上拖动鼠标或手指，应能实时绘制出平滑的轨迹。
3.  **`generating` -> `playing` 状态**: 松开鼠标或手指后，应用应能正确过渡到播放状态，并根据绘制的轨迹启动相应的音视觉效果。
4.  **重置功能**: 点击重置按钮或倒计时结束后，应用应能顺利返回 `idle` 状态。
5.  **其他交互**: 确保 `PulsingCircle` 和其他UI元素的交互（如果存在）未受影响。