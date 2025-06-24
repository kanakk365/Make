import { NextRequest, NextResponse } from "next/server";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { getSystemPrompt } from "@/lib/prompt";

export async function POST(req: NextRequest) {
  try {
    const { messages, apiKey, model = "gpt-4.1" } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key is required" }, { status: 400 });
    }

    const chatModel = new ChatOpenAI({ 
      model: model,
      openAIApiKey: apiKey
    });

    const langchainMessages = messages.map((msg: { role: string; content: string }) => {
      if (msg.role === "user") {
        return new HumanMessage(msg.content);
      } else if (msg.role === "assistant") {
        return new SystemMessage(msg.content);
      }
      return new HumanMessage(msg.content);
    });

    const allMessages = [
      new SystemMessage(getSystemPrompt()),
      ...langchainMessages,
    ];

    const response = await chatModel.invoke(allMessages);

    const answer = response.content;
    console.log(response);
    console.log(answer);
    
    return NextResponse.json({
      response: answer,
      success: true,
    });
    
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
