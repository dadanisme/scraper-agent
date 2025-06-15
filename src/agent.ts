import {
  Chat,
  GenerateContentConfig,
  GoogleGenAI,
  ToolListUnion,
  Type,
} from "@google/genai";
import { Browser, chromium, Page } from "playwright-core";

import {
  checkCurrentUrlTool,
  checkSelectorTool,
  clickTool,
  getHtmlTool,
  gotoTool,
  keyPressTool,
  screenshotTool,
  typeTool,
} from "./tools";
import { callFunction } from "./tools";
import { SYSTEM_INSTRUCTION } from "./constants";
import { appendFileSync, writeFileSync } from "fs";

export class ScraperAgent {
  private genAi: GoogleGenAI;
  private tools: ToolListUnion;
  private config: GenerateContentConfig;
  private chat: Chat;
  private page: Page | null = null;
  private browser: Browser | null = null;
  private maxAttempts = 50;

  constructor(page?: Page) {
    this.prepareMd();
    this.genAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    this.tools = [
      {
        functionDeclarations: [
          gotoTool,
          clickTool,
          typeTool,
          checkSelectorTool,
          getHtmlTool,
          checkCurrentUrlTool,
          screenshotTool,
          keyPressTool,
        ],
      },
    ];

    this.config = {
      temperature: 0,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 1000,
      candidateCount: 1,
      tools: this.tools,
      systemInstruction: SYSTEM_INSTRUCTION,
    };

    this.chat = this.genAi.chats.create({
      model: "gemini-2.0-flash",
      history: [],
      config: this.config,
    });

    if (page) {
      this.page = page;
    }
  }

  private async initialize() {
    if (!this.page) {
      this.browser = await chromium.launch({ headless: false });
      this.page = await this.browser.newPage();
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  private prepareMd() {
    writeFileSync("output.md", "# Scraper Agent Log\n\n");
  }

  private log(message: string, markdownMessage?: string) {
    // skip empty messages
    if (!message || message.trim() === "") {
      return;
    }

    console.log(`[Agent] ${message}`);
    const mdContent = markdownMessage || message;
    appendFileSync("output.md", `${mdContent}\n\n`);
  }

  private logMarkdown(consoleMsg: string, markdownContent: string) {
    console.log(`[Agent] ${consoleMsg}`);
    appendFileSync("output.md", `${markdownContent}\n\n`);
  }

  private logSystemMessage(message: string) {
    console.log(`[Agent] ${message}`);
    appendFileSync("output.md", `> **System**: ${message}\n\n`);
  }

  private logFunctionCall(functionName: string, params: any) {
    const consoleMsg = `Calling function ${functionName} with params ${JSON.stringify(
      params
    )}`;
    const markdownMsg = `### 🔧 Function Call: \`${functionName}\`

\`\`\`json
${JSON.stringify(params, null, 2)}
\`\`\``;

    this.logMarkdown(consoleMsg, markdownMsg);
  }

  private logAgentResponse(text: string) {
    if (!text || text.trim() === "") {
      return;
    }

    console.log(`[Agent] ${text}`);
    appendFileSync("output.md", `## 🤖 Agent Response\n\n${text}\n\n`);
  }

  async doTask(task: string) {
    if (!this.page) {
      await this.initialize();
    }

    if (!this.page) {
      throw new Error("Failed to initialize page");
    }

    this.logMarkdown(
      `Starting task: ${task}`,
      `## 📋 Task Started\n\n**Objective**: ${task}\n\n---`
    );

    let attempts = 0;
    let response = await this.chat.sendMessage({
      message: task,
    });

    while (attempts < this.maxAttempts) {
      const { functionCalls } = response;

      // accessing response.text will give unimportant info
      const text = response.candidates
        ?.map((c) => c.content?.parts?.map((part) => part.text).join(""))
        .join("\n");

      if (text && text.trim()) {
        this.logAgentResponse(text);
      }

      if (!functionCalls?.length) {
        this.logSystemMessage("No function calls found - task may be complete");
        break;
      }

      this.logSystemMessage(
        `Processing ${functionCalls?.length} function call(s)`
      );

      for (const call of functionCalls) {
        const functionName = call.name;
        const functionParams = call.args;

        if (!functionName || !functionParams) {
          this.logSystemMessage(
            "Invalid function call - missing name or parameters"
          );
          break;
        }

        try {
          this.logFunctionCall(functionName, functionParams);

          const result = await callFunction(
            this.page,
            functionName,
            functionParams
          );

          this.logMarkdown(
            `Function ${functionName} completed successfully`,
            `#### ✅ Result\n\n\`\`\`\n${
              typeof result === "string"
                ? result
                : JSON.stringify(result, null, 2)
            }\n\`\`\``
          );

          response = await this.chat.sendMessage({
            message: {
              functionResponse: {
                name: call.name,
                response: result,
              },
            },
          });
        } catch (err) {
          const errorMsg = `Error calling function ${functionName}: ${String(
            err
          )}`;
          this.logMarkdown(
            errorMsg,
            `#### ❌ Error\n\n\`\`\`\n${errorMsg}\n\`\`\``
          );

          response = await this.chat.sendMessage({
            message: errorMsg,
          });
        }
      }
      attempts++;
    }

    if (attempts === this.maxAttempts) {
      this.logSystemMessage(`Max attempts reached (${this.maxAttempts})`);
    }

    this.logMarkdown(
      "Task completed",
      `## ✅ Task Completed\n\n**Attempts used**: ${attempts}/${this.maxAttempts}\n\n---`
    );

    return response.text;
  }

  async checkStatus(): Promise<CheckStatusResponse> {
    const response = await this.chat.sendMessage({
      message: "Check the status of the task",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            success: { type: Type.BOOLEAN },
            error: { type: Type.STRING },
          },
          required: ["success"],
        },
      },
    });

    if (!response.text) {
      throw new Error("Failed to check status");
    }

    return JSON.parse(response.text);
  }

  setMaxAttempts(maxAttempts: number) {
    this.maxAttempts = maxAttempts;
  }

  overridePage(page: Page) {
    this.page = page;
  }

  overrideSystemInstruction(systemInstruction: string) {
    this.config.systemInstruction = systemInstruction;
  }
}

interface CheckStatusResponse {
  success: boolean;
  error?: string;
}
