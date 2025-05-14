"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader } from "./file-uploader";

export default function GrantSummarizer() {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

useEffect(() => {
  console.log('📂 Selected file:', file);
}, [file]);

const handleSubmit = async () => {
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);
  setLoading(true);

  try {
    const res = await fetch("/api/summarize", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();

    const summaryText = result?.summary?.text?.value || result?.summary || "⚠️ No summary returned.";
    setSummary(summaryText);
  } catch (err) {
    console.error("Upload error:", err);
    setSummary("⚠️ An error occurred while summarizing.");
  } finally {
    setLoading(false);
  }
};

  return (
    <Card className="max-w-2xl mx-auto p-6 mt-12 space-y-6">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Grant Summarizer</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Upload PDF</Label>
          <FileUploader onFileChange={setFile} />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!file || loading}
          className="w-full"
        >
          {loading ? "Summarizing..." : "Summarize"}
        </Button>

        <div>
          <Label>Summary Output</Label>
          <Textarea
            readOnly
            rows={12}
            value={summary}
            className="mt-2"
            placeholder="The summary will appear here..."
          />
        </div>
      </CardContent>
    </Card>
  );
}
