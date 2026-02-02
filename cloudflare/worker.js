const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders
    }
  });
}

function plainResponse(status, body) {
  return new Response(body, { status, headers: corsHeaders });
}

function getRequiredEnv(env, key) {
  const value = env[key];
  const normalized = typeof value === "string" ? value.trim() : value;
  if (!normalized || normalized === "CHANGE_ME" || normalized === "REPLACE_ME") {
    throw new Error(`Missing ${key} configuration`);
  }
  return value;
}

async function sha1Hex(input) {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-1", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function buildSignatureString(params) {
  const pairs = Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== "")
    .sort()
    .map(key => `${key}=${params[key]}`);
  return pairs.join("&");
}

async function handleGetSignature(request, env) {
  const cloudName = getRequiredEnv(env, "CLOUDINARY_CLOUD_NAME");
  const apiKey = getRequiredEnv(env, "CLOUDINARY_API_KEY");
  const apiSecret = getRequiredEnv(env, "CLOUDINARY_API_SECRET");

  const body = await request.json().catch(() => ({}));
  const title = (body.title || "").replace(/\|/g, "-");
  const description = (body.description || "").replace(/\|/g, "-");
  const tags = body.tags || "";
  const timestamp = Math.round(Date.now() / 1000);
  const context = `title=${title}|description=${description}|caption=${title}|alt=${description}`;

  const params = {
    timestamp,
    folder: "recycle-it-videos",
    tags,
    context
  };

  const signatureBase = buildSignatureString(params) + apiSecret;
  const signature = await sha1Hex(signatureBase);

  return jsonResponse(200, {
    signature,
    timestamp,
    cloud_name: cloudName,
    api_key: apiKey,
    folder: params.folder,
    tags: params.tags,
    context: params.context
  });
}

async function handleGetVideos(request, env) {
  const cloudName = getRequiredEnv(env, "CLOUDINARY_CLOUD_NAME");
  const apiKey = getRequiredEnv(env, "CLOUDINARY_API_KEY");
  const apiSecret = getRequiredEnv(env, "CLOUDINARY_API_SECRET");

  const url = new URL(request.url);
  const tagsParam = url.searchParams.get("tags") || "";
  let expression = "resource_type:video AND folder:recycle-it-videos";

  if (tagsParam) {
    const tags = tagsParam.split(",").map(t => t.trim()).filter(Boolean);
    if (tags.length > 0) {
      const tagExpression = tags.map(tag => `tags:${tag}`).join(" AND ");
      expression = `${expression} AND ${tagExpression}`;
    }
  }

  const payload = {
    expression,
    sort_by: [{ created_at: "desc" }],
    max_results: 30,
    with_field: ["tags", "context"]
  };

  const auth = btoa(`${apiKey}:${apiSecret}`);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${auth}`
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    return jsonResponse(response.status, { error: data.error?.message || "Cloudinary search failed" });
  }

  const videos = (data.resources || []).map(res => {
    const ctx = res.context || {};
    const custom = ctx.custom || {};
    const title =
      custom.title ||
      ctx.caption ||
      res.original_filename ||
      res.public_id ||
      "Untitled";
    const description =
      custom.description ||
      ctx.alt ||
      "";
    return {
      id: res.public_id,
      title,
      description,
      tags: res.tags || [],
      url: res.secure_url,
      thumbnail: res.secure_url.replace(/\.[^/.]+$/, ".jpg")
    };
  });

  return jsonResponse(200, videos);
}

async function handleGetYouTubeVideos(request, env) {
  const apiKey = getRequiredEnv(env, "YOUTUBE_API_KEY");
  const url = new URL(request.url);
  const q = url.searchParams.get("q");

  if (!q) {
    return jsonResponse(400, { error: "Missing query parameter \"q\"" });
  }

  const params = new URLSearchParams({
    part: "snippet",
    q,
    key: apiKey,
    type: "video",
    maxResults: "12"
  });

  const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);
  const data = await response.json();

  if (!response.ok || data.error) {
    return jsonResponse(data.error?.code || response.status || 500, { error: data.error?.message || "YouTube API error" });
  }

  const items = (data.items || []).map(item => ({
    id: { videoId: item.id?.videoId },
    snippet: {
      title: item.snippet?.title,
      description: item.snippet?.description,
      thumbnails: item.snippet?.thumbnails
    }
  }));

  return jsonResponse(200, { items });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return plainResponse(200, "");
    }

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "");

    try {
      if (path === "/get-signature" && request.method === "POST") {
        return await handleGetSignature(request, env);
      }
      if (path === "/get-videos" && request.method === "GET") {
        return await handleGetVideos(request, env);
      }
      if (path === "/get-youtube-videos" && request.method === "GET") {
        return await handleGetYouTubeVideos(request, env);
      }
      return jsonResponse(404, { error: "Not found" });
    } catch (error) {
      return jsonResponse(500, { error: error.message || "Server error" });
    }
  }
};
