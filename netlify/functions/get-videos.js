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
    const { tags } = event.queryStringParameters || {};
    
    // Base expression: must be a video and in our folder
    let expression = 'resource_type:video AND folder:recycle-it-videos';
    
    if (tags) {
      const tagList = tags.split(',').filter(t => t.trim());
      if (tagList.length > 0) {
        // Cloudinary search syntax: AND tags:tag1 AND tags:tag2
        const tagExpression = tagList.map(tag => `tags:${tag.trim()}`).join(' AND ');
        expression += ` AND ${tagExpression}`;
      }
    }

    const result = await cloudinary.search
      .expression(expression)
      .sort_by('created_at', 'desc')
      .max_results(30)
      .with_field('tags')
      .with_field('context')
      .execute();

    const videos = result.resources.map(res => {
      const ctx = res.context || {};
      const custom = ctx.custom || {};
      const title =
        custom.title ||
        ctx.caption ||
        res.original_filename ||
        res.public_id ||
        'Untitled';
      const description =
        custom.description ||
        ctx.alt ||
        '';
      return {
        id: res.public_id,
        title,
        description,
        tags: res.tags || [],
        url: res.secure_url,
        thumbnail: res.secure_url.replace(/\.[^/.]+$/, ".jpg")
      };
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(videos)
    };
  } catch (error) {
    console.error('Error searching videos:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
