# Bible Verse Image Overlay Service

A serverless function that overlays Bible verse text on images.

## Deployment Instructions

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy
```bash
vercel --prod
```

## Usage

Once deployed, you'll get a URL like: `https://your-project.vercel.app`

### API Endpoint
`POST https://your-project.vercel.app/api/overlay`

### Parameters (POST JSON body or GET query params):
- `imageUrl` (required) - URL of the image to overlay text on
- `verseText` (required) - The Bible verse text
- `reference` (required) - The verse reference (e.g., "John 3:16")
- `bookName` (optional) - Book name
- `chapter` (optional) - Chapter number
- `verse` (optional) - Verse number

### Example Request (GET):
```
https://your-project.vercel.app/api/overlay?imageUrl=https://example.com/image.png&verseText=For God so loved the world&reference=John 3:16
```

### Example Request (POST):
```javascript
fetch('https://your-project.vercel.app/api/overlay', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imageUrl: 'https://example.com/image.png',
    verseText: 'For God so loved the world...',
    reference: 'John 3:16'
  })
})
```

## Response
Returns a PNG image with the text overlaid.

## n8n Integration

In your n8n workflow, add an HTTP Request node after your image generation:
- Method: POST
- URL: `https://your-project.vercel.app/api/overlay`
- Body: JSON with the parameters above
- Response Format: File

The returned image can then be uploaded to Google Drive.
