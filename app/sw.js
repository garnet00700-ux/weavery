/* 앱 설치용 서비스 워커 — 늘 인터넷의 최신 파일을 먼저 받고(자동 업데이트),
   인터넷이 끊겼을 때만 마지막으로 받아 둔 화면을 보여 줍니다.
   이 폴더 바로 아래 파일만 다루고, 하위 폴더(다른 앱) · 서명 페이지 · 다른 사이트(서버)는 건드리지 않습니다. */
const CACHE = "weavery-app-v1";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url), base = new URL(self.registration.scope).pathname;
  if (u.origin !== location.origin || !u.pathname.startsWith(base)) return;
  const rest = u.pathname.slice(base.length);
  if (rest.includes("/") || /^sign\.html$/.test(rest) || rest === "sw.js") return;
  const key = rest === "" ? base : u.pathname;   // 주소 뒤 ?코드 는 빼고 저장
  e.respondWith(
    fetch(u.href, { cache: "no-cache", credentials: "same-origin" })
      .then(res => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then(x => x.put(key, c)); } return res; })
      .catch(() => caches.match(key).then(m => m || (r.mode === "navigate" ? caches.match(base) : undefined)).then(m => m || Response.error()))
  );
});
