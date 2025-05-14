"use client";

import { useActionState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { uploadPDF } from "@/actions/upload";
import { Card, CardContent, CardTitle } from "../ui/card";
import { Loader2 } from "lucide-react";

export default function UploadForm() {
  const [state, action, isLoading] = useActionState(uploadPDF, {
    success: false,
    message: "",
  });

  return (
    <Card className="py-3">
      <CardContent className="p-3">
        <form action={action}>
          <div className="grid gap-3">
            <div className="grid gap-1">
              <CardTitle>Upload file</CardTitle>
              <Input disabled={isLoading} name="file" type="file" />
              {state.message && (
                <p
                  className={`text-xs ${
                    state.success ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {state.message}
                </p>
              )}
            </div>
            <Button disabled={isLoading} type="submit">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Upload
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
