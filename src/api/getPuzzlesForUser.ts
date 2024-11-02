import {type Puzzle} from "@/stores/puzzles";
import {type Ref} from "vue";
import dayjs from "dayjs";

export default async function(setPuzzles: (p: Puzzle[]) => void, errorString: Ref<string | null>): Promise<void> {
  errorString.value = null;

  const response = await fetch("http://localhost:8888/api/userPuzzles");
  if(!response.ok) {
    const message = await response.text();
    errorString.value = `${response.status}: ${message}`;
  }

  const puzzlesData = await response.json();
  const puzzles: Puzzle[] = puzzlesData.map((p: {id: string, name: string, lastGuessDate?: string}) => ({
    ...p,
    lastGuessDate: p.lastGuessDate ? dayjs(p.lastGuessDate) : undefined,
  }))
  setPuzzles(puzzles);
}
