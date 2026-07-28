<template>
  <div class="hand-frame">
    <div class="hand-frame__body">
      <slot />
    </div>

    <div class="hand-frame__footer">
      <slot name="footer" />
    </div>

    <span
      class="hand-frame__corner is-tl"
      aria-hidden="true"
    />
    <span
      class="hand-frame__corner is-tr"
      aria-hidden="true"
    />
    <span
      class="hand-frame__corner is-bl"
      aria-hidden="true"
    />
    <span
      class="hand-frame__corner is-br"
      aria-hidden="true"
    />
  </div>
</template>

<style scoped>
.hand-frame {
  position: relative;
  display: flex;
  min-height: 0;
  flex-direction: column;
  flex-shrink: 0;
  gap: 12px;
  inline-size: 100%;
  max-inline-size: 28rem;
  margin-inline: auto;
  padding: 14px 18px;
  border: 1px solid var(--color-grid-cell-border);
}

.hand-frame__body {
  min-height: 0;
}

.hand-frame__footer {
  display: flex;
  justify-content: center;
}

.hand-frame__footer :deep(.discard) {
  width: 50%;
}

.hand-frame__corner {
  position: absolute;
  width: 12px;
  height: 12px;
  border: 1.5px solid var(--color-block-border);
  filter: drop-shadow(0 0 3px rgba(0, 235, 235, 0.65));
  pointer-events: none;
}

.hand-frame__corner.is-tl {
  top: -7px;
  left: -7px;
}

.hand-frame__corner.is-tr {
  top: -7px;
  right: -7px;
}

.hand-frame__corner.is-bl {
  bottom: -7px;
  left: -7px;
}

.hand-frame__corner.is-br {
  bottom: -7px;
  right: -7px;
}
</style>
