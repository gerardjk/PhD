/**
 * Interactive tooltip and highlighting system
 * Handles hover interactions, tooltips, and coordinated highlighting
 */

// Tooltip state
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
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    pointer-events: none;
    z-index: 10000;
    max-width: 320px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    opacity: 0;
    transition: opacity 0.2s ease;
    border: 1px solid rgba(255, 255, 255, 0.2);
  `;
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
  let html = `<div style="font-weight: bold; font-size: 16px; margin-bottom: 4px;">${content.title}</div>`;

  if (content.subtitle) {
    html += `<div style="color: #aaa; font-size: 12px; margin-bottom: 8px;">${content.subtitle}</div>`;
  }

  if (content.description) {
    html += `<div style="margin-bottom: 8px;">${content.description}</div>`;
  }

  if (content.details && content.details.length > 0) {
    html += '<ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 13px;">';
    content.details.forEach(detail => {
      html += `<li style="margin: 4px 0;">${detail}</li>`;
    });
    html += '</ul>';
  }

  if (content.hours) {
    html += `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.2); color: #8cf; font-size: 12px;">
      ⏰ ${content.hours}
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
