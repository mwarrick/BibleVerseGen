const { createCanvas, loadImage } = require('canvas');
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Get parameters from query string or POST body
    const { imageUrl, verseText, reference, bookName, chapter, verse } = 
      req.method === 'POST' ? req.body : req.query;

    // Validate required parameters
    if (!imageUrl || !verseText || !reference) {
      return res.status(400).json({ 
        error: 'Missing required parameters: imageUrl, verseText, and reference are required' 
      });
    }

    console.log('Downloading image from:', imageUrl);
    
    // Download the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.statusText}`);
    }
    
    const imageBuffer = await imageResponse.buffer();
    const image = await loadImage(imageBuffer);

    // Create canvas with same dimensions as image
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    // Draw the original image
    ctx.drawImage(image, 0, 0);

    // Add semi-transparent overlay at bottom for better text readability
    const overlayHeight = image.height * 0.3;
    const gradient = ctx.createLinearGradient(
      0, image.height - overlayHeight, 
      0, image.height
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.75)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, image.height - overlayHeight, image.width, overlayHeight);

    // Configure text style
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Function to wrap text
    function wrapText(text, maxWidth) {
      const words = text.split(' ');
      const lines = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + ' ' + word).width;
        if (width < maxWidth) {
          currentLine += ' ' + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
      return lines;
    }

    // Calculate font size based on image width
    const fontSize = Math.floor(image.width / 35);
    ctx.font = `${fontSize}px Arial, sans-serif`;
    
    const maxWidth = image.width * 0.85;
    const lines = wrapText(verseText, maxWidth);
    const lineHeight = fontSize * 1.6;
    const startY = image.height - overlayHeight + 60;

    // Draw verse text
    lines.forEach((line, index) => {
      ctx.fillText(line, image.width / 2, startY + (index * lineHeight));
    });

    // Draw reference
    ctx.font = `bold ${Math.floor(fontSize * 1.1)}px Arial, sans-serif`;
    const referenceY = startY + (lines.length * lineHeight) + 40;
    ctx.fillText(reference, image.width / 2, referenceY);

    // Convert to buffer and send
    const finalImage = canvas.toBuffer('image/png');
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${reference.replace(/\s+/g, '_')}.png"`);
    res.send(finalImage);

  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ 
      error: 'Failed to process image', 
      details: error.message 
    });
  }
};
