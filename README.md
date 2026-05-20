# 🎧 Stream audio from Vimeo

This project uses Vimeo videos as an audio source.  
To build a playlist, you can extract video IDs and titles directly from a Vimeo page.

---

## 🔍 Extract playlist from Vimeo (Browser Console)

1. Open a Vimeo page (channel or search), for example:

   https://vimeo.com/thetripodguys/videos

2. Scroll down to load more videos.

3. Open DevTools → **Console**

4. Paste and run the script below:

```javascript
(() => {
  const results = [];

  document.querySelectorAll('[data-testid="content-card-link"]').forEach(link => {
    const match = link.href.match(/vimeo\.com\/(\d+)/);
    if (!match) return;

    const id = match[1];

    // Find title relative to the link
    const card = link.closest('div');
    const titleEl = card?.querySelector('[data-testid="content-card-title"]');
    const title = titleEl ? titleEl.textContent.trim() : "Untitled";

    results.push({ id, title });
  });

  // Remove duplicates
  const unique = Object.values(
    results.reduce((acc, v) => {
      acc[v.id] = v;
      return acc;
    }, {})
  );

  console.log(unique);

  // Copy to clipboard (Chrome/Firefox)
  copy(unique);
})();
```
The output will look like this 
```json
[
  { "id": "824504199", "title": "VŨ THANH VÂN | Lấy chồng" },
  { "id": "824498709", "title": "HOÀNG DŨNG | Vì Một Câu Nói" }
]
```
5. Save it as json file then upload it to the app

## How to run
Can easily run with ```python -m http.server``` and access through your localhost

Or can access through https://m2man.github.io/radio-playlist-vibe/ to try