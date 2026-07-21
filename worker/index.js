const worker = {
  async fetch(request, env) {
    let response = await env.ASSETS.fetch(request);

    if (response.status === 404) {
      response = await env.ASSETS.fetch(new Request(new URL("/", request.url), request));
    }

    const headers = new Headers(response.headers);
    const pathname = new URL(request.url).pathname;
    const isVersionedAsset = pathname.startsWith("/assets/");
    const isStaticAsset = /\.(?:avif|gif|ico|jpe?g|png|svg|webp|woff2?)$/i.test(pathname);

    headers.set("Cache-Control", isVersionedAsset || isStaticAsset
      ? "public, max-age=31536000, immutable"
      : "public, max-age=0, must-revalidate");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "SAMEORIGIN");
    headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};

export default worker;
