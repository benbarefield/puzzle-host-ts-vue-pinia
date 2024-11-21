<script lang="ts" setup>
  import {type Puzzle, usePuzzleStore} from "../stores/puzzles";
  import {storeToRefs} from "pinia";
  import PuzzleAnswerList from "../components/PuzzleAnswerList.vue";
  import PuzzleQueryStatus from "../components/PuzzleQueryStatus.vue";
  import dayjs from "dayjs/esm/index";
  import {startListening, stopListening} from "../api/puzzleQueryListener";
  import {onUnmounted} from "vue";
  import {API_LOCATION} from "../api/constants";
  import CopyButton from "../components/CopyButton.vue";

  const props = defineProps<{
    id: string
  }>();

  startListening(props.id);

  const puzzleStore = usePuzzleStore();
  const { hasPuzzleData, puzzleNameById } = storeToRefs(puzzleStore);

  const queryUrl = `${API_LOCATION}/queryPuzzle/${props.id}/`;
  const exampleUrl = queryUrl + "1/2/3";

  if(!hasPuzzleData.value(props.id)) {
    (async () => {
      const response = await fetch(`${API_LOCATION}/puzzle/${props.id}`);

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
  <RouterLink to="/" class="back">Back</RouterLink>
  <div class="loading" v-if="!hasPuzzleData(props.id)" data-test="puzzle-loading">Loading...</div>
  <section v-if="hasPuzzleData(props.id)" class="container">
    <h2 class="header" data-test="puzzle-name">
      {{puzzleNameById(props.id)}}
      <span class="status"><PuzzleQueryStatus :puzzle="props.id" /></span>
    </h2>
    <PuzzleAnswerList :puzzle="props.id" />
    <div class="usageDoc">
      <p>Guesses are made by adding them to the path on the following URL:</p>
      <p class="exampleUrl">{{queryUrl}} <span class="buttonContainer"><CopyButton :text="queryUrl" /></span></p>
      <p>For example, to test the guess: "1","2","3", you would go to:</p>
      <p class="exampleUrl">{{exampleUrl}}</p>
    </div>
  </section>
</template>

<style scoped>
  .container {
    width: 50vw;
    margin: 50px auto 0 auto;
  }

  .back {
    margin: 3px;
  }

  .header {
    margin-bottom: 8px;
    padding-left: 4px;
  }

  .status {
    float:right;
  }

  .usageDoc {
    margin-top: 6px;
  }

  .exampleUrl {
    display: inline-block;
    padding: 3px 5px;
    border-radius: 3px;
    background-color: var(--color-border);

    margin: 2px 0 0 7px;
  }

  .buttonContainer {
    margin-left: 4px;
  }
</style>
