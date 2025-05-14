"use server";

import { openAiClient } from "../client";

/**
 * Creates and assistant
 *
 * @returns
 */
export async function createAssistant(
  instructions = "You make questionnaires based on a PDF document",
  name = "Professor"
) {
  return await openAiClient.beta.assistants.create({
    instructions,
    name,
    tools: [{ type: "file_search" }],
    model: "gpt-4o",
  });
}
