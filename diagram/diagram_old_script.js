
    // ----- Compute precise positions and the arc path deterministically -----
    (function () {
      // Global constant for CLS sigmoid curve expansion
      const CLS_SIGMOID_EXPANSION = 1.5; // How much to expand horizontally (1.5 = 150% wider on each side)
      
      const svg = document.getElementById('diagram');
      const p = document.getElementById('params').dataset;

      // Read parameters (numbers only)
      const cx       = +p.cx;          // shared x for circles
      const cyBig    = +p.cyBig;       // center y of big circle
      const rBig     = +p.rBig; // Back to original size (5% increase from current)
      const gap      = +p.gap;         // vertical clearance between the two circles' edges
      const rSmall   = +p.rSmall * 0.90; // 10% smaller (was 5%, now additional 5%)
      const arcR     = +p.arcR;        // radius of the enclosing arc
      const arcSpan  = +p.arcAngleDeg; // total degrees swept by the arc (e.g., 220°)
      const arcShift = +p.arcOffsetDeg;// rotate arc around its center (degrees)
      const strokeW  = +p.strokeWidth;

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

      // Position circles (exactly):
      // Blue circle - update all layers
      const bigOuter = document.getElementById('big-outer');
      const bigGearBorder = document.getElementById('big-gear-border');
      const bigInner = document.getElementById('big-inner');
      
      bigOuter.setAttribute('cx', cx);
      bigOuter.setAttribute('cy', cyBig);
      bigOuter.setAttribute('r', rBig + strokeW/2); // Slightly larger to ensure background coverage
      
      bigInner.setAttribute('cx', cx);
      bigInner.setAttribute('cy', cyBig);
      bigInner.setAttribute('r', rBig - strokeW * 2.5); // Inner circle radius

      // Orange circle - update all layers
      const smallOuter = document.getElementById('small-outer');
      const smallGearBorder = document.getElementById('small-gear-border');
      const smallInner = document.getElementById('small-inner');
      
      // For outer edges to touch, we need to account for stroke width
      // Distance between centers = r1 + r2 + strokeWidth (since stroke extends outward from the edge)
      const cySmall = cyBig - (rBig + rSmall + strokeW);
      
      smallOuter.setAttribute('cx', cx);
      smallOuter.setAttribute('cy', cySmall);
      smallOuter.setAttribute('r', rSmall + strokeW/2); // Slightly larger for background
      
      smallInner.setAttribute('cx', cx);
      smallInner.setAttribute('cy', cySmall);
      smallInner.setAttribute('r', rSmall - strokeW * 2); // Inner circle radius - made smaller for thicker gear border
      
      // Update the orange circle label position
      const smallLabel = document.getElementById('small-label');
      if (smallLabel) {
        smallLabel.setAttribute('x', cx);
        smallLabel.setAttribute('y', cySmall);
      }
      
      // Update the blue circle label position
      const bigLabel = document.getElementById('big-label');
      if (bigLabel) {
        bigLabel.setAttribute('x', cx);
        bigLabel.setAttribute('y', cyBig);
        // Update all tspan elements
        const tspans = bigLabel.getElementsByTagName('tspan');
        for (let tspan of tspans) {
          tspan.setAttribute('x', cx);
        }
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
      
      // Update gear paths
      // Create gear-shaped border (layer 2)
      if (bigGearBorder) {
        const outerRadius = rBig - strokeW * 0.75;
        const innerRadius = rBig - strokeW * 2.5;
        const teeth = 20;
        const toothHeight = 6;
        
        // Create gear shape that fills between outer circle and inner circle
        let path = createGearPath(outerRadius - toothHeight, teeth, toothHeight, 0.25);
        // Add inner cutout
        path += ` M ${innerRadius} 0 A ${innerRadius} ${innerRadius} 0 1 0 ${-innerRadius} 0 A ${innerRadius} ${innerRadius} 0 1 0 ${innerRadius} 0`;
        
        bigGearBorder.setAttribute('d', path);
        bigGearBorder.setAttribute('transform', `translate(${cx}, ${cyBig})`);
        bigGearBorder.setAttribute('fill-rule', 'evenodd');
      }
      
      const bigGear = document.getElementById('big-gear');
      if (bigGear) {
        const bigInnerRadius = rBig - strokeW * 2.5;
        const bigGearRadius = bigInnerRadius - 12; // Leave 12px border (was 15)
        const bigToothHeight = 8;
        bigGear.setAttribute('d', createGearPath(bigGearRadius - bigToothHeight, 16, bigToothHeight, 0.25));
        bigGear.setAttribute('transform', `translate(${cx}, ${cyBig})`);
      }
      
      // Create gear-shaped border for orange circle (layer 2)
      if (smallGearBorder) {
        const outerRadius = rSmall - strokeW * 0.3;
        const innerRadius = rSmall - strokeW * 2;
        const teeth = 12;
        const toothHeight = 4;
        
        // Create gear shape that fills between outer circle and inner circle
        let path = createGearPath(outerRadius - toothHeight, teeth, toothHeight, 0.25);
        // Add inner cutout
        path += ` M ${innerRadius} 0 A ${innerRadius} ${innerRadius} 0 1 0 ${-innerRadius} 0 A ${innerRadius} ${innerRadius} 0 1 0 ${innerRadius} 0`;
        
        smallGearBorder.setAttribute('d', path);
        smallGearBorder.setAttribute('transform', `translate(${cx}, ${cySmall})`);
        smallGearBorder.setAttribute('fill-rule', 'evenodd');
      }
      
      const smallGear = document.getElementById('small-gear');
      if (smallGear) {
        const smallInnerRadius = rSmall - strokeW * 2;
        const smallGearRadius = smallInnerRadius - 8; // Leave 8px border
        const smallToothHeight = 4;
        smallGear.setAttribute('d', createGearPath(smallGearRadius - smallToothHeight, 10, smallToothHeight, 0.25));
        smallGear.setAttribute('transform', `translate(${cx}, ${cySmall})`);
      }

      // Build the arc so it starts above the small circle and ends below the big circle.
      // The arc should curve around the RIGHT side of the circles.
      const arc = document.getElementById('enclosing-arc');

      // Calculate how much we need to extend the arc based on increased spacing
      const baseSpacing = 1; // Original spacing
      const newSpacing = 5.0; // New dot spacing (matches dotSpacing below)
      const gapMultiplier = 2; // Gaps are double the dot spacing
      const totalCircles = 100; // Total number of circles
      const spacingRatio = (newSpacing + (10 * newSpacing * gapMultiplier) / totalCircles) / baseSpacing; // Updated to 10 gaps
      
      // Extend the arc vertically to accommodate the increased spacing
      const arcExtension = 120 * (spacingRatio - 1); // Further increased extension
      
      // Move arc further right to create more space
      const arcOffset = 60; // Increased offset to push arc right
      
      // Simple approach: draw arc from top point to bottom point
      // Start point: closer to orange circle
      const startX = cx + rBig + strokeW + 20 + arcOffset;
      const startY = cySmall - rSmall - 15 - arcExtension; // closer to orange circle
      
      // End point: closer to blue circle
      const endX = cx + rBig + strokeW + 20 + arcOffset;
      const endY = cyBig + rBig + 15 + arcExtension; // closer to blue circle
      
      // Control how much the arc bulges to the right
      // Increase radius for gentler curve with more horizontal space
      const arcRadius = (arcR + arcExtension) * 0.3; // Increased from 0.3 to 0.5

      // Create the arc path using SVG arc command
      // A rx ry x-axis-rotation large-arc-flag sweep-flag x y
      const largeArc = 0; // small arc
      const sweep = 1; // clockwise

      const d = `M ${startX} ${startY} A ${arcRadius} ${arcRadius} 0 ${largeArc} ${sweep} ${endX} ${endY}`;
      arc.setAttribute('d', d);
      arc.setAttribute('stroke-width', 3);
      arc.style.display = 'none'; // Hide the black arc line

      // Add 100 small blue circles along the arc
      const numCircles = 100;
      const smallCircleRadius = 3 * (4/5); // Reduced to 4/5 of original size (2.4)
      
      // Calculate arc center from the endpoints and radius
      // For a circular arc with vertical endpoints, center is to the left
      const halfHeight = (endY - startY) / 2;
      const sqrtTerm = arcRadius * arcRadius - halfHeight * halfHeight;
      
      // Elliptical parameters - stretch vertically
      const verticalStretch = 1.05; // Increase this to stretch more vertically
      
      // Check if the arc radius is large enough
      const arcCenterX = sqrtTerm > 0 ? startX - Math.sqrt(sqrtTerm) : startX - arcRadius;
      const arcCenterY = (startY + endY) / 2;
      
      const arcRadiusX = arcRadius;
      const arcRadiusY = arcRadius * verticalStretch;
      
      // Calculate start and end angles (adjusted for ellipse)
      const startAngle = Math.atan2((startY - arcCenterY) / verticalStretch, startX - arcCenterX);
      const endAngle = Math.atan2((endY - arcCenterY) / verticalStretch, endX - arcCenterX);
      
      // Get the pre-existing lines groups
      const blueLinesGroup = document.getElementById('blue-connecting-lines');
      const orangeLinesGroup = document.getElementById('orange-connecting-lines');
      
      // Create a group for the small circles
      const circlesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      circlesGroup.setAttribute('id', 'arc-circles');
      svg.appendChild(circlesGroup);
      
      // Create a group for background elements (rendered first)
      const backgroundGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      backgroundGroup.setAttribute('id', 'background-elements');
      svg.appendChild(backgroundGroup);
      
      // Create a group for labels (rendered last so they appear on top)
      const labelsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      labelsGroup.setAttribute('id', 'dot-labels');
      svg.appendChild(labelsGroup);
      
      // Distribute circles in groups: 1, triple gap, 45, gap, 5, double gap, 34, gap, 3, gap, 4, double gap, 8
      // Use consistent spacing for all dots (based on larger dot spacing)
      const dotSpacing = 5.0; // Further increased spacing
      const gapSpacing = dotSpacing * 2; // Gaps are double the dot spacing
      
      for (let i = 0; i < numCircles; i++) {
        let adjustedIndex = i * dotSpacing; // Each dot gets the same spacing
        
        // Debug the last group
        if (i >= 92) {
          console.log(`Dot ${i}: Group 6, position ${i - 92 + 1} in group`);
        }
        
        // For the first dot, create a black background circle at extended position
        if (i === 0) {
          // Calculate position for first dot (blue) on arc
          const firstAngle = startAngle;
          const firstX = arcCenterX + arcRadiusX * Math.cos(firstAngle);
          const firstY = arcCenterY + arcRadiusY * Math.sin(firstAngle);
          
          // Calculate extended position for black dot
          const dx = firstX - cx;
          const dy = firstY - cyBig;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const extensionFactor = 1.067; // Reduced for first dot only
          const blackCenterX = cx + (dx / dist) * dist * extensionFactor;
          let blackCenterY = cyBig + (dy / dist) * dist * extensionFactor;
          
          // Raise the black circle by full diameter to match RBA dot
          const blackCircleRadius = smallCircleRadius * 6;
          blackCenterY -= blackCircleRadius * 2; // Move up by 2x radius (full diameter)
          
          // Create large black circle at extended position
          const blackCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          blackCircle.setAttribute('cx', blackCenterX.toFixed(2));
          blackCircle.setAttribute('cy', blackCenterY.toFixed(2));
          blackCircle.setAttribute('r', blackCircleRadius); // Large enough to enclose both
          blackCircle.setAttribute('fill', '#000000'); // solid black
          blackCircle.setAttribute('stroke', '#991b1b'); // dark red outline
          blackCircle.setAttribute('stroke-width', '2');
          circlesGroup.appendChild(blackCircle);
        }
        
        // Group 1: 1 dot (index 0)
        if (i === 0) {
          adjustedIndex = 0;
        }
        // Group 2: 44 dots (indices 1-44) after triple gap
        else if (i >= 1 && i < 45) {
          adjustedIndex = (i * dotSpacing) + (2 * gapSpacing); // Add scaled triple gap
        }
        // Group 3: 5 dots (indices 45-49) after single gap - HSBC and ING should be here
        else if (i >= 45 && i < 50) {
          adjustedIndex = (i * dotSpacing) + (3 * gapSpacing); // Add 3 + 1 gaps
        }
        // Group 4: 34 dots (indices 50-83) after double gap - shifted down by 1
        else if (i >= 50 && i < 84) {
          adjustedIndex = ((i + 1) * dotSpacing) + (6 * gapSpacing); // Add 3 + 1 + 2 gaps, shift by 1
        }
        // Group 5a: 3 dots (indices 84-86) after increased gap - shifted down by 1
        else if (i >= 84 && i < 87) {
          adjustedIndex = ((i + 1) * dotSpacing) + (8 * gapSpacing); // Add 3 + 1 + 2 + 2 gaps (increased from 1 to 2), shift by 1
        }
        // Group 5b: 5 dots (indices 87-91) after increased gap - now includes dot from Group 6
        else if (i >= 87 && i < 92) {
          adjustedIndex = (i * dotSpacing) + (10.5 * gapSpacing); // Add all gaps including slightly increased gap between 5a and 5b
        }
        // Group 6: 8 dots (indices 92-99) after increased gap with 1.5x spacing
        else {
          // Calculate position within group 6
          const groupStartIndex = 92;
          const positionInGroup = i - groupStartIndex;
          // Use 1.5x spacing within this group
          // Increased gap before first red dot
          let baseIndex = (groupStartIndex * dotSpacing) + (13.5 * gapSpacing) + (positionInGroup * dotSpacing * 1.5);
          
          // Add increased gap after last red dot (before first green dot at index 96)
          if (i >= 96) {
            baseIndex += gapSpacing * 0.5; // Add extra half gap
          }
          // Add gap after the second green dot (after index 97)
          if (i >= 98) {
            baseIndex += gapSpacing;
          }
          // Add another gap before CLS (index 99)
          if (i >= 99) {
            baseIndex += gapSpacing;
          }
          
          adjustedIndex = baseIndex;
        }
        
        // Calculate angle based on the actual spacing
        // Account for extra spacing in last group (8 dots with 0.5x extra spacing each) and additional gaps
        const extraSpacingLastGroup = 8 * dotSpacing * 0.5;
        const additionalGaps = 2.5; // gaps before index 96 (0.5), 98 (1) and 99 (1)
        const maxIndex = (numCircles * dotSpacing) + (12.5 * gapSpacing) + extraSpacingLastGroup + (additionalGaps * gapSpacing);
        const t = adjustedIndex / maxIndex;
        const angle = startAngle + t * (endAngle - startAngle);
        
        // Calculate position on elliptical arc
        const circleX = arcCenterX + arcRadiusX * Math.cos(angle);
        const circleY = arcCenterY + arcRadiusY * Math.sin(angle);
        
        // Skip blue lines for specified dots (user counts from 1, code indexes from 0)
        const skipBlueLines = (i >= 34 && i <= 44) || (i >= 68 && i <= 83) || i === 91 || i === 95;
        
        // Create straight line from small blue dot to center of big blue circle
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        
        // Line drawing will be done after position calculations
        
        // Determine if this dot should have an orange companion based on group rules
        let showOrange = false;
        
        // Group 1 (index 0): keep orange
        if (i === 0) showOrange = true;
        // Group 2 (indices 1-44): keep only first 2 orange
        else if (i >= 1 && i < 45 && i < 3) showOrange = true;
        // Group 3 (indices 45-49): keep 2 orange (HSBC and ING)
        else if (i >= 45 && i < 50 && i < 47) showOrange = true;
        // Group 4 (indices 50-83): keep first 6 orange
        else if (i >= 50 && i < 84 && i < 56) showOrange = true;
        // Group 5a (indices 84-86): keep first 2 orange
        else if (i >= 84 && i < 87 && i < 86) showOrange = true;
        // Group 5b (indices 87-91): keep first 2 orange
        else if (i >= 87 && i < 92 && i < 89) showOrange = true;
        // Group 6 (indices 92-99): keep none
        
        // Make paired dots twice as large
        let blueRadius = showOrange ? smallCircleRadius * 2 : smallCircleRadius;
        
        // Make first 4 dots in group 4 (indices 50-53) 50% larger
        if (i >= 50 && i < 54) {
          blueRadius = blueRadius * 1.5;
        }
        
        // Determine color for dots
        let fillColor = '#3b82f6'; // default blue
        let strokeColor = '#1e3a8a'; // default dark blue
        
        // Make first dot blue (inside black circle)
        if (i === 0) {
          fillColor = '#3b82f6'; // blue
          strokeColor = '#1e3a8a'; // keep dark blue border
        }
        
        // Make first 4 dots of last group (indices 92-95) blue with red border
        else if (i >= 92 && i < 96) {
          fillColor = '#3b82f6'; // blue fill
          strokeColor = '#ef4444'; // red border
        }
        
        // Make dots 5-7 in last group (indices 96-98) double size
        else if (i >= 96 && i <= 98) {
          blueRadius = smallCircleRadius * 2;
        }
        
        // Make dots 5, 6, 7 (indices 96-98) blue with green border
        if (i >= 96 && i <= 98) {
          fillColor = '#3b82f6'; // blue fill
          strokeColor = '#4CAF50'; // green border
        }
        
        // Make last dot (index 99) blue with grey outline and much larger
        if (i === 99) {
          fillColor = '#3b82f6'; // blue fill
          strokeColor = '#7FFF00'; // neon lime green border
          blueRadius = smallCircleRadius * 12; // 12x size for text (restored to original)
        }
        
        // For first and last dots, position them at the end of the extended line
        let actualCircleX = circleX;
        let actualCircleY = circleY;
        if (i === 0 || i === 99) {
          // Calculate extended position from new blue circle position
          const blueCircleX = cx;
          const dx = circleX - blueCircleX;
          const dy = circleY - cyBig;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const extensionFactor = (i === 0) ? 1.067 : 1.2; // Reduced for first, normal for CLS
          actualCircleX = blueCircleX + (dx / dist) * dist * extensionFactor;
          actualCircleY = cyBig + (dy / dist) * dist * extensionFactor;
          
          // For first dot, raise it more
          if (i === 0) {
            const blackCircleRadius = smallCircleRadius * 6;
            actualCircleY -= blackCircleRadius * 2; // Move up by 2x radius (full diameter)
          }
          // For CLS dot, lower it by 1.7x the amount
          if (i === 99) {
            const blackCircleRadius = smallCircleRadius * 6;
            actualCircleY += blackCircleRadius * 1.8; // Move down by 1.8x radius
          }
        } else if (i >= 96 && i <= 98) {
          // For green dots, position at the end of their slightly extended lines
          const blueCircleX = cx;
          const dx = circleX - blueCircleX;
          const dy = circleY - cyBig;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const extensionFactor = 1.05; // Same 5% extension as their lines
          actualCircleX = blueCircleX + (dx / dist) * dist * extensionFactor;
          actualCircleY = cyBig + (dy / dist) * dist * extensionFactor;
          // Lower green dots by the same amount as first dot was raised
          const blackCircleRadius = smallCircleRadius * 6;
          actualCircleY += blackCircleRadius; // Move down by radius (half diameter)
        } else if (i >= 92 && i < 96) {
          // For red dots, lower them by half the amount
          const blackCircleRadius = smallCircleRadius * 6;
          actualCircleY += blackCircleRadius / 2; // Move down by half radius (quarter diameter)
        }
        
        // Now draw the line to the actual position
        // All lines start from the center of the blue circle
        const blueCircleX = cx;
        
        if (i === 0 || i === 99) {
          line.setAttribute('x1', blueCircleX);
          line.setAttribute('y1', cyBig);
          line.setAttribute('x2', actualCircleX);
          line.setAttribute('y2', actualCircleY);
        } else if (i >= 96 && i <= 98) {
          // For green dots, line extends to their actual position
          line.setAttribute('x1', blueCircleX);
          line.setAttribute('y1', cyBig);
          line.setAttribute('x2', actualCircleX);
          line.setAttribute('y2', actualCircleY);
        } else if (i >= 92 && i < 96) {
          // For red dots, draw line to their lowered position
          line.setAttribute('x1', blueCircleX);
          line.setAttribute('y1', cyBig);
          line.setAttribute('x2', actualCircleX);
          line.setAttribute('y2', actualCircleY);
        } else {
          // For all other dots
          line.setAttribute('x1', blueCircleX);
          line.setAttribute('y1', cyBig);
          line.setAttribute('x2', actualCircleX);
          line.setAttribute('y2', actualCircleY);
        }
        
        line.setAttribute('stroke', '#3b82f6'); // same blue as circles
        line.setAttribute('stroke-width', '1'); // same thickness as orange lines
        line.setAttribute('opacity', '0.9'); // more visible
        
        if (!skipBlueLines) {
          blueLinesGroup.appendChild(line);
        }
        
        // Create small circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', actualCircleX.toFixed(2));
        circle.setAttribute('cy', actualCircleY.toFixed(2));
        circle.setAttribute('r', blueRadius);
        circle.setAttribute('fill', fillColor);
        circle.setAttribute('stroke', strokeColor);
        // Make border thicker for colored border dots
        let borderWidth = '1';
        if (i >= 92 && i <= 99) {
          borderWidth = '2'; // Thicker border for red, green, and grey bordered dots
        }
        if (i === 99) {
          borderWidth = '6'; // Much thicker grey border for CLS
        }
        circle.setAttribute('stroke-width', borderWidth);
        
        circlesGroup.appendChild(circle);
        
        // Add "CLS" text to last dot
        if (i === 99) {
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', actualCircleX.toFixed(2));
          text.setAttribute('y', actualCircleY.toFixed(2));
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('dominant-baseline', 'middle');
          text.setAttribute('fill', 'white');
          text.setAttribute('font-family', 'Arial, sans-serif');
          text.setAttribute('font-size', '16'); // Larger font for larger circle
          text.setAttribute('font-weight', 'bold');
          text.textContent = 'CLS';
          circlesGroup.appendChild(text);
          
          // Add straight line coming from CLS dot
          const clsLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          
          // Start from left edge of CLS dot
          const clsStartX = actualCircleX - blueRadius;
          const clsStartY = actualCircleY;
          
          // End point to the left - keep original distance
          // The expansion will be handled in the sigmoid curve calculation
          const baseDistance = 87; // Original distance (67 + 20)
          const clsEndX = clsStartX - baseDistance;
          const clsEndY = clsStartY;
          
          clsLine.setAttribute('x1', clsStartX.toFixed(2));
          clsLine.setAttribute('y1', clsStartY.toFixed(2));
          clsLine.setAttribute('x2', clsEndX.toFixed(2));
          clsLine.setAttribute('y2', clsEndY.toFixed(2));
          clsLine.setAttribute('stroke', '#7FFF00'); // neon lime green
          clsLine.setAttribute('stroke-width', '6');
          clsLine.setAttribute('fill', 'none');
          clsLine.setAttribute('stroke-linecap', 'round');
          
          circlesGroup.appendChild(clsLine);
          
          // Store CLS dot line endpoint for sigmoid curve
          if (window.clsEndpoints) {
            window.clsEndpoints.dotLineEndX = clsEndX;
            window.clsEndpoints.dotLineEndY = clsEndY;
          }
        }
        
        // Add "RBA" text next to first dot
        if (i === 0) {
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          // Position text to the right of the black circle
          const blackCircleRadius = smallCircleRadius * 6;
          text.setAttribute('x', (actualCircleX + blackCircleRadius + 5).toFixed(2));
          text.setAttribute('y', actualCircleY.toFixed(2));
          text.setAttribute('text-anchor', 'start');
          text.setAttribute('dominant-baseline', 'middle');
          text.setAttribute('fill', '#991b1b'); // dark red color
          text.setAttribute('font-family', 'Arial, sans-serif');
          text.setAttribute('font-size', '16'); // Same size as CLS text
          text.setAttribute('font-weight', 'bold');
          text.textContent = 'RBA';
          labelsGroup.appendChild(text);
          
          // Add SWIFT PDS rectangle
          
          // Calculate SW point (225 degrees) on the black circle
          const angle225 = 225 * Math.PI / 180; // Convert to radians
          const swPointX = actualCircleX + blackCircleRadius * Math.cos(angle225);
          const swPointY = actualCircleY + blackCircleRadius * Math.sin(angle225);
          
          // Rectangle dimensions
          const rectWidth = 144 * 0.9; // Reduced by 10% (for non-SWIFT boxes)
          const rectHeight = 100 * 0.9 * 0.9; // Reduced by 10% twice
          const swiftRectWidth = rectHeight; // Make SWIFT boxes square (same as height)
          
          // Define ALL measurements FIRST before using them
          const verticalGap = 5; // Gap between rectangles vertically
          const horizontalGap = 30; // Gap between SWIFT box and side rectangles
          const smallRectHeight = (rectHeight - 2 * verticalGap) / 3; // Each is 1/3 height minus gaps
          const austraclearHeight = rectHeight * (2/3); // Reduced by one third
          
          // Calculate base positions - Austraclear at top, SWIFT at bottom
          const baseX = swPointX - rectWidth - 130 - 40; // Extended left by additional 40px for 50% width increase
          
          // Austraclear will be at the top
          // Adjust for height reduction to maintain gaps
          const heightReduction = 100 * 0.1; // 10% of original height
          const verticalShift = 100; // Lower all boxes by 30 pixels
          const austraclearYBase = 450 - smallRectHeight + heightReduction + rectHeight + verticalShift; // Move down by SWIFT PDS height plus shift
          const austraclearSpecificShift = 20; // Additional shift just for Austraclear-related boxes
          const austraclearY = austraclearYBase + 20 + austraclearSpecificShift; // Move Austraclear boxes down more
          
          // SWIFT will be at the bottom (use original position)
          // Calculate SWIFT box X position to align right edge with Austraclear
          const austraclearRightEdge = baseX + rectWidth;
          const swiftRightShift = austraclearRightEdge - swiftRectWidth - baseX;
          const rectX = baseX + swiftRightShift; // Adjusted X to keep right edge aligned
          const swiftSectionDownShift = 25; // Move SWIFT section down by 25 pixels
          const rectY = austraclearYBase + austraclearHeight + verticalGap + smallRectHeight + austraclearHeight - 15 + swiftSectionDownShift; // Moved down
          
          // Store original rectY for later adjustment
          window.swiftGroupOriginalY = rectY;
          
          // Create and configure rectangle using helper function
          const swiftRect = createStyledRect(rectX, rectY, swiftRectWidth, rectHeight, {
            fill: '#bdf7e9', // Light mint green (rgb(189, 247, 233))
            stroke: '#0f766e', // Dark gray matching text color
            strokeWidth: '2'
            // No rx attribute = square corners
          });
          
          // Add to labels group (so it appears on top)
          labelsGroup.appendChild(swiftRect);
          
          // Add text inside SWIFT rectangle with line break
          const swiftRectText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          swiftRectText.setAttribute('x', (rectX + swiftRectWidth/2).toFixed(2));
          swiftRectText.setAttribute('y', (rectY + rectHeight/2).toFixed(2));
          swiftRectText.setAttribute('text-anchor', 'middle');
          swiftRectText.setAttribute('dominant-baseline', 'middle');
          swiftRectText.setAttribute('fill', '#0f766e'); // Dark gray text
          swiftRectText.setAttribute('font-family', 'Arial, sans-serif');
          swiftRectText.setAttribute('font-size', '18');
          swiftRectText.setAttribute('font-weight', 'bold');
          
          // Create two lines of text
          const swiftLine1 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
          swiftLine1.setAttribute('x', (rectX + swiftRectWidth/2).toFixed(2));
          swiftLine1.setAttribute('dy', '-0.5em');
          swiftLine1.textContent = 'SWIFT';
          swiftRectText.appendChild(swiftLine1);
          
          const swiftLine2 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
          swiftLine2.setAttribute('x', (rectX + swiftRectWidth/2).toFixed(2));
          swiftLine2.setAttribute('dy', '1.2em');
          swiftLine2.textContent = 'PDS';
          swiftRectText.appendChild(swiftLine2);
          
          labelsGroup.appendChild(swiftRectText);
          
          // Calculate CLS AUD Y position early (needed for pacs.009 extension)
          const clsAudY = rectY + rectHeight + verticalGap;
          
          // Create smaller rectangles around SWIFT PDS box
          
          // Calculate hvcsX position (needed for left rectangles)
          const hvcsX = rectX - swiftRectWidth - horizontalGap - swiftRectWidth - horizontalGap;
          
          // Three rectangles to the left
          const pacsBoxWidth = 140 * 2/3; // Two-thirds of previous width
          const hvcsShift = 15; // Shift entire SWIFT HVCS box to the right
          const boundingBoxPaddingH = 10; // Horizontal padding
          
          // Store elements to update position later when dvpRtgsX is available
          const pacsElements = [];
          
          // Initialize global storage for SWIFT HVCS elements
          if (!window.swiftHvcsElements) {
            window.swiftHvcsElements = {};
          }
          
          for (let j = 0; j < 3; j++) {
            // Temporary position - will be updated later
            const tempSmallRectX = rectX - horizontalGap - pacsBoxWidth - (horizontalGap + pacsBoxWidth) + (pacsBoxWidth * 0.75) + hvcsShift;
            const smallRectY = rectY + (smallRectHeight + verticalGap) * j;
            
            const smallRect = createStyledRect(tempSmallRectX, smallRectY, pacsBoxWidth, smallRectHeight, {
              fill: '#0f766e', // Dark gray fill (same as SWIFT HVCS)
              stroke: 'none', // No border (same as SWIFT HVCS)
              strokeWidth: '1',
              rx: '12', // More rounded corners
              ry: '12' // More rounded corners
            });
            
            labelsGroup.appendChild(smallRect);
            
            // Add label to each left rectangle
            const pacsLabels = ['pacs.009', 'pacs.008', 'pacs.004'];
            const textPadding = 10;
            const textY = smallRectY + smallRectHeight / 2;
            const pacsText = createStyledText(
              tempSmallRectX + pacsBoxWidth / 2,
              textY,
              pacsLabels[j],
              {
                fill: '#ffffff', // White text (to contrast with dark background)
                fontSize: '11' // Match trade-by-trade font size
              }
            );
            labelsGroup.appendChild(pacsText);
            
            // Store elements to update later
            pacsElements.push({rect: smallRect, text: pacsText});
          }
          
          // Create bounding box around PACS boxes
          // const pacsBoxWidth = 140 * 2/3; // Already declared above
          const smallRectX = rectX - horizontalGap - pacsBoxWidth - (horizontalGap + pacsBoxWidth) + (pacsBoxWidth * 0.75) + hvcsShift;
          const boundingBoxPaddingV = 10; // Vertical padding (unchanged)
          const labelSpace = 64; // Reduced by 6 pixels to raise bottom edge
          
          const boundingBox = createStyledRect(
            smallRectX - boundingBoxPaddingH,
            rectY - boundingBoxPaddingV,
            pacsBoxWidth + boundingBoxPaddingH * 2,
            (smallRectHeight + verticalGap) * 3 - verticalGap + boundingBoxPaddingV * 2 + labelSpace,
            {
              fill: '#bdf7e9', // Same as SWIFT PDS - Light mint green
              stroke: '#0f766e', // Dark gray (same as SWIFT PDS)
              strokeWidth: '2',
              rx: '8', // Rounded corners
              ry: '8' // Rounded corners
            }
          );
          
          // Insert into backgroundGroup to be behind everything
          const backgroundGroup = document.getElementById('background-elements');
          if (backgroundGroup) {
            backgroundGroup.appendChild(boundingBox);
          }
          
          // Add SWIFT HVCS label at bottom of bounding box
          const hvcsLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          hvcsLabel.setAttribute('x', (smallRectX + pacsBoxWidth / 2).toFixed(2));
          hvcsLabel.setAttribute('y', (rectY + (smallRectHeight + verticalGap) * 3 - verticalGap + labelSpace - 30).toFixed(2)); // Label position nudged up by 5 pixels
          hvcsLabel.setAttribute('text-anchor', 'middle');
          hvcsLabel.setAttribute('dominant-baseline', 'middle');
          hvcsLabel.setAttribute('fill', '#0f766e'); // Dark gray text
          hvcsLabel.setAttribute('font-family', 'Arial, sans-serif');
          hvcsLabel.setAttribute('font-size', '18'); // Same size as SWIFT PDS
          hvcsLabel.setAttribute('font-weight', 'bold');
          
          // Create two lines of text for SWIFT HVCS
          const hvcsLine1 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
          hvcsLine1.setAttribute('x', (smallRectX + pacsBoxWidth / 2).toFixed(2));
          hvcsLine1.setAttribute('dy', '-0.5em');
          hvcsLine1.textContent = 'SWIFT';
          hvcsLabel.appendChild(hvcsLine1);
          
          const hvcsLine2 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
          hvcsLine2.setAttribute('x', (smallRectX + pacsBoxWidth / 2).toFixed(2));
          hvcsLine2.setAttribute('dy', '1.2em');
          hvcsLine2.textContent = 'HVCS';
          hvcsLabel.appendChild(hvcsLine2);
          
          labelsGroup.appendChild(hvcsLabel);
          
          // Store SWIFT HVCS elements for later update
          window.swiftHvcsElements.boundingBox = boundingBox;
          window.swiftHvcsElements.pacsElements = pacsElements;
          window.swiftHvcsElements.hvcsLabel = hvcsLabel;
          window.swiftHvcsElements.hvcsLine1 = hvcsLine1;
          window.swiftHvcsElements.hvcsLine2 = hvcsLine2;
          
          // Add path from SWIFT HVCS box going below ESAs to non-ADIs edge and up to ADIs
          // Start from right edge of SWIFT HVCS bounding box, low enough to go under ESAs
          const hvcsBoxRight = (smallRectX - boundingBoxPaddingH) + (pacsBoxWidth + boundingBoxPaddingH * 2);
          // Position line between ESAs bottom and SWIFT HVCS bottom
          const hvcsBoxBottom = rectY + (smallRectHeight + verticalGap) * 3 - verticalGap + boundingBoxPaddingV * 2 + labelSpace;
          const hvcsLineY = hvcsBoxBottom - 25 - 15 + 8; // Was raised by 15, now lowered by 8 (net raise of 7)
          
          // Create initial path (will be updated when we know box positions)
          const initialPath = `M ${hvcsBoxRight} ${hvcsLineY} L ${hvcsBoxRight + 50} ${hvcsLineY}`;
          const hvcsLine = createStyledPath(initialPath, {
            stroke: '#3da88a', // Same color as PACS to SWIFT PDS lines
            strokeWidth: '6', // Same thickness as neon lines
            fill: 'none',
            strokeLinecap: 'round',
            id: 'hvcs-horizontal-line'
          });
          
          // Store start position for later use
          if (!window.hvcsLineData) window.hvcsLineData = {};
          window.hvcsLineData.startX = hvcsBoxRight;
          window.hvcsLineData.startY = hvcsLineY;
          
          // Insert into lineGroup
          const lineGroup = svg.querySelector('g');
          if (lineGroup) {
            lineGroup.appendChild(hvcsLine);
          }
          
          // Store the line for later update
          window.swiftHvcsElements.hvcsLine = hvcsLine;
          
          
          // SWIFT HVCS box removed
          const hvcsY = rectY; // Keep for reference
          
          // Calculate CHESS-RTGS Y position first
          const chessY = austraclearY - smallRectHeight - verticalGap;
          
          // Calculate the gap between pacs.002 and Austraclear
          const pacs002Top = rectY - smallRectHeight - verticalGap;
          const austraclearBottom = austraclearY + austraclearHeight;
          const largerGap = pacs002Top - austraclearBottom;
          
          
          // Add narrow rectangle above Austraclear (CHESS-RTGS)
          const narrowRect = createStyledRect(baseX, chessY, rectWidth, smallRectHeight, {
            fill: '#e8ecf7', // Same as Austraclear
            stroke: '#071f6a', // Same as Austraclear
            strokeWidth: '2'
            // No rx attribute = square corners
          });
          labelsGroup.appendChild(narrowRect);
          
          // Add label for CHESS-RTGS
          const chessText = createStyledText(
            baseX + rectWidth / 2, 
            chessY + smallRectHeight / 2, 
            'CHESS-RTGS',
            {
              fill: '#071f6a', // Dark blue text
              fontSize: '12' // Same as other small boxes
            }
          );
          labelsGroup.appendChild(chessText);
          
          // Add Austraclear box below CHESS-RTGS
          const austraclearRect = createStyledRect(baseX, austraclearY, rectWidth, austraclearHeight, {
            fill: '#e8ecf7', // Light blue-grey interior
            stroke: '#071f6a', // Dark blue border RGB(7,31,106)
            strokeWidth: '2'
            // No rx attribute = square corners like SWIFT box
          });
          labelsGroup.appendChild(austraclearRect);
          
          // Add Austraclear label
          const austraclearText = createStyledText(
            baseX + rectWidth / 2, 
            austraclearY + austraclearHeight / 2, 
            'Austraclear',
            {
              fill: '#071f6a', // Dark blue text matching border
              fontSize: '18' // Same size as SWIFT PDS
            }
          );
          labelsGroup.appendChild(austraclearText);
          
          // Add two boxes to the left of Austraclear
          // Top box: DvP RTGS
          // Calculate position halfway between Austraclear and dark blue boxes
          // Note: moneyMarketX will be calculated later, so we'll update dvpRtgsX after moneyMarketX is defined
          let dvpRtgsX = baseX - rectWidth - horizontalGap; // Initial position
          const dvpRtgsY = chessY; // Align top with CHESS-RTGS
          const dvpRtgsRect = createStyledRect(dvpRtgsX, dvpRtgsY, rectWidth / 2, austraclearHeight, {
            fill: '#e8ecf7', // Same light blue-grey as Austraclear
            stroke: '#071f6a', // Same dark blue border
            strokeWidth: '1',
            rx: '4',
            ry: '4'
          });
          labelsGroup.appendChild(dvpRtgsRect);
          
          // Add label for DvP RTGS
          const dvpRtgsText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          dvpRtgsText.setAttribute('x', (dvpRtgsX + rectWidth / 4).toFixed(2));
          // Adjust Y position to account for two lines
          dvpRtgsText.setAttribute('y', (dvpRtgsY + austraclearHeight / 2 - 5).toFixed(2));
          dvpRtgsText.setAttribute('text-anchor', 'middle');
          // Remove dominant-baseline for multi-line text
          dvpRtgsText.setAttribute('fill', '#071f6a'); // Dark blue text
          dvpRtgsText.setAttribute('font-family', 'Arial, sans-serif');
          dvpRtgsText.setAttribute('font-size', '11'); // Slightly bigger font
          dvpRtgsText.setAttribute('font-weight', 'bold');
          // Split into two lines: "DvP" over "RTGS"
          const dvpTspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
          dvpTspan.setAttribute('x', (dvpRtgsX + rectWidth / 4).toFixed(2));
          dvpTspan.setAttribute('dy', '0');
          dvpTspan.textContent = 'DvP';
          dvpRtgsText.appendChild(dvpTspan);
          
          const rtgsTspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
          rtgsTspan.setAttribute('x', (dvpRtgsX + rectWidth / 4).toFixed(2));
          rtgsTspan.setAttribute('dy', '1em');
          rtgsTspan.textContent = 'RTGS';
          dvpRtgsText.appendChild(rtgsTspan);
          labelsGroup.appendChild(dvpRtgsText);
          
          // Add ASX Settlement as elongated hexagon
          let dvpRtgsCenterX = dvpRtgsX + rectWidth / 4; // Center of reduced-width DvP RTGS (will be updated)
          const chessRtgsCenterX = baseX + rectWidth / 2; // Center of CHESS-RTGS
          const bridgeX = dvpRtgsCenterX; // Left edge at DvP RTGS center
          const bridgeWidth = chessRtgsCenterX - dvpRtgsCenterX; // Width to reach CHESS-RTGS center
          const hexHeight = smallRectHeight * 1.5 * 0.8 * 0.9; // 50% taller, reduced by 20%, then by 10%
          // Temporarily use a placeholder position - will be updated after moneyMarketY is defined
          let bridgeY = chessY - largerGap - hexHeight - 20;
          
          // Create rounded rectangle for ASX Settlement
          const bridgeBox = createStyledRect(bridgeX, bridgeY, bridgeWidth, hexHeight, {
            fill: '#e8ecf7', // Same as CHESS-RTGS
            stroke: '#071f6a', // Same as CHESS-RTGS
            strokeWidth: '2'
            // Square edges - no rx/ry
          });
          labelsGroup.appendChild(bridgeBox);
          
          // Add label for ASX Settlement
          const asxSettlementText = createStyledText(
            bridgeX + bridgeWidth / 2,
            bridgeY + hexHeight / 2,
            'ASX Settlement',
            { fontSize: '12' }
          );
          labelsGroup.appendChild(asxSettlementText);
          
          // Add ASXF hexagon aligned with ASX bounding box top
          // Temporarily use a placeholder position - will be updated after moneyMarketY is defined
          let asxfY = bridgeY - (hexHeight * 2) - verticalGap;
          
          const asxfBox = createStyledRect(bridgeX, asxfY, bridgeWidth, hexHeight * 2, {
            fill: '#e8ecf7', // Same as ASX Settlement
            stroke: '#071f6a', // Same as ASX Settlement
            strokeWidth: '2'
            // Square edges - no rx/ry
          });
          labelsGroup.appendChild(asxfBox);
          
          // Add label for ASXF
          const asxfText = createStyledText(
            bridgeX + bridgeWidth / 2,
            asxfY + hexHeight * 2 / 2,  // Adjusted for taller box
            'ASXF',
            { fontSize: '12' }
          );
          labelsGroup.appendChild(asxfText);
          
          // Bottom box: RTGS / DvP RTGS
          const rtgsY = dvpRtgsY + austraclearHeight + verticalGap;
          const rtgsRect = createStyledRect(dvpRtgsX, rtgsY, rectWidth / 2, smallRectHeight, {
            fill: '#e8ecf7', // Same light blue-grey as Austraclear
            stroke: '#071f6a', // Same dark blue border
            strokeWidth: '1',
            rx: '4',
            ry: '4'
          });
          labelsGroup.appendChild(rtgsRect);
          
          // Add label for RTGS / DvP RTGS
          const rtgsText = createStyledText(
            dvpRtgsX + rectWidth / 4,
            rtgsY + smallRectHeight / 2,
            'RTGS',
            { fontSize: '10' }  // Smaller font
          );
          labelsGroup.appendChild(rtgsText);
          
          // Money Market / Repo box - to the left of RTGS/DvP RTGS, above SWIFT HVCS
          let moneyMarketRect; // Will be created later after position calculations
          const asxGroupShift = -35; // Shift entire ASX group to the left
          const moneyMarketX = hvcsX + asxGroupShift; // Shifted left from SWIFT HVCS
          const moneyMarketY = rtgsY; // Same Y position as RTGS/DvP RTGS
          
          // Update DvP RTGS position to be halfway between Austraclear and dark blue boxes
          const darkBlueRightEdge = moneyMarketX + rectWidth * 1.2; // Right edge of dark blue boxes
          const austraclearLeftEdge = baseX; // Left edge of Austraclear
          const middlePoint = (darkBlueRightEdge + austraclearLeftEdge) / 2;
          dvpRtgsX = middlePoint - (rectWidth / 4); // Center the half-width DvP RTGS box at midpoint
          
          // Shift right by 20 pixels to better align with where Administered Batches will be
          dvpRtgsX += 20;
          
          // Update the DvP RTGS and RTGS box positions
          dvpRtgsRect.setAttribute('x', dvpRtgsX.toFixed(2));
          dvpRtgsText.setAttribute('x', (dvpRtgsX + rectWidth / 4).toFixed(2));
          rtgsRect.setAttribute('x', dvpRtgsX.toFixed(2));
          rtgsText.setAttribute('x', (dvpRtgsX + rectWidth / 4).toFixed(2));
          
          // Add connecting lines between DvP/RTGS boxes and CHESS/Austraclear
          const austraclearLineColor = '#0a4f8f'; // Slightly darker than #071f6a border color
          const austraclearLineWidth = '3';
          
          // Add three lines with same spacing as SWIFT lines
          for (let j = 0; j < 3; j++) {
            // Use same vertical spacing as SWIFT lines
            const lineY = chessY + (smallRectHeight + verticalGap) * j + smallRectHeight / 2;
            const x1 = dvpRtgsX + rectWidth / 2; // Right edge of DvP RTGS (half width)
            const y1 = lineY;
            const x2 = baseX; // Left edge of CHESS-RTGS
            const y2 = lineY;

            const austLine = createStyledLine(x1, y1, x2, y2, {
              stroke: austraclearLineColor,
              strokeWidth: austraclearLineWidth,
              strokeLinecap: 'round',
              strokeDasharray: j === 0 ? '5,5' : undefined
            });
            svg.insertBefore(austLine, labelsGroup);
          }
          
          // Update hexagon positioning with new dvpRtgsX
          dvpRtgsCenterX = dvpRtgsX + rectWidth / 4;
          
          // Define admin box parameters early
          const adminBoxPadding = 10;
          const adminBoxX = dvpRtgsX; // Align with DvP RTGS
          const hexagonWidth = (chessRtgsCenterX - dvpRtgsCenterX) * 0.8; // Reasonable width for inner boxes
          const innerBoxWidth = hexagonWidth * 1.6; // Make 60% wider
          const adminBoxWidth = innerBoxWidth + 2 * adminBoxPadding;
          
          // Position inner boxes inside the admin box
          const innerBoxX = adminBoxX + adminBoxPadding;
          const updatedBridgeX = innerBoxX;
          const updatedBridgeWidth = innerBoxWidth;
          
          // Make the 5 boxes inside admin bounding box same width as Austraclear
          const widerAdminBoxWidth = rectWidth; // Same width as Austraclear
          // Keep right edge in same position, move left edge in
          const currentRightEdge = austraclearLeftEdge - 10; // Current right edge position (10px gap from Austraclear)
          const widerAdminBoxX = currentRightEdge - widerAdminBoxWidth + (widerAdminBoxWidth / 2); // Move right by half width
          
          // Update DvP RTGS and RTGS positions to align with grey bounding box
          const greyBoxLeftEdge = widerAdminBoxX - adminBoxPadding;
          dvpRtgsX = greyBoxLeftEdge;
          dvpRtgsRect.setAttribute('x', dvpRtgsX.toFixed(2));
          dvpRtgsText.setAttribute('x', (dvpRtgsX + rectWidth / 4).toFixed(2));
          // Update tspan elements inside dvpRtgsText
          const dvpTspans = dvpRtgsText.getElementsByTagName('tspan');
          for (let tspan of dvpTspans) {
            tspan.setAttribute('x', (dvpRtgsX + rectWidth / 4).toFixed(2));
          }
          rtgsRect.setAttribute('x', dvpRtgsX.toFixed(2));
          rtgsText.setAttribute('x', (dvpRtgsX + rectWidth / 4).toFixed(2));
          
          // Update SWIFT HVCS position to align with DvP RTGS
          if (window.swiftHvcsElements) {
            // Make SWIFT HVCS same width as NPP/cheques box
            const boundingBoxPaddingHForUpdate = 10; // Same padding as defined in SWIFT section
            const hvcsBoxWidth = swiftRectWidth; // Same width as NPP and cheques boxes
            // Position so left edge aligns with DvP RTGS left edge
            const hvcsBoxX = dvpRtgsX; // Align left edges
            
            // Update bounding box
            // Set X without padding adjustment since we want the visual box to start at hvcsBoxX
            window.swiftHvcsElements.boundingBox.setAttribute('x', hvcsBoxX.toFixed(2));
            // Set width to match NPP/cheques width exactly
            window.swiftHvcsElements.boundingBox.setAttribute('width', hvcsBoxWidth.toFixed(2));
            
            // Update PACS boxes to fit nicely inside with padding
            const internalPadding = 10; // Reduced padding inside SWIFT HVCS box to give PACS boxes more width
            const pacsBoxWidthForUpdate = hvcsBoxWidth - (internalPadding * 2); // PACS boxes fill width minus padding
            const pacsStartX = hvcsBoxX + internalPadding; // Start after padding
            
            window.swiftHvcsElements.pacsElements.forEach((elem, index) => {
              // Position PACS boxes to fill the SWIFT HVCS box width
              elem.rect.setAttribute('x', pacsStartX.toFixed(2));
              elem.rect.setAttribute('width', pacsBoxWidthForUpdate); // Update width to fill
              elem.text.setAttribute('x', (pacsStartX + pacsBoxWidthForUpdate / 2).toFixed(2));
            });
            
            // Update SWIFT HVCS label - center in the wider box
            const hvcsBoxCenterX = hvcsBoxX + hvcsBoxWidth / 2;
            window.swiftHvcsElements.hvcsLabel.setAttribute('x', hvcsBoxCenterX.toFixed(2));
            window.swiftHvcsElements.hvcsLine1.setAttribute('x', hvcsBoxCenterX.toFixed(2));
            window.swiftHvcsElements.hvcsLine2.setAttribute('x', hvcsBoxCenterX.toFixed(2));
            
            // Update line start position
            const hvcsBoxRight = hvcsBoxX + hvcsBoxWidth;
            const path = window.swiftHvcsElements.hvcsLine.getAttribute('d');
            const newPath = path.replace(/M [\d.]+ /, `M ${hvcsBoxRight} `);
            window.swiftHvcsElements.hvcsLine.setAttribute('d', newPath);
            
            // Store the right edge position for later update
            window.swiftHvcsElements.rightEdge = hvcsBoxRight;
          }
          
          // Now update ASX hexagon positions to align with ASX bounding box
          const sssCcpY_forHexagons = moneyMarketY - smallRectHeight - verticalGap;
          const chessEquitiesY_forHexagons = sssCcpY_forHexagons - 2 * smallRectHeight - 4 * verticalGap - 25 + 10 - 5;
          const asxBoxY_forHexagons = chessEquitiesY_forHexagons - 35;
          
          // Update ASXF position to align with ASX bounding box top, lowered by 20px
          const adminBatchesOffset = 2; // Move the whole group down slightly (positive value to lower)
          asxfY = asxBoxY_forHexagons + adminBatchesOffset;
          // Update ASX Settlement position to be below ASXF with same spacing as PEXA-ASXF
          const pexaAsxfGap = verticalGap * 2; // Gap between PEXA and ASXF
          bridgeY = (asxfY - hexHeight) + hexHeight * 2 + pexaAsxfGap; // ASXF is moved up by hexHeight, so adjust
          
          // Update the rounded rectangles with new positions
          bridgeBox.setAttribute('x', widerAdminBoxX);
          bridgeBox.setAttribute('width', widerAdminBoxWidth);
          
          asxfBox.setAttribute('x', widerAdminBoxX);
          asxfBox.setAttribute('width', widerAdminBoxWidth);
          
          // Update box positions
          bridgeBox.setAttribute('y', bridgeY);
          asxfBox.setAttribute('y', asxfY - hexHeight - (verticalGap * 2)); // Move ASXF up by half its original height plus the gap
          
          // Update text positions - ASX Settlement text should be centered in its box
          const asxSettlementBoxY = bridgeY; // Use the actual bridgeY value
          const asxSettlementBoxHeight = hexHeight; // Use the actual height
          asxSettlementText.setAttribute('x', (widerAdminBoxX + widerAdminBoxWidth / 2).toFixed(2));
          asxSettlementText.setAttribute('y', (asxSettlementBoxY + asxSettlementBoxHeight / 2).toFixed(2));
          asxSettlementText.setAttribute('text-anchor', 'middle'); // Ensure horizontal centering
          asxSettlementText.setAttribute('dominant-baseline', 'middle'); // Ensure vertical centering
          asxfText.setAttribute('x', (widerAdminBoxX + widerAdminBoxWidth / 2).toFixed(2));
          asxfText.setAttribute('y', ((asxfY - hexHeight - (verticalGap * 2)) + (hexHeight * 2 + (verticalGap * 2)) / 2).toFixed(2)); // Center in moved taller box
          
          // Calculate gap between ASX Settlement and ASXF
          const asxfBoxTop = asxfY - hexHeight - (verticalGap * 2); // Top of ASXF box
          const asxSettlementTop = bridgeY; // Top of ASX Settlement box
          const gapBetweenAsxAndAsxf = asxSettlementTop - (asxfBoxTop + (hexHeight * 2 + (verticalGap * 2)));
          console.log('Gap between ASX Settlement and ASXF:', gapBetweenAsxAndAsxf);
          
          // Use the same gap for all boxes above ASXF
          const standardGap = gapBetweenAsxAndAsxf;
          
          // Create PEXA box above ASXF with same gap
          const pexaY = asxfBoxTop - standardGap - hexHeight;
          const pexaBox = createStyledRect(widerAdminBoxX, pexaY, widerAdminBoxWidth, hexHeight, {
            fill: '#FDE2F9',
            stroke: 'rgb(179,46,161)',
            strokeWidth: '2'
          });
          labelsGroup.appendChild(pexaBox);
          
          const pexaText = createStyledText(
            widerAdminBoxX + widerAdminBoxWidth / 2,
            pexaY + hexHeight / 2,
            'PEXA',
            {
              fill: 'rgb(179,46,161)',
              fontSize: '12'
            }
          );
          labelsGroup.appendChild(pexaText);
          
          // Create eftpos box above PEXA with same gap
          const eftposY = pexaY - standardGap - hexHeight;
          const eftposBox = createStyledRect(widerAdminBoxX, eftposY, widerAdminBoxWidth, hexHeight, {
            fill: '#D8D0F0',
            stroke: 'rgb(100,80,180)',
            strokeWidth: '2'
          });
          labelsGroup.appendChild(eftposBox);
          
          const eftposText = createStyledText(
            widerAdminBoxX + widerAdminBoxWidth / 2,
            eftposY + hexHeight / 2,
            'eftpos',
            {
              fill: 'rgb(80,60,150)',
              fontSize: '12'
            }
          );
          labelsGroup.appendChild(eftposText);
          
          // Create Mastercard box above eftpos with same gap
          const mastercardY = eftposY - standardGap - hexHeight;
          const mastercardBox = createStyledRect(widerAdminBoxX, mastercardY, widerAdminBoxWidth, hexHeight, {
            fill: 'rgb(255,230,230)',
            stroke: 'rgb(216,46,43)',
            strokeWidth: '2'
          });
          labelsGroup.appendChild(mastercardBox);
          
          const mastercardText = createStyledText(
            widerAdminBoxX + widerAdminBoxWidth / 2,
            mastercardY + hexHeight / 2,
            'Mastercard',
            {
              fill: 'rgb(216,46,43)',
              fontSize: '12'
            }
          );
          labelsGroup.appendChild(mastercardText);
          
          // Store positions for later use
          if (!window.hexagonPositions) {
            window.hexagonPositions = {};
          }
          window.hexagonPositions.pexaX = updatedBridgeX;
          window.hexagonPositions.pexaY = pexaY;
          window.hexagonPositions.pexaWidth = updatedBridgeWidth;
          window.hexagonPositions.asxfX = updatedBridgeX;
          window.hexagonPositions.asxfY = asxfY - hexHeight - (verticalGap * 2);
          window.hexagonPositions.asxfWidth = updatedBridgeWidth;
          window.hexagonPositions.hexHeight = hexHeight;
          window.hexagonPositions.asxfHeight = hexHeight * 2 + (verticalGap * 2);
          window.hexagonPositions.eftposY = eftposY;
          window.hexagonPositions.mastercardY = mastercardY;
          window.hexagonPositions.mastercardX = widerAdminBoxX;
          window.hexagonPositions.mastercardWidth = widerAdminBoxWidth;
          
          // Store bridge positions for later use
          if (!window.bridgePositions) {
            window.bridgePositions = {};
          }
          window.bridgePositions.bridgeY = bridgeY;
          window.bridgePositions.bridgeX = updatedBridgeX;
          window.bridgePositions.bridgeWidth = updatedBridgeWidth;
          
          // Store that we need to create ASX to HVCS line later
          if (!window.asxBoxData) window.asxBoxData = {};
          window.asxBoxData.needsLine = true;
          
          // Store CLS endpoints for sigmoid curve
          if (!window.clsEndpoints) {
            window.clsEndpoints = {};
          }
          
          
          // Add five square rectangles above Administered Batches
          const squareRectGap = verticalGap * 2 * 0.9 * (2/3); // Reduced by one third (multiplied by 2/3)
          
          // Center the boxes above the admin box
          const adminCenterX = adminBoxX + adminBoxWidth / 2;
          const narrowBoxWidth = updatedBridgeWidth * 2/3 * 1.2; // Already reduced width, now 20% wider
          const narrowBoxX = adminCenterX - narrowBoxWidth / 2; // Center the narrow boxes
          
          // Create reduced width versions for specific boxes - reduce by 25%
          const adminBatchesLeftEdge = widerAdminBoxX - adminBoxPadding; // Left edge of administered batches box
          const reducedNarrowBoxWidth = widerAdminBoxWidth / 2; // Half the width of Mastercard box
          // Align left edge with Administered Batches box left edge
          const reducedNarrowBoxX = adminBatchesLeftEdge; // Align with administered batches left edge
          
          // Calculate Y position based on mastercardY
          const realAdminBoxY = mastercardY - adminBoxPadding;
          const boxHeight = hexHeight * 1.1 * 0.9 * 0.9; // Standard box height reduced by 10%
          const reducedBoxHeight = boxHeight * 0.8; // 20% reduced height for main boxes
          
          // Calculate cshdY first (we'll calculate cecsY based on this)
          const groupShift = boxHeight / 2; // Move entire group down by half box height
          const cshdY = realAdminBoxY - reducedBoxHeight * 1.5 - boxHeight - squareRectGap * 2 - 20 + groupShift; // Position CSHD - moved down by half box height
          
          // CECS (IAC) - position below CSHD with same gap as CSHD-BECS
          const cecsY = cshdY + boxHeight + squareRectGap; // Same gap as between CSHD and BECS
          
          const cshdBox = createStyledRect(reducedNarrowBoxX, cshdY, reducedNarrowBoxWidth, boxHeight, {
            fill: '#FFD2B8', // Light salmon (intermediate orange)
            stroke: '#FF6347', // Tomato (intermediate orange border)
            strokeWidth: '2',
            rx: '8',
            ry: '8'
          });
          labelsGroup.appendChild(cshdBox);
          
          // CSHD label
          const cshdText = createStyledText(
            reducedNarrowBoxX + reducedNarrowBoxWidth / 2, 
            cshdY + boxHeight / 2, 
            'CSHD',
            {
              fill: '#CD5C5C' // Indian red text
            }
          );
          labelsGroup.appendChild(cshdText);
          const cecsBox = createStyledRect(reducedNarrowBoxX, cecsY, reducedNarrowBoxWidth, boxHeight, {
            fill: '#ffe4b5', // Peach/cream fill
            stroke: '#ff8c00', // Dark orange border
            strokeWidth: '2',
            rx: '8',
            ry: '8'
          });
          labelsGroup.appendChild(cecsBox);
          
          // CECS label
          const cecsText = createStyledText(
            reducedNarrowBoxX + reducedNarrowBoxWidth / 2, 
            cecsY + boxHeight / 2, 
            'IAC (CECS)',
            {
              fill: '#d2691e' // Chocolate/dark peach text
            }
          );
          labelsGroup.appendChild(cecsText);
          
          // BECS (third from bottom)
          const becsY = cshdY - boxHeight - squareRectGap; // Above CSHD (automatically shifted with CSHD)
          const becsBox = createStyledRect(reducedNarrowBoxX, becsY, reducedNarrowBoxWidth, boxHeight, {
            fill: '#ffc0cb', // Pink fill (keeping current)
            stroke: '#8B0000', // Dark red border
            strokeWidth: '2',
            rx: '8',
            ry: '8'
          });
          labelsGroup.appendChild(becsBox);
          
          // BECS label
          const becsText = createStyledText(
            reducedNarrowBoxX + reducedNarrowBoxWidth / 2,
            becsY + boxHeight / 2,
            'BECS',
            {
              fill: '#8b0000', // Dark red text
              fontSize: '12'
            }
          );
          labelsGroup.appendChild(becsText);
          
          // APCS (fourth from bottom)
          const apcsY = becsY - boxHeight - squareRectGap;
          const apcsBox = createStyledRect(reducedNarrowBoxX, apcsY, reducedNarrowBoxWidth, boxHeight, {
            fill: '#F0E8EC', // Lighter grey-pink
            stroke: '#A8998C', // Darker smoked oyster border
            strokeWidth: '2',
            rx: '8',
            ry: '8'
          });
          labelsGroup.appendChild(apcsBox);
          
          // APCS label
          const apcsText = createStyledText(
            reducedNarrowBoxX + reducedNarrowBoxWidth / 2,
            apcsY + boxHeight / 2,
            'APCS',
            {
              fill: '#6B5D54', // Dark smoked oyster text theme
              fontSize: '12'
            }
          );
          labelsGroup.appendChild(apcsText);
          
          // Add three smaller boxes to the left of APCS
          const smallBoxHeight = boxHeight * 0.5; // 50% height
          const smallBoxGap = 5; // Small gap between boxes
          const smallBoxWidth = narrowBoxWidth * 2/3; // Make boxes 2/3 as wide
          
          // Center APCR (middle box) with APCS middle
          const apcsCenterY = apcsY + boxHeight / 2;
          const apcrCenterY = apcsCenterY; // Align APCR center with APCS center
          // APCR top Y = apcrCenterY - smallBoxHeight/2
          // APCR is at position smallBoxStartY + smallBoxHeight + smallBoxGap
          // So: smallBoxStartY + smallBoxHeight + smallBoxGap = apcrCenterY - smallBoxHeight/2
          // Therefore: smallBoxStartY = apcrCenterY - smallBoxHeight/2 - smallBoxHeight - smallBoxGap
          const smallBoxStartY = apcrCenterY - smallBoxHeight/2 - smallBoxHeight - smallBoxGap;
          const smallBoxX = adminBoxX - smallBoxWidth + 2; // Move small boxes right (closer to narrow boxes)
          

          
          // GABS (grey with black border) - top
          // Keep bottom edge fixed by adjusting Y position for increased height
          const gabsBottomY = apcsY - squareRectGap; // Bottom edge position
          const gabsY = gabsBottomY - boxHeight; // Top edge raised to accommodate full height
          const gabsBox = createStyledRect(reducedNarrowBoxX, gabsY, reducedNarrowBoxWidth, boxHeight, {
            fill: '#000000', // Black fill (like BDF)
            stroke: '#8B0000', // Dark red border
            strokeWidth: '2',
            rx: '8',
            ry: '8'
          });
          labelsGroup.appendChild(gabsBox);
          
          // GABS label
          const gabsText = createStyledText(
            reducedNarrowBoxX + reducedNarrowBoxWidth / 2,
            gabsY + boxHeight / 2,
            'GABS',
            {
              fill: '#FFFFFF', // White text
              fontSize: '12'
            }
          );
          labelsGroup.appendChild(gabsText);
          
          // Add NPP box aligned with RBA dot at top
          // Position NPP much higher to align with RBA area
          const nppY = 150 - (rectHeight * 2) + (rectHeight * 0.3) + (rectHeight / 6); // Move down by 1/6 instead of 1/3
          const nppBox = createStyledRect(rectX, nppY, swiftRectWidth, rectHeight, {
            fill: '#D8D0F0', // Same as eftpos - Darker purple interior
            stroke: 'rgb(100,80,180)', // Same as eftpos - Darker purple border
            strokeWidth: '2'
          });
          labelsGroup.appendChild(nppBox);
          
          // Add NPP label
          const nppText = createStyledText(
            rectX + swiftRectWidth / 2,
            nppY + rectHeight / 2,
            'NPP',
            {
              fill: 'rgb(80,60,150)', // Same as eftpos - Darker purple text
              fontSize: '18' // Same size as SWIFT PDS
            }
          );
          labelsGroup.appendChild(nppText);
          
          // Add sigmoid curve from NPP to FSS circle
          const nppToFssPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          // NPP right edge and center Y
          const nppRightX = rectX + swiftRectWidth;
          const nppCenterY = nppY + rectHeight / 2;
          // FSS circle position (orange circle)
          const fssCenterX = 300;
          const fssCenterY = 222;
          
          // Create sigmoid curve that stops at the edge of FSS circle
          const fssRadius = 48; // Outer radius of FSS circle
          const fssLeftEdgeX = fssCenterX - fssRadius;
          const midX = (nppRightX + fssLeftEdgeX) / 2;
          // Connect to lower part of FSS circle (70% down from center)
          const fssConnectionY = fssCenterY + fssRadius * 0.5; // Lower connection point
          const sigmoidData = `M ${nppRightX} ${nppCenterY} 
                              C ${midX} ${nppCenterY},
                                ${midX} ${fssConnectionY},
                                ${fssLeftEdgeX} ${fssConnectionY}`;
          
          const nppToFssPathStyled = createStyledPath(sigmoidData, {
            stroke: '#3da88a',
            strokeWidth: '6',
            fill: 'none'
          });
          // Insert the path at the beginning so it appears behind all circles
          const smallGroup = document.getElementById('small-group');
          svg.insertBefore(nppToFssPathStyled, smallGroup);
          
                  
          // Add APCE, APCR, and ACPT boxes where Cheques was
          const apceApcrAcptGap = 5; // Gap between the three boxes
          const singleSmallBoxWidth = narrowBoxWidth / 3; // Each box is 1/3 width (same as before)
          const apceApcrAcptHeight = boxHeight; // Same height as other boxes
          const nppBottomY = nppY + rectHeight; // Bottom of NPP
          const smallBoxY = nppBottomY - apceApcrAcptHeight; // Align bottom with NPP bottom
          
          // Calculate Cheques box width and position first
          const chequesBoxWidth = swiftRectWidth; // Same width as NPP box
          const chequesBoxX = reducedNarrowBoxX - chequesBoxWidth; // Right edge aligns with GABS left edge
          
          // Recalculate box widths to fit within cheques box
          const totalGapWidth = apceApcrAcptGap * 2; // Two gaps between three boxes
          const availableWidth = chequesBoxWidth - totalGapWidth;
          const newSingleSmallBoxWidth = availableWidth / 3; // Each box gets 1/3 of available width
          
          // Calculate positions to align with moved Cheques box
          const apceX = chequesBoxX; // APCE left edge aligns with Cheques left edge
          const apcrX = apceX + newSingleSmallBoxWidth + apceApcrAcptGap; // APCR to the right with gap
          const acptX = apcrX + newSingleSmallBoxWidth + apceApcrAcptGap; // ACPT to the right with gap
          
          // Store APCR right edge for ASX bounding box alignment
          window.apcrRightEdge = apcrX + newSingleSmallBoxWidth;
          
          // APCE box (leftmost)
          const apceBox = createStyledRect(apceX, smallBoxY, newSingleSmallBoxWidth, apceApcrAcptHeight, {
            fill: '#F0E8EC', // Lighter grey-pink (same as APCS)
            stroke: '#A8998C', // Darker smoked oyster border
            strokeWidth: '2',
            rx: '8',
            ry: '8'
          });
          labelsGroup.appendChild(apceBox);
          
          // APCE text
          const apceText = createStyledText(
            apceX + newSingleSmallBoxWidth / 2, 
            smallBoxY + apceApcrAcptHeight / 2, 
            'APCE',
            {
              fill: '#6B5D54', // Dark smoked oyster text (same as APCS)
              fontSize: '10'
            }
          );
          labelsGroup.appendChild(apceText);
          
          // APCR box (middle)
          const apcrBox = createStyledRect(apcrX, smallBoxY, newSingleSmallBoxWidth, apceApcrAcptHeight, {
            fill: '#F0E8EC', // Lighter grey-pink (same as APCS)
            stroke: '#A8998C',
            strokeWidth: '2',
            rx: '8',
            ry: '8'
          });
          labelsGroup.appendChild(apcrBox);
          
          // APCR text
          const apcrText = createStyledText(
            apcrX + newSingleSmallBoxWidth / 2, 
            smallBoxY + apceApcrAcptHeight / 2, 
            'APCR',
            {
              fill: '#6B5D54', // Dark smoked oyster text (same as APCS)
              fontSize: '10'
            }
          );
          labelsGroup.appendChild(apcrText);
          
          // ACPT box (rightmost)
          const acptBox = createStyledRect(acptX, smallBoxY, newSingleSmallBoxWidth, apceApcrAcptHeight, {
            fill: '#F0E8EC', // Lighter grey-pink (same as APCS)
            stroke: '#A8998C',
            strokeWidth: '2',
            rx: '8',
            ry: '8'
          });
          labelsGroup.appendChild(acptBox);
          
          // ACPT text
          const acptText = createStyledText(
            acptX + newSingleSmallBoxWidth / 2, 
            smallBoxY + apceApcrAcptHeight / 2, 
            'ACPT',
            {
              fill: '#6B5D54', // Dark smoked oyster text (same as APCS)
              fontSize: '10'
            }
          );
          labelsGroup.appendChild(acptText);
          
          // Add Cheques box above the three small boxes
          const chequesBoxGap = 10; // Gap between Cheques and the small boxes below
          // chequesBoxX and chequesBoxWidth already calculated above
          const chequesBoxHeight = boxHeight; // Same height as other boxes
          const chequesBoxY = smallBoxY - chequesBoxHeight - chequesBoxGap; // Above the small boxes
          
          // Create filled Cheques box
          const chequesBox = createStyledRect(chequesBoxX, chequesBoxY, chequesBoxWidth, chequesBoxHeight, {
            fill: '#6B5D54', // Dark smoked oyster text color (same as APCS text)
            stroke: 'none',
            rx: '5',
            ry: '5'
          });
          labelsGroup.appendChild(chequesBox);
          
          // Add Cheques text
          const chequesText = createStyledText(
            chequesBoxX + chequesBoxWidth / 2, 
            chequesBoxY + chequesBoxHeight / 2, 
            'Cheques',
            {
              fill: '#ffffff', // White text
              fontSize: '11'
            }
          );
          labelsGroup.appendChild(chequesText);
          
          // Add BECG and BECN boxes to the left of the small boxes
          const becgBecnGap = 5; // Small gap between BECG and BECN
          // Calculate width so total of BECN + gap + BECG equals Cheques width
          const becgBecnWidth = (chequesBoxWidth - becgBecnGap) / 2; // Each box gets half of remaining width
          const becgBecnHeight = boxHeight; // Same height as APCS
          const becgX = apceX - becgBecnWidth - 10; // BECG to the left of APCE with small gap
          const becnX = becgX - becgBecnWidth - becgBecnGap; // BECN to the left of BECG with gap
          
          // Align vertically with Cheques box
          const becgY = chequesBoxY; // Same Y position as Cheques
          const becnY = chequesBoxY; // Same Y position as Cheques
          
          // BECG box
          const becgBox = createStyledRect(becgX, becgY, becgBecnWidth, becgBecnHeight, {
            fill: '#ffc0cb', // Same pink as BECS
            stroke: '#8B0000', // Dark red border
            strokeWidth: '1.5',
            rx: '4',
            ry: '4'
          });
          labelsGroup.appendChild(becgBox);
          
          const becgText = createStyledText(
            becgX + becgBecnWidth / 2,
            becgY + becgBecnHeight / 2,
            'BECG',
            { fill: '#8b0000', fontSize: '10' }
          );
          labelsGroup.appendChild(becgText);
          
          // BECN box
          const becnBox = createStyledRect(becnX, becnY, becgBecnWidth, becgBecnHeight, {
            fill: '#ffc0cb', // Same pink as BECS
            stroke: '#8B0000', // Dark red border
            strokeWidth: '1.5',
            rx: '4',
            ry: '4'
          });
          labelsGroup.appendChild(becnBox);
          
          const becnText = createStyledText(
            becnX + becgBecnWidth / 2,
            becnY + becgBecnHeight / 2,
            'BECN',
            { fill: '#8b0000', fontSize: '10' }
          );
          labelsGroup.appendChild(becnText);
          
          // Add DE box above BECN and BECG
          const deBoxGap = 10; // Gap between DE and boxes below
          const deBoxX = becnX; // Align left edge with BECN
          const deBoxWidth = (becgX + becgBecnWidth) - becnX; // Span from BECN left to BECG right
          const deBoxHeight = boxHeight; // Same height as Cheques
          const deBoxY = chequesBoxY - deBoxHeight - deBoxGap; // Above BECN/BECG
          
          // Create filled DE box
          const deBox = createStyledRect(deBoxX, deBoxY, deBoxWidth, deBoxHeight, {
            fill: '#8B0000', // Dark red (same as BECS border)
            stroke: 'none',
            rx: '5',
            ry: '5'
          });
          labelsGroup.appendChild(deBox);
          
          // Add DE text
          const deText = createStyledText(
            deBoxX + deBoxWidth / 2,
            deBoxY + deBoxHeight / 2,
            'DE',
            { fill: '#ffffff', fontSize: '14' }
          );
          labelsGroup.appendChild(deText);
          
          // Store ASX boxes alignment for later use
          // First calculate the ASX bounding box dimensions
          const asxBoxPadding = 10; // Padding for ASX bounding box
          const preliminaryAsxBoxX = moneyMarketX - 10 - 60; // Preliminary X position
          const preliminaryAsxBoxWidth = window.apcrRightEdge ? 
            window.apcrRightEdge - preliminaryAsxBoxX : 
            rectWidth * 1.2 + 20;
          
          // Store ASX boxes alignment for later use
          // Calculate to properly center within the ASX bounding box that will be created
          // The ASX box will be expanded 10% to the left, so account for that
          const asxExpansionFactor = 0.10;
          const futureAsxBoxX = (moneyMarketX - 10 - 60) - ((window.apcrRightEdge - (moneyMarketX - 10 - 60)) * asxExpansionFactor);
          const futureAsxBoxWidth = (window.apcrRightEdge - (moneyMarketX - 10 - 60)) * (1 + asxExpansionFactor);
          
          // Set interior boxes to fill the ASX box with equal margins
          const interiorPadding = 15; // Padding inside ASX box
          window.asxBoxesAlignment = {
            leftEdge: futureAsxBoxX + interiorPadding,
            rightEdge: futureAsxBoxX + futureAsxBoxWidth - interiorPadding,
            width: futureAsxBoxWidth - (2 * interiorPadding)
          };
          
          // Update SWIFT HVCS position to align with ASX bounding box
          if (window.swiftHvcsElements && window.swiftHvcsElements.rightEdge && window.asxBoxRightEdge) {
            // Align left edge with ASX bounding box right edge
            const hvcsBoxX_aligned = window.asxBoxRightEdge;
            // Calculate new width to maintain the original right edge
            const hvcsBoxWidth_aligned = window.swiftHvcsElements.rightEdge - hvcsBoxX_aligned;
            
            // Update bounding box position and width
            window.swiftHvcsElements.boundingBox.setAttribute('x', hvcsBoxX_aligned.toFixed(2));
            window.swiftHvcsElements.boundingBox.setAttribute('width', hvcsBoxWidth_aligned.toFixed(2));
            
            // Update PACS boxes inside with padding
            const internalPadding_aligned = 10; // Padding inside SWIFT HVCS box
            const pacsBoxWidth_aligned = hvcsBoxWidth_aligned - (internalPadding_aligned * 2);
            const pacsStartX_aligned = hvcsBoxX_aligned + internalPadding_aligned;
            
            window.swiftHvcsElements.pacsElements.forEach((elem) => {
              elem.rect.setAttribute('x', pacsStartX_aligned.toFixed(2));
              elem.rect.setAttribute('width', pacsBoxWidth_aligned);
              elem.text.setAttribute('x', (pacsStartX_aligned + pacsBoxWidth_aligned / 2).toFixed(2));
            });
            
            // Update SWIFT HVCS label position (center in wider box)
            const hvcsBoxCenterX_aligned = hvcsBoxX_aligned + hvcsBoxWidth_aligned / 2;
            window.swiftHvcsElements.hvcsLabel.setAttribute('x', hvcsBoxCenterX_aligned.toFixed(2));
            window.swiftHvcsElements.hvcsLine1.setAttribute('x', hvcsBoxCenterX_aligned.toFixed(2));
            window.swiftHvcsElements.hvcsLine2.setAttribute('x', hvcsBoxCenterX_aligned.toFixed(2));
            
            // Line position stays the same since right edge is unchanged
          }
          
          // Add lines from APCS to all three small boxes
          const apcsLeftX = reducedNarrowBoxX; // Left side of APCS
          const smallBoxesBottomY = smallBoxY + apceApcrAcptHeight; // Bottom of small boxes
          // apcsCenterY already declared above
          
          // Calculate positions for three lines on APCS
          const apcsTopThird = apcsY + boxHeight * 0.25;
          const apcsMiddle = apcsY + boxHeight * 0.5;
          const apcsBottomThird = apcsY + boxHeight * 0.75;
          
          // Line to APCE (leftmost - connects to bottom)
          const apceCenterX = apceX + singleSmallBoxWidth / 2;
          const apcsToApceData = `M ${apcsLeftX} ${apcsBottomThird}
                                  Q ${apceCenterX} ${apcsBottomThird} ${apceCenterX} ${smallBoxesBottomY}`;
          const apcsToApcePath = createStyledPath(apcsToApceData, {
            stroke: '#6B5D54',
            strokeWidth: '1.5',
            fill: 'none',
            strokeLinejoin: 'round',
            strokeLinecap: 'round'
          });
          labelsGroup.appendChild(apcsToApcePath);
          
          // Line to APCR (middle)
          const apcrCenterX = apcrX + singleSmallBoxWidth / 2;
          const apcsToApcrData = `M ${apcsLeftX} ${apcsMiddle}
                                  Q ${apcrCenterX} ${apcsMiddle} ${apcrCenterX} ${smallBoxesBottomY}`;
          const apcsToApcrPath = createStyledPath(apcsToApcrData, {
            stroke: '#6B5D54',
            strokeWidth: '1.5',
            fill: 'none',
            strokeLinejoin: 'round',
            strokeLinecap: 'round'
          });
          labelsGroup.appendChild(apcsToApcrPath);
          
          // Line to ACPT (rightmost - connects to top)
          const acptCenterX = acptX + singleSmallBoxWidth / 2;
          const apcsToAcptData = `M ${apcsLeftX} ${apcsTopThird}
                                  Q ${acptCenterX} ${apcsTopThird} ${acptCenterX} ${smallBoxesBottomY}`;
          const apcsToAcptPath = createStyledPath(apcsToAcptData, {
            stroke: '#6B5D54',
            strokeWidth: '1.5',
            fill: 'none',
            strokeLinejoin: 'round',
            strokeLinecap: 'round'
          });
          labelsGroup.appendChild(apcsToAcptPath);
          
          // Add curved lines from bottom of BECG and BECN to left side of BECS
          const becsLeftX = reducedNarrowBoxX; // Left side of BECS
          const becsHeight = boxHeight; // Height of BECS
          const becsY1Third = becsY + becsHeight / 3; // 1/3 down from top
          const becsY2Third = becsY + becsHeight * 2 / 3; // 2/3 down from top
          
          const becgBottomY = becgY + becgBecnHeight; // Bottom of BECG
          const becgCenterX = becgX + becgBecnWidth / 2; // Center X of BECG
          const becnBottomY = becnY + becgBecnHeight; // Bottom of BECN
          const becnCenterX = becnX + becgBecnWidth / 2; // Center X of BECN
          
          // Lines from BECS horizontal then straight up to BECG and BECN
          const becsRedColor = '#8B0000'; // Dark red as BECS border
          
          // Line from BECS to BECG - horizontal then up
          // L shape that goes left then curves UP  
          const becgRadius = 20;
          const becgCurveData = `M ${becsLeftX} ${becsY1Third}
                                Q ${becgCenterX} ${becsY1Third} ${becgCenterX} ${becgBottomY}`;
          
          const becsToeBecgPath = createStyledPath(becgCurveData, {
            stroke: becsRedColor,
            strokeWidth: '2',
            fill: 'none',
            strokeLinejoin: 'round',
            strokeLinecap: 'round'
          });
          labelsGroup.appendChild(becsToeBecgPath);
          
          // Line from BECS to BECN - horizontal then up
          // L shape that goes left then curves UP
          const becnRadius = 20;
          const becnCurveData = `M ${becsLeftX} ${becsY2Third}
                                Q ${becnCenterX} ${becsY2Third} ${becnCenterX} ${becnBottomY}`;
          
          const becsToeBecnPath = createStyledPath(becnCurveData, {
            stroke: becsRedColor,
            strokeWidth: '2',
            fill: 'none',
            strokeLinejoin: 'round',
            strokeLinecap: 'round'
          });
          labelsGroup.appendChild(becsToeBecnPath);
          

          
          
          // Add dark grey box around all the rounded rectangles (Administered Batches)
          const adminBoxY = mastercardY - adminBoxPadding; // Start above Mastercard
          // Height to encompass all boxes plus space for label
          const adminBoxHeight = (bridgeY + hexHeight) - mastercardY + 2 * adminBoxPadding + 20; // Slightly more bottom padding
          
          const adminBatchesBox = createStyledRect(widerAdminBoxX - adminBoxPadding, adminBoxY, widerAdminBoxWidth + 2 * adminBoxPadding, adminBoxHeight, {
            fill: '#3B3B3B', // Darker grey
            stroke: '#1B1B1B', // Very dark grey border
            strokeWidth: '2',
            rx: '10',
            ry: '10'
          });
          adminBatchesBox.setAttribute('opacity', '0.8');
          // Store admin box to insert later - we need it behind everything
          window.adminBatchesBoxElement = adminBatchesBox;
          
          // Draw lines to blue circle BEFORE other elements so they appear behind
          // Insert at the beginning of SVG
          const redLinesGroup = svg;
          if (redLinesGroup && window.hexagonPositions) {
            // First draw magenta lines from PEXA and ASXF
            const magentaLineColor = '#DC143C'; // Bright blood red
            const hexagonLines = [
              // From left edge of PEXA (changed from right edge)
              { x: window.hexagonPositions.pexaX, 
                y: window.hexagonPositions.pexaY + window.hexagonPositions.hexHeight / 2, label: 'PEXA bottom' },
              // From left edge of ASXF (changed from right edge)
              { x: window.hexagonPositions.asxfX, 
                y: window.hexagonPositions.asxfY + window.hexagonPositions.asxfHeight / 4, label: 'ASXF top' },
              // From left edge of ASXF (changed from right edge)
              { x: window.hexagonPositions.asxfX, 
                y: window.hexagonPositions.asxfY + 3 * window.hexagonPositions.asxfHeight / 4, label: 'ASXF bottom' }
            ];
          
            // Get big blue circle position
            const bigCircleX = 300; // cx value
            const bigCircleY = 450; // cyBig value
            const bigCircleRadius = 113; // rBig value
            
            hexagonLines.forEach((source, i) => {
              // Calculate angle to blue circle
              const dx = bigCircleX - source.x;
              const dy = bigCircleY - source.y;
              
              // Calculate end point on closest edge of circle
              const angleToCenter = Math.atan2(dy, dx);
              
              // End point is on circle edge in direction of source
              const endX = bigCircleX - bigCircleRadius * Math.cos(angleToCenter);
              const endY = bigCircleY - bigCircleRadius * Math.sin(angleToCenter);
              
              // Control points for J-shaped curve (same as SWIFT lines)
              const distX = endX - source.x;
              const distY = endY - source.y;
              
              // J-shape: go straight right, then curve down/up to target
              const controlX1 = source.x + Math.abs(distX) * 0.7;
              const controlY1 = source.y;
              const controlX2 = endX - 10;
              const controlY2 = source.y + distY * 0.5;
              
              // Create double line effect with two thin parallel lines
              const lineGap = 2.5; // Gap between parallel lines
              const thinStroke = 1.5; // Width of each thin line
              
              // Calculate perpendicular offset for parallel lines
              const angle = Math.atan2(source.y - endY, source.x - endX);
              const offsetX = Math.sin(angle) * lineGap / 2;
              const offsetY = -Math.cos(angle) * lineGap / 2;
              
              // Create two parallel paths
              for (let j = 0; j < 2; j++) {
                const sign = j === 0 ? 1 : -1;
                
                // Offset the start and end points
                const offsetStartX = source.x + sign * offsetX;
                const offsetStartY = source.y + sign * offsetY;
                const offsetEndX = endX + sign * offsetX;
                const offsetEndY = endY + sign * offsetY;
                
                // Offset control points
                const offsetControlX1 = controlX1 + sign * offsetX;
                const offsetControlY1 = controlY1 + sign * offsetY;
                const offsetControlX2 = controlX2 + sign * offsetX;
                const offsetControlY2 = controlY2 + sign * offsetY;
                
                // Create offset path
                const pathData = `M ${offsetStartX} ${offsetStartY} C ${offsetControlX1} ${offsetControlY1}, ${offsetControlX2} ${offsetControlY2}, ${offsetEndX} ${offsetEndY}`;
                
                // Use bright blood red for all lines to RITS
                const lineColor = magentaLineColor;
                const path = createStyledPath(pathData, {
                  stroke: lineColor,
                  strokeWidth: thinStroke.toString(),
                  fill: 'none',
                  strokeLinecap: 'round'
                });
                svg.insertBefore(path, svg.firstChild); // Insert at beginning to be behind everything
              }
            });
            
            // Now add ORANGE DOUBLE lines from Mastercard, eftpos and ASX Settlement
            const doubleLineMagentaColor = '#FFA500'; // Orange (switched from magenta)
            const additionalLines = [];
            
            // Mastercard line
            if (window.hexagonPositions.mastercardY !== undefined) {
              additionalLines.push({
                x: updatedBridgeX,  // Changed from right edge to left edge
                y: window.hexagonPositions.mastercardY + hexHeight / 2,
                label: 'Mastercard'
              });
            }
            
            // eftpos line  
            if (window.hexagonPositions.eftposY !== undefined) {
              additionalLines.push({
                x: updatedBridgeX,  // Changed from right edge to left edge
                y: window.hexagonPositions.eftposY + hexHeight / 2,
                label: 'eftpos'
              });
            }
            
            // ASX Settlement line
            // Use the updated bridgeX position
            if (typeof bridgeY !== 'undefined' && typeof updatedBridgeX !== 'undefined' && typeof updatedBridgeWidth !== 'undefined') {
              additionalLines.push({
                x: updatedBridgeX,  // Changed from right edge to left edge
                y: bridgeY + hexHeight / 2,
                label: 'ASX Settlement'
              });
            }
            
            // Draw the additional magenta double lines
            additionalLines.forEach((source) => {
              // Calculate angle to blue circle
              const dx = bigCircleX - source.x;
              const dy = bigCircleY - source.y;
              
              // Calculate end point on closest edge of circle
              const angleToCenter = Math.atan2(dy, dx);
              
              // End point is on circle edge in direction of source
              const endX = bigCircleX - bigCircleRadius * Math.cos(angleToCenter);
              const endY = bigCircleY - bigCircleRadius * Math.sin(angleToCenter);
              
              // Control points for S-shaped curve
              const distX = endX - source.x;
              const distY = endY - source.y;
              
              // S-curve: smoother transition from horizontal to vertical
              const controlX1 = source.x + Math.abs(distX) * 0.5;
              const controlY1 = source.y + distY * 0.2; // Start curving earlier
              const controlX2 = endX - Math.abs(distX) * 0.2;
              const controlY2 = endY - distY * 0.2; // Smooth into the end point
              
              // Create path data
              const pathData = `M ${source.x} ${source.y} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;
              
              // Create double line effect with two thin parallel lines
              const lineGap = 2.5; // Gap between parallel lines
              const thinStroke = 1.5; // Width of each thin line
              
              // Calculate perpendicular offset for parallel lines
              const angle = Math.atan2(source.y - endY, source.x - endX);
              const offsetX = Math.sin(angle) * lineGap / 2;
              const offsetY = -Math.cos(angle) * lineGap / 2;
              
              // Create two parallel paths
              for (let i = 0; i < 2; i++) {
                const sign = i === 0 ? 1 : -1;
                
                // Offset the entire path
                const offsetPathData = `M ${source.x + sign * offsetX} ${source.y + sign * offsetY} 
                                       C ${controlX1 + sign * offsetX} ${controlY1 + sign * offsetY},
                                         ${controlX2 + sign * offsetX} ${controlY2 + sign * offsetY},
                                         ${endX + sign * offsetX} ${endY + sign * offsetY}`;
                
                const path = createStyledPath(offsetPathData, {
                  stroke: doubleLineMagentaColor,
                  strokeWidth: thinStroke.toString(),
                  fill: 'none',
                  strokeLinecap: 'round'
                });
                svg.insertBefore(path, svg.firstChild); // Insert at beginning to be behind everything
              }
            });
            
            // Store box positions for LVSS lines later
            window.lvssBoxPositions = {
              narrowBoxX: reducedNarrowBoxX,
              narrowBoxWidth: reducedNarrowBoxWidth,
              cecsY: cecsY,
              cshdY: cshdY,
              becsY: becsY,
              apcsY: apcsY,
              gabsY: gabsY,
              boxHeight: boxHeight
            };
            
            // LVSS lines will be added after LVSS circle is created
            
            // Update LVSS Y position now that we know CECS position
            // This will happen AFTER LVSS is created
            const cecsCenterY = cecsY + (boxHeight / 2);
            window.needsLvssUpdate = {
              y: cecsCenterY // Center of CECS box
            };
            console.log('CECS Center Y calculated:', cecsCenterY);
            console.log('CECS box Y:', cecsY, 'height:', boxHeight);
          }
          
          // Now insert the admin batches box at the very beginning so it's behind all the lines
          if (window.adminBatchesBoxElement) {
            svg.insertBefore(window.adminBatchesBoxElement, svg.firstChild);
          }
          
          // Add "Administered Batches" label
          const adminBatchesText = createStyledText(
            (widerAdminBoxX - adminBoxPadding) + (widerAdminBoxWidth + 2 * adminBoxPadding) / 2,
            adminBoxY + adminBoxHeight - 10,  // Closer to bottom edge
            'Administered Batches',
            {
              fill: '#FFFFFF', // White text
              fontSize: '12' // Smaller font
            }
          );
          labelsGroup.appendChild(adminBatchesText);
          
          // Calculate gap between admin box bottom and CHESS-RTGS top
          const adminBoxBottom = adminBoxY + adminBoxHeight;
          const targetGap = chessY - adminBoxBottom;
          
          // Move SWIFT group down by a moderate amount
          // This positions it roughly where CLS AUD bottom might align with ESAs
          const rtgsBottom = rtgsY + smallRectHeight;
          const newSwiftHvcsTop = rtgsBottom + 43; // Move down by 43 pixels from RTGS (was 40, increased by 3)
          
          // Calculate adjustment needed for entire SWIFT group
          if (window.swiftGroupOriginalY) {
            const swiftGroupAdjustment = newSwiftHvcsTop - window.swiftGroupOriginalY;
            
            // Update all SWIFT group elements
            // Update SWIFT PDS box
            if (swiftRect) {
              const currentY = parseFloat(swiftRect.getAttribute('y'));
              swiftRect.setAttribute('y', (currentY + swiftGroupAdjustment).toFixed(2));
            }
            
            // Update SWIFT PDS text elements
            if (swiftRectText) {
              const currentY = parseFloat(swiftRectText.getAttribute('y'));
              swiftRectText.setAttribute('y', (currentY + swiftGroupAdjustment).toFixed(2));
            }
            if (swiftLine1) {
              const currentY = parseFloat(swiftLine1.getAttribute('y'));
              swiftLine1.setAttribute('y', (currentY + swiftGroupAdjustment).toFixed(2));
            }
            if (swiftLine2) {
              const currentY = parseFloat(swiftLine2.getAttribute('y'));
              swiftLine2.setAttribute('y', (currentY + swiftGroupAdjustment).toFixed(2));
            }
            
            // Update SWIFT HVCS box
            if (window.swiftHvcsElements && window.swiftHvcsElements.boundingBox) {
              const currentY = parseFloat(window.swiftHvcsElements.boundingBox.getAttribute('y'));
              window.swiftHvcsElements.boundingBox.setAttribute('y', (currentY + swiftGroupAdjustment).toFixed(2));
              
              // Update PACS boxes inside
              window.swiftHvcsElements.pacsElements.forEach(elem => {
                const rectY = parseFloat(elem.rect.getAttribute('y'));
                const textY = parseFloat(elem.text.getAttribute('y'));
                elem.rect.setAttribute('y', (rectY + swiftGroupAdjustment).toFixed(2));
                elem.text.setAttribute('y', (textY + swiftGroupAdjustment).toFixed(2));
              });
              
              // Update SWIFT HVCS label
              const labelY = parseFloat(window.swiftHvcsElements.hvcsLabel.getAttribute('y'));
              window.swiftHvcsElements.hvcsLabel.setAttribute('y', (labelY + swiftGroupAdjustment).toFixed(2));
              
              // Update line path
              const path = window.swiftHvcsElements.hvcsLine.getAttribute('d');
              const newPath = path.replace(/M ([\d.]+) ([\d.]+)/, (match, x, y) => {
                return `M ${x} ${(parseFloat(y) + swiftGroupAdjustment).toFixed(2)}`;
              });
              window.swiftHvcsElements.hvcsLine.setAttribute('d', newPath);
              
              // Update stored line position
              if (window.hvcsLineData) {
                window.hvcsLineData.startY = parseFloat(window.hvcsLineData.startY) + swiftGroupAdjustment;
              }
            }
            
            // Store adjusted positions for later use
            window.swiftGroupAdjustedY = window.swiftGroupOriginalY + swiftGroupAdjustment;
            window.clsAudAdjustedY = window.swiftGroupAdjustedY + rectHeight + verticalGap;
          }
          
          // Use stored alignment if available
          const alignedMoneyMarketX = window.asxBoxesAlignment ? window.asxBoxesAlignment.leftEdge : moneyMarketX;
          const alignedMoneyMarketWidth = window.asxBoxesAlignment ? window.asxBoxesAlignment.width : rectWidth * 1.2;
          
          moneyMarketRect = createStyledRect(alignedMoneyMarketX, moneyMarketY, alignedMoneyMarketWidth, smallRectHeight * 0.9, {
            fill: '#071f6a', // Filled with border color
            stroke: 'none', // No border
            strokeWidth: '0',
            rx: '8', // Rounded corners
            ry: '8' // Rounded corners
          });
          labelsGroup.appendChild(moneyMarketRect);
          
          // Add label for cash transfer (MM/repo)
          const moneyMarketText = createStyledText(
            alignedMoneyMarketX + alignedMoneyMarketWidth / 2,
            moneyMarketY + smallRectHeight * 0.9 / 2,
            'cash transfer (MM/repo)',
            {
              fill: '#ffffff', // White text
              fontSize: '11' // Reduced font size
            }
          );
          labelsGroup.appendChild(moneyMarketText);
          
          // Sympli line extension moved to after ADI box creation
          
          // Add horizontal line connecting RTGS / DvP RTGS to Money Market / Repo
          const rtgsToMoneyMarketLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          const moneyMarketLineY = moneyMarketY + smallRectHeight * 0.9 / 2; // Middle of Money Market box
          const moneyMarketRightEdge = window.asxBoxesAlignment ? 
            window.asxBoxesAlignment.leftEdge + window.asxBoxesAlignment.width : 
            moneyMarketX + rectWidth * 1.2;
          rtgsToMoneyMarketLine.setAttribute('x1', moneyMarketRightEdge.toFixed(2)); // Right edge of Money Market
          rtgsToMoneyMarketLine.setAttribute('y1', moneyMarketLineY.toFixed(2));
          rtgsToMoneyMarketLine.setAttribute('x2', dvpRtgsX.toFixed(2)); // Left edge of RTGS/DvP RTGS
          rtgsToMoneyMarketLine.setAttribute('y2', moneyMarketLineY.toFixed(2));
          rtgsToMoneyMarketLine.setAttribute('stroke', austraclearLineColor);
          rtgsToMoneyMarketLine.setAttribute('stroke-width', austraclearLineWidth);
          rtgsToMoneyMarketLine.setAttribute('stroke-linecap', 'round');
          svg.insertBefore(rtgsToMoneyMarketLine, labelsGroup);
          
          // Calculate CHESS equities position first
          const sssCcpY = moneyMarketY - smallRectHeight * 0.9 - verticalGap;
          // Calculate chessEquitiesY based on where clearing/netting will be
          const tradeByTradeYCalc = moneyMarketY - 2 * smallRectHeight - 3 * verticalGap - 5; // Same as trade-by-trade calculation
          const clearingYCalc = tradeByTradeYCalc - smallRectHeight * 0.9 - verticalGap; // Same as clearing calculation
          const chessEquitiesY = clearingYCalc - 11; // Moved up by 1 pixel
          
          // Create ASX bounding box around entire collection
          // Calculate based on window.asxBoxesAlignment to align with Cheques box
          // asxBoxPadding already defined above
          const asxBoxX = window.asxBoxesAlignment ? 
            window.asxBoxesAlignment.leftEdge - asxBoxPadding : 
            moneyMarketX - 10 - 60; // Move left so lines come from side
          const asxBoxY = chessEquitiesY - 35; // More space for label
          // Width to reach from left edge (with padding) to right edge of APCR
          const asxBoxWidth = window.asxBoxesAlignment && window.apcrRightEdge ? 
            window.apcrRightEdge - asxBoxX : 
            rectWidth * 1.2 + 20; // Content width plus padding
          const asxBoxHeight = moneyMarketY + smallRectHeight * 0.9 - chessEquitiesY + 45; // Adjusted for raised top
          
          // Debug: Log ASX box alignment
          console.log('ASX Box Alignment:', {
            asxBoxX: asxBoxX,
            asxBoxRightEdge: asxBoxX + asxBoxWidth,
            apcrRightEdge: window.apcrRightEdge,
            alignmentUsed: window.asxBoxesAlignment && window.apcrRightEdge
          });
          
          const asxBoundingBox = createStyledRect(asxBoxX, asxBoxY, asxBoxWidth, asxBoxHeight, {
            fill: '#e8ecf7', // Light blue-grey like CHESS equities box
            stroke: '#071f6a', // Dark blue matching internal boxes
            strokeWidth: '1', // Same thickness as DvP RTGS
            rx: '8',
            ry: '8'
          });
          // Insert at the very beginning of SVG so it's behind EVERYTHING
          svg.insertBefore(asxBoundingBox, svg.firstChild);
          
          // Extend ASX box left edge by 10% while keeping right edge fixed
          const originalAsxBoxWidth = asxBoxWidth;
          const asxWidthIncrease = originalAsxBoxWidth * 0.10;
          const newAsxBoxX = asxBoxX - asxWidthIncrease;
          const newAsxBoxWidth = originalAsxBoxWidth + asxWidthIncrease;
          
          // Update ASX box position and width
          asxBoundingBox.setAttribute('x', newAsxBoxX.toFixed(2));
          asxBoundingBox.setAttribute('width', newAsxBoxWidth.toFixed(2));
          
          // Store ASX box right edge for SWIFT PDS alignment
          window.asxBoxRightEdge = newAsxBoxX + newAsxBoxWidth;
          
          // Store the final ASX box dimensions for use by interior boxes
          window.finalAsxBox = {
            x: newAsxBoxX,
            width: newAsxBoxWidth
          };
          
          // Update SWIFT HVCS box to align with ASX right edge and widen by 5% on each side
          if (window.swiftHvcsElements && window.swiftHvcsElements.rightEdge && window.asxBoxRightEdge) {
            // Calculate original dimensions
            const originalHvcsBoxX = window.asxBoxRightEdge;
            const originalHvcsBoxWidth = window.swiftHvcsElements.rightEdge - originalHvcsBoxX;
            
            // Widen by 5% on each side
            const widthIncrease = originalHvcsBoxWidth * 0.05;
            const hvcsBoxX_final = originalHvcsBoxX - widthIncrease; // Move left edge left
            const hvcsBoxWidth_final = originalHvcsBoxWidth + (widthIncrease * 2); // Increase width by 10% total
            
            // Update bounding box position and width
            window.swiftHvcsElements.boundingBox.setAttribute('x', hvcsBoxX_final.toFixed(2));
            window.swiftHvcsElements.boundingBox.setAttribute('width', hvcsBoxWidth_final.toFixed(2));
            
            // Update right edge position for the line
            window.swiftHvcsElements.rightEdge = hvcsBoxX_final + hvcsBoxWidth_final;
            
            // Update PACS boxes inside with padding
            const internalPadding_final = 10; // Padding inside SWIFT HVCS box
            const pacsBoxWidth_final = hvcsBoxWidth_final - (internalPadding_final * 2);
            const pacsStartX_final = hvcsBoxX_final + internalPadding_final;
            
            window.swiftHvcsElements.pacsElements.forEach((elem) => {
              elem.rect.setAttribute('x', pacsStartX_final.toFixed(2));
              elem.rect.setAttribute('width', pacsBoxWidth_final);
              elem.text.setAttribute('x', (pacsStartX_final + pacsBoxWidth_final / 2).toFixed(2));
            });
            
            // Update SWIFT HVCS label position (center in wider box)
            const hvcsBoxCenterX_final = hvcsBoxX_final + hvcsBoxWidth_final / 2;
            window.swiftHvcsElements.hvcsLabel.setAttribute('x', hvcsBoxCenterX_final.toFixed(2));
            window.swiftHvcsElements.hvcsLine1.setAttribute('x', hvcsBoxCenterX_final.toFixed(2));
            window.swiftHvcsElements.hvcsLine2.setAttribute('x', hvcsBoxCenterX_final.toFixed(2));
            
            // Update line start position to new right edge
            const newHvcsBoxRight = hvcsBoxX_final + hvcsBoxWidth_final;
            const path = window.swiftHvcsElements.hvcsLine.getAttribute('d');
            const newPath = path.replace(/M ([\d.]+)/, `M ${newHvcsBoxRight.toFixed(2)}`);
            window.swiftHvcsElements.hvcsLine.setAttribute('d', newPath);
          }
          
          // Note: SWIFT PDS, NPP, and CLS AUD boxes remain square as originally designed
          
          // Add ASX label at top
          const asxLabel = createStyledText(
            newAsxBoxX + newAsxBoxWidth / 2,
            asxBoxY + 22, // Adjusted for raised top
            'ASX',
            {
              fill: '#071f6a', // Dark blue text
              fontSize: '20', // Increased font size
              fontWeight: 'normal' // Non-bold
            }
          );
          labelsGroup.appendChild(asxLabel);
          
          // Add blue line from ASX bounding box to under SWIFT HVCS
          if (window.asxBoxData && window.asxBoxData.needsLine && window.hvcsLineData) {
            const asxToHvcsLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            
            // Start from ASX bounding box right side, middle height
            const asxLineStartX = asxBoxX + asxBoxWidth + 2; // Right edge of box + 2px gap
            const asxLineStartY = asxBoxY + (asxBoxHeight * 0.4); // 40% down from top
            
            // Get SWIFT HVCS position from stored data
            const hvcsLineY = window.hvcsLineData.startY;
            const horizontalY = hvcsLineY + 15 - 15 + 8; // Blue line 8px below green line
            
            // Simple path: straight down then curve right
            const cornerRadius = 30;
            const goDownDistance = 160; // How far down to go - nudged up
            
            // Store line data for later use by non-ADIs curve
            if (!window.asxLineData) window.asxLineData = {};
            window.asxLineData.horizontalY = asxLineStartY + goDownDistance + cornerRadius;
            window.asxLineData.startX = asxLineStartX;
            
            const asxPath = `M ${asxLineStartX} ${asxLineStartY} ` +
                          `L ${asxLineStartX + 30} ${asxLineStartY} ` + // Go right first
                          `Q ${asxLineStartX + 30 + cornerRadius} ${asxLineStartY}, ` +
                          `${asxLineStartX + 30 + cornerRadius} ${asxLineStartY + cornerRadius} ` + // Curve down
                          `L ${asxLineStartX + 30 + cornerRadius} ${asxLineStartY + goDownDistance} ` + // Go down
                          `Q ${asxLineStartX + 30 + cornerRadius} ${asxLineStartY + goDownDistance + cornerRadius}, ` +
                          `${asxLineStartX + 30 + cornerRadius * 2} ${asxLineStartY + goDownDistance + cornerRadius} ` + // Curve right
                          `L ${asxLineStartX + 150} ${asxLineStartY + goDownDistance + cornerRadius}`; // Extend right
            
            const asxToHvcsLineStyled = createStyledPath(asxPath, {
              stroke: '#0a4f8f',
              strokeWidth: '4',
              fill: 'none',
              strokeLinecap: 'round',
              id: 'asx-to-hvcs-line'
            });
            labelsGroup.appendChild(asxToHvcsLineStyled);
            
            // Add third blue line from ASX box (60% from right) curving into ADIs
            const asxToAdiLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            
            // Start from ASX bounding box right side, slightly lower than first line
            const asxLine2StartX = asxBoxX + asxBoxWidth + 2; // Right edge of box + 2px gap
            const asxLine2StartY = asxBoxY + (asxBoxHeight * 0.6); // 60% down from top
            
            // Same initial path structure as first blue line but go deeper
            const extraDownForRightLine = 10; // Extra distance to put right line below left line - reduced by 5
            const asxPath2 = `M ${asxLine2StartX} ${asxLine2StartY} ` +
                          `L ${asxLine2StartX + 40} ${asxLine2StartY} ` + // Go right first (slightly more than first line)
                          `Q ${asxLine2StartX + 40 + cornerRadius} ${asxLine2StartY}, ` +
                          `${asxLine2StartX + 40 + cornerRadius} ${asxLine2StartY + cornerRadius} ` + // Curve down
                          `L ${asxLine2StartX + 40 + cornerRadius} ${asxLine2StartY + goDownDistance + extraDownForRightLine} ` + // Go down
                          `Q ${asxLine2StartX + 40 + cornerRadius} ${asxLine2StartY + goDownDistance + extraDownForRightLine + cornerRadius}, ` +
                          `${asxLine2StartX + 40 + cornerRadius * 2} ${asxLine2StartY + goDownDistance + extraDownForRightLine + cornerRadius} ` + // Curve right
                          `L ${asxLine2StartX + 150} ${asxLine2StartY + goDownDistance + extraDownForRightLine + cornerRadius}`;
            
            const asxToAdiLineStyled = createStyledPath(asxPath2, {
              stroke: '#0a4f8f',
              strokeWidth: '4',
              fill: 'none',
              strokeLinecap: 'round',
              id: 'asx-to-adi-line'
            });
            labelsGroup.appendChild(asxToAdiLineStyled);
            
            // Store line data for later extension
            if (!window.asxLine2Data) window.asxLine2Data = {};
            window.asxLine2Data.horizontalY = asxLine2StartY + goDownDistance + extraDownForRightLine + cornerRadius;
            window.asxLine2Data.startX = asxLine2StartX;
          }
          
          // Add Sympli e-conveyancing box above ASX
          // Apply same adjustment as SWIFT group if available
          let sympliAdjustment = 0;
          if (window.swiftGroupOriginalY && window.swiftGroupAdjustedY) {
            sympliAdjustment = window.swiftGroupAdjustedY - window.swiftGroupOriginalY;
          }
          const sympliY = asxBoxY - smallRectHeight * 0.9 * 1.2 - verticalGap * 3 + sympliAdjustment; // Apply SWIFT group adjustment
          const sympliWidth = rectWidth * 1.6; // Wider than before but still narrower than PEXA (1.8)
          const sympliX = moneyMarketX + rectWidth * 1.2 - sympliWidth - 60; // Move left so lines come from side
          
          const sympliBox = createStyledRect(sympliX, sympliY, sympliWidth, smallRectHeight * 0.9 * 1.2 * 0.95, {
            fill: 'rgb(239,136,51)', // Sympli new color
            stroke: 'rgb(239,136,51)', // Sympli new color
            strokeWidth: '2'
          });
          sympliBox.setAttribute('rx', '8'); // Rounded corners
          sympliBox.setAttribute('ry', '8'); // Rounded corners
          labelsGroup.appendChild(sympliBox);
          
          // Add Sympli text
          const sympliText = createStyledText(
            sympliX + sympliWidth / 2,
            sympliY + smallRectHeight * 0.9 * 1.2 * 0.95 / 2,
            'Sympli e-conveyancing',
            {
              fill: '#ffffff', // White text
              fontSize: '12'
            }
          );
          labelsGroup.appendChild(sympliText);
          
          // Add Sympli line from left edge going under dark blue boxes
          // Move vertical segment to be between current position and PEXA
          const sympliLineStartX = sympliX + (sympliWidth * 0.1) - 30; // 30px to the left (PEXA is 40px left)
          const sympliLineStartY = sympliY + (smallRectHeight * 0.9 * 1.2 * 0.95) + 2; // Just below bottom
          
          // Go down further to run under the blue and green lines
          const sympliGoDownDistance = 365; // Shifted up to be above PEXA
          const sympliCornerRadius = 60; // Increased for more curvature at bottom left
          
          // Calculate Sympli box center for connection
          const sympliBoxCenterY = sympliY + (smallRectHeight * 0.9 * 1.2 * 0.95) / 2;
          
          // Path with rounded corner connection to left side of box
          const sympliFilletRadius = 20; // Radius for the rounded corner
          const sympliPath = `M ${sympliX} ${sympliBoxCenterY} ` + // Start at left edge of Sympli box
                           `L ${sympliLineStartX + sympliFilletRadius} ${sympliBoxCenterY} ` + // Go left horizontally (stop before corner)
                           `Q ${sympliLineStartX} ${sympliBoxCenterY}, ` + // Control point at corner
                           `${sympliLineStartX} ${sympliBoxCenterY + sympliFilletRadius} ` + // End of curve
                           `L ${sympliLineStartX} ${sympliLineStartY + sympliGoDownDistance} ` + // Then down
                           `Q ${sympliLineStartX} ${sympliLineStartY + sympliGoDownDistance + sympliCornerRadius}, ` +
                           `${sympliLineStartX + sympliCornerRadius} ${sympliLineStartY + sympliGoDownDistance + sympliCornerRadius} ` +
                           `L ${sympliLineStartX + 600} ${sympliLineStartY + sympliGoDownDistance + sympliCornerRadius}`;
          
          const sympliLine = createStyledPath(sympliPath, {
            stroke: 'rgb(239,136,51)', // Sympli orange color
            strokeWidth: '3',
            fill: 'none',
            strokeLinecap: 'round',
            id: 'sympli-line'
          });
          labelsGroup.appendChild(sympliLine);
          
          // Store line data for later curve extension
          if (!window.sympliLineData) window.sympliLineData = {};
          window.sympliLineData.horizontalY = sympliLineStartY + sympliGoDownDistance + sympliCornerRadius;
          window.sympliLineData.startX = sympliLineStartX;
          
          // Add PEXA e-conveyancing box above Sympli
          // Align with PEXA box to make the line horizontal
          const pexaConveyY = pexaY + (hexHeight - smallRectHeight * 0.9 * 1.2 * 0.95) / 2; // Align center with PEXA box center
          const pexaConveyWidth = sympliWidth; // Same width as Sympli
          const pexaConveyX = moneyMarketX + rectWidth * 1.2 - pexaConveyWidth - 60; // Move left so lines come from side
          
          const pexaConveyBox = createStyledRect(pexaConveyX, pexaConveyY, pexaConveyWidth, smallRectHeight * 0.9 * 1.2 * 0.95, {
            fill: 'rgb(179,46,161)', // Same as PEXA border (solid fill)
            stroke: 'rgb(179,46,161)',
            strokeWidth: '2',
            rx: '8', // Rounded corners
            ry: '8' // Rounded corners
          });
          labelsGroup.appendChild(pexaConveyBox);
          
          // Add PEXA e-conveyancing text
          const pexaConveyText = createStyledText(
            pexaConveyX + pexaConveyWidth / 2,
            pexaConveyY + smallRectHeight * 0.9 * 1.2 * 0.95 / 2,
            'PEXA e-conveyancing',
            {
              fill: '#ffffff', // White text
              fontSize: '12'
            }
          );
          labelsGroup.appendChild(pexaConveyText);
          
          // Create PEXA line parallel to Sympli line
          // Start from bottom of PEXA box, but to the LEFT of Sympli
          const pexaLineStartX = pexaConveyX + (pexaConveyWidth * 0.1) - 40;
          const pexaLineStartY = pexaConveyY + smallRectHeight * 0.9 * 1.2 * 0.95 + 2;
          
          // Go down parallel to Sympli line, on the outside (5px further down)
          const pexaGoDownDistance = sympliGoDownDistance + 35; // 10px below Sympli horizontal
          const pexaCornerRadius = 60; // Even larger radius to stay well outside
          
          // Calculate PEXA box center for connection
          const pexaBoxCenterY = pexaConveyY + smallRectHeight * 0.9 * 1.2 * 0.95 / 2;
          
          // Initial path: start from left edge of PEXA box, go left, then down with rounded corner
          const pexaFilletRadius = 20; // Radius for the rounded corner
          const pexaPath = `M ${pexaConveyX} ${pexaBoxCenterY} ` + // Start at left edge of PEXA box
                          `L ${pexaLineStartX + pexaFilletRadius} ${pexaBoxCenterY} ` + // Go left horizontally (stop before corner)
                          `Q ${pexaLineStartX} ${pexaBoxCenterY}, ` + // Control point at corner
                          `${pexaLineStartX} ${pexaBoxCenterY + pexaFilletRadius} ` + // End of curve
                          `L ${pexaLineStartX} ${pexaLineStartY + pexaGoDownDistance} ` + // Then down
                          `Q ${pexaLineStartX} ${pexaLineStartY + pexaGoDownDistance + pexaCornerRadius}, ` +
                          `${pexaLineStartX + pexaCornerRadius} ${pexaLineStartY + pexaGoDownDistance + pexaCornerRadius} ` + // Normal curve
                          `L ${pexaLineStartX + 690} ${pexaLineStartY + pexaGoDownDistance + pexaCornerRadius}`;
          
          const pexaLine = createStyledPath(pexaPath, {
            stroke: 'rgb(179,46,161)', // PEXA color
            strokeWidth: '3',
            fill: 'none',
            strokeLinecap: 'round',
            id: 'pexa-line'
          });
          
          labelsGroup.appendChild(pexaLine);
          
          // Store PEXA line data for later curve extension
          if (!window.pexaLineData) window.pexaLineData = {};
          window.pexaLineData.horizontalY = pexaLineStartY + pexaGoDownDistance + pexaCornerRadius;
          window.pexaLineData.startX = pexaLineStartX;
          window.pexaLineData.startY = pexaLineStartY;
          
          // Create enclosing box for CHESS equities
          // Center CHESS equities box around the interior boxes
          const interiorBoxX = moneyMarketX + (rectWidth * 1.2 - rectWidth) / 2; // Where interior boxes are positioned
          const chessEquitiesX = interiorBoxX - 10; // Add small padding around interior boxes
          // Position already calculated above
          const chessEquitiesWidth = rectWidth + 20; // Width to encompass interior boxes with padding
          // Height to encompass clearing/netting and trade-by-trade with padding
          const chessEquitiesHeight = (tradeByTradeYCalc + smallRectHeight * 0.9) - clearingYCalc + 27; // From clearing top to trade-by-trade bottom plus padding (increased by 1 for gap)
          
          const alignedChessEquitiesX = window.asxBoxesAlignment ? window.asxBoxesAlignment.leftEdge : chessEquitiesX;
          const alignedChessEquitiesWidth = window.asxBoxesAlignment ? window.asxBoxesAlignment.width : chessEquitiesWidth;
          
          const chessEquitiesRect = createStyledRect(alignedChessEquitiesX, chessEquitiesY, alignedChessEquitiesWidth, chessEquitiesHeight, {
            fill: '#4a5a8a', // Darker shade
            stroke: 'none', // No border
            strokeWidth: '0',
            rx: '8',
            ry: '8'
          });
          chessEquitiesRect.setAttribute('opacity', '0.7'); // Less opaque
          svg.insertBefore(chessEquitiesRect, labelsGroup); // Insert behind other elements
          
          // Add CHESS equities label
          const chessEquitiesText = createStyledText(
            alignedChessEquitiesX + alignedChessEquitiesWidth / 2,
            chessEquitiesY + 10, // More margin from top (moved up 1px)
            'CHESS equities',
            {
              fill: '#ffffff', // White text
              fontSize: '12'
            }
          );
          labelsGroup.appendChild(chessEquitiesText);
          
          // Trade by trade box - above SSS/CCP with double gap
          const tradeByTradePadding = 15; // Padding on each side
          const tradeByTradeWidth = window.asxBoxesAlignment ? 
            window.asxBoxesAlignment.width - (tradeByTradePadding * 2) : 
            rectWidth; // Use most of the available width
          // Position with padding from edges
          const alignedTradeByTradeX = window.asxBoxesAlignment ? 
            window.asxBoxesAlignment.leftEdge + tradeByTradePadding : 
            moneyMarketX + (rectWidth * 1.2 - tradeByTradeWidth) / 2;
          const tradeByTradeY = moneyMarketY - 2 * smallRectHeight - 3 * verticalGap + 10 - 7; // Moved down by 2 pixels (was -9, now -7)
          
          const tradeByTradeRect = createStyledRect(alignedTradeByTradeX, tradeByTradeY, tradeByTradeWidth, smallRectHeight * 0.9, {
            fill: '#071f6a',
            stroke: 'none',
            strokeWidth: '0',
            rx: '8',
            ry: '8'
          });
          labelsGroup.appendChild(tradeByTradeRect);
          
          // Add label for trade by trade
          const tradeByTradeText = createStyledText(
            alignedTradeByTradeX + tradeByTradeWidth / 2,
            tradeByTradeY + smallRectHeight * 0.9 / 2,
            'trade-by-trade',
            {
              fill: '#ffffff',
              fontSize: '11'
            }
          );
          labelsGroup.appendChild(tradeByTradeText);
          
          // Clearing/netting box - above trade by trade
          // Make clearing box use more of the bounding box width
          const clearingPadding = 15; // Padding on each side
          const clearingWidth = window.asxBoxesAlignment ? 
            window.asxBoxesAlignment.width - (clearingPadding * 2) : 
            rectWidth; // Use most of the available width
          // Position with padding from edges
          const alignedClearingX = window.asxBoxesAlignment ? 
            window.asxBoxesAlignment.leftEdge + clearingPadding : 
            moneyMarketX + (rectWidth * 1.2 - clearingWidth) / 2;
          const clearingY = tradeByTradeY - smallRectHeight * 0.9 - verticalGap / 2 - 1; // Lowered by 3 pixels, plus 1 more pixel gap
          
          const clearingRect = createStyledRect(alignedClearingX, clearingY, clearingWidth, smallRectHeight * 0.9, {
            fill: '#071f6a',
            stroke: 'none',
            strokeWidth: '0',
            rx: '8',
            ry: '8'
          });
          labelsGroup.appendChild(clearingRect);
          
          // Add label for clearing/netting
          const clearingText = createStyledText(
            alignedClearingX + clearingWidth / 2,
            clearingY + smallRectHeight * 0.9 / 2,
            'clearing/netting',
            {
              fill: '#ffffff',
              fontSize: '11'
            }
          );
          labelsGroup.appendChild(clearingText);
          
          // SSS/CCP cash legs box - above Money Market/Repo
          const sssCcpX = moneyMarketX;
          // sssCcpY already defined above for positioning the enclosing box
          
          const alignedSssCcpX = window.asxBoxesAlignment ? window.asxBoxesAlignment.leftEdge : sssCcpX;
          const alignedSssCcpWidth = window.asxBoxesAlignment ? window.asxBoxesAlignment.width : rectWidth * 1.2;
          
          const sssCcpRect = createStyledRect(alignedSssCcpX, sssCcpY, alignedSssCcpWidth, smallRectHeight * 0.9, {
            fill: '#071f6a', // Same as Money Market
            stroke: 'none',
            strokeWidth: '0',
            rx: '8',
            ry: '8'
          });
          labelsGroup.appendChild(sssCcpRect);
          
          // Add label for DvP cash leg (SSS/CCP)
          const sssCcpText = createStyledText(
            alignedSssCcpX + alignedSssCcpWidth / 2,
            sssCcpY + smallRectHeight * 0.9 / 2,
            'DvP cash leg (SSF/CCP)',
            {
              fill: '#ffffff', // White text
              fontSize: '11'
            }
          );
          labelsGroup.appendChild(sssCcpText);
          
          // Add blue line connecting clearing/netting to ASX Settlement
          const blueLineColor = '#0a4f8f'; // Same as austraclear lines
          
          // Line from clearing/netting to ASX Settlement (S-shape)
          // Calculate positions - right edge to left edge
          const clearingRightX = alignedClearingX + clearingWidth; // Right edge of clearing/netting
          const clearingCenterY = clearingY + smallRectHeight * 0.9 / 2; // Center Y of clearing
          const asxSettlementLeftX = window.bridgePositions.bridgeX; // Left edge of ASX Settlement
          const asxSettlementCenterY = window.bridgePositions.bridgeY + window.hexagonPositions.hexHeight / 2; // Center Y
          
          // Create S-curve
          const controlOffset = 40;
          const pathData = `M ${clearingRightX} ${clearingCenterY} 
                           C ${clearingRightX + controlOffset} ${clearingCenterY},
                             ${asxSettlementLeftX - controlOffset} ${asxSettlementCenterY},
                             ${asxSettlementLeftX} ${asxSettlementCenterY}`;
          
          const clearingToAsxPath = createStyledPath(pathData, {
            stroke: blueLineColor,
            strokeWidth: '3', // Match austraclear lines
            fill: 'none'
          });
          labelsGroup.appendChild(clearingToAsxPath);
          
          // REMOVED Sympli to ASXF curved line
          // Instead draw a horizontal line from Sympli to ASXF x-coordinate
          const sympliHorizontalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          const sympliRightX = sympliX + sympliWidth;
          const sympliCenterY = sympliY + smallRectHeight * 0.9 * 1.2 * 0.95 / 2; // Center Y with adjusted height
          
          // Draw horizontal line to ASXF left X coordinate
          sympliHorizontalLine.setAttribute('x1', sympliRightX);
          sympliHorizontalLine.setAttribute('y1', sympliCenterY);
          sympliHorizontalLine.setAttribute('x2', window.hexagonPositions.asxfX);
          sympliHorizontalLine.setAttribute('y2', sympliCenterY);
          sympliHorizontalLine.setAttribute('stroke', 'rgb(239,136,51)'); // Sympli orange color
          sympliHorizontalLine.setAttribute('stroke-width', '3');
          labelsGroup.appendChild(sympliHorizontalLine);
          
          // Calculate the 1/3 point on ASXF box using the UPDATED position
          // We need to use the position from window.hexagonPositions which has been adjusted
          const asxfCurrentY = window.hexagonPositions.asxfY;
          const asxfCurrentHeight = window.hexagonPositions.asxfHeight;
          const asxfOneThirdY = asxfCurrentY + (asxfCurrentHeight * 1 / 3);
          
          // Compare the Y coordinates
          const yDifference = sympliCenterY - asxfOneThirdY;
          
          console.log('===== Y COORDINATE COMPARISON =====');
          console.log('Sympli center Y:', sympliCenterY);
          console.log('ASXF 1/3 point Y:', asxfOneThirdY);
          console.log('Difference (Sympli - ASXF 1/3):', yDifference);
          console.log('ASXF needs to move UP by:', Math.abs(yDifference), 'pixels to align');
          console.log('===================================');
          
          // MOVE THE FUCKING BOX NOW
          const moveAmount = sympliCenterY - asxfOneThirdY;
          console.log('MOVING ASXF UP BY:', moveAmount);
          
          // Force a visible movement
          const forcedMove = -50; // Move up by 50 pixels to make it obvious
          
          // Find and move ASXF box
          const allRects = labelsGroup.getElementsByTagName('rect');
          for (let rect of allRects) {
            if (rect.getAttribute('fill') === '#e8ecf7' && 
                Math.abs(parseFloat(rect.getAttribute('height')) - window.hexagonPositions.asxfHeight) < 1 &&
                Math.abs(parseFloat(rect.getAttribute('x')) - window.hexagonPositions.asxfX) < 1) {
              const currentY = parseFloat(rect.getAttribute('y'));
              const newY = currentY + forcedMove; // Use forced movement
              rect.setAttribute('y', newY);
              console.log('MOVED ASXF BOX from', currentY, 'to', newY);
              
              // Also update ASX Settlement box (smaller height)
              for (let rect2 of allRects) {
                if (rect2.getAttribute('fill') === '#e8ecf7' && 
                    Math.abs(parseFloat(rect2.getAttribute('height')) - window.hexagonPositions.hexHeight) < 1 &&
                    Math.abs(parseFloat(rect2.getAttribute('x')) - window.hexagonPositions.asxfX) < 1) {
                  const currentY2 = parseFloat(rect2.getAttribute('y'));
                  const newY2 = currentY2 + forcedMove; // Use forced movement
                  rect2.setAttribute('y', newY2);
                  console.log('MOVED ASX SETTLEMENT BOX from', currentY2, 'to', newY2);
                  break;
                }
              }
              
              // Update text labels
              const allTexts = labelsGroup.getElementsByTagName('text');
              for (let text of allTexts) {
                if (text.textContent === 'ASXF') {
                  const textY = parseFloat(text.getAttribute('y'));
                  text.setAttribute('y', textY + moveAmount);
                  console.log('MOVED ASXF TEXT');
                }
                if (text.textContent === 'ASX Settlement') {
                  const textY = parseFloat(text.getAttribute('y'));
                  text.setAttribute('y', textY + moveAmount);
                  console.log('MOVED ASX SETTLEMENT TEXT');
                }
              }
              
              break;
            }
          }
          
          // Move the text labels too
          const textElements = labelsGroup.getElementsByTagName('text');
          for (let text of textElements) {
            if (text.textContent === 'ASXF') {
              const currentTextY = parseFloat(text.getAttribute('y'));
              text.setAttribute('y', currentTextY + forcedMove);
              console.log('MOVED ASXF TEXT from', currentTextY, 'to', currentTextY + forcedMove);
            } else if (text.textContent === 'ASX Settlement') {
              const currentTextY = parseFloat(text.getAttribute('y'));
              text.setAttribute('y', currentTextY + forcedMove);
              console.log('MOVED ASX Settlement TEXT from', currentTextY, 'to', currentTextY + forcedMove);
            }
          }
          
          // Final check: Ensure ASX Settlement text is properly positioned
          const asxSettlementFinalCheck = labelsGroup.querySelector('text[text-anchor="middle"]');
          const allTextsForCheck = Array.from(labelsGroup.getElementsByTagName('text'));
          const asxSettlementTextFinal = allTextsForCheck.find(t => t.textContent === 'ASX Settlement');
          
          if (asxSettlementTextFinal) {
            // Find the ASX Settlement box
            const asxSettlementBoxFinal = Array.from(labelsGroup.getElementsByTagName('rect')).find(rect => 
              rect.getAttribute('fill') === '#e8ecf7' && 
              Math.abs(parseFloat(rect.getAttribute('height')) - window.hexagonPositions.hexHeight) < 1 &&
              Math.abs(parseFloat(rect.getAttribute('x')) - window.hexagonPositions.asxfX) < 1 &&
              parseFloat(rect.getAttribute('y')) > window.hexagonPositions.asxfY // It's below ASXF
            );
            
            if (asxSettlementBoxFinal) {
              const boxY = parseFloat(asxSettlementBoxFinal.getAttribute('y'));
              const boxHeight = parseFloat(asxSettlementBoxFinal.getAttribute('height'));
              const centerY = boxY + boxHeight / 2;
              asxSettlementTextFinal.setAttribute('y', centerY.toFixed(2));
              console.log('Final ASX Settlement text position:', centerY);
            }
          } else {
            console.log('WARNING: ASX Settlement text not found!');
          }
          
          // Line from PEXA e-conveyancing to PEXA box
          // PEXA e-conveyancing position - right edge
          const pexaConveyRightX = pexaConveyX + pexaConveyWidth;
          const pexaConveyCenterY = pexaConveyY + smallRectHeight * 0.9 * 1.2 * 0.95 / 2; // Center Y with adjusted height
          // PEXA box position
          const pexaBoxLeftX = window.hexagonPositions.pexaX;
          let pexaHexCenterY = window.hexagonPositions.pexaY + window.hexagonPositions.hexHeight / 2;
          

          
          const pexaAdjustment = 0; // No adjustment
          
          // Update text positions
          const allTexts = Array.from(labelsGroup.children).filter(el => el.tagName === 'text');
          const pexaTextElement = allTexts.find(el => el.textContent === 'PEXA');
          const eftposTextElement = allTexts.find(el => el.textContent === 'eftpos');
          const mastercardTextElement = allTexts.find(el => el.textContent === 'Mastercard');
          
          if (pexaTextElement) {
            // Center text vertically without offset - dominant-baseline:middle handles it
            pexaTextElement.setAttribute('y', (window.hexagonPositions.pexaY + window.hexagonPositions.hexHeight / 2).toFixed(2));
          }
          if (eftposTextElement) {
            // Center text vertically without offset - dominant-baseline:middle handles it
            eftposTextElement.setAttribute('y', (window.hexagonPositions.eftposY + window.hexagonPositions.hexHeight / 2).toFixed(2));
          }
          if (mastercardTextElement) {
            // Center text vertically without offset - dominant-baseline:middle handles it
            mastercardTextElement.setAttribute('y', (window.hexagonPositions.mastercardY + window.hexagonPositions.hexHeight / 2).toFixed(2));
          }
          
          // Recalculate pexaHexCenterY with adjusted position
          pexaHexCenterY = window.hexagonPositions.pexaY + window.hexagonPositions.hexHeight / 2;
          
          // Also adjust ASXF and ASX Settlement to move up with PEXA
          // window.hexagonPositions.asxfY += pexaAdjustment; // COMMENTED OUT - no adjustment
          
          // Note: To make Sympli line horizontal would require complex recalculation
          // since Sympli position depends on ASX box position which depends on ASXF
          
          // However, we'll apply an additional adjustment based on the calculated difference
          // This will be calculated later when we have all the positions
          window.hexagonPositions.needsSympliAlignment = true;
          
          // Find ASXF box by looking for the one with double height
          const asxfBoxElement = Array.from(labelsGroup.children).find(el => 
            el.tagName === 'rect' && 
            el.getAttribute('fill') === '#e8ecf7' && 
            parseFloat(el.getAttribute('height')) === window.hexagonPositions.asxfHeight &&
            parseFloat(el.getAttribute('x')) === window.hexagonPositions.asxfX);
          if (asxfBoxElement) {
            asxfBoxElement.setAttribute('y', window.hexagonPositions.asxfY);
          }
          
          // Update ASXF text
          const asxfTextElement = allTexts.find(el => el.textContent === 'ASXF');
          if (asxfTextElement) {
            asxfTextElement.setAttribute('y', (window.hexagonPositions.asxfY + window.hexagonPositions.asxfHeight / 2).toFixed(2));
          }
          
          // Update ASX Settlement box and text
          // Note: ASXF box was moved up by hexHeight, so we need to account for that
          const actualAsxfBottomY = window.hexagonPositions.asxfY + window.hexagonPositions.asxfHeight - window.hexagonPositions.hexHeight;
          const pexaAsxfGapForUpdate = verticalGap * 2; // Same gap as between PEXA and ASXF
          const bridgeY_new = actualAsxfBottomY + pexaAsxfGapForUpdate;
          // Find ASX Settlement box - use stored bridge positions to identify it correctly
          const allRectsForSettlement = Array.from(labelsGroup.getElementsByTagName('rect'));
          const asxSettlementBoxElement = allRectsForSettlement.find(el => {
            const x = parseFloat(el.getAttribute('x'));
            const y = parseFloat(el.getAttribute('y'));
            const fill = el.getAttribute('fill');
            const height = parseFloat(el.getAttribute('height'));
            // ASX Settlement box: light blue-grey fill, specific height, and positioned at widerAdminBoxX
            // Check if it's already at the expected Y position from bridgePositions
            const isAtBridgePosition = window.bridgePositions && 
                                      Math.abs(y - window.bridgePositions.bridgeY) < 5;
            return fill === '#e8ecf7' && 
                   Math.abs(height - window.hexagonPositions.hexHeight) < 1 &&
                   (isAtBridgePosition || y > window.hexagonPositions.asxfY);
          });
          // Don't update Y position - ASX Settlement box is already correctly positioned
          // if (asxSettlementBoxElement) {
          //   asxSettlementBoxElement.setAttribute('y', bridgeY_new);
          // }
          
          const asxSettlementTextElement = allTexts.find(el => el.textContent === 'ASX Settlement');
          if (asxSettlementTextElement) {
            if (asxSettlementBoxElement) {
              // Get the actual box position and height to center the text properly
              const boxX = parseFloat(asxSettlementBoxElement.getAttribute('x'));
              const boxY = parseFloat(asxSettlementBoxElement.getAttribute('y'));
              const boxWidth = parseFloat(asxSettlementBoxElement.getAttribute('width'));
              const boxHeight = parseFloat(asxSettlementBoxElement.getAttribute('height'));
              asxSettlementTextElement.setAttribute('x', (boxX + boxWidth / 2).toFixed(2));
              asxSettlementTextElement.setAttribute('y', (boxY + boxHeight / 2).toFixed(2));
              console.log('ASX Settlement text positioned at:', boxX + boxWidth / 2, boxY + boxHeight / 2);
            } else {
              // If box not found, use widerAdminBoxX which is where the boxes are positioned
              console.log('ASX Settlement box not found, using fallback position');
              // Get widerAdminBoxX from Mastercard position (which we know works)
              const mastercardBox = allRectsForSettlement.find(el => el.getAttribute('fill') === 'rgb(255,230,230)');
              if (mastercardBox) {
                const boxX = parseFloat(mastercardBox.getAttribute('x'));
                const boxWidth = parseFloat(mastercardBox.getAttribute('width'));
                asxSettlementTextElement.setAttribute('x', (boxX + boxWidth / 2).toFixed(2));
                asxSettlementTextElement.setAttribute('y', (bridgeY_new + window.hexagonPositions.hexHeight / 2).toFixed(2));
              }
            }
            // Ensure text alignment attributes are set
            asxSettlementTextElement.setAttribute('text-anchor', 'middle');
            asxSettlementTextElement.setAttribute('dominant-baseline', 'middle');
            // Make sure text is visible
            asxSettlementTextElement.setAttribute('opacity', '1');
            asxSettlementTextElement.setAttribute('visibility', 'visible');
            asxSettlementTextElement.setAttribute('fill', '#071f6a'); // Ensure text color is set
            asxSettlementTextElement.setAttribute('font-size', '12'); // Ensure font size is set
            asxSettlementTextElement.style.visibility = 'visible'; // Also set CSS visibility
            asxSettlementTextElement.style.display = 'block'; // Ensure not hidden
          } else {
            console.log('ASX Settlement text element not found!');
          }
          
          // Create S-curve for PEXA
          const pexaPathData = `M ${pexaConveyRightX} ${pexaConveyCenterY} 
                               C ${pexaConveyRightX + controlOffset} ${pexaConveyCenterY},
                                 ${pexaBoxLeftX - controlOffset} ${pexaHexCenterY},
                                 ${pexaBoxLeftX} ${pexaHexCenterY}`;
          
          const pexaToBoxPath = createStyledPath(pexaPathData, {
            stroke: 'rgb(179,46,161)', // PEXA color
            strokeWidth: '3',
            fill: 'none'
          });
          labelsGroup.appendChild(pexaToBoxPath);
          
          // Horizontal line from eftpos
          const eftposHorizontalPath = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          // eftpos position - use updated positions
          const eftposLeftX = updatedBridgeX;
          const eftposCenterY = window.hexagonPositions.eftposY + window.hexagonPositions.hexHeight / 2;
          const horizontalExtendX = pexaConveyX - 50; // Extend 50 pixels to the left of PEXA e-conveyancing
          
          // Simple horizontal line from eftpos
          eftposHorizontalPath.setAttribute('x1', eftposLeftX);
          eftposHorizontalPath.setAttribute('y1', eftposCenterY);
          eftposHorizontalPath.setAttribute('x2', horizontalExtendX);
          eftposHorizontalPath.setAttribute('y2', eftposCenterY); // Keep Y same for horizontal line
          eftposHorizontalPath.setAttribute('stroke', 'rgb(100,80,180)'); // eftpos purple border color
          eftposHorizontalPath.setAttribute('stroke-width', '3');
          labelsGroup.appendChild(eftposHorizontalPath);
          
          // Horizontal line from Mastercard parallel above eftpos line
          const mastercardHorizontalPath = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          // Mastercard position - use updated positions
          const mastercardLeftX = updatedBridgeX;
          const mastercardCenterY = window.hexagonPositions.mastercardY + window.hexagonPositions.hexHeight / 2;
          
          mastercardHorizontalPath.setAttribute('x1', mastercardLeftX);
          mastercardHorizontalPath.setAttribute('y1', mastercardCenterY);
          mastercardHorizontalPath.setAttribute('x2', horizontalExtendX);
          mastercardHorizontalPath.setAttribute('y2', mastercardCenterY); // Keep Y same for horizontal line
          mastercardHorizontalPath.setAttribute('stroke', 'rgb(216,46,43)'); // Mastercard new red border color
          mastercardHorizontalPath.setAttribute('stroke-width', '3');
          labelsGroup.appendChild(mastercardHorizontalPath);
          
          // Removed the Visa-PEXA connection line
          // Calculate Visa position (still needed for Visa box placement)
          const pexaConveyCenterX = pexaConveyX + pexaConveyWidth / 2;
          const visaX = pexaConveyCenterX - updatedBridgeWidth / 2; // Center Visa above PEXA e-conveyancing
          const yellowEndY = mastercardCenterY - 23; // Position Visa above Mastercard line
          
          // Add Visa rectangle at the right end of the yellow line
          const visaY = yellowEndY - hexHeight / 2; // Center the box vertically at the line's end Y position
          
          const visaBox = createStyledRect(visaX, visaY, updatedBridgeWidth, hexHeight, {
            fill: 'rgb(255,243,224)', // Light gold/amber interior
            stroke: 'rgb(243,194,70)', // Specified RGB border color
            strokeWidth: '2',
            rx: '5', // Rounded corners
            ry: '5' // Rounded corners
          });
          labelsGroup.appendChild(visaBox);
          
          // Add Visa label
          const visaText = createStyledText(
            visaX + updatedBridgeWidth / 2,
            visaY + hexHeight / 2,
            'Visa',
            {
              fill: 'rgb(243,194,70)', // Specified RGB text color
              fontSize: '12'
            }
          );
          labelsGroup.appendChild(visaText);
          
          // Add Medicare refund box above Visa box
          const medicareX = visaX; // Same X position as Visa
          const medicareY = visaY - hexHeight - squareRectGap; // Above Visa with same gap as IAC-CSHD
          
          const medicareBox = createStyledRect(medicareX, medicareY, updatedBridgeWidth, hexHeight, {
            fill: 'rgb(200,230,210)', // Light green interior
            stroke: 'rgb(57,130,73)', // Dark green border
            strokeWidth: '2',
            rx: '5', // Rounded corners
            ry: '5' // Rounded corners
          });
          labelsGroup.appendChild(medicareBox);
          
          // Add Medicare refund label
          const medicareText = createStyledText(
            medicareX + updatedBridgeWidth / 2,
            medicareY + hexHeight / 2,
            'Medicare refund',
            {
              fill: 'rgb(57,130,73)', // Dark green text
              fontSize: '12'
            }
          );
          labelsGroup.appendChild(medicareText);
          
          // Horizontal line connecting SSS/CCP to DvP RTGS
          const sssCcpLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          const sssCcpLineY = sssCcpY + smallRectHeight * 0.9 / 2; // Middle of SSS/CCP box
          sssCcpLine.setAttribute('x1', (alignedSssCcpX + alignedSssCcpWidth).toFixed(2)); // Right edge of aligned SSS/CCP
          sssCcpLine.setAttribute('y1', sssCcpLineY.toFixed(2));
          sssCcpLine.setAttribute('x2', dvpRtgsX.toFixed(2)); // Left edge of DvP RTGS
          sssCcpLine.setAttribute('y2', sssCcpLineY.toFixed(2));
          sssCcpLine.setAttribute('stroke', austraclearLineColor);
          sssCcpLine.setAttribute('stroke-width', austraclearLineWidth);
          sssCcpLine.setAttribute('stroke-linecap', 'round');
          svg.insertBefore(sssCcpLine, labelsGroup);
          
          // Straight line connecting trade-by-trade to DvP RTGS
          const tradeByTradeLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          const tradeByTradeLineY = tradeByTradeY + smallRectHeight * 0.9 / 2; // Middle of trade-by-trade box
          
          // Get the actual trade-by-trade width (with padding)
          const actualTradeByTradeWidth = window.asxBoxesAlignment ? 
            window.asxBoxesAlignment.width - (15 * 2) : 
            rectWidth;
          const actualTradeByTradeX = window.asxBoxesAlignment ? 
            window.asxBoxesAlignment.leftEdge + 15 : 
            moneyMarketX + (rectWidth * 1.2 - actualTradeByTradeWidth) / 2;
          tradeByTradeLine.setAttribute('x1', (actualTradeByTradeX + actualTradeByTradeWidth).toFixed(2)); // Right edge of trade-by-trade
          tradeByTradeLine.setAttribute('y1', tradeByTradeLineY.toFixed(2));
          tradeByTradeLine.setAttribute('x2', dvpRtgsX.toFixed(2)); // Left edge of DvP RTGS
          tradeByTradeLine.setAttribute('y2', tradeByTradeLineY.toFixed(2));
          tradeByTradeLine.setAttribute('stroke', austraclearLineColor);
          tradeByTradeLine.setAttribute('stroke-width', austraclearLineWidth);
          tradeByTradeLine.setAttribute('stroke-linecap', 'round');
          svg.insertBefore(tradeByTradeLine, labelsGroup); // Draw before boxes
          

          
          
          // Rectangle below SWIFT box
          // CLS AUD uses adjusted position if available
          const clsAudYFinal = window.clsAudAdjustedY || clsAudY;
          const bottomRect = createStyledRect(rectX, clsAudYFinal, swiftRectWidth, smallRectHeight, {
            fill: '#bdf7e9',
            stroke: '#0f766e',
            strokeWidth: '2'
            // No rx attribute = square corners
          });
          labelsGroup.appendChild(bottomRect);
          
          // Add label to bottom rectangle
          const bottomText = createStyledText(
            rectX + swiftRectWidth / 2,
            clsAudYFinal + smallRectHeight / 2,
            'CLS AUD',
            {
              fill: '#0f766e', // Dark gray text
              fontSize: '14' // Smaller than SWIFT PDS (18)
            }
          );
          labelsGroup.appendChild(bottomText);
          
          // Add connecting lines between the three left boxes and SWIFT PDS box
          const lineColor = '#3da88a'; // Brighter shade
          const lineWidth = '4'; // Thick lines
          // const hvcsShift = 15; // Already declared above
          
          // Connect each left box to the SWIFT box with parallel lines
          for (let j = 0; j < 3; j++) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            
            // Start from right edge of left box, middle height
            const pacsBoxWidth = 140 * 2/3;
            const smallRectX = rectX - horizontalGap - pacsBoxWidth - (horizontalGap + pacsBoxWidth) + (pacsBoxWidth * 0.75) + hvcsShift;
            const startX = smallRectX + pacsBoxWidth;
            const startY = rectY + (smallRectHeight + verticalGap) * j + smallRectHeight / 2;
            
            // End at left edge of SWIFT box, at same relative height (parallel lines)
            const endX = rectX;
            const endY = startY; // Keep same Y coordinate for parallel lines
            
            line.setAttribute('x1', startX.toFixed(2));
            line.setAttribute('y1', startY.toFixed(2));
            line.setAttribute('x2', endX.toFixed(2));
            line.setAttribute('y2', endY.toFixed(2));
            line.setAttribute('stroke', lineColor);
            line.setAttribute('stroke-width', lineWidth);
            line.setAttribute('stroke-linecap', 'round'); // Rounded line ends
            
            // Insert lines before rectangles so they appear behind
            svg.insertBefore(line, labelsGroup);
          }
          
          // SWIFT HVCS connecting lines removed
          
          // Removed horizontal line connecting pacs.009 to CLS AUD
          
          // Add curved lines from right side of boxes to big blue circle
          const curvedLineGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          
          // Get big blue circle position
          const bigCircleX = 300; // cx value
          const bigCircleY = 450; // cyBig value
          const bigCircleRadius = 113; // rBig value
          
          // Create curved lines from the boxes
          const rectYForCurves = window.swiftGroupAdjustedY || rectY;
          const clsAudYForCurves = window.clsAudAdjustedY || clsAudY;
          const curveSources = [
            // Three lines from SWIFT box (continuing from left pacs boxes)
            { x: rectX + swiftRectWidth, y: rectYForCurves + (smallRectHeight + verticalGap) * 0 + smallRectHeight / 2 },
            { x: rectX + swiftRectWidth, y: rectYForCurves + (smallRectHeight + verticalGap) * 1 + smallRectHeight / 2 },
            { x: rectX + swiftRectWidth, y: rectYForCurves + (smallRectHeight + verticalGap) * 2 + smallRectHeight / 2 },
            // Line from CLS AUD
            { x: rectX + swiftRectWidth, y: clsAudYForCurves + smallRectHeight / 2 },
            // Two lines from Austraclear
            { x: baseX + rectWidth, y: austraclearY + austraclearHeight / 3 },
            { x: baseX + rectWidth, y: austraclearY + 2 * austraclearHeight / 3 },
            // One line from CHESS-RTGS
            { x: baseX + rectWidth, y: chessY + smallRectHeight / 2 }
          ];
          
          curveSources.forEach((source, i) => {
            // Path will be created after d is calculated
            
            // Calculate end point on closest edge of circle
            // Find angle from source to circle center
            const dx = bigCircleX - source.x;
            const dy = bigCircleY - source.y;
            const angleToCenter = Math.atan2(dy, dx);
            
            // End point is on circle edge in direction of source
            const endX = bigCircleX - bigCircleRadius * Math.cos(angleToCenter);
            const endY = bigCircleY - bigCircleRadius * Math.sin(angleToCenter);
            
            // Control points for J-shaped curve
            const distX = endX - source.x;
            const distY = endY - source.y;
            
            // J-shape: go straight right, then curve down/up to target
            const controlX1 = source.x + Math.abs(distX) * 0.7; // Go mostly horizontal first
            const controlY1 = source.y; // Keep same height initially
            const controlX2 = endX - 10; // Near the end point
            const controlY2 = source.y + distY * 0.5; // Start curving vertically
            
            // Create path
            let d;
            if (i === 3) {
              // Special path for CLS AUD: exit left, U-turn under box
              const clsBoxLeftX = rectX; // Left edge of CLS AUD box
              const clsBoxCenterY = source.y;
              const clsBoxBottomY = clsAudY + smallRectHeight;
              
              // Exit from left side of CLS AUD box
              const startX = clsBoxLeftX;
              const startY = clsBoxCenterY;
              
              // C-curve ends closer to the box
              const curveEndX = clsBoxLeftX;
              const curveEndY = clsBoxBottomY + 20 - 8; // Raised by 8 pixels
              
              // How far left the curve extends (smaller curve)
              const curveExtent = 25;
              
              // Horizontal line extends to the right - keep original distance
              const lineEndX = clsBoxLeftX + swiftRectWidth + 20 + 20; // Original extension
              const lineEndY = curveEndY;
              
              // Create smaller C-curve followed by horizontal line
              const cp1X = startX - curveExtent;
              const cp1Y = startY;
              const cp2X = curveEndX - curveExtent;
              const cp2Y = curveEndY;
              
              d = `M ${startX} ${startY} ` +
                  `C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${curveEndX} ${curveEndY} ` +
                  `L ${lineEndX} ${lineEndY}`;
              
              // Store CLS AUD endpoint for sigmoid curve
              if (window.clsEndpoints) {
                window.clsEndpoints.audLineEndX = lineEndX;
                window.clsEndpoints.audLineEndY = lineEndY;
              }
            } else {
              d = `M ${source.x} ${source.y} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;
            }
            
            // Use blue color for Austraclear and CHESS-RTGS lines (indices 4, 5, 6)
            // Use neon green for CLS AUD line (index 3)
            let strokeColor;
            if (i === 3) {
              strokeColor = '#7FFF00'; // Neon lime green for CLS AUD
            } else if (i >= 4) {
              strokeColor = austraclearLineColor;
            } else {
              strokeColor = lineColor;
            }
            // Make CLS AUD line thicker
            const strokeWidth = (i === 3) ? '6' : '3';
            
            const path = createStyledPath(d, {
              stroke: strokeColor,
              strokeWidth: strokeWidth,
              fill: 'none',
              strokeLinecap: 'round'
            });
            
            // Make CHESS-RTGS line dotted (index 6)
            if (i === 6) {
              path.setAttribute('stroke-dasharray', '5,5');
            }
            
            curvedLineGroup.appendChild(path);
          });
          
          // Placeholder for sigmoid - will be added after we have the CLS dot position
          
          // Find the big blue circle element
          const bigBlueCircle = svg.querySelector('circle.big-fill');
          
          // Insert line group before the blue circle so lines appear behind it
          if (bigBlueCircle) {
            svg.insertBefore(curvedLineGroup, bigBlueCircle);
          } else {
            // Fallback: insert at the beginning of svg
            svg.insertBefore(curvedLineGroup, svg.firstChild);
          }
        }
        
        // Debug: log what was actually set
        if (i === 96) {
          console.log('Dot 96 attributes:', {
            fill: circle.getAttribute('fill'),
            stroke: circle.getAttribute('stroke'),
            strokeWidth: circle.getAttribute('stroke-width'),
            r: circle.getAttribute('r')
          });
        }
        
        
        if (showOrange) {
          // Orange circles are 2/3 the size of blue circles
          let orangeCircleRadius = blueRadius * (2/3);
          
          // For circles to touch: distance between centers = radius1 + radius2
          const innerOffset = blueRadius + orangeCircleRadius; // Sum of both radii
          
          // For first dot, calculate orange position relative to extended blue position
          let innerCircleX, innerCircleY;
          if (i === 0) {
            // Calculate orange position to touch the white dot on the arc side
            // The orange dot should be positioned between the white dot and the arc center
            const dx = actualCircleX - arcCenterX;
            const dy = actualCircleY - arcCenterY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            // Position orange dot closer to arc center by the offset distance
            innerCircleX = actualCircleX - (dx / dist) * innerOffset;
            innerCircleY = actualCircleY - (dy / dist) * innerOffset;
          } else {
            innerCircleX = arcCenterX + (arcRadiusX - innerOffset) * Math.cos(angle);
            innerCircleY = arcCenterY + (arcRadiusY - innerOffset) * Math.sin(angle);
          }
          
          const orangeCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          orangeCircle.setAttribute('cx', innerCircleX.toFixed(2));
          orangeCircle.setAttribute('cy', innerCircleY.toFixed(2));
          orangeCircle.setAttribute('r', orangeCircleRadius);
          orangeCircle.setAttribute('fill', '#f59e0b'); // orange fill
          orangeCircle.setAttribute('stroke', '#9a3412'); // dark orange stroke
          orangeCircle.setAttribute('stroke-width', '1');
          
          circlesGroup.appendChild(orangeCircle);
          
          // Create orange line from orange dot to center of small orange circle
          const orangeLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          orangeLine.setAttribute('x1', cx); // Center x of small orange circle
          orangeLine.setAttribute('y1', cySmall); // Center y of small orange circle
          orangeLine.setAttribute('x2', innerCircleX.toFixed(2));
          orangeLine.setAttribute('y2', innerCircleY.toFixed(2));
          orangeLine.setAttribute('stroke', '#f59e0b'); // orange color
          orangeLine.setAttribute('stroke-width', '2'); // thicker line
          orangeLine.setAttribute('opacity', '1'); // fully visible
          
          orangeLinesGroup.appendChild(orangeLine);
        }
        
        // Store dot positions for BDF square
        if (!window.dotPositions) window.dotPositions = {};
        window.dotPositions[i] = { x: actualCircleX, y: actualCircleY };
        
        // Get average Y position for middle dots to align labels properly
        if (!window.middleY && i === 53) {
          window.middleY = actualCircleY;
        }
        
        // Add labels for specific dots
        const dotLabels = {
          1: "Citibank, N.A.",
          2: "JPMorgan Chase Bank, National Association",
          45: "HSBC Bank Australia Limited",  // Back to 45
          46: "ING Bank (Australia) Limited",  // Back to 46
          50: "Australia and New Zealand Banking Group Limited",  // Changed from 51
          51: "Commonwealth Bank of Australia",  // Changed from 52
          52: "National Australia Bank Limited",  // Changed from 53
          53: "Westpac Banking Corporation",  // Changed from 54
          54: "Macquarie Bank Limited",  // Changed from 55
          55: "Bendigo and Adelaide Bank Limited",  // Changed from 56
          84: "Australian Settlements Limited",  // Changed from 85
          85: "Indue Ltd",  // Changed from 86
          87: "CUSCAL Limited",  // Changed from 88
          88: "Wise Australia Pty Limited",  // Changed from 89
          96: "ASX Settlement Pty Limited",
          97: "ASX Clearing Corporation Limited",
          98: "LCH Limited"
        };
        
        if (dotLabels[i]) {
          const label = dotLabels[i];
          
          // All labels to the right with proper vertical spacing
          let labelX = actualCircleX + 25;
          let labelY = actualCircleY;
          
          // Adjust vertical position to prevent overlaps
          if (i === 1) {
            // Citibank - lower slightly
            labelY = actualCircleY - 12;
          } else if (i === 2) {
            // JPMorgan - lower slightly
            labelY = actualCircleY - 2;
          } else if (i === 45) {
            // HSBC - moved down slightly
            labelX = actualCircleX + 25;
            labelY = actualCircleY - 1;  // Was -2, now -1 (moved down 1px)
          } else if (i === 46) {
            // ING - slightly below its dot to maintain spacing
            labelX = actualCircleX + 25;
            labelY = actualCircleY + 6;  // Was 5, now 6 (moved down 1px)
          } else if (i === 50) {
            // ANZ - nudged up more
            labelX = actualCircleX + 25;
            labelY = 360;  // Was 362, now 360
          } else if (i === 51) {
            // Commonwealth - nudged up more
            labelX = actualCircleX + 25;
            labelY = 370;  // Was 372, now 370
          } else if (i === 52) {
            // NAB - nudged up more
            labelX = actualCircleX + 25;
            labelY = 380;  // Was 382, now 380
          } else if (i === 53) {
            // Westpac - nudged up more
            labelX = actualCircleX + 25;
            labelY = 390;  // Was 392, now 390
          } else if (i === 54) {
            // Macquarie - moved up slightly
            labelX = actualCircleX + 25;
            labelY = 473;  // Was 475, now 473
          } else if (i === 55) {
            // Bendigo - moved up slightly
            labelX = actualCircleX + 25;
            labelY = 483;  // Was 485, now 483
          } else if (i === 84) {
            // Australian Settlements - horizontal with its dot
            labelX = actualCircleX + 25;
            labelY = actualCircleY - 2;
          } else if (i === 85) {
            // Indue Ltd - one line below Australian Settlements
            labelX = actualCircleX + 25;
            labelY = window.dotPositions[84] ? window.dotPositions[84].y + 8 : actualCircleY + 8;
          } else if (i === 87) {
            // CUSCAL - three lines below Australian Settlements
            labelX = actualCircleX + 25;
            labelY = window.dotPositions[84] ? window.dotPositions[84].y + 30 : actualCircleY + 30;
          } else if (i === 88) {
            // Wise Australia - four lines below Australian Settlements
            labelX = actualCircleX + 25;
            labelY = window.dotPositions[84] ? window.dotPositions[84].y + 40 : actualCircleY + 40;
          } else if (i === 96) {
            // ASX Settlement - level with its dot
            labelX = actualCircleX + 35; // Align horizontally
            labelY = actualCircleY - 1; // Same Y as dot, raised by 1 pixel
          } else if (i === 97) {
            // ASX Clearing - one line below ASX Settlement
            labelX = actualCircleX + 35; // Same X position
            labelY = window.dotPositions[96] ? window.dotPositions[96].y + 10 - 1 : actualCircleY + 10 - 1; // Raised by 1 pixel
          } else if (i === 98) {
            // LCH Limited - one line below ASX Clearing
            labelX = actualCircleX + 35; // Same X position
            labelY = window.dotPositions[96] ? window.dotPositions[96].y + 20 - 1 : actualCircleY + 20 - 1; // Raised by 1 pixel
          }
          
          // Add pointer line from edge of dot
          // Calculate edge position based on dot radius
          let dotRadius = showOrange ? smallCircleRadius * 2 : smallCircleRadius;
          if (i >= 50 && i < 54) dotRadius = dotRadius * 1.5;
          if (i >= 96) dotRadius = smallCircleRadius * 2;
          if (i === 99) dotRadius = smallCircleRadius * 12;
          
          // For ANZ to Bendigo (indices 50-55), create kinked lines
          // ASX/LCH labels (96-98) now use straight lines
          // Groups 2, 3, 5a, 5b now use straight lines
          if (i >= 50 && i <= 55) {
            labelX += 8; // Shift ANZ-Bendigo labels 8 pixels to the right
            
            // Create path for kinked line: diagonal then horizontal
            const startX = actualCircleX + dotRadius;
            const startY = actualCircleY;
            const endX = labelX - 5;
            const endY = labelY;
            const midX = endX - 8; // Start horizontal segment only 8px before label
            
            const path = createStyledPath(
              `M ${startX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`,
              {
                stroke: '#000000',
                strokeWidth: '0.5',
                fill: 'none'
              }
            );
            labelsGroup.appendChild(path);
          } else {
            // Regular straight line for other labels
            const pointerLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            pointerLine.setAttribute('x1', actualCircleX + dotRadius);
            pointerLine.setAttribute('y1', actualCircleY);
            pointerLine.setAttribute('x2', labelX - 5);
            pointerLine.setAttribute('y2', labelY);
            pointerLine.setAttribute('stroke', '#000000');
            pointerLine.setAttribute('stroke-width', '0.5');
            labelsGroup.appendChild(pointerLine);
          }
          
          // Add text label
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', labelX);
          text.setAttribute('y', labelY);
          text.setAttribute('text-anchor', 'start');
          text.setAttribute('dominant-baseline', 'middle');
          // Make ANZ, Commonwealth, NAB, and Westpac labels red
          if (i >= 50 && i <= 53) {
            text.setAttribute('fill', '#991b1b'); // dark red like BDF border
          } else {
            text.setAttribute('fill', '#000000'); // black for other labels
          }
          text.setAttribute('font-family', 'Arial, sans-serif');
          text.setAttribute('font-size', '10');
          text.textContent = label;
          labelsGroup.appendChild(text);
        }
      }

      // Add BDF square for dots 50-53
      if (window.dotPositions && window.dotPositions[50] && window.dotPositions[53]) {
        const squareSize = 60; // 50% larger (was 40)
        // Calculate position for BDF square (moved further right)
        const bdfX = window.dotPositions[50].x + 60 + squareSize/2; // Moved further right
        const bdfY = (window.dotPositions[50].y + window.dotPositions[53].y) / 2 + 60; // Shifted down by 60px (was 55)
        
        // Create square with lighter red fill and dark red border
        const bdfSquare = createStyledRect(bdfX - squareSize/2, bdfY - squareSize/2, squareSize, squareSize, {
          fill: '#000000', // black fill
          stroke: '#991b1b', // dark red border
          strokeWidth: '3'
          // No rx/ry = square corners
        });
        labelsGroup.appendChild(bdfSquare);
        
        // Add kinked lines from dots 50-53 to the square
        const boxLeftX = bdfX - squareSize/2;
        const boxTopY = bdfY - squareSize/2;
        const boxBottomY = bdfY + squareSize/2;
        
        for (let j = 50; j <= 53; j++) {
          if (window.dotPositions[j]) {
            // Get dot radius for this dot
            const dotRadius = smallCircleRadius * 2 * 1.5; // These are all large dots
            
            // Calculate connection point on box's left edge
            // Connect at 0.2, 0.4, 0.6, and 0.8 of the box height
            const connectionPoints = [0.2, 0.4, 0.6, 0.8];
            const boxConnectY = boxTopY + connectionPoints[j - 50] * (boxBottomY - boxTopY);
            
            // Create kinked path: diagonal then horizontal
            const startX = window.dotPositions[j].x + dotRadius;
            const startY = window.dotPositions[j].y;
            const endX = boxLeftX;
            const endY = boxConnectY;
            const midX = endX - 20; // Start horizontal segment 20px before box
            
            const path = createStyledPath(
              `M ${startX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`,
              {
                stroke: '#991b1b', // dark red
                strokeWidth: '2', // Thicker lines
                fill: 'none'
              }
            );
            labelsGroup.appendChild(path);
          }
        }
        
        // Dark red lines are now drawn before the blue circle (moved earlier in the code)
        // Note: These positions are defined earlier in the code
        if (false && typeof window.hexagonPositions !== 'undefined' && window.hexagonPositions.asxfY !== undefined) {
          const darkRedLineColor = '#DC143C'; // Brighter crimson red
          const hexagonLines = [
            // From bottom right diagonal of PEXA
            { x: window.hexagonPositions.pexaX + window.hexagonPositions.pexaWidth, 
              y: window.hexagonPositions.pexaY + window.hexagonPositions.hexHeight / 2, label: 'PEXA bottom' },
            // From top right edge of ASXF
            { x: window.hexagonPositions.asxfX + window.hexagonPositions.asxfWidth, 
              y: window.hexagonPositions.asxfY + window.hexagonPositions.asxfHeight / 4, label: 'ASXF top' },
            // From bottom right edge of ASXF
            { x: window.hexagonPositions.asxfX + window.hexagonPositions.asxfWidth, 
              y: window.hexagonPositions.asxfY + 3 * window.hexagonPositions.asxfHeight / 4, label: 'ASXF bottom' }
          ];
        
          // Get big blue circle position (same as used for other curved lines)
          const bigCircleX = 300; // cx value
          const bigCircleY = 450; // cyBig value
          const bigCircleRadius = 113; // rBig value
          
          hexagonLines.forEach((source, i) => {
            
            // Calculate angle to blue circle
            const dx = bigCircleX - source.x;
            const dy = bigCircleY - source.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Calculate end point on closest edge of circle
            // Find angle from source to circle center
            const angleToCenter = Math.atan2(dy, dx);
            
            // End point is on circle edge in direction of source
            const endX = bigCircleX - bigCircleRadius * Math.cos(angleToCenter);
            const endY = bigCircleY - bigCircleRadius * Math.sin(angleToCenter);
            
            // Control points for J-shaped curve (same as SWIFT lines)
            const distX = endX - source.x;
            const distY = endY - source.y;
            
            // J-shape: go straight right, then curve down/up to target
            const controlX1 = source.x + Math.abs(distX) * 0.7; // Go mostly horizontal first
            const controlY1 = source.y; // Keep same height initially
            const controlX2 = endX - 10; // Near the end point
            const controlY2 = source.y + distY * 0.5; // Start curving vertically
            
            // Create path
            const pathData = `M ${source.x} ${source.y} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;
            
            const path = createStyledPath(pathData, {
              stroke: darkRedLineColor,
              strokeWidth: '3', // Same as SWIFT lines
              fill: 'none',
              strokeLinecap: 'round' // Same as SWIFT lines
            });
            labelsGroup.appendChild(path);
        });
        }
        
        // Add BDF text (after lines so it appears on top)
        const bdfText = createStyledText(
          parseFloat(bdfX),
          parseFloat(bdfY),
          'BDF',
          {
            fill: 'white',
            fontSize: '20' // Larger font for larger box
          }
        );
        labelsGroup.appendChild(bdfText);
      }

      // Add background rectangle for all blue dots
      if (window.dotPositions && window.dotPositions[0] && window.dotPositions[99]) {
        const esaRect = document.getElementById('blue-dots-background');
        
        // Find the boundaries
        let minX = window.dotPositions[0].x;
        let minY = window.dotPositions[0].y;
        let maxX = window.dotPositions[0].x;
        let maxY = window.dotPositions[99].y;
        
        // Check all blue dots to find the rightmost position
        for (let i = 0; i < 100; i++) {
          if (window.dotPositions[i]) {
            maxX = Math.max(maxX, window.dotPositions[i].x);
          }
        }
        
        // Add padding
        const padding = 15;
        const leftPadding = 50; // Increased to move left edge left
        const topPadding = 20; // Increased padding for raised RBA dot
        const bottomPadding = 70; // Extended by 40 to poke out under Non-ADIs box
        const rightPadding = 5; // Extra padding to include labels and BDF box
        
        // Account for dot radius
        const dotRadius = smallCircleRadius * 2 * 1.5;
        
        // Include labels and BDF box
        // BDF box extends about 90-100 pixels right from dots
        
        // Set rectangle attributes
        const rectX = minX - leftPadding - dotRadius;
        const rectY = minY - topPadding - dotRadius;
        esaRect.setAttribute('x', rectX);
        esaRect.setAttribute('y', rectY);
        esaRect.setAttribute('width', (maxX - minX) + leftPadding + rightPadding + dotRadius * 2);
        esaRect.setAttribute('height', (maxY - minY) + topPadding + bottomPadding + dotRadius * 2);
        esaRect.setAttribute('fill', '#e5e7eb'); // Light grey
        esaRect.setAttribute('fill-opacity', '1'); // Fully opaque
        esaRect.setAttribute('stroke', '#6b7280'); // Grey border
        esaRect.setAttribute('stroke-width', '2'); // Sharp border
        // Square edges - no rx attribute
        
        // Add ESAs label to top right corner of grey rectangle
        const rectWidth = (maxX - minX) + leftPadding + rightPadding + dotRadius * 2;
        const esasText = createStyledText(
          rectX + rectWidth - 10, // 10px from right edge
          rectY + 15, // 15px from top edge
          'ESAs',
          {
            textAnchor: 'end',
            fill: '#6b7280', // grey color
            fontSize: '14' // Smaller than RBA text (16)
          }
        );
        labelsGroup.appendChild(esasText);
        
        // Add second ESAs label to bottom left corner of grey rectangle
        const rectHeight = (maxY - minY) + topPadding + bottomPadding + dotRadius * 2;
        const esasText2 = createStyledText(
          rectX + 10, // 10px from left edge
          rectY + rectHeight - 15, // 15px from bottom edge
          'ESAs',
          {
            textAnchor: 'start',
            fill: '#6b7280', // grey color (same as top label)
            fontSize: '14' // Same as top label
          }
        );
        labelsGroup.appendChild(esasText2);
        
        // Add dark red LVSS gear circle above Administered Batches box
        // Position LVSS to the right of the moved boxes
        // Use stored mastercard position
        const mastercardRightEdgeForLVSS = window.hexagonPositions.mastercardX + window.hexagonPositions.mastercardWidth;
        const redCircleX = mastercardRightEdgeForLVSS + 50 + 37 * 1.2; // Position 50px to the right of the moved boxes, plus half the circle width (radius increased by 20%)
        
        // Create LVSS group for layered gear effect
        const lvssGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // Layer 1: Darkest red background circle
        const redCircleOuter = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const redCircleRadius = 37 * 1.2; // Increased by 20% (44.4)
        // Position above Administered Batches box
        const mastercardY_ref = window.hexagonPositions ? window.hexagonPositions.mastercardY || 320 : 320;
        // Position at same level as APCS box
        const verticalGap_ref = 5; // Same as defined earlier
        const hexHeight_ref = window.hexagonPositions ? window.hexagonPositions.hexHeight || 20 : 20;
        const apcsY_ref = mastercardY_ref - (verticalGap_ref * 2) - hexHeight_ref - 20;
        // Calculate LVSS Y to make IAC line horizontal
        // IAC (CECS) Y position will be cecsY + boxHeight / 2
        // We need to match this Y position
        let redCircleY;
        if (window.needsLvssUpdate && window.needsLvssUpdate.y) {
          // Use the updated position that was calculated when boxes were positioned
          redCircleY = window.needsLvssUpdate.y;
          console.log('LVSS using needsLvssUpdate Y:', redCircleY);
        } else if (window.lvssBoxPositions && window.lvssBoxPositions.cecsY) {
          // CECS has height of boxHeight, so center is at cecsY + (boxHeight / 2)
          redCircleY = window.lvssBoxPositions.cecsY + (window.lvssBoxPositions.boxHeight / 2);
          console.log('LVSS using lvssBoxPositions Y:', redCircleY);
        } else {
          // Fallback
          redCircleY = apcsY_ref + hexHeight_ref / 2;
          console.log('LVSS using fallback Y:', redCircleY);
        }
        
        // Remove the outer circle - comment it out to show gear shape better
        // redCircleOuter.setAttribute('cx', redCircleX);
        // redCircleOuter.setAttribute('cy', redCircleY);
        // redCircleOuter.setAttribute('r', redCircleRadius);
        // redCircleOuter.setAttribute('fill', '#7f1d1d'); // Dark red
        // lvssGroup.appendChild(redCircleOuter);
        
        // Layer 2: Gear border (using the same createGearPath function as FSS)
        const strokeW = 3;
        const outerRadius = redCircleRadius - strokeW * 0.5;
        const innerRadius = redCircleRadius - strokeW * 2;
        const teeth = 12;
        const toothHeight = 3;
        
        // Create gear shape that fills between outer circle and inner circle
        let path = createGearPath(outerRadius - toothHeight, teeth, toothHeight, 0.25);
        // Add inner cutout
        path += ` M ${innerRadius} 0 A ${innerRadius} ${innerRadius} 0 1 0 ${-innerRadius} 0 A ${innerRadius} ${innerRadius} 0 1 0 ${innerRadius} 0`;
        
        const gearBorder = createStyledPath(path, {
          fill: '#800000' // Maroon for gear
        });
        gearBorder.setAttribute('transform', `translate(${redCircleX}, ${redCircleY})`);
        gearBorder.setAttribute('fill-rule', 'evenodd');
        lvssGroup.appendChild(gearBorder);
        
        // Layer 3: Inner circle
        const redCircleInner = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        redCircleInner.setAttribute('cx', redCircleX);
        redCircleInner.setAttribute('cy', redCircleY);
        redCircleInner.setAttribute('r', innerRadius); // Exact innerRadius to fill the cutout completely
        redCircleInner.setAttribute('fill', '#DC3958'); // Rose red
        lvssGroup.appendChild(redCircleInner);
        
        labelsGroup.appendChild(lvssGroup);
        
        // Add LVSS label to red circle
        const lvssText = createStyledText(
          redCircleX,
          redCircleY,
          'LVSS',
          {
            fill: '#ffffff', // White text for contrast
            fontSize: '16' // Smaller for smaller circle
          }
        );
        labelsGroup.appendChild(lvssText);
        
        // Store LVSS position for connecting lines
        window.lvssPosition = {
          x: redCircleX,
          y: redCircleY,
          radius: redCircleRadius
        };
        
        // Now draw magenta-rose lines from boxes to LVSS
        if (window.lvssBoxPositions) {
          const magentaRoseColor = '#8B1538'; // Saddle brown shade
          const lvssLines = [];
          const lvssX = window.lvssPosition.x;
          const lvssY = window.lvssPosition.y;
          const lvssRadius = window.lvssPosition.radius;
          
          // Blue circle position
          const blueCircleX = 300;
          const blueCircleY = 450;
          const blueCircleRadius = 113;
          
          const narrowBoxX = window.lvssBoxPositions.narrowBoxX;
          const narrowBoxWidth = window.lvssBoxPositions.narrowBoxWidth;
          const boxHeight = window.lvssBoxPositions.boxHeight;
          
          // IAC (CECS) - thick line
          const iacLineY = window.lvssBoxPositions.cecsY + boxHeight / 2;
          
          // Force LVSS to be at same Y as IAC
          const yDiff = iacLineY - lvssY;
          if (Math.abs(yDiff) > 1) { // Only adjust if difference is significant
            console.log('Adjusting LVSS Y from', lvssY, 'to', iacLineY, 'diff:', yDiff);
            
            // Find and move all LVSS elements
            const allCircles = labelsGroup.querySelectorAll('circle');
            allCircles.forEach(circle => {
              const cx = parseFloat(circle.getAttribute('cx'));
              const cy = parseFloat(circle.getAttribute('cy'));
              // Check if this is an LVSS circle (at the LVSS X position)
              if (Math.abs(cx - lvssX) < 1) {
                circle.setAttribute('cy', cy + yDiff);
              }
            });
            
            // Find and move LVSS text
            const allTexts = labelsGroup.querySelectorAll('text');
            allTexts.forEach(text => {
              if (text.textContent === 'LVSS') {
                const currentY = parseFloat(text.getAttribute('y'));
                text.setAttribute('y', currentY + yDiff);
              }
            });
            
            // Move gear paths
            const allPaths = labelsGroup.querySelectorAll('path');
            allPaths.forEach(path => {
              const d = path.getAttribute('d');
              if (d && d.includes('M ' + lvssX)) {
                // This is likely an LVSS gear path
                const transform = path.getAttribute('transform') || '';
                path.setAttribute('transform', transform + ` translate(0, ${yDiff})`);
              }
            });
            
            // Update the LVSS Y for line drawing
            window.lvssPosition.y = iacLineY;
            lvssY = iacLineY;
          }
          
          console.log('IAC line Y:', iacLineY, 'LVSS Y:', lvssY);
          console.log('Difference (IAC - LVSS):', iacLineY - lvssY);
          lvssLines.push({
            x: narrowBoxX + narrowBoxWidth,
            y: iacLineY,
            label: 'IAC',
            thickness: 3
          });
          
          // CSHD - thin line
          lvssLines.push({
            x: narrowBoxX + narrowBoxWidth,
            y: window.lvssBoxPositions.cshdY + boxHeight / 2,
            label: 'CSHD',
            thickness: 1.5
          });
          
          // BECS - two thick lines at 1/3 and 2/3 from top
          lvssLines.push({
            x: narrowBoxX + narrowBoxWidth,
            y: window.lvssBoxPositions.becsY + boxHeight / 3,  // 1/3 from top
            label: 'BECS-1',
            thickness: 3
          });
          
          lvssLines.push({
            x: narrowBoxX + narrowBoxWidth,
            y: window.lvssBoxPositions.becsY + boxHeight * 2 / 3,  // 2/3 from top
            label: 'BECS-2',
            thickness: 3
          });
          
          // APCS - thin line
          lvssLines.push({
            x: narrowBoxX + narrowBoxWidth,
            y: window.lvssBoxPositions.apcsY + boxHeight / 2,
            label: 'APCS',
            thickness: 1.5
          });
          
          // GABS - thick line
          lvssLines.push({
            x: narrowBoxX + narrowBoxWidth,
            y: window.lvssBoxPositions.gabsY + boxHeight / 2,
            label: 'GABS',
            thickness: 3
          });
          
          // Draw the lines
          lvssLines.forEach((source, index) => {
            
            // All lines should pass through LVSS center
            const lvssCenterX = lvssX;
            const lvssCenterY = lvssY;
            
            // Lines should stay close together
            // Small vertical offset to keep lines visible but close
            const lineSpacing = 5; // pixels between lines
            // IAC (index 0) should have no offset to be perfectly horizontal
            const verticalOffset = source.label === 'IAC' ? 0 : (index - 2) * lineSpacing;
            
            // Calculate path that goes slightly above/below LVSS center
            const lvssPassY = lvssCenterY + verticalOffset;
            
            // End point on blue circle - also with small vertical offset
            const angleToBlue = Math.atan2(blueCircleY - lvssCenterY, blueCircleX - lvssCenterX);
            // Extend slightly into the circle by reducing the radius offset
            const endX = blueCircleX - (blueCircleRadius - 5) * Math.cos(angleToBlue);
            const endY = blueCircleY - (blueCircleRadius - 5) * Math.sin(angleToBlue) + verticalOffset;
            
            // Create path that goes through LVSS area with offset
            // First segment: from source to LVSS pass point
            const dx1 = lvssCenterX - source.x;
            // For IAC, make sure it's perfectly horizontal
            const sourceY = source.label === 'IAC' ? lvssCenterY : source.y;
            const dy1 = lvssPassY - sourceY;
            
            // Control point for first curve
            const control1X = source.x + dx1 * 0.6;
            const control1Y = sourceY + dy1 * 0.3;
            
            // Second segment: from LVSS pass point to blue circle
            const dx2 = endX - lvssCenterX;
            const dy2 = endY - lvssPassY;
            
            // Control point for second curve
            const control2X = lvssCenterX + dx2 * 0.4;
            const control2Y = lvssPassY + dy2 * 0.3;
            
            // Create double line effect like eftpos/pexa
            const lineGap = 3; // Gap between the two lines
            const maroonColor = '#800000'; // Maroon color
            
            // Create two parallel paths for double line effect
            for (let lineOffset of [-lineGap/2, lineGap/2]) {
              // Offset the path perpendicular to its direction
              const angle = Math.atan2(dy1, dx1);
              const offsetX = -Math.sin(angle) * lineOffset;
              const offsetY = Math.cos(angle) * lineOffset;
              
              // Create offset path data
              const offsetPathData = `M ${source.x + offsetX} ${sourceY + offsetY} 
                                     Q ${control1X + offsetX} ${control1Y + offsetY}, ${lvssCenterX + offsetX} ${lvssPassY + offsetY}
                                     Q ${control2X + offsetX} ${control2Y + offsetY}, ${endX + offsetX} ${endY + offsetY}`;
              
              const parallelPath = createStyledPath(offsetPathData, {
                stroke: maroonColor,
                strokeWidth: '1.5', // Thin lines for double effect
                fill: 'none',
                strokeLinecap: 'round'
              });
              svg.insertBefore(parallelPath, svg.firstChild); // Insert at beginning so lines appear behind everything
            }
          });
        }
        
        // Add second rectangle for dots excluding special ones (RBA, red, green, magenta bordered)
        // This excludes dots: 0 (RBA), 92-95 (red border), 96-98 (green border), 99 (magenta/CLS)
        let minX2 = null, minY2 = null, maxX2 = null, maxY2 = null;
        
        // Find boundaries excluding special dots
        for (let i = 1; i < 92; i++) {  // Start from 1 (skip RBA) and go up to 91
          if (window.dotPositions[i]) {
            if (minX2 === null || window.dotPositions[i].x < minX2) minX2 = window.dotPositions[i].x;
            if (maxX2 === null || window.dotPositions[i].x > maxX2) maxX2 = window.dotPositions[i].x;
            if (minY2 === null || window.dotPositions[i].y < minY2) minY2 = window.dotPositions[i].y;
            if (maxY2 === null || window.dotPositions[i].y > maxY2) maxY2 = window.dotPositions[i].y;
          }
        }
        
        if (minX2 !== null && maxX2 !== null) {
          // Use similar padding but slightly less
          const innerPadding = 10;
          const innerLeftPadding = 60; // Increased to move left edge left
          const innerTopPadding = 30;
          const innerBottomPadding = 5; // Decreased to raise bottom edge
          const innerRightPadding = 290;
          
          const adiRect = createStyledRect(
            minX2 - innerLeftPadding - dotRadius,
            minY2 - innerTopPadding - dotRadius,
            (maxX2 - minX2) + innerLeftPadding + innerRightPadding + dotRadius * 2,
            (maxY2 - minY2) + innerTopPadding + innerBottomPadding + dotRadius * 2,
            {
              fill: '#dbeafe', // Light blue
              stroke: '#2563eb', // Darker blue border
              strokeWidth: '2',
              rx: '8' // Slightly less rounded corners
            }
          );
          adiRect.setAttribute('fill-opacity', '0.25'); // Less opaque
          
          // Insert after the background rectangle so it appears above it
          const esaRect = document.getElementById('blue-dots-background');
          svg.insertBefore(adiRect, esaRect.nextSibling);
          
          // Store ADI box position for HVCS line
          if (!window.adiBoxData) window.adiBoxData = {};
          window.adiBoxData.x = minX2 - innerLeftPadding - dotRadius;
          window.adiBoxData.y = minY2 - innerTopPadding - dotRadius;
          window.adiBoxData.width = (maxX2 - minX2) + innerLeftPadding + innerRightPadding + dotRadius * 2;
          window.adiBoxData.height = (maxY2 - minY2) + innerTopPadding + innerBottomPadding + dotRadius * 2;
          
          // Add "ADIs" text to top right corner of inner blue box
          const adiRectX = parseFloat(adiRect.getAttribute('x'));
          const adiRectY = parseFloat(adiRect.getAttribute('y'));
          const adiRectWidth = parseFloat(adiRect.getAttribute('width'));
          
          // Position in top right corner with padding
          const adisText = createStyledText(
            adiRectX + adiRectWidth - 15,
            adiRectY + 35,
            'ADIs',
            {
              textAnchor: 'end',
              fill: '#2563eb', // Blue color
              fontSize: '24' // Slightly bigger
            }
          );
          labelsGroup.appendChild(adisText);
        }
        
        // Add third rectangle for groups 2 and 3 (dots 1-49)
        let minX3 = null, minY3 = null, maxX3 = null, maxY3 = null;
        
        // Find boundaries for dots 1-49
        for (let i = 1; i <= 49; i++) {
          if (window.dotPositions[i]) {
            if (minX3 === null || window.dotPositions[i].x < minX3) minX3 = window.dotPositions[i].x;
            if (maxX3 === null || window.dotPositions[i].x > maxX3) maxX3 = window.dotPositions[i].x;
            if (minY3 === null || window.dotPositions[i].y < minY3) minY3 = window.dotPositions[i].y;
            if (maxY3 === null || window.dotPositions[i].y > maxY3) maxY3 = window.dotPositions[i].y;
          }
        }
        
        if (minX3 !== null && maxX3 !== null) {
          // Use smaller padding for the yellow rectangle
          const yellowLeftPadding = 10;
          const yellowTopPadding = 20;
          const yellowBottomPadding = 17;
          const yellowRightPadding = 210;
          
          const yellowRect = createStyledRect(
            minX3 - yellowLeftPadding - dotRadius,
            minY3 - yellowTopPadding - dotRadius,
            (maxX3 - minX3) + yellowLeftPadding + yellowRightPadding + dotRadius * 2,
            (maxY3 - minY3) + yellowTopPadding + yellowBottomPadding + dotRadius * 2,
            {
              fill: '#dde6ff', // Light blue with hint of purple
              stroke: '#4c63d2', // Darker blue border
              strokeWidth: '1',
              rx: '6' // Smaller rounded corners
            }
          );
          yellowRect.setAttribute('fill-opacity', '0.9'); // Almost opaque
          
          // Insert after the inner rectangle so it appears on top
          svg.insertBefore(yellowRect, blueLinesGroup);
          
          // Add "International Banks" text to top right corner of yellow rectangle (two lines)
          const yellowRectX = parseFloat(yellowRect.getAttribute('x'));
          const yellowRectY = parseFloat(yellowRect.getAttribute('y'));
          const yellowRectWidth = parseFloat(yellowRect.getAttribute('width'));
          
          // First line: "International"
          const intlText = createStyledText(
            yellowRectX + yellowRectWidth - 15,
            yellowRectY + 20,
            'International',
            {
              textAnchor: 'end',
              fill: '#4c63d2', // Darker blue color
              fontSize: '14' // Same size as Domestic Banks
            }
          );
          labelsGroup.appendChild(intlText);
          
          // Second line: "Banks"
          const banksText = createStyledText(
            yellowRectX + yellowRectWidth - 15,
            yellowRectY + 35,  // 15px below first line
            'Banks',
            {
              textAnchor: 'end',
              fill: '#4c63d2', // Darker blue color
              fontSize: '14' // Same size as Domestic Banks
            }
          );
          labelsGroup.appendChild(banksText);
        }
        
        // Add fourth rectangle for group 4 (dots 50-83)
        let minX4 = null, minY4 = null, maxX4 = null, maxY4 = null;
        
        // Find boundaries for dots 50-83
        for (let i = 50; i <= 83; i++) {
          if (window.dotPositions[i]) {
            if (minX4 === null || window.dotPositions[i].x < minX4) minX4 = window.dotPositions[i].x;
            if (maxX4 === null || window.dotPositions[i].x > maxX4) maxX4 = window.dotPositions[i].x;
            if (minY4 === null || window.dotPositions[i].y < minY4) minY4 = window.dotPositions[i].y;
            if (maxY4 === null || window.dotPositions[i].y > maxY4) maxY4 = window.dotPositions[i].y;
          }
        }
        
        if (minX4 !== null && maxX4 !== null) {
          // Use even smaller padding for the green rectangle
          const greenLeftPadding = 100;
          const greenTopPadding = 6;
          const greenBottomPadding = 0;
          const greenRightPadding = 280;
          
          const greenRect = createStyledRect(
            minX4 - greenLeftPadding - dotRadius,
            minY4 - greenTopPadding - dotRadius,
            (maxX4 - minX4) + greenLeftPadding + greenRightPadding + dotRadius * 2,
            (maxY4 - minY4) + greenTopPadding + greenBottomPadding + dotRadius * 2,
            {
              fill: '#e4d4f4', // Light Excel purple
              stroke: '#7030a0', // Excel purple border
              strokeWidth: '1',
              rx: '5' // Smaller rounded corners
            }
          );
          greenRect.setAttribute('fill-opacity', '0.9'); // Almost opaque
          
          // Insert after the yellow rectangle so it appears on top
          svg.insertBefore(greenRect, blueLinesGroup);
          
          // Add "Domestic Banks" text to bottom right corner of purple rectangle
          const greenRectX = parseFloat(greenRect.getAttribute('x'));
          const greenRectY = parseFloat(greenRect.getAttribute('y'));
          const greenRectWidth = parseFloat(greenRect.getAttribute('width'));
          const greenRectHeight = parseFloat(greenRect.getAttribute('height'));
          
          // Position in bottom right corner with padding
          const domesticBanksText = createStyledText(
            greenRectX + greenRectWidth - 15,
            greenRectY + greenRectHeight - 10,
            'Domestic Banks',
            {
              textAnchor: 'end',
              fill: '#7030a0', // Excel purple matching the border
              fontSize: '14' // Smaller than ADIs font (16)
            }
          );
          labelsGroup.appendChild(domesticBanksText);
        }
        
        // Add fifth rectangle for Group 2 (dots 1-44)
        let minX5 = null, minY5 = null, maxX5 = null, maxY5 = null;
        
        // Find boundaries for dots 1-44
        for (let i = 1; i <= 44; i++) {
          if (window.dotPositions[i]) {
            if (minX5 === null || window.dotPositions[i].x < minX5) minX5 = window.dotPositions[i].x;
            if (maxX5 === null || window.dotPositions[i].x > maxX5) maxX5 = window.dotPositions[i].x;
            if (minY5 === null || window.dotPositions[i].y < minY5) minY5 = window.dotPositions[i].y;
            if (maxY5 === null || window.dotPositions[i].y > maxY5) maxY5 = window.dotPositions[i].y;
          }
        }
        
        if (minX5 !== null && maxX5 !== null) {
          // Use tight padding for Group 2 rectangle
          const group2LeftPadding = 5;
          const group2TopPadding = 15;
          const group2BottomPadding = -3;
          const group2RightPadding = 110;
          
          const group2Rect = createStyledRect(
            minX5 - group2LeftPadding - dotRadius,
            minY5 - group2TopPadding - dotRadius,
            (maxX5 - minX5) + group2LeftPadding + group2RightPadding + dotRadius * 2,
            (maxY5 - minY5) + group2TopPadding + group2BottomPadding + dotRadius * 2,
            {
              fill: '#e0f2fe', // Very light blue (same as group 3)
              stroke: '#38bdf8', // Sky blue border (same as group 3)
              strokeWidth: '0.5',
              rx: '4' // Small rounded corners
            }
          );
          group2Rect.setAttribute('fill-opacity', '0.4'); // Made less opaque
          
          // Insert on top of other rectangles
          svg.insertBefore(group2Rect, blueLinesGroup);
          
          // Add "Foreign Branches" text to bottom left corner of group 2 box
          const group2RectX = parseFloat(group2Rect.getAttribute('x'));
          const group2RectY = parseFloat(group2Rect.getAttribute('y'));
          const group2RectHeight = parseFloat(group2Rect.getAttribute('height'));
          const group2RectWidth = parseFloat(group2Rect.getAttribute('width'));
          
          // Position in bottom right corner with padding
          const foreignBranchesText = createStyledText(
            group2RectX + group2RectWidth - 10,
            group2RectY + group2RectHeight - 10,
            'Foreign Branches',
            {
              textAnchor: 'end',
              fill: '#0284c7', // Sky blue (same as group 3)
              fontSize: '12', // Smaller font
              fontWeight: 'normal'
            }
          );
          labelsGroup.appendChild(foreignBranchesText);
        }
        
        // Add sixth rectangle for Group 3 (dots 45-49)
        let minX6 = null, minY6 = null, maxX6 = null, maxY6 = null;
        
        // Find boundaries for dots 45-49
        for (let i = 45; i <= 49; i++) {
          if (window.dotPositions[i]) {
            if (minX6 === null || window.dotPositions[i].x < minX6) minX6 = window.dotPositions[i].x;
            if (maxX6 === null || window.dotPositions[i].x > maxX6) maxX6 = window.dotPositions[i].x;
            if (minY6 === null || window.dotPositions[i].y < minY6) minY6 = window.dotPositions[i].y;
            if (maxY6 === null || window.dotPositions[i].y > maxY6) maxY6 = window.dotPositions[i].y;
          }
        }
        
        if (minX6 !== null && maxX6 !== null) {
          // Use tight padding for Group 3 rectangle
          const group3LeftPadding = 8;
          const group3TopPadding = 1;
          const group3BottomPadding = 12;
          const group3RightPadding = 205;
          
          const group3Rect = createStyledRect(
            minX6 - group3LeftPadding - dotRadius,
            minY6 - group3TopPadding - dotRadius,
            (maxX6 - minX6) + group3LeftPadding + group3RightPadding + dotRadius * 2,
            (maxY6 - minY6) + group3TopPadding + group3BottomPadding + dotRadius * 2,
            {
              fill: '#e0f2fe', // Very light blue
              stroke: '#38bdf8', // Sky blue border
              strokeWidth: '0.5',
              rx: '4' // Small rounded corners
            }
          );
          group3Rect.setAttribute('fill-opacity', '0.4'); // Made less opaque
          
          // Insert on top of other rectangles
          svg.insertBefore(group3Rect, blueLinesGroup);
          
          // Add "Foreign Subsidiaries" text to bottom left corner of group 3 box
          const group3RectX = parseFloat(group3Rect.getAttribute('x'));
          const group3RectY = parseFloat(group3Rect.getAttribute('y'));
          const group3RectHeight = parseFloat(group3Rect.getAttribute('height'));
          const group3RectWidth = parseFloat(group3Rect.getAttribute('width'));
          
          // Position in bottom right corner with padding
          const foreignSubsText = createStyledText(
            group3RectX + group3RectWidth - 10,
            group3RectY + group3RectHeight - 6,
            'Foreign Subsidiaries',
            {
              textAnchor: 'end',
              fill: '#0284c7', // Sky blue
              fontSize: '12', // Smaller font
              fontWeight: 'normal'
            }
          );
          labelsGroup.appendChild(foreignSubsText);
        }
        
        // Add seventh rectangle for Group 5a (dots 84-86)
        let minX7 = null, minY7 = null, maxX7 = null, maxY7 = null;
        
        // Find boundaries for dots 84-86
        for (let i = 84; i <= 86; i++) {
          if (window.dotPositions[i]) {
            if (minX7 === null || window.dotPositions[i].x < minX7) minX7 = window.dotPositions[i].x;
            if (maxX7 === null || window.dotPositions[i].x > maxX7) maxX7 = window.dotPositions[i].x;
            if (minY7 === null || window.dotPositions[i].y < minY7) minY7 = window.dotPositions[i].y;
            if (maxY7 === null || window.dotPositions[i].y > maxY7) maxY7 = window.dotPositions[i].y;
          }
        }
        
        if (minX7 !== null && maxX7 !== null) {
          // Use tight padding for Group 5a rectangle
          const group5aLeftPadding = 8;
          const group5aTopPadding = 4;
          const group5aBottomPadding = -2;
          const group5aRightPadding = 295;  // Same as group 4
          
          const group5aRect = createStyledRect(
            minX7 - group5aLeftPadding - dotRadius,
            minY7 - group5aTopPadding - dotRadius,
            (maxX7 - minX7) + group5aLeftPadding + group5aRightPadding + dotRadius * 2,
            (maxY7 - minY7) + group5aTopPadding + group5aBottomPadding + dotRadius * 2,
            {
              fill: '#f5e6ff', // Light intermediate purple
              stroke: '#8129a0', // Intermediate between #7030a0 and #942193
              strokeWidth: '0.75',
              rx: '4' // Small rounded corners
            }
          );
          group5aRect.setAttribute('fill-opacity', '0.9'); // Almost opaque
          
          // Insert on top of other rectangles
          svg.insertBefore(group5aRect, blueLinesGroup);
          
          // Add "Specialised ADIs" label to group 5a
          const group5aRectX = parseFloat(group5aRect.getAttribute('x'));
          const group5aRectY = parseFloat(group5aRect.getAttribute('y'));
          const group5aRectWidth = parseFloat(group5aRect.getAttribute('width'));
          const group5aRectHeight = parseFloat(group5aRect.getAttribute('height'));
          
          // Position in right side, vertically centered
          const specialisedADIsText = createStyledText(
            group5aRectX + group5aRectWidth - 15,
            group5aRectY + group5aRectHeight / 2 + 5,
            'Specialised ADIs',
            {
              textAnchor: 'end',
              fill: '#8129a0', // Intermediate purple
              fontSize: '13' // Between 12 and 14
            }
          );
          labelsGroup.appendChild(specialisedADIsText);
        }
        
        // Add eighth rectangle for Group 5b (dots 87-91)
        let minX8 = null, minY8 = null, maxX8 = null, maxY8 = null;
        
        // Find boundaries for dots 87-91
        for (let i = 87; i <= 91; i++) {
          if (window.dotPositions[i]) {
            if (minX8 === null || window.dotPositions[i].x < minX8) minX8 = window.dotPositions[i].x;
            if (maxX8 === null || window.dotPositions[i].x > maxX8) maxX8 = window.dotPositions[i].x;
            if (minY8 === null || window.dotPositions[i].y < minY8) minY8 = window.dotPositions[i].y;
            if (maxY8 === null || window.dotPositions[i].y > maxY8) maxY8 = window.dotPositions[i].y;
          }
        }
        
        if (minX8 !== null && maxX8 !== null) {
          // Use tight padding for Group 5b rectangle
          const group5bLeftPadding = 3;
          const group5bTopPadding = 4;
          const group5bBottomPadding = -1;
          const group5bRightPadding = 281;  // Same as group 4
          
          const group5bRect = createStyledRect(
            minX8 - group5bLeftPadding - dotRadius,
            minY8 - group5bTopPadding - dotRadius,
            (maxX8 - minX8) + group5bLeftPadding + group5bRightPadding + dotRadius * 2,
            (maxY8 - minY8) + group5bTopPadding + group5bBottomPadding + dotRadius * 2,
            {
              fill: '#ffe0f7', // Light version of #942193
              stroke: '#942193', // Based on hex 942193
              strokeWidth: '0.75',
              rx: '4' // Small rounded corners
            }
          );
          group5bRect.setAttribute('fill-opacity', '0.9'); // Almost opaque
          
          // Insert on top of other rectangles
          svg.insertBefore(group5bRect, blueLinesGroup);
          
          // Add "Other ADIs" label to group 5b
          const group5bRectX = parseFloat(group5bRect.getAttribute('x'));
          const group5bRectY = parseFloat(group5bRect.getAttribute('y'));
          const group5bRectWidth = parseFloat(group5bRect.getAttribute('width'));
          const group5bRectHeight = parseFloat(group5bRect.getAttribute('height'));
          
          // Position in right side, vertically centered
          const otherADIsText = createStyledText(
            group5bRectX + group5bRectWidth - 15,
            group5bRectY + group5bRectHeight / 2 + 5,
            'Other ADIs',
            {
              textAnchor: 'end',
              fill: '#942193', // Based on hex 942193
              fontSize: '13' // Between 12 and 14
            }
          );
          labelsGroup.appendChild(otherADIsText);
        }
        
        // Add ninth rectangle for entire Group 6 (dots 92-99)
        let minX9 = null, minY9 = null, maxX9 = null, maxY9 = null;
        
        // Find boundaries for dots 92-99
        for (let i = 92; i <= 99; i++) {
          if (window.dotPositions[i]) {
            if (minX9 === null || window.dotPositions[i].x < minX9) minX9 = window.dotPositions[i].x;
            if (maxX9 === null || window.dotPositions[i].x > maxX9) maxX9 = window.dotPositions[i].x;
            if (minY9 === null || window.dotPositions[i].y < minY9) minY9 = window.dotPositions[i].y;
            if (maxY9 === null || window.dotPositions[i].y > maxY9) maxY9 = window.dotPositions[i].y;
          }
        }
        
        if (minX9 !== null && maxX9 !== null) {
          // Calculate position based on ADI box
          // Use the same left padding as ADI rect
          const innerLeftPadding = 60; // Match the ADI box
          const innerTopPadding = 30;
          const innerBottomPadding = 7; // Match the ADI box
          
          // Calculate ADI box position
          const adiBoxX = minX2 - innerLeftPadding - dotRadius;
          const adiBoxY = minY2 - innerTopPadding - dotRadius;
          const adiBoxHeight = (maxY2 - minY2) + innerTopPadding + innerBottomPadding + dotRadius * 2;
          
          // Position: same left edge as ADI box, top edge below ADI box
          const rectX = adiBoxX;
          
          // Calculate dimensions to enclose dots 92-99
          const rectWidth = (maxX9 - minX9) + 20 + 270 + dotRadius * 2; // Reduced right padding from 300 to 150
          const rectY = adiBoxY + adiBoxHeight + 2; // Further reduced gap to raise top edge
          
          // Calculate height to reach just above ESA box bottom
          // CLS (dot 99) is the lowest dot, so we need to ensure it's enclosed
          const clsY = window.dotPositions[99].y;
          const clsRadius = smallCircleRadius * 12; // CLS has large radius
          const rectHeight = (clsY + clsRadius + 16) - rectY; // Raised bottom edge slightly (was 20)
          
          const nonAdiRect = createStyledRect(rectX, rectY, rectWidth, rectHeight, {
            fill: '#fef3c7', // Light gold
            stroke: '#f59e0b', // Darker gold/amber border
            strokeWidth: '2', // Same thickness as ADI box
            rx: '8' // Same rounded corners as ADI box
          });
          nonAdiRect.setAttribute('fill-opacity', '0.8'); // Made more opaque
          
          // Insert on top of other rectangles
          svg.insertBefore(nonAdiRect, blueLinesGroup);
          
          // Store non-ADI box data for blue line
          if (!window.nonAdiBoxData) window.nonAdiBoxData = {};
          window.nonAdiBoxData.x = rectX;
          window.nonAdiBoxData.y = rectY;
          window.nonAdiBoxData.width = rectWidth;
          window.nonAdiBoxData.height = rectHeight;
          
          // Update HVCS path to extend past non-ADIs and curve up to ADIs edge
          const hvcsHorizontalLine = document.getElementById('hvcs-horizontal-line');
          if (hvcsHorizontalLine && window.hvcsLineData && window.adiBoxData) {
            const nonAdiRightEdge = rectX + rectWidth;
            const extendPastNonAdi = nonAdiRightEdge + 60; // Extend 60px past non-ADIs (further right)
            
            // Get ADI box left edge and bottom position
            const adiLeftEdge = window.adiBoxData.x;
            const adiBottom = window.adiBoxData.y + window.adiBoxData.height;
            
            // Create path: horizontal to past non-ADIs, then symmetrical J-curve up to ADI bottom
            // Adjust end point to account for stroke width (stop at edge, not past it)
            const strokeWidth = 6; // Updated stroke width
            const adjustedAdiBottom = adiBottom + (strokeWidth / 2);
            
            // Calculate where to start the gradual curve
            // We need to stay below ESAs and non-ADIs boxes
            const esasRightEdgeApprox = window.hvcsLineData.startX + 200; // Stay well clear of ESAs
            const curveStartX = Math.max(esasRightEdgeApprox, nonAdiRightEdge - 80); // Start closer to non-ADIs right edge for more clearance
            
            const verticalDistance = window.hvcsLineData.startY - adjustedAdiBottom;
            
            // Create path with very gradual curve that gets steeper
            // Use two cubic bezier curves for more control
            const midPointX = (curveStartX + extendPastNonAdi) / 2;
            const midPointY = window.hvcsLineData.startY - verticalDistance * 0.15; // Very gradual at first
            
            // Create a single smooth curve without kinks
            // Adjust first control point to be further right for smoother transition
            const path = `M ${window.hvcsLineData.startX} ${window.hvcsLineData.startY} ` +
                        `L ${curveStartX} ${window.hvcsLineData.startY} ` +
                        `C ${curveStartX + 60} ${window.hvcsLineData.startY}, ` +
                        `${extendPastNonAdi} ${window.hvcsLineData.startY - verticalDistance * 0.15}, ` +
                        `${extendPastNonAdi + 15} ${adjustedAdiBottom}`;
            
            hvcsHorizontalLine.setAttribute('d', path);
          }
          
          // Extend third blue line to curve into ADIs (to the right of green line)
          if (window.asxLine2Data && window.adiBoxData) {
            const asxLine2Extension = document.getElementById('asx-to-adi-line');
            if (asxLine2Extension) {
              const adiBottom = window.adiBoxData.y + window.adiBoxData.height;
              const adiRightEdge = window.adiBoxData.x + window.adiBoxData.width;
              const nonAdiRightEdge = window.nonAdiBoxData.x + window.nonAdiBoxData.width;
              
              // Match green line curve parameters exactly
              const esasRightEdgeApprox = window.asxLine2Data.startX + 200;
              const curveStartX = Math.max(esasRightEdgeApprox, nonAdiRightEdge - 80); // Same as green line
              const extendPastNonAdi = nonAdiRightEdge + 60;
              
              // Calculate actual vertical distance for this line
              const actualVerticalDistance = window.asxLine2Data.horizontalY - (adiBottom + 2);
              
              // Position endpoint closer to green line endpoint
              const greenEndX = extendPastNonAdi + 15; // Where green line ends
              const targetX = greenEndX + 20; // Only 20px to the right of green line (was 30)
              
              // Get current path and extend it
              const currentPath = asxLine2Extension.getAttribute('d');
              
              // Create curve with proportional control points to match green line's slope
              // Use actual vertical distance but same proportions as green line
              const extensionPath = currentPath + ' ' +
                        `L ${curveStartX} ${window.asxLine2Data.horizontalY} ` +
                        `C ${curveStartX + 60} ${window.asxLine2Data.horizontalY}, ` +
                        `${extendPastNonAdi} ${window.asxLine2Data.horizontalY - actualVerticalDistance * 0.15}, ` +
                        `${targetX} ${adiBottom + 2}`;
              
              asxLine2Extension.setAttribute('d', extensionPath);
            }
          }
          
          // Add "Non-ADIs" label to bottom right corner of group 6 box
          const nonAdiRectX = parseFloat(nonAdiRect.getAttribute('x'));
          const nonAdiRectY = parseFloat(nonAdiRect.getAttribute('y'));
          const nonAdiRectWidth = parseFloat(nonAdiRect.getAttribute('width'));
          const nonAdiRectHeight = parseFloat(nonAdiRect.getAttribute('height'));
          
          // Position in bottom right corner
          const nonADIsText = createStyledText(
            nonAdiRectX + nonAdiRectWidth - 15,
            nonAdiRectY + nonAdiRectHeight - 10,
            'Non-ADIs',
            {
              textAnchor: 'end',
              fill: '#f59e0b', // Match the Group 6 box gold border color
              fontSize: '24' // Match ADIs font size
            }
          );
          labelsGroup.appendChild(nonADIsText);
          
          // Extend ASX blue line to curve into non-ADIs box (mirroring green line)
          if (window.asxLineData && window.nonAdiBoxData) {
            const asxExtension = document.getElementById('asx-to-hvcs-line');
            if (asxExtension) {
              const nonAdiBottom = window.nonAdiBoxData.y + window.nonAdiBoxData.height;
              const nonAdiRightEdge = window.nonAdiBoxData.x + window.nonAdiBoxData.width;
              
              // Shift entire curve left to shorten horizontal section
              const shiftLeftAmount = 160; // Shift everything left by 160px (was 200, moved back 40)
              const curveStartX = (nonAdiRightEdge - 80) - shiftLeftAmount;
              const verticalDistance = window.asxLineData.horizontalY - (nonAdiBottom + 2);
              
              // Get current path and extend it
              const currentPath = asxExtension.getAttribute('d');
              const extendPastNonAdi = (nonAdiRightEdge + 60) - shiftLeftAmount;
              
              // Create same curve shape but shifted left
              const extensionPath = currentPath + ' ' +
                        `L ${curveStartX} ${window.asxLineData.horizontalY} ` +
                        `C ${curveStartX + 60} ${window.asxLineData.horizontalY}, ` +
                        `${extendPastNonAdi} ${window.asxLineData.horizontalY - verticalDistance * 0.15}, ` +
                        `${extendPastNonAdi + 15} ${nonAdiBottom + 2}`;
              
              asxExtension.setAttribute('d', extensionPath);
            }
          }
          
          // Extend Sympli line to curve up to ADIs box
          if (window.sympliLineData && window.adiBoxData && window.nonAdiBoxData) {
            const sympliLineExtension = document.getElementById('sympli-line');
            if (sympliLineExtension) {
              // Target position: ADIs box, to the left of the third blue line
              const adiBottom = window.adiBoxData.y + window.adiBoxData.height;
              const nonAdiRightEdge = window.nonAdiBoxData.x + window.nonAdiBoxData.width;
              const extendPastNonAdi = nonAdiRightEdge + 60;
              const greenEndX = extendPastNonAdi + 15; // Where green line ends
              const thirdBlueEndX = greenEndX + 20; // Where third blue line ends
              const targetX = thirdBlueEndX + 10; // 10px to the right of third blue line
              const targetY = adiBottom + 2; // Just below ADIs box like other lines
              
              // Match curve parameters of blue/green lines
              const esasRightEdgeApprox = window.sympliLineData.startX + 200;
              const curveStartX = Math.max(esasRightEdgeApprox, nonAdiRightEdge - 80); // Same as other lines
              
              // Calculate actual vertical distance
              const actualVerticalDistance = window.sympliLineData.horizontalY - targetY;
              
              // Get current path and extend it
              const currentPath = sympliLineExtension.getAttribute('d');
              
              // Create curve matching the slope of other lines
              const extensionPath = currentPath + ' ' +
                        `L ${curveStartX} ${window.sympliLineData.horizontalY} ` +
                        `C ${curveStartX + 60} ${window.sympliLineData.horizontalY}, ` +
                        `${targetX - 30} ${window.sympliLineData.horizontalY - actualVerticalDistance * 0.15}, ` +
                        `${targetX} ${targetY}`;
              
              sympliLineExtension.setAttribute('d', extensionPath);
            }
          }
          
          // Extend PEXA line to curve up to ADIs box and then back to PEXA box
          if (window.pexaLineData && window.adiBoxData && window.nonAdiBoxData) {
            const pexaLineExtension = document.getElementById('pexa-line');
            if (pexaLineExtension) {
              // Target position: ADIs box, slightly to the right of Sympli line
              const adiBottom = window.adiBoxData.y + window.adiBoxData.height;
              const nonAdiRightEdge = window.nonAdiBoxData.x + window.nonAdiBoxData.width;
              const extendPastNonAdi = nonAdiRightEdge + 60;
              const greenEndX = extendPastNonAdi + 15;
              const thirdBlueEndX = greenEndX + 20;
              const sympliEndX = thirdBlueEndX + 10; // Where Sympli ends
              const targetX = sympliEndX + 15; // 15px to the right of Sympli line
              const targetY = adiBottom + 2;
              
              // Match curve parameters of other lines, accounting for longer horizontal
              const esasRightEdgeApprox = window.pexaLineData.startX + 200;
              const curveStartX = Math.max(esasRightEdgeApprox, nonAdiRightEdge - 80) + 40;
              
              // Calculate vertical distance
              const actualVerticalDistance = window.pexaLineData.horizontalY - targetY;
              
              // Get current path
              const currentPath = pexaLineExtension.getAttribute('d');
              
              // Create curve up to ADIs box (same shape as Sympli)
              const extensionPath = currentPath + ' ' +
                        `L ${curveStartX} ${window.pexaLineData.horizontalY} ` +
                        `C ${curveStartX + 60} ${window.pexaLineData.horizontalY}, ` +
                        `${targetX - 30} ${window.pexaLineData.horizontalY - actualVerticalDistance * 0.15}, ` +
                        `${targetX} ${targetY}`;
              
              pexaLineExtension.setAttribute('d', extensionPath);
            }
          }
        }
        
        // Add tenth rectangle for red-bordered dots (dots 92-95)
        let minX10 = null, minY10 = null, maxX10 = null, maxY10 = null;
        
        // Find boundaries for dots 92-95
        for (let i = 92; i <= 95; i++) {
          if (window.dotPositions[i]) {
            if (minX10 === null || window.dotPositions[i].x < minX10) minX10 = window.dotPositions[i].x;
            if (maxX10 === null || window.dotPositions[i].x > maxX10) maxX10 = window.dotPositions[i].x;
            if (minY10 === null || window.dotPositions[i].y < minY10) minY10 = window.dotPositions[i].y;
            if (maxY10 === null || window.dotPositions[i].y > maxY10) maxY10 = window.dotPositions[i].y;
          }
        }
        
        if (minX10 !== null && maxX10 !== null) {
          // Use tight padding for red-bordered dots rectangle
          const redLeftPadding = -27; // Moved in by 5 pixels
          const redTopPadding = 2; // Reduced to lower top edge
          const redBottomPadding = 1; // Reduced from 2 to nudge bottom border up
          const redRightPadding = 300; // Reduced to bring right edge in
          
          // Match the width of "Other ADIs" box (group 5b)
          const group5bWidth = (maxX8 - minX8) + 3 + 281 + dotRadius * 2; // Using group5b's padding values
          
          const originalRedWidth = (maxX10 - minX10) + redLeftPadding + redRightPadding + dotRadius * 2;
          const reducedRedWidth = originalRedWidth * 0.9; // 10% reduction
          const redShiftLeft = originalRedWidth * 0.1; // Shift left edge by the amount reduced
          
          const redBorderRect = createStyledRect(
            minX10 - redLeftPadding - dotRadius - redShiftLeft,
            minY10 - redTopPadding - dotRadius,
            reducedRedWidth + 5,
            (maxY10 - minY10) + redTopPadding + redBottomPadding + dotRadius * 2,
            {
              fill: '#fee2e2', // Very light red
              stroke: '#ef4444', // Red border
              strokeWidth: '1',
              rx: '3' // Small rounded corners
            }
          );
          redBorderRect.setAttribute('fill-opacity', '0.8'); // Made more opaque
          
          // Insert on top of nonAdiRect
          svg.insertBefore(redBorderRect, blueLinesGroup);
          
          // Add "PSPs" label to red box
          const redRectX = parseFloat(redBorderRect.getAttribute('x'));
          const redRectY = parseFloat(redBorderRect.getAttribute('y'));
          const redRectWidth = parseFloat(redBorderRect.getAttribute('width'));
          const redRectHeight = parseFloat(redBorderRect.getAttribute('height'));
          
          const pspsText = createStyledText(
            redRectX + reducedRedWidth - 15,
            redRectY + redRectHeight / 2 + 5,
            'PSPs',
            {
              textAnchor: 'end',
              fill: '#ef4444', // Red color matching border
              fontSize: '13'
            }
          );
          labelsGroup.appendChild(pspsText);
        }
        
        // Add eleventh rectangle for green-bordered dots (dots 96-98)
        let minX11 = null, minY11 = null, maxX11 = null, maxY11 = null;
        
        // Find boundaries for dots 96-98
        for (let i = 96; i <= 98; i++) {
          if (window.dotPositions[i]) {
            if (minX11 === null || window.dotPositions[i].x < minX11) minX11 = window.dotPositions[i].x;
            if (maxX11 === null || window.dotPositions[i].x > maxX11) maxX11 = window.dotPositions[i].x;
            if (minY11 === null || window.dotPositions[i].y < minY11) minY11 = window.dotPositions[i].y;
            if (maxY11 === null || window.dotPositions[i].y > maxY11) maxY11 = window.dotPositions[i].y;
          }
        }
        
        if (minX11 !== null && maxX11 !== null) {
          // Use tight padding for green-bordered dots rectangle
          const greenBorderLeftPadding = -27; // Moved in by 5 pixels
          const greenBorderTopPadding = 4; // Reduced from 6 to reduce top padding
          const greenBorderBottomPadding = 6; // Increased to nudge bottom edge down
          const greenBorderRightPadding = 300; // Reduced to bring right edge in
          
          // Calculate width like Specialised ADIs box
          const csWidth = (maxX11 - minX11) + greenBorderLeftPadding + greenBorderRightPadding + dotRadius * 2;
          const reducedCsWidth = csWidth * 0.9; // 10% reduction
          const csShiftLeft = csWidth * 0.1; // Shift left edge by the amount reduced
          
          const greenBorderRect = createStyledRect(
            minX11 - greenBorderLeftPadding - dotRadius - csShiftLeft,
            minY11 - greenBorderTopPadding - dotRadius,
            reducedCsWidth + 5,
            (maxY11 - minY11) + greenBorderTopPadding + greenBorderBottomPadding + dotRadius * 2,
            {
              fill: '#E8F5E9', // Light green
              stroke: '#4CAF50', // Green border
              strokeWidth: '1',
              rx: '3' // Small rounded corners
            }
          );
          greenBorderRect.setAttribute('fill-opacity', '0.8'); // Made more opaque
          
          // Insert on top of nonAdiRect
          svg.insertBefore(greenBorderRect, blueLinesGroup);
          
          // Add "CS" label to green box
          const greenRectX = parseFloat(greenBorderRect.getAttribute('x'));
          const greenRectY = parseFloat(greenBorderRect.getAttribute('y'));
          const greenRectWidth = parseFloat(greenBorderRect.getAttribute('width'));
          const greenRectHeight = parseFloat(greenBorderRect.getAttribute('height'));
          
          const csText = createStyledText(
            greenRectX + reducedCsWidth - 15,
            greenRectY + greenRectHeight / 2 + 5,
            'CS',
            {
              textAnchor: 'end',
              fill: '#4CAF50', // Green color matching border
              fontSize: '13'
            }
          );
          labelsGroup.appendChild(csText);
        }
      }

      // === Adjust how far above/below the arc extends ===
      // Increase arcSpan to extend farther above/below; decrease to tighten it.
      // Increase arcR to move the arc farther away from the circles (larger "enclosure"); decrease to bring it closer.
      // To move the arc to the LEFT side instead of right: change base angle from 90° to 270°:
      // const base = 270; then recompute start/end around 'base'.
      // Add sigmoid curve connecting CLS AUD line to CLS dot line
      if (window.clsEndpoints && window.clsEndpoints.audLineEndX && window.clsEndpoints.dotLineEndX) {
// Create sigmoid S-curve - shifted right (preserve endpoint slopes + vertical fallback)
// Create sigmoid S-curve - shifted right (preserve endpoint slopes + robust fallbacks)
var shiftX = 0; // No shift - lines already extended

// Define start and end points from CLS endpoints
// Start from dot (top) and end at AUD (bottom) for correct downward slope
var clsStartX = window.clsEndpoints.dotLineEndX;
var clsStartY = window.clsEndpoints.dotLineEndY;
var clsEndX = window.clsEndpoints.audLineEndX;
var clsEndY = window.clsEndpoints.audLineEndY;

// Use original endpoints without expansion
// The flattening will come from the sigmoid steepness parameter
var sx = clsStartX + shiftX, sy = clsStartY;
var ex = clsEndX + shiftX, ey = clsEndY;

// Update the stored endpoints so horizontal lines can be redrawn if needed
window.clsEndpoints.expandedAudLineEndX = sx;
window.clsEndpoints.expandedDotLineEndX = ex;

var spanX = ex - sx;
var spanY = ey - sy;

// Base control points for sigmoid curve
const midX = (sx + ex) / 2;
const midY = (sy + ey) / 2;

// Adjust control points for smooth sigmoid curve
// Use symmetric tension for a natural S-shape
var tension = 0.28; // Softer curve with lower tension
var cp1X = sx + (ex - sx) * tension;
var cp1Y = sy;  // Keep horizontal at start
var cp2X = ex - (ex - sx) * tension;
var cp2Y = ey;  // Keep horizontal at end

// Fallback 1: If spanX ~ 0 (vertical endpoints), push handles sideways to force an S
if (Math.abs(spanX) < 1e-6) {
  var hbend = Math.max(20, 0.25 * Math.abs(spanY)); // lateral handle size
  cp1X = sx + hbend;
  cp2X = ex - hbend; // (= sx - hbend)
}

// Fallback 2: If spanY ~ 0 (same Y), push handles vertically to force curvature
if (Math.abs(spanY) < 1e-6) {
  var vbend = Math.max(20, 0.25 * Math.abs(spanX)); // vertical handle size
  cp1Y = sy - vbend;
  cp2Y = ey + vbend;
}

// Fuck it, simple S-curve with straight line segments
const numPoints = 50;
const points = [];

for (let i = 0; i <= numPoints; i++) {
  const t = i / numPoints;
  
  // Basic S-curve: flat-slope-flat
  let progress;
  if (t < 0.2) {
    progress = 0;
  } else if (t > 0.8) {
    progress = 1;
  } else {
    // Linear slope in the middle
    progress = (t - 0.2) / 0.6;
  }
  
  const x = sx + (ex - sx) * t;
  const y = sy + (ey - sy) * progress;
  
  if (i === 0) {
    points.push(`M ${x.toFixed(2)} ${y.toFixed(2)}`);
  } else {
    points.push(`L ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
}

let sigmoidD = points.join(' ');

// Ensure we have an SVG element and a <path> to draw into
var svgEl = document.getElementById('circles-arc-svg') || document.querySelector('svg');
var sigmoidPath = document.getElementById('sigmoid-path');
if (!sigmoidPath) {
  sigmoidPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  sigmoidPath.setAttribute('id', 'sigmoid-path');
  if (svgEl) svgEl.appendChild(sigmoidPath);
}

// Apply geometry + styling
sigmoidPath.setAttribute('d', sigmoidD);
sigmoidPath.setAttribute('stroke', '#7FFF00'); // neon lime green
sigmoidPath.setAttribute('stroke-width', '8');
sigmoidPath.setAttribute('fill', 'none');
sigmoidPath.setAttribute('stroke-linecap', 'round');

// No extension lines needed since we're using original endpoints




      }
    })();
  