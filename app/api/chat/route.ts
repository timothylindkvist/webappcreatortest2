import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Simple site builder tool types
type Site = Record<string, any>;

// Fake persistence in memory for now; your real app likely has a store already.
// Here we just echo tool-calls back to the client; the UI should apply them.
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM = `You are Sidesmith, a website-building assistant.
IMPORTANT RULES:
- NEVER rebuild from scratch unless the user explicitly clicked the Rebuild button (intent: rebuild).
- Prefer incremental changes: applyTheme, patchSection, addSection, removeSection.
- Respond with a helpful short summary after each tool call.
- Do not invent results locally; always use a tool for changes.`;

function incrementalTools() {
  return [
    {
      type: "function",
      function: {
        name: "applyTheme",
        description: "Apply a theme (colors, fonts, spacing) to the current site.",
        parameters: {
          type: "object",
          properties: {
            theme: { type: "object", additionalProperties: true }
          },
          required: ["theme"],
          additionalProperties: false
        }
      }
    },
    {
      type: "function",
      function: {
        name: "patchSection",
        description: "Patch (modify) an existing section by id or key.",
        parameters: {
          type: "object",
          properties: {
            sectionId: { type: "string" },
            patch: { type: "object", additionalProperties: true }
          },
          required: ["sectionId", "patch"],
          additionalProperties: false
        }
      }
    },
    {
      type: "function",
      function: {
        name: "addSection",
        description: "Add a new section to the site.",
        parameters: {
          type: "object",
          properties: {
            section: { type: "object", additionalProperties: true },
            position: { type: "string", enum: ["start","end","before","after"], nullable: true },
            referenceId: { type: "string", nullable: true }
          },
          required: ["section"],
          additionalProperties: false
        }
      }
    },
    {
      type: "function",
      function: {
        name: "removeSection",
        description: "Remove a section from the site.",
        parameters: {
          type: "object",
          properties: {
            sectionId: { type: "string" }
          },
          required: ["sectionId"],
          additionalProperties: false
        }
      }
    }
  ];
}

function rebuildTool() {
  return [
    {
      type: "function",
      function: {
        name: "setSiteData",
        description: "Replace the entire site data with the provided site object. Only used after explicit confirmation.",
        parameters: {
          type: "object",
          properties: {
            site: { type: "object", additionalProperties: true }
          },
          required: ["site"],
          additionalProperties: false
        }
      }
    }
  ];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, intent, starter } = body || {};

    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: "Missing messages array" }, { status: 400 });
    }

    const tools = intent === "rebuild" ? rebuildTool() : incrementalTools();

    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-5",
      messages: [
        { role: "system", content: SYSTEM },
        ...messages
      ],
      tools,
      tool_choice: "auto"
    });

    const msg = response.choices[0].message;

    return NextResponse.json({
      message: msg,
      toolCalls: msg.tool_calls ?? []
    });
  } catch (err: any) {
    const code = err?.status ?? 500;
    return NextResponse.json({
      error: err?.message || "Server error",
      details: err?.response?.data || err?.stack
    }, { status: code });
  }
}
