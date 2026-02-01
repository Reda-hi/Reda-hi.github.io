const cloudinary = require('cloudinary').v2;

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Missing Cloudinary configuration' })
    };
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  try {
    const body = JSON.parse(event.body || '{}');
    const { tags, title, description } = body;

    const timestamp = Math.round((new Date()).getTime() / 1000);
    
    // Create context string (e.g. "title=My Video|description=Cool stuff")
    // Sanitize to avoid breaking the pipe format
    const cleanTitle = (title || '').replace(/\|/g, '-');
    const cleanDesc = (description || '').replace(/\|/g, '-');
    const contextStr = `title=${cleanTitle}|description=${cleanDesc}|caption=${cleanTitle}|alt=${cleanDesc}`;

    const params = {
      timestamp: timestamp,
      folder: 'recycle-it-videos',
      tags: tags || '',
      context: contextStr
    };

    // Sign the request
    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        signature,
        timestamp,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        folder: params.folder,
        tags: params.tags,
        context: params.context
      })
    };
  } catch (error) {
    console.error('Error generating signature:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
