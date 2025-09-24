// Helper functions for SVG diagram creation

// Helper function to create styled rectangles with common attributes
function createStyledRect(x, y, width, height, options = {}) {
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  
  // Set basic position and size attributes
  rect.setAttribute('x', x.toFixed(2));
  rect.setAttribute('y', y.toFixed(2));
  rect.setAttribute('width', width);
  rect.setAttribute('height', height);
  
  // Set styling attributes with defaults
  rect.setAttribute('fill', options.fill || '#e8ecf7');
  rect.setAttribute('stroke', options.stroke || '#071f6a');
  rect.setAttribute('stroke-width', options.strokeWidth || '2');
  
  // Optional rounded corners
  if (options.rx !== undefined) {
    rect.setAttribute('rx', options.rx);
  }
  if (options.ry !== undefined) {
    rect.setAttribute('ry', options.ry);
  }
  
  return rect;
}

// Helper function to create styled text with common attributes
function createStyledText(x, y, textContent, options = {}) {
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  
  // Set basic position attributes
  text.setAttribute('x', x.toFixed(2));
  text.setAttribute('y', y.toFixed(2));
  
  // Set text content
  text.textContent = textContent;
  
  // Set styling attributes with defaults
  text.setAttribute('text-anchor', options.textAnchor || 'middle');
  text.setAttribute('dominant-baseline', options.dominantBaseline || 'middle');
  text.setAttribute('fill', options.fill || '#071f6a');
  text.setAttribute('font-family', options.fontFamily || 'Arial, sans-serif');
  text.setAttribute('font-size', options.fontSize || '12');
  text.setAttribute('font-weight', options.fontWeight || 'bold');
  
  return text;
}

// Helper to create styled line
function createStyledLine(x1, y1, x2, y2, options = {}) {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', x1.toFixed(2));
  line.setAttribute('y1', y1.toFixed(2));
  line.setAttribute('x2', x2.toFixed(2));
  line.setAttribute('y2', y2.toFixed(2));
  line.setAttribute('stroke', options.stroke || '#000');
  line.setAttribute('stroke-width', options.strokeWidth || '2');
  if (options.strokeLinecap) line.setAttribute('stroke-linecap', options.strokeLinecap);
  if (options.strokeLinejoin) line.setAttribute('stroke-linejoin', options.strokeLinejoin);
  if (options.strokeDasharray) line.setAttribute('stroke-dasharray', options.strokeDasharray);
  if (options.opacity) line.setAttribute('opacity', options.opacity);
  return line;
}

// Helper to create styled path with "d" and common styles
function createStyledPath(d, options = {}) {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  if (options.stroke) path.setAttribute('stroke', options.stroke);
  if (options.strokeWidth) path.setAttribute('stroke-width', options.strokeWidth);
  if (options.fill !== undefined) path.setAttribute('fill', options.fill);
  if (options.strokeLinecap) path.setAttribute('stroke-linecap', options.strokeLinecap);
  if (options.strokeLinejoin) path.setAttribute('stroke-linejoin', options.strokeLinejoin);
  if (options.opacity) path.setAttribute('opacity', options.opacity);
  if (options.id) path.setAttribute('id', options.id);
  return path;
}

// Geometry helpers for rectangle edges
function getRectEdges(x, y, width, height) {
  const left = +x;
  const top = +y;
  const w = +width;
  const h = +height;
  return {
    left,
    right: left + w,
    top,
    bottom: top + h,
    centerX: left + w / 2,
    centerY: top + h / 2,
    width: w,
    height: h
  };
}

function getRectEdgesFromElement(rectEl) {
  if (!rectEl) return null;
  const x = parseFloat(rectEl.getAttribute('x')) || 0;
  const y = parseFloat(rectEl.getAttribute('y')) || 0;
  const width = parseFloat(rectEl.getAttribute('width')) || 0;
  const height = parseFloat(rectEl.getAttribute('height')) || 0;
  return getRectEdges(x, y, width, height);
}

// Optional: cache edges in window under a key
function cacheRectEdges(rectEl, cacheKey) {
  const edges = getRectEdgesFromElement(rectEl);
  if (edges && cacheKey) {
    if (!window.rectEdges) window.rectEdges = {};
    window.rectEdges[cacheKey] = edges;
  }
  return edges;
}

// Generate gear wheel paths
function createGearPath(radius, teeth, toothHeight, toothWidth) {
  let path = '';
  const angleStep = (2 * Math.PI) / teeth;
  
  for (let i = 0; i < teeth; i++) {
    const angle = i * angleStep;
    const nextAngle = (i + 1) * angleStep;
    
    // Inner circle point
    const innerX1 = Math.cos(angle - toothWidth/2) * radius;
    const innerY1 = Math.sin(angle - toothWidth/2) * radius;
    
    // Outer circle point (tooth)
    const outerX1 = Math.cos(angle - toothWidth/2) * (radius + toothHeight);
    const outerY1 = Math.sin(angle - toothWidth/2) * (radius + toothHeight);
    const outerX2 = Math.cos(angle + toothWidth/2) * (radius + toothHeight);
    const outerY2 = Math.sin(angle + toothWidth/2) * (radius + toothHeight);
    
    // Next inner point
    const innerX2 = Math.cos(angle + toothWidth/2) * radius;
    const innerY2 = Math.sin(angle + toothWidth/2) * radius;
    
    if (i === 0) {
      path = `M ${innerX1} ${innerY1}`;
    }
    
    path += ` L ${outerX1} ${outerY1} L ${outerX2} ${outerY2} L ${innerX2} ${innerY2}`;
    
    // Connect to next tooth
    const nextInnerX = Math.cos(nextAngle - toothWidth/2) * radius;
    const nextInnerY = Math.sin(nextAngle - toothWidth/2) * radius;
    path += ` A ${radius} ${radius} 0 0 1 ${nextInnerX} ${nextInnerY}`;
  }
  
  path += ' Z';
  return path;
}

// Create gear ring with rectangular teeth on inner edge
function createGearRing(outerRadius, innerRadius, teeth) {
  let path = '';
  const angleStep = (2 * Math.PI) / teeth;
  const toothWidth = 0.3; // Width of tooth as fraction of angle step
  const toothDepth = (outerRadius - innerRadius) * 0.4; // How deep the tooth cuts in
  
  // Start with outer circle
  path = `M ${outerRadius} 0`;
  
  for (let i = 0; i < teeth; i++) {
    const angle = i * angleStep;
    const nextAngle = (i + 1) * angleStep;
    
    // Outer arc to next tooth
    const outerX = Math.cos(nextAngle) * outerRadius;
    const outerY = Math.sin(nextAngle) * outerRadius;
    path += ` A ${outerRadius} ${outerRadius} 0 0 1 ${outerX} ${outerY}`;
  }
  
  // Now create the inner edge with rectangular teeth
  for (let i = teeth - 1; i >= 0; i--) {
    const angle = i * angleStep;
    
    // Valley points (at inner radius)
    const valley1Angle = angle + angleStep * (1 - toothWidth/2);
    const valley1X = Math.cos(valley1Angle) * innerRadius;
    const valley1Y = Math.sin(valley1Angle) * innerRadius;
    
    // Tooth points (extended outward)
    const tooth2Angle = angle + angleStep * (1 - toothWidth/2);
    const tooth2X = Math.cos(tooth2Angle) * (innerRadius + toothDepth);
    const tooth2Y = Math.sin(tooth2Angle) * (innerRadius + toothDepth);
    
    const tooth1Angle = angle + angleStep * toothWidth/2;
    const tooth1X = Math.cos(tooth1Angle) * (innerRadius + toothDepth);
    const tooth1Y = Math.sin(tooth1Angle) * (innerRadius + toothDepth);
    
    const valley2Angle = angle + angleStep * toothWidth/2;
    const valley2X = Math.cos(valley2Angle) * innerRadius;
    const valley2Y = Math.sin(valley2Angle) * innerRadius;
    
    if (i === teeth - 1) {
      path += ` L ${valley1X} ${valley1Y}`;
    }
    
    // Draw rectangular tooth
    path += ` L ${tooth2X} ${tooth2Y}`;
    path += ` L ${tooth1X} ${tooth1Y}`;
    path += ` L ${valley2X} ${valley2Y}`;
    
    // Arc to next valley
    const nextValleyAngle = angle - angleStep * toothWidth/2;
    const nextValleyX = Math.cos(nextValleyAngle) * innerRadius;
    const nextValleyY = Math.sin(nextValleyAngle) * innerRadius;
    path += ` A ${innerRadius} ${innerRadius} 0 0 0 ${nextValleyX} ${nextValleyY}`;
  }
  
  path += ' Z';
  return path;
}

// Reusable sigmoid helper function
function sigmoid(x, steepness = 1) {
  const t = x * steepness;
  return 1 / (1 + Math.exp(-t));
}

// Export functions if using modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createStyledRect,
    createStyledText,
    createStyledLine,
    createStyledPath,
    getRectEdges,
    getRectEdgesFromElement,
    cacheRectEdges,
    createGearPath,
    createGearRing,
    sigmoid
  };
}