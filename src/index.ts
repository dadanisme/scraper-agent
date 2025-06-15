import { ScraperAgent } from "./agent";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const agent = new ScraperAgent();
  await agent.doTask(`
    Go to Bing and search for 'playwright'.
    Open the most relevant result and screenshot the page.
  `);

  await agent.cleanup();
}

main().finally(() => {
  console.log("Done");
  process.exit(0);
});
