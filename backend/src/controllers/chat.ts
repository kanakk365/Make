import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { Request, Response } from "express";
import OpenAI from "openai";
import { getSystemPrompt } from "../prompt";

export const chatWithLlm = async (req: Request, res: Response) => {
  try {
    const messages = req.body.messages;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const model = new ChatOpenAI({ model: "gpt-4.1" });

    const langchainMessages = messages.map((msg: any) => {
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

    const response = await model.invoke(allMessages);

    const answer = response.content;
    console.log(response)
    console.log(answer)
    res.json({
      response: answer,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
