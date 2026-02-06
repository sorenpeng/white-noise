太棒了，这个点子很“可感”也很适合 3 小时的 mini 黑客松。下面是一份**落地向 research + 实施蓝图**，直接照着做就能演示。

# 1) 竞品 & 差异

* **Endel**：AI 实时生成、主打专注/睡眠场景，声音会随环境与心率变化；有配套的抽象视觉。你可以借鉴它的“持续流”逻辑，但用**极简输入（拉一条线/三滑杆）+ 更强的仪式感字体动画**差异化。 ([Endel][1], [Apple][2])
* **Noisli**：多声源混音、可保存组合，更像“声音控制面板”。你的方案更像“一键生成的 5 分钟音景 + 封面”，操作更轻。 ([Noisli][3])
* **myNoise**：超丰富的可调噪声发生器和场景库，交互偏重微调。你走“少即是多”的情绪化演出路线。 ([MyNoise][4])

# 2) 技术路线（3 小时能跑）

* **音频内核**：Web Audio + Tone.js（内置合成器、效果器、全局 Transport 计时和调度）。用它能快速搭好振荡器/噪声源→滤波→混响→母线。 ([MDN Web Docs][5], [tonejs.github.io][6])
* **变量字体动画**：选 Google Fonts 的 **Roboto Flex**（轴多且开源），用 `font-variation-settings` 驱动 wght/wdth/GRAD/YTAS 等轴做“呼吸”。 ([Google Fonts][7], [MDN Web Docs][8])
* **手势/滑杆输入**：Pointer Events（移动端统一事件），若要做“一笔成像”，可用 `getCoalescedEvents()` 拿到高精度轨迹。([MDN Web Docs][9])
* **声画同步**：用 Web Audio `AnalyserNode` 取能量/峰值，驱动字体“呼吸”或背景脉动。([MDN Web Docs][10])
* **离线导出（可选）**：“今日封面”用 `<canvas>` 导出 PNG；音频可用 `OfflineAudioContext` 快速渲染 5 分钟 WAV（若时间不够就先不做）。([MDN Web Docs][11], [mdn.github.io][12])

# 3) 三滑杆 → 声音 & 字体映射（开箱即用）

**维度定义**

* 能量（Energy）：从冥想到充沛
* 明暗（Brightness）：从温暖暗到清亮明
* 速度（Speed）：慢呼吸到轻快脉动

**参数矩阵（示例）**

* **Energy** ↑ → `gain`（音量）、`distortion/waveshaper` 少量、混响 `wet` 从 0.2→0.5；字体 **wght** 从 300→800。([MDN Web Docs][13])
* **Brightness** ↑ → 低通/搁架 EQ 截止频率上扬、波形从正弦→锯齿的占比；字体 **GRAD**/**opsz** 微调，字面更“通透”。([MDN Web Docs][14])
* **Speed** ↑ → `Tone.Transport.bpm` 50→110、LFO 频率↑；字体“呼吸频率”加快（关键帧/JS 驱动）。([tonejs.github.io][15], [GitHub][16])

# 4) 声音配方（稳、好听、快速）

* **源**：Sine（基底）+ Pink/Brown Noise（质感）混合。`OscillatorNode` + `NoiseSynth/Player`。([MDN Web Docs][14])
* **滤波**：`BiquadFilter` 低通/高架。
* **空间**：`Reverb` 或 `Freeverb`（Tone 内置），注意 `ready` 异步。([tonejs.github.io][17])
* **节拍/律动**：`Tone.Transport.scheduleRepeat()` 做轻微侧链/脉冲（例如每小节轻推总线 gain 1–2dB）。([tonejs.github.io][15])

# 5) UI/动效要点

* **启动**：移动端需用户手势 `Tone.start()` 才能出声（第一步点“开始仪式”）。([tonejs.github.io][6])
* **字体呼吸**：用 CSS 变量驱动 `font-variation-settings`；若要更顺滑，可注册自定义属性再动画（避免离散插值）。([MDN Web Docs][18])
* **封面**：根据三维度生成渐变（H/S/L 映射），叠加当天日期与一句“电台签语”，导出 PNG。

# 6) 代码骨架（可直接贴）

**Audio（Tone.js）**

```js
import * as Tone from "tone";

const master = new Tone.Gain(0.6).toDestination();
const reverb = new Tone.Reverb({ decay: 4, wet: 0.25 }).connect(master);
await reverb.ready; // 重要：异步 :contentReference[oaicite:16]{index=16}

const osc = new Tone.Oscillator({ type: "sine", frequency: 220 }).connect(reverb);
const noise = new Tone.Noise("pink").connect(new Tone.Filter({ type: "lowpass", frequency: 800 })).connect(reverb);

document.querySelector("#start").addEventListener("click", async () => {
  await Tone.start();  // 必须由用户手势触发 :contentReference[oaicite:17]{index=17}
  osc.start(); noise.start();
  Tone.Transport.start();
});

// 映射函数（0–1）
function applyParams({ energy, bright, speed }) {
  master.gain.rampTo(0.3 + energy * 0.5, 0.2);                 // Energy→音量
  reverb.wet.rampTo(0.15 + energy * 0.35, 0.2);                 // Energy→空间
  const cutoff = 400 + bright * 4000;                           // Bright→明亮度
  reverb.preDelay = 0.01 + bright * 0.04;
  Tone.Transport.bpm.rampTo(50 + speed * 60, 0.5);              // Speed→BPM :contentReference[oaicite:18]{index=18}
  // …可继续映射噪声/波形比例等
}
```

**字体（变量字体）**

```html
<link href="https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght,GRAD@8..144,300..1000,-200..150" rel="stylesheet"> <!-- Roboto Flex --> <!-- :contentReference[oaicite:19]{index=19} -->
<style>
:root {
  --wght: 400; --wdth: 100; --grad: 0; --breath: 6s;
}
.h1 {
  font-family: "Roboto Flex", system-ui, sans-serif;
  font-variation-settings: 
    "wght" var(--wght), "wdth" var(--wdth), "GRAD" var(--grad); /* MDN 指南 */ /* :contentReference[oaicite:20]{index=20} */
  animation: breathe var(--breath) ease-in-out infinite;
}
@keyframes breathe {
  0%,100% { font-variation-settings: "wght" calc(var(--wght) - 40), "wdth" var(--wdth), "GRAD" calc(var(--grad) - 20); }
  50%     { font-variation-settings: "wght" calc(var(--wght) + 40), "wdth" var(--wdth), "GRAD" calc(var(--grad) + 20); }
}
</style>
```

**滑杆 → 声画联动**

```js
const sliders = { energy: 0.4, bright: 0.5, speed: 0.4 };
function update() {
  applyParams(sliders);
  // 明暗/能量映射到字体轴
  document.documentElement.style.setProperty('--wght', String(300 + sliders.energy * 600));
  document.documentElement.style.setProperty('--grad', String(-50 + sliders.bright * 150));
  document.documentElement.style.setProperty('--breath', `${6 - sliders.speed * 3}s`);
}
["energy","bright","speed"].forEach(id=>{
  document.getElementById(id).addEventListener("input", e=>{
    sliders[id] = e.target.valueAsNumber;
    update();
  });
});
update();
```

# 7) Demo 脚本（30–60 秒）

1. 让评委各自拉一次三滑杆（或“一笔成线”）。
2. 点击“开始仪式”→ 即刻出声；同时大标题呼吸、粗细随音色变化。
3. 切到“寝前循环模式”：`BPM` 降到 55 左右、混响更湿、滤波更低，展示更慢的字形呼吸。([tonejs.github.io][15])
4. 点击“生成今日封面”→ 导出 PNG（屏幕展示）。([mdn.github.io][12])

# 8) 3 小时排期

* **0:00–0:20** 脚手架 + 引入 Tone.js/字体 + 基础 UI（3 滑杆 + Start）。 ([tonejs.github.io][6])
* **0:20–1:00** 音频链路（源→滤波→混响→母线），映射三滑杆。 ([tonejs.github.io][17])
* **1:00–1:30** 字体呼吸动画 & 声画同步（BPM→动画时长）。 ([MDN Web Docs][8])
* **1:30–2:10** “今日封面”Canvas 导出。 ([mdn.github.io][12])
* **2:10–2:30** “寝前循环模式”预设（更慢 BPM、更暗、更湿）。 ([tonejs.github.io][15])
* **2:30–3:00** 移动端手势出声、音量防削顶、演示串词。

# 9) 风险 & 规避

* **移动端自动播放限制**：务必用按钮触发 `Tone.start()`。([tonejs.github.io][6])
* **性能**：混响属重效果，衔接在母线，`wet` 控制在 0.2–0.4；必要时换轻量 `Freeverb`。([tonejs.github.io][19])
* **字体支持**：变量字体已主流支持，使用标准轴 + `font-variation-settings`。([MDN Web Docs][8])

# 10) 可选加分（若时间有余）

* **一笔成像**：用 `getCoalescedEvents()` 根据**轨迹长度/速度/弯曲度**推断三维度，真正做到“把心情拉成一条线”。([MDN Web Docs][20])
* **即时导出音频**：`OfflineAudioContext` 渲染 5 分钟 WAV；或仅提供“睡前循环”不导出。([MDN Web Docs][11])

---

需要我把这套骨架打成一个最小可跑的 HTML/JS 文件（含 Roboto Flex、三滑杆、基础音景和呼吸标题）吗？我可以直接给你可复制的单文件版本。

[1]: https://endel.io/?utm_source=chatgpt.com "Endel - Focus, Relax and Sleep"
[2]: https://apps.apple.com/us/app/endel-focus-sleep-sounds/id1346247457?utm_source=chatgpt.com "Endel: Focus & Sleep Sounds 4+ - App Store - Apple"
[3]: https://www.noisli.com/?utm_source=chatgpt.com "Noisli - Background Noise Generator and Ambient Sounds for ..."
[4]: https://mynoise.net/?utm_source=chatgpt.com "Background Noises • Ambient Sounds • Relaxing Music ..."
[5]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API?utm_source=chatgpt.com "Web Audio API - MDN - Mozilla"
[6]: https://tonejs.github.io/?utm_source=chatgpt.com "Tone.js"
[7]: https://fonts.google.com/specimen/Roboto%2BFlex?utm_source=chatgpt.com "Roboto Flex"
[8]: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_fonts/Variable_fonts_guide?utm_source=chatgpt.com "Variable fonts - CSS - MDN - Mozilla"
[9]: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events?utm_source=chatgpt.com "Pointer events - MDN - Mozilla"
[10]: https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode?utm_source=chatgpt.com "AnalyserNode - MDN - Mozilla"
[11]: https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext?utm_source=chatgpt.com "OfflineAudioContext - MDN - Mozilla"
[12]: https://mdn.github.io/webaudio-examples/?utm_source=chatgpt.com "webaudio-examples - GitHub Pages"
[13]: https://developer.mozilla.org/en-US/docs/Web/API/GainNode?utm_source=chatgpt.com "GainNode - MDN - Mozilla"
[14]: https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode?utm_source=chatgpt.com "OscillatorNode - MDN - Mozilla"
[15]: https://tonejs.github.io/docs/14.7.39/Transport?utm_source=chatgpt.com "Transport - Tone.js"
[16]: https://github.com/tonejs/tone.js/wiki/Transport?utm_source=chatgpt.com "Transport · Tonejs/Tone.js Wiki"
[17]: https://tonejs.github.io/docs/14.9.17/classes/Reverb.html?utm_source=chatgpt.com "Reverb - Tone.js"
[18]: https://developer.mozilla.org/en-US/docs/Web/CSS/font-variation-settings?utm_source=chatgpt.com "font-variation-settings - MDN - Mozilla"
[19]: https://tonejs.github.io/docs/14.9.17/classes/Freeverb.html?utm_source=chatgpt.com "Freeverb - Tone.js"
[20]: https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/getCoalescedEvents?utm_source=chatgpt.com "PointerEvent: getCoalescedEvents() method - MDN"
