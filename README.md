# String Analyzer Service

A RESTful API service that analyzes strings and stores their computed properties.

## Features

- Analyze strings for various properties (length, palindrome, word count, etc.)
- SHA-256 hash generation for unique identification
- Filtering capabilities including natural language queries
- In-memory storage with fast lookups

## API Endpoints

### 1. Create/Analyze String

**POST** `/strings`

```json
{
  "value": "string to analyze"
}
```

2. Get Specific String
   GET /strings/{string_value}

3. Get All Strings with Filtering
   GET /strings?is_palindrome=true&min_length=5&max_length=20&word_count=2&contains_character=a

4. Natural Language Filtering
   GET /strings/filter-by-natural-language?query=all%20single%20word%20palindromic%20strings

5. Delete String
   DELETE /strings/{string_value}

Setup Instructions
Prerequisites
Node.js (v14 or higher)
npm

Instruction to run locally

1. Clone the repository:

```bash
git clone <your-repo-url>
cd string-analyzer-service
```

2. Install dependencies

```bash
npm install
```

3. Start the server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on http://localhost:3000

Environment Variables
No environment variables are required for basic operation.

Testing
Run the test suite:

```bash
npm test
```

Dependencies
Production
express: Web framework

helmet: Security middleware

cors: Cross-origin resource sharing

express-rate-limit: Rate limiting middleware

Development
nodemon: Development server with auto-restart

jest: Testing framework

supertest: HTTP assertion testing

Example Usage

```bash
# Analyze a string
curl -X POST http://localhost:3000/strings \
  -H "Content-Type: application/json" \
  -d '{"value": "Hello World"}'

# Get analyzed string
curl http://localhost:3000/strings/Hello%20World

# Filter strings
curl "http://localhost:3000/strings?min_length=5&is_palindrome=false"

# Natural language query
curl "http://localhost:3000/strings/filter-by-natural-language?query=all%20single%20word%20palindromic%20strings"

# Delete string
curl -X DELETE http://localhost:3000/strings/Hello%20World
```

Deployment
This application can be deployed to any Node.js hosting platform (Railway, Heroku, AWS, etc.).

Railway Deployment
Connect your GitHub repository to Railway

Railway will automatically detect the Node.js app

Deploy!
