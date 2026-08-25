<script setup lang="ts">
import { onKeyStroke } from '@vueuse/core'

const props = withDefaults(
  defineProps<{
    /** Heading shown at the top of the panel; omit for a bare panel. */
    title?: string
    /** Small terminal-style caption in the top-left corner, e.g. `SYS://ROUND_END`. */
    meta?: string
    size?: 'sm' | 'md' | 'lg'
    /** Allows closing via the ✕ button, backdrop click and Escape. */
    closable?: boolean
  }>(),
  {
    title: '',
    meta: '',
    size: 'md',
    closable: true,
  },
)

const emit = defineEmits<{
  close: []
}>()

const CORNERS = ['tl', 'tr', 'bl', 'br']

function close() {
  if (props.closable) emit('close')
}

onKeyStroke('Escape', close)
</script>

<template>
  <Teleport to="body">
    <div
      class="overlay"
      @click.self="close"
    >
      <div
        class="panel"
        :class="`is-${size}`"
        role="dialog"
        aria-modal="true"
        :aria-label="title || undefined"
      >
        <span
          v-for="corner in CORNERS"
          :key="corner"
          class="corner"
          :class="`is-${corner}`"
          aria-hidden="true"
        />

        <p
          v-if="meta"
          class="meta"
        >
          <span
            class="led"
            aria-hidden="true"
          />
          {{ meta }}
        </p>

        <button
          v-if="closable"
          type="button"
          class="close"
          aria-label="Close"
          @click="close"
        >
          <span
            class="close-glyph"
            aria-hidden="true"
          />
        </button>

        <header
          v-if="title"
          class="head"
        >
          <h2 class="title">
            {{ title }}
          </h2>
          <span
            class="rule"
            aria-hidden="true"
          />
        </header>

        <div class="body">
          <slot />
        </div>

        <footer
          v-if="$slots.footer"
          class="foot"
        >
          <slot name="footer" />
        </footer>

        <span
          class="scanlines"
          aria-hidden="true"
        />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  backdrop-filter: blur(3px);
  animation: overlay-in 200ms ease-out both;
}

.panel {
  position: relative;
  display: flex;
  width: 100%;
  max-height: 100%;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 3rem 3rem 2.25rem;
  background: linear-gradient(180deg, var(--color-cell-hover) 0%, var(--color-board-surface) 100%);
  box-shadow:
    inset 0 0 0 1px rgba(1, 207, 207, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 0 3rem rgba(0, 235, 235, 0.16);
  isolation: isolate;
  overflow: hidden;
  animation: panel-in 260ms cubic-bezier(0.2, 0.8, 0.3, 1) both;
}

.panel.is-sm {
  max-width: 26rem;
}

.panel.is-md {
  max-width: 36rem;
}

.panel.is-lg {
  max-width: 46rem;
}

.corner {
  position: absolute;
  z-index: 3;
  width: 18px;
  height: 18px;
  border: 0 solid var(--color-block-border);
  filter: drop-shadow(0 0 3px rgba(0, 235, 235, 0.65));
  pointer-events: none;
}

.corner.is-tl,
.corner.is-tr {
  top: 8px;
  border-top-width: 2px;
}

.corner.is-bl,
.corner.is-br {
  bottom: 8px;
  border-bottom-width: 2px;
}

.corner.is-tl,
.corner.is-bl {
  left: 8px;
  border-left-width: 2px;
}

.corner.is-tr,
.corner.is-br {
  right: 8px;
  border-right-width: 2px;
}

.meta {
  position: absolute;
  top: 12px;
  left: 34px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-family: var(--font-hud);
  font-size: 9px;
  line-height: 1;
  letter-spacing: 0.14em;
  color: var(--color-hud-text-soft);
  pointer-events: none;
}

.led {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--color-block-border);
  box-shadow: 0 0 3px var(--color-block-border);
  animation: led-blink 1.6s ease-in-out infinite;
}

.close {
  position: absolute;
  top: 14px;
  right: 30px;
  z-index: 4;
  display: grid;
  width: 22px;
  height: 22px;
  place-items: center;
  border: 1px solid rgba(1, 207, 207, 0.35);
  background: transparent;
  color: var(--color-block-border);
  transition:
    border-color 140ms ease,
    background 140ms ease;
}

.close:hover,
.close:focus-visible {
  border-color: var(--color-block-border);
  background: var(--color-grid-cell-border);
}

.close:focus-visible {
  outline: 2px solid rgba(1, 207, 207, 0.75);
  outline-offset: 2px;
}

.close-glyph {
  position: relative;
  display: block;
  width: 12px;
  height: 12px;
}

.close-glyph::before,
.close-glyph::after {
  content: '';
  position: absolute;
  top: 5px;
  left: 0;
  width: 12px;
  height: 2px;
  border-radius: 1px;
  background: currentColor;
  box-shadow: 0 0 4px currentColor;
}

.close-glyph::before {
  transform: rotate(45deg);
}

.close-glyph::after {
  transform: rotate(-45deg);
}

.head,
.body,
.foot {
  z-index: 3;
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
}

.head {
  gap: 1rem;
}

.title {
  margin: 0;
  font-family: var(--font-hud);
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-hud-text);
  text-shadow: 0 0 12px rgba(0, 235, 235, 0.55);
}

.rule {
  width: 100%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--color-block-border) 30%,
    var(--color-block-border) 70%,
    transparent
  );
  opacity: 0.55;
}

.body {
  min-height: 0;
  gap: 1.25rem;
  overflow-y: auto;
}

.foot {
  gap: 0.75rem;
}

.scanlines {
  position: absolute;
  inset: 0;
  z-index: 2;
  /* pre-multiplied alpha instead of mix-blend-mode: blending would force the whole
     panel to re-composite on every repaint (the countdown ticks once per second) */
  background: repeating-linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.045) 0 1px,
    transparent 1px 3px
  );
  pointer-events: none;
}

@keyframes overlay-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes panel-in {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: none;
  }
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

@media (prefers-reduced-motion: reduce) {
  .overlay,
  .panel,
  .led {
    animation: none;
  }
}
</style>
