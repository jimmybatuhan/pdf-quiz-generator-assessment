import { readFileSync, writeFileSync } from "fs";
import { createAssistant } from "./ai/assistant/assistant";

/**
 * ================================================================
 * Makeshift database for storing OpenAI and questionnaire details.
 * ================================================================
 */

export type Choices = "A" | "B" | "C" | "D";

export type Question = {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  answer: Choices;
  explanation: string;
};

export type UploadedFile = {
  id: string;
  vectorId: string;
  name: string;
};

export type DatabaseObject = {
  assistant: string | null;
  questionnaires: {
    [k: string]: {
      completed: boolean;
      result: { score: number };
      questions?: Array<Question>;
      file: UploadedFile;
    };
  };
};

const dbPath = `${process.cwd()}/database.json`;

class DbObj {
  _dbPath = `${process.cwd()}/database.json`;
  data: DatabaseObject;

  constructor() {
    this.data = this._getData();
  }

  /**
   * Read, parses and validates the `database.json` file before using it
   * all across the application.
   */
  _getData() {
    try {
      const dbObj = JSON.parse(
        readFileSync(this._dbPath).toString()
      ) as DatabaseObject;

      if (!Object.hasOwn(dbObj, "assistant")) {
        throw new Error("Assistant property is not set in the JSON file.");
      }

      if (!Object.hasOwn(dbObj, "assistant")) {
        throw new Error("Questionnaires property is not set in the JSON file.");
      }

      return dbObj;
    } catch (e) {
      console.log(e);

      throw new Error("Unable to parse storage.");
    }
  }

  /**
   * Returns the current assistant id
   *
   * @returns string
   */
  getAssistant() {
    return this.data.assistant;
  }

  /**
   * Return the assistant id in the current database file,
   * if null creates a new assistant.
   *
   * @returns string
   */
  async getOrCreateAssistant() {
    try {
      if (this.data.assistant) {
        return this.data.assistant;
      }

      const response = await createAssistant();

      this.data.assistant = response.id;

      writeFileSync(dbPath, JSON.stringify(this.data));

      return this.data.assistant;
    } catch {
      throw new Error("Failed to fetch or create assistant");
    }
  }

  async addFile(file: UploadedFile) {
    this.data.questionnaires[file.id] = {
      questions: [],
      file,
      completed: false,
      result: { score: 0 },
    };

    writeFileSync(this._dbPath, JSON.stringify(this.data));
  }

  /**
   *
   * @param fileId
   * @param questions
   * @returns
   */
  async addQuestionsToFile(fileId: string, questions: Array<Question>) {
    this.data.questionnaires[fileId].questions = questions;

    writeFileSync(this._dbPath, JSON.stringify(this.data));

    return this.data.questionnaires[fileId];
  }

  saveScore(fileId: string, score: number) {
    this.data.questionnaires[fileId].completed = true;
    this.data.questionnaires[fileId].result.score = score;

    writeFileSync(this._dbPath, JSON.stringify(this.data));
  }
}

const database = new DbObj();

export default database;
