export const runtime = "nodejs";

import { NextRequest } from "next/server";
import dotenv from "dotenv";

dotenv.config();

export async function POST(req: NextRequest) {
  try {
    const incomingForm = await req.formData();
    const file = incomingForm.get("file") as File;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (file.type !== "application/pdf") {
      return new Response(
        JSON.stringify({ error: "Only PDF files are supported" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const formData = new FormData();
    formData.set("file", file);
    formData.set("purpose", process.env.OPENAI_PURPOSE || "assistants");

    const uploadRes = await fetch("https://api.openai.com/v1/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Beta": "assistants=v2",
      },
      body: formData,
    });

    const uploadedFile = await uploadRes.json();
    if (!uploadedFile?.id) {
      console.error("❌ File upload failed:", uploadedFile);
      return new Response(JSON.stringify({ error: "File upload failed" }), {
        status: 500,
      });
    }

    console.log("📤 Uploaded File ID:", uploadedFile.id);

    const threadRes = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Beta": "assistants=v2",
      },
      body: JSON.stringify({}),
    });

    const thread = await threadRes.json();
    console.log("🧵 Thread ID:", thread.id);

    const messageRes = await fetch(
      `https://api.openai.com/v1/threads/${thread.id}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "OpenAI-Beta": "assistants=v2",
        },
        body: JSON.stringify({
          role: "user",
          content:
            "Please summarize the uploaded PDF using the code interpreter.",
          attachments: [
            {
              file_id: uploadedFile.id,
              tools: [{ type: "code_interpreter" }],
            },
          ],
        }),
      }
    );

    const messageData = await messageRes.json();
    if (!messageRes.ok) {
      console.error("❌ Failed to send message:", messageData);
      return new Response(
        JSON.stringify({
          error: messageData?.error?.message || "Message failed",
        }),
        { status: 500 }
      );
    }

    const runRes = await fetch(
      `https://api.openai.com/v1/threads/${thread.id}/runs`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "OpenAI-Beta": "assistants=v2",
        },
        body: JSON.stringify({
          assistant_id: process.env.OPENAI_ASSISTANT_ID,
        }),
      }
    );

    const run = await runRes.json();

    let runStatus = run.status;
    console.log("🏃 Run started:", runStatus);

    while (runStatus === "queued" || runStatus === "in_progress") {
      await new Promise((r) => setTimeout(r, 2000));
      const statusRes = await fetch(
        `https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "OpenAI-Beta": "assistants=v2",
          },
        }
      );
      const statusData = await statusRes.json();
      runStatus = statusData.status;
      console.log("🔄 Polling status:", runStatus);
    }

    const messagesRes = await fetch(
      `https://api.openai.com/v1/threads/${thread.id}/messages`,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "OpenAI-Beta": "assistants=v2",
        },
      }
    );

    const messages = await messagesRes.json();
    const assistantMessages = messages.data?.filter(
      (msg: any) => msg.role === "assistant"
    );
    const lastMessage = assistantMessages?.[0];

    console.log("🧠 Assistant response:", JSON.stringify(lastMessage, null, 2));

    const summary = lastMessage?.content?.[0]?.text?.value;

    if (!summary) {
      return new Response(
        JSON.stringify({ error: "No summary returned by assistant." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ summary }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("❌ Error in summarize route:", err);
    return new Response(
      JSON.stringify({
        error: err.message || "Server error",
        stack: err.stack,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
