import { Request, Response } from "express";
import { basePrompt as nodeBasePrompt } from "../defaults/node";
import { basePrompt as reactBasePrompt } from "../defaults/react";
import { BASE_PROMPT } from "../prompt";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export const findTemplate = async (req: Request, res: Response) => {
  try {
    const prompt = req.body.prompt;
    if (!prompt) return res.status(400).json({ error: "Prompt is req" });

    const model = new ChatOpenAI({ model: "gpt-4.1-nano" });
    const response = await model.invoke([
      new SystemMessage(
        " Return either node or react based on what do you think this project should be. Only return a simple word either 'node' or 'react'. Do not return anything extra"
      ),
      new HumanMessage(prompt),
    ]);

    const answer = String(response.content).trim().toLowerCase();

    console.log(answer);

    if (answer === "react") {
      res.json({
        prompts: [
          BASE_PROMPT,
          `Here is an artifact that contains all files of the project visible to you . \n Consider the contents of ALL files in the project . \n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not begin shown to you:\n\n - .gitignore\n -package-lock.json\n`,
        ],
        uiPrompts: [reactBasePrompt],
      });
      return;
    }
    if (answer === "node") {
      res.json({
        prompts: [
          `Here is an artifact that contains all files of the project visible to you . \n Consider the contents of ALL files in the project . \n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not begin shown to you:\n\n - .gitignore\n -package-lock.json\n`,
        ],
        uiPrompts: [nodeBasePrompt],
      });
      return;
    }
  } catch (error) {
    console.log(error);
  }
};
