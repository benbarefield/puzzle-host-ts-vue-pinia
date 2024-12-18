<script lang="ts" setup>
  import {usePuzzleStore} from "../stores/puzzles";
  import {storeToRefs} from "pinia";
  import {ref, useTemplateRef} from "vue";
  import getPuzzlesForUser from "../api/getPuzzlesForUser";
  import {API_LOCATION} from "../api/constants";

  const puzzleFetchError = ref<string | null>(null);
  const puzzleCreationError = ref<string | null>(null);
  const store = usePuzzleStore();
  const {puzzles,loaded} = storeToRefs(store);

  const dialogRef = useTemplateRef("create-dialog");
  const nameRef = useTemplateRef("create-name");
  function openCreateDialog(): void {
    dialogRef.value?.showModal();
    nameRef.value?.focus();
  }

  async function sendCreatePuzzle() {
    puzzleCreationError.value = null;
    const name = nameRef.value?.value || "";
    dialogRef.value?.close?.(); // tests not supporting dialog element

    const tempId = Math.random().toString();
    store.addPuzzle({
      name,
      id: tempId,
    }, true);

    const response = await fetch(API_LOCATION + "/puzzle", {
      method: "POST",
      body: JSON.stringify({
        name,
      }),
      headers: {
        "Content-Type": "application/json",
      }
    });

    const responseText = await response.text();
    if(response.ok) {
      store.confirmPuzzleWithId(tempId, responseText);
    } else {
      store.removePuzzle(tempId);
      puzzleCreationError.value = `${response.status}: ${responseText}`;
    }
  }

  const getPuzzles = () => getPuzzlesForUser(store.setPuzzles, puzzleFetchError);
  if(!loaded.value) {
    getPuzzles();
  }
</script>

<template>
  <section class="container">
    <h2 class="header">Your Puzzles</h2>
    <div v-if="!loaded && puzzleFetchError === null" class="borderedContainer">
      <p class="loading">loading...</p>
    </div>
    <div v-if="puzzleFetchError">
      <p class="error">If you're seeing this, there has been some error in a GET call to /api/userPuzzles.</p>
      <p class="error">{{puzzleFetchError}}</p>
      <button @click="getPuzzles">Try again</button>
    </div>
    <ul v-if="loaded && puzzles.length > 0" class="puzzleList borderedContainer">
      <li v-for="puzzle in puzzles" class="puzzle">
        <RouterLink v-if="!puzzle.unconfirmed" :to="`/puzzle/${puzzle.id}`">{{puzzle.name}}</RouterLink>
        <span v-if="puzzle.unconfirmed">{{puzzle.name}} [pending...]</span>
      </li>
      <li>
        <button class="createPuzzle" @click="openCreateDialog">Create Puzzle</button>
        <p v-if="puzzleCreationError !== null" class="error">Error with creation (check POST to /api/puzzle): {{puzzleCreationError}}</p>
      </li>
    </ul>
    <div v-if="loaded && puzzles.length === 0" class="borderedContainer">
      <p class="instructions">No puzzles yet! Create a puzzle to get started.</p>
      <button class="createPuzzle" @click="openCreateDialog">Create Puzzle</button>
      <p v-if="puzzleCreationError !== null" class="error">Error with creation (check POST to /api/puzzle): {{puzzleCreationError}}</p>
    </div>
  </section>
  <dialog class="createDialog" ref="create-dialog">
    <h3>New Puzzle</h3>
    <form @submit.prevent="sendCreatePuzzle">
      <label for="createPuzzle-name">Name:</label>
      <input type="text" id="createPuzzle-name" name="puzzleName" ref="create-name" />
      <button class="createPuzzle">Create</button>
    </form>
  </dialog>
</template>

<style scoped>
  .error {
    color: var(--color-error);
  }

  .container {
    width: 50vw;
    margin: 50px auto 0 auto;
  }

  .header {
    margin-bottom: 8px;
    padding-left: 4px;
  }

  .borderedContainer {
    border-width: 0 2px 0 2px;
    border-color: var(--color-border);
    border-style: solid;
    border-radius: 6px;
    padding: 4px;
  }

  .puzzleList {
    list-style-type: none;
  }

  .puzzle a {
    display: block;
    height: 2em;
    line-height: 2em;
    width: 100%;
    border: 1px solid var(--color-border);
    border-radius: 3px;
    padding: 0 4px;
  }

  .createPuzzle {
    display: block;
    width: 100%;
    color: var(--color-interactable);
    font-weight: 600;
    background: none;
    margin: 0;
    padding: 4px;
    border: 3px solid var(--color-border);
    transition: color 0.4s, border-color 0.4s;
    cursor: pointer;
  }

  .create-puzzle:hover {
    color: var(--color-interactable-hover);
    border-color: var(--color-border-hover);
  }

  .createDialog {
    padding: 50px;
    border-radius: 6px;
    margin: auto;
  }
  .createDialog::backdrop {
    background-color: rgba(0, 0, 0, 0.3);
  }
</style>
