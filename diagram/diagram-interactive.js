/**
 * Interactive tooltip and highlighting system
 * Handles hover interactions, tooltips, and coordinated highlighting
 */

// Tooltip state
const IS_FIREFOX = typeof navigator !== 'undefined' && /firefox/i.test((navigator.userAgent || '').toLowerCase());

let currentTooltip = null;
let currentHighlightedElements = new Set();

/**
 * Create the tooltip element (only created once)
 */
function createTooltipElement() {
  if (document.getElementById('diagram-tooltip')) return;

  const tooltip = document.createElement('div');
  tooltip.id = 'diagram-tooltip';
  tooltip.style.cssText = `
    position: fixed;
    background: rgba(12, 12, 12, 0.94);
    color: white;
    padding: 8px 9px;
    border-radius: 4px;
    font-family: Arial, sans-serif;
    font-size: 9px;
    line-height: 1.35;
    letter-spacing: 0.01em;
    pointer-events: none;
    z-index: 10000;
    width: 210px;
    max-width: 210px;
    max-height: 170px;
    overflow-y: auto;
    box-shadow: 0 2px 6px rgba(0,0,0,0.25);
    opacity: 0;
    transition: opacity 0.15s ease;
    border: 1px solid rgba(255, 255, 255, 0.18);
    word-break: break-word;
    transform-origin: top left;
  `;
  if (IS_FIREFOX) {
    tooltip.style.transform = 'scale(0.72)';
  } else {
    tooltip.style.transform = 'scale(0.85)';
  }
  document.body.appendChild(tooltip);
}

/**
 * Show tooltip for an element
 */
function showTooltip(elementId, event) {
  const tooltip = document.getElementById('diagram-tooltip');
  if (!tooltip) return;

  const content = window.tooltipContent?.[elementId];
  if (!content) {
    tooltip.style.opacity = '0';
    return;
  }

  // Build tooltip HTML
  const truncate = (str, max) => (str && str.length > max) ? `${str.slice(0, max - 1)}…` : str || '';

  const titleFontSize = 9;
  const subtitleFontSize = 8.5;
  const bodyFontSize = 8;
  const detailFontSize = 7.8;
  const hoursFontSize = 8;

  let html = `<div style="font-weight: bold; font-size: ${titleFontSize}px; margin-bottom: 1px;">${truncate(content.title, 70)}</div>`;

  if (content.subtitle) {
    html += `<div style="color: #bbb; font-size: ${subtitleFontSize}px; margin-bottom: 2px;">${truncate(content.subtitle, 90)}</div>`;
  }

  if (content.description) {
    html += `<div style="margin-bottom: 3px; font-size: ${bodyFontSize}px; line-height: 1.28;">${truncate(content.description, 170)}</div>`;
  }

  if (content.details && content.details.length > 0) {
    const maxItems = 3;
    const detailItems = content.details.slice(0, maxItems);
    html += `<ul style="margin: 2px 0 0 0; padding-left: 10px; font-size: ${detailFontSize}px; line-height: 1.22;">`;
    detailItems.forEach(detail => {
      html += `<li style="margin: 1px 0;">${truncate(detail, 110)}</li>`;
    });
    if (content.details.length > maxItems) {
      const remaining = content.details.length - maxItems;
      html += `<li style="margin: 1px 0; color: #bbb;">+ ${remaining} more</li>`;
    }
    html += '</ul>';
  }

  if (content.hours) {
    html += `<div style="margin-top: 3px; padding-top: 2px; border-top: 1px solid rgba(255,255,255,0.2); color: #8cf; font-size: ${hoursFontSize}px;">
      ⏰ ${truncate(content.hours, 80)}
    </div>`;
  }

  tooltip.innerHTML = html;

  // Position tooltip near mouse
  const padding = 15;
  let x = event.clientX + padding;
  let y = event.clientY + padding;

  // Keep tooltip on screen
  const rect = tooltip.getBoundingClientRect();
  if (x + rect.width > window.innerWidth) {
    x = event.clientX - rect.width - padding;
  }
  if (y + rect.height > window.innerHeight) {
    y = event.clientY - rect.height - padding;
  }

  tooltip.style.left = x + 'px';
  tooltip.style.top = y + 'px';
  tooltip.style.opacity = '1';
}

/**
 * Hide tooltip
 */
function hideTooltip() {
  const tooltip = document.getElementById('diagram-tooltip');
  if (tooltip) {
    tooltip.style.opacity = '0';
  }
}

/**
 * Highlight an element (make it glow/brighter)
 * Handles multiple elements with the same ID
 */
function highlightElement(elementId) {
  const elements = document.querySelectorAll(`[data-interactive-id="${elementId}"]`);
  if (!elements.length) return;

  elements.forEach(element => {
    element.classList.add('highlighted');

    // Store original styles if not already stored
    if (!element.dataset.originalOpacity) {
      element.dataset.originalOpacity = element.style.opacity || '1';
      element.dataset.originalFilter = element.style.filter || 'none';
    }

    // Apply highlight effect
    const tagName = element.tagName.toLowerCase();

    if (tagName === 'circle' || tagName === 'rect' || tagName === 'path') {
      // For shapes, add a glow filter and increase opacity
      element.style.filter = 'brightness(1.4) drop-shadow(0 0 8px rgba(255,255,255,0.6))';
      element.style.opacity = '1';
    } else if (tagName === 'line') {
      // For lines, increase brightness and add strong glow
      if (!element.dataset.originalStrokeWidth) {
        element.dataset.originalStrokeWidth = element.getAttribute('stroke-width') || '1';
      }
      // Make line thicker and add strong glow
      const currentWidth = parseFloat(element.dataset.originalStrokeWidth);
      element.setAttribute('stroke-width', (currentWidth * 2.5).toString());
      element.style.filter = 'brightness(1.8) drop-shadow(0 0 8px rgba(255,255,255,0.9)) drop-shadow(0 0 4px rgba(255,255,255,0.9))';
      element.style.opacity = '1';
    } else if (tagName === 'text') {
      // For text, add glow
      element.style.filter = 'drop-shadow(0 0 3px rgba(255,255,255,0.8))';
    }
  });

  currentHighlightedElements.add(elementId);
}

/**
 * Remove highlight from an element
 * Handles multiple elements with the same ID
 */
function unhighlightElement(elementId) {
  const elements = document.querySelectorAll(`[data-interactive-id="${elementId}"]`);
  if (!elements.length) return;

  elements.forEach(element => {
    element.classList.remove('highlighted');

    // Restore original styles
    if (element.dataset.originalOpacity) {
      element.style.opacity = element.dataset.originalOpacity;
    }
    if (element.dataset.originalFilter) {
      element.style.filter = element.dataset.originalFilter;
    }

    // Restore original stroke width for lines
    if (element.tagName.toLowerCase() === 'line' && element.dataset.originalStrokeWidth) {
      element.setAttribute('stroke-width', element.dataset.originalStrokeWidth);
    }
  });

  currentHighlightedElements.delete(elementId);
}

/**
 * Clear all highlights
 */
function clearHighlights() {
  currentHighlightedElements.forEach(elementId => {
    unhighlightElement(elementId);
  });
  currentHighlightedElements.clear();
}

/**
 * Handle mouse enter on an interactive element
 */
function handleMouseEnter(event) {
  const elementId = event.currentTarget.dataset.interactiveId;
  if (!elementId) return;

  // Show tooltip for this specific element
  showTooltip(elementId, event);

  // Highlight this element and all related elements
  const relatedElements = window.getRelatedElements?.(elementId) || new Set([elementId]);

  relatedElements.forEach(id => {
    highlightElement(id);
  });
}

/**
 * Handle mouse move on an interactive element (update tooltip position)
 */
function handleMouseMove(event) {
  const tooltip = document.getElementById('diagram-tooltip');
  if (!tooltip || tooltip.style.opacity === '0') return;

  const padding = 15;
  let x = event.clientX + padding;
  let y = event.clientY + padding;

  const rect = tooltip.getBoundingClientRect();
  if (x + rect.width > window.innerWidth) {
    x = event.clientX - rect.width - padding;
  }
  if (y + rect.height > window.innerHeight) {
    y = event.clientY - rect.height - padding;
  }

  tooltip.style.left = x + 'px';
  tooltip.style.top = y + 'px';
}

/**
 * Handle mouse leave on an interactive element
 */
function handleMouseLeave(event) {
  hideTooltip();
  clearHighlights();
}

/**
 * Make an SVG element interactive
 * Call this when creating elements in diagram-core-refactored.js
 */
function makeInteractive(element, elementId) {
  if (!element || !elementId) return;

  element.setAttribute('data-interactive-id', elementId);
  element.style.cursor = 'pointer';

  element.addEventListener('mouseenter', handleMouseEnter);
  element.addEventListener('mousemove', handleMouseMove);
  element.addEventListener('mouseleave', handleMouseLeave);
}

/**
 * Initialize the interactive system
 * Call this once after the diagram is rendered
 */
function initializeInteractive() {
  createTooltipElement();
  console.log('Interactive tooltip system initialized');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeInteractive);
} else {
  initializeInteractive();
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.makeInteractive = makeInteractive;
  window.initializeInteractive = initializeInteractive;
}
