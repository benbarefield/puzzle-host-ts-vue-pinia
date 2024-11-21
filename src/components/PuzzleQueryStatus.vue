<script setup lang="ts">
  import {computed, onUnmounted, useTemplateRef} from "vue";
  import {storeToRefs} from "pinia";
  import {usePuzzleStore} from "../stores/puzzles";
  import dayjs from "dayjs/esm/index";

  const props = defineProps<{
    puzzle: string
  }>();

  const puzzleStore = usePuzzleStore();
  const { lastPuzzleStatus, hasPuzzleData, lastPuzzleGuess } = storeToRefs(puzzleStore);
  const dotRef = useTemplateRef("dotRef");
  const lastStatusText = computed(() => {
    const status = lastPuzzleStatus.value(props.puzzle);
    return !hasPuzzleData.value(props.puzzle)
      ? "Unknown"
      : status === undefined
      ? "No guess"
      : status
      ? "Correct"
      : "Incorrect";
  });
  const lastGuessText = computed(() => lastPuzzleGuess.value(props.puzzle)?.fromNow() || "");
  const dotClasses = computed(() => {
    const hasStatus = hasPuzzleData.value(props.puzzle);
    const lastStatus = lastPuzzleStatus.value(props.puzzle);
    return {
      dot: true,
      hasStatus,
      correct: hasStatus && lastStatus,
      incorrect: hasStatus && lastStatus !== undefined && !lastStatus,
    }
  });

  let animation : number;

  (function runAnimation() {
    const lastGuess = lastPuzzleGuess.value(props.puzzle);
    if(dotRef.value && lastGuess) {
      const secondsSinceChange = dayjs().diff(lastGuess) / 1000;
      const percent = Math.max(0, 10 - secondsSinceChange) / 10;
      const spread = percent * 20;
      const correctness = lastPuzzleStatus.value(props.puzzle) ? "correct" : "incorrect";
      dotRef.value.style.setProperty("box-shadow", `0 0 ${spread}px 0 var(--color-${correctness})`);
    }
    animation = requestAnimationFrame(runAnimation);
  })();

  onUnmounted(() => {
    if(animation) {cancelAnimationFrame(animation);}
  });
</script>

<template>
  <div class="puzzleStatusContainer">
    <div ref="dotRef"
         :aria-label="lastStatusText"
         :class="dotClasses" />
    <div class="lastGuess">{{lastGuessText}}</div>
  </div>
</template>

<style scoped>
  .puzzleStatusContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .dot {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 1px solid #999;
    background-color: #999;
    transition: background-color 0.3s;
  }
  .dot.hasStatus {
    background: transparent;
  }
  .dot.hasStatus.correct {
    background-color: var(--color-correct);
  }
  .dot.hasStatus.incorrect {
    background-color: var(--color-incorrect);
  }

  .lastGuess {
    font-size: 0.5em;
  }
</style>
