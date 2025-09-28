function runDiagramInitAbsolute() {
  if (typeof window.initializeDiagramAbsolute === 'function') {
    window.initializeDiagramAbsolute();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runDiagramInitAbsolute);
} else {
  runDiagramInitAbsolute();
}
