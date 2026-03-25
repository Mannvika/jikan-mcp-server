# Jikan MCP Server

A Model Context Protocol (MCP) server for Jikan API - the unofficial MyAnimeList API. This server allows LLMs to search and retrieve anime, manga, and related franchise information through a structured interface.

## Features

- **Anime Franchise Search**: Get complete anime franchises including seasons, movies, and spin-offs
- **Intelligent Caching**: Local SQLite database for API response caching
- **Chronological Sorting**: Automatically sorts franchise content by release date
- **Error Handling**: Robust error handling with meaningful messages

## Installation

### Global Installation (Recommended)
```bash
npm install -g jikan-mcp-server
```

### Local Installation
```bash
npm install jikan-mcp-server
```

### Development Installation
```bash
git clone https://github.com/yourusername/jikan-mcp-server.git
cd jikan-mcp-server
npm install
npm run build
```

## Usage

### As MCP Server

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "jikan": {
      "command": "jikan-mcp-server",
      "args": []
    }
  }
}
```

### Direct CLI Usage

```bash
# Start the server
jikan-mcp-server

# Or if installed locally
npx jikan-mcp-server
```

## Available Tools

### `get_merged_anime_franchise`

Searches for an anime and returns a complete franchise with all related content.

**Parameters:**
- `query` (string, required): The name of the anime to search for

**Example Usage:**
```
Search for "Attack on Titan" to get the complete franchise including:
- Attack on Titan (Season 1-4)
- All movies and OVAs
- Spin-offs and related series
```

## Development

### Building
```bash
npm run build
```

### Development Mode
```bash
npm run dev
```

### Testing
```bash
npm test
```

## Configuration

### Cache Location
- **Development**: `./cache.db` (project root)
- **Production**: `~/.jikan-mcp-server/cache.db` (user home directory)

### Environment Variables
- `NODE_ENV=development`: Use development cache location
- `NODE_ENV=production`: Use production cache location (default)

## API Rate Limits

This server uses the Jikan API which has rate limits:
- **Unauthenticated**: 3 requests/second
- **Authenticated**: 30 requests/second

The built-in caching helps minimize API calls and respect rate limits.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/jikan-mcp-server/issues)
- **Jikan API**: [Jikan Documentation](https://docs.jikan.moe/)

## Related Projects

- [Jikan API](https://jikan.moe/) - The unofficial MyAnimeList API
- [Model Context Protocol](https://modelcontextprotocol.io/) - The protocol this server implements
