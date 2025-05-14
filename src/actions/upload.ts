"use server";

import {
  getDocument,
  GlobalWorkerOptions,
} from "pdfjs-dist/legacy/build/pdf.mjs";
import { uploadFile } from "@/lib/ai/assistant/files";
import { generateQuestions } from "@/lib/ai/assistant/thread";
import path from "path";
import database from "@/lib/database";
import { revalidatePath } from "next/cache";

const workerPath = path.resolve(
  process.cwd(),
  "node_modules",
  "pdfjs-dist",
  "build",
  "pdf.worker.min.mjs"
);

GlobalWorkerOptions.workerSrc = `file:///${workerPath}`;

export async function uploadPDF(
  previousState: { message: string; success: boolean },
  formData: FormData
) {
  const file = formData.get("file") as File | null;

  if (file?.name === "undefined" || !file) {
    return { success: false, message: "File is required." };
  }

  if (file.size > Number(process.env.PDF_MAXIMUM_SIZE_BYTES)) {
    return { success: false, message: "File is too large." };
  }

  if (!database.getAssistant()) {
    return { success: false, message: "Failed process the upload." };
  }

  const loadingTask = getDocument({ data: await file.arrayBuffer() });
  const pdfDocument = await loadingTask.promise;
  const MAX_PAGE_NUMBER = Number(process.env.PDF_MAXIMUM_PAGE_NUMBER);

  if (pdfDocument.numPages >= MAX_PAGE_NUMBER) {
    return {
      success: false,
      message: `File has more than ${MAX_PAGE_NUMBER} pages`,
    };
  }

  const uploadedFile = await uploadFile(file);

  database.addFile(uploadedFile);

  const questions = await generateQuestions(uploadedFile.id);

  database.addQuestionsToFile(uploadedFile.id, questions);

  try {
    revalidatePath("/");

    return { message: "File uploaded successfully.", success: true };
  } catch (error) {
    console.error("Error uploading file:", error);
    return { success: false, message: "Failed to upload file." };
  }
}
