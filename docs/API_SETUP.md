# API Setup Guide

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_API_KEY=your-api-key-here

# Optional: Enable debug mode
REACT_APP_DEBUG=false
```

## API Endpoints

The application expects the following API endpoints:

### 1. Chat Endpoint
- **URL**: `POST /api/chat`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer {API_KEY}` (optional)

**Request Body:**
```json
{
  "message": "string",
  "attachments": [
    {
      "id": "string",
      "title": "string", 
      "kind": "pdf|csv|markdown|text|html|table",
      "mime": "string",
      "url": "string", // for pdf/csv
      "content": "string", // for markdown/text/html
      "data": { // for table
        "columns": ["string"],
        "rows": [["string|number"]]
      },
      "preview": "string"
    }
  ],
  "conversation_history": [
    {
      "id": "string",
      "role": "user|assistant",
      "content": "string",
      "attachments": [] // optional
    }
  ]
}
```

**Response:**
```json
{
  "message": "string",
  "attachments": [
    {
      "id": "string",
      "title": "string",
      "kind": "pdf|csv|markdown|text|html|table",
      "mime": "string",
      "url": "string", // for pdf/csv
      "content": "string", // for markdown/text/html
      "data": { // for table
        "columns": ["string"],
        "rows": [["string|number"]]
      },
      "preview": "string"
    }
  ],
  "error": "string" // optional, only if error occurred
}
```

### 2. File Upload Endpoint
- **URL**: `POST /api/upload`
- **Headers**: 
  - `Authorization: Bearer {API_KEY}` (optional)
- **Body**: `multipart/form-data` with file

**Response:**
```json
{
  "url": "string", // URL to access the uploaded file
  "id": "string" // unique identifier for the file
}
```

## Demo Mode

If no API is configured or the API is unavailable, the application will automatically fall back to demo mode with pre-configured responses based on the user's message content.

## Backend Implementation Examples

### Python FastAPI Example

```python
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/chat")
async def chat(request: dict):
    message = request.get("message", "")
    attachments = request.get("attachments", [])
    
    # Process the message and attachments
    # Your AI logic here
    
    response = {
        "message": f"AI response to: {message}",
        "attachments": []  # Optional attachments
    }
    
    return response

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    # Save file and return URL
    file_url = f"https://your-cdn.com/files/{file.filename}"
    
    return {
        "url": file_url,
        "id": f"file_{file.filename}"
    }
```

### Node.js Express Example

```javascript
const express = require('express');
const multer = require('multer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.post('/api/chat', (req, res) => {
  const { message, attachments, conversation_history } = req.body;
  
  // Process the message and attachments
  // Your AI logic here
  
  res.json({
    message: `AI response to: ${message}`,
    attachments: [] // Optional attachments
  });
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  
  res.json({
    url: `https://your-cdn.com/files/${file.filename}`,
    id: `file_${file.filename}`
  });
});

app.listen(8000, () => {
  console.log('API server running on port 8000');
});
```

## Security Considerations

1. **Authentication**: Implement proper authentication for production use
2. **File Validation**: Validate uploaded files for type, size, and content
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **CORS**: Configure CORS properly for your domain
5. **File Storage**: Use secure file storage (S3, etc.) for production
6. **API Keys**: Store API keys securely and rotate them regularly

## Testing

You can test the API integration by:

1. Setting up a simple backend server
2. Configuring the environment variables
3. Uploading files and sending messages
4. Verifying the AI responses and attachments

The application will gracefully handle API failures and fall back to demo mode for development and testing.

