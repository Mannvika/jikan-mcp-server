#!/usr/bin/env node

import { main } from './index.js';

// Handle CLI execution
main().catch((error) => {
  console.error('Failed to start Jikan MCP Server:', error);
  process.exit(1);
});
