"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Choices, Question as QuestionType } from "@/lib/database";
import { useMemo } from "react";

type Props = QuestionType & {
  showAnswer?: boolean;
  questionIndex: number;
  fileId: string;
};

export default function Question({
  question,
  options,
  answer,
  explanation,
  questionIndex,
  fileId,
  showAnswer = false,
}: Props) {
  const normalizedQuestionIndex = useMemo(
    () => questionIndex + 1,
    [questionIndex]
  );

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle>
          Q{normalizedQuestionIndex}:{" "}
          {question.replace(/|[\[【(][^\]】)]+[\]】)]/g, "")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <RadioGroup name={`${fileId}:${questionIndex}`}>
            {Object.keys(options).map((choice, i) => (
              <div key={i} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={choice}
                  id={`${fileId}:${questionIndex}:${i}`}
                />
                <Label htmlFor={`${fileId}:${questionIndex}:${i}`}>
                  {options[choice as Choices]}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {showAnswer && (
            <Alert className="py-2">
              <AlertTitle>Explanation</AlertTitle>
              <AlertDescription className="grid gap-5">
                <Label className="text-xs font-normal">{explanation}</Label>
                <Label className="text-accent-foreground">
                  Correct answer: {answer}
                </Label>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
