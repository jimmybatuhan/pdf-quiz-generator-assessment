"use server";

import { FilePurpose } from "openai/src/resources.js";
import { openAiClient } from "../client";
import { UploadedFile } from "@/lib/database";

/**
 * Uploads the file to OpenAI and creates a vector store
 * that will be used by the assistant when creating questionnaires.
 *
 * @param file File
 * @param purpose FilePurpose
 * @returns Promise<UploadedFile>
 */
export async function uploadFile(
  file: File,
  purpose: FilePurpose = "assistants"
) {
  // upload the file so assistants can use it.
  const uploadedFile = await openAiClient.files.create({ file, purpose });

  // create a vector store using the file uploaded
  const vector = await openAiClient.vectorStores.create({
    name: file.name,
    file_ids: [uploadedFile.id],
  });

  return {
    name: file.name,
    id: uploadedFile.id,
    vectorId: vector.id,
  } as UploadedFile;
}
