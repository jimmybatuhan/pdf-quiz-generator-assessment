"use server";

import database from "@/lib/database";
import { revalidatePath } from "next/cache";

export default async function answerQuestionnaire(
  prevState: { isCompleted: boolean; message: string; score: number },
  formData: FormData
) {
  const fileId = formData.get("fileId") as string;
  const questionnaire = database.data.questionnaires[fileId];
  let score = 0;
  let message = "";

  if (!questionnaire.questions) {
    throw new Error("Cannot find the questionnaire");
  }

  const { questions } = questionnaire;

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const selectedAnswer = formData.get(`${fileId}:${i}`);
    const isCorrect = question.answer === selectedAnswer;

    if (isCorrect) {
      score++;
    }
  }

  database.saveScore(fileId, score);

  if (score <= 2) {
    message = "It's okay, you still did great by answering all the questions";
  }

  if (score >= 4) {
    message = "Good job!, you answered most of the questions correctly.";
  }

  if (score === 5) {
    message = "Excellent! you answered all of the questions correctly.";
  }

  revalidatePath("/");

  return {
    score,
    message,
    isCompleted: true,
  };
}
