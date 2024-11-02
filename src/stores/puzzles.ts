import {computed, ref} from "vue";
import {defineStore} from "pinia";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export interface Puzzle {
  name: string;
  readonly id: string;
  unconfirmed?: boolean
  lastGuessResult?: boolean,
  lastGuessDate?: dayjs.Dayjs,
}

// todo: enforce name uniqueness
export const usePuzzleStore = defineStore("puzzles", () => {
  const puzzlesStore = ref<Puzzle[]>([]);
  const loaded = ref<boolean>(false);

  const puzzleNameById = computed(() => (puzzleId: string): string => {
    const puzzle = puzzlesStore.value.find(p => p.id == puzzleId);
    return puzzle?.name || "";
  });

  const hasPuzzleData = computed(() => (puzzleId: string) => {
    const puzzle = puzzlesStore.value.find(p => p.id == puzzleId);
    return puzzle ? !puzzle.unconfirmed : false;
  });

  const lastPuzzleStatus = computed(() => (puzzleId: string) =>
    (puzzlesStore.value.find(p => p.id == puzzleId))?.lastGuessResult);

  const lastPuzzleGuess = computed(() => (puzzleId: string) =>
    puzzlesStore.value.find(p => p.id == puzzleId)?.lastGuessDate);

  function setPuzzles(puzzles: Puzzle[]) {
    console.log(puzzles);
    puzzlesStore.value = puzzles;
    loaded.value = true;
  }

  function addPuzzle(puzzle: Puzzle, unconfirmed = false) {
    puzzlesStore.value.push({
      ...puzzle,
      unconfirmed,
    });
  }

  function removePuzzle(id: string) {
    puzzlesStore.value = puzzlesStore.value.filter(p => p.id !== id);
  }

  function confirmPuzzleWithId(oldId: string, newId: string) {
    puzzlesStore.value = puzzlesStore.value.map(p => p.id !== oldId ? p : {
      ...p,
      id: newId,
      unconfirmed: false,
    });
  }

  function puzzleQueried(id: string, status: boolean) {
    puzzlesStore.value = puzzlesStore.value.map(p => p.id !== id
      ? p
      : {
        ...p,
        lastGuessResult: status,
        lastGuessDate: dayjs(),
      });
  }

  return {
    puzzles:puzzlesStore,
    loaded,
    puzzleNameById,
    hasPuzzleData,
    lastPuzzleStatus,
    lastPuzzleGuess,
    removePuzzle,
    setPuzzles,
    addPuzzle,
    confirmPuzzleWithId,
    puzzleQueried,
  };
});
