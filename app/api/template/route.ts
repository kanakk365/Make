import { NextRequest, NextResponse } from "next/server";
import { basePrompt as nodeBasePrompt } from "@/lib/defaults/node";
import { basePrompt as reactBasePrompt } from "@/lib/defaults/react";
import { BASE_PROMPT } from "@/lib/prompt";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export async function POST(req: NextRequest) {
  try {
    const { prompt, apiKey, model = "gpt-4.1" } = await req.json();
    
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }
    
    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key is required" }, { status: 400 });
    }

    const chatModel = new ChatOpenAI({ 
      model: model,
      openAIApiKey: apiKey
    });
    
    const response = await chatModel.invoke([
      new SystemMessage(
        " Return either node or react based on what do you think this project should be. Only return a simple word either 'node' or 'react'. Do not return anything extra"
      ),
      new HumanMessage(prompt),
    ]);

    const answer = String(response.content).trim().toLowerCase();

    console.log(answer);

    if (answer === "react") {
      return NextResponse.json({
        prompts: [
          BASE_PROMPT,
          `Here is an artifact that contains all files of the project visible to you . \n Consider the contents of ALL files in the project . \n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not begin shown to you:\n\n - .gitignore\n -package-lock.json\n`,
        ],
        uiPrompts: [reactBasePrompt],
      });
    }
    
    if (answer === "node") {
      return NextResponse.json({
        prompts: [
          `Here is an artifact that contains all files of the project visible to you . \n Consider the contents of ALL files in the project . \n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not begin shown to you:\n\n - .gitignore\n -package-lock.json\n`,
        ],
        uiPrompts: [nodeBasePrompt],
      });
    }

    // Default to react if unclear
    return NextResponse.json({
      prompts: [
        BASE_PROMPT,
        `Here is an artifact that contains all files of the project visible to you . \n Consider the contents of ALL files in the project . \n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not begin shown to you:\n\n - .gitignore\n -package-lock.json\n`,
      ],
      uiPrompts: [reactBasePrompt],
    });
    
  } catch (error) {
    console.error("Template API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
