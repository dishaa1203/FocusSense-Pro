self.addEventListener("fetch", e => {
  e.respondWith(
    caches.open("fs-cache").then(cache =>
      cache.match(e.request).then(res =>
        res || fetch(e.request).then(r => {
          cache.put(e.request, r.clone());
          return r;
        })
      )
    )
  );
});
