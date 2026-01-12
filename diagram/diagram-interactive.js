/**
 * Interactive tooltip and highlighting system
 * Handles hover interactions, tooltips, and coordinated highlighting
 */

// Tooltip state
let currentTooltip = null;
let currentHighlightedElements = new Set();
let tooltipIsSticky = false;
let stickyElementId = null;
let lastHoveredElementId = null;  // Track for delegation-based hover
let justMadeSticky = false;  // Prevent document click from immediately dismissing

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
    tooltip.style.background = 'transparent';
    tooltip.style.color = 'white';
    tooltip.style.padding = '12px 14px';
    tooltip.style.borderRadius = '8px';
    tooltip.style.fontFamily = 'Courier New, monospace';
    tooltip.style.fontSize = '13px';
    tooltip.style.lineHeight = '1.4';
    tooltip.style.letterSpacing = '0.02em';
    tooltip.style.boxShadow = '0 2px 12px rgba(0,0,0,0.5)';
    tooltip.style.border = '2px solid rgba(255, 255, 255, 0.45)';
    tooltip.style.cursor = 'pointer';
    tooltip.style.whiteSpace = 'normal';
    tooltip.style.overflowWrap = 'break-word';

    wrapper.appendChild(tooltip);
    document.body.appendChild(wrapper);

    // Dismiss tooltip when mouse leaves it (if sticky)
    wrapper.addEventListener('mouseleave', handleTooltipMouseLeave);
  } else {
    // Chrome: apply same scaling as Firefox for consistent size
    const chromeScaleFactor = 2 / dpr; // Match Firefox scaling

    tooltip = document.createElement('div');
    tooltip.id = 'diagram-tooltip';
    tooltip.style.position = 'fixed';
    tooltip.style.background = 'transparent';
    tooltip.style.color = 'white';
    tooltip.style.padding = '12px 14px';
    tooltip.style.borderRadius = '8px';
    tooltip.style.fontFamily = 'Courier New, monospace';
    tooltip.style.fontSize = '13px';
    tooltip.style.lineHeight = '1.4';
    tooltip.style.letterSpacing = '0.02em';
    tooltip.style.pointerEvents = 'auto';
    tooltip.style.zIndex = '10000';
    tooltip.style.width = '320px';
    tooltip.style.boxShadow = '0 2px 12px rgba(0,0,0,0.5)';
    tooltip.style.opacity = '0';
    tooltip.style.transition = 'opacity 0.15s ease';
    tooltip.style.border = '2px solid rgba(255, 255, 255, 0.45)';
    tooltip.style.transformOrigin = 'top left';
    tooltip.style.transform = `scale(${chromeScaleFactor})`; // Scale down to match Firefox
    tooltip.style.cursor = 'pointer';
    tooltip.style.whiteSpace = 'normal';
    tooltip.style.overflowWrap = 'break-word';

    document.body.appendChild(tooltip);

    // Dismiss tooltip when mouse leaves it (if sticky)
    tooltip.addEventListener('mouseleave', handleTooltipMouseLeave);
  }
}

/**
 * Handle mouse leaving the tooltip
 */
function handleTooltipMouseLeave(event) {
  // If tooltip is sticky, don't dismiss on mouse leave - require click to dismiss
  if (tooltipIsSticky) return;

  // Check if moving back to the interactive element
  const relatedTarget = event.relatedTarget;
  if (relatedTarget && relatedTarget.closest && relatedTarget.closest('[data-interactive-id]')) {
    return;
  }

  hideTooltip();
  clearHighlights();
}

/**
 * Extract the primary color from an element (fill or stroke)
 */
function getElementColor(elementId, event) {
  // Try to find the element
  let element = document.querySelector(`[data-interactive-id="${elementId}"]`);
  if (!element && event && event.currentTarget) {
    element = event.currentTarget;
  }
  if (!element) {
    element = document.getElementById(elementId);
  }
  if (!element) return null;

  // For groups, look at the first child with a fill/stroke
  if (element.tagName.toLowerCase() === 'g') {
    const colorChild = element.querySelector('circle, rect, path');
    if (colorChild) element = colorChild;
  }

  // Get fill or stroke color
  let color = element.getAttribute('fill') || element.getAttribute('stroke');

  // Skip transparent/none fills, try stroke instead
  if (!color || color === 'none' || color === 'transparent') {
    color = element.getAttribute('stroke');
  }

  return color;
}

/**
 * Darken a color for use as tooltip background
 */
function darkenColor(color, factor = 0.3) {
  if (!color || color === 'none' || color === 'transparent') return null;

  // Handle hex colors
  if (color.startsWith('#')) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const r = Math.floor(parseInt(hex.slice(0, 2), 16) * factor);
    const g = Math.floor(parseInt(hex.slice(2, 4), 16) * factor);
    const b = Math.floor(parseInt(hex.slice(4, 6), 16) * factor);
    return `rgba(${r}, ${g}, ${b}, 0.94)`;
  }

  // Handle rgb/rgba colors
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = Math.floor(parseInt(rgbMatch[1]) * factor);
    const g = Math.floor(parseInt(rgbMatch[2]) * factor);
    const b = Math.floor(parseInt(rgbMatch[3]) * factor);
    return `rgba(${r}, ${g}, ${b}, 0.94)`;
  }

  return null;
}

/**
 * Lighten a color for use as tooltip background (for line tooltips)
 */
function lightenColor(color, factor = 0.7) {
  if (!color || color === 'none' || color === 'transparent') return null;

  // Handle hex colors
  if (color.startsWith('#')) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    // Blend with white to lighten
    const newR = Math.floor(r + (255 - r) * factor);
    const newG = Math.floor(g + (255 - g) * factor);
    const newB = Math.floor(b + (255 - b) * factor);
    return `rgba(${newR}, ${newG}, ${newB}, 0.94)`;
  }

  // Handle rgb/rgba colors
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    // Blend with white to lighten
    const newR = Math.floor(r + (255 - r) * factor);
    const newG = Math.floor(g + (255 - g) * factor);
    const newB = Math.floor(b + (255 - b) * factor);
    return `rgba(${newR}, ${newG}, ${newB}, 0.94)`;
  }

  return null;
}

/**
 * Add alpha transparency to a color (keep original RGB values)
 */
function addAlpha(color, alpha = 0.94) {
  if (!color || color === 'none' || color === 'transparent') return null;

  // Handle hex colors
  if (color.startsWith('#')) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Handle rgb/rgba colors
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return null;
}

/**
 * Normalize an interactive element ID so variants (e.g., yellow-dot-#) map to their base entity
 */
function resolveHoverTarget(elementId) {
  let targetId = elementId;
  let dotIndex = null;
  let isYellowDot = false;

  if (elementId && elementId.startsWith('yellow-dot-')) {
    const idx = parseInt(elementId.replace('yellow-dot-', ''), 10);
    if (!Number.isNaN(idx)) {
      targetId = `dot-${idx}`;
      dotIndex = idx;
      isYellowDot = true;
    }
  } else if (elementId && elementId.startsWith('dot-')) {
    const idx = parseInt(elementId.replace('dot-', ''), 10);
    if (!Number.isNaN(idx)) {
      dotIndex = idx;
    }
  }

  return { targetId, dotIndex, isYellowDot };
}

/**
 * Show tooltip for an element
 * @param {string} elementId - The resolved element ID (used for tooltip content lookup)
 * @param {Event} event - The mouse event
 * @param {string} originalElementId - The original element ID before resolution (used for color)
 */
function showTooltip(elementId, event, originalElementId) {
  const tooltipWrapper = document.getElementById('diagram-tooltip');
  if (!tooltipWrapper) return;

  // Check if this is Firefox wrapper structure or Chrome single div
  const isFirefoxWrapper = tooltipWrapper.dataset.firefoxWrapper === 'true';
  const tooltipContentElement = isFirefoxWrapper ? document.getElementById('diagram-tooltip-content') : tooltipWrapper;

  // Check if this element has a tooltipFrom relationship (show another element's tooltip)
  const relationship = window.diagramRelationships?.[elementId];
  let tooltipSourceId = relationship?.tooltipFrom || elementId;

  // Map blue-line-X and yellow-line-X to their corresponding dot-X for tooltip content
  const blueLineMatch = elementId.match(/^blue-line-(\d+)$/);
  const yellowLineMatch = elementId.match(/^yellow-line-(\d+)$/);
  if (blueLineMatch) {
    tooltipSourceId = `dot-${blueLineMatch[1]}`;
  } else if (yellowLineMatch) {
    tooltipSourceId = `dot-${yellowLineMatch[1]}`;
  }

  const content = window.tooltipContent?.[tooltipSourceId];
  if (!content) {
    tooltipWrapper.style.opacity = '0';
    return;
  }

  // Get element color and apply to tooltip background
  // Use originalElementId if provided (for yellow dots to show yellow color)
  const colorElementId = originalElementId || elementId;
  // Check for ESA dots and their lines
  const isEsaDot = colorElementId.startsWith('dot-') || colorElementId.startsWith('yellow-dot-');
  const isEsaLine = colorElementId.startsWith('blue-line-') || colorElementId.startsWith('yellow-line-');

  // Use colorFrom property if specified, otherwise use the color element ID
  // ESA dots and lines use their own color (so yellow dots/lines show yellow, not blue)
  const colorSourceId = content.colorFrom || ((isEsaDot || isEsaLine) ? colorElementId : tooltipSourceId);
  const elementColor = getElementColor(colorSourceId, event);

  // Line style: light background with dark text
  const isLineStyle = content.lineStyle === true;

  // ESA dots and their lines use actual color with black text
  const isEsaElement = isEsaDot || isEsaLine;

  let tooltipBgColor;
  if (isLineStyle) {
    tooltipBgColor = lightenColor(elementColor, 0.6) || 'rgba(220, 220, 220, 0.94)';
    tooltipContentElement.style.borderColor = elementColor || 'rgba(100, 100, 100, 0.6)';
  } else if (isEsaElement) {
    // ESA dots and lines: use actual color (slightly transparent) with black text
    tooltipBgColor = addAlpha(elementColor, 0.94) || 'rgba(100, 150, 255, 0.94)';
    tooltipContentElement.style.borderColor = 'rgba(0, 0, 0, 0.3)';
  } else {
    tooltipBgColor = darkenColor(elementColor) || 'rgba(12, 12, 12, 0.94)';
    tooltipContentElement.style.borderColor = 'rgba(255, 255, 255, 0.45)';
  }
  tooltipContentElement.style.background = tooltipBgColor;

  // Determine tooltip size based on element type
  const largerTooltipIds = ['rits-circle', 'asx-box', 'cls-circle', 'chess-box'];
  const isRba = elementId === 'dot-0';
  const isDot = !isRba && (elementId.startsWith('dot-') || elementId.startsWith('yellow-dot-'));
  const isLine = elementId.startsWith('blue-line-') || elementId.startsWith('yellow-line-');
  const isSmallStyle = isDot || isLine || content.smallStyle;  // Use small style for dots, their lines, or elements with smallStyle flag

  if (isSmallStyle) {
    // Smaller tooltips for ESA dots and elements with smallStyle
    tooltipContentElement.style.width = '240px';
    tooltipContentElement.style.padding = '8px 10px';
    tooltipContentElement.style.borderWidth = '1px';
  } else if (largerTooltipIds.includes(elementId)) {
    tooltipContentElement.style.width = '380px';
    tooltipContentElement.style.padding = '12px 14px';
    tooltipContentElement.style.borderWidth = '2px';
  } else if (content.title2) {
    // Extra wide tooltips for double-title headings to prevent word wrap
    tooltipContentElement.style.width = '420px';
    tooltipContentElement.style.padding = '12px 14px';
    tooltipContentElement.style.borderWidth = '2px';
  } else if (isLineStyle) {
    // Wider tooltips for lineStyle to prevent heading line breaks
    tooltipContentElement.style.width = '360px';
    tooltipContentElement.style.padding = '12px 14px';
    tooltipContentElement.style.borderWidth = '2px';
  } else {
    tooltipContentElement.style.width = '320px';
    tooltipContentElement.style.padding = '12px 14px';
    tooltipContentElement.style.borderWidth = '2px';
  }

  // Build tooltip HTML with new design
  let html = '';

  // Font sizes - smaller for small style tooltips
  const titleSize = isSmallStyle ? '13px' : '17px';
  const subtitleSize = isSmallStyle ? '10px' : '13px';
  const textSize = isSmallStyle ? '9px' : '11px';

  // Text colors - dark for line style, ESA dots and ESA lines, light for normal
  const useDarkText = isLineStyle || isEsaElement;
  const titleColor = useDarkText ? '#222' : 'white';
  const subtitleColor = useDarkText ? '#333' : 'white';
  const textColor = useDarkText ? '#444' : 'white';
  const detailColor = useDarkText ? '#555' : '#aaa';

  // Title - larger, bold (italicised for line tooltips and small tooltips)
  if (content.title) {
    const titleStyle = (isLineStyle || isSmallStyle) ? 'font-style: italic;' : '';
    const titleMargin = content.title2 ? '2px' : (isSmallStyle ? '2px' : '4px');
    html += `<div style="font-weight: bold; font-size: ${titleSize}; color: ${titleColor}; ${titleStyle} margin-bottom: ${titleMargin};">${content.title}</div>`;
  }

  // Title2 - same size as title, for double-heading tooltips
  if (content.title2) {
    const titleStyle = (isLineStyle || isSmallStyle) ? 'font-style: italic;' : '';
    html += `<div style="font-weight: bold; font-size: ${titleSize}; color: ${titleColor}; ${titleStyle} margin-bottom: ${isSmallStyle ? '4px' : '8px'};">${content.title2}</div>`;
  }

  // Subtitle - normal size, bold (show for lineStyle if present)
  if (content.subtitle) {
    const subtitleStyle = isLineStyle ? 'font-style: italic;' : '';
    html += `<div style="font-size: ${subtitleSize}; color: ${subtitleColor}; font-weight: bold; ${subtitleStyle} margin-bottom: ${isSmallStyle ? '4px' : '8px'};">${content.subtitle}</div>`;
  }

  // Description - smaller
  if (content.description) {
    html += `<div style="font-size: ${textSize}; color: ${textColor}; line-height: 1.4; margin-bottom: ${isSmallStyle ? '2px' : '4px'};">${content.description}</div>`;
  }

  // Details - each on new line, smaller, no bullet points
  if (content.details && content.details.length > 0) {
    content.details.forEach(detail => {
      html += `<div style="font-size: ${textSize}; color: ${detailColor}; line-height: 1.4;">${detail}</div>`;
    });
  }

  tooltipContentElement.innerHTML = html;

  // Store link for click handler
  tooltipContentElement.dataset.link = content.link || '';

  // Remove old click listeners and add new one
  tooltipContentElement.onclick = function(e) {
    // Only open link if tooltip is sticky (user clicked once to pin it)
    if (!tooltipIsSticky) return;

    if (tooltipContentElement.dataset.link) {
      const newWindow = window.open(tooltipContentElement.dataset.link, '_blank', 'noopener,noreferrer');
      if (newWindow) newWindow.blur();
      window.focus();
      // Dismiss tooltip after opening link
      hideTooltip();
      clearHighlights();
    }
    e.stopPropagation();
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
  console.log('hideTooltip called', new Error().stack);
  const tooltip = document.getElementById('diagram-tooltip');
  if (tooltip) {
    tooltip.style.opacity = '0';
  }
  tooltipIsSticky = false;
  stickyElementId = null;
}

/**
 * Highlight an element (make it glow/brighter)
 * Handles multiple elements with the same ID
 */
function highlightElement(elementId) {
  const elements = document.querySelectorAll(`[data-interactive-id="${elementId}"]`);

  // Special handling for dots (e.g., dot-50, dot-51, etc.)
  if (!elements.length && elementId.startsWith('dot-')) {
    const dotIndex = parseInt(elementId.replace('dot-', ''));
    if (window.dotPositions && window.dotPositions[dotIndex]) {
      const dotPos = window.dotPositions[dotIndex];
      // Find circles at this position (both blue and yellow)
      const allCircles = document.querySelectorAll('circle');
      allCircles.forEach(circle => {
        const cx = parseFloat(circle.getAttribute('cx'));
        const cy = parseFloat(circle.getAttribute('cy'));
        const r = parseFloat(circle.getAttribute('r'));

        // Check if circle is at this dot's position (within tolerance)
        if (r && r < 30 && Math.abs(cx - dotPos.x) < 5 && Math.abs(cy - dotPos.y) < 5) {
          circle.classList.add('highlighted');
          if (!circle.dataset.originalOpacity) {
            circle.dataset.originalOpacity = circle.style.opacity || getComputedStyle(circle).opacity || '1';
            circle.dataset.originalFilter = circle.style.filter || 'none';
          }
          circle.style.filter = 'brightness(1.8) drop-shadow(0 0 12px rgba(255,255,255,0.9)) drop-shadow(0 0 6px rgba(255,255,255,0.9))';
          circle.style.opacity = '1';
          currentHighlightedElements.add(circle);
        }
      });
    }
    return;
  }

  // Special handling for group elements by ID (e.g., blue-connecting-lines, small-group, etc.)
  if (!elements.length) {
    const groupElement = document.getElementById(elementId);
    if (groupElement) {
      // Special case: blue-connecting-lines contains lines, yellow-circles contains lines and circles
      // No thickness change - just brightness and strong glow
      if (elementId === 'blue-connecting-lines') {
        const lines = groupElement.querySelectorAll('line, path');
        lines.forEach(line => {
          line.classList.add('highlighted');
          if (!line.dataset.originalOpacity) {
            line.dataset.originalOpacity = line.style.opacity || getComputedStyle(line).opacity || '1';
            line.dataset.originalFilter = line.style.filter || 'none';
          }
          line.style.filter = 'brightness(1.8) drop-shadow(0 0 12px rgba(255,255,255,0.9)) drop-shadow(0 0 6px rgba(255,255,255,0.9))';
          line.style.opacity = '1';
          currentHighlightedElements.add(line);
        });
        return;
      }

      // yellow-circles contains both lines and circles (yellow dots)
      // No thickness change - just brightness and strong glow
      if (elementId === 'yellow-circles') {
        const elements = groupElement.querySelectorAll('line, path, circle');
        elements.forEach(el => {
          el.classList.add('highlighted');
          if (!el.dataset.originalOpacity) {
            el.dataset.originalOpacity = el.style.opacity || getComputedStyle(el).opacity || '1';
            el.dataset.originalFilter = el.style.filter || 'none';
          }
          el.style.filter = 'brightness(1.8) drop-shadow(0 0 12px rgba(255,255,255,0.9)) drop-shadow(0 0 6px rgba(255,255,255,0.9))';
          el.style.opacity = '1';
          currentHighlightedElements.add(el);
        });
        return;
      }

      // small-group (FSS circle) - highlight children with same glow as direct hover
      if (elementId === 'small-group') {
        const children = groupElement.querySelectorAll('circle, path');
        children.forEach(child => {
          child.classList.add('highlighted');
          if (!child.dataset.originalOpacity) {
            child.dataset.originalOpacity = child.style.opacity || getComputedStyle(child).opacity || '1';
            child.dataset.originalFilter = child.style.filter || 'none';
          }
          child.style.filter = 'brightness(1.8) drop-shadow(0 0 12px rgba(255,255,255,0.9)) drop-shadow(0 0 6px rgba(255,255,255,0.9))';
          child.style.opacity = '1';
          currentHighlightedElements.add(child);
        });
        return;
      }

      groupElement.classList.add('highlighted');
      if (!groupElement.dataset.originalOpacity) {
        groupElement.dataset.originalOpacity = groupElement.style.opacity || '1';
        groupElement.dataset.originalFilter = groupElement.style.filter || 'none';
      }
      groupElement.style.filter = 'brightness(1.8) drop-shadow(0 0 12px rgba(255,255,255,0.9)) drop-shadow(0 0 6px rgba(255,255,255,0.9))';
      groupElement.style.opacity = '1';
      currentHighlightedElements.add(groupElement);
      return;
    }
  }

  // Try to find elements by class name (for lines with class-based identification)
  if (!elements.length) {
    const classBased = document.querySelectorAll(`.${elementId}`);
    if (classBased.length) {
      classBased.forEach(el => {
        el.classList.add('highlighted');
        if (!el.dataset.originalOpacity) {
          el.dataset.originalOpacity = el.style.opacity || getComputedStyle(el).opacity || '1';
          el.dataset.originalFilter = el.style.filter || 'none';
        }
        el.style.filter = 'brightness(1.8) drop-shadow(0 0 12px rgba(255,255,255,0.9)) drop-shadow(0 0 6px rgba(255,255,255,0.9))';
        el.style.opacity = '1';
        currentHighlightedElements.add(el);
      });
      return;
    }
  }

  if (!elements.length) return;

  elements.forEach(element => {
    // Special handling for RITS circle - highlight children instead of group
    if (elementId === 'rits-circle' && element.id === 'big-group') {
      const children = element.querySelectorAll('circle, path');
      children.forEach(child => {
        child.classList.add('highlighted');
        if (!child.dataset.originalOpacity) {
          child.dataset.originalOpacity = child.style.opacity || getComputedStyle(child).opacity || '1';
          child.dataset.originalFilter = child.style.filter || 'none';
        }
        child.style.filter = 'brightness(1.8) drop-shadow(0 0 12px rgba(255,255,255,0.9)) drop-shadow(0 0 6px rgba(255,255,255,0.9))';
        child.style.opacity = '1';
        currentHighlightedElements.add(child);
      });
      return;
    }

    // Special handling for FSS circle - highlight children instead of group
    // Applies when hovering FSS directly (fss-circle) or when FSS is highlighted as related element (small-group)
    if ((elementId === 'fss-circle' || elementId === 'small-group') && element.id === 'small-group') {
      const children = element.querySelectorAll('circle, path');
      children.forEach(child => {
        child.classList.add('highlighted');
        if (!child.dataset.originalOpacity) {
          child.dataset.originalOpacity = child.style.opacity || getComputedStyle(child).opacity || '1';
          child.dataset.originalFilter = child.style.filter || 'none';
        }
        child.style.filter = 'brightness(1.8) drop-shadow(0 0 12px rgba(255,255,255,0.9)) drop-shadow(0 0 6px rgba(255,255,255,0.9))';
        child.style.opacity = '1';
        currentHighlightedElements.add(child);
      });
      return;
    }

    // Special handling for LVSS gear - highlight children instead of group
    if (elementId === 'lvss-gear') {
      const children = element.querySelectorAll('circle, path');
      children.forEach(child => {
        child.classList.add('highlighted');
        if (!child.dataset.originalOpacity) {
          child.dataset.originalOpacity = child.style.opacity || getComputedStyle(child).opacity || '1';
          child.dataset.originalFilter = child.style.filter || 'none';
        }
        child.style.filter = 'brightness(1.8) drop-shadow(0 0 12px rgba(255,255,255,0.9)) drop-shadow(0 0 6px rgba(255,255,255,0.9))';
        child.style.opacity = '1';
        currentHighlightedElements.add(child);
      });
      return;
    }

    element.classList.add('highlighted');

    // Store original styles if not already stored
    if (!element.dataset.originalOpacity) {
      element.dataset.originalOpacity = element.style.opacity || '1';
      element.dataset.originalFilter = element.style.filter || 'none';
    }

    // Apply highlight effect
    const tagName = element.tagName.toLowerCase();

    if (tagName === 'rect') {
      // For boxes/rectangles, use a moderate glow
      element.style.filter = 'brightness(1.4) drop-shadow(0 0 10px rgba(255,255,255,0.6)) drop-shadow(0 0 5px rgba(255,255,255,0.6))';
      element.style.opacity = '1';
    } else if (tagName === 'circle') {
      // Check if this is a small dot that needs a glow circle
      const radius = parseFloat(element.getAttribute('r')) || 0;
      if (radius < 10 && elementId && elementId.startsWith('dot-')) {
        // For small dots, create a visible glow circle behind them
        const cx = element.getAttribute('cx');
        const cy = element.getAttribute('cy');
        const glowCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        glowCircle.setAttribute('cx', cx);
        glowCircle.setAttribute('cy', cy);
        glowCircle.setAttribute('r', radius * 3);
        glowCircle.setAttribute('fill', 'rgba(255, 255, 255, 0.6)');
        glowCircle.setAttribute('filter', 'blur(4px)');
        glowCircle.classList.add('dot-glow-effect');
        glowCircle.dataset.forDot = elementId;
        // Insert glow circle before the dot
        element.parentNode.insertBefore(glowCircle, element);
        currentHighlightedElements.add(glowCircle);
      }
      // Also apply filter to the circle itself
      element.style.filter = 'brightness(1.8) drop-shadow(0 0 12px rgba(255,255,255,0.9)) drop-shadow(0 0 6px rgba(255,255,255,0.9))';
      element.style.opacity = '1';
    } else if (tagName === 'path' || tagName === 'line') {
      // For paths and lines, add a strong glow filter
      element.style.filter = 'brightness(1.8) drop-shadow(0 0 12px rgba(255,255,255,0.9)) drop-shadow(0 0 6px rgba(255,255,255,0.9))';
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
  // Remove any glow circles that were created for small dots
  const glowCircles = document.querySelectorAll('.dot-glow-effect');
  glowCircles.forEach(glow => glow.remove());

  currentHighlightedElements.forEach(item => {
    // Handle both string IDs and direct element references
    if (typeof item === 'string') {
      unhighlightElement(item);
    } else if (item instanceof Element) {
      // Skip if element was already removed (like glow circles)
      if (!item.parentNode) return;
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
  const boxElement =
    document.getElementById(boxElementId) ||
    document.querySelector(`[data-interactive-id="${boxElementId}"]`);
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

    // Skip FSS gearwheel circles (small-group children)
    const smallGroup = document.getElementById('small-group');
    if (smallGroup && smallGroup.contains(circle)) {
      return;
    }

    // Skip RITS gearwheel circles (big-group children)
    const bigGroup = document.getElementById('big-group');
    if (bigGroup && bigGroup.contains(circle)) {
      return;
    }

    const cx = parseFloat(circle.getAttribute('cx'));
    const cy = parseFloat(circle.getAttribute('cy'));
    const r = parseFloat(circle.getAttribute('r'));

    // Only highlight dots (including CLS), not the huge RITS/FSS gearwheels
    // CLS dot is large (~30-50 radius), RITS/FSS are much larger (>100 radius)
    if (r && r < 70 && cx && cy) {
      // Check if circle center is within box bounds
      if (cx >= boxLeft && cx <= boxRight && cy >= boxTop && cy <= boxBottom) {
        // Apply highlight directly to circle element
        circle.classList.add('highlighted');
        if (!circle.dataset.originalOpacity) {
          circle.dataset.originalOpacity = circle.style.opacity || getComputedStyle(circle).opacity || '1';
          circle.dataset.originalFilter = circle.style.filter || 'none';
        }
        circle.style.filter = 'brightness(1.8) drop-shadow(0 0 12px rgba(255,255,255,0.9)) drop-shadow(0 0 6px rgba(255,255,255,0.9))';
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

  const { targetId, dotIndex, isYellowDot } = resolveHoverTarget(elementId);
  if (!targetId) return;
  const overrideTarget = getHigherPriorityInteractive(event, targetId);
  if (overrideTarget) {
    handleMouseEnter({
      currentTarget: overrideTarget,
      clientX: event.clientX,
      clientY: event.clientY
    });
    return;
  }

  if (tooltipIsSticky && stickyElementId && stickyElementId !== targetId) {
    return;
  }

  // Clear any lingering highlights before applying new ones (unless we're re-entering the sticky element)
  if (!tooltipIsSticky || stickyElementId !== targetId) {
    clearHighlights();
  }

  // Show tooltip for this specific element
  // Pass original elementId for color (so yellow dots show yellow, not blue)
  showTooltip(targetId, event, elementId);

  // Special handling for boxes that should highlight contained dots
  if (targetId === 'blue-dots-background') {
    // ESA box - highlight all blue and yellow dots (including RBA)
    highlightElement(targetId);

    const allCircles = document.querySelectorAll('circle');
    allCircles.forEach(circle => {
      const cx = parseFloat(circle.getAttribute('cx'));
      const cy = parseFloat(circle.getAttribute('cy'));
      const r = parseFloat(circle.getAttribute('r'));

      // Highlight small dots (r < 20), including RBA's blue and yellow dots
      if (r && r < 20 && cx && cy) {
        circle.classList.add('highlighted');
        if (!circle.dataset.originalOpacity) {
          circle.dataset.originalOpacity = circle.style.opacity || getComputedStyle(circle).opacity || '1';
          circle.dataset.originalFilter = circle.style.filter || 'none';
        }
        circle.style.filter = 'brightness(1.8) drop-shadow(0 0 12px rgba(255,255,255,0.9)) drop-shadow(0 0 6px rgba(255,255,255,0.9))';
        circle.style.opacity = '1';
        currentHighlightedElements.add(circle);
      }
    });

    // Also highlight CLS circle (larger circle, part of ESA holders)
    highlightElement('cls-circle');
  } else if (targetId === 'adi-box' || targetId === 'non-adis-box' ||
             targetId === 'domestic-banks-box' || targetId === 'international-banks-box' ||
             targetId === 'foreign-branches-box' || targetId === 'foreign-subsidiaries-box' ||
             targetId === 'specialised-adis-box' || targetId === 'other-adis-box' ||
             targetId === 'psps-box' || targetId === 'cs-box') {
    // Highlight the box itself
    highlightElement(targetId);

    // Highlight all circles within this box
    highlightCirclesInBox(targetId);
  } else {
    // Normal highlighting - highlight this element and all related elements
    let relatedElements;
    if (isYellowDot) {
      // Yellow dots should only highlight their own dot/lines, not entire peer groups
      relatedElements = new Set([targetId]);
    } else {
      relatedElements = window.getRelatedElements?.(targetId) || new Set([targetId]);
    }

    if (targetId.startsWith('dot-')) {
      // Ensure the radial lines for this dot also highlight
      const derivedDotIndex = dotIndex ?? parseInt(targetId.replace('dot-', ''), 10);
      if (!Number.isNaN(derivedDotIndex)) {
        relatedElements = new Set(relatedElements);
        relatedElements.add(`blue-line-${derivedDotIndex}`);
        if (window.yellowLinesByDot && window.yellowLinesByDot[derivedDotIndex]) {
          relatedElements.add(`yellow-line-${derivedDotIndex}`);
          relatedElements.add(`yellow-dot-${derivedDotIndex}`);
        } else if (isYellowDot) {
          relatedElements.add(`yellow-dot-${derivedDotIndex}`);
        }
      }
    }

    relatedElements.forEach(id => {
      highlightElement(id);
    });
  }

  // Ensure the specific yellow dot element glows when hovered directly
  if (isYellowDot && dotIndex !== null) {
    highlightElement(`yellow-dot-${dotIndex}`);
  }
}

/**
 * Handle mouse move on an interactive element (update tooltip position)
 */
function handleMouseMove(event) {
  // Don't move tooltip if it's sticky (stationary)
  if (tooltipIsSticky) return;

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
  console.log('handleMouseLeave - tooltipIsSticky:', tooltipIsSticky);
  // If tooltip is sticky, don't dismiss on mouse leave - require click to dismiss
  if (tooltipIsSticky) {
    console.log('handleMouseLeave - returning because sticky');
    return;
  }

  hideTooltip();
  clearHighlights();
}

/**
 * Handle click on an interactive element - toggle tooltip sticky state
 */
function handleClick(event) {
  console.log('handleClick fired', event.currentTarget);
  const elementId = event.currentTarget.dataset.interactiveId;
  if (!elementId) { console.log('no elementId'); return; }

  const { targetId } = resolveHoverTarget(elementId);
  if (!targetId) { console.log('no targetId'); return; }
  console.log('handleClick - elementId:', elementId, 'targetId:', targetId);
  const overrideTarget = getHigherPriorityInteractive(event, targetId);
  if (overrideTarget) {
    // Stop propagation on original event before recursive call
    if (event.stopPropagation) event.stopPropagation();
    handleClick({
      currentTarget: overrideTarget,
      clientX: event.clientX,
      clientY: event.clientY
    });
    return;
  }

  // If clicking on the same element that's already sticky, dismiss it
  if (tooltipIsSticky && stickyElementId === targetId) {
    hideTooltip();
    clearHighlights();
    tooltipIsSticky = false;
    stickyElementId = null;
    if (event.stopPropagation) event.stopPropagation();
    return;
  }

  // Make tooltip stationary (stop following mouse)
  tooltipIsSticky = true;
  stickyElementId = targetId;
  justMadeSticky = true;  // Prevent document handler from immediately dismissing
  console.log('Made sticky:', targetId, 'tooltipIsSticky:', tooltipIsSticky);

  // Clear flag after a short delay (after event bubbling completes)
  setTimeout(() => { justMadeSticky = false; }, 10);

  // Ensure tooltip and highlights are shown
  showTooltip(targetId, event);

  // Highlight this element and all related elements
  const relatedElements = window.getRelatedElements?.(targetId) || new Set([targetId]);
  relatedElements.forEach(id => {
    highlightElement(id);
  });

  console.log('After showTooltip - tooltipIsSticky:', tooltipIsSticky);
  if (event.stopPropagation) event.stopPropagation();
}

/**
 * Make an SVG element interactive
 * Call this when creating elements in diagram-core-refactored.js
 */
function makeInteractive(element, elementId) {
  if (!element || !elementId) return;

  element.setAttribute('data-interactive-id', elementId);
  element.style.cursor = 'pointer';
  // Only set pointerEvents if not already set (allows 'stroke' etc. to be preserved)
  if (!element.style.pointerEvents || element.style.pointerEvents === 'none') {
    element.style.pointerEvents = 'all';
  }

  element.addEventListener('mouseenter', handleMouseEnter);
  element.addEventListener('mousemove', handleMouseMove);
  element.addEventListener('mouseleave', handleMouseLeave);
  element.addEventListener('click', handleClick);
}

function getHigherPriorityInteractive(event, targetId) {
  if (!event || !targetId || typeof event.clientX !== 'number' || typeof event.clientY !== 'number') {
    return null;
  }
  const overrideMap = {
    'directentry-to-adi-line': new Set(['osko-to-adi-line', 'cheques-to-apcs-line'])
  };
  const overrides = overrideMap[targetId];
  if (!overrides) return null;

  if (typeof document.elementsFromPoint !== 'function') return null;
  const stack = document.elementsFromPoint(event.clientX, event.clientY);
  if (!Array.isArray(stack)) return null;

  for (const el of stack) {
    if (!el) continue;
    const interactiveEl = el.closest ? el.closest('[data-interactive-id]') : null;
    if (!interactiveEl) continue;
    const id = interactiveEl.dataset.interactiveId;
    if (!id) continue;
    if (overrides.has(id)) {
      return interactiveEl;
    }
  }
  return null;
}

/**
 * Make an SVG element interactive for highlighting only (no tooltip)
 * Use this for elements that should trigger group highlights but not show tooltips
 */
function makeInteractiveHighlightOnly(element, elementId) {
  if (!element || !elementId) return;

  element.setAttribute('data-interactive-id', elementId);
  element.style.cursor = 'pointer';
  element.style.pointerEvents = 'all';  // Ensure element always receives pointer events

  // Custom handler that only does highlighting, no tooltip
  element.addEventListener('mouseenter', (event) => {
    const relatedElements = window.getRelatedElements?.(elementId) || new Set([elementId]);
    relatedElements.forEach(id => {
      highlightElement(id);
    });
  });
  element.addEventListener('mouseleave', handleMouseLeave);
}


/**
 * Handle document click to dismiss sticky tooltip
 */
function handleDocumentClick(event) {
  console.log('handleDocumentClick - justMadeSticky:', justMadeSticky, 'tooltipIsSticky:', tooltipIsSticky);
  // Don't dismiss if tooltip was just made sticky (same click event)
  if (justMadeSticky) { console.log('returning early - justMadeSticky'); return; }
  if (!tooltipIsSticky) { console.log('returning early - not sticky'); return; }

  const tooltip = document.getElementById('diagram-tooltip');
  const clickedOnTooltip = tooltip && tooltip.contains(event.target);
  const clickedOnInteractive = event.target.closest('[data-interactive-id]');
  console.log('clickedOnTooltip:', clickedOnTooltip, 'clickedOnInteractive:', clickedOnInteractive);

  // If clicked outside tooltip and outside interactive elements, dismiss
  if (!clickedOnTooltip && !clickedOnInteractive) {
    console.log('dismissing from document click');
    hideTooltip();
    clearHighlights();
  }
}

/**
 * Proximity-based hover detection for small blue dots
 * Finds the closest dot to the mouse cursor within a threshold
 */
let dotPositions = null;
let currentProximityDot = null;

function cacheDotPositions() {
  dotPositions = [];
  const svg = document.querySelector('svg');
  if (!svg) return;

  // Find all small blue dots (circles with dot-N IDs, excluding CLS which is large)
  const dots = document.querySelectorAll('circle[data-interactive-id^="dot-"]');
  dots.forEach(dot => {
    const id = dot.dataset.interactiveId;
    const cx = parseFloat(dot.getAttribute('cx'));
    const cy = parseFloat(dot.getAttribute('cy'));
    const r = parseFloat(dot.getAttribute('r'));
    // Only include small dots (radius < 15)
    if (!isNaN(cx) && !isNaN(cy) && r < 15) {
      dotPositions.push({ id, cx, cy, r, element: dot });
    }
  });
}

function handleSvgMouseMove(event) {
  if (tooltipIsSticky) return;
  if (!dotPositions || dotPositions.length === 0) {
    cacheDotPositions();
  }
  if (!dotPositions || dotPositions.length === 0) return;

  const svg = event.currentTarget;
  const pt = svg.createSVGPoint();
  pt.x = event.clientX;
  pt.y = event.clientY;
  const svgPt = pt.matrixTransform(svg.getScreenCTM().inverse());

  // Find closest dot within threshold
  const threshold = 15; // Extra pixels beyond the dot radius
  let closestDot = null;
  let closestDist = Infinity;

  for (const dot of dotPositions) {
    const dx = svgPt.x - dot.cx;
    const dy = svgPt.y - dot.cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const effectiveRadius = dot.r + threshold;

    if (dist < effectiveRadius && dist < closestDist) {
      closestDist = dist;
      closestDot = dot;
    }
  }

  // If we found a dot and it's different from current, trigger hover
  if (closestDot && closestDot.id !== currentProximityDot) {
    currentProximityDot = closestDot.id;
    // Simulate mouseenter on the dot
    const fakeEvent = {
      currentTarget: closestDot.element,
      clientX: event.clientX,
      clientY: event.clientY
    };
    handleMouseEnter(fakeEvent);
  } else if (!closestDot && currentProximityDot) {
    // Mouse moved away from all dots
    currentProximityDot = null;
    // Don't clear if tooltip is sticky
    if (!tooltipIsSticky) {
      hideTooltip();
      clearHighlights();
    }
  }
}

/**
 * Handle delegated mouseover on SVG - more reliable than individual mouseenter
 */
function handleSvgMouseOver(event) {
  // Find the interactive element under the mouse
  const interactiveEl = event.target.closest('[data-interactive-id]');

  if (interactiveEl) {
    const elementId = interactiveEl.dataset.interactiveId;
    const { targetId } = resolveHoverTarget(elementId);
    if (tooltipIsSticky && stickyElementId && stickyElementId !== targetId) {
      return;
    }

    // Only trigger if this is a different element than before
    if (targetId && targetId !== lastHoveredElementId) {
      lastHoveredElementId = targetId;

      // Create a fake event for handleMouseEnter
      const fakeEvent = {
        currentTarget: interactiveEl,
        clientX: event.clientX,
        clientY: event.clientY
      };
      handleMouseEnter(fakeEvent);
    }
  }
}

/**
 * Handle delegated mouseout on SVG
 */
function handleSvgMouseOut(event) {
  // Check if we're leaving to a non-interactive element
  const relatedTarget = event.relatedTarget;
  const leavingToInteractive = relatedTarget && relatedTarget.closest && relatedTarget.closest('[data-interactive-id]');
  const leavingToTooltip = relatedTarget && (relatedTarget.id === 'diagram-tooltip' || relatedTarget.closest('#diagram-tooltip'));

  if (!leavingToInteractive && !leavingToTooltip && !tooltipIsSticky) {
    lastHoveredElementId = null;
    hideTooltip();
    clearHighlights();
  }
}

/**
 * Initialize the interactive system
 * Call this once after the diagram is rendered
 */
function initializeInteractive() {
  createTooltipElement();
  // Listen for clicks outside to dismiss sticky tooltip
  document.addEventListener('click', handleDocumentClick);

  // Add delegated event handling on SVG for more reliable hover detection
  setTimeout(() => {
    const svg = document.querySelector('svg');
    if (svg) {
      cacheDotPositions();
      svg.addEventListener('mousemove', handleSvgMouseMove);
      // Add delegated mouseover/mouseout for reliability
      svg.addEventListener('mouseover', handleSvgMouseOver);
      svg.addEventListener('mouseout', handleSvgMouseOut);
      // Add delegated click for reliability
      svg.addEventListener('click', handleSvgClick);
    }
  }, 200); // Delay to ensure diagram is rendered
}

/**
 * Handle delegated click on SVG - more reliable than individual click listeners
 */
function handleSvgClick(event) {
  const interactiveEl = event.target.closest('[data-interactive-id]');
  console.log('handleSvgClick - target:', event.target, 'interactiveEl:', interactiveEl);

  if (interactiveEl) {
    const elementId = interactiveEl.dataset.interactiveId;
    const { targetId } = resolveHoverTarget(elementId);
    console.log('handleSvgClick - elementId:', elementId, 'targetId:', targetId);

    if (!targetId) return;

    // Check for override target
    const overrideTarget = getHigherPriorityInteractive(event, targetId);
    const finalTarget = overrideTarget || interactiveEl;
    const finalTargetId = overrideTarget ? overrideTarget.dataset.interactiveId : targetId;
    const { targetId: resolvedFinalTargetId } = resolveHoverTarget(finalTargetId);

    // If clicking on the same element that's already sticky, dismiss it
    if (tooltipIsSticky && stickyElementId === resolvedFinalTargetId) {
      console.log('handleSvgClick - dismissing sticky');
      hideTooltip();
      clearHighlights();
      tooltipIsSticky = false;
      stickyElementId = null;
      event.stopPropagation();
      return;
    }

    // Make tooltip stationary
    tooltipIsSticky = true;
    stickyElementId = resolvedFinalTargetId;
    justMadeSticky = true;
    console.log('handleSvgClick - made sticky:', resolvedFinalTargetId);

    setTimeout(() => { justMadeSticky = false; }, 10);

    // Ensure tooltip and highlights are shown
    showTooltip(resolvedFinalTargetId, event, elementId);

    // Highlight this element and all related elements
    const relatedElements = window.getRelatedElements?.(resolvedFinalTargetId) || new Set([resolvedFinalTargetId]);
    relatedElements.forEach(id => {
      highlightElement(id);
    });

    event.stopPropagation();
  }
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
  window.makeInteractiveHighlightOnly = makeInteractiveHighlightOnly;
  window.initializeInteractive = initializeInteractive;
  window.showTooltip = showTooltip;
  window.hideTooltip = hideTooltip;
  window.highlightElement = highlightElement;
  window.unhighlightElement = unhighlightElement;
  window.clearHighlights = clearHighlights;
  window.highlightCirclesInBox = highlightCirclesInBox;
}
