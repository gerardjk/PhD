function runDiagramInit() {
  if (typeof window.initializeDiagram === 'function') {
    window.initializeDiagram();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runDiagramInit);
} else {
  runDiagramInit();
}
