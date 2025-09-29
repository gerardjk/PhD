(() => {
  if (window.exportReady) return;
  window.exportReady = true;

  function downloadPNG(scale = 4) {
    const svg = document.getElementById('diagram');
    if (!svg) {
      console.error('PNG export failed: #diagram not found');
      return;
    }

    const clone = svg.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

    const { x, y, width, height } = svg.viewBox.baseVal;
    let serialized = new XMLSerializer().serializeToString(clone);
    if (!serialized.startsWith('<?xml')) {
      serialized = `<?xml version="1.0" encoding="UTF-8"?>\n${serialized}`;
    }

    const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(serialized);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;

      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.scale(scale, scale);
      ctx.drawImage(img, -x, -y);

      const link = document.createElement('a');
      link.download = `diagram@${scale}x.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    img.onerror = (err) => {
      console.error('PNG export failed while loading SVG image', err);
      console.debug('Serialized SVG:', serialized);
    };

    img.src = svgUrl;
  }

  window.downloadPNG = downloadPNG;

  function wireButton() {
    const btn = document.getElementById('exportPNG');
    if (!btn) return;
    btn.addEventListener('click', () => downloadPNG(4));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireButton);
  } else {
    wireButton();
  }
})();
