import { FunctionDeclaration, Type } from "@google/genai";
import { Page } from "playwright-core";
import { waitForNetworkIdle } from "./utils";

const gotoTool: FunctionDeclaration = {
  name: "goto",
  description: "Navigate to a webpage",
  parameters: {
    type: Type.OBJECT,
    properties: {
      url: { type: Type.STRING },
    },
    required: ["url"],
  },
  response: {
    type: Type.OBJECT,
    properties: {
      html: { type: Type.STRING },
      error: { type: Type.STRING },
      success: { type: Type.BOOLEAN },
    },
    required: ["html", "success"],
  },
};

interface GotoFunctionResponse extends Record<string, unknown> {
  html: string;
  success: boolean;
  error?: string;
}

const clickTool: FunctionDeclaration = {
  name: "click",
  description: "Click an element on the page using CSS selector",
  parameters: {
    type: Type.OBJECT,
    properties: {
      selector: { type: Type.STRING },
    },
    required: ["selector"],
  },
  response: {
    type: Type.OBJECT,
    properties: {
      success: { type: Type.BOOLEAN },
    },
  },
};

interface ClickFunctionResponse extends Record<string, unknown> {
  success: boolean;
}

const typeTool: FunctionDeclaration = {
  name: "type",
  description: "Type text into an input field",
  parameters: {
    type: Type.OBJECT,
    properties: {
      selector: { type: Type.STRING },
      text: { type: Type.STRING },
    },
    required: ["selector", "text"],
  },
  response: {
    type: Type.OBJECT,
    properties: {
      success: { type: Type.BOOLEAN },
    },
  },
};

interface TypeFunctionResponse extends Record<string, unknown> {
  success: boolean;
  error?: string;
}

const getHtmlTool: FunctionDeclaration = {
  name: "getHtml",
  description: "Get the HTML of the current page",
  response: {
    type: Type.OBJECT,
    properties: {
      html: { type: Type.STRING },
      error: { type: Type.STRING },
      success: { type: Type.BOOLEAN },
    },
    required: ["html", "success"],
  },
};

interface GetHtmlFunctionResponse extends Record<string, unknown> {
  html: string;
  error?: string;
}

const checkSelectorTool: FunctionDeclaration = {
  name: "checkSelector",
  description: "Check if a selector is valid and visible on the page",
  parameters: {
    type: Type.OBJECT,
    properties: {
      selector: { type: Type.STRING },
    },
    required: ["selector"],
  },
  response: {
    type: Type.OBJECT,
    properties: {
      success: { type: Type.BOOLEAN },
      isVisible: { type: Type.BOOLEAN },
      error: { type: Type.STRING },
    },
  },
};

interface CheckSelectorFunctionResponse extends Record<string, unknown> {
  success: boolean;
  isVisible: boolean;
  error?: string;
}

const checkCurrentUrlTool: FunctionDeclaration = {
  name: "checkCurrentUrl",
  description: "Get the current URL of the page",
  response: {
    type: Type.OBJECT,
    properties: {
      success: { type: Type.BOOLEAN },
      url: { type: Type.STRING },
      error: { type: Type.STRING },
    },
    required: ["success", "url"],
  },
};

const screenshotTool: FunctionDeclaration = {
  name: "screenshot",
  description: "Take a screenshot of the current page",
  parameters: {
    type: Type.OBJECT,
    properties: {
      path: { type: Type.STRING },
    },
    required: ["path"],
  },
  response: {
    type: Type.OBJECT,
    properties: {
      success: { type: Type.BOOLEAN },
    },
    required: ["success"],
  },
};

const keyPressTool: FunctionDeclaration = {
  name: "keyPress",
  description:
    "Press a keyboard key (e.g., 'Enter', 'Tab', 'Escape', 'ArrowDown', etc.)",
  parameters: {
    type: Type.OBJECT,
    properties: {
      key: { type: Type.STRING },
    },
    required: ["key"],
  },
  response: {
    type: Type.OBJECT,
    properties: {
      success: { type: Type.BOOLEAN },
      error: { type: Type.STRING },
    },
    required: ["success"],
  },
};

interface CheckCurrentUrlFunctionResponse extends Record<string, unknown> {
  success: boolean;
  url: string;
  error?: string;
}

interface ScreenshotFunctionResponse extends Record<string, unknown> {
  success: boolean;
}

interface KeyPressFunctionResponse extends Record<string, unknown> {
  success: boolean;
  error?: string;
}

async function callFunction(
  page: Page,
  functionName: string,
  functionParams: any
) {
  const callGoto = async (url: string): Promise<GotoFunctionResponse> => {
    try {
      await page.goto(url);
      await waitForNetworkIdle(page);
      return { success: true, html: (await page.content()) || "" };
    } catch (err) {
      return { success: false, html: "", error: String(err) };
    }
  };

  const callClick = async (
    selector: string
  ): Promise<ClickFunctionResponse> => {
    try {
      await page.click(selector, { timeout: 3000 });
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  };

  const callType = async (
    selector: string,
    text: string
  ): Promise<TypeFunctionResponse> => {
    try {
      await page.locator(selector).fill(text);
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  };

  const callCheckSelector = async (
    selector: string
  ): Promise<CheckSelectorFunctionResponse> => {
    try {
      const isVisible = await page
        .locator(selector)
        .isVisible({ timeout: 1000 });
      return { success: true, isVisible };
    } catch (err) {
      return { success: false, isVisible: false, error: String(err) };
    }
  };

  const callGetHtml = async (): Promise<GetHtmlFunctionResponse> => {
    try {
      const html = await page.content();
      return { success: true, html: html || "" };
    } catch (err) {
      return { success: false, html: "", error: String(err) };
    }
  };

  const callCheckCurrentUrl =
    async (): Promise<CheckCurrentUrlFunctionResponse> => {
      try {
        const url = page.url();
        return { success: true, url };
      } catch (err) {
        return { success: false, url: "", error: String(err) };
      }
    };

  const callScreenshot = async (
    path: string
  ): Promise<ScreenshotFunctionResponse> => {
    try {
      await page.screenshot({ path });
      return { success: true };
    } catch (err) {
      return { success: false };
    }
  };

  const callKeyPress = async (
    key: string
  ): Promise<KeyPressFunctionResponse> => {
    try {
      await page.keyboard.press(key);
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  };

  switch (functionName) {
    case "goto":
      return await callGoto(functionParams.url);
    case "click":
      return await callClick(functionParams.selector);
    case "type":
      return await callType(functionParams.selector, functionParams.text);
    case "checkSelector":
      return await callCheckSelector(functionParams.selector);
    case "getHtml":
      return await callGetHtml();
    case "checkCurrentUrl":
      return await callCheckCurrentUrl();
    case "screenshot":
      return await callScreenshot(functionParams.path);
    case "keyPress":
      return await callKeyPress(functionParams.key);
  }
  return { success: false, message: "Function not found" };
}

export {
  gotoTool,
  clickTool,
  typeTool,
  checkSelectorTool,
  getHtmlTool,
  checkCurrentUrlTool,
  screenshotTool,
  keyPressTool,
  callFunction,
};

export type {
  GotoFunctionResponse,
  ClickFunctionResponse,
  TypeFunctionResponse,
  GetHtmlFunctionResponse,
  CheckSelectorFunctionResponse,
  CheckCurrentUrlFunctionResponse,
  ScreenshotFunctionResponse,
  KeyPressFunctionResponse,
};
