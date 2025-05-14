"use server";

import database, { Question } from "@/lib/database";
import { openAiClient } from "../client";

export async function generateQuestions(fileId: string) {
  const assistantId = database.data.assistant;
  const file = database.data.questionnaires[fileId];

  if (!assistantId) {
    throw new Error("Assistant is not set.");
  }

  // Create a thread
  const thread = await openAiClient.beta.threads.create({
    tool_resources: {
      file_search: {
        vector_store_ids: [file.file.vectorId],
      },
    },
  });

  // Add the message to the thread with the file ID
  await openAiClient.beta.threads.messages.create(thread.id, {
    role: "user",
    content: `Create 5 multiple choices questions with answers and explanation
    in json format using the attached file in the thread. just print the json and make the options in the
    questions have a property of A, B, C, etc..`,
  });

  // Run the assistant
  const run = await openAiClient.beta.threads.runs.create(thread.id, {
    assistant_id: assistantId,
    response_format: { type: "text" },
  });

  let runStatus = await openAiClient.beta.threads.runs.retrieve(
    thread.id,
    run.id
  );

  while (runStatus.status !== "completed") {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    runStatus = await openAiClient.beta.threads.runs.retrieve(
      thread.id,
      run.id
    );

    if (["failed", "cancelled", "expired"].includes(runStatus.status)) {
      break;
    }
  }

  // Get the last message from the assistant
  const messages = await openAiClient.beta.threads.messages.list(thread.id);
  const content = messages.data[0].content[0] as { text: { value: string } };

  await openAiClient.beta.threads.del(thread.id);

  return JSON.parse(
    content.text.value.replace(/```json\s*|```/g, "")
  ) as Array<Question>;
}
