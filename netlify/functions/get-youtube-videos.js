exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Missing YouTube API Key configuration' })
    };
  }

  const { q } = event.queryStringParameters || {};
  if (!q) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing query parameter "q"' })
    };
  }

  try {
    const params = new URLSearchParams({
      part: 'snippet',
      q: q,
      key: apiKey,
      type: 'video',
      maxResults: 12
    });

    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);
    const data = await response.json();

    if (data.error) {
      return {
        statusCode: data.error.code || 500,
        headers,
        body: JSON.stringify({ error: data.error.message })
      };
    }

    // Transform to match our frontend expectation
    const items = data.items.map(item => ({
      id: { videoId: item.id.videoId },
      snippet: {
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnails: item.snippet.thumbnails
      }
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ items })
    };
  } catch (error) {
    console.error('YouTube API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
