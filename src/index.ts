import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";
import fs from "fs";

import { handleMergeFranchise } from "./tools/merge-franchise.js";

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Use user's home directory for cache in production
const isDevelopment = process.env.NODE_ENV === 'development';
const dbPath = isDevelopment 
  ? path.join(__dirname, "..", "cache.db")
  : path.join(os.homedir(), ".jikan-mcp-server", "cache.db");

// Ensure directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const cacheDB = new sqlite3.Database(dbPath);

const server = new Server(
    {
      name: "jikan-mcp-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [

      {
        name: "get_merged_anime_franchise",
        description: "Searches the Jikan (MyAnimeList) API for an anime and returns a single, chronologically sorted JSON object containing the core anime and all related seasons, movies, and spin-offs.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The name of the anime to search for.",
            },
          },
          required: ["query"],
        },
      },

    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get_merged_anime_franchise") {

    // Arguments from LLM
    const query = request.params.arguments?.query as string;

    if (!query) {
      throw new Error("Missing required argument: query");
    }

    try{
        const mergedData = await handleMergeFranchise(query);
        
        if(!mergedData){
            return {
                content: [
                    {
                        type: "text",
                        text: "Failed to merge franchise"
                    }
                ]
            };
        } else {
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(mergedData, null, 2)
                    }
                ]
            };
        }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to merge franchise: ${error}`
          }
        ]
      };
    }
  }
  
  throw new Error(`Unknown tool: ${request.params.name}`);
});

export async function main() {
  cacheDB.serialize(() => {
    cacheDB.run("CREATE TABLE IF NOT EXISTS cache (query TEXT PRIMARY KEY, data TEXT, ttl INTEGER)");
  });
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Jikan MCP Server started");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}