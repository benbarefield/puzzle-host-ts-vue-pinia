<script lang="ts" setup>
  import {type Puzzle, usePuzzleStore} from "@/stores/puzzles";
  import {storeToRefs} from "pinia";
  import PuzzleAnswerList from "@/components/PuzzleAnswerList.vue";
  import PuzzleQueryStatus from "@/components/PuzzleQueryStatus.vue";
  import dayjs from "dayjs";
  import {startListening, stopListening} from "@/api/puzzleQueryListener";
  import {onUnmounted} from "vue";

  const props = defineProps<{
    id: string
  }>();

  startListening(props.id);

  const puzzleStore = usePuzzleStore();
  const { hasPuzzleData, puzzleNameById } = storeToRefs(puzzleStore);

  if(!hasPuzzleData.value(props.id)) {
    (async () => {
      const response = await fetch(`http://localhost:8888/api/puzzle/${props.id}`);

      const puzzleData = await response.json();
      const puzzle: Puzzle = {
        ...puzzleData,
        lastGuessDate: puzzleData.lastGuessDate ? dayjs(puzzleData.lastGuessDate) : undefined,
      }
      puzzleStore.addPuzzle(puzzle);
      // todo: error (eg. not allowed)
    })();
  }
  onUnmounted(() => {
    stopListening(props.id);
  })
</script>

<template>
  <div class="loading" v-if="!hasPuzzleData(props.id)" data-test="puzzle-loading">Loading...</div>
  <section v-if="hasPuzzleData(props.id)" class="container">
    <h2 class="header" data-test="puzzle-name">
      {{puzzleNameById(props.id)}}
      <span class="status"><PuzzleQueryStatus :puzzle="props.id" /></span>
    </h2>
    <PuzzleAnswerList :puzzle="props.id" />
  </section>
</template>

<style scoped>
  .container {
    width: 50vw;
    margin: 50px auto 0 auto;
  }

  .header {
    margin-bottom: 8px;
    padding-left: 4px;
  }

  .status {
    float:right;
  }
</style>
