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

  // Detect Firefox and DPI scaling
  const isFirefox = /firefox/i.test(navigator.userAgent);
  const dpr = window.devicePixelRatio || 1;
  const scaleFactor = isFirefox ? (2 / dpr) : 1; // Firefox dpr=10, Chrome dpr=2

  // Create wrapper div for scaling (Firefox only)
  let tooltip;
  if (isFirefox) {
    // Outer wrapper handles scaling
    const wrapper = document.createElement('div');
    wrapper.id = 'diagram-tooltip';
    wrapper.dataset.firefoxWrapper = 'true';
    wrapper.style.position = 'fixed';
    wrapper.style.transformOrigin = 'top left';
    wrapper.style.transform = `scale(${scaleFactor})`;
    wrapper.style.pointerEvents = 'auto';
    wrapper.style.zIndex = '10000';
    wrapper.style.opacity = '0';
    wrapper.style.transition = 'opacity 0.15s ease';

    // Inner div handles content and width (wraps at 320px before scaling)
    tooltip = document.createElement('div');
    tooltip.id = 'diagram-tooltip-content';
    tooltip.style.width = '320px';
    tooltip.style.background = 'rgba(12, 12, 12, 0.94)';
    tooltip.style.color = 'white';
    tooltip.style.padding = '12px 14px';
    tooltip.style.borderRadius = '6px';
    tooltip.style.fontFamily = 'Arial, sans-serif';
    tooltip.style.fontSize = '13px';
    tooltip.style.lineHeight = '1.4';
    tooltip.style.letterSpacing = '0.01em';
    tooltip.style.boxShadow = '0 2px 8px rgba(0,0,0,0.35)';
    tooltip.style.border = '1px solid rgba(255, 255, 255, 0.18)';
    tooltip.style.cursor = 'pointer';
    tooltip.style.whiteSpace = 'normal';
    tooltip.style.overflowWrap = 'break-word';

    wrapper.appendChild(tooltip);
    document.body.appendChild(wrapper);
  } else {
    // Chrome: simple single div
    tooltip = document.createElement('div');
    tooltip.id = 'diagram-tooltip';
    tooltip.style.position = 'fixed';
    tooltip.style.background = 'rgba(12, 12, 12, 0.94)';
    tooltip.style.color = 'white';
    tooltip.style.padding = '12px 14px';
    tooltip.style.borderRadius = '6px';
    tooltip.style.fontFamily = 'Arial, sans-serif';
    tooltip.style.fontSize = '13px';
    tooltip.style.lineHeight = '1.4';
    tooltip.style.letterSpacing = '0.01em';
    tooltip.style.pointerEvents = 'auto';
    tooltip.style.zIndex = '10000';
    tooltip.style.width = '320px';
    tooltip.style.boxShadow = '0 2px 8px rgba(0,0,0,0.35)';
    tooltip.style.opacity = '0';
    tooltip.style.transition = 'opacity 0.15s ease';
    tooltip.style.border = '1px solid rgba(255, 255, 255, 0.18)';
    tooltip.style.transformOrigin = 'top left';
    tooltip.style.cursor = 'pointer';
    tooltip.style.whiteSpace = 'normal';
    tooltip.style.overflowWrap = 'break-word';

    document.body.appendChild(tooltip);
  }
}

/**
 * Show tooltip for an element
 */
function showTooltip(elementId, event) {
  const tooltipWrapper = document.getElementById('diagram-tooltip');
  if (!tooltipWrapper) return;

  // Check if this is Firefox wrapper structure or Chrome single div
  const isFirefoxWrapper = tooltipWrapper.dataset.firefoxWrapper === 'true';
  const tooltipContent = isFirefoxWrapper ? document.getElementById('diagram-tooltip-content') : tooltipWrapper;

  const content = window.tooltipContent?.[elementId];
  if (!content) {
    tooltipWrapper.style.opacity = '0';
    return;
  }

  // Build tooltip HTML with new design
  let html = '';

  // Title - larger, white, bold
  if (content.title) {
    html += `<div style="font-weight: bold; font-size: 17px; color: white; margin-bottom: 4px;">${content.title}</div>`;
  }

  // Subtitle - normal size, white
  if (content.subtitle) {
    html += `<div style="font-size: 13px; color: white; margin-bottom: 8px;">${content.subtitle}</div>`;
  }

  // Description - smaller, white
  if (content.description) {
    html += `<div style="font-size: 11px; color: white; line-height: 1.45; margin-bottom: 4px;">${content.description}</div>`;
  }

  // Details - each on new line, smaller, grey, no bullet points
  if (content.details && content.details.length > 0) {
    content.details.forEach(detail => {
      html += `<div style="font-size: 11px; color: #aaa; line-height: 1.45;">${detail}</div>`;
    });
  }

  tooltipContent.innerHTML = html;

  // Store link for click handler
  tooltipContent.dataset.link = content.link || '';

  // Remove old click listeners and add new one
  tooltipContent.onclick = function() {
    if (tooltipContent.dataset.link) {
      window.open(tooltipContent.dataset.link, '_blank', 'noopener,noreferrer');
    }
  };

  // Position tooltip near mouse
  const padding = 15;
  let x = event.clientX + padding;
  let y = event.clientY + padding;

  // Keep tooltip on screen
  const rect = tooltipWrapper.getBoundingClientRect();
  if (x + rect.width > window.innerWidth) {
    x = event.clientX - rect.width - padding;
  }
  if (y + rect.height > window.innerHeight) {
    y = event.clientY - rect.height - padding;
  }

  tooltipWrapper.style.left = x + 'px';
  tooltipWrapper.style.top = y + 'px';
  tooltipWrapper.style.opacity = '1';
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
  currentHighlightedElements.forEach(item => {
    // Handle both string IDs and direct element references
    if (typeof item === 'string') {
      unhighlightElement(item);
    } else if (item instanceof Element) {
      // Directly unhighlight element
      item.classList.remove('highlighted');
      if (item.dataset.originalOpacity) {
        item.style.opacity = item.dataset.originalOpacity;
      }
      if (item.dataset.originalFilter) {
        item.style.filter = item.dataset.originalFilter;
      }
      if (item.tagName.toLowerCase() === 'line' && item.dataset.originalStrokeWidth) {
        item.setAttribute('stroke-width', item.dataset.originalStrokeWidth);
      }
    }
  });
  currentHighlightedElements.clear();
}

/**
 * Helper function to highlight circles within a box's bounds
 * @param {string} boxElementId - ID of the box element
 */
function highlightCirclesInBox(boxElementId) {
  const boxElement = document.getElementById(boxElementId);
  if (!boxElement) return;

  // Get box bounds
  const boxRect = boxElement.getBBox();
  const boxLeft = boxRect.x;
  const boxRight = boxRect.x + boxRect.width;
  const boxTop = boxRect.y;
  const boxBottom = boxRect.y + boxRect.height;

  // Find and highlight all circles within the box
  const allCircles = document.querySelectorAll('circle');
  allCircles.forEach(circle => {
    // Skip the RBA black circle (dot-0)
    if (circle.dataset.interactiveId === 'dot-0') {
      return;
    }

    const cx = parseFloat(circle.getAttribute('cx'));
    const cy = parseFloat(circle.getAttribute('cy'));
    const r = parseFloat(circle.getAttribute('r'));

    // Only highlight small circles (dots), not the big RITS/FSS circles
    if (r && r < 20 && cx && cy) {
      // Check if circle center is within box bounds
      if (cx >= boxLeft && cx <= boxRight && cy >= boxTop && cy <= boxBottom) {
        // Apply highlight directly to circle element
        circle.classList.add('highlighted');
        if (!circle.dataset.originalOpacity) {
          circle.dataset.originalOpacity = circle.style.opacity || getComputedStyle(circle).opacity || '1';
          circle.dataset.originalFilter = circle.style.filter || 'none';
        }
        circle.style.filter = 'brightness(1.4) drop-shadow(0 0 8px rgba(255,255,255,0.6))';
        circle.style.opacity = '1';

        // Store reference so we can unhighlight later
        currentHighlightedElements.add(circle);
      }
    }
  });
}

/**
 * Handle mouse enter on an interactive element
 */
function handleMouseEnter(event) {
  const elementId = event.currentTarget.dataset.interactiveId;
  if (!elementId) return;

  // Show tooltip for this specific element
  showTooltip(elementId, event);

  // Special handling for boxes that should highlight contained dots
  if (elementId === 'blue-dots-background') {
    // ESA box - highlight all blue and yellow dots (excluding RBA)
    highlightElement(elementId);

    const allCircles = document.querySelectorAll('circle');
    allCircles.forEach(circle => {
      if (circle.dataset.interactiveId === 'dot-0') {
        return;
      }

      const cx = parseFloat(circle.getAttribute('cx'));
      const cy = parseFloat(circle.getAttribute('cy'));
      const r = parseFloat(circle.getAttribute('r'));

      if (r && r < 20 && cx && cy) {
        circle.classList.add('highlighted');
        if (!circle.dataset.originalOpacity) {
          circle.dataset.originalOpacity = circle.style.opacity || getComputedStyle(circle).opacity || '1';
          circle.dataset.originalFilter = circle.style.filter || 'none';
        }
        circle.style.filter = 'brightness(1.4) drop-shadow(0 0 8px rgba(255,255,255,0.6))';
        circle.style.opacity = '1';
        currentHighlightedElements.add(circle);
      }
    });
  } else if (elementId === 'adi-box' || elementId === 'non-adis-box' ||
             elementId === 'domestic-banks-box' || elementId === 'international-banks-box' ||
             elementId === 'foreign-branches-box' || elementId === 'foreign-subsidiaries-box' ||
             elementId === 'specialised-adis-box' || elementId === 'other-adis-box' ||
             elementId === 'psps-box' || elementId === 'cs-box') {
    // Highlight the box itself
    highlightElement(elementId);

    // Highlight all circles within this box
    highlightCirclesInBox(elementId);
  } else {
    // Normal highlighting - highlight this element and all related elements
    const relatedElements = window.getRelatedElements?.(elementId) || new Set([elementId]);

    relatedElements.forEach(id => {
      highlightElement(id);
    });
  }
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
 * Handle click on an interactive element - open link if available
 */
function handleClick(event) {
  const elementId = event.currentTarget.dataset.interactiveId;
  if (!elementId) return;

  const content = window.tooltipContent?.[elementId];
  if (content && content.link) {
    window.open(content.link, '_blank', 'noopener,noreferrer');
  }
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
  element.addEventListener('click', handleClick);
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
  window.showTooltip = showTooltip;
  window.hideTooltip = hideTooltip;
  window.highlightElement = highlightElement;
  window.unhighlightElement = unhighlightElement;
  window.clearHighlights = clearHighlights;
  window.highlightCirclesInBox = highlightCirclesInBox;
}
