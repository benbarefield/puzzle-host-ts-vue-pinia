<script setup lang="ts">
  const props = defineProps<{ text: string }>();

  function doCopy() {
    navigator.clipboard.writeText(props.text);
  }
</script>

<template>
  <button aria-label="copy" @click="doCopy" class="copyButton">
    <img src="@/assets/copy_icon.svg" width="18" height="18" />
  </button>
</template>

<style scoped>
  .copyButton {
    background: var(--color-border);
    padding: 4px;
    margin: 0;
    border-radius: 3px;
    border: 1px solid var(--color-background);
    cursor: pointer;
    width: 18px;
    height: 18px;
    box-sizing: content-box;
    transition: 0.2s background-color;
  }
  .copyButton:active {
    background-color: var(--color-background);
  }
</style>
