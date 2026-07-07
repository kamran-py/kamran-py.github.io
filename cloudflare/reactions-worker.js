const allowedOrigins = new Set([
  "https://kamranashaikh.com",
  "https://www.kamranashaikh.com",
  "http://127.0.0.1:8017",
  "http://localhost:8017",
]);

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const allowOrigin = allowedOrigins.has(origin) ? origin : "https://kamranashaikh.com";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function json(data, request, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...corsHeaders(request),
    },
  });
}

function cleanSlug(value) {
  const slug = String(value || "").trim().toLowerCase();
  return /^[a-z0-9-]{1,80}$/.test(slug) ? slug : null;
}

async function readCounts(env, slug) {
  return (await env.REACTIONS.get(`article:${slug}`, "json")) || { likes: 0, shares: 0 };
}

async function writeCounts(env, slug, counts) {
  await env.REACTIONS.put(
    `article:${slug}`,
    JSON.stringify({
      likes: Math.max(0, Number(counts.likes) || 0),
      shares: Math.max(0, Number(counts.shares) || 0),
    }),
  );
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(request) });
    }

    const url = new URL(request.url);

    if (request.method === "GET") {
      const slug = cleanSlug(url.searchParams.get("slug"));
      if (!slug) return json({ error: "Invalid article" }, request, 400);
      return json(await readCounts(env, slug), request);
    }

    if (request.method === "POST") {
      let body = {};
      try {
        body = await request.json();
      } catch {
        return json({ error: "Invalid request" }, request, 400);
      }

      const slug = cleanSlug(body.slug);
      const action = String(body.action || "");
      if (!slug || !["like", "unlike", "share"].includes(action)) {
        return json({ error: "Invalid action" }, request, 400);
      }

      const counts = await readCounts(env, slug);
      if (action === "like") counts.likes += 1;
      if (action === "unlike") counts.likes = Math.max(0, counts.likes - 1);
      if (action === "share") counts.shares += 1;
      await writeCounts(env, slug, counts);
      return json(counts, request);
    }

    return json({ error: "Not found" }, request, 404);
  },
};
