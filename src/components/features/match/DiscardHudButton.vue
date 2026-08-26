<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label?: string
    disabled?: boolean
    metaLeft?: string
  }>(),
  {
    label: 'Discard',
    disabled: false,
    metaLeft: 'SYS://DSC_01',
  },
)

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function onClick(event: MouseEvent) {
  if (props.disabled) return
  emit('click', event)
}
</script>

<template>
  <button
    type="button"
    class="discard"
    :disabled="props.disabled"
    @click="onClick"
  >
    <span class="meta">
      <span class="meta-leading">
        <span
          class="led"
          aria-hidden="true"
        />
        <span class="meta-text">{{ props.metaLeft }}</span>
      </span>
    </span>
    <span class="label-row">
      <span
        class="icon"
        aria-hidden="true"
      />
      <span
        class="txt"
        :data-text="props.label"
      >{{ props.label }}</span>
    </span>
    <span
      class="scanlines"
      aria-hidden="true"
    />
    <span
      class="scan"
      aria-hidden="true"
    />
    <span
      class="c tl"
      aria-hidden="true"
    />
    <span
      class="c tr"
      aria-hidden="true"
    />
    <span
      class="c bl"
      aria-hidden="true"
    />
    <span
      class="c br"
      aria-hidden="true"
    />
  </button>
</template>

<style scoped>
.discard {
  /* Палитра из @theme (style.css); keyframes без изменений по структуре */
  --surface-top: var(--color-cell-hover);
  --surface-bottom: var(--color-board-surface);
  --surface-hover-top: color-mix(in srgb, var(--color-cell-hover) 88%, #fff);
  --surface-hover-bottom: var(--color-cell-hover);
  --cyan: var(--color-block-border);
  --text: #e8ffff;
  --text-soft: rgba(232, 255, 255, 0.72);
  --glitch-shift: #7dfbfb;

  box-sizing: border-box;
  appearance: none;
  -webkit-appearance: none;
  border: 0;
  cursor: pointer;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 290px;
  height: 47px;
  padding: 0.1875rem 1.125rem 0.1875rem 2rem;
  color: var(--text);
  font:
    500 0.6875rem/1 'Space Grotesk',
    'Inter',
    system-ui,
    sans-serif;
  letter-spacing: 0.04em;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--surface-top) 0%, var(--surface-bottom) 100%);
  box-shadow:
    var(--shadow-hud-bevel),
    inset 0 -4px 0.75rem rgba(0, 0, 0, 0.25);
  transition:
    background 140ms ease,
    box-shadow 200ms ease,
    transform 80ms ease,
    color 140ms ease;
  overflow: hidden;
  isolation: isolate;
  font-synthesis: none;
}

.discard::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: repeating-linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.015) 0 2px,
    transparent 2px 4px
  );
  mix-blend-mode: screen;
  opacity: 0.28;
  transition: opacity 160ms ease;
}

.discard:focus-visible {
  outline: 2px solid rgba(1, 207, 207, 0.75);
  outline-offset: 3px;
}

.discard:is(:hover, :focus-visible):not(:disabled) {
  background: linear-gradient(180deg, var(--surface-hover-top) 0%, var(--surface-hover-bottom) 100%);
  color: #ffffff;
}

.discard:is(:hover, :focus-visible):not(:disabled)::before {
  opacity: 0.6;
}

.discard:is(:hover, :focus-visible):not(:disabled) .meta {
  animation: meta-flicker 5s steps(1, end) infinite;
}

.discard:is(:hover, :focus-visible):not(:disabled) .meta .led {
  animation: led-blink 1.6s ease-in-out infinite;
}

.discard:is(:hover, :focus-visible):not(:disabled) .txt::before {
  animation: glitch-a 3.6s steps(1, end) infinite;
}

.discard:is(:hover, :focus-visible):not(:disabled) .txt::after {
  animation: glitch-b 3.6s steps(1, end) infinite;
}

.discard:is(:hover, :focus-visible):not(:disabled) .scan::before {
  opacity: 1;
  animation: sweep 2.4s linear infinite;
}

.discard:is(:hover, :focus-visible):not(:disabled) .scan::after {
  opacity: 1;
  animation: vscan 2.8s linear infinite;
}

.discard:is(:hover, :focus-visible):not(:disabled) > .scanlines {
  opacity: 0.5;
}

.discard:active:not(:disabled) {
  transform: translateY(1px);
}

.discard:disabled {
  cursor: not-allowed;
  color: rgba(232, 255, 255, 0.38);
  background: color-mix(in srgb, var(--color-board-surface) 58%, #000);
  box-shadow: inset 0 0 0 1px rgba(1, 207, 207, 0.12);
}

.discard .txt {
  position: relative;
  font-size: 0.875rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #f0ffff;
  text-shadow: 0 0 5px rgba(0, 235, 235, 0.45);
  z-index: 3;
}

.discard .txt::before,
.discard .txt::after {
  content: attr(data-text);
  position: absolute;
  inset: 0;
  pointer-events: none;
  animation: none;
  opacity: 0;
}

.discard .txt::before {
  color: var(--glitch-shift);
  mix-blend-mode: screen;
}

.discard .txt::after {
  color: var(--cyan);
  mix-blend-mode: screen;
}

@keyframes glitch-a {
  0%,
  96%,
  100% {
    transform: translate(0, 0);
    opacity: 0;
    clip-path: inset(0 0 0 0);
  }
  40% {
    transform: translate(-1.5px, 0);
    opacity: 0.9;
    clip-path: inset(0 0 60% 0);
  }
  42% {
    transform: translate(-2px, 0.5px);
    opacity: 0.9;
    clip-path: inset(40% 0 20% 0);
  }
  44% {
    transform: translate(-0.5px, 0);
    opacity: 0;
  }
  78% {
    transform: translate(-1.5px, 0);
    opacity: 0.85;
    clip-path: inset(70% 0 0 0);
  }
  80% {
    transform: translate(0, 0);
    opacity: 0;
  }
}

@keyframes glitch-b {
  0%,
  96%,
  100% {
    transform: translate(0, 0);
    opacity: 0;
    clip-path: inset(0 0 0 0);
  }
  40% {
    transform: translate(1.5px, 0);
    opacity: 0.9;
    clip-path: inset(0 0 60% 0);
  }
  42% {
    transform: translate(2px, -0.5px);
    opacity: 0.9;
    clip-path: inset(40% 0 20% 0);
  }
  44% {
    transform: translate(0.5px, 0);
    opacity: 0;
  }
  78% {
    transform: translate(1.5px, 0);
    opacity: 0.85;
    clip-path: inset(70% 0 0 0);
  }
  80% {
    transform: translate(0, 0);
    opacity: 0;
  }
}

.discard .c {
  position: absolute;
  width: 8px;
  height: 8px;
  border: 1.5px solid var(--cyan);
  filter: drop-shadow(var(--drop-shadow-edge));
  z-index: 3;
}

.discard .c.tl {
  top: 2px;
  left: 2px;
  border-right: 0;
  border-bottom: 0;
}

.discard .c.tr {
  top: 2px;
  right: 2px;
  border-left: 0;
  border-bottom: 0;
}

.discard .c.bl {
  bottom: 2px;
  left: 2px;
  border-right: 0;
  border-top: 0;
}

.discard .c.br {
  bottom: 2px;
  right: 2px;
  border-left: 0;
  border-top: 0;
}

.discard .label-row {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  z-index: 3;
  flex-shrink: 0;
}

.discard .meta-leading {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.discard .meta-text {
  line-height: 1;
}

.discard .meta {
  position: absolute;
  top: 6px;
  left: 14px;
  right: 14px;
  padding-inline: 0.125rem;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font:
    7px/1 'JetBrains Mono',
    ui-monospace,
    monospace;
  letter-spacing: 0.14em;
  color: var(--text-soft);
  pointer-events: none;
  z-index: 3;
  animation: none;
}

.discard .meta .led {
  display: block;
  flex-shrink: 0;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--cyan);
  box-shadow: var(--shadow-glow-mark);
  animation: none;
}

@keyframes led-blink {
  0%,
  60%,
  100% {
    opacity: 1;
  }
  70%,
  90% {
    opacity: 0.25;
  }
}

@keyframes meta-flicker {
  0%,
  80%,
  100% {
    opacity: 1;
  }
  81%,
  82% {
    opacity: 0.2;
  }
  83% {
    opacity: 1;
  }
  97% {
    opacity: 0.4;
  }
}

.discard .icon {
  position: relative;
  flex-shrink: 0;
  width: 17px;
  height: 17px;
  display: grid;
  place-items: center;
  color: var(--cyan);
}

.discard .icon::before,
.discard .icon::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 2px;
  background: var(--cyan);
  box-shadow: var(--shadow-glow-mark);
  border-radius: 1px;
}

.discard .icon::before {
  transform: rotate(45deg);
}

.discard .icon::after {
  transform: rotate(-45deg);
}

.discard .scan {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  overflow: hidden;
  border-radius: inherit;
}

.discard .scan::before {
  content: '';
  position: absolute;
  top: 0;
  left: -40%;
  width: 40%;
  height: 100%;
  opacity: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(1, 207, 207, 0.2) 50%,
    transparent 100%
  );
  animation: none;
  transition: opacity 160ms ease;
}

.discard .scan::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  top: -2px;
  opacity: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 235, 235, 0.28) 30%,
    rgba(1, 207, 207, 0.55) 50%,
    rgba(0, 235, 235, 0.28) 70%,
    transparent
  );
  box-shadow: var(--shadow-glow-accent);
  animation: none;
  transition: opacity 160ms ease;
}

@keyframes sweep {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(350%);
  }
}

@keyframes vscan {
  0% {
    top: -2px;
  }
  100% {
    top: 100%;
  }
}

.discard > .scanlines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  background: repeating-linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.18) 0 1px,
    transparent 1px 3px
  );
  mix-blend-mode: multiply;
  opacity: 0.2;
  transition: opacity 160ms ease;
}
</style>
