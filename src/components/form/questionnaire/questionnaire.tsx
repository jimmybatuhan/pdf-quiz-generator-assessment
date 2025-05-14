"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Question as QuestionType, UploadedFile } from "@/lib/database";
import { useActionState } from "react";
import answerQuestionnaire from "@/actions/answer";
import Question from "./component/question";

type Props = {
  questions: Array<QuestionType>;
  file: UploadedFile;
};

export default function Questionnaire({ questions, file }: Props) {
  const [{ isCompleted, score, message }, action] = useActionState(
    answerQuestionnaire,
    {
      isCompleted: false,
      score: 0,
      message: "",
    }
  );

  if (isCompleted) {
    return (
      <Alert>
        <AlertTitle>{message}</AlertTitle>
        <AlertDescription>
          Your score: {score}/{questions.length}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full">
      {!isCompleted && (
        <form action={action}>
          <div className="grid gap-3">
            <Input type="hidden" name="fileId" value={file.id} />
            {questions.map((question, i) => (
              <Question
                key={`${file.id}-q-${i}`}
                fileId={file.id}
                questionIndex={i}
                {...question}
              />
            ))}
            <div className="flex flex-row justify-end">
              <Button type="submit" className="w-3/12">
                Submit
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
