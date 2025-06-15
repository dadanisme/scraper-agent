# Scraper Agent

An intelligent web scraping agent powered by Google's Gemini AI that can autonomously navigate websites, interact with web elements, and extract information through natural language instructions.

## 🤖 Overview

Scraper Agent uses AI-driven function calling to interpret natural language tasks and execute them through browser automation. Instead of writing complex scraping scripts, you can simply describe what you want to do, and the agent will figure out how to accomplish it.

## ✨ Features

- **Natural Language Tasks**: Describe what you want to do in plain English
- **AI-Powered Navigation**: Uses Google Gemini to understand and execute web interactions
- **Robust Web Automation**: Built on Playwright for reliable browser control
- **Smart Element Selection**: Automatically generates CSS selectors for web elements
- **Comprehensive Logging**: Detailed markdown logs of all actions taken
- **Screenshot Capabilities**: Can capture screenshots of web pages
- **Error Handling**: Graceful error recovery and alternative action attempts

## 🛠️ Available Tools

The agent can perform these actions:

- **Navigation**: Go to any URL
- **Interaction**: Click buttons, links, and other elements
- **Input**: Type text into forms and input fields
- **Inspection**: Check if elements exist and are visible
- **Content Extraction**: Get HTML content from pages
- **Screenshots**: Capture images of web pages
- **URL Checking**: Get the current page URL

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Gemini API key, you can get it [here](https://aistudio.google.com/apikey)

## 🚀 Installation

1. Clone the repository:

```bash
git clone https://github.com/dadanisme/scraper-agent
cd scraper-agent
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_google_ai_api_key_here
```

## 📖 Usage

### Basic Usage

```typescript
import { ScraperAgent } from "./src/agent";

const agent = new ScraperAgent();

// Give the agent a task in natural language
await agent.doTask(`
  Go to Google.com and search for 'Playwright documentation'.
  Click on the first result and take a screenshot.
`);

await agent.cleanup();
```

### Running the Example

The project includes a sample task that demonstrates the agent's capabilities:

```bash
npm start
```

This will:

1. Navigate to Bing
2. Search for "playwright"
3. Click on the most relevant result
4. Take a screenshot of the page

### Custom Tasks

You can create custom tasks by modifying `src/index.ts` or creating new scripts:

```typescript
import { ScraperAgent } from "./src/agent";

async function customTask() {
  const agent = new ScraperAgent();

  await agent.doTask(`
    Go to https://example.com
    Fill out the contact form with:
    - Name: John Doe
    - Email: john@example.com
    - Message: Hello from the scraper agent!
    Then submit the form and take a screenshot.
  `);

  await agent.cleanup();
}

customTask();
```

## 🔧 Configuration

### Environment Variables

- `GEMINI_API_KEY`: Your Google AI API key (required)

### Agent Configuration

The agent can be configured with various options:

```typescript
const agent = new ScraperAgent();

// Set maximum number of attempts
agent.setMaxAttempts(30);

// Use a custom page instance
agent.overridePage(customPage);

// Override the system instruction
agent.overrideSystemInstruction("Custom AI instructions here");
```

## 📊 Output and Logging

The agent automatically generates detailed logs in `output.md` that include:

- Task description and objectives
- Each action taken by the agent
- Function calls with parameters
- Results and responses
- Screenshots and errors
- Completion status

Example log entry:

````markdown
## 🤖 Agent Response

Okay, let's start by navigating to Bing.

### 🔧 Function Call: `goto`

```json
{
  "url": "https://www.bing.com"
}
```
````

#### ✅ Result

```
{
  "success": true,
  "html": "<!DOCTYPE html>..."
}
```

````

## 🎯 Task Examples

### Web Scraping
```typescript
await agent.doTask(`
  Go to https://quotes.toscrape.com
  Extract all quotes from the first page
  Take a screenshot of the page
`);
````

### Form Automation

```typescript
await agent.doTask(`
  Go to the login page
  Enter username 'testuser' and password 'testpass'
  Click the login button
  Navigate to the profile page
`);
```

### Data Collection

```typescript
await agent.doTask(`
  Go to an e-commerce site
  Search for 'laptop'
  Collect the names and prices of the first 10 results
  Take screenshots of each product page
`);
```

## 🏗️ Architecture

The project consists of several key components:

- **`ScraperAgent`**: Main agent class that orchestrates AI and browser interactions
- **Tools**: Individual functions for web automation (goto, click, type, etc.)
- **Constants**: System instructions and configuration for the AI
- **Utils**: Utility functions for network handling and timing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This tool is for educational and legitimate automation purposes only. Always respect websites' terms of service and robots.txt files. Be mindful of rate limiting and don't overload servers with requests.

## 🐛 Troubleshooting

### Common Issues

1. **"GEMINI_API_KEY not found"**

   - Make sure you have a `.env` file with your Google AI API key

2. **Browser not launching**

   - Try running with `headless: true` in the browser configuration
   - Ensure you have the necessary browser dependencies installed
   - Try running `npx playwright install`

3. **Selector not found errors**

   - The agent will try alternative selectors automatically
   - Check the logs in `output.md` for detailed error information

4. **Network timeout issues**
   - Increase the timeout values in the configuration
   - Check your internet connection

### Getting Help

If you encounter issues:

1. Check the `output.md` file for detailed logs
2. Look at the console output for immediate error messages
3. Verify your environment variables are set correctly
4. Ensure your Google AI API key has the necessary permissions

## 🔮 Future Enhancements

- Support for multiple browser engines
- Integration with more AI models
- Advanced data extraction capabilities
- Parallel task execution
- Visual element recognition
- Mobile browser support
