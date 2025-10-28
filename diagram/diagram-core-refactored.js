/**
 * Refactored Diagram Core - Complete Original Functionality
 */

function initializeDiagram() {
  // ----- Compute precise positions and the arc path deterministically -----
  // Global constant for CLS sigmoid curve expansion
  const CLS_SIGMOID_EXPANSION = 1.5; // How much to expand horizontally (1.5 = 150% wider on each side)

  // Global offset to move Eftpos and Mastercard horizontal line segments up/down together
  // Negative values move lines up, positive values move lines down
  const GLOBAL_HORIZONTAL_LINES_OFFSET = +210; // Adjust this value to move Eftpos/Mastercard lines together

  const svg = document.getElementById('diagram');
  const p = document.getElementById('params').dataset;

    // Read parameters (numbers only)
    const cx       = +p.cx;          // shared x for circles
    const cyBig    = +p.cyBig;       // center y of big circle
    const rBig     = +p.rBig * 1.05; // Increased by 5%
    const gap      = +p.gap;         // vertical clearance between the two circles' edges
    const rSmall   = +p.rSmall * 0.90; // 10% smaller (was 5%, now additional 5%)
    const arcR     = +p.arcR;        // radius of the enclosing arc
    const arcSpan  = +p.arcAngleDeg; // total degrees swept by the arc (e.g., 220°)
    const arcShift = +p.arcOffsetDeg;// rotate arc around its center (degrees)
    const strokeW  = +p.strokeWidth;

    function adjustAsxBlueLinesToNeonSpacing() {
      const endpoints = window.clsEndpoints;
      const topLine = window.asxLineData;
      const bottomLine = window.asxLine2Data;

      if (!endpoints || endpoints.neonLineEndY === undefined) return;
      if (!topLine || !bottomLine) return;
      if (topLine.neonAdjusted || !topLine.pathElement || !bottomLine.pathElement) return;

      const neonY = Number(endpoints.neonLineEndY);
      const extraGapRaw = bottomLine.extraDown !== undefined ? bottomLine.extraDown : (bottomLine.horizontalY - topLine.horizontalY);
      const startX = Number(topLine.startX);
      const startY = Number(topLine.startY);
      const cornerRadius = Number(topLine.cornerRadius ?? 30);
      const horizontalLength = Number(topLine.horizontalLength ?? 150);
      const startX2 = Number(bottomLine.startX);
      const startY2 = Number(bottomLine.startY);
      const cornerRadius2 = Number(bottomLine.cornerRadius ?? cornerRadius);
      const horizontalLength2 = Number(bottomLine.horizontalLength ?? 150);

      if (!Number.isFinite(neonY) || !Number.isFinite(extraGapRaw) || !Number.isFinite(startX) ||
          !Number.isFinite(startY) || !Number.isFinite(cornerRadius) || !Number.isFinite(horizontalLength) ||
          !Number.isFinite(startX2) || !Number.isFinite(startY2) || !Number.isFinite(cornerRadius2) ||
          !Number.isFinite(horizontalLength2)) {
        return;
      }

      const extraGap = Number(extraGapRaw);
      const verticalShift = 27; // Drop the blue horizontals further below the neon line
      const desiredTopY = neonY + extraGap + verticalShift;
      const newGoDown = desiredTopY - cornerRadius - startY;

      if (!Number.isFinite(newGoDown) || newGoDown < 0) return;

      const newHorizontalY = startY + newGoDown + cornerRadius;
      const path1 = `M ${startX} ${startY} ` +
                    `L ${startX} ${startY + newGoDown} ` +
                    `Q ${startX} ${startY + newGoDown + cornerRadius}, ` +
                    `${startX + cornerRadius} ${startY + newGoDown + cornerRadius} ` +
                    `L ${startX + horizontalLength} ${newHorizontalY}`;

      topLine.pathElement.setAttribute('d', path1);
      topLine.horizontalY = newHorizontalY;
      topLine.goDownDistance = newGoDown;
      topLine.neonAdjusted = true;

      const extraDown = Number(bottomLine.extraDown ?? extraGap);
      const newGoDown2 = newGoDown + extraDown;

      if (!Number.isFinite(newGoDown2) || newGoDown2 < 0) return;

      const newHorizontalY2 = startY2 + newGoDown2 + cornerRadius2;
      const path2 = `M ${startX2} ${startY2} ` +
                    `L ${startX2} ${startY2 + newGoDown2} ` +
                    `Q ${startX2} ${startY2 + newGoDown2 + cornerRadius2}, ` +
                    `${startX2 + cornerRadius2} ${startY2 + newGoDown2 + cornerRadius2} ` +
                    `L ${startX2 + horizontalLength2} ${newHorizontalY2}`;

      bottomLine.pathElement.setAttribute('d', path2);
      bottomLine.horizontalY = newHorizontalY2;
      bottomLine.goDownDistance = newGoDown2;
      bottomLine.neonAdjusted = true;
    }


    // Position circles and create gear borders - REFACTORED to diagram-circles.js
    const {cySmall} = initializeMainCircles({cx, cyBig, rBig, rSmall, strokeW});

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
    const redLinesGroup = document.getElementById('red-connecting-lines');
    const adminLinesGroup = document.getElementById('admin-connecting-lines');
    const yellowLinesGroup = document.getElementById('admin-connecting-lines');

    // Add RBA red circle border to redLinesGroup so it renders under blue/yellow lines
    // This will be created after RBA circle fill is created and info is stored
    window.addRbaRedBorder = function() {
      if (window.rbaCircleInfo && redLinesGroup) {
        const rbaBorder = createStyledCircle(
          window.rbaCircleInfo.x,
          window.rbaCircleInfo.y,
          window.rbaCircleInfo.radius,
          {
            fill: 'none',
            stroke: '#ff0000',
            strokeWidth: '2'
          }
        );
        redLinesGroup.appendChild(rbaBorder);
      }
    };
    const bigGroupElement = document.getElementById('big-group');

    // Ensure orange connectors render above the RITS circle
    if (svg && orangeLinesGroup && bigGroupElement) {
      const nextSibling = bigGroupElement.nextSibling;
      if (nextSibling !== orangeLinesGroup) {
        svg.insertBefore(orangeLinesGroup, nextSibling);
      }
    }

    if (orangeLinesGroup) {
      const bigLabelNode = document.getElementById('big-label');
      if (bigLabelNode && bigLabelNode.parentNode === svg) {
        svg.insertBefore(orangeLinesGroup, bigLabelNode);
      } else {
        svg.appendChild(orangeLinesGroup);
      }
    }

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

    const updateNppToAdiLine = () => {
      if (!svg || !window.adiBoxData || !window.nonAdiBoxData) {
        return;
      }

      const nppBoxEl = document.getElementById('npp-box');
      if (!nppBoxEl) {
        return;
      }

      const nppX = parseFloat(nppBoxEl.getAttribute('x'));
      const nppY = parseFloat(nppBoxEl.getAttribute('y'));
      const nppWidth = parseFloat(nppBoxEl.getAttribute('width'));
      const nppHeight = parseFloat(nppBoxEl.getAttribute('height'));

      if (![nppX, nppY, nppWidth, nppHeight].every(Number.isFinite)) {
        return;
      }

      const purpleBoxEl = document.getElementById('npp-purple-box');
      let startX = nppX + nppWidth;
      let startY = nppY + nppHeight / 2;

      let purpleY;
      if (purpleBoxEl) {
        const purpleX = parseFloat(purpleBoxEl.getAttribute('x'));
        purpleY = parseFloat(purpleBoxEl.getAttribute('y'));
        const purpleWidth = parseFloat(purpleBoxEl.getAttribute('width'));
        if ([purpleX, purpleY, purpleWidth].every(Number.isFinite)) {
          startX = purpleX + purpleWidth;
        }
      }

      const nonAdiRightEdge = window.nonAdiBoxData.x + window.nonAdiBoxData.width;
      const extendPastNonAdi = nonAdiRightEdge + 60;

      const curveStartMinimum = startX + 120;
      let curveStartX = Math.max(curveStartMinimum, nonAdiRightEdge - 80);
      if (curveStartX < startX + 40) {
        curveStartX = startX + 40;
      }

      const strokeWidth = 6;
      const strokeHalf = strokeWidth / 2;

      const sourceTopY = nppY;
      const sourceHeight = nppHeight;

      // Choose how far down the connector enters as a fraction of the NPP height.
      // 0 = top edge, 1 = bottom edge. Reduce entryRatio to lift the line. Negative values go above the box.
      const entryRatio = -0.4; // Negative to go above the visual top of NPP
      const requestedY = sourceTopY + sourceHeight * entryRatio;
      const minInside = sourceTopY + strokeHalf + 1;
      const maxInside = sourceTopY + sourceHeight - strokeHalf - 1;
      // Removed minInside constraint to allow line to go higher
      startY = Math.min(maxInside, requestedY);

      // Calculate exact endpoint on ADI box top edge
      const adiEdge = getBoxEdgePoint(window.adiBoxData, 'top', strokeWidth);
      const endY = adiEdge.y;
      const endX = extendPastNonAdi + 15;

      const verticalDistance = endY - startY;
      const control1X = curveStartX + 60;
      const control1Y = startY;
      const control2X = extendPastNonAdi;
      const control2Y = startY + verticalDistance * 0.15;

      const pathData = `M ${startX.toFixed(2)} ${startY.toFixed(2)} ` +
                       `L ${curveStartX.toFixed(2)} ${startY.toFixed(2)} ` +
                       `C ${control1X.toFixed(2)} ${control1Y.toFixed(2)}, ` +
                         `${control2X.toFixed(2)} ${control2Y.toFixed(2)}, ` +
                         `${endX.toFixed(2)} ${endY.toFixed(2)}`;

      let path = document.getElementById('npp-to-adi-line');
      if (!path) {
        path = createStyledPath(pathData, {
          stroke: '#5dd9b8',
          strokeWidth: '6',
          fill: 'none',
          strokeLinecap: 'round',
          id: 'npp-to-adi-line'
        });
        const lineGroup = svg.querySelector('g');
        if (lineGroup) {
          lineGroup.appendChild(path);
        } else {
          svg.insertBefore(path, svg.firstChild);
        }
      } else {
        path.setAttribute('d', pathData);
      }

      window.nppToAdiGeometry = {
        startX,
        startY,
        curveStartX,
        control1X,
        control1Y,
        control2X,
        control2Y,
        endX,
        endY
      };

      // XXX-to-ADI line update removed
      // if (typeof window.updateXXXToAdiLine === 'function') {
      //   window.updateXXXToAdiLine();
      // }
      if (typeof window.updateDirectEntryToAdiLine === 'function') {
        window.updateDirectEntryToAdiLine();
      }
      if (typeof window.updateOskoToAdiLine === 'function') {
        window.updateOskoToAdiLine();
      }
    };

    // Distribute circles in groups: 1, triple gap, 45, gap, 5, double gap, 34, gap, 3, gap, 4, double gap, 8
    // Use consistent spacing for all dots (based on larger dot spacing)
    const dotSpacing = 5.0; // Further increased spacing
    const gapSpacing = dotSpacing * 2; // Gaps are double the dot spacing

    console.log('Starting dot loop, numCircles =', numCircles);
    for (let i = 0; i < numCircles; i++) {
      if (i === 0 || i === 99 || i === 1 || i === 91) {
        console.log('Loop iteration i =', i);
      }
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

        // Store RBA circle info for later
        window.rbaCircleInfo = {
          x: blackCenterX,
          y: blackCenterY,
          radius: blackCircleRadius
        };

        // Create large black circle at extended position (fill only, no border yet)
        const blackCircle = createStyledCircle(blackCenterX, blackCenterY, blackCircleRadius, {
          fill: '#000000',
          stroke: 'none'
        });
        // Insert before big-group so black circle renders under RITS/FSS but the blue/yellow lines can go over it
        const bigGroup = document.getElementById('big-group');
        if (bigGroup && bigGroup.parentNode) {
          bigGroup.parentNode.insertBefore(blackCircle, bigGroup);
        } else {
          circlesGroup.appendChild(blackCircle);
        }

        // Make RBA black circle interactive
        if (typeof makeInteractive === 'function') {
          makeInteractive(blackCircle, 'dot-0');
        }
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
      // (will be configured after position calculations)
      let line = null;

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

      // Determine color for dots based on which box they're in
      let fillColor = '#04d9ff'; // light blue matching RITS outer circle
      let strokeColor = '#ffffff'; // default white border

      // All dots now have white borders except CLS
      strokeColor = '#ffffff'; // white border for all ESA dots

      // Adjust radius for specific dots
      if (i >= 96 && i <= 98) {
        // CS box (dots 96-98)
        blueRadius = smallCircleRadius * 2;
      }
      else if (i === 99) {
        // CLS dot - Non-ADIs box
        console.log('Processing CLS dot (i=99)');
        strokeColor = '#00FF33'; // Neon green border for CLS
        blueRadius = smallCircleRadius * 12;
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

      // Create blue connecting line
      line = createStyledLine(blueCircleX, cyBig, actualCircleX, actualCircleY, {
        stroke: '#04d9ff',
        strokeWidth: '1.5',
        opacity: '0.9'
      });

      if (!skipBlueLines) {
        // For RBA dot (i=0), insert before big-group so line renders over black circle but under RITS
        if (i === 0) {
          const bigGroup = document.getElementById('big-group');
          if (bigGroup && bigGroup.parentNode) {
            bigGroup.parentNode.insertBefore(line, bigGroup);
          } else {
            blueLinesGroup.appendChild(line);
          }
          // Make RBA blue line interactive
          if (typeof makeInteractive === 'function') {
            makeInteractive(line, 'rba-blue-line');
          }
        } else {
          blueLinesGroup.appendChild(line);
        }
      }

      // Create small circle
      // Make border thicker for colored border dots
      let borderWidth = '0.75'; // Thin white border for all dots
      if (i >= 92 && i <= 98) {
        borderWidth = '0.75'; // Same thin white border for PSPs (red) and CS (green) dots
      }
      if (i === 99) {
        borderWidth = '6'; // Much thicker grey border for CLS
      }

      // For CLS dot (i === 99), add white border first, then green border on top
      let circle;
      if (i === 99) {
        // Create inner white border circle
        const whiteCircle = createStyledCircle(actualCircleX, actualCircleY, blueRadius, {
          fill: fillColor,
          stroke: '#ffffff', // White border
          strokeWidth: '0.75' // Thin white border like other dots
        });
        circlesGroup.appendChild(whiteCircle);

        // Create outer green border circle
        // White stroke 0.75 extends from R-0.375 to R+0.375
        // Green stroke 6 should sit just outside, so radius = R + 0.375 + 3 = R + 3.375
        circle = createStyledCircle(actualCircleX, actualCircleY, blueRadius + 3.375, {
          fill: 'none', // Transparent fill
          stroke: strokeColor, // Green border
          strokeWidth: borderWidth // Thick green border
        });
        circlesGroup.appendChild(circle);
      } else {
        // Normal circle for all other dots
        circle = createStyledCircle(actualCircleX, actualCircleY, blueRadius, {
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: borderWidth
        });
        // For RBA dot (i=0), insert before big-group so dot renders over black circle/line but under RITS
        if (i === 0) {
          const bigGroup = document.getElementById('big-group');
          if (bigGroup && bigGroup.parentNode) {
            bigGroup.parentNode.insertBefore(circle, bigGroup);
          } else {
            circlesGroup.appendChild(circle);
          }
          // Make RBA blue dot interactive
          if (typeof makeInteractive === 'function') {
            makeInteractive(circle, 'rba-blue-dot');
          }
        } else {
          circlesGroup.appendChild(circle);
        }
      }

      // Add "CLS" text to last dot
      if (i === 99) {
        const text = createStyledText(actualCircleX, actualCircleY, 'CLS', {
          fill: '#013844',
          fontSize: '16',
          fontWeight: 'bold'
        });
        circlesGroup.appendChild(text);

        // REMOVED: Straight line coming from CLS dot
        // const clsLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');

        // Start from left edge of CLS dot (keeping for position reference)
        const clsStartX = actualCircleX - blueRadius;
        const clsStartY = actualCircleY;

        // End point to the left - keep original distance
        // The expansion will be handled in the sigmoid curve calculation
        const baseDistance = 87; // Original distance (67 + 20)
        const clsEndX = clsStartX - baseDistance;
        const clsEndY = clsStartY;

        // REMOVED: Line creation and appending
        // circlesGroup.appendChild(clsLine);

        // Store CLS dot line endpoint for sigmoid curve
        if (!window.clsEndpoints) {
          window.clsEndpoints = {};
        }
        window.clsEndpoints.clsCircleCenterX = actualCircleX;
        window.clsEndpoints.clsCircleCenterY = actualCircleY;
        window.clsEndpoints.clsCircleRadius = blueRadius;
        window.clsEndpoints.clsCircleEdgeX = clsStartX;
        window.clsEndpoints.clsCircleEdgeY = clsStartY;
        window.clsEndpoints.dotLineEndX = clsEndX;
        window.clsEndpoints.dotLineEndY = clsEndY;

        // CLS endpoints already stored above
        console.log('CLS dot created at i=', i, ', window.clsEndpoints set:', window.clsEndpoints);
      }

      // Store dot positions for all dots (must be outside if blocks to run for every iteration)
      if (!window.dotPositions) window.dotPositions = {};
      window.dotPositions[i] = { x: actualCircleX, y: actualCircleY };

      // Add "RBA" text next to first dot
      if (i === 0) {
        // Position text to the right of the black circle
        const blackCircleRadius = smallCircleRadius * 6;
        const text = createStyledText(
          actualCircleX + blackCircleRadius + 5, actualCircleY, 'RBA',
          {
            textAnchor: 'start',
            fill: '#ff0000', // Red
            fontSize: '16',
            fontWeight: 'bold'
          }
        );
        labelsGroup.appendChild(text);

        // Make RBA label interactive
        if (typeof makeInteractive === 'function') {
          makeInteractive(text, 'dot-0');
        }

        // Add SWIFT PDS rectangle

        // Calculate SW point (225 degrees) on the black circle
        const angle225 = 225 * Math.PI / 180; // Convert to radians
        const swPointX = actualCircleX + blackCircleRadius * Math.cos(angle225);
        const swPointY = actualCircleY + blackCircleRadius * Math.sin(angle225);

        // Rectangle dimensions
        const rectWidth = 144 * 0.9; // Reduced by 10% (for non-SWIFT boxes)
        window.dvpRectWidth = rectWidth; // Store for later use in alignment
        const rectHeight = 100 * 0.9 * 0.9; // Reduced by 10% twice
        const swiftRectWidth = rectHeight; // Make SWIFT boxes square (same as height)

        // Store dimensions globally for NPP box creation
        window.rectDimensions = {
          rectHeight: rectHeight,
          swiftRectWidth: swiftRectWidth
        };

        // Define ALL measurements FIRST before using them
        const verticalGap = 5; // Gap between rectangles vertically
        const horizontalGap = 30; // Gap between SWIFT box and side rectangles
        const smallRectHeight = (rectHeight - 2 * verticalGap) / 3; // Each is 1/3 height minus gaps
        window.smallRectHeight = smallRectHeight;
        const austraclearHeight = rectHeight * (2/3); // Reduced by one third

        // Calculate base positions - Austraclear at top, SWIFT at bottom
        const baseX = swPointX - rectWidth - 130 - 40; // Extended left by additional 40px for 50% width increase

        // Austraclear will be at the top
        // Adjust for height reduction to maintain gaps
        const heightReduction = 100 * 0.1; // 10% of original height
        const verticalShift = 50; // Lower all boxes by 30 pixels
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

        // Store rectX globally for NPP box
        window.rectDimensions.rectX = rectX;

        // Store original rectY and height for later adjustment
        window.swiftGroupOriginalY = rectY;
        window.swiftPdsHeight = rectHeight;
        window.swiftPdsWidth = swiftRectWidth; // Store width for later use

        // Create and configure rectangle using helper function
        const swiftRect = createStyledRect(rectX, rectY, swiftRectWidth, rectHeight, {
          fill: '#063d38', // Dark gray (swapped with border)
          stroke: '#00ffdf', // Light mint green (swapped with fill)
          strokeWidth: '2.5'
          // No rx attribute = square corners
        });
        swiftRect.setAttribute('id', 'swift-pds-rect'); // Add ID for easy reference

        // Add to labels group (so it appears on top)
        labelsGroup.appendChild(swiftRect);

        // Add text inside SWIFT rectangle with line break
        const swiftCenterX = rectX + swiftRectWidth / 2;
        const swiftCenterY = rectY + rectHeight / 2;
        const swiftRectText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        swiftRectText.setAttribute('x', swiftCenterX.toFixed(2));
        swiftRectText.setAttribute('y', swiftCenterY.toFixed(2));
        swiftRectText.setAttribute('text-anchor', 'middle');
        swiftRectText.setAttribute('dominant-baseline', 'middle');
        swiftRectText.setAttribute('fill', '#ffffff');
        swiftRectText.setAttribute('font-family', 'Arial, sans-serif');
        swiftRectText.setAttribute('font-size', '18');
        swiftRectText.setAttribute('font-weight', 'bold');

        const swiftLine1 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        swiftLine1.setAttribute('x', swiftCenterX.toFixed(2));
        swiftLine1.setAttribute('dy', '-0.5em');
        swiftLine1.textContent = 'SWIFT';
        swiftRectText.appendChild(swiftLine1);

        const swiftLine2 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        swiftLine2.setAttribute('x', swiftCenterX.toFixed(2));
        swiftLine2.setAttribute('dy', '1.2em');
        swiftLine2.textContent = 'PDS';
        swiftRectText.appendChild(swiftLine2);

        swiftRectText.setAttribute('id', 'swift-pds-text');
        labelsGroup.appendChild(swiftRectText);

        window.swiftPdsTextData = {
          element: swiftRectText,
          centerY: swiftCenterY
        };

        // Calculate CLS AUD Y position early (needed for pacs.009 extension)
        // Place CLS AUD above SWIFT PDS instead of below
        const clsAudY = rectY - smallRectHeight - verticalGap;

        // Create smaller rectangles around SWIFT PDS box

        // Calculate hvcsX position (needed for left rectangles)
        const hvcsX = rectX - swiftRectWidth - horizontalGap - swiftRectWidth - horizontalGap;

        // Three rectangles to the left
        const pacsBoxWidth = swiftRectWidth * 1.5; // 50% wider than SWIFT PDS box
        // Calculate shift to make horizontal gap equal to verticalGap
        // Current position: rectX - horizontalGap - pacsBoxWidth
        // Desired position: rectX - verticalGap - pacsBoxWidth
        const hvcsShift = horizontalGap - verticalGap; // Shift right by difference (30 - 5 = 25)
        const boundingBoxPaddingH = 10; // Horizontal padding - restored to 10

        // Store elements to update position later when dvpRtgsX is available
        const pacsElements = [];

        // Initialize global storage for SWIFT HVCS elements
        if (!window.swiftHvcsElements) {
          window.swiftHvcsElements = {};
        }

        for (let j = 0; j < 3; j++) {
          // Position pacs boxes with gap equal to verticalGap
          // Rightmost box should be at: rectX - verticalGap - pacsBoxWidth
          // This box is at index 0, so it's the leftmost, need to account for 2 more boxes
          // Keep right edge at original position (with original width)
          const originalPacsWidth = swiftRectWidth; // Original width before 50% increase
          const rightmostPacsRightEdge = rectX - verticalGap; // Original right edge position
          const rightmostPacsX = rightmostPacsRightEdge - pacsBoxWidth; // New left edge for wider box

          // Calculate position for this box keeping right edges aligned
          const originalBoxRightEdge = rectX - verticalGap - (2 - j) * (originalPacsWidth + verticalGap);
          const tempSmallRectX = originalBoxRightEdge - pacsBoxWidth;
          // Position pacs boxes to align with lines going into SWIFT PDS
          // Lines enter SWIFT PDS at 1/6, 1/2, and 5/6 of its height
          const swiftBoxTop = rectY;
          const swiftBoxHeight = rectHeight;
          const positions = [1/6, 0.5, 5/6];
          const lineCenterY = swiftBoxTop + swiftBoxHeight * positions[j];
          const smallRectY = lineCenterY - smallRectHeight / 2;

          const smallRect = createStyledRect(tempSmallRectX, smallRectY, pacsBoxWidth, smallRectHeight, {
            fill: '#5dd9b8', // Green SWIFT line color
            stroke: '#ffffff', // Very thin white border
            strokeWidth: '0.5',
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
              fill: '#063d38', // Dark text (swapped)
              fontSize: '11' // Match trade-by-trade font size
            }
          );
          labelsGroup.appendChild(pacsText);

          // Store elements to update later
          pacsElements.push({rect: smallRect, text: pacsText});
        }

        // Create bounding box around PACS boxes
        // Calculate leftmost pacs box position keeping right edges fixed
        const originalPacsWidth = swiftRectWidth; // Original width before 50% increase
        const rightmostPacsRightEdge = rectX - verticalGap; // Original right edge position
        const rightmostPacsX = rightmostPacsRightEdge - pacsBoxWidth; // New left edge for wider box

        // Calculate leftmost box position based on original right edge positions
        const leftmostOriginalRightEdge = rectX - verticalGap - 2 * (originalPacsWidth + verticalGap);
        const smallRectX = leftmostOriginalRightEdge - pacsBoxWidth; // Leftmost box position
        const boundingBoxPaddingV = 5; // Vertical padding - reduced from 10
        const labelSpace = 45; // Increased for more bottom padding

        console.log('SWIFT HVCS box calculation:', {
          leftmost_pacs_x: smallRectX,
          rightmost_pacs_x: rightmostPacsX,
          bounding_box_left: smallRectX - boundingBoxPaddingH,
          bounding_box_right: (smallRectX - boundingBoxPaddingH) + ((rightmostPacsRightEdge - smallRectX) + boundingBoxPaddingH * 2),
          gap_to_swift: rectX - ((smallRectX - boundingBoxPaddingH) + ((rightmostPacsRightEdge - smallRectX) + boundingBoxPaddingH * 2))
        });

        const boundingBox = createStyledRect(
          smallRectX - boundingBoxPaddingH,
          rectY - boundingBoxPaddingV,
          // Width from leftmost left edge to rightmost right edge plus padding
          (rightmostPacsRightEdge - smallRectX) + boundingBoxPaddingH * 2, // Total span + padding
          (smallRectHeight + verticalGap) * 3 - verticalGap + boundingBoxPaddingV * 2 + labelSpace,
          {
            fill: '#063d38', // Dark gray (swapped with stroke)
            stroke: '#00ffdf', // Light mint green (swapped with fill)
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

        // Add SWIFT HVCS label halfway between bottom of box and bottom of pacs.004
        const boundingBoxWidth = rightmostPacsRightEdge - smallRectX;
        // Get pacs.004 (index 2) bottom position
        const pacs004Index = 2;
        const pacs004Y = rectY + (smallRectHeight + verticalGap) * pacs004Index;
        const pacs004Bottom = pacs004Y + smallRectHeight;
        // Calculate bottom of bounding box
        const boundingBoxBottom = rectY + (smallRectHeight + verticalGap) * 3 - verticalGap + boundingBoxPaddingV * 2 + labelSpace;
        // Position label halfway between pacs.004 bottom and box bottom
        const labelY = pacs004Bottom + (boundingBoxBottom - pacs004Bottom) / 2;

        const hvcsLabel = createStyledText(
          smallRectX + boundingBoxWidth / 2, // Center in bounding box
          labelY,
          'SWIFT HVCS', // Single line text
          {
            fill: '#ffffff', // White text
            fontSize: '16', // Slightly bigger than CLS AUD (14)
            fontWeight: 'bold'
          }
        );
        labelsGroup.appendChild(hvcsLabel);

        // Store SWIFT HVCS elements for later update
        window.swiftHvcsElements.boundingBox = boundingBox;
        window.swiftHvcsElements.pacsElements = pacsElements;
        window.swiftHvcsElements.hvcsLabel = hvcsLabel;

        // Debug logging to calculate actual coordinates
        console.log('=== INITIAL COORDINATE DEBUGGING ===');
        console.log('SWIFT HVCS initial position:', {
          x: smallRectX - boundingBoxPaddingH,
          width: (rightmostPacsRightEdge - smallRectX) + boundingBoxPaddingH * 2,
          rightEdge: (smallRectX - boundingBoxPaddingH) + ((rightmostPacsRightEdge - smallRectX) + boundingBoxPaddingH * 2)
        });

        // Add path from SWIFT HVCS box going below ESAs to non-ADIs edge and up to ADIs
        // Start from right edge of SWIFT HVCS bounding box, low enough to go under ESAs
        const hvcsBoxRight = (smallRectX - boundingBoxPaddingH) + ((rightmostPacsRightEdge - smallRectX) + boundingBoxPaddingH * 2);
        // Position line between ESAs bottom and SWIFT HVCS bottom
        const hvcsBoxBottom = rectY + (smallRectHeight + verticalGap) * 3 - verticalGap + boundingBoxPaddingV * 2 + labelSpace;
        const hvcsLineY = hvcsBoxBottom - 25 - 15 + 8; // Was raised by 15, now lowered by 8 (net raise of 7)

        // Create initial path (will be updated when we know box positions)
        const initialPath = `M ${hvcsBoxRight} ${hvcsLineY} L ${hvcsBoxRight + 50} ${hvcsLineY}`;
        const hvcsLine = createStyledPath(initialPath, {
          stroke: '#5dd9b8', // Same color as PACS to SWIFT PDS lines
          strokeWidth: '6', // Same thickness as neon lines
          fill: 'none',
          strokeLinecap: 'butt', // Square cap so it doesn't show at box edge
          id: 'hvcs-horizontal-line'
        });

        // Store start position for later use
        if (!window.hvcsLineData) window.hvcsLineData = {};
        window.hvcsLineData.startX = hvcsBoxRight;
        window.hvcsLineData.startY = hvcsLineY;
        const hvcsLineOffset = hvcsBoxBottom - hvcsLineY;
        if (!Number.isNaN(hvcsLineOffset)) {
          window.hvcsLineOffset = hvcsLineOffset;
        }

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


        // Add rectangle above Austraclear (CHESS-RTGS)
        const chessBoxWidth = rectWidth; // Same width as Austraclear
        const chessBoxX = baseX; // Same X position as Austraclear
        const narrowRect = createStyledRect(chessBoxX, chessY, chessBoxWidth, smallRectHeight, {
          fill: '#071f6a', // Original dark blue
          stroke: '#e8ecf7', // Swapped with fill
          strokeWidth: '2.5'
          // No rx attribute = square corners
        });
        labelsGroup.appendChild(narrowRect);

        // Add label for CHESS-RTGS
        const chessText = createStyledText(
          chessBoxX + chessBoxWidth / 2,
          chessY + smallRectHeight / 2,
          'CHESS-RTGS',
          {
            fill: '#ffffff', // White text
            fontSize: '11', // Slightly smaller to fit better
            dominantBaseline: 'middle', // Use 'middle' for better vertical centering
            textAnchor: 'middle'
          }
        );
        labelsGroup.appendChild(chessText);

        // Add Austraclear box below CHESS-RTGS
        const austraclearRect = createStyledRect(baseX, austraclearY, rectWidth, austraclearHeight, {
          fill: '#071f6a', // Swapped with stroke
          stroke: '#e8ecf7', // Swapped with fill
          strokeWidth: '2.5'
          // No rx attribute = square corners like SWIFT box
        });
        labelsGroup.appendChild(austraclearRect);

        // Add Austraclear label
        const austraclearText = createStyledText(
          baseX + rectWidth / 2,
          austraclearY + austraclearHeight / 2,
          'Austraclear',
          {
            fill: '#e8ecf7', // Swapped text color
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
          fill: '#009fff', // Same as ASX lines
          stroke: 'none',
          opacity: '0.5',
          rx: '10',
          ry: '10'
        });
        labelsGroup.appendChild(dvpRtgsRect);

        // Store reference for later alignment
        window.dvpRtgsElements = window.dvpRtgsElements || {};
        window.dvpRtgsElements.rect = dvpRtgsRect;

        // Add label for DvP RTGS
        const dvpRtgsText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        dvpRtgsText.setAttribute('x', (dvpRtgsX + rectWidth / 4).toFixed(2));
        // Center Y position vertically in the box
        dvpRtgsText.setAttribute('y', (dvpRtgsY + austraclearHeight / 2).toFixed(2));
        dvpRtgsText.setAttribute('text-anchor', 'middle');
        dvpRtgsText.setAttribute('dominant-baseline', 'middle');
        dvpRtgsText.setAttribute('fill', '#ffffff'); // White text
        dvpRtgsText.setAttribute('font-family', 'Arial, sans-serif');
        dvpRtgsText.setAttribute('font-size', '11'); // Slightly bigger font
        dvpRtgsText.setAttribute('font-weight', 'normal');
        // Split into two lines: "DvP" over "RTGS"
        const dvpTspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        dvpTspan.setAttribute('x', (dvpRtgsX + rectWidth / 4).toFixed(2));
        dvpTspan.setAttribute('dy', '-0.5em'); // Move up half a line
        dvpTspan.textContent = 'DvP';
        dvpRtgsText.appendChild(dvpTspan);

        const rtgsTspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        rtgsTspan.setAttribute('x', (dvpRtgsX + rectWidth / 4).toFixed(2));
        rtgsTspan.setAttribute('dy', '1em'); // Move down one line from DvP
        rtgsTspan.textContent = 'RTGS';
        dvpRtgsText.appendChild(rtgsTspan);
        labelsGroup.appendChild(dvpRtgsText);
        window.dvpRtgsElements.text = dvpRtgsText;

        // Add ASX Settlement as elongated hexagon
        let dvpRtgsCenterX = dvpRtgsX + rectWidth / 4; // Center of reduced-width DvP RTGS (will be updated)
        const chessRtgsCenterX = chessBoxX + chessBoxWidth / 2; // Center of CHESS-RTGS
        const bridgeX = dvpRtgsCenterX; // Left edge at DvP RTGS center
        const bridgeWidth = chessRtgsCenterX - dvpRtgsCenterX; // Width to reach CHESS-RTGS center
        const hexHeight = smallRectHeight * 1.5 * 0.8 * 0.9; // 50% taller, reduced by 20%, then by 10%
        // Temporarily use a placeholder position - will be updated after moneyMarketY is defined
        let bridgeY = chessY - largerGap - hexHeight - 20;

        // Create rounded rectangle for ASX Settlement
        const bridgeBox = createStyledRect(bridgeX, bridgeY, bridgeWidth, hexHeight, {
          fill: '#071f6a', // Swapped with stroke
          stroke: '#e8ecf7', // Same as text color
          strokeWidth: '2.5'
          // Square edges - no rx/ry
        });
        labelsGroup.appendChild(bridgeBox);

        // Add label for ASX Settlement
        const asxSettlementText = createStyledText(
          bridgeX + bridgeWidth / 2,
          bridgeY + hexHeight / 2,
          'ASXB',
          {
            fontSize: '12',
            fill: '#ffffff' // Swapped text color
          }
        );
        labelsGroup.appendChild(asxSettlementText);

        // Add ASXF hexagon aligned with ASX bounding box top
        // Temporarily use a placeholder position - will be updated after moneyMarketY is defined
        let asxfY = bridgeY - (hexHeight * 2) - verticalGap;

        const asxfBox = createStyledRect(bridgeX, asxfY, bridgeWidth, hexHeight, {
          fill: '#071f6a', // Swapped with stroke
          stroke: '#e8ecf7', // Same as text color
          strokeWidth: '2.5'
          // Square edges - no rx/ry
        });
        labelsGroup.appendChild(asxfBox);

        // Add label for ASXF
        const asxfText = createStyledText(
          bridgeX + bridgeWidth / 2,
          asxfY + hexHeight * 2 / 2,  // Adjusted for taller box
          'ASXF',
          {
            fontSize: '12',
            fill: '#ffffff' // Swapped text color
          }
        );
        labelsGroup.appendChild(asxfText);

        // Bottom box: RTGS / DvP RTGS
        const rtgsY = dvpRtgsY + austraclearHeight + verticalGap;
        const rtgsRect = createStyledRect(dvpRtgsX, rtgsY, rectWidth / 2, smallRectHeight, {
          fill: '#009fff', // Same as ASX lines
          stroke: 'none',
          opacity: '0.5',
          rx: '10',
          ry: '10'
        });
        labelsGroup.appendChild(rtgsRect);

        // Store reference for later alignment
        window.rtgsElements = window.rtgsElements || {};
        window.rtgsElements.rect = rtgsRect;

        // Add label for RTGS / DvP RTGS
        const rtgsText = createStyledText(
          dvpRtgsX + rectWidth / 4,
          rtgsY + smallRectHeight / 2,
          'RTGS',
          { fontSize: '10', fill: '#ffffff', fontWeight: 'normal' }  // Smaller font, white text, normal weight
        );
        labelsGroup.appendChild(rtgsText);
        window.rtgsElements.text = rtgsText;

        // Money Market / Repo box - to the left of RTGS/DvP RTGS, above SWIFT HVCS
        let moneyMarketRect; // Will be created later after position calculations
        const asxGroupShift = -35 - rectWidth; // Shift ASX group: original shift plus 2x DvP RTGS width to the left
        const moneyMarketX = hvcsX + asxGroupShift; // Shifted left from SWIFT HVCS
        const moneyMarketY = rtgsY; // Same Y position as RTGS/DvP RTGS

        // Update DvP RTGS position to be halfway between Austraclear and dark blue boxes
        const darkBlueRightEdge = moneyMarketX + rectWidth * 1.1; // Right edge of dark blue boxes
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
        const austraclearLineColor = '#009fff'; // Match ASX bottom lines color
        const austraclearLineWidth = '4'; // Match ASX bottom lines thickness

        // Add three lines with same spacing as SWIFT lines
        for (let j = 0; j < 3; j++) {
          // Use same vertical spacing as SWIFT lines
          const lineY = chessY + (smallRectHeight + verticalGap) * j + smallRectHeight / 2;
          const x1 = dvpRtgsX + rectWidth / 2; // Right edge of DvP RTGS (half width)
          const y1 = lineY;
          const x2 = chessBoxX; // Left edge of CHESS-RTGS
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
        // Position right edge 10px to the left of 3/4 point from Austraclear's left edge (1/4 from right)
        const austraclearThreeQuartersPoint = austraclearLeftEdge + rectWidth * (3/4);
        const targetRightEdge = austraclearThreeQuartersPoint - 10;
        const widerAdminBoxX = targetRightEdge - widerAdminBoxWidth; // X position to achieve target right edge

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

          console.log('=== DvP RTGS ALIGNMENT UPDATE ===');
          console.log('dvpRtgsX:', dvpRtgsX);
          console.log('swiftRectWidth:', swiftRectWidth);
          console.log('SWIFT HVCS new position:', {
            x: hvcsBoxX,
            width: hvcsBoxWidth,
            rightEdge: hvcsBoxX + hvcsBoxWidth
          });

          // Update bounding box
          // Set X without padding adjustment since we want the visual box to start at hvcsBoxX
          window.swiftHvcsElements.boundingBox.setAttribute('x', hvcsBoxX.toFixed(2));
          // Set width to match NPP/cheques width exactly
          window.swiftHvcsElements.boundingBox.setAttribute('width', hvcsBoxWidth.toFixed(2));

          // Update PACS boxes to fit nicely inside with padding
          const internalPadding = 10; // Padding inside SWIFT HVCS box
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

          // Update line start position
          const hvcsBoxRight = hvcsBoxX + hvcsBoxWidth;
          const path = window.swiftHvcsElements.hvcsLine.getAttribute('d');
          const newPath = path.replace(/M [\d.]+ /, `M ${hvcsBoxRight} `);
          window.swiftHvcsElements.hvcsLine.setAttribute('d', newPath);

          // Store the right edge position for later update
          window.swiftHvcsElements.rightEdge = hvcsBoxRight;

          // Now move DvP RTGS, RTGS and ASX group to align with SWIFT HVCS left edge
          const swiftHvcsCurrentLeftEdge = hvcsBoxX;
          const currentDvpRtgsX = dvpRtgsX;
          const shiftAmount = swiftHvcsCurrentLeftEdge - currentDvpRtgsX;

          console.log('=== ALIGNING DvP RTGS/RTGS/ASX TO SWIFT HVCS ===');
          console.log('SWIFT HVCS left edge:', swiftHvcsCurrentLeftEdge);
          console.log('Current DvP RTGS X:', currentDvpRtgsX);
          console.log('Shift amount:', shiftAmount);

          // Update DvP RTGS position
          dvpRtgsX = swiftHvcsCurrentLeftEdge;
          dvpRtgsRect.setAttribute('x', dvpRtgsX.toFixed(2));
          dvpRtgsText.setAttribute('x', (dvpRtgsX + rectWidth / 4).toFixed(2));
          // Update tspan elements inside dvpRtgsText
          const dvpTspansUpdate = dvpRtgsText.getElementsByTagName('tspan');
          for (let tspan of dvpTspansUpdate) {
            tspan.setAttribute('x', (dvpRtgsX + rectWidth / 4).toFixed(2));
          }

          // Update RTGS position
          rtgsRect.setAttribute('x', dvpRtgsX.toFixed(2));
          rtgsText.setAttribute('x', (dvpRtgsX + rectWidth / 4).toFixed(2));

          // Update ASX group boxes (Money Market/Repo, SSS/CCP, CHESS equities, etc.)
          // These need to be shifted by the same amount to maintain their relative positions
          window.asxGroupShiftAmount = shiftAmount;
        }

        // Now update ASX hexagon positions to align with ASX bounding box
        const sssCcpY_forHexagons = moneyMarketY - smallRectHeight - verticalGap;
        const chessEquitiesY_forHexagons = sssCcpY_forHexagons - 2 * smallRectHeight - 4 * verticalGap - 25 + 10 - 5;
        const asxBoxY_forHexagons = chessEquitiesY_forHexagons - 35;

        // Update ASXF position to align with ASX bounding box top, lowered by 20px
        const adminBatchesOffset = 22; // Move the whole group down by 20 pixels more (was 2, now 22)
        const asxfY_original = asxBoxY_forHexagons + adminBatchesOffset;

        // Define a consistent gap for all boxes in Administered Batches
        const adminBatchGap = 8; // Use 8px gap

        // Position ASX Settlement below ASXF with the standard gap (using original positions)
        const asxfActualTop_original = asxfY_original - hexHeight - (verticalGap * 2); // Where ASXF will actually be positioned
        const asxfActualBottom_original = asxfActualTop_original + hexHeight; // Bottom of ASXF box (ASXF has single height, not double)
        const bridgeY_original = asxfActualBottom_original + adminBatchGap; // Use standard gap

        // We'll calculate the vertical offset after PEXA is positioned and apply it to all boxes
        asxfY = asxfY_original; // Will be updated with offset
        bridgeY = bridgeY_original; // Will be updated with offset

        // Update the rounded rectangles with new positions
        bridgeBox.setAttribute('x', widerAdminBoxX);
        bridgeBox.setAttribute('width', widerAdminBoxWidth);
        if (!window.bridgePositions) window.bridgePositions = {};
        window.bridgePositions.bridgeX = widerAdminBoxX;
        window.bridgePositions.bridgeWidth = widerAdminBoxWidth;

        asxfBox.setAttribute('x', widerAdminBoxX);
        asxfBox.setAttribute('width', widerAdminBoxWidth);

        // Update box positions (these will be updated again after offset calculation)
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

        // Use consistent gap for all boxes
        const asxfBoxTop = asxfY - hexHeight - (verticalGap * 2); // Top of ASXF box

        // Create PEXA box above ASXF with same gap as used below
        // First calculate original PEXA Y
        const pexaY_original = asxfBoxTop - adminBatchGap - hexHeight;

        // Calculate offset to align PEXA center with blue circle center (cy=450)
        const blueCircleCenterY = 450;
        const pexaCenterY_original = pexaY_original + hexHeight / 2;
        const verticalOffset_pexa = blueCircleCenterY - pexaCenterY_original;

        // Apply offset to all boxes in administered batches
        const pexaY = pexaY_original + verticalOffset_pexa;
        asxfY = asxfY_original + verticalOffset_pexa;
        bridgeY = bridgeY_original + verticalOffset_pexa;

        const pexaBox = createStyledRect(widerAdminBoxX, pexaY, widerAdminBoxWidth, hexHeight, {
          fill: 'rgb(110,28,100)', // Darker pink (similar darkness to ASXF)
          stroke: '#FDE2F9', // Same as text color
          strokeWidth: '2.5'
        });
        labelsGroup.appendChild(pexaBox);

        const pexaText = createStyledText(
          widerAdminBoxX + widerAdminBoxWidth / 2,
          pexaY + hexHeight / 2,
          'PEXA',
          {
            fill: '#ffffff', // Swapped with stroke
            fontSize: '12'
          }
        );
        labelsGroup.appendChild(pexaText);

        // Create eftpos box above PEXA with same gap (apply same offset)
        const eftposY = pexaY - adminBatchGap - hexHeight;
        const eftposBox = createStyledRect(widerAdminBoxX, eftposY, widerAdminBoxWidth, hexHeight, {
          fill: 'rgb(60,45,110)', // Darker purple (similar darkness to ASXF)
          stroke: '#D8D0F0', // Same as text color
          strokeWidth: '2.5'
        });
        labelsGroup.appendChild(eftposBox);

        const eftposText = createStyledText(
          widerAdminBoxX + widerAdminBoxWidth / 2,
          eftposY + hexHeight / 2,
          'ESSB',
          {
            fill: '#ffffff', // Swapped with stroke
            fontSize: '12'
          }
        );
        labelsGroup.appendChild(eftposText);

        // Create Mastercard box above eftpos with same gap
        const mastercardY = eftposY - adminBatchGap - hexHeight;
        const mastercardBox = createStyledRect(widerAdminBoxX, mastercardY, widerAdminBoxWidth, hexHeight, {
          fill: 'rgb(150,30,28)', // Darker red (similar darkness to ASXF)
          stroke: 'rgb(255,230,230)', // Same as text color
          strokeWidth: '2.5'
        });
        labelsGroup.appendChild(mastercardBox);

        const mastercardText = createStyledText(
          widerAdminBoxX + widerAdminBoxWidth / 2,
          mastercardY + hexHeight / 2,
          'MCAU',
          {
            fill: '#ffffff',
            fontSize: '12'
          }
        );
        labelsGroup.appendChild(mastercardText);

        // Now update the ASXF and ASX Settlement positions with the offset
        // Update box positions with offset applied
        bridgeBox.setAttribute('y', bridgeY); // bridgeY already has offset applied
        asxfBox.setAttribute('y', asxfY - hexHeight - (verticalGap * 2)); // asxfY already has offset applied

        // Update text positions with offset applied
        asxSettlementText.setAttribute('y', (bridgeY + hexHeight / 2).toFixed(2));
        asxfText.setAttribute('y', ((asxfY - hexHeight - (verticalGap * 2)) + (hexHeight * 2 + (verticalGap * 2)) / 2).toFixed(2));

        // Store positions for later use
        if (!window.hexagonPositions) {
          window.hexagonPositions = {};
        }
        window.hexagonPositions.pexaX = widerAdminBoxX;
        window.hexagonPositions.pexaY = pexaY;
        window.hexagonPositions.pexaWidth = widerAdminBoxWidth;
        window.hexagonPositions.asxfX = updatedBridgeX;
        window.hexagonPositions.asxfY = asxfY - hexHeight - (verticalGap * 2);
        window.hexagonPositions.asxfWidth = updatedBridgeWidth;
        window.hexagonPositions.hexHeight = hexHeight;
        window.hexagonPositions.asxfHeight = hexHeight;
        window.hexagonPositions.eftposY = eftposY;
        window.hexagonPositions.mastercardY = mastercardY;
        window.hexagonPositions.mastercardX = widerAdminBoxX;
        window.hexagonPositions.mastercardWidth = widerAdminBoxWidth;

        // Store bridge positions for later use
        if (!window.bridgePositions) {
          window.bridgePositions = {};
        }
        window.bridgePositions.bridgeY = bridgeY;

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
        const reducedNarrowBoxWidth = widerAdminBoxWidth * 4 / 5; // Four-fifths the width of Mastercard box
        // Center the boxes above Mastercard box
        const mastercardCenterX = widerAdminBoxX + widerAdminBoxWidth / 2;
        const reducedNarrowBoxX = mastercardCenterX - reducedNarrowBoxWidth / 2;

        // Calculate Y position based on mastercardY
        const realAdminBoxY = mastercardY - adminBoxPadding;
        const boxHeight = hexHeight * 1.1 * 0.9 * 0.9; // Standard box height reduced by 10%
        const reducedBoxHeight = boxHeight * 0.8; // 20% reduced height for main boxes

        // Calculate cshdY first (we'll calculate cecsY based on this)
        const groupShift = -boxHeight / 4; // Move entire group up by quarter box height
        const cshdY = realAdminBoxY - reducedBoxHeight * 1.5 - boxHeight - squareRectGap * 2 - 20 + groupShift + 5; // Position CSHD - moved down by half box height + 5 pixels

        // CECS - position below CSHD with same gap as CSHD-BECS
        const cecsY = cshdY + boxHeight + squareRectGap; // Same gap as between CSHD and BECS

        const cshdBox = createStyledRect(reducedNarrowBoxX, cshdY, reducedNarrowBoxWidth, boxHeight, {
          fill: '#2d5016', // Dark green fill (swapped from border)
          stroke: '#f1ffcc', // Light yellow-green border (swapped from fill)
          strokeWidth: '3',
          rx: '8',
          ry: '8'
        });
        labelsGroup.appendChild(cshdBox);

        // CECS label
        const cshdText = createStyledText(
          reducedNarrowBoxX + reducedNarrowBoxWidth / 2,
          cshdY + boxHeight / 2,
          'CECS',
          {
            fill: '#ffffff' // Light yellow-green text (matching CECS border)
          }
        );
        labelsGroup.appendChild(cshdText);

        // Store CECS position for direct entry bounding line updates
        window.cecsBoxData = {
          x: reducedNarrowBoxX,
          y: cshdY,
          width: reducedNarrowBoxWidth,
          height: boxHeight
        };
        const cecsBox = createStyledRect(reducedNarrowBoxX, cecsY, reducedNarrowBoxWidth, boxHeight, {
          fill: '#000000', // Black fill (from GABS)
          stroke: '#ff0000', // Bright red border (from GABS)
          strokeWidth: '3',
          rx: '8',
          ry: '8'
        });
        labelsGroup.appendChild(cecsBox);

        // CECS label
        const cecsText = createStyledText(
          reducedNarrowBoxX + reducedNarrowBoxWidth / 2,
          cecsY + boxHeight / 2,
          'GABS',
          {
            fill: '#FFFFFF' // White text (from GABS)
          }
        );
        labelsGroup.appendChild(cecsText);

        // Store GABS position separately if needed later
        window.gabsBoxData = {
          x: reducedNarrowBoxX,
          y: cecsY,
          width: reducedNarrowBoxWidth,
          height: boxHeight
        };

        // BECS (third from bottom)
        const becsY = cshdY - boxHeight - squareRectGap; // Above CSHD (automatically shifted with CSHD)
        const becsBox = createStyledRect(reducedNarrowBoxX, becsY, reducedNarrowBoxWidth, boxHeight, {
          fill: '#4a3024', // Shade darker brown interior
          stroke: '#f5efea', // Light tan border (swapped)
          strokeWidth: '3',
          rx: '8',
          ry: '8'
        });
        labelsGroup.appendChild(becsBox);

        // Store BECS box data for connecting lines
        window.becsBoxData = {
          x: reducedNarrowBoxX,
          y: becsY,
          width: reducedNarrowBoxWidth,
          height: boxHeight
        };

        // BECS label
        const becsText = createStyledText(
          reducedNarrowBoxX + reducedNarrowBoxWidth / 2,
          becsY + boxHeight / 2,
          'CSHD',
          {
            fill: '#ffffff', // Same as BECN interior color
            fontSize: '12'
          }
        );
        labelsGroup.appendChild(becsText);

        // APCS (fourth from bottom)
        const apcsY = becsY - boxHeight - squareRectGap;
        const apcsBox = createStyledRect(reducedNarrowBoxX, apcsY, reducedNarrowBoxWidth, boxHeight, {
          fill: '#C41E3A', // Vivid maroon fill (BECS label)
          stroke: '#ffe0e0', // Light pink border (matching text)
          strokeWidth: '3',
          rx: '8',
          ry: '8'
        });
        labelsGroup.appendChild(apcsBox);

        // Store APCS box data (which has BECS label) for connecting lines
        window.apcsBoxData = {
          x: reducedNarrowBoxX,
          y: apcsY,
          width: reducedNarrowBoxWidth,
          height: boxHeight
        };

        // APCS label
        const apcsText = createStyledText(
          reducedNarrowBoxX + reducedNarrowBoxWidth / 2,
          apcsY + boxHeight / 2,
          'BECS',
          {
            fill: '#ffffff', // Light pink (matching BECN interior)
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
          fill: '#4b5563', // Darker grey fill
          stroke: '#e5e7eb', // Light grey border (swapped)
          strokeWidth: '2.5',
          rx: '8',
          ry: '8'
        });
        labelsGroup.appendChild(gabsBox);

        // GABS label
        const gabsText = createStyledText(
          reducedNarrowBoxX + reducedNarrowBoxWidth / 2,
          gabsY + boxHeight / 2,
          'APCS',
          {
            fill: '#ffffff', // White text
            fontSize: '12'
          }
        );
        labelsGroup.appendChild(gabsText);

        // Add three small boxes directly above APCS box
        const newSmallBoxGap = 5; // Gap between the new small boxes
        const newSmallBoxHeight = boxHeight * 0.8; // Same as original APCE/APCR/ACPT boxes
        const newTotalGapWidth = newSmallBoxGap * 2; // Two gaps between three boxes
        const newAvailableWidth = reducedNarrowBoxWidth - newTotalGapWidth; // Total width matches APCS box
        const newSmallBoxWidth = newAvailableWidth / 3; // Each box gets 1/3 of available width
        const newSmallBoxesY = gabsY - newSmallBoxHeight - boxHeight; // Gap equal to APCS box height

        // REMOVED: APCE, APCR, ACPT boxes
        // New APCE box (leftmost)
        // const newApceX = reducedNarrowBoxX; // Left edge aligns with APCS left edge
        // const newApceBox = createStyledRect(newApceX, newSmallBoxesY, newSmallBoxWidth, newSmallBoxHeight, {
        //   fill: '#e5e7eb', // Light grey
        //   stroke: '#6b7280', // Grey border
        //   strokeWidth: '1',
        //   rx: '4',
        //   ry: '4'
        // });
        // labelsGroup.appendChild(newApceBox);

        // const newApceText = createStyledText(
        //   newApceX + newSmallBoxWidth / 2,
        //   newSmallBoxesY + newSmallBoxHeight / 2,
        //   'APCE',
        //   {
        //     fill: '#0a0e27', // Dark blue
        //     fontSize: '8'
        //   }
        // );
        // labelsGroup.appendChild(newApceText);

        // New APCR box (middle)
        // const newApcrX = newApceX + newSmallBoxWidth + newSmallBoxGap;
        // const newApcrBox = createStyledRect(newApcrX, newSmallBoxesY, newSmallBoxWidth, newSmallBoxHeight, {
        //   fill: '#e5e7eb', // Light grey
        //   stroke: '#6b7280', // Grey border
        //   strokeWidth: '1',
        //   rx: '4',
        //   ry: '4'
        // });
        // labelsGroup.appendChild(newApcrBox);

        // const newApcrText = createStyledText(
        //   newApcrX + newSmallBoxWidth / 2,
        //   newSmallBoxesY + newSmallBoxHeight / 2,
        //   'APCR',
        //   {
        //     fill: '#0a0e27', // Dark blue
        //     fontSize: '8'
        //   }
        // );
        // labelsGroup.appendChild(newApcrText);

        // New ACPT box (rightmost)
        // const newAcptX = newApcrX + newSmallBoxWidth + newSmallBoxGap;
        // const newAcptBox = createStyledRect(newAcptX, newSmallBoxesY, newSmallBoxWidth, newSmallBoxHeight, {
        //   fill: '#e5e7eb', // Light grey
        //   stroke: '#6b7280', // Grey border
        //   strokeWidth: '1',
        //   rx: '4',
        //   ry: '4'
        // });
        // labelsGroup.appendChild(newAcptBox);

        // const newAcptText = createStyledText(
        //   newAcptX + newSmallBoxWidth / 2,
        //   newSmallBoxesY + newSmallBoxHeight / 2,
        //   'APCT',
        //   {
        //     fill: '#0a0e27', // Dark blue
        //     fontSize: '8'
        //   }
        // );
        // labelsGroup.appendChild(newAcptText);

        // Add Cheques box above the three small boxes
        const newChequesBoxHeight = boxHeight * 0.8; // Same as original Cheques box
        const newChequesBoxY = newSmallBoxesY - newChequesBoxHeight - 3 - 2; // Position above small boxes with reduced gap, raised by 2px
        const chequesBoxPadding = 10; // Reduced padding for narrower box
        const chequesBoxWidth = reducedNarrowBoxWidth - (chequesBoxPadding * 2);
        const chequesBoxX = reducedNarrowBoxX + chequesBoxPadding;
        const newChequesBox = createStyledRect(chequesBoxX, newChequesBoxY, chequesBoxWidth, newChequesBoxHeight, {
          fill: '#e5e7eb', // Light grey matching APCS border
          stroke: '#e5e7eb', // Light grey border matching APCS
          strokeWidth: '0.5',
          rx: '5',
          ry: '5'
        });
        labelsGroup.appendChild(newChequesBox);

        // Store Cheques box data for line connections
        window.chequesBoxData = {
          x: chequesBoxX,
          y: newChequesBoxY,
          width: chequesBoxWidth,
          height: newChequesBoxHeight
        };

        const newChequesText = createStyledText(
          chequesBoxX + chequesBoxWidth / 2,
          newChequesBoxY + newChequesBoxHeight / 2,
          'Cheques',
          {
            fill: '#000000', // Black text
            fontSize: '11'
          }
        );
        labelsGroup.appendChild(newChequesText);

        // Add single vertical line from Cheques to APCS (BECS label)
        const apcsTopY = gabsY; // Top of APCS box
        const chequesBottomY = newChequesBoxY + newChequesBoxHeight; // Bottom of Cheques box
        const chequesCenterX = chequesBoxX + chequesBoxWidth / 2; // Updated to use new Cheques box center

        // Single vertical line from Cheques to APCS
        const chequesToApcsLine = createStyledLine(
          chequesCenterX, // Center of Cheques
          chequesBottomY,
          chequesCenterX, // Same X (vertical line)
          apcsTopY,
          {
            stroke: '#e5e7eb', // Match APCS border color
            strokeWidth: '2'
          }
        );
        labelsGroup.insertBefore(chequesToApcsLine, newChequesBox);

        // REMOVED: Old connecting lines from APCE/APCR/APCT to APCS
        // // Vertical line from new APCE to APCS
        // const newApceLine = createStyledLine(
        //   newApceX + newSmallBoxWidth / 2, // Center of APCE
        //   newBoxesBottomY,
        //   newApceX + newSmallBoxWidth / 2, // Same X (vertical line)
        //   apcsTopY,
        //   {
        //     stroke: '#6B5D54',
        //     strokeWidth: '1'
        //   }
        // );
        // labelsGroup.insertBefore(newApceLine, newApceBox);

        // // Vertical line from new APCR to APCS
        // const newApcrLine = createStyledLine(
        //   newApcrX + newSmallBoxWidth / 2, // Center of APCR
        //   newBoxesBottomY,
        //   newApcrX + newSmallBoxWidth / 2, // Same X (vertical line)
        //   apcsTopY,
        //   {
        //     stroke: '#6B5D54',
        //     strokeWidth: '1'
        //   }
        // );
        // labelsGroup.insertBefore(newApcrLine, newApcrBox);

        // // Vertical line from new ACPT to APCS
        // const newAcptLine = createStyledLine(
        //   newAcptX + newSmallBoxWidth / 2, // Center of ACPT
        //   newBoxesBottomY,
        //   newAcptX + newSmallBoxWidth / 2, // Same X (vertical line)
        //   apcsTopY,
        //   {
        //     stroke: '#6B5D54',
        //     strokeWidth: '1'
        //   }
        // );
        // labelsGroup.insertBefore(newAcptLine, newAcptBox);

        // Add NPP box aligned with RBA dot at top
        // Position NPP much higher to align with RBA area
        const { rectX: nppRectX, swiftRectWidth: nppSwiftRectWidth, rectHeight: nppRectHeight } = window.rectDimensions || {};
        console.log('NPP box variables from window.rectDimensions:', {
          rectX: nppRectX,
          swiftRectWidth: nppSwiftRectWidth,
          rectHeight: nppRectHeight,
          rectXDefined: typeof nppRectX !== 'undefined',
          swiftRectWidthDefined: typeof nppSwiftRectWidth !== 'undefined',
          rectHeightDefined: typeof nppRectHeight !== 'undefined',
          windowRectDimensions: window.rectDimensions
        });

        // Declare nppY outside the if/else block so it's accessible later
        let nppY = 0;
        let nppBoxCreated = false;

        if (!nppRectX || !nppSwiftRectWidth || !nppRectHeight) {
          console.error('NPP box cannot be created - missing required dimensions');
        } else {
          // Only create NPP box if we have all required dimensions
          const nppVerticalShift = 30; // Shift NPP down to align its base with adjacent labels without moving BSCT
          nppY = 150 - (nppRectHeight * 2) + (nppRectHeight * 0.3) + (nppRectHeight / 6) + nppVerticalShift;
          nppBoxCreated = true;
        console.log('NPP position:', { rectX: nppRectX, nppY, swiftRectWidth: nppSwiftRectWidth, rectHeight: nppRectHeight });
        const nppBox = createStyledRect(nppRectX, nppY, nppSwiftRectWidth, nppRectHeight + 5, {
          fill: '#063d38', // Dark gray
          stroke: '#00ffdf', // Light mint green
          strokeWidth: '2.5'
        });
        nppBox.setAttribute('id', 'npp-box'); // Add ID for later reference
        console.log('NPP box created:', nppBox);
        console.log('NPP box attributes:', {
          x: nppBox.getAttribute('x'),
          y: nppBox.getAttribute('y'),
          width: nppBox.getAttribute('width'),
          height: nppBox.getAttribute('height'),
          fill: nppBox.getAttribute('fill')
        });
        labelsGroup.appendChild(nppBox);
        console.log('NPP box appended to labelsGroup');

        // Store NPP box data for later alignment
        window.nppBoxData = {
          x: nppRectX,
          y: nppY,
          width: nppSwiftRectWidth,
          height: nppRectHeight,
          originalY: nppY
        };

        // Add NPP label with two centered lines
        const nppCenterX = nppRectX + nppSwiftRectWidth / 2;
        const nppCenterY = nppY + nppRectHeight / 2;
        const nppLineOffset = 10;

        const nppTopText = createStyledText(nppCenterX, nppCenterY - nppLineOffset, 'NPP BI', {
          fill: '#ffffff',
          fontSize: '18',
          fontWeight: 'bold'
        });
        nppTopText.setAttribute('id', 'npp-text-top');
        labelsGroup.appendChild(nppTopText);

        const nppBottomText = createStyledText(nppCenterX, nppCenterY + nppLineOffset, '(SWIFT)', {
          fill: '#ffffff',
          fontSize: '14',
          fontWeight: 'bold'
        });
        nppBottomText.setAttribute('id', 'npp-text-bottom');
        labelsGroup.appendChild(nppBottomText);

        window.nppTextElements = {
          top: nppTopText,
          bottom: nppBottomText
        };

        // Add sigmoid curve from NPP to FSS circle
        // NPP right edge and center Y
        const nppRightX = nppRectX + nppSwiftRectWidth;
        // Store original center Y for later use
        const nppCenterYForPath = nppCenterY;
        // We'll update this Y later to match BSCT line
        window.nppToFssOriginalY = nppCenterYForPath;
        // FSS circle position (orange circle)
        const fssCenterX = 300;
        const fssCenterY = 222;

        // Create sigmoid curve that stops at the edge of FSS circle
        const fssRadius = 48; // Outer radius of FSS circle
        const fssLeftEdgeX = fssCenterX - fssRadius;
        const midX = (nppRightX + fssLeftEdgeX) / 2;
        // Connect to lower part of FSS circle (70% down from center)
        const fssConnectionY = fssCenterY + fssRadius * 0.5; // Lower connection point
        const sigmoidData = `M ${nppRightX} ${nppCenterYForPath} 
                            C ${midX} ${nppCenterYForPath},
                              ${midX} ${fssConnectionY},
                              ${fssLeftEdgeX} ${fssConnectionY}`;

        const nppToFssPathStyled = createStyledPath(sigmoidData, {
          stroke: '#5dd9b8',
          strokeWidth: '6',
          fill: 'none'
        });
        nppToFssPathStyled.setAttribute('id', 'npp-to-fss-path');
        // Insert the path at the beginning so it appears behind all circles
        const smallGroup = document.getElementById('small-group');
        svg.insertBefore(nppToFssPathStyled, smallGroup);
        } // End of NPP box creation else block


        // Add XX1, XX2, and XX3 boxes where XXX was
        const xx1Xx2Xx3Gap = 5; // Gap between the three boxes
        const singleSmallBoxWidth = narrowBoxWidth / 3; // Each box is 1/3 width (same as before)
        const xx1Xx2Xx3Height = boxHeight * 0.8; // Reduced by 1/5 (4/5 of original height)
        const nppBottomY = nppBoxCreated ? (nppY + nppRectHeight) : null; // Bottom of NPP (if created)
        const referenceGabsY = typeof gabsY === 'number'
          ? gabsY
          : (nppBottomY !== null ? nppBottomY - squareRectGap - boxHeight : 0);
        const smallBoxY = referenceGabsY - 25; // Align with GABS box, shifted up more

        // Calculate XXX box width to match APCS exactly
        const xxxBoxWidth = reducedNarrowBoxWidth; // Use exact same width as APCS box
        // Use fixed position based on original layout, not dependent on moveable boxes
        const originalGabsX = adminBatchesLeftEdge; // Original position before any moves
        const xxxBoxX = originalGabsX - xxxBoxWidth + 10; // Right edge aligns with original GABS position, shifted right

        // Recalculate box widths to fit within XXX box
        const totalGapWidth = xx1Xx2Xx3Gap * 2; // Two gaps between three boxes
        const availableWidth = xxxBoxWidth - totalGapWidth;
        const newSingleSmallBoxWidth = availableWidth / 3; // Each box gets 1/3 of available width

        // Calculate positions to align with moved XXX box
        const xx1X = xxxBoxX; // XX1 left edge aligns with XXX left edge
        const xx2X = xx1X + newSingleSmallBoxWidth + xx1Xx2Xx3Gap; // XX2 to the right with gap
        const xx3X = xx2X + newSingleSmallBoxWidth + xx1Xx2Xx3Gap; // XX3 to the right with gap

        // Store XX2 right edge for ASX bounding box alignment
        window.apcrRightEdge = xx2X + newSingleSmallBoxWidth;

        // XX1 box (leftmost)
        const threeBoxesAdjustedY = smallBoxY - 10; // Further reduced gap between XXX and XX1/XX2/XX3
        const xx1Box = createStyledRect(xx1X, threeBoxesAdjustedY, newSingleSmallBoxWidth, xx1Xx2Xx3Height, {
          fill: '#e5e7eb', // Light grey
          stroke: '#6b7280', // Grey border
          strokeWidth: '1',
          rx: '4',
          ry: '4'
        });
        // labelsGroup.appendChild(xx1Box); // REMOVED: XX1 box not rendered
        window.apceApcrAcptData = window.apceApcrAcptData || {};
        window.apceApcrAcptData.APCE = { rect: xx1Box };

        // XX1 text
        const xx1Text = createStyledText(
          xx1X + newSingleSmallBoxWidth / 2,
          threeBoxesAdjustedY + xx1Xx2Xx3Height / 2,
          'XX1',
          {
            fill: '#0a0e27', // Very dark blue
            fontSize: '8'
          }
        );
        // labelsGroup.appendChild(xx1Text); // REMOVED: XX1 text not rendered
        window.apceApcrAcptData.APCE.text = xx1Text;

        // XX2 box (middle)
        const xx2Box = createStyledRect(xx2X, threeBoxesAdjustedY, newSingleSmallBoxWidth, xx1Xx2Xx3Height, {
          fill: '#e5e7eb', // Light grey
          stroke: '#6b7280', // Grey border,
          strokeWidth: '1',
          rx: '4',
          ry: '4'
        });
        // labelsGroup.appendChild(xx2Box); // REMOVED: XX2 box not rendered
        window.apceApcrAcptData.APCR = { rect: xx2Box };

        // XX2 text
        const xx2Text = createStyledText(
          xx2X + newSingleSmallBoxWidth / 2,
          threeBoxesAdjustedY + xx1Xx2Xx3Height / 2,
          'XX2',
          {
            fill: '#0a0e27', // Very dark blue
            fontSize: '8'
          }
        );
        // labelsGroup.appendChild(xx2Text); // REMOVED: XX2 text not rendered
        window.apceApcrAcptData.APCR.text = xx2Text;

        // XX3 box (rightmost)
        const xx3Box = createStyledRect(xx3X, threeBoxesAdjustedY, newSingleSmallBoxWidth, xx1Xx2Xx3Height, {
          fill: '#e5e7eb', // Light grey
          stroke: '#6b7280', // Grey border,
          strokeWidth: '1',
          rx: '4',
          ry: '4'
        });
        // labelsGroup.appendChild(xx3Box); // REMOVED: XX3 box not rendered
        window.apceApcrAcptData.ACPT = { rect: xx3Box };

        // XX3 text
        const xx3Text = createStyledText(
          xx3X + newSingleSmallBoxWidth / 2,
          threeBoxesAdjustedY + xx1Xx2Xx3Height / 2,
          'XX3',
          {
            fill: '#0a0e27', // Very dark blue
            fontSize: '8'
          }
        );
        // labelsGroup.appendChild(xx3Text); // REMOVED: XX3 text not rendered
        window.apceApcrAcptData.ACPT.text = xx3Text;

        // Add XXX box above the three small boxes
        const xxxBoxExtraGap = -12; // Much smaller gap to bring boxes closer
        const xxxBoxGap = squareRectGap + xxxBoxExtraGap; // Much reduced gap
        // xxxBoxX and xxxBoxWidth already calculated above
        const xxxBoxHeight = boxHeight * 0.8; // Reduced by 1/5 (4/5 of original height)
        const xxxBaseY = smallBoxY - xxxBoxHeight - xxxBoxGap; // Baseline position shared with BEC*/DE
        const xxxBoxOffsetY = 0; // Maintain original gap between XXX and XX1 row
        const xxxBoxY = xxxBaseY + xxxBoxOffsetY - 15; // Lowered XXX box to reduce gap with new boxes below

        // Create filled XXX box
        const xxxBox = createStyledRect(xxxBoxX, xxxBoxY, xxxBoxWidth, xxxBoxHeight, {
          fill: '#4b5563', // Dark grey
          stroke: 'none',
          rx: '5',
          ry: '5'
        });
        // labelsGroup.appendChild(xxxBox); // REMOVED: XXX box not rendered

        // Add XXX text
        const xxxText = createStyledText(
          xxxBoxX + xxxBoxWidth / 2,
          xxxBoxY + xxxBoxHeight / 2,
          'XXX',
          {
            fill: '#ffffff', // White text
            fontSize: '11'
          }
        );
        // labelsGroup.appendChild(xxxText); // REMOVED: XXX text not rendered

        window.xxxBoxData = {
          x: xxxBoxX,
          y: xxxBoxY,
          width: xxxBoxWidth,
          height: xxxBoxHeight
        };

        // Store ASX boxes alignment for later use
        // First calculate the ASX bounding box dimensions
        const asxBoxPadding = 5; // Padding for ASX bounding box
        const preliminaryAsxBoxX = moneyMarketX - 10 - 30; // Preliminary X position
        const preliminaryAsxBoxWidth = window.apcrRightEdge ? 
          window.apcrRightEdge - preliminaryAsxBoxX : 
          rectWidth * 1.2 + 20;

        // Store ASX boxes alignment for later use
        // Calculate symmetric padding for the ASX bounding box
        const symmetricPadding = 15; // Equal padding on both sides

        // Set interior boxes to be centered within the ASX box
        const boxWidth = rectWidth * 1.1; // Standard width for interior boxes
        const contentLeftEdge = moneyMarketX;
        const contentRightEdge = window.apcrRightEdge || (moneyMarketX + rectWidth * 1.2);
        const contentCenter = (contentLeftEdge + contentRightEdge) / 2;

        window.asxBoxesAlignment = {
          leftEdge: contentCenter - (boxWidth / 2),
          rightEdge: contentCenter + (boxWidth / 2),
          width: boxWidth,
          center: contentCenter
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

          // Line position stays the same since right edge is unchanged
        }

        // Old lines from original XX1/XX2/XX3 to APCS have been removed
        // The new boxes above APCS now have vertical connecting lines instead




        // Add dark grey box around all the rounded rectangles (Administered Batches)
        const adminBoxY = mastercardY - 10; // Start above Mastercard (using literal value for padding)
        // Height to encompass all boxes plus space for label
        const adminBoxHeight = (bridgeY + hexHeight) - mastercardY + 2 * 10 + 20; // Slightly more bottom padding

        const adminBatchesBox = createStyledRect(window.hexagonPositions.mastercardX - 10 - 5, adminBoxY, window.hexagonPositions.mastercardWidth + 2 * 10 + 10, adminBoxHeight, {
          fill: '#3B3B3B', // Darker grey
          stroke: '#D0D0D0', // Light grey border
          strokeWidth: '1',
          rx: '10',
          ry: '10'
        });
        adminBatchesBox.setAttribute('opacity', '0.8');
        // Store admin box to insert later - we need it behind everything
        window.adminBatchesBoxElement = adminBatchesBox;

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

          // Add "Administered Batches" label (moved inside scope where adminBoxY is defined)
          const adminBatchesText = createStyledText(
            (window.hexagonPositions.mastercardX - 10 - 5) + (window.hexagonPositions.mastercardWidth + 2 * 10 + 10) / 2,
            adminBoxY + adminBoxHeight - 14,  // Nudged up from bottom edge
            'Administered Batches',
            {
              fill: '#E8E8E8', // Lighter grey text
              fontSize: '13' // One font size bigger
            }
          );
          labelsGroup.appendChild(adminBatchesText);

          // Now insert the admin batches box at the very beginning so it's behind all the lines
          if (window.adminBatchesBoxElement) {
            svg.insertBefore(window.adminBatchesBoxElement, svg.firstChild);
          }

        // Calculate gap between admin box bottom and CHESS-RTGS top
        // Note: adminBoxY and adminBoxHeight are out of scope here
        // const adminBoxBottom = adminBoxY + adminBoxHeight;
        // const targetGap = chessY - adminBoxBottom;

        // Move SWIFT group down by a moderate amount
        // This positions it roughly where CLS AUD bottom might align with ESAs
        // Get rtgsY from the stored RTGS element
        let rtgsBottom = 0;
        if (window.rtgsElements && window.rtgsElements.rect) {
          const rtgsY = parseFloat(window.rtgsElements.rect.getAttribute('y'));
          const rtgsHeight = parseFloat(window.rtgsElements.rect.getAttribute('height'));
          rtgsBottom = rtgsY + rtgsHeight;
        }
        const newSwiftHvcsTop = rtgsBottom + 43; // Move down by 43 pixels from RTGS (was 40, increased by 3)

        // Calculate adjustment needed for entire SWIFT group
        if (window.swiftGroupOriginalY) {
          const swiftGroupAdjustment = newSwiftHvcsTop - window.swiftGroupOriginalY;

          // Update all SWIFT group elements
          // Update SWIFT PDS box
          const swiftRect = document.getElementById('swift-pds-rect');
          if (swiftRect) {
            const currentY = parseFloat(swiftRect.getAttribute('y'));
            swiftRect.setAttribute('y', (currentY + swiftGroupAdjustment).toFixed(2));
          }

          // Update SWIFT PDS text element
          if (window.swiftPdsTextData && window.swiftPdsTextData.element) {
            const swiftTextEl = window.swiftPdsTextData.element;
            const currentY = parseFloat(swiftTextEl.getAttribute('y'));
            swiftTextEl.setAttribute('y', (currentY + swiftGroupAdjustment).toFixed(2));
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
          // CLS AUD is now above SWIFT PDS
          window.clsAudAdjustedY = window.swiftGroupAdjustedY - smallRectHeight - verticalGap;
        }

        // Use stored alignment if available and apply shift
        const alignedMoneyMarketWidth = rectWidth * 0.95;
        let alignedMoneyMarketX = window.asxBoxesAlignment ? window.asxBoxesAlignment.center - (alignedMoneyMarketWidth / 2) : moneyMarketX;

        // Apply shift if DvP RTGS was aligned to SWIFT HVCS
        if (window.asxGroupShiftAmount) {
          alignedMoneyMarketX += window.asxGroupShiftAmount;
        }

        moneyMarketRect = createStyledRect(alignedMoneyMarketX, moneyMarketY, alignedMoneyMarketWidth, smallRectHeight * 0.9, {
          fill: '#fffaf0', // Light cream background
          stroke: '#071f6a', // Blue border
          strokeWidth: '2',
          rx: '8', // Rounded corners
          ry: '8' // Rounded corners
        });
        labelsGroup.appendChild(moneyMarketRect);

        // Add label for cash transfer (MM/repo)
        const moneyMarketText = createStyledText(
          alignedMoneyMarketX + alignedMoneyMarketWidth / 2,
          moneyMarketY + smallRectHeight * 0.9 / 2,
          'cash transfer',
          {
            fill: '#071f6a', // Blue text
            fontSize: '11' // Reduced font size
          }
        );
        labelsGroup.appendChild(moneyMarketText);

        // Sympli line extension moved to after ADI box creation

        // Add horizontal line connecting RTGS / DvP RTGS to Money Market / Repo
        const moneyMarketLineY = moneyMarketY + smallRectHeight * 0.9 / 2; // Middle of Money Market box
        const moneyMarketRightEdge = alignedMoneyMarketX + alignedMoneyMarketWidth;
        const rtgsToMoneyMarketLine = createStyledLine(
          moneyMarketRightEdge, moneyMarketLineY,
          dvpRtgsX, moneyMarketLineY,
          {
            stroke: austraclearLineColor,
            strokeWidth: austraclearLineWidth,
            strokeLinecap: 'round'
          }
        );
        svg.insertBefore(rtgsToMoneyMarketLine, labelsGroup);

        // Calculate CHESS equities position first
        const sssCcpY = moneyMarketY - smallRectHeight * 0.9 - verticalGap;
        // Calculate chessEquitiesY based on where clearing/netting will be
        const tradeByTradeYCalc = moneyMarketY - 2 * smallRectHeight - 3 * verticalGap - 5; // Same as trade-by-trade calculation
        const clearingYCalc = tradeByTradeYCalc - smallRectHeight * 0.9 - verticalGap; // Same as clearing calculation
        let chessEquitiesY = clearingYCalc - 11; // Shifted down by 2 more pixels (was -13, now -11)

        // ASX bounding box will be created after CHESS equities box to ensure proper alignment

        // Update SWIFT HVCS box - widen by 5% on each side from its current position
        if (window.swiftHvcsElements && window.swiftHvcsElements.boundingBox) {
          // Get current position and dimensions from the element itself
          const currentHvcsX = parseFloat(window.swiftHvcsElements.boundingBox.getAttribute('x'));
          const currentHvcsWidth = parseFloat(window.swiftHvcsElements.boundingBox.getAttribute('width'));
          const currentRightEdge = currentHvcsX + currentHvcsWidth;

          // Store original dimensions before widening
          const originalHvcsBoxX = currentHvcsX;
          const originalHvcsBoxWidth = currentHvcsWidth;

          // Widen by 5% on each side, plus additional 50% to make PACS boxes wider
          const widthIncrease = originalHvcsBoxWidth * 0.05;
          const pacsWidthIncrease = originalHvcsBoxWidth * 0.5; // 50% increase for PACS boxes
          // Keep right edge fixed, so only extend to the left
          const hvcsBoxX_final = originalHvcsBoxX - widthIncrease - pacsWidthIncrease; // Move left edge left
          const hvcsBoxWidth_final = originalHvcsBoxWidth + (widthIncrease * 2) + pacsWidthIncrease; // Total width increase

          // Update bounding box position and width
          window.swiftHvcsElements.boundingBox.setAttribute('x', hvcsBoxX_final.toFixed(2));
          window.swiftHvcsElements.boundingBox.setAttribute('width', hvcsBoxWidth_final.toFixed(2));

          // Update right edge position for the line
          window.swiftHvcsElements.rightEdge = hvcsBoxX_final + hvcsBoxWidth_final;

          // Use the current right edge for calculations if needed
          if (!window.swiftHvcsElements.rightEdge) {
            window.swiftHvcsElements.rightEdge = currentRightEdge;
          }

          // Update line start position since SWIFT HVCS box has moved
          if (window.hvcsLineData) {
            window.hvcsLineData.startX = hvcsBoxX_final + hvcsBoxWidth_final;
          }

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

          // Update line start position to new right edge
          const newHvcsBoxRight = hvcsBoxX_final + hvcsBoxWidth_final;
          const path = window.swiftHvcsElements.hvcsLine.getAttribute('d');
          const newPath = path.replace(/M ([\d.]+)/, `M ${newHvcsBoxRight.toFixed(2)}`);
          window.swiftHvcsElements.hvcsLine.setAttribute('d', newPath);

          console.log('=== FINAL COORDINATES FOR USER QUESTION ===');

          // Get SWIFT PDS box final position
          const swiftPdsRect = document.getElementById('swift-pds-rect');
          if (swiftPdsRect) {
            const swiftPdsX = parseFloat(swiftPdsRect.getAttribute('x'));
            const swiftPdsY = parseFloat(swiftPdsRect.getAttribute('y'));
            const swiftPdsHeightFromRect = parseFloat(swiftPdsRect.getAttribute('height'));

            // CLS AUD is above SWIFT PDS by verticalGap
            const clsAudBottom = swiftPdsY;
            const clsAudTop = clsAudBottom - smallRectHeight;

            console.log('1) Vertical gap between SWIFT PDS top and CLS AUD bottom:', swiftPdsY - clsAudBottom, 'pixels');
            console.log('   (Should be 0 since CLS AUD bottom touches SWIFT PDS top)');
            console.log('   Actual gap is:', verticalGap, 'pixels between the boxes');

            console.log('2) SWIFT PDS left edge:', swiftPdsX, 'pixels');

            console.log('3) SWIFT HVCS right edge:', newHvcsBoxRight, 'pixels');

            const horizontalGap = swiftPdsX - newHvcsBoxRight;
            console.log('   Horizontal gap between SWIFT HVCS and SWIFT PDS:', horizontalGap, 'pixels');
            console.log('   This should match the vertical gap of', verticalGap, 'pixels');

            if (Math.abs(horizontalGap - verticalGap) < 0.01) {
              console.log('   ✓ Gaps match!');
            } else {
              console.log('   ✗ Gaps do not match. Need to adjust SWIFT HVCS position.');
              console.log('   Required adjustment:', verticalGap - horizontalGap, 'pixels to the right');

              // Fix the position to match the gap
              const correctedHvcsBoxX = swiftPdsX - verticalGap - hvcsBoxWidth_final;
              window.swiftHvcsElements.boundingBox.setAttribute('x', correctedHvcsBoxX.toFixed(2));

              // Update PACS boxes inside
              const correctedPacsStartX = correctedHvcsBoxX + internalPadding_final;
              window.swiftHvcsElements.pacsElements.forEach((elem) => {
                elem.rect.setAttribute('x', correctedPacsStartX.toFixed(2));
                elem.text.setAttribute('x', (correctedPacsStartX + pacsBoxWidth_final / 2).toFixed(2));
              });

              // Update SWIFT HVCS label
              const correctedHvcsBoxCenterX = correctedHvcsBoxX + hvcsBoxWidth_final / 2;
              window.swiftHvcsElements.hvcsLabel.setAttribute('x', correctedHvcsBoxCenterX.toFixed(2));

              // Update line start position
              const correctedHvcsBoxRight = correctedHvcsBoxX + hvcsBoxWidth_final;
              const correctedPath = window.swiftHvcsElements.hvcsLine.getAttribute('d');
              const correctedNewPath = correctedPath.replace(/M ([\d.]+)/, `M ${correctedHvcsBoxRight.toFixed(2)}`);
              window.swiftHvcsElements.hvcsLine.setAttribute('d', correctedNewPath);

              console.log('   ✓ Fixed! New SWIFT HVCS right edge:', correctedHvcsBoxRight, 'pixels');
              console.log('   New horizontal gap:', swiftPdsX - correctedHvcsBoxRight, 'pixels');
            }
          }

          // Align DvP RTGS and RTGS boxes to SWIFT HVCS FINAL left edge
          if (window.dvpRtgsElements && window.rtgsElements) {
            // Get the FINAL position of SWIFT HVCS box
            const finalHvcsX = parseFloat(window.swiftHvcsElements.boundingBox.getAttribute('x'));

            // Get current DvP RTGS box position and width
            const currentDvpX = parseFloat(window.dvpRtgsElements.rect.getAttribute('x'));
            const currentDvpWidth = parseFloat(window.dvpRtgsElements.rect.getAttribute('width'));
            const dvpRightEdge = currentDvpX + currentDvpWidth; // This is what we keep fixed

            // Calculate new width (right edge stays, left edge moves to SWIFT HVCS)
            const newWidth = dvpRightEdge - finalHvcsX;

            if (newWidth > 0) {
              // Update DvP RTGS box
              window.dvpRtgsElements.rect.setAttribute('x', finalHvcsX.toFixed(2));
              window.dvpRtgsElements.rect.setAttribute('width', newWidth.toFixed(2));

              // Center text in the new width
              const newTextX = finalHvcsX + newWidth / 2;
              window.dvpRtgsElements.text.setAttribute('x', newTextX.toFixed(2));

              // Update tspans
              const dvpTspans = window.dvpRtgsElements.text.getElementsByTagName('tspan');
              for (let tspan of dvpTspans) {
                tspan.setAttribute('x', newTextX.toFixed(2));
              }

              // Update RTGS box the same way
              window.rtgsElements.rect.setAttribute('x', finalHvcsX.toFixed(2));
              window.rtgsElements.rect.setAttribute('width', newWidth.toFixed(2));
              window.rtgsElements.text.setAttribute('x', newTextX.toFixed(2));

              console.log('=== FINAL DvP RTGS/RTGS ALIGNMENT ===');
              console.log('SWIFT HVCS final left edge:', finalHvcsX.toFixed(2));
              console.log('DvP/RTGS new left edge:', finalHvcsX.toFixed(2));
              console.log('DvP/RTGS right edge (unchanged):', dvpRightEdge.toFixed(2));
              console.log('New width:', newWidth.toFixed(2));
            }
          }

          // Now reduce the width of DvP RTGS and RTGS boxes to 60%, keeping left edge fixed
          if (window.dvpRtgsElements && window.rtgsElements) {
            // Get current width and reduce to 60%
            const currentDvpWidth = parseFloat(window.dvpRtgsElements.rect.getAttribute('width'));
            const sixtyPercentWidth = currentDvpWidth * 0.6;

            // Update DvP RTGS box width (left edge stays the same)
            window.dvpRtgsElements.rect.setAttribute('width', sixtyPercentWidth.toFixed(2));

            // Update text position (center in the new narrower width)
            const dvpX = parseFloat(window.dvpRtgsElements.rect.getAttribute('x'));
            const newTextX = dvpX + sixtyPercentWidth / 2;
            window.dvpRtgsElements.text.setAttribute('x', newTextX.toFixed(2));

            // Update tspans
            const dvpTspans = window.dvpRtgsElements.text.getElementsByTagName('tspan');
            for (let tspan of dvpTspans) {
              tspan.setAttribute('x', newTextX.toFixed(2));
            }

            // Update RTGS box the same way
            window.rtgsElements.rect.setAttribute('width', sixtyPercentWidth.toFixed(2));
            window.rtgsElements.text.setAttribute('x', newTextX.toFixed(2));

            // Shift both DvP RTGS and RTGS boxes slightly to the left
            const leftShift = 8; // Shift by 8 pixels

            // Get current positions
            const currentDvpX = parseFloat(window.dvpRtgsElements.rect.getAttribute('x'));
            const currentRtgsX = parseFloat(window.rtgsElements.rect.getAttribute('x'));

            // Update DvP RTGS box position
            const newDvpX = currentDvpX - leftShift;
            window.dvpRtgsElements.rect.setAttribute('x', newDvpX.toFixed(2));

            // Update DvP RTGS text position
            const newDvpTextX = newDvpX + sixtyPercentWidth / 2;
            window.dvpRtgsElements.text.setAttribute('x', newDvpTextX.toFixed(2));

            // Update DvP RTGS tspans
            const dvpTspansShift = window.dvpRtgsElements.text.getElementsByTagName('tspan');
            for (let tspan of dvpTspansShift) {
              tspan.setAttribute('x', newDvpTextX.toFixed(2));
            }

            // Update RTGS box position
            const newRtgsX = currentRtgsX - leftShift;
            window.rtgsElements.rect.setAttribute('x', newRtgsX.toFixed(2));
            window.rtgsElements.text.setAttribute('x', newDvpTextX.toFixed(2));

            console.log('=== REDUCED DvP RTGS/RTGS WIDTH TO 60% ===');
            console.log('Original width:', currentDvpWidth.toFixed(2));
            console.log('New width:', sixtyPercentWidth.toFixed(2));
            console.log('Left edge (unchanged):', dvpX.toFixed(2));
            console.log('New right edge:', (dvpX + sixtyPercentWidth).toFixed(2));
          }

          // Now draw the connecting lines between pacs boxes and SWIFT PDS
          // The pacs boxes have now been positioned correctly
          console.log('=== DRAWING PACS TO SWIFT PDS CONNECTING LINES ===');

          // Get the SWIFT PDS box position (already have swiftPdsRect from above)
          const swiftPdsXForLines = parseFloat(swiftPdsRect.getAttribute('x'));
          const swiftPdsYForLines = parseFloat(swiftPdsRect.getAttribute('y'));
          const swiftPdsHeightForLines = parseFloat(swiftPdsRect.getAttribute('height'));

          const lineColor = '#5dd9b8'; // Brighter shade
          const lineWidth = '6'; // Thick lines matching other thick lines

          // Store connecting lines for updates
          window.pacsToSwiftLines = [];

          for (let j = 0; j < 3; j++) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('id', `pacs-to-swift-line-${j}`);

            // Get the actual pacs box element to find its exact position
            const pacsRect = window.swiftHvcsElements.pacsElements[j].rect;
            const pacsRectX = parseFloat(pacsRect.getAttribute('x'));
            const pacsRectY = parseFloat(pacsRect.getAttribute('y'));
            const pacsRectWidth = parseFloat(pacsRect.getAttribute('width'));
            const pacsRectHeight = parseFloat(pacsRect.getAttribute('height'));

            // Start from right edge of pacs box, middle height
            const startX = pacsRectX + pacsRectWidth;
            const startY = pacsRectY + pacsRectHeight / 2;

            // End at left edge of SWIFT PDS box at the corresponding line position
            const endX = swiftPdsXForLines;
            // Use the same Y coordinate as lines entering SWIFT PDS (1/6, 1/2, 5/6)
            const positions = [1/6, 0.5, 5/6];
            const endY = swiftPdsYForLines + swiftPdsHeightForLines * positions[j];

            line.setAttribute('x1', startX.toFixed(2));
            line.setAttribute('y1', startY.toFixed(2));
            line.setAttribute('x2', endX.toFixed(2));
            line.setAttribute('y2', endY.toFixed(2));
            line.setAttribute('stroke', lineColor);
            line.setAttribute('stroke-width', lineWidth);
            line.setAttribute('stroke-linecap', 'round'); // Rounded line ends

            console.log(`Line ${j}: from (${startX.toFixed(2)}, ${startY.toFixed(2)}) to (${endX.toFixed(2)}, ${endY.toFixed(2)})`);
            console.log(`PACS box ${j}: x=${pacsRectX.toFixed(2)}, width=${pacsRectWidth.toFixed(2)}, rightEdge=${(pacsRectX + pacsRectWidth).toFixed(2)}`);
            console.log(`SWIFT PDS: x=${swiftPdsXForLines.toFixed(2)}, line enters at Y=${endY.toFixed(2)}`);

            // Insert lines before labels so they appear behind
            svg.insertBefore(line, labelsGroup);

            // Store line for updates
            window.pacsToSwiftLines.push(line);
          }

          console.log('Created', window.pacsToSwiftLines.length, 'connecting lines');
        }

        // Note: SWIFT PDS, NPP, and CLS AUD boxes remain square as originally designed

        // ASX label will be added after ASX box is created
        // ASX-related lines and Sympli/PEXA boxes will be added after ASX box is created
        const interiorBoxX = moneyMarketX; // Same X as other aligned boxes
        const chessEquitiesX = interiorBoxX - 10; // Add small padding around interior boxes
        // Position already calculated above
        const chessEquitiesWidth = rectWidth + 5; // Width to encompass interior boxes with padding
        // Height to encompass clearing/netting and trade-by-trade with padding
        const extraChessHeight = 6; // Slightly taller interior box
        const chessEquitiesHeight = (tradeByTradeYCalc + smallRectHeight * 0.9) - clearingYCalc + 27 + 1 + extraChessHeight;

        let alignedChessEquitiesX = window.asxBoxesAlignment ? window.asxBoxesAlignment.center - (chessEquitiesWidth / 2) : chessEquitiesX;
        if (window.asxGroupShiftAmount) {
          alignedChessEquitiesX += window.asxGroupShiftAmount;
        }
        const alignedChessEquitiesWidth = chessEquitiesWidth;

        const tradeByTradeHeight = smallRectHeight * 0.9;
        const tradeByTradeYAdjusted = moneyMarketY - 2 * smallRectHeight - 3 * verticalGap + 6; // Matches later trade-by-trade positioning
        const tradeByTradeBottom = tradeByTradeYAdjusted + tradeByTradeHeight;
        const desiredChessBottom = tradeByTradeBottom + (sssCcpY - tradeByTradeBottom) / 2;
        const currentChessBottom = chessEquitiesY + chessEquitiesHeight;
        const chessVerticalShift = currentChessBottom - desiredChessBottom;
        chessEquitiesY -= chessVerticalShift;

        const chessTopPadding = 3; // Extra breathing room above content
        chessEquitiesY -= chessTopPadding;
        const chessEquitiesAdjustedHeight = chessEquitiesHeight + chessTopPadding;

        const chessEquitiesRect = createStyledRect(alignedChessEquitiesX, chessEquitiesY, alignedChessEquitiesWidth, chessEquitiesAdjustedHeight, {
          fill: '#009fff', // Deeper blue (RTGS box color)
          stroke: 'white', // Thin white border
          strokeWidth: '0.5',
          rx: '8',
          ry: '8'
        });
        // Remove opacity for white background
        svg.insertBefore(chessEquitiesRect, labelsGroup); // Insert behind other elements

        // Add CHESS equities label
        const chessEquitiesText = createStyledText(
          alignedChessEquitiesX + alignedChessEquitiesWidth / 2,
          chessEquitiesY + 18, // Nudged slightly downward inside the panel
          'CHESS',
          {
            fill: '#ffffff', // White text
            fontSize: '18' // Bigger font size
          }
        );
        labelsGroup.appendChild(chessEquitiesText);

        // ASX bounding box will be created after SSS/CCP box is defined

        // Add Sympli e-conveyancing box above ASX
        // Apply same adjustment as SWIFT group if available
        let sympliAdjustment = 0;
        if (window.swiftGroupOriginalY && window.swiftGroupAdjustedY) {
          sympliAdjustment = window.swiftGroupAdjustedY - window.swiftGroupOriginalY;
        }
        // Align Sympli with ASXF box (similar to how PEXA e-conveyancing aligns with PEXA)
        const sympliY = window.hexagonPositions.asxfY; // Align with ASXF box Y position
        const sympliWidth = rectWidth * 1.6; // Wider than before but still narrower than PEXA (1.8)

        // Calculate new X position based on ASX bounding box
        // Center the box over the ASX bounding box
        let sympliX;
        if (window.asxBoxRightEdge && window.finalAsxBox) {
          const asxBoxWidth = window.finalAsxBox.width;
          const asxBoxCenter = window.finalAsxBox.x + asxBoxWidth / 2;
          sympliX = asxBoxCenter - sympliWidth / 2;
        } else {
          // Fallback to original calculation
          sympliX = moneyMarketX + rectWidth * 1.1 - sympliWidth - 60;
        }

        const sympliHeight = smallRectHeight * 0.9 * 1.2 * 0.95;
        const sympliBox = createStyledRect(sympliX, sympliY, sympliWidth, sympliHeight, {
          fill: 'rgb(239,136,51)', // Sympli original color
          stroke: '#ffffff', // Very thin white border
          strokeWidth: '0.5'
        });
        sympliBox.setAttribute('rx', '8'); // Rounded corners
        sympliBox.setAttribute('ry', '8'); // Rounded corners
        labelsGroup.appendChild(sympliBox);

        // Add Sympli text
        const sympliText = createStyledText(
          sympliX + sympliWidth / 2,
          sympliY + sympliHeight / 2,
          'Sympli e-conveyancing',
          {
            fill: '#ffffff', // White text
            fontSize: '12'
          }
        );
        labelsGroup.appendChild(sympliText);

        // Store Sympli box data for creating orange line to ADIs later
        window.sympliBoxData = {
          x: sympliX,
          y: sympliY,
          width: sympliWidth,
          height: sympliHeight
        };

        const sympliLineGap = 3.0;
        const sympliLineColor = '#FF0090';
        const sympliLineOffsets = [-sympliLineGap/2, sympliLineGap/2]; // Double lines (gap = 1.5 to match curved lines)
        const sympliConnectorStartX = sympliX + sympliWidth;
        let sympliConnectorEndX = sympliConnectorStartX;
        if (window.bridgePositions) {
          const left = window.bridgePositions.bridgeX;
          const right = left + window.bridgePositions.bridgeWidth;
          sympliConnectorEndX = left;
          if (left <= sympliConnectorStartX) {
            sympliConnectorEndX = right;
          }
        }
        window.sympliHorizontalLines = sympliLineOffsets.map((offset, idx) => {
          const line = createStyledLine(
            sympliConnectorStartX,
            sympliY + sympliHeight / 2 + offset,
            sympliConnectorEndX,
            sympliY + sympliHeight / 2 + offset,
            {
              stroke: sympliLineColor,
              strokeWidth: '2.25', // Match curved double lines
              strokeLinecap: 'round'
            }
          );
          line.setAttribute('id', `sympli-horizontal-line-${idx}`);
          if (redLinesGroup) {
            redLinesGroup.appendChild(line);
          } else {
            labelsGroup.insertBefore(line, labelsGroup.firstChild);
          }
          return line;
        });
        window.newSympliX = sympliX;
        window.newSympliY = sympliY;
        window.newSympliWidth = sympliWidth;

        // Add PEXA e-conveyancing box above Sympli
        // Align with PEXA box to make the line horizontal
        const pexaConveyY = pexaY; // Align top with PEXA box
        const pexaConveyWidth = sympliWidth; // Same width as Sympli

        // Calculate new X position based on ASX bounding box
        // Center the box over the ASX bounding box
        let pexaConveyX;
        if (window.asxBoxRightEdge && window.finalAsxBox) {
          const asxBoxWidth = window.finalAsxBox.width;
          const asxBoxCenter = window.finalAsxBox.x + asxBoxWidth / 2;
          pexaConveyX = asxBoxCenter - pexaConveyWidth / 2;
        } else {
          // Fallback to original calculation
          pexaConveyX = moneyMarketX + rectWidth * 1.1 - pexaConveyWidth - 60;
        }

        const pexaConveyHeight = smallRectHeight * 0.9 * 1.2 * 0.95;
        const pexaConveyBox = createStyledRect(pexaConveyX, pexaConveyY, pexaConveyWidth, pexaConveyHeight, {
          fill: 'rgb(179,46,161)', // Same as PEXA border (solid fill)
          stroke: '#ffffff', // Very thin white border
          strokeWidth: '0.5',
          rx: '8', // Rounded corners
          ry: '8' // Rounded corners
        });
        labelsGroup.appendChild(pexaConveyBox);

        // Add PEXA e-conveyancing text
        const pexaConveyText = createStyledText(
          pexaConveyX + pexaConveyWidth / 2,
          pexaConveyY + pexaConveyHeight / 2,
          'PEXA e-conveyancing',
          {
            fill: '#ffffff', // White text
            fontSize: '12'
          }
        );
        labelsGroup.appendChild(pexaConveyText);

        window.pexaConveyBoxData = {
          x: pexaConveyX,
          y: pexaConveyY,
          width: pexaConveyWidth,
          height: pexaConveyHeight
        };

        // Add eftpos and Mastercard boxes stacked above PEXA e-conveyancing
        if (window.hexagonPositions) {
          const stackedHeight = pexaConveyHeight;
          const boxWidth = window.hexagonPositions.mastercardWidth;
          const centerX = pexaConveyX + pexaConveyWidth / 2;
          const baseX = centerX - boxWidth / 2;
          const fallbackGap = 12;

          const sympliBottom = sympliY + sympliHeight;
          let gapSympliPexa = pexaConveyY - sympliBottom;
          if (!Number.isFinite(gapSympliPexa) || gapSympliPexa <= 0) {
            gapSympliPexa = fallbackGap;
          }

          const baseEftposY = pexaConveyY - gapSympliPexa - stackedHeight;
          const essbY = window.hexagonPositions.eftposY;
          const shift = essbY - baseEftposY;
          const eftposY = baseEftposY + shift;
          const mastercardY = eftposY - gapSympliPexa - stackedHeight;

          const createStackedRect = (y, fillColor, label, xOverride, heightOverride, fontSizeOverride) => {
            // Reduce width by 20% for ATMs, Claims, Other Cards, and Visa boxes
            const isNarrowBox = ['ATMs', 'Claims', 'Other Cards', 'Visa'].includes(label);

            // For narrow boxes, reduce width by 20%
            let stackBoxWidth;
            if (isNarrowBox) {
              stackBoxWidth = boxWidth * 0.8; // 80% of original width (20% reduction)
            } else {
              stackBoxWidth = boxWidth;
            }

            // Center the narrower boxes
            let xPos;
            if (isNarrowBox) {
              // If xOverride is provided, center based on that position, otherwise use baseX
              const originalCenterX = xOverride !== undefined ? (xOverride + boxWidth / 2) : (baseX + boxWidth / 2);
              xPos = originalCenterX - stackBoxWidth / 2;
            } else {
              xPos = xOverride !== undefined ? xOverride : baseX;
            }

            const rectHeight = Number.isFinite(heightOverride) ? heightOverride : stackedHeight;
            console.log(`Creating ${label} box at X: ${xPos}, Y: ${y}, Width: ${stackBoxWidth}`);
            if (isNarrowBox) {
              console.log(`  - isNarrowBox: true`);
              console.log(`  - window.lvssBoxPositions:`, window.lvssBoxPositions);
              console.log(`  - narrowBoxWidth:`, window.lvssBoxPositions?.narrowBoxWidth);
              console.log(`  - boxWidth:`, boxWidth);
            }
            const rect = createStyledRect(xPos, y, stackBoxWidth, rectHeight, {
              fill: fillColor,
              stroke: label === 'eftpos' ? 'rgb(158,138,239)' : (label === 'Mastercard' ? 'rgb(255,180,178)' : (isNarrowBox ? '#ffffff' : 'none')), // rgb(158,138,239) border for eftpos, lighter red for Mastercard, thin white for narrow boxes
              strokeWidth: (label === 'eftpos' || label === 'Mastercard') ? '2.5' : (isNarrowBox ? '0.5' : '0'), // Thicker border for eftpos and Mastercard
              rx: (label === 'eftpos' || label === 'Mastercard') ? '12' : '8', // More rounded corners for eftpos and Mastercard to match BPAY
              ry: (label === 'eftpos' || label === 'Mastercard') ? '12' : '8'
            });
            labelsGroup.appendChild(rect);

            const text = createStyledText(
              xPos + stackBoxWidth / 2,
              y + rectHeight / 2,
              label,
              {
                fill: '#ffffff',
                fontSize: fontSizeOverride !== undefined ? fontSizeOverride.toString() : '12',
                fontWeight: (label === 'eftpos' || label === 'Mastercard') ? 'bold' : 'normal' // Bold text for eftpos and Mastercard to match BPAY
              }
            );
            labelsGroup.appendChild(text);

            return { rect, text, height: rectHeight, width: stackBoxWidth };
          };


          const createDoubleLine = (startX, startY, endX, color, targetGroup) => {
            const offsets = [-1.5, 1.5];
            return offsets.map((offset, idx) => {
              const line = createStyledLine(startX, startY + offset, endX, startY + offset, {
                stroke: color,
                strokeWidth: '2.5',
                strokeLinecap: 'round'
              });
              line.classList.add('admin-double-line');
              if (targetGroup) {
                targetGroup.appendChild(line);
              } else {
                labelsGroup.insertBefore(line, labelsGroup.firstChild);
              }
              return line;
            });
          };

          const eftpos = createStackedRect(eftposY, 'rgb(80,58,130)', 'eftpos');

          const eftposRect = eftpos.rect;
          const eftposActualX = parseFloat(eftposRect.getAttribute('x'));

          const createAlignedRect = (y, fillColor, label) => {
            return createStackedRect(y, fillColor, label, eftposActualX);
          };

          const reducedHeight = stackedHeight * 0.81; // 10% less tall (was 0.9)
          const reducedFont = 11;

          const mastercard = createAlignedRect(mastercardY, 'rgb(216,46,43)', 'Mastercard');
          const visaGap = gapSympliPexa * 2;
          const gapHalf = gapSympliPexa / 2;
          const visaY = mastercardY - visaGap - reducedHeight;
          const visa = createStackedRect(visaY, '#27AEE3', 'Other Cards', eftposActualX, reducedHeight, reducedFont);
          const otherCardsY = mastercardY - gapHalf - reducedHeight;
          const otherCards = createStackedRect(otherCardsY, '#FFA500', 'Visa', eftposActualX, reducedHeight, reducedFont);
          const medicareY = visaY - gapHalf - reducedHeight;
          const medicare = createStackedRect(medicareY, '#9ACD32', 'Claims', eftposActualX, reducedHeight, reducedFont);
          const atmsY = medicareY - gapHalf - reducedHeight;
          const atms = createStackedRect(atmsY, '#C08552', 'ATMs', eftposActualX, reducedHeight, reducedFont);

          const boundingPadX = 9;
          const boundingPadY = 7 + 2; // Added 2 extra pixels to top/bottom padding
          const stackTopY = atmsY;
          const stackBottomY = visaY + reducedHeight;
          const topMarginHeight = reducedHeight - 3; // Reserve space equal to one internal box minus 3px

          // Use the full width for the green bounding box to match the Mastercard box
          const stackBoxWidth = boxWidth; // Full width to match Mastercard

          // Get the actual X position of the ATMs box (which is now centered)
          const atmsRect = atms.rect;
          const atmsActualX = parseFloat(atmsRect.getAttribute('x'));

          // Center the wider bounding box around the narrower inner boxes
          const innerBoxWidth = boxWidth * 0.8;
          const containerX = atmsActualX - (stackBoxWidth - innerBoxWidth) / 2 - boundingPadX;
          const containerWidth = stackBoxWidth + boundingPadX * 2;
          const stackBoundingTop = stackTopY - boundingPadY - topMarginHeight;
          const stackBoundingHeight = (stackBottomY - stackTopY) + boundingPadY * 2 + topMarginHeight;
          const stackBoundingRect = createStyledRect(
            containerX,
            stackBoundingTop,
            containerWidth,
            stackBoundingHeight,
            {
              fill: '#2d5016', // Dark green fill (matching CECS)
              stroke: '#f1ffcc', // Light yellow-green border (matching CECS)
              strokeWidth: '3',
              rx: '18',
              ry: '18'
            }
          );
          const stackBoundingLeftEdge = containerX;
          const stackBoundingRightEdge = containerX + containerWidth;
          stackBoundingRect.setAttribute('id', 'direct-entry-stack-bounding-box');
          stackBoundingRect.setAttribute('data-left-edge', stackBoundingLeftEdge.toFixed(2));
          stackBoundingRect.setAttribute('data-right-edge', stackBoundingRightEdge.toFixed(2));
          stackBoundingRect.setAttribute('data-top-margin', topMarginHeight.toFixed(2));
          if (typeof cacheRectEdges === 'function') {
            cacheRectEdges(stackBoundingRect, 'directEntryStackBounding');
          }
          window.directEntryBoundingBoxLeftEdge = stackBoundingLeftEdge;
          window.directEntryBoundingBoxEdges = {
            left: stackBoundingLeftEdge,
            right: stackBoundingRightEdge,
            top: stackBoundingTop,
            bottom: stackBottomY + boundingPadY
          };
          window.directEntryBoundingTopMargin = topMarginHeight;

          const stackBoundingLabel = createStyledText(0, 0, 'IAC', {
            fill: '#ffffff', // Light yellow-green text (matching border)
            fontSize: '14',
            fontWeight: 'bold'
          });
          stackBoundingLabel.setAttribute('id', 'direct-entry-stack-label');
          window.directEntryBoundingLabel = stackBoundingLabel;

          const positionDirectEntryLabel = () => {
            const label = window.directEntryBoundingLabel;
            if (!label) return;

            // Prefer live geometry from the rendered rectangle
            const boundingRectEl = document.getElementById('direct-entry-stack-bounding-box');
            let rectLeft = NaN;
            let rectRight = NaN;
            let rectTop = NaN;
            let rectBottom = NaN;

            if (boundingRectEl) {
              const attrLeft = parseFloat(boundingRectEl.getAttribute('x'));
              const attrWidth = parseFloat(boundingRectEl.getAttribute('width'));
              const attrTop = parseFloat(boundingRectEl.getAttribute('y'));
              const attrHeight = parseFloat(boundingRectEl.getAttribute('height'));

              if (Number.isFinite(attrLeft) && Number.isFinite(attrWidth)) {
                rectLeft = attrLeft;
                rectRight = attrLeft + attrWidth;
              }
              if (Number.isFinite(attrTop)) {
                rectTop = attrTop;
              }
              if (Number.isFinite(attrTop) && Number.isFinite(attrHeight)) {
                rectBottom = attrTop + attrHeight;
              }

              const attrTopMargin = parseFloat(boundingRectEl.getAttribute('data-top-margin'));
              if (Number.isFinite(attrTopMargin)) {
                window.directEntryBoundingTopMargin = attrTopMargin;
              }
            }

            const edges = window.directEntryBoundingBoxEdges || {};
            if (!Number.isFinite(rectLeft)) rectLeft = edges.left;
            if (!Number.isFinite(rectRight)) rectRight = edges.right;
            if (!Number.isFinite(rectTop)) rectTop = edges.top;
            if (!Number.isFinite(rectBottom)) rectBottom = edges.bottom;

            if (!Number.isFinite(rectLeft) || !Number.isFinite(rectRight) || !Number.isFinite(rectTop)) {
              return;
            }

            const topMarginValue = Number.isFinite(window.directEntryBoundingTopMargin)
              ? window.directEntryBoundingTopMargin
              : topMarginHeight;
            const centerX = rectLeft + (rectRight - rectLeft) / 2;
            const labelVerticalFactor = 0.75;
            const labelPixelOffset = 3; // Shift label down by 3 pixels
            const labelY = rectTop + topMarginValue * labelVerticalFactor + labelPixelOffset;

            label.setAttribute('x', centerX.toFixed(2));
            label.setAttribute('y', labelY.toFixed(2));

            window.directEntryBoundingBoxEdges = {
              left: rectLeft,
              right: rectRight,
              top: rectTop,
              bottom: Number.isFinite(rectBottom) ? rectBottom : rectTop + topMarginValue
            };

            console.log('DirectEntry label positioned', {
              centerX,
              labelY,
              rectLeft,
              rectRight,
              rectTop,
              rectBottom,
              topMargin: topMarginValue
            });
          };
          positionDirectEntryLabel();
          window.positionDirectEntryLabel = positionDirectEntryLabel;

          const stackLineConfigs = [
            {
              id: 'direct-entry-stack-line-blue',
              color: '#5AC8FA',
              fraction: 0.2,
              offset: 9,
              strokeWidth: 1.5,
              doubleLine: true,
              doubleOffset: 3,
              horizontalAdjust: -2.5,
              filletMultiplier: 1.2,
              cornerAdjustment: 8
            },
            {
              id: 'direct-entry-stack-line-yellow',
              color: '#C67A35',
              fraction: 0.4,
              offset: 16,
              strokeWidth: 1.5,
              horizontalAdjust: -9,
              filletMultiplier: 1.1,
              cornerAdjustment: 5
            },
            {
              id: 'direct-entry-stack-line-green',
              color: '#228835',
              fraction: 0.6,
              offset: 16,
              strokeWidth: 1.5,
              horizontalAdjust: -8,
              filletMultiplier: 1.1,
              cornerAdjustment: 2
            },
            {
              id: 'direct-entry-stack-line-brown',
              color: '#9B7653',
              fraction: 0.8,
              offset: 18,
              strokeWidth: 1.5,
              horizontalAdjust: -10,
              filletMultiplier: 1.1,
              cornerAdjustment: 2
            }
          ];

          const backgroundGroup = document.getElementById('background-elements');
          const stackLines = stackLineConfigs.map((config) => {
            const path = createStyledPath('', {
              stroke: config.color,
              strokeWidth: config.strokeWidth,
              strokeLinecap: 'butt', // Square cap at non-ADIs box edge
              strokeLinejoin: 'round',
              fill: 'none',
              id: config.id
            });

            if (backgroundGroup) {
              // Insert at beginning of backgroundGroup to ensure lines go under boxes
              backgroundGroup.insertBefore(path, backgroundGroup.firstChild);
            } else {
              // Insert at beginning of labelsGroup as fallback
              labelsGroup.insertBefore(path, labelsGroup.firstChild);
            }

            const lineEntry = { ...config, path };

            if (config.doubleLine) {
              const offsets = [-config.doubleOffset / 2, config.doubleOffset / 2];
              lineEntry.secondaryPath = offsets.map((offsetValue) => {
                const secondary = createStyledPath('', {
                  stroke: config.color,
                  strokeWidth: config.strokeWidth,
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                  fill: 'none'
                });

                secondary.classList.add('direct-entry-stack-line-secondary');

                const parentGroup = backgroundGroup || labelsGroup;
                // Insert at beginning to ensure secondary lines also go under boxes
                parentGroup.insertBefore(secondary, parentGroup.firstChild);

                secondary.dataset.parallelOffset = offsetValue.toString();
                return secondary;
              });
            }

            return lineEntry;
          });

          window.directEntryLines = stackLines;

          window.updateDirectEntryBoundingLine = (leftEdge, top, height) => {
            const data = window.cardLeftLineData;
            const lines = window.directEntryLines;
            if (!data || !data.mastercardMetrics || !Array.isArray(lines) || lines.length === 0) return;

            const fallbackEdges = window.directEntryBoundingBoxEdges || {};
            const baseLeft = Number.isFinite(leftEdge) ? leftEdge : fallbackEdges.left;
            const baseTop = Number.isFinite(top) ? top : fallbackEdges.top;
            const baseHeight = Number.isFinite(height)
              ? height
              : (Number.isFinite(fallbackEdges.bottom) && Number.isFinite(fallbackEdges.top)
                  ? (fallbackEdges.bottom - fallbackEdges.top)
                  : undefined);

            if (!Number.isFinite(baseLeft) || !Number.isFinite(baseTop) || !Number.isFinite(baseHeight)) {
              return;
            }

            const buildPath = (metrics, fraction, insideOffset, horizontalAdjust = 0, color, strokeWidth = 0) => {
              if (!metrics || !Number.isFinite(fraction) || !Number.isFinite(insideOffset)) return null;

              const clampedFraction = Math.min(Math.max(fraction, 0), 1);
              const startX = baseLeft + insideOffset;
              const startY = baseTop + baseHeight * (1 - clampedFraction);

              const baseFillet = metrics.filletRadiusUsed ?? 150;
              const filletRadius = Math.max(20, baseFillet - insideOffset);
              const firstLegX = startX - Math.max(15, insideOffset + 5);
              const baseTurnX = metrics.turnX ?? (firstLegX - filletRadius - 20);
              const turnX = baseTurnX + insideOffset;
              const verticalShift = Math.max(2, (metrics.verticalShift ?? 9) - 4);
              const baseVerticalX = metrics.verticalX ?? baseTurnX;
              const verticalX = baseVerticalX + insideOffset - verticalShift;
              const verticalY = startY - filletRadius;

              const baseCorner = metrics.topCornerRadius ?? 20;
              const topCornerRadius = Math.max(6, baseCorner - 8);
              const baseHorizontalY = Number.isFinite(metrics.horizontalY)
                ? metrics.horizontalY
                : (verticalY - 40);
              const horizontalY = baseHorizontalY - horizontalAdjust;
              const geometry = window.directEntryToAdiGeometry;
              let horizontalEndX = Number.isFinite(metrics.horizontalEndX)
                ? metrics.horizontalEndX + insideOffset
                : (verticalX + 140);
              if (geometry && Number.isFinite(geometry.curveStartX)) {
                horizontalEndX = Math.max(horizontalEndX, geometry.curveStartX);
              }

              const segments = [
                `M ${startX.toFixed(2)} ${startY.toFixed(2)}`,
                `L ${firstLegX.toFixed(2)} ${startY.toFixed(2)}`,
                `Q ${turnX.toFixed(2)} ${startY.toFixed(2)}, ${verticalX.toFixed(2)} ${verticalY.toFixed(2)}`,
                `L ${verticalX.toFixed(2)} ${(horizontalY + topCornerRadius).toFixed(2)}`,
                `Q ${verticalX.toFixed(2)} ${horizontalY.toFixed(2)}, ${(verticalX + topCornerRadius).toFixed(2)} ${horizontalY.toFixed(2)}`,
                `L ${horizontalEndX.toFixed(2)} ${horizontalY.toFixed(2)}`
              ];

              if (window.adiBoxData && Number.isFinite(window.adiBoxData.y)) {
                const adiData = window.adiBoxData;
                const referenceRightEdge = window.nonAdiBoxData
                  ? window.nonAdiBoxData.x + window.nonAdiBoxData.width
                  : horizontalEndX + 300;
                let extendPastReference = referenceRightEdge + 60;
                let curveStartX = Math.max(horizontalEndX + 80, referenceRightEdge - 80);
                let endX = extendPastReference + 10;
                // Calculate exact endpoint accounting for line stroke width
                const adiEdge = getBoxEdgePoint(adiData, 'top', strokeWidth);
                let endY = adiEdge.y;
                let control1X = curveStartX + 60;
                const control1Y = horizontalY;
                let control2X = extendPastReference + 15;
                const verticalDistance = endY - horizontalY;
                let control2Y = horizontalY + verticalDistance * 0.15;

                if (geometry) {
                  if (Number.isFinite(geometry.extendPastReference)) {
                    extendPastReference = geometry.extendPastReference;
                  }
                  if (Number.isFinite(geometry.curveStartX)) {
                    curveStartX = Math.max(horizontalEndX, geometry.curveStartX);
                  }
                  if (Number.isFinite(geometry.control1X) && Number.isFinite(geometry.curveStartX)) {
                    control1X = curveStartX + (geometry.control1X - geometry.curveStartX);
                  }
                  if (Number.isFinite(geometry.control2X) && Number.isFinite(geometry.extendPastReference)) {
                    // Adjust control point based on color to match endpoint offset
                    let controlOffset = 6; // Default
                    if (color === '#9B7653') controlOffset = 6; // Brown
                    else if (color === '#228835') controlOffset = 8; // Green
                    else if (color === '#C67A35') controlOffset = 10; // Yellow
                    else if (color === '#5AC8FA') controlOffset = 12; // Blue
                    control2X = extendPastReference + (geometry.control2X - geometry.extendPastReference) + controlOffset;
                  }
                  if (Number.isFinite(geometry.endX)) {
                    // Spread out endpoints based on color
                    let endpointOffset = 10; // Default
                    if (color === '#9B7653') endpointOffset = 10; // Brown - leftmost
                    else if (color === '#228835') endpointOffset = 12; // Green - 2px right of brown
                    else if (color === '#C67A35') endpointOffset = 14; // Yellow - 2px right of green
                    else if (color === '#5AC8FA') endpointOffset = 16; // Blue - 2px right of yellow
                    endX = geometry.endX + endpointOffset;
                  }
                  if (Number.isFinite(geometry.endY)) {
                    endY = geometry.endY;
                    const geomVertical = endY - horizontalY;
                    control2Y = horizontalY + geomVertical * 0.15;
                  }
                  horizontalEndX = Math.max(horizontalEndX, curveStartX);
                }

                segments.push(`L ${curveStartX.toFixed(2)} ${horizontalY.toFixed(2)}`);
                segments.push(`C ${control1X.toFixed(2)} ${control1Y.toFixed(2)}, ${control2X.toFixed(2)} ${control2Y.toFixed(2)}, ${endX.toFixed(2)} ${endY.toFixed(2)}`);
              }

              return segments.join(' ');
            };

            const metricsForYellow = data.eftposMetrics || data.mastercardMetrics;

            lines.forEach((entry) => {
              const baseMetrics = entry.color === '#C67A35' ? metricsForYellow : data.mastercardMetrics;
              const filletMultiplier = Number.isFinite(entry.filletMultiplier) ? entry.filletMultiplier : 1;
              const cornerAdjustment = Number.isFinite(entry.cornerAdjustment) ? entry.cornerAdjustment : 0;
              const metrics = {
                ...baseMetrics,
                filletRadiusUsed: Number.isFinite(baseMetrics.filletRadiusUsed)
                  ? baseMetrics.filletRadiusUsed * filletMultiplier
                  : undefined,
                topCornerRadius: Number.isFinite(baseMetrics.topCornerRadius)
                  ? baseMetrics.topCornerRadius + cornerAdjustment
                  : undefined
              };

              const pathData = buildPath(metrics, entry.fraction, entry.offset, entry.horizontalAdjust || 0, entry.color, entry.strokeWidth || 0);
              if (pathData && entry.path) {
                entry.path.setAttribute('d', pathData);
              }
              if (entry.secondaryPath && entry.secondaryPath.length) {
                entry.secondaryPath.forEach((secondary) => {
                  if (!secondary) return;
                  const offsetDelta = Number.parseFloat(secondary.dataset.parallelOffset || '0');
                  const secondaryData = buildPath(metrics, entry.fraction, entry.offset + offsetDelta, entry.horizontalAdjust || 0, entry.color, entry.strokeWidth || 0);
                  if (secondaryData) {
                    secondary.setAttribute('d', secondaryData);
                  }
                });
              }

              // Create horizontal continuation branch
              if (!entry.horizontalBranch) {
                const horizontalBranch = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                horizontalBranch.setAttribute('stroke', entry.color);
                horizontalBranch.setAttribute('stroke-width', (entry.strokeWidth / 2).toString());
                horizontalBranch.setAttribute('stroke-linecap', 'round');
                horizontalBranch.setAttribute('fill', 'none');
                horizontalBranch.setAttribute('id', `${entry.id}-horizontal`);
                // Insert into background group to ensure horizontal branches go under all boxes
                if (backgroundGroup) {
                  backgroundGroup.insertBefore(horizontalBranch, backgroundGroup.firstChild);
                } else {
                  adminLinesGroup.appendChild(horizontalBranch);
                }
                entry.horizontalBranch = horizontalBranch;
              }

              // Build horizontal path that continues from where the curve would start
              const buildHorizontalPath = () => {
                const clampedFraction = Math.min(Math.max(entry.fraction, 0), 1);
                const startX = baseLeft + entry.offset;
                const startY = baseTop + baseHeight * (1 - clampedFraction);
                const baseFillet = metrics.filletRadiusUsed ?? 150;
                const filletRadius = Math.max(20, baseFillet - entry.offset);
                const firstLegX = startX - Math.max(15, entry.offset + 5);
                const baseTurnX = metrics.turnX ?? (firstLegX - filletRadius - 20);
                const turnX = baseTurnX + entry.offset;
                const verticalShift = Math.max(2, (metrics.verticalShift ?? 9) - 4);
                const baseVerticalX = metrics.verticalX ?? baseTurnX;
                const verticalX = baseVerticalX + entry.offset - verticalShift;
                const verticalY = startY - filletRadius;
                const baseCorner = metrics.topCornerRadius ?? 20;
                const topCornerRadius = Math.max(6, baseCorner - 8);
                const baseHorizontalY = Number.isFinite(metrics.horizontalY)
                  ? metrics.horizontalY
                  : (verticalY - 40);
                const horizontalY = baseHorizontalY - (entry.horizontalAdjust || 0);
                const geometry = window.directEntryToAdiGeometry;
                let horizontalEndX = Number.isFinite(metrics.horizontalEndX)
                  ? metrics.horizontalEndX + entry.offset
                  : (verticalX + 140);
                if (geometry && Number.isFinite(geometry.curveStartX)) {
                  horizontalEndX = Math.max(horizontalEndX, geometry.curveStartX);
                }

                // Create path that continues horizontally instead of curving down
                if (window.adiBoxData && Number.isFinite(window.adiBoxData.y)) {
                  const adiData = window.adiBoxData;
                  const referenceRightEdge = window.nonAdiBoxData
                    ? window.nonAdiBoxData.x + window.nonAdiBoxData.width
                    : horizontalEndX + 300;
                  let curveStartX = Math.max(horizontalEndX + 80, referenceRightEdge - 80);
                  if (geometry && Number.isFinite(geometry.curveStartX)) {
                    curveStartX = Math.max(horizontalEndX, geometry.curveStartX);
                  }

                  // Continue horizontally then curve down along ADI box
                  const adiRightEdge = adiData.x + adiData.width;
                  // Offset each line based on its color to prevent overlap
                  let xOffset = 25; // Default offset
                  if (entry.color === '#9B7653') xOffset = 20; // Brown
                  else if (entry.color === '#228835') xOffset = 22; // Green
                  else if (entry.color === '#C67A35') xOffset = 25; // Yellow
                  else if (entry.color === '#5AC8FA') xOffset = 28; // Blue

                  const horizontalExtendX = adiRightEdge + xOffset;
                  const curveRadius = 100; // THIS CONTROLS THE ROUNDEDNESS - try values from 10 (sharp) to 50 (smooth)
                  const verticalDropY = adiData.y + adiData.height + 100; // Drop below ADI box

                  // Calculate non-ADIs box entry point (10% above bottom right corner)
                  let nonAdiEntryX = adiData.x + adiData.width; // Default to ADI right edge if non-ADI not available
                  let nonAdiEntryY = verticalDropY + 100; // Default position
                  if (window.nonAdiBoxData) {
                    nonAdiEntryX = window.nonAdiBoxData.x + window.nonAdiBoxData.width;
                    nonAdiEntryY = window.nonAdiBoxData.y + window.nonAdiBoxData.height * 0.8; // 20% above bottom

                    // Offset each line by 1px vertically in order: maroon(0), brown(1), green(2), yellow(3), blue(4), red(5), purple(6)
                    if (entry.color === '#9B7653') nonAdiEntryY += 1; // Brown - 2nd from top
                    else if (entry.color === '#228835') nonAdiEntryY += 2; // Green - 3rd from top
                    else if (entry.color === '#C67A35') nonAdiEntryY += 3; // Yellow - 4th from top
                    else if (entry.color === '#5AC8FA') nonAdiEntryY += 4; // Blue - 5th from top
                  }
                  const leftCurveRadius = 170; // Radius for the left curve into non-ADIs box

                  const horizontalPath = [
                    `M ${startX.toFixed(2)} ${startY.toFixed(2)}`,
                    `L ${firstLegX.toFixed(2)} ${startY.toFixed(2)}`,
                    `Q ${turnX.toFixed(2)} ${startY.toFixed(2)}, ${verticalX.toFixed(2)} ${verticalY.toFixed(2)}`,
                    `L ${verticalX.toFixed(2)} ${(horizontalY + topCornerRadius).toFixed(2)}`,
                    `Q ${verticalX.toFixed(2)} ${horizontalY.toFixed(2)}, ${(verticalX + topCornerRadius).toFixed(2)} ${horizontalY.toFixed(2)}`,
                    `L ${(horizontalExtendX - curveRadius).toFixed(2)} ${horizontalY.toFixed(2)}`, // Horizontal to curve start
                    `Q ${horizontalExtendX.toFixed(2)} ${horizontalY.toFixed(2)}, ${horizontalExtendX.toFixed(2)} ${(horizontalY + curveRadius).toFixed(2)}`, // Curve down
                    `L ${horizontalExtendX.toFixed(2)} ${(nonAdiEntryY - leftCurveRadius).toFixed(2)}`, // Vertical down to curve start
                    `Q ${horizontalExtendX.toFixed(2)} ${nonAdiEntryY.toFixed(2)}, ${(horizontalExtendX - leftCurveRadius).toFixed(2)} ${nonAdiEntryY.toFixed(2)}`, // Curve left
                    `L ${(nonAdiEntryX - entry.strokeWidth).toFixed(2)} ${nonAdiEntryY.toFixed(2)}` // Horizontal into non-ADIs box, extend past edge to hide round cap
                  ].join(' ');

                  return horizontalPath;
                }
                return '';
              };

              const horizontalPathData = buildHorizontalPath();
              if (horizontalPathData && entry.horizontalBranch) {
                entry.horizontalBranch.setAttribute('d', horizontalPathData);
              }
            });
          };

          window.updateDirectEntryBoundingLine(stackBoundingLeftEdge, stackBoundingTop, stackBoundingHeight);

          const stackHeaderHeight = stackedHeight;
          const stackHeaderGap = gapHalf;
          const headerGapFromNpp = 10;
          const headerLift = 0; // Remove lift to make Direct Entry box visible
          const nppTopValue = window.nppBoxData && Number.isFinite(window.nppBoxData.y) ? window.nppBoxData.y : NaN;
          const stackHeaderY = Number.isFinite(nppTopValue)
            ? (nppTopValue - headerGapFromNpp - stackHeaderHeight - headerLift)
            : (stackTopY - boundingPadY) - stackHeaderGap - stackHeaderHeight - headerLift;
          const stackHeaderRect = createStyledRect(
            containerX,
            stackHeaderY,
            containerWidth,
            stackHeaderHeight,
            {
              fill: '#ff073a',
              stroke: '#ffffff', // Very thin white edge
              strokeWidth: '0.5',
              rx: '6',
              ry: '6'
            }
          );

          // Store Direct Entry box reference
          window.directEntryBox = {
            rect: stackHeaderRect,
            x: containerX,
            y: stackHeaderY,
            width: containerWidth,
            height: stackHeaderHeight
          };

          const stackHeaderText = createStyledText(
            containerX + containerWidth / 2,
            stackHeaderY + stackHeaderHeight / 2,
            'DE',
            { fill: '#ffffff', fontSize: '14', fontWeight: 'bold' }
          );


          // Add double lines from bounding box to CSHD in LVSS style - draw BEFORE bounding box so it's behind
          if (window.lvssBoxPositions && window.lvssBoxPositions.cshdY) {
            const cshdX = reducedNarrowBoxX; // Use the same X as other boxes in that column
            const cshdY = window.lvssBoxPositions.cshdY;
            const cshdCenterY = cshdY + boxHeight / 2;
            // Stop line 2px inside the bounding box so it doesn't poke out
            const lineEndX = containerX + containerWidth - 2;

            // Create double line effect like LVSS
            const lineGap = 3; // Gap between the two lines
            const lineColor = '#f1ffcc'; // Light yellow-green (matching CECS and IAC box borders)
            const lineOffsets = [-lineGap/2, lineGap/2];

            window.cecsToAtmsBoundingLines = []; // Store both lines for later updates

            lineOffsets.forEach((offset) => {
              const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
              line.setAttribute('x1', lineEndX); // START at right edge of bounding box
              line.setAttribute('y1', (cshdCenterY + offset).toFixed(2));
              line.setAttribute('x2', cshdX); // END at left side of CSHD
              line.setAttribute('y2', (cshdCenterY + offset).toFixed(2));
              line.setAttribute('stroke', lineColor);
              line.setAttribute('stroke-width', '2.25'); // Same width as LVSS double lines
              line.setAttribute('stroke-linecap', 'round');

              // Add to admin lines group so lines appear behind all boxes
              adminLinesGroup.appendChild(line);

              window.cecsToAtmsBoundingLines.push(line);
            });

            // Keep reference to first line for backward compatibility
            window.cecsToAtmsBoundingLine = window.cecsToAtmsBoundingLines[0];
          }

          if (visa && visa.rect && visa.rect.parentNode === labelsGroup) {
            labelsGroup.insertBefore(stackBoundingRect, visa.rect);
            labelsGroup.insertBefore(stackBoundingLabel, visa.rect);
            labelsGroup.insertBefore(stackHeaderRect, visa.rect);
            labelsGroup.insertBefore(stackHeaderText, visa.rect);
          } else {
            const firstChild = labelsGroup.firstChild;
            labelsGroup.insertBefore(stackBoundingRect, firstChild);
            const rectNextSibling = stackBoundingRect.nextSibling;
            labelsGroup.insertBefore(stackBoundingLabel, rectNextSibling);
            const labelNextSibling = stackBoundingLabel.nextSibling;
            labelsGroup.insertBefore(stackHeaderRect, labelNextSibling);
            const headerRectNextSibling = stackHeaderRect.nextSibling;
            labelsGroup.insertBefore(stackHeaderText, headerRectNextSibling);
          }


          // Store references to create child boxes later after repositioning
          window.directEntryChildData = {
            stackedHeight: stackedHeight,
            containerX: containerX,
            containerWidth: containerWidth,
            stackHeaderY: stackHeaderY,
            stackHeaderHeight: stackHeaderHeight
          };


          // Create left lines for eftpos/Mastercard that mirror the e-conveyancing downturn
          if (window.hexagonPositions) {
            const eftposRect = eftpos.rect;
            const mastercardRect = mastercard.rect;
            if (!eftposRect || !mastercardRect) {
              console.warn('eftpos or Mastercard rectangle missing for left-line creation');
            } else {
              const eftposStartX = parseFloat(eftposRect.getAttribute('x'));
              const eftposStartY = parseFloat(eftposRect.getAttribute('y')) + parseFloat(eftposRect.getAttribute('height')) / 2;
              const mastercardStartX = parseFloat(mastercardRect.getAttribute('x'));
              const mastercardStartY = parseFloat(mastercardRect.getAttribute('y')) + parseFloat(mastercardRect.getAttribute('height')) / 2;

              const mastercardFilletRadius = 150; // Increase for more rounded curves, decrease for sharper corners
              const mastercardCornerRadius = 60;
              const eftposFilletRadius = 170;
              const eftposCornerRadius = 70;
              const maxFilletRadius = Math.max(eftposFilletRadius, mastercardFilletRadius);
              const maxCornerRadius = Math.max(eftposCornerRadius, mastercardCornerRadius);
              const turnOffset = 30;
              const baseVerticalDistance = Math.max(
                window.hexagonPositions.hexHeight ? window.hexagonPositions.hexHeight * 2 : 120,
                maxFilletRadius + maxCornerRadius + 40
              );

              const getReferenceSources = () => ({
                pexa: {
                  ref: window.pexaLineData || null,
                  left: Number.isFinite(window.newPexaConveyX)
                    ? window.newPexaConveyX
                    : (window.pexaConveyBoxData && Number.isFinite(window.pexaConveyBoxData.x)
                      ? window.pexaConveyBoxData.x
                      : pexaConveyX)
                },
                sympli: {
                  ref: window.sympliLineData || null,
                  left: Number.isFinite(window.newSympliX)
                    ? window.newSympliX
                    : (window.sympliBoxData && Number.isFinite(window.sympliBoxData.x)
                      ? window.sympliBoxData.x
                      : sympliX)
                }
              });

              const resolveTurnX = (primarySource, secondarySource, fallbackBase, startX) => {
                const computeTurn = (source) => {
                  if (!source || !source.ref || !Number.isFinite(source.ref.startX)) return null;
                  if (Number.isFinite(source.left)) {
                    const offset = source.left - source.ref.startX;
                    return startX - offset;
                  }
                  return source.ref.startX;
                };

                let turnCandidate = computeTurn(primarySource);
                if (!Number.isFinite(turnCandidate)) {
                  turnCandidate = computeTurn(secondarySource);
                }
                if (!Number.isFinite(turnCandidate)) {
                  turnCandidate = fallbackBase;
                }
                return turnCandidate;
              };

              const resolveVerticalDistance = (primarySource, secondarySource, startY, defaultDistance) => {
                const pick = (source) => (source && source.ref && Number.isFinite(source.ref.horizontalY)) ? source.ref : null;
                const candidate = pick(primarySource) || pick(secondarySource);
                if (candidate) {
                  const distance = Math.abs(candidate.horizontalY - startY);
                  if (Number.isFinite(distance) && distance > maxFilletRadius + maxCornerRadius + 5) {
                    return distance;
                  }
                }
                return defaultDistance;
              };

              const buildCardPathSegments = (startX, startY, primarySource, secondarySource, fallbackBase, providedDistance, isEftpos) => {
                const filletRadius = isEftpos ? eftposFilletRadius : mastercardFilletRadius;
                const cornerRadius = isEftpos ? eftposCornerRadius : mastercardCornerRadius;
                const fallbackBaseValue = Number.isFinite(fallbackBase)
                  ? fallbackBase
                  : (Math.min(eftposStartX, mastercardStartX) - turnOffset);
                const defaultDistance = Number.isFinite(providedDistance) ? providedDistance : baseVerticalDistance;

                // Force alignment: eftpos with PEXA, Mastercard with Sympli
                let turnX;
                if (isEftpos) {
                  // Align eftpos exactly where PEXA would have its vertical line
                  if (window.pexaConveyBoxData && window.pexaConveyBoxData.x) {
                    turnX = window.pexaConveyBoxData.x - 29; // Same offset as Sympli uses
                  } else if (window.newPexaConveyX !== undefined) {
                    turnX = window.newPexaConveyX - 10;
                  } else {
                    // Fallback: extend left significantly
                    turnX = startX - 523;
                  }
                } else {
                  // Align Mastercard exactly where Sympli would have its vertical line
                  if (window.newSympliX !== undefined) {
                    turnX = window.newSympliX - 24; // Slightly more left to match visual alignment
                  } else {
                    // Fallback: extend left significantly
                    turnX = startX - 513;
                  }
                }

                const verticalDistance = resolveVerticalDistance(primarySource, secondarySource, startY, defaultDistance);
                // Extend the lines higher by adding more distance
                const extensionAmount = 150; // Adjust this to make lines go higher
                let verticalEndY = startY - verticalDistance - extensionAmount;
                if (!Number.isFinite(verticalEndY)) {
                  verticalEndY = startY - (filletRadius + cornerRadius + 40) - extensionAmount;
                }
                if (verticalEndY >= startY - filletRadius) {
                  verticalEndY = startY - (filletRadius + cornerRadius + 20) - extensionAmount;
                }
                const tentativeFirstLegX = turnX + filletRadius;
                const firstLegX = tentativeFirstLegX < startX ? tentativeFirstLegX : startX - 1;

                // Track geometric metrics so other components can align with this path
                let pathString;
                let horizontalYValue = null;
                let horizontalEndX = null;
                let verticalXValue = turnX;
                let verticalShiftValue = 0;
                let topCornerRadiusValue = 0;
                let curveStartXValue = null;
                let extendPastReferenceValue = null;
                let control1XValue = null;
                let control2XValue = null;
                let control2YValue = null;
                let endXValue = null;

                if (window.bpayBoxData) {
                  const bpay = window.bpayBoxData;
                  const bpayLeft = bpay.x - 5; // 5px gap from BPay left edge
                  const bpayRight = bpay.x + bpay.width + 5; // 5px gap from BPay right edge
                  const topCornerRadius = 180; // Much sharper corner at the top

                  // Set different horizontal Y positions for each line
                  let horizontalY;
                  let verticalShift;
                  if (isEftpos) {
                    horizontalY = bpay.y - 15 - 3 - 3 - 2 - GLOBAL_HORIZONTAL_LINES_OFFSET; // eftpos line: 15px above BPay top, shifted up 8px total plus global offset
                    verticalShift = 3 + 3 + 2; // eftpos vertical: shift 8px left
                  } else {
                    horizontalY = bpay.y - 10 - 4 - 3 - 2 - GLOBAL_HORIZONTAL_LINES_OFFSET; // Mastercard line: 10px above BPay top, shifted up 9px total plus global offset
                    verticalShift = 4 + 3 + 2; // Mastercard vertical: shift 9px left
                  }

                  // Shift vertical line left by specified amount
                const verticalX = turnX - verticalShift;

                  // Extend the path to go around BPay
                  pathString = [
                    `M ${startX} ${startY}`,
                    `L ${firstLegX} ${startY}`,
                    `Q ${turnX} ${startY}, ${verticalX} ${startY - filletRadius}`,
                    `L ${verticalX} ${horizontalY + topCornerRadius}`, // Go up to calculated Y
                    `Q ${verticalX} ${horizontalY}, ${verticalX + topCornerRadius} ${horizontalY}`, // Curve at calculated Y
                    `L ${bpayRight + 100} ${horizontalY}` // Go across at calculated Y
                  ].join(' ');
                  horizontalYValue = horizontalY;
                  horizontalEndX = bpayRight + 100;
                  verticalXValue = verticalX;
                  verticalShiftValue = verticalShift;
                  topCornerRadiusValue = topCornerRadius;
                } else {
                  // Fallback to original path if BPay doesn't exist
                  pathString = [
                    `M ${startX} ${startY}`,
                    `L ${firstLegX} ${startY}`,
                    `Q ${turnX} ${startY}, ${turnX} ${startY - filletRadius}`,
                    `L ${turnX} ${verticalEndY}`
                  ].join(' ');
                  horizontalYValue = verticalEndY;
                  horizontalEndX = turnX;
                  verticalXValue = turnX;
                }

                // Extend the horizontal run and curve gently down into the ADIs box from the left
                if (window.adiBoxData && Number.isFinite(horizontalYValue) && Number.isFinite(horizontalEndX)) {
                  const adiData = window.adiBoxData;
                  const adiTopY = adiData.y;
                  const adiLeft = adiData.x;
                  const geometry = window.directEntryToAdiGeometry || window.nppToAdiGeometry || null;

                  // Place entries to the right of the maroon line using stored geometry when available
                  let baselineEndX = geometry && Number.isFinite(geometry.endX)
                    ? geometry.endX
                    : (adiLeft + adiData.width / 2);
                  if (!Number.isFinite(baselineEndX)) {
                    baselineEndX = adiLeft + adiData.width / 2;
                  }

                  const entryOffset = isEftpos ? 25 : 18; // eftpos slightly farther than maroon, Mastercard 2px left of original
                  const endX = baselineEndX + entryOffset;
                  // Calculate exact endpoint accounting for line stroke width
                  const adiEdge = getBoxEdgePoint(adiData, 'top', 2); // strokeWidth is 2
                  const endY = adiEdge.y;

                  let curveStartX;
                  if (geometry && Number.isFinite(geometry.curveStartX) && Number.isFinite(geometry.endX)) {
                    // Start the drop where the maroon/green lines do, adjusted for the new end point
                    const baseCurveStart = geometry.curveStartX;
                    const baseEndX = geometry.endX;
                    const deltaEnd = endX - baseEndX;
                    curveStartX = baseCurveStart + deltaEnd;
                    if (!Number.isFinite(curveStartX)) {
                      curveStartX = baseCurveStart;
                    }
                    curveStartX = Math.max(horizontalEndX + 60, curveStartX);
                  } else {
                    curveStartX = horizontalEndX + 120;
                  }

                  // Ensure the horizontal run stays to the left of the ADIs entry point
                  if (curveStartX > endX - 20) {
                    curveStartX = endX - 20;
                  }
                  if (curveStartX < horizontalEndX) {
                    curveStartX = horizontalEndX;
                  }

                  const horizontalExtension = Math.max(0, curveStartX - horizontalEndX);
                  if (horizontalExtension > 0.01) {
                    pathString += ` L ${curveStartX.toFixed(2)} ${horizontalYValue.toFixed(2)}`;
                  }

                  const verticalSpan = endY - horizontalYValue;

                  let control1X;
                  let control2X;
                  if (geometry && Number.isFinite(geometry.control1X) && Number.isFinite(geometry.control2X) && Number.isFinite(geometry.curveStartX) && Number.isFinite(geometry.endX)) {
                    // Shift control points to maintain the same curvature as the maroon line
                    const baseCurveStart = geometry.curveStartX;
                    const baseEndX = geometry.endX;
                    const ctrl1Offset = geometry.control1X - baseCurveStart;
                    const ctrl2Offset = geometry.control2X - baseCurveStart;
                    const deltaEnd = endX - baseEndX;

                    control1X = curveStartX + ctrl1Offset + deltaEnd;
                    control2X = curveStartX + ctrl2Offset + deltaEnd;
                  } else {
                    control1X = curveStartX + Math.max(40, horizontalExtension * 0.6);
                    control2X = endX - Math.max(28, horizontalExtension * 0.45);
                  }

                  const control1Y = horizontalYValue;
                  const control2Y = horizontalYValue + verticalSpan * 0.15;

                  // Clamp controls to maintain smoothness
                  if (control1X > endX - 10) {
                    control1X = endX - 10;
                  }
                  if (control1X <= curveStartX + 12) {
                    control1X = curveStartX + Math.max(16, horizontalExtension * 0.45 + 16);
                  }
                  if (control2X <= curveStartX + 18) {
                    control2X = curveStartX + Math.max(26, horizontalExtension * 0.55 + 22);
                  }
                  if (control2X >= endX - 6) {
                    control2X = endX - 6;
                  }

                  pathString += ` C ${control1X.toFixed(2)} ${control1Y.toFixed(2)}, ${control2X.toFixed(2)} ${control2Y.toFixed(2)}, ${endX.toFixed(2)} ${endY.toFixed(2)}`;

                  horizontalEndX = Math.max(horizontalEndX, curveStartX);
                  curveStartXValue = curveStartX;
                  extendPastReferenceValue = endX;
                  control1XValue = control1X;
                  control2XValue = control2X;
                  control2YValue = control2Y;
                  endXValue = endX;
                }
                return {
                  pathString,
                  turnX,
                  verticalEndY,
                  verticalX: verticalXValue,
                  verticalShift: verticalShiftValue,
                  horizontalY: horizontalYValue,
                  horizontalEndX,
                  topCornerRadius: topCornerRadiusValue,
                  filletRadiusUsed: filletRadius,
                  curveStartX: curveStartXValue,
                  extendPastReference: extendPastReferenceValue,
                  control1X: control1XValue,
                  control2X: control2XValue,
                  control2Y: control2YValue,
                  endX: endXValue
                };
              };

              const { pexa: pexaSource, sympli: sympliSource } = getReferenceSources();
              const fallbackTurnBase = Math.min(eftposStartX, mastercardStartX) - turnOffset;

              const eftposSegments = buildCardPathSegments(
                eftposStartX,
                eftposStartY,
                pexaSource,
                sympliSource,
                fallbackTurnBase,
                baseVerticalDistance,
                true // isEftpos
              );
              const mastercardSegments = buildCardPathSegments(
                mastercardStartX,
                mastercardStartY,
                sympliSource,
                pexaSource,
                fallbackTurnBase,
                baseVerticalDistance,
                false // not isEftpos (is Mastercard)
              );

              const eftposUpturnPath = createStyledPath(eftposSegments.pathString, {
                stroke: 'rgb(158,138,239)', // eftpos line color (same as border)
                strokeWidth: '2',
                fill: 'none',
                strokeLinecap: 'round',
                id: 'eftpos-left-line'
              });
              // Insert into admin lines group so lines go under all boxes
              adminLinesGroup.appendChild(eftposUpturnPath);

              const mastercardUpturnPath = createStyledPath(mastercardSegments.pathString, {
                stroke: 'rgb(255,180,178)', // Mastercard border color (lighter red)
                strokeWidth: '2',
                fill: 'none',
                strokeLinecap: 'round',
                id: 'mastercard-left-line'
              });
              // Insert into admin lines group so lines go under all boxes
              adminLinesGroup.appendChild(mastercardUpturnPath);

              // Create horizontal branches for Eftpos and Mastercard
              const createHorizontalBranch = (segments, color, id) => {
                const horizontalPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                horizontalPath.setAttribute('stroke', color);
                horizontalPath.setAttribute('stroke-width', '1');
                horizontalPath.setAttribute('stroke-linecap', 'butt'); // Square cap at non-ADIs box edge
                horizontalPath.setAttribute('fill', 'none');
                horizontalPath.setAttribute('id', `${id}-horizontal`);

                // Build horizontal continuation path with downward curve
                if (segments.horizontalY && segments.curveStartX && segments.pathString && window.adiBoxData) {
                  const adiData = window.adiBoxData;
                  const adiRightEdge = adiData.x + adiData.width;
                  // Offset Eftpos and Mastercard differently
                  const xOffset = id.includes('eftpos') ? 34 : 31; // Purple (Eftpos) at 34px, Red (Mastercard) at 31px
                  const horizontalExtendX = adiRightEdge + xOffset;
                  const curveRadius = 50; // SEEMS TO DO NOTHING Radius for the turn down - THIS CONTROLS THE ROUNDEDNESS
                  const verticalDropY = adiData.y + adiData.height + 100; // Drop below ADI box

                  // Calculate non-ADIs box entry point (10% above bottom right corner)
                  let nonAdiEntryX = adiData.x + adiData.width; // Default to ADI right edge if non-ADI not available
                  let nonAdiEntryY = verticalDropY + 100; // Default position
                  if (window.nonAdiBoxData) {
                    nonAdiEntryX = window.nonAdiBoxData.x + window.nonAdiBoxData.width;
                    nonAdiEntryY = window.nonAdiBoxData.y + window.nonAdiBoxData.height * 0.8; // 20% above bottom

                    // Offset each line by 1px vertically in order: maroon(0), brown(1), green(2), yellow(3), blue(4), red(5), purple(6)
                    if (id.includes('mastercard')) nonAdiEntryY += 5; // Red (Mastercard) - 6th from top
                    else if (id.includes('eftpos')) nonAdiEntryY += 6; // Purple (Eftpos) - 7th from top
                  }
                  const leftCurveRadius = 170; // Radius for the left curve into non-ADIs box

                  // Find the last 'L' command before the curve 'C' command
                  const lastCIndex = segments.pathString.lastIndexOf(' C ');
                  if (lastCIndex > -1) {
                    // Get everything before the curve command
                    const pathBeforeCurve = segments.pathString.substring(0, lastCIndex);
                    // Add horizontal extension with downward curve, then left curve into non-ADIs
                    const horizontalPathData = pathBeforeCurve +
                                             ` L ${(horizontalExtendX - curveRadius).toFixed(2)} ${segments.horizontalY.toFixed(2)}` + // Horizontal to curve start
                                             ` Q ${horizontalExtendX.toFixed(2)} ${segments.horizontalY.toFixed(2)}, ${horizontalExtendX.toFixed(2)} ${(segments.horizontalY + curveRadius).toFixed(2)}` + // Curve down
                                             ` L ${horizontalExtendX.toFixed(2)} ${(nonAdiEntryY - leftCurveRadius).toFixed(2)}` + // Vertical down to curve start
                                             ` Q ${horizontalExtendX.toFixed(2)} ${nonAdiEntryY.toFixed(2)}, ${(horizontalExtendX - leftCurveRadius).toFixed(2)} ${nonAdiEntryY.toFixed(2)}` + // Curve left
                                             ` L ${(nonAdiEntryX - 2).toFixed(2)} ${nonAdiEntryY.toFixed(2)}`; // Horizontal into non-ADIs box, extend past edge to hide round cap (stroke width 2)
                    horizontalPath.setAttribute('d', horizontalPathData);
                  }
                }

                // Insert into admin lines group so lines go under all boxes
                adminLinesGroup.appendChild(horizontalPath);
                return horizontalPath;
              };

              const eftposHorizontalPath = createHorizontalBranch(
                eftposSegments,
                'rgb(158,138,239)', // eftpos line color (same as border)
                'eftpos-left-line'
              );

              const mastercardHorizontalPath = createHorizontalBranch(
                mastercardSegments,
                'rgb(255,180,178)', // Mastercard border color (lighter red)
                'mastercard-left-line'
              );

          window.cardLeftLineData = {
            eftposPath: eftposUpturnPath,
            mastercardPath: mastercardUpturnPath,
            eftposHorizontalPath,
            mastercardHorizontalPath,
            eftposRect,
            mastercardRect,
            baseVerticalDistance,
            turnOffset,
            getReferenceSources,
            eftposMetrics: eftposSegments,
            mastercardMetrics: mastercardSegments
          };

              window.updateCardLeftLines = function updateCardLeftLines() {
                const data = window.cardLeftLineData;
                if (!data || !data.eftposPath || !data.mastercardPath || !data.eftposRect || !data.mastercardRect) {
                  return;
                }

                const extractRectInfo = (rect) => {
                  if (!rect) return null;
                  const x = parseFloat(rect.getAttribute('x'));
                  const y = parseFloat(rect.getAttribute('y'));
                  const height = parseFloat(rect.getAttribute('height'));
                  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(height)) {
                    return null;
                  }
                  return { x, centerY: y + height / 2 };
                };

                const eftposInfo = extractRectInfo(data.eftposRect);
                const mastercardInfo = extractRectInfo(data.mastercardRect);
                if (!eftposInfo || !mastercardInfo) {
                  return;
                }

                const references = data.getReferenceSources ? data.getReferenceSources() : getReferenceSources();
                const pexaSourceLatest = references.pexa;
                const sympliSourceLatest = references.sympli;
                const fallbackBase = Math.min(eftposInfo.x, mastercardInfo.x) - (data.turnOffset || turnOffset);
                const defaultDistance = data.baseVerticalDistance || baseVerticalDistance;

                const updatedEftposSegments = buildCardPathSegments(
                  eftposInfo.x,
                  eftposInfo.centerY,
                  pexaSourceLatest,
                  sympliSourceLatest,
                  fallbackBase,
                  defaultDistance,
                  true // isEftpos
                );
                const updatedMastercardSegments = buildCardPathSegments(
                  mastercardInfo.x,
                  mastercardInfo.centerY,
                  sympliSourceLatest,
                  pexaSourceLatest,
                  fallbackBase,
                  defaultDistance,
                  false // not isEftpos (is Mastercard)
                );

                data.eftposPath.setAttribute('d', updatedEftposSegments.pathString);
                data.mastercardPath.setAttribute('d', updatedMastercardSegments.pathString);

                // Update horizontal branches with downward curve
                if (window.adiBoxData) {
                  const adiData = window.adiBoxData;
                  const adiRightEdge = adiData.x + adiData.width;
                  const eftposXOffset = 34; // Purple (Eftpos) offset
                  const mastercardXOffset = 31; // Red (Mastercard) offset
                  const curveRadius = 100;
                  const verticalDropY = adiData.y + adiData.height + 100;

                  // Calculate non-ADIs box entry point (10% above bottom right corner)
                  let nonAdiEntryX = adiData.x + adiData.width; // Default to ADI right edge if non-ADI not available
                  let nonAdiEntryY = verticalDropY + 100; // Default position
                  if (window.nonAdiBoxData) {
                    nonAdiEntryX = window.nonAdiBoxData.x + window.nonAdiBoxData.width;
                    nonAdiEntryY = window.nonAdiBoxData.y + window.nonAdiBoxData.height * 0.8; // 20% above bottom
                  }
                  const leftCurveRadius = 170; // Radius for the left curve into non-ADIs box

                  if (data.eftposHorizontalPath && updatedEftposSegments.horizontalY && updatedEftposSegments.curveStartX) {
                    const eftposExtendX = adiRightEdge + eftposXOffset;
                    let eftposEntryY = nonAdiEntryY + 6; // Purple (Eftpos) - 7th from top (last)
                    const lastCIndex = updatedEftposSegments.pathString.lastIndexOf(' C ');
                    if (lastCIndex > -1) {
                      const pathBeforeCurve = updatedEftposSegments.pathString.substring(0, lastCIndex);
                      const horizontalPathData = pathBeforeCurve +
                                               ` L ${(eftposExtendX - curveRadius).toFixed(2)} ${updatedEftposSegments.horizontalY.toFixed(2)}` +
                                               ` Q ${eftposExtendX.toFixed(2)} ${updatedEftposSegments.horizontalY.toFixed(2)}, ${eftposExtendX.toFixed(2)} ${(updatedEftposSegments.horizontalY + curveRadius).toFixed(2)}` +
                                               ` L ${eftposExtendX.toFixed(2)} ${(eftposEntryY - leftCurveRadius).toFixed(2)}` + // Vertical down to curve start
                                               ` Q ${eftposExtendX.toFixed(2)} ${eftposEntryY.toFixed(2)}, ${(eftposExtendX - leftCurveRadius).toFixed(2)} ${eftposEntryY.toFixed(2)}` + // Curve left
                                               ` L ${(nonAdiEntryX - 2).toFixed(2)} ${eftposEntryY.toFixed(2)}`; // Horizontal into non-ADIs box, extend past edge to hide round cap
                      data.eftposHorizontalPath.setAttribute('d', horizontalPathData);
                    }
                  }

                  if (data.mastercardHorizontalPath && updatedMastercardSegments.horizontalY && updatedMastercardSegments.curveStartX) {
                    const mastercardExtendX = adiRightEdge + mastercardXOffset;
                    let mastercardEntryY = nonAdiEntryY + 5; // Red (Mastercard) - 6th from top
                    const lastCIndex = updatedMastercardSegments.pathString.lastIndexOf(' C ');
                    if (lastCIndex > -1) {
                      const pathBeforeCurve = updatedMastercardSegments.pathString.substring(0, lastCIndex);
                      const horizontalPathData = pathBeforeCurve +
                                               ` L ${(mastercardExtendX - curveRadius).toFixed(2)} ${updatedMastercardSegments.horizontalY.toFixed(2)}` +
                                               ` Q ${mastercardExtendX.toFixed(2)} ${updatedMastercardSegments.horizontalY.toFixed(2)}, ${mastercardExtendX.toFixed(2)} ${(updatedMastercardSegments.horizontalY + curveRadius).toFixed(2)}` +
                                               ` L ${mastercardExtendX.toFixed(2)} ${(mastercardEntryY - leftCurveRadius).toFixed(2)}` + // Vertical down to curve start
                                               ` Q ${mastercardExtendX.toFixed(2)} ${mastercardEntryY.toFixed(2)}, ${(mastercardExtendX - leftCurveRadius).toFixed(2)} ${mastercardEntryY.toFixed(2)}` + // Curve left
                                               ` L ${(nonAdiEntryX - 2).toFixed(2)} ${mastercardEntryY.toFixed(2)}`; // Horizontal into non-ADIs box, extend past edge to hide round cap
                      data.mastercardHorizontalPath.setAttribute('d', horizontalPathData);
                    }
                  }
                }

                data.eftposTurnX = updatedEftposSegments.turnX;
                data.mastercardTurnX = updatedMastercardSegments.turnX;
                data.eftposMetrics = updatedEftposSegments;
                data.mastercardMetrics = updatedMastercardSegments;

                if (typeof window.updateDirectEntryBoundingLine === 'function') {
                  const edges = window.directEntryBoundingBoxEdges;
                  if (edges && Number.isFinite(edges.left) && Number.isFinite(edges.top) && Number.isFinite(edges.bottom)) {
                    window.updateDirectEntryBoundingLine(edges.left, edges.top, edges.bottom - edges.top);
                  } else {
                    window.updateDirectEntryBoundingLine();
                  }
                }
              };

              window.updateCardLeftLines();
            }
          }

          // XXX-to-ADI line removed since XXX box is not rendered
          // const chequesToAdiLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          // chequesToAdiLine.setAttribute('id', 'xxx-to-adi-line');
          // chequesToAdiLine.setAttribute('stroke', '#4b5563');
          // chequesToAdiLine.setAttribute('stroke-width', '1');
          // chequesToAdiLine.setAttribute('stroke-linecap', 'round');
          // chequesToAdiLine.setAttribute('fill', 'none');
          // labelsGroup.appendChild(chequesToAdiLine);

          const updateXXXToAdiLine = () => {
            if (!window.xxxToAdiLine || !window.oskoElements || !window.oskoElements.box || !window.adiBoxData) return;

            // Get XXX box position for the starting point
            if (!window.xxxBoxData) return;
            const xxxX = window.xxxBoxData.x;
            const xxxY = window.xxxBoxData.y;
            const xxxWidth = window.xxxBoxData.width;
            const xxxMidX = xxxX + xxxWidth / 2;

            const oskoBox = window.oskoElements.box;
            const oskoX = parseFloat(oskoBox.getAttribute('x'));
            const oskoY = parseFloat(oskoBox.getAttribute('y'));
            const oskoWidth = parseFloat(oskoBox.getAttribute('width'));
            if (!Number.isFinite(oskoX) || !Number.isFinite(oskoY) || !Number.isFinite(oskoWidth)) return;

            // Key Y positions
            const horizontalY = oskoY - 5; // 5px above Osko

            // Get ADIs box position for the endpoint
            if (!window.adiBoxData) return;
            const adiX = window.adiBoxData.x;
            const adiY = window.adiBoxData.y;
            const adiWidth = window.adiBoxData.width;

            // Use same approach as green line for the horizontal-to-ADI portion
            const referenceRightEdge = window.nonAdiBoxData ?
              window.nonAdiBoxData.x + window.nonAdiBoxData.width :
              oskoX + oskoWidth + 300;

            const extendPastReference = referenceRightEdge + 60;
            const curveToAdiStartX = Math.max(oskoX + 120, referenceRightEdge - 80);

            // End point - enters ADI box from top
            const endX = extendPastReference + 25;
            const endY = adiY;

            // Simple rounded corner radius
            const cornerRadius = 20;

            // Control points for final curve to ADI
            const verticalDistance = endY - horizontalY;
            const control3X = curveToAdiStartX + 60;
            const control3Y = horizontalY;
            const control4X = extendPastReference;
            const control4Y = horizontalY + verticalDistance * 0.15;

            // Create complete path with arc for corner (no overshoot)
            const pathData = `M ${xxxMidX.toFixed(2)} ${xxxY.toFixed(2)} ` +
                           `L ${xxxMidX.toFixed(2)} ${(horizontalY + cornerRadius).toFixed(2)} ` +
                           `A ${cornerRadius} ${cornerRadius} 0 0 1 ${(xxxMidX + cornerRadius).toFixed(2)} ${horizontalY.toFixed(2)} ` +
                           `L ${curveToAdiStartX.toFixed(2)} ${horizontalY.toFixed(2)} ` +
                           `C ${control3X.toFixed(2)} ${control3Y.toFixed(2)}, ` +
                           `${control4X.toFixed(2)} ${control4Y.toFixed(2)}, ` +
                           `${endX.toFixed(2)} ${endY.toFixed(2)}`;

            window.xxxToAdiLine.setAttribute('d', pathData);
          };

          // window.xxxToAdiLine = chequesToAdiLine;
          // window.updateXXXToAdiLine = updateXXXToAdiLine;

          // Create maroon lines from Direct Entry to ADIs
          const directEntryToAdiLines = [];
          const maroonLineDuplicates = [];

          // Single thick red line from DE to ADIs
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          line.setAttribute('id', 'directentry-to-adi-line');
          line.setAttribute('stroke', '#ff073a'); // Red
          line.setAttribute('stroke-width', '4');
          line.setAttribute('stroke-linecap', 'round');
          line.setAttribute('fill', 'none');
          // Add to red lines group so line goes under all boxes
          redLinesGroup.appendChild(line);
          directEntryToAdiLines.push(line);

          // Single visible duplicate that will mirror the invisible original
          const duplicate = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          duplicate.setAttribute('id', 'maroon-line-duplicate');
          duplicate.setAttribute('stroke', '#ff073a'); // Red
          duplicate.setAttribute('stroke-width', '4');
          duplicate.setAttribute('stroke-linecap', 'round');
          duplicate.setAttribute('fill', 'none');
          // Add to red lines group so it goes under all boxes
          redLinesGroup.appendChild(duplicate);
          maroonLineDuplicates.push(duplicate);

          window.maroonLineDuplicates = maroonLineDuplicates;

          // Create horizontal branch for red line
          const maroonHorizontalBranches = [];
          const horizontalBranch = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          horizontalBranch.setAttribute('id', 'maroon-horizontal-branch');
          horizontalBranch.setAttribute('stroke', '#ff073a'); // Red
          horizontalBranch.setAttribute('stroke-width', '2'); // Half of main line thickness
          horizontalBranch.setAttribute('stroke-linecap', 'round'); // Round cap since stopping at edge
          horizontalBranch.setAttribute('fill', 'none');
          // Add to red lines group to ensure it goes under all boxes
          redLinesGroup.appendChild(horizontalBranch);
          maroonHorizontalBranches.push(horizontalBranch);
          window.maroonHorizontalBranches = maroonHorizontalBranches;

          const updateDirectEntryToAdiLine = () => {
            if (directEntryToAdiLines.length === 0 || !window.adiBoxData) return;

            // Try to get Direct Entry box position from multiple sources
            let deX, deY, deWidth, deHeight;

            // First try pexaExtensions.stackHeader which seems to be the actual position
            if (window.pexaExtensions && window.pexaExtensions.stackHeader) {
              const header = window.pexaExtensions.stackHeader;
              if (header.rect) {
                const rect = header.rect;
                deX = parseFloat(rect.getAttribute('x'));
                deY = parseFloat(rect.getAttribute('y'));
                deWidth = parseFloat(rect.getAttribute('width'));
                deHeight = parseFloat(rect.getAttribute('height'));
              }
            }

            // Fallback to directEntryBox if needed
            if (!deX && window.directEntryBox) {
              deX = window.directEntryBox.x;
              deY = window.directEntryBox.y;
              deWidth = window.directEntryBox.width;
              deHeight = window.directEntryBox.height;
            }

            if (!deX) return;

            // Start from above the grey line instead of from DE box
            // Get OSKO box position to calculate grey line height
            let greyLineY = deY - 30; // Default position above DE
            if (window.oskoElements && window.oskoElements.box) {
              const oskoBox = window.oskoElements.box;
              const oskoY = parseFloat(oskoBox.getAttribute('y'));
              if (Number.isFinite(oskoY)) {
                // Grey line is at this height
                greyLineY = (oskoY + deY) / 2 -100;
                // Position maroon line above the grey line
                greyLineY = greyLineY - 15; // 15px above grey line
              }
            }
            // Start from where grey line's horizontal section begins (after C-curve, at OSKO left edge)
            let startX = deX + deWidth; // Default to DE right edge
            if (window.oskoElements && window.oskoElements.box) {
              const oskoBox = window.oskoElements.box;
              const oskoX = parseFloat(oskoBox.getAttribute('x'));
              if (Number.isFinite(oskoX)) {
                startX = oskoX; // Start from OSKO left edge (where grey line's horizontal section begins)
              }
            }
            const startY = greyLineY;

            // Get ADIs box position
            const adiX = window.adiBoxData.x;
            const adiY = window.adiBoxData.y;
            const adiWidth = window.adiBoxData.width;

            // Use same approach as green line - horizontal then curve DOWN
            const referenceRightEdge = window.nonAdiBoxData ?
              window.nonAdiBoxData.x + window.nonAdiBoxData.width :
              startX + 300;

            const extendPastReference = referenceRightEdge + 60;
            const curveStartX = Math.max(startX + 120, referenceRightEdge - 80);

            // End point - enters ADI box from top, slightly right of grey line
            const greyEndX = extendPastReference + 25; // Where grey line enters
            const endX = greyEndX + 10; // 30px to the right of grey line

            // Calculate exact endpoint on ADI box top edge
            const strokeWidth = 4; // Line stroke width (matches actual line stroke-width)
            const adiEdge = getBoxEdgePoint(window.adiBoxData, 'top', strokeWidth);
            const endY = adiEdge.y;

            // Control points for smooth downward curve
            const verticalDistance = endY - startY;
            const control1X = curveStartX + 60;
            const control1Y = startY;
            const control2X = extendPastReference + 15;
            const control2Y = startY + verticalDistance * 0.15;

            // Create single thick red path
            const pathData = `M ${startX.toFixed(2)} ${startY.toFixed(2)} ` +
                           `L ${curveStartX.toFixed(2)} ${startY.toFixed(2)} ` +
                           `C ${control1X.toFixed(2)} ${control1Y.toFixed(2)}, ` +
                           `${control2X.toFixed(2)} ${control2Y.toFixed(2)}, ` +
                           `${endX.toFixed(2)} ${endY.toFixed(2)}`;

            directEntryToAdiLines[0].setAttribute('d', pathData);
            // Make line invisible (duplicate will be visible)
            directEntryToAdiLines[0].setAttribute('opacity', '0');

            // Step 2: Update the duplicate with C-CURVE path instead
            if (window.maroonLineDuplicates && window.maroonLineDuplicates.length > 0) {
                // Start point (bottom of C) - CENTER of DE box instead of top
                const cStartX = deX + deWidth / 2;
                const cStartY = deY + deHeight / 2; // Center Y of DE box

                // Connection point (top of C) - OSKO left edge at red line height
                const cConnectionX = startX; // OSKO left edge
                const cConnectionY = startY;

                // Get NPP box position for control points
                const nppBoxEl = document.getElementById('npp-box');
                let cCtrlX = cStartX - 50; // Default
                if (nppBoxEl) {
                  const nppX = parseFloat(nppBoxEl.getAttribute('x'));
                  const nppWidth = parseFloat(nppBoxEl.getAttribute('width'));
                  if (Number.isFinite(nppX) && Number.isFinite(nppWidth)) {
                    const nppRightEdge = nppX + nppWidth;
                    const clearanceGap = 30;
                    // Position control points LEFT of grey line's control points
                    cCtrlX = nppRightEdge + clearanceGap - 325 - 10;
                  }
                }

                // Control points Y positions (same X for C-curve)
                const cCtrl1Y = cStartY - 80;
                const cCtrl2Y = cConnectionY + 10;

                // Create C-curve path that continues to ADI
                const cCurvePathData = `M ${cStartX.toFixed(2)} ${cStartY.toFixed(2)} ` + // Start at DE top
                                       `C ${cCtrlX.toFixed(2)} ${cCtrl1Y.toFixed(2)}, ` + // First control point
                                       `${cCtrlX.toFixed(2)} ${cCtrl2Y.toFixed(2)}, ` + // Second control point
                                       `${cConnectionX.toFixed(2)} ${cConnectionY.toFixed(2)} ` + // End of C-curve at OSKO
                                       `L ${curveStartX.toFixed(2)} ${cConnectionY.toFixed(2)} ` + // Horizontal segment
                                       `C ${control1X.toFixed(2)} ${cConnectionY.toFixed(2)}, ` + // Continue to ADI
                                       `${control2X.toFixed(2)} ${control2Y.toFixed(2)}, ` +
                                       `${endX.toFixed(2)} ${endY.toFixed(2)}`;

                window.maroonLineDuplicates[0].setAttribute('d', cCurvePathData);

                // Update horizontal branch for red line
                if (window.maroonHorizontalBranches && window.maroonHorizontalBranches[0] && window.adiBoxData) {
                  const adiRightEdge = window.adiBoxData.x + window.adiBoxData.width;
                  const horizontalExtendX = adiRightEdge + 17; // Offset of 17 for maroon
                  const curveRadius = 90; // Same roundedness as other lines
                  const verticalDropY = window.adiBoxData.y + window.adiBoxData.height + 100;

                  // Calculate non-ADIs box entry point (10% above bottom right corner)
                  let nonAdiEntryX = window.adiBoxData.x + window.adiBoxData.width; // Default to ADI right edge if non-ADI not available
                  let nonAdiEntryY = verticalDropY + 100; // Default position
                  if (window.nonAdiBoxData) {
                    nonAdiEntryX = window.nonAdiBoxData.x + window.nonAdiBoxData.width;
                    nonAdiEntryY = window.nonAdiBoxData.y + window.nonAdiBoxData.height * 0.8; // 20% above bottom
                    // Maroon is first (topmost) - no offset needed (offset = 0)
                  }
                  const leftCurveRadius = 170; // Radius for the left curve into non-ADIs box

                  // Build horizontal branch path that continues from where the curve would normally go down
                  const maroonStrokeWidth = 2; // From line 4136
                  const horizontalBranchPath = `M ${cStartX.toFixed(2)} ${cStartY.toFixed(2)} ` + // Start at DE center
                                              `C ${cCtrlX.toFixed(2)} ${cCtrl1Y.toFixed(2)}, ` + // First control point
                                              `${cCtrlX.toFixed(2)} ${cCtrl2Y.toFixed(2)}, ` + // Second control point
                                              `${cConnectionX.toFixed(2)} ${cConnectionY.toFixed(2)} ` + // End of C-curve at OSKO
                                              `L ${(horizontalExtendX - curveRadius).toFixed(2)} ${cConnectionY.toFixed(2)} ` + // Horizontal to curve start
                                              `Q ${horizontalExtendX.toFixed(2)} ${cConnectionY.toFixed(2)}, ${horizontalExtendX.toFixed(2)} ${(cConnectionY + curveRadius).toFixed(2)} ` + // Curve down
                                              `L ${horizontalExtendX.toFixed(2)} ${(nonAdiEntryY - leftCurveRadius).toFixed(2)} ` + // Vertical down to curve start
                                              `Q ${horizontalExtendX.toFixed(2)} ${nonAdiEntryY.toFixed(2)}, ${(horizontalExtendX - leftCurveRadius).toFixed(2)} ${nonAdiEntryY.toFixed(2)} ` + // Curve left
                                              `L ${(nonAdiEntryX - maroonStrokeWidth / 2).toFixed(2)} ${nonAdiEntryY.toFixed(2)}`; // Horizontal to non-ADIs box edge, endpoint before edge to hide round cap inside

                  window.maroonHorizontalBranches[0].setAttribute('d', horizontalBranchPath);
                }
            }

            window.directEntryToAdiGeometry = {
            startX,
            startY,
            curveStartX,
            extendPastReference,
            control1X,
            control1Y,
            control2X,
            control2Y,
            endX,
            endY
          };

          if (typeof window.updateCardLeftLines === 'function') {
            // Rebuild eftpos/Mastercard connectors so they mirror the latest ADI geometry
            window.updateCardLeftLines();
          }

          if (typeof window.updateDirectEntryBoundingLine === 'function') {
            const edges = window.directEntryBoundingBoxEdges;
            if (edges && Number.isFinite(edges.left) && Number.isFinite(edges.top) && Number.isFinite(edges.bottom)) {
              window.updateDirectEntryBoundingLine(edges.left, edges.top, edges.bottom - edges.top);
              } else {
                window.updateDirectEntryBoundingLine();
              }
            }

          };

          window.directEntryToAdiLines = directEntryToAdiLines;
          window.updateDirectEntryToAdiLine = updateDirectEntryToAdiLine;
          updateDirectEntryToAdiLine(); // Initial update

          // Create grey curve from OSKO to ADI with same shape as green/maroon curves
          const oskoToAdiLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          oskoToAdiLine.setAttribute('id', 'osko-to-adi-line');
          oskoToAdiLine.setAttribute('stroke', '#e5e7eb'); // Match APCS to Cheques line color
          oskoToAdiLine.setAttribute('stroke-width', '2');
          oskoToAdiLine.setAttribute('stroke-linecap', 'round');
          oskoToAdiLine.setAttribute('fill', 'none');
          labelsGroup.insertBefore(oskoToAdiLine, labelsGroup.firstChild);

          const updateOskoToAdiLine = () => {
            if (!window.chequesBoxData || !window.adiBoxData) return;

            // Get Cheques box position
            const chequesX = window.chequesBoxData.x;
            const chequesY = window.chequesBoxData.y;
            const chequesHeight = window.chequesBoxData.height;

            // Get NPP box position to curve around it
            const nppBoxEl = document.getElementById('npp-box');
            if (!nppBoxEl) return;
            const nppX = parseFloat(nppBoxEl.getAttribute('x'));
            const nppY = parseFloat(nppBoxEl.getAttribute('y'));
            const nppWidth = parseFloat(nppBoxEl.getAttribute('width'));
            const nppHeight = parseFloat(nppBoxEl.getAttribute('height'));

            if (!Number.isFinite(nppX) || !Number.isFinite(nppY) ||
                !Number.isFinite(nppWidth) || !Number.isFinite(nppHeight)) return;

            // Get OSKO box position - this is where our horizontal section joins
            if (!window.oskoElements || !window.oskoElements.box) return;
            const oskoBox = window.oskoElements.box;
            const oskoX = parseFloat(oskoBox.getAttribute('x'));
            const oskoY = parseFloat(oskoBox.getAttribute('y'));
            const oskoWidth = parseFloat(oskoBox.getAttribute('width'));

            // Get Direct Entry position for height reference
            let deY = oskoY - 100;
            if (window.directEntryBox) {
              deY = window.directEntryBox.y + window.directEntryBox.height / 2;
            } else if (window.pexaExtensions && window.pexaExtensions.stackHeader && window.pexaExtensions.stackHeader.rect) {
              const rect = window.pexaExtensions.stackHeader.rect;
              const rectY = parseFloat(rect.getAttribute('y'));
              const rectHeight = parseFloat(rect.getAttribute('height'));
              if (Number.isFinite(rectY) && Number.isFinite(rectHeight)) {
                deY = rectY + rectHeight / 2;
              }
            }

            // The horizontal section height (halfway between OSKO and Direct Entry)
            const horizontalY = (oskoY + deY) / 2 - 48;

            // Connection point at LEFT edge of OSKO box
            const connectionX = oskoX;
            const connectionY = horizontalY;

            // Start from LEFT edge of Cheques box, middle height
            const startX = chequesX;
            const startY = chequesY + chequesHeight / 2;

            // Create C-curve that goes around the RIGHT side of NPP box
            const clearanceGap = 30;
            const nppRightEdge = nppX + nppWidth;

            // Two control points for C-curve around NPP - both with same X coordinate
            const ctrlX = nppRightEdge + clearanceGap - 325; // Same X for both control points
            const ctrl1Y = startY //- (startY - connectionY) + 150//* 0.3; // First control point Y
            const ctrl2Y = connectionY //+ (startY - connectionY) - 100 //* 0.3; // Second control point Y

            // Get stored geometry from maroon and green lines for final approach to ADI
            const maroonGeom = window.directEntryToAdiGeometry;
            const greenGeom = window.nppToAdiGeometry;

            // Calculate end point between green and maroon lines at ADI
            let endX;
            if (maroonGeom && greenGeom && Number.isFinite(maroonGeom.endX) && Number.isFinite(greenGeom.endX)) {
              endX = (maroonGeom.endX + greenGeom.endX) / 2;
            } else if (maroonGeom && Number.isFinite(maroonGeom.endX)) {
              endX = maroonGeom.endX - 15;
            } else {
              endX = window.adiBoxData.x + window.adiBoxData.width / 2 + 200;
            }

            // Calculate exact endpoint on ADI box top edge
            const strokeWidth = 2; // Grey line stroke width
            const adiEdge = getBoxEdgePoint(window.adiBoxData, 'top', strokeWidth);
            const endY = adiEdge.y;

            // Calculate curve start for descent to ADI
            const referenceRightEdge = window.nonAdiBoxData ?
              window.nonAdiBoxData.x + window.nonAdiBoxData.width :
              oskoX + oskoWidth + 300;
            const extendPastReference = referenceRightEdge + 60;
            const curveStartX = Math.max(oskoX + oskoWidth + 120, referenceRightEdge - 80);

            // Create path: horizontal from Cheques, then C-curve up to OSKO, then horizontal, then down to ADI
            const horizontalEndX = startX + (connectionX - startX) / 6; // One third the distance to connection point
            const pathData = `M ${startX.toFixed(2)} ${startY.toFixed(2)} ` + // Start at Cheques left edge
                           `L ${horizontalEndX.toFixed(2)} ${startY.toFixed(2)} ` + // Horizontal line (half length)
                           `C ${ctrlX.toFixed(2)} ${ctrl1Y.toFixed(2)}, ` + // First control point
                           `${ctrlX.toFixed(2)} ${ctrl2Y.toFixed(2)}, ` + // Second control point (same X)
                           `${connectionX.toFixed(2)} ${connectionY.toFixed(2)} ` + // End at OSKO left edge (up at connection height)
                           `L ${curveStartX.toFixed(2)} ${connectionY.toFixed(2)} ` + // Horizontal to curve start
                           `C ${curveStartX + 60} ${connectionY.toFixed(2)}, ` + // Control point for down curve
                           `${extendPastReference.toFixed(2)} ${connectionY + (endY - connectionY) * 0.15}, ` + // Control point 2
                           `${endX.toFixed(2)} ${endY.toFixed(2)}`; // End at ADI

            oskoToAdiLine.setAttribute('d', pathData);

            // Remove any existing control point dots
            const existingDots = document.querySelectorAll('.control-point-dot');
            existingDots.forEach(dot => dot.remove());
          };

          window.oskoToAdiLine = oskoToAdiLine;
          window.updateOskoToAdiLine = updateOskoToAdiLine;
          updateOskoToAdiLine();

          window.otherCardsHierarchy = {
            parent: null,
            becn: null,
            becg: null,
            baseX: eftposActualX,
            stackWidth: boxWidth,
            atmsHeight: reducedHeight,
            atms: atms,
            bounding: {
              rect: stackBoundingRect,
              padX: boundingPadX,
              padY: boundingPadY,
              leftEdge: stackBoundingLeftEdge,
              rightEdge: stackBoundingRightEdge
            },
            header: {
              rect: stackHeaderRect,
              text: stackHeaderText,
              height: stackHeaderHeight,
              gap: stackHeaderGap,
              gapFromNpp: headerGapFromNpp,
              lift: headerLift
            }
          };

          const eftposLines = createDoubleLine(
            baseX + boxWidth,
            eftposY + stackedHeight / 2,
            window.hexagonPositions.mastercardX,
            '#FFA500',
            yellowLinesGroup
          );

          const mastercardLines = createDoubleLine(
            baseX + boxWidth,
            mastercardY + stackedHeight / 2,
            window.hexagonPositions.mastercardX,
            '#ab20fd',
            yellowLinesGroup
          );

          const actualGap = pexaConveyY - (eftposY + stackedHeight);

          window.pexaExtensions = {
            eftpos,
            mastercard,
            visa,
            medicare,
            atms,
            otherCards,
            gap: actualGap,
            stackedHeight,
            reducedHeight,
            baseX,
            width: boxWidth,
            eftposLines,
            mastercardLines,
            otherCardsHierarchy: window.otherCardsHierarchy,
            stackBounding: {
              rect: stackBoundingRect,
              padX: boundingPadX,
              padY: boundingPadY,
              topMargin: topMarginHeight,
              label: stackBoundingLabel,
              leftEdge: stackBoundingLeftEdge,
              rightEdge: stackBoundingRightEdge
            },
            boundingLeftEdge: stackBoundingLeftEdge,
            boundingRightEdge: stackBoundingRightEdge,
            stackHeader: { rect: stackHeaderRect, text: stackHeaderText, height: stackHeaderHeight, gap: stackHeaderGap }
          };

          console.log('Updating Other Cards hierarchy placement - Mastercard Y:', mastercardY, 'X:', eftposActualX, 'Width:', boxWidth);

          if (window.otherCardsHierarchy && window.otherCardsHierarchy.parent && window.otherCardsHierarchy.becn && window.otherCardsHierarchy.becg) {
            const hierarchy = window.otherCardsHierarchy;
            const parentData = hierarchy.parent;
            const becnData = hierarchy.becn;
            const becgData = hierarchy.becg;
            const parentHeight = Number.isFinite(hierarchy.parent.height) ? hierarchy.parent.height : stackedHeight;
            const childHeight = Number.isFinite(becnData.height) ? becnData.height : stackedHeight;
            const childGapVertical = Number.isFinite(hierarchy.childGap) ? hierarchy.childGap : 5;
            const parentGap = Number.isFinite(hierarchy.parentGap) ? hierarchy.parentGap : 8;
            const childGapHorizontal = Number.isFinite(hierarchy.childGapHorizontal) ? hierarchy.childGapHorizontal : 5;
            const stackBaseX = Number.isFinite(window.pexaExtensions?.baseX) ? window.pexaExtensions.baseX : baseX;
            const stackWidth = Number.isFinite(window.pexaExtensions?.width) ? window.pexaExtensions.width : boxWidth;

            let atmsRectCurrent = window.pexaExtensions?.atms?.rect;
            if (!atmsRectCurrent && hierarchy.atms && hierarchy.atms.rect) {
              atmsRectCurrent = hierarchy.atms.rect;
            }
            const atmsYCurrent = atmsRectCurrent ? parseFloat(atmsRectCurrent.getAttribute('y')) : (otherCards?.rect ? parseFloat(otherCards.rect.getAttribute('y')) : otherCardsY);
            const atmsHeightCurrent = atmsRectCurrent ? parseFloat(atmsRectCurrent.getAttribute('height')) : (Number.isFinite(hierarchy.atmsHeight) ? hierarchy.atmsHeight : stackedHeight * 0.9);

            let childYUpdated = atmsYCurrent - childHeight - childGapVertical;
            if (!Number.isFinite(childYUpdated)) {
              const fallbackY = otherCards?.rect ? parseFloat(otherCards.rect.getAttribute('y')) : otherCardsY;
              childYUpdated = fallbackY - childHeight - childGapVertical;
            }
            const parentYUpdated = childYUpdated - parentGap - parentHeight;

            const childWidthUpdated = (stackWidth - childGapHorizontal) / 2;
            const becnX = stackBaseX;
            const becgX = becnX + childWidthUpdated + childGapHorizontal;

            const updateBoxAndText = (entry, x, y, width, height) => {
              if (!entry || !entry.box) return;
              entry.box.setAttribute('x', x.toFixed(2));
              entry.box.setAttribute('y', y.toFixed(2));
              entry.box.setAttribute('width', width.toFixed(2));
              entry.box.setAttribute('height', height.toFixed(2));
              if (entry.text) {
                entry.text.setAttribute('x', (x + width / 2).toFixed(2));
                entry.text.setAttribute('y', (y + height / 2).toFixed(2));
              }
            };

            updateBoxAndText(becnData, becnX, childYUpdated, childWidthUpdated, childHeight);
            updateBoxAndText(becgData, becgX, childYUpdated, childWidthUpdated, childHeight);
            updateBoxAndText(parentData, stackBaseX, parentYUpdated, stackWidth, parentHeight);

            const boundingInfo = hierarchy.bounding || window.pexaExtensions.stackBounding;
            const headerInfoHierarchy = hierarchy.header || hierarchy.stackHeader || window.pexaExtensions.stackHeader;
            if (boundingInfo && boundingInfo.rect) {
              const bPadX = Number.isFinite(boundingInfo.padX) ? boundingInfo.padX : 6;
              const bPadY = Number.isFinite(boundingInfo.padY) ? boundingInfo.padY : 6;
              const topMargin = Number.isFinite(boundingInfo.topMargin)
                ? boundingInfo.topMargin
                : (Number.isFinite(window.directEntryBoundingTopMargin) ? window.directEntryBoundingTopMargin : 0);
              const visaRectCurrent = visa?.rect;
              const visaBottom = visaRectCurrent
                ? parseFloat(visaRectCurrent.getAttribute('y')) + parseFloat(visaRectCurrent.getAttribute('height'))
                : visaY + childHeight;
              const topY = atmsYCurrent;
              const boundingLeftEdge = stackBaseX - bPadX;
              const boundingTop = topY - bPadY - topMargin;
              const boundingWidth = stackWidth + bPadX * 2;
              const boundingHeight = visaBottom - topY + bPadY * 2 + topMargin;
              const boundingRightEdge = boundingLeftEdge + boundingWidth;
              const boundingBottom = visaBottom + bPadY;

              boundingInfo.rect.setAttribute('x', boundingLeftEdge.toFixed(2));
              boundingInfo.rect.setAttribute('y', boundingTop.toFixed(2));
              boundingInfo.rect.setAttribute('width', boundingWidth.toFixed(2));
              boundingInfo.rect.setAttribute('height', boundingHeight.toFixed(2));
              boundingInfo.rect.setAttribute('data-left-edge', boundingLeftEdge.toFixed(2));
              boundingInfo.rect.setAttribute('data-right-edge', boundingRightEdge.toFixed(2));
              boundingInfo.rect.setAttribute('data-top-margin', topMargin.toFixed(2));

              if (typeof cacheRectEdges === 'function') {
                cacheRectEdges(boundingInfo.rect, 'directEntryStackBounding');
              }

              window.directEntryBoundingBoxLeftEdge = boundingLeftEdge;
              window.directEntryBoundingBoxEdges = {
                left: boundingLeftEdge,
                right: boundingRightEdge,
                top: boundingTop,
                bottom: boundingBottom
              };
              window.directEntryBoundingTopMargin = topMargin;
              boundingInfo.leftEdge = boundingLeftEdge;
              boundingInfo.rightEdge = boundingRightEdge;
              boundingInfo.topMargin = topMargin;
              const labelElement = boundingInfo.label || window.directEntryBoundingLabel;
              if (labelElement) {
                boundingInfo.label = labelElement;
                window.directEntryBoundingLabel = labelElement;
              }
              if (typeof window.positionDirectEntryLabel === 'function') {
                window.positionDirectEntryLabel();
              }
              if (window.pexaExtensions) {
                window.pexaExtensions.boundingLeftEdge = boundingLeftEdge;
                window.pexaExtensions.boundingRightEdge = boundingRightEdge;
                window.pexaExtensions.stackBounding = boundingInfo;
              }
              if (window.otherCardsHierarchy) {
                window.otherCardsHierarchy.bounding = boundingInfo;
              }
              hierarchy.bounding = boundingInfo;

              if (typeof window.updateDirectEntryBoundingLine === 'function') {
                window.updateDirectEntryBoundingLine(boundingLeftEdge, boundingTop, boundingHeight);
              }

              // Update the CECS to bounding box lines with new positions
              if (window.cecsToAtmsBoundingLines && window.cecsToAtmsBoundingLines.length > 0 && window.cecsBoxData) {
                const cecsData = window.cecsBoxData;
                const cecsCenterY = cecsData.y + cecsData.height / 2;
                const cecsLeftX = cecsData.x; // Left side of CECS box
                const newLineEndX = boundingRightEdge - 2; // Right edge of updated bounding box
                const lineGap = 3;
                const lineOffsets = [-lineGap/2, lineGap/2];

                window.cecsToAtmsBoundingLines.forEach((line, idx) => {
                  if (line) {
                    line.setAttribute('x1', newLineEndX.toFixed(2)); // START at right edge of bounding box
                    line.setAttribute('y1', (cecsCenterY + lineOffsets[idx]).toFixed(2));
                    line.setAttribute('x2', cecsLeftX.toFixed(2)); // END at left side of CECS
                    line.setAttribute('y2', (cecsCenterY + lineOffsets[idx]).toFixed(2));
                  }
                });
              } else if (window.cecsToAtmsBoundingLine && window.cecsBoxData) {
                // Fallback for single line
                const cecsData = window.cecsBoxData;
                const cecsCenterY = cecsData.y + cecsData.height / 2;
                const cecsLeftX = cecsData.x;
                const newLineEndX = boundingRightEdge - 2;

                window.cecsToAtmsBoundingLine.setAttribute('x1', newLineEndX.toFixed(2));
                window.cecsToAtmsBoundingLine.setAttribute('x2', cecsLeftX.toFixed(2));
              }
            }

            if (headerInfoHierarchy && headerInfoHierarchy.rect) {
              const padX = Number.isFinite(boundingInfo?.padX) ? boundingInfo.padX : 6;
              const padY = Number.isFinite(boundingInfo?.padY) ? boundingInfo.padY : 6;
              const headerGap = Number.isFinite(headerInfoHierarchy.gap) ? headerInfoHierarchy.gap : gapHalf;
              const headerGapNpp = Number.isFinite(headerInfoHierarchy.gapFromNpp) ? headerInfoHierarchy.gapFromNpp : 10;
              const headerHeight = Number.isFinite(headerInfoHierarchy.height) ? headerInfoHierarchy.height : stackedHeight;
              const headerLift = Number.isFinite(headerInfoHierarchy.lift) ? headerInfoHierarchy.lift : headerHeight * 4;
              const headerX = stackBaseX - padX;
              const nppTopValue = window.nppBoxData && Number.isFinite(window.nppBoxData.y) ? window.nppBoxData.y : NaN;
              const headerY = Number.isFinite(nppTopValue)
                ? (nppTopValue - headerGapNpp - headerHeight - headerLift)
                : (atmsYCurrent - padY) - headerGap - headerHeight - headerLift;
              headerInfoHierarchy.rect.setAttribute('x', headerX.toFixed(2));
              headerInfoHierarchy.rect.setAttribute('y', headerY.toFixed(2));
              headerInfoHierarchy.rect.setAttribute('width', (stackWidth + padX * 2).toFixed(2));
              headerInfoHierarchy.rect.setAttribute('height', headerHeight.toFixed(2));
              if (headerInfoHierarchy.text) {
                headerInfoHierarchy.text.setAttribute('x', (headerX + (stackWidth + padX * 2) / 2).toFixed(2));
                headerInfoHierarchy.text.setAttribute('y', (headerY + headerHeight / 2).toFixed(2));
              }
              headerInfoHierarchy.lift = headerLift;
              hierarchy.header = headerInfoHierarchy;
              hierarchy.stackHeader = headerInfoHierarchy;
              if (window.pexaExtensions) {
                window.pexaExtensions.stackHeader = headerInfoHierarchy;
              }
            }

            // XXX-to-ADI line update removed
            // if (typeof window.updateXXXToAdiLine === 'function') {
            //   window.updateXXXToAdiLine();
            // }
            if (typeof window.updateDirectEntryToAdiLine === 'function') {
              window.updateDirectEntryToAdiLine();
            }
            if (typeof window.updateOskoToAdiLine === 'function') {
              window.updateOskoToAdiLine();
            }

            hierarchy.childWidth = childWidthUpdated;
            hierarchy.baseX = stackBaseX;
            hierarchy.stackWidth = stackWidth;
            hierarchy.atmsHeight = atmsHeightCurrent;
            parentData.height = parentHeight;
            becnData.height = childHeight;
            becgData.height = childHeight;

            console.log('Updated Other Cards hierarchy:', {
              parentX: stackBaseX,
              parentY: parentYUpdated,
              childY: childYUpdated,
              childWidth: childWidthUpdated
            });
          }
        }

        const pexaLineColor = '#FF0090';
        const pexaConnectorStartX = pexaConveyX + pexaConveyWidth;
        let pexaConnectorEndX = pexaConnectorStartX;
        if (window.hexagonPositions) {
          pexaConnectorEndX = window.hexagonPositions.pexaX;
        }
        const pexaLineGap = 3.0;
        const pexaOffsets = [-pexaLineGap/2, pexaLineGap/2]; // Double lines (gap = 1.5 to match curved lines)
        window.pexaHorizontalLines = pexaOffsets.map((offset, idx) => {
          const line = createStyledLine(
            pexaConnectorStartX,
            pexaConveyY + pexaConveyHeight / 2 + offset,
            pexaConnectorEndX,
            pexaConveyY + pexaConveyHeight / 2 + offset,
            {
              stroke: pexaLineColor,
              strokeWidth: '2.25', // Match curved double lines
              strokeLinecap: 'round'
            }
          );
          line.setAttribute('id', `pexa-horizontal-line-${idx}`);
          if (redLinesGroup) {
            redLinesGroup.appendChild(line);
          } else {
            labelsGroup.insertBefore(line, labelsGroup.firstChild);
          }
          return line;
        });

        // Trade by trade box - above SSS/CCP with double gap
        const tradeByTradePadding = 0; // No padding - align with other boxes
        const tradeByTradeWidth = rectWidth * 0.93; // Slightly reduced width
        // Position aligned with CCP cashflows and DvP cash leg
        let alignedTradeByTradeX = window.asxBoxesAlignment ? 
          window.asxBoxesAlignment.center - (tradeByTradeWidth / 2) : 
          moneyMarketX;
        if (window.asxGroupShiftAmount) {
          alignedTradeByTradeX += window.asxGroupShiftAmount;
        }
        const tradeByTradeY = moneyMarketY - 2 * smallRectHeight - 3 * verticalGap + 10 - 4 - 1; // Moved up by 1 pixel

        const tradeByTradeRect = createStyledRect(alignedTradeByTradeX, tradeByTradeY, tradeByTradeWidth, smallRectHeight * 0.9, {
          fill: '#fffaf0', // Light cream background
          stroke: '#071f6a', // Blue border
          strokeWidth: '2',
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
            fill: '#071f6a', // Blue text
            fontSize: '11'
          }
        );
        labelsGroup.appendChild(tradeByTradeText);

        // Clearing/netting box - above trade by trade
        // Make clearing box use more of the bounding box width
        const clearingPadding = 0; // No padding - align with other boxes
        const clearingWidth = rectWidth * 0.93; // Slightly reduced width
        // Position aligned with CCP cashflows and DvP cash leg
        let alignedClearingX = window.asxBoxesAlignment ? 
          window.asxBoxesAlignment.center - (clearingWidth / 2) : 
          moneyMarketX;
        if (window.asxGroupShiftAmount) {
          alignedClearingX += window.asxGroupShiftAmount;
        }
        const clearingY = tradeByTradeY - smallRectHeight * 0.9 - verticalGap; // Match gap with DvP cash leg → cash transfer spacing

        const clearingRect = createStyledRect(alignedClearingX, clearingY, clearingWidth, smallRectHeight * 0.9, {
          fill: '#fffaf0', // Light cream background
          stroke: '#071f6a', // Blue border
          strokeWidth: '2',
          rx: '8',
          ry: '8'
        });
        labelsGroup.appendChild(clearingRect);

        // Add label for clearing/netting
        const clearingText = createStyledText(
          alignedClearingX + clearingWidth / 2,
          clearingY + smallRectHeight * 0.9 / 2,
          'clearing / netting',
          {
            fill: '#071f6a', // Blue text
            fontSize: '11'
          }
        );
        labelsGroup.appendChild(clearingText);

        // SSS/CCP cash legs box - above Money Market/Repo
        const sssCcpX = moneyMarketX;
        // sssCcpY already defined above for positioning the enclosing box

        const alignedSssCcpWidth = rectWidth * 0.95;
        let alignedSssCcpX = window.asxBoxesAlignment ? window.asxBoxesAlignment.center - (alignedSssCcpWidth / 2) : sssCcpX;
        if (window.asxGroupShiftAmount) {
          alignedSssCcpX += window.asxGroupShiftAmount;
        }

        const sssCcpRect = createStyledRect(alignedSssCcpX, sssCcpY, alignedSssCcpWidth, smallRectHeight * 0.9, {
          fill: '#fffaf0', // Light cream background
          stroke: '#071f6a', // Blue border
          strokeWidth: '2',
          rx: '8',
          ry: '8'
        });
        labelsGroup.appendChild(sssCcpRect);

        // Add label for DvP cash leg (SSS/CCP)
        const sssCcpText = createStyledText(
          alignedSssCcpX + alignedSssCcpWidth / 2,
          sssCcpY + smallRectHeight * 0.9 / 2,
          'DvP cash leg',
          {
            fill: '#071f6a', // Blue text
            fontSize: '11'
          }
        );
        labelsGroup.appendChild(sssCcpText);

        // Create ASX bounding box around CHESS equities, DvP cash leg, and cash transfer only
        const symmetricPaddingForBox = 13 - 2; // Reduced by 2 pixels on each side

        // Get positions of the three boxes we want to bound
        const actualChessX = alignedChessEquitiesX;
        const actualChessWidth = alignedChessEquitiesWidth;
        const actualChessRight = actualChessX + actualChessWidth;

        // Find the leftmost and rightmost edges of our three boxes
        const contentLeftMost = Math.min(actualChessX, alignedSssCcpX, alignedMoneyMarketX);
        const contentRightMost = Math.max(
          actualChessRight,
          alignedSssCcpX + alignedSssCcpWidth,
          alignedMoneyMarketX + alignedMoneyMarketWidth
        );

        // Calculate box dimensions with symmetric padding
        const asxBoxX = contentLeftMost - symmetricPaddingForBox;
        const asxBoxWidth = (contentRightMost - contentLeftMost) + (2 * symmetricPaddingForBox);
        const asxBoxBottom = moneyMarketY + smallRectHeight * 0.9 + 37; // Keep bottom aligned with money market row + label space
        const asxBoxY = chessEquitiesY - 12; // Reduce extra top padding by 2px (bottom stays fixed)
        const asxBoxHeight = asxBoxBottom - asxBoxY;

        // Debug: Log ASX box alignment
        console.log('ASX Box Alignment:', {
          asxBoxX: asxBoxX,
          asxBoxRightEdge: asxBoxX + asxBoxWidth,
          apcrRightEdge: window.apcrRightEdge,
          alignmentUsed: window.asxBoxesAlignment && window.apcrRightEdge
        });

        const asxBoundingBox = createStyledRect(asxBoxX, asxBoxY, asxBoxWidth, asxBoxHeight, {
          fill: '#071f6a', // Swapped with stroke
          stroke: '#e8ecf7', // Swapped with fill
          strokeWidth: '2.5', // Thicker border
          rx: '8',
          ry: '8'
        });
        // Insert at the very beginning of SVG so it's behind EVERYTHING
        svg.insertBefore(asxBoundingBox, svg.firstChild);

        // Store ASX box right edge for SWIFT PDS alignment
        window.asxBoxRightEdge = asxBoxX + asxBoxWidth;

        // Store the final ASX box dimensions for use by interior boxes
        window.finalAsxBox = {
          x: asxBoxX,
          width: asxBoxWidth
        };

        // Now reposition PEXA e-conveyancing and Sympli boxes based on ASX box
        // Their right edges should be 1/3 of ASX box width from ASX box right edge
        const centerForConveyancing = asxBoxX + asxBoxWidth / 2;

        // Update Sympli box position
        if (sympliBox) {
          const newSympliX = centerForConveyancing - sympliWidth / 2;
          sympliBox.setAttribute('x', newSympliX.toFixed(2));
          if (sympliText) {
            sympliText.setAttribute('x', (newSympliX + sympliWidth / 2).toFixed(2));
          }
          window.newSympliX = newSympliX;
          window.newSympliWidth = sympliWidth;
          window.newSympliY = sympliY;

          // Update card left lines to align with new Sympli position
          if (window.updateCardLeftLines) {
            window.updateCardLeftLines();
          }

          if (window.sympliHorizontalLines && window.sympliHorizontalLines.length) {
            const sympliStart = newSympliX + sympliWidth;
            let sympliEnd = sympliStart;
            if (window.bridgePositions) {
              const left = window.bridgePositions.bridgeX;
              const right = left + window.bridgePositions.bridgeWidth;
              sympliEnd = left;
              if (left <= sympliStart) {
                sympliEnd = right;
              }
            }
            const sympliYCenter = sympliY + sympliHeight / 2;
            const offsets = [-1.5, 1.5]; // Double lines (gap = 1.5 to match curved lines)
            window.sympliHorizontalLines.forEach((line, idx) => {
              if (!line) return;
              const offset = offsets[idx] !== undefined ? offsets[idx] : 0;
              line.setAttribute('x1', sympliStart.toFixed(2));
              line.setAttribute('y1', (sympliYCenter + offset).toFixed(2));
              line.setAttribute('x2', sympliEnd.toFixed(2));
              line.setAttribute('y2', (sympliYCenter + offset).toFixed(2));
            });
          }
        }

        // Update PEXA e-conveyancing box position
        if (pexaConveyBox) {
          const newPexaConveyX = centerForConveyancing - pexaConveyWidth / 2;

          // LOG THE FUCKING COORDINATES
          console.log('=== PEXA E-CONVEYANCING BOX REPOSITIONING ===');
          console.log('Old PEXA conveyancing X:', pexaConveyX);
          console.log('New PEXA conveyancing X:', newPexaConveyX);
          console.log('PEXA conveyancing width:', pexaConveyWidth);
          console.log('Box left edge:', newPexaConveyX);
          console.log('Box right edge:', newPexaConveyX + pexaConveyWidth);
          console.log('ASX box right edge:', asxBoxX + asxBoxWidth);
          console.log('ASX box center:', centerForConveyancing);
          pexaConveyBox.setAttribute('x', newPexaConveyX.toFixed(2));
          // Update PEXA e-conveyancing text position
          if (pexaConveyText) {
            pexaConveyText.setAttribute('x', (newPexaConveyX + pexaConveyWidth / 2).toFixed(2));
          }
          pexaConveyX = newPexaConveyX;
          if (!window.pexaConveyBoxData) {
            window.pexaConveyBoxData = {
              x: newPexaConveyX,
              y: pexaConveyY,
              width: pexaConveyWidth,
              height: pexaConveyHeight
            };
          } else {
            window.pexaConveyBoxData.x = newPexaConveyX;
            window.pexaConveyBoxData.width = pexaConveyWidth;
          }
          window.newPexaConveyX = newPexaConveyX;
          window.newPexaConveyWidth = pexaConveyWidth;

          // Update card left lines to align with new PEXA position
          if (window.updateCardLeftLines) {
            window.updateCardLeftLines();
          }

          if (window.pexaExtensions) {
            const { eftpos, mastercard, visa, medicare, atms, otherCards, stackedHeight, reducedHeight: storedReducedHeight, gap, width: extWidth, stackBounding } = window.pexaExtensions;
            const stackWidth = Number.isFinite(extWidth) ? extWidth : window.hexagonPositions?.mastercardWidth || pexaConveyWidth;
            const baseX = (newPexaConveyX + pexaConveyWidth / 2) - stackWidth / 2;
            const currentSympliY = window.newSympliY !== undefined ? window.newSympliY : sympliY;
            let gapSympli = gap;
            if (!Number.isFinite(gapSympli) || gapSympli <= 0) {
              gapSympli = pexaConveyY - (currentSympliY + sympliHeight);
              if (!Number.isFinite(gapSympli) || gapSympli <= 0) {
                gapSympli = 12;
              }
            }

            const baseEftposY = pexaConveyY - gapSympli - stackedHeight;
            const essbY = window.hexagonPositions.eftposY;
            const shift = essbY - baseEftposY;
            const eftposY = baseEftposY + shift;
            const mastercardY = eftposY - gapSympli - stackedHeight;
            const reducedHeight = Number.isFinite(storedReducedHeight)
              ? storedReducedHeight
              : stackedHeight * 0.81; // 10% less tall (was 0.9)
            const visaGap = gapSympli * 2;
            const visaY = mastercardY - visaGap - reducedHeight;
            const gapHalf = gapSympli / 2;
            const otherCardsY = visaY - gapHalf - reducedHeight;
            const medicareY = otherCardsY - gapHalf - reducedHeight;
            const atmsY = medicareY - gapHalf - reducedHeight;

            const updateStackItem = (item, y) => {
              if (!item || !item.rect || !item.text) return;
              const itemHeight = Number.isFinite(item.height) ? item.height : stackedHeight;

              // Check if this is one of the narrow boxes (ATMs, Claims, Other Cards, Visa)
              const label = item.text.textContent;
              const isNarrowBox = ['ATMs', 'Claims', 'Other Cards', 'Visa'].includes(label);

              // Use reduced width for narrow boxes
              const itemWidth = isNarrowBox ? stackWidth * 0.8 : stackWidth;
              const itemX = isNarrowBox ? baseX + (stackWidth - itemWidth) / 2 : baseX;

              item.rect.setAttribute('x', itemX.toFixed(2));
              item.rect.setAttribute('width', itemWidth.toFixed(2));
              item.rect.setAttribute('y', y.toFixed(2));
              item.rect.setAttribute('height', itemHeight.toFixed(2));
              item.text.setAttribute('x', (itemX + itemWidth / 2).toFixed(2));
              item.text.setAttribute('y', (y + itemHeight / 2).toFixed(2));
            };

            updateStackItem(window.pexaExtensions.eftpos, eftposY);
            updateStackItem(window.pexaExtensions.mastercard, mastercardY);
            if (visa) {
              updateStackItem(visa, visaY);
            }
            if (medicare) {
              updateStackItem(medicare, medicareY);
            }
            if (atms) {
              updateStackItem(atms, atmsY);
            }
            if (otherCards) {
              updateStackItem(otherCards, otherCardsY);
            }

            if (typeof window.updateCardLeftLines === 'function') {
              window.updateCardLeftLines();
            }

            const headerInfo = window.pexaExtensions.stackHeader;
            if (stackBounding && stackBounding.rect) {
              const padX = Number.isFinite(stackBounding.padX) ? stackBounding.padX : 6;
              const padY = Number.isFinite(stackBounding.padY) ? stackBounding.padY : 6;
              const topMargin = Number.isFinite(stackBounding.topMargin)
                ? stackBounding.topMargin
                : (Number.isFinite(window.directEntryBoundingTopMargin)
                    ? window.directEntryBoundingTopMargin
                    : (Number.isFinite(reducedHeight) ? reducedHeight : stackedHeight * 0.9));
              const topY = atmsY;
              const bottomY = visaY + reducedHeight;

              // Use reduced width for the green bounding box
              const boundingWidth = stackWidth * 0.8;
              const boundingX = baseX + (stackWidth - boundingWidth) / 2;
              const boundingLeftEdge = boundingX - padX;
              const boundingTotalWidth = boundingWidth + padX * 2;
              const boundingRightEdge = boundingLeftEdge + boundingTotalWidth;
              const boundingTop = topY - padY - topMargin;
              const boundingHeight = (bottomY - topY + padY * 2 + topMargin);

              stackBounding.rect.setAttribute('x', boundingLeftEdge.toFixed(2));
              stackBounding.rect.setAttribute('y', boundingTop.toFixed(2));
              stackBounding.rect.setAttribute('width', boundingTotalWidth.toFixed(2));
              stackBounding.rect.setAttribute('height', boundingHeight.toFixed(2));
              stackBounding.rect.setAttribute('data-left-edge', boundingLeftEdge.toFixed(2));
              stackBounding.rect.setAttribute('data-right-edge', boundingRightEdge.toFixed(2));
              stackBounding.rect.setAttribute('data-top-margin', topMargin.toFixed(2));

              if (typeof cacheRectEdges === 'function') {
                cacheRectEdges(stackBounding.rect, 'directEntryStackBounding');
              }

              window.directEntryBoundingBoxLeftEdge = boundingLeftEdge;
              window.directEntryBoundingBoxEdges = {
                left: boundingLeftEdge,
                right: boundingRightEdge,
                top: boundingTop,
                bottom: bottomY + padY
              };
              window.directEntryBoundingTopMargin = topMargin;
              if (typeof window.updateDirectEntryBoundingLine === 'function') {
                window.updateDirectEntryBoundingLine(boundingLeftEdge, boundingTop, boundingHeight);
              }
              window.pexaExtensions.boundingLeftEdge = boundingLeftEdge;
              window.pexaExtensions.boundingRightEdge = boundingRightEdge;
              stackBounding.leftEdge = boundingLeftEdge;
              stackBounding.rightEdge = boundingRightEdge;
              stackBounding.topMargin = topMargin;
              if (window.otherCardsHierarchy && window.otherCardsHierarchy.bounding) {
                window.otherCardsHierarchy.bounding.leftEdge = boundingLeftEdge;
                window.otherCardsHierarchy.bounding.rightEdge = boundingRightEdge;
              }

              // Update the CECS to bounding box lines with new positions
              if (window.cecsToAtmsBoundingLines && window.cecsToAtmsBoundingLines.length > 0 && window.cecsBoxData) {
                const cecsData = window.cecsBoxData;
                const cecsCenterY = cecsData.y + cecsData.height / 2;
                const cecsLeftX = cecsData.x; // Left side of CECS box
                const newLineEndX = boundingRightEdge - 2; // Right edge of updated bounding box
                const lineGap = 3;
                const lineOffsets = [-lineGap/2, lineGap/2];

                window.cecsToAtmsBoundingLines.forEach((line, idx) => {
                  if (line) {
                    line.setAttribute('x1', newLineEndX.toFixed(2)); // START at right edge of bounding box
                    line.setAttribute('y1', (cecsCenterY + lineOffsets[idx]).toFixed(2));
                    line.setAttribute('x2', cecsLeftX.toFixed(2)); // END at left side of CECS
                    line.setAttribute('y2', (cecsCenterY + lineOffsets[idx]).toFixed(2));
                  }
                });
              } else if (window.cecsToAtmsBoundingLine && window.cecsBoxData) {
                // Fallback for single line
                const cecsData = window.cecsBoxData;
                const cecsCenterY = cecsData.y + cecsData.height / 2;
                const cecsLeftX = cecsData.x;
                const newLineEndX = boundingRightEdge - 2;

                window.cecsToAtmsBoundingLine.setAttribute('x1', newLineEndX.toFixed(2));
                window.cecsToAtmsBoundingLine.setAttribute('x2', cecsLeftX.toFixed(2));
              }
              if (typeof window.positionDirectEntryLabel === 'function') {
                window.positionDirectEntryLabel();
              }
            }
            if (headerInfo && headerInfo.rect) {
              const padX = Number.isFinite(stackBounding?.padX) ? stackBounding.padX : 6;
              const padY = Number.isFinite(stackBounding?.padY) ? stackBounding.padY : 6;
              const headerGap = Number.isFinite(headerInfo.gap) ? headerInfo.gap : gapHalf;
              const headerGapNpp = Number.isFinite(headerInfo.gapFromNpp) ? headerInfo.gapFromNpp : 10;
              const headerHeight = Number.isFinite(headerInfo.height) ? headerInfo.height : stackedHeight;
              const headerLift = Number.isFinite(headerInfo.lift) ? headerInfo.lift : headerHeight * 4;

              // Use reduced width for the Direct Entry header box
              const headerWidth = stackWidth * 0.8;
              const headerX = baseX + (stackWidth - headerWidth) / 2 - padX;

              // Define child box dimensions first (needed for positioning calculation)
              const gap = 4; // Small gap between Direct Entry and its child boxes
              const boxHeight = headerHeight * 0.9;

              // Position to have same gap from IAC as IAC has from Mastercard
              // Get the IAC bounding box info
              const boundingPadY = 7 + 2; // Same as defined for IAC bounding box
              const iacBottom = visaY + reducedHeight + boundingPadY;
              const iacToMastercardGap = mastercardY - iacBottom;

              // Position BECN with same gap above IAC
              // Calculate where IAC top is
              const topMarginHeight = reducedHeight - 3; // Same as IAC box calculation (reduced by 3px)
              const stackTopY = atmsY;
              const stackBoundingTop = stackTopY - boundingPadY - topMarginHeight;

              // BECN+BECG are under Direct Entry, so we need to position Direct Entry appropriately
              // boxY = headerY + headerHeight + gap (where child boxes are)
              // We want: boxY + boxHeight = iacTop - iacToMastercardGap
              const iacTop = stackBoundingTop;
              const targetBecnBottom = iacTop - iacToMastercardGap;
              const headerY = targetBecnBottom - boxHeight - headerHeight - gap - 15; // Shifted up by 15px (removed the +3 adjustment)
              headerInfo.rect.setAttribute('x', headerX.toFixed(2));
              headerInfo.rect.setAttribute('y', headerY.toFixed(2));
              headerInfo.rect.setAttribute('width', (headerWidth + padX * 2).toFixed(2));
              headerInfo.rect.setAttribute('height', headerHeight.toFixed(2));
              if (headerInfo.text) {
                headerInfo.text.setAttribute('x', (headerX + (headerWidth + padX * 2) / 2).toFixed(2));
                headerInfo.text.setAttribute('y', (headerY + headerHeight / 2).toFixed(2));
              }
              headerInfo.lift = headerLift;
              window.pexaExtensions.stackHeader = headerInfo;

              // Now create the child boxes under Direct Entry with the updated position
              // gap and boxHeight already defined above for positioning calculation
              const spacing = 5;
              const boxY = headerY + headerHeight + gap;
              // Use reduced width for BECN and BECG boxes to match Direct Entry width
              const boxWidth = ((headerWidth + padX * 2) - spacing) / 2;

              // Calculate BPAY width and shift amount BEFORE creating boxes
              const bpayHeight = headerHeight + gap + boxHeight;
              const originalBpayWidth = bpayHeight; // Original square width
              const bpayWidth = boxWidth; // Same width as BECN box
              const bpayGap = 4; // Gap between BPAY and Direct Entry

              // Center the BPAY/DE/BECN/BECG group above ASX stack
              // Get ASX center position
              const asxCenter = window.asxBoxesAlignment ? window.asxBoxesAlignment.center :
                (window.asxGroupShiftAmount ? moneyMarketX + window.asxGroupShiftAmount : moneyMarketX);

              // Since BECN is in the middle of the group and has same width as BPAY and BECG,
              // we want BECN's center to align with ASX center
              // BECN is positioned at newHeaderX, so:
              // BECN center = newHeaderX + boxWidth/2 = asxCenter
              // Therefore: newHeaderX = asxCenter - boxWidth/2
              // Then shift right by BECN width (boxWidth)
              const newHeaderX = asxCenter - boxWidth / 2 + boxWidth;

              // BPAY should be to the left of Direct Entry/BECN
              const bpayX = newHeaderX - bpayGap - bpayWidth;

              // Update Direct Entry position first
              headerInfo.rect.setAttribute('x', newHeaderX.toFixed(2));
              if (headerInfo.text) {
                headerInfo.text.setAttribute('x', (newHeaderX + (headerWidth + padX * 2) / 2).toFixed(2));
              }
              // Update stored position for connection lines
              window.directEntryBox.x = newHeaderX;

              // Create or update first child box with shifted position
              if (!window.directEntryChild1) {
                window.directEntryChild1 = {
                  rect: createStyledRect(newHeaderX, boxY, boxWidth, boxHeight, {
                    fill: '#C41E3A', // Vivid maroon (match BECS box)
                    stroke: '#ffe0e0',
                    strokeWidth: '2.5',
                    rx: '4',
                    ry: '4'
                  }),
                  text: createStyledText(newHeaderX + boxWidth / 2, boxY + boxHeight / 2, 'BECN',
                    { fill: '#ffffff', fontSize: '12', dominantBaseline: 'middle' }),
                  x: newHeaderX,
                  y: boxY,
                  width: boxWidth,
                  height: boxHeight
                };
                labelsGroup.appendChild(window.directEntryChild1.rect);
                labelsGroup.appendChild(window.directEntryChild1.text);
              } else {
                window.directEntryChild1.rect.setAttribute('x', newHeaderX.toFixed(2));
                window.directEntryChild1.rect.setAttribute('y', boxY.toFixed(2));
                window.directEntryChild1.rect.setAttribute('width', boxWidth.toFixed(2));
                window.directEntryChild1.text.setAttribute('x', (newHeaderX + boxWidth / 2).toFixed(2));
                window.directEntryChild1.text.setAttribute('y', (boxY + boxHeight / 2).toFixed(2));
                // Update stored positions
                window.directEntryChild1.x = newHeaderX;
                window.directEntryChild1.y = boxY;
                window.directEntryChild1.width = boxWidth;
                window.directEntryChild1.height = boxHeight;
              }

              // Create or update second child box
              const box2X = newHeaderX + boxWidth + spacing;
              if (!window.directEntryChild2) {
                window.directEntryChild2 = {
                  rect: createStyledRect(box2X, boxY, boxWidth, boxHeight, {
                    fill: '#000000',  // Black fill (from GABS)
                    stroke: '#ff0000',  // Bright red border (from GABS)
                    strokeWidth: '2.5', // Match BECN border width
                    rx: '4',
                    ry: '4'
                  }),
                  text: createStyledText(box2X + boxWidth / 2, boxY + boxHeight / 2, 'BECG',
                    { fill: '#FFFFFF', fontSize: '12', dominantBaseline: 'middle' }),  // White text (from GABS)
                  x: box2X,
                  y: boxY,
                  width: boxWidth,
                  height: boxHeight
                };
                labelsGroup.appendChild(window.directEntryChild2.rect);
                labelsGroup.appendChild(window.directEntryChild2.text);
              } else {
                window.directEntryChild2.rect.setAttribute('x', box2X.toFixed(2));
                window.directEntryChild2.rect.setAttribute('y', boxY.toFixed(2));
                window.directEntryChild2.rect.setAttribute('width', boxWidth.toFixed(2));
                window.directEntryChild2.text.setAttribute('x', (box2X + boxWidth / 2).toFixed(2));
                window.directEntryChild2.text.setAttribute('y', (boxY + boxHeight / 2).toFixed(2));
                // Update stored positions
                window.directEntryChild2.x = box2X;
                window.directEntryChild2.y = boxY;
              }

              // Add BPAY box to the left of Direct Entry and BECN/BECG
              // bpayHeight, bpayWidth, bpayX, and positioning already calculated above
              const bpayY = headerY; // Aligned with top of Direct Entry

              // Create BPAY box with style matching eftpos
              const bpayBox = createStyledRect(bpayX, bpayY, bpayWidth, bpayHeight, {
                fill: 'rgb(80,58,130)', // Dark purple interior
                stroke: 'rgb(158,138,239)', // Light purple border
                strokeWidth: '2.5',
                rx: '12',
                ry: '12'
              });
              labelsGroup.appendChild(bpayBox);

              // Add BPAY label (white text)
              const bpayText = createStyledText(
                bpayX + bpayWidth / 2,
                bpayY + bpayHeight / 2,
                'BPAY',
                { fill: '#ffffff', fontSize: '14', fontWeight: 'bold' }
              );
              labelsGroup.appendChild(bpayText);

              // Store BPAY box data for connections
              window.bpayBoxData = {
                x: bpayX,
                y: bpayY,
                width: bpayWidth,
                height: bpayHeight
              };

              // Add horizontal purple lines from Direct Entry and BECN to BPAY
              // Horizontal line from Direct Entry (left edge middle) to BPAY (right edge)
              const directEntryMidY = headerY + headerHeight / 2;
              // Create double maroon line (thicker, not quite as thick as ASX)
              const bpayToDirectEntryLine1 = createStyledLine(
                newHeaderX, directEntryMidY - 2.5,
                bpayX + bpayWidth, directEntryMidY - 2.5,
                {
                  stroke: '#800020',
                  strokeWidth: '4',
                  strokeLinecap: 'round'
                }
              );
              labelsGroup.insertBefore(bpayToDirectEntryLine1, labelsGroup.firstChild);

              const bpayToDirectEntryLine2 = createStyledLine(
                newHeaderX, directEntryMidY + 2.5,
                bpayX + bpayWidth, directEntryMidY + 2.5,
                {
                  stroke: '#800020',
                  strokeWidth: '4',
                  strokeLinecap: 'round'
                }
              );
              labelsGroup.insertBefore(bpayToDirectEntryLine2, labelsGroup.firstChild);

              // Horizontal line from BECN (left edge middle) to BPAY (right edge)
              // Double maroon line to match DE to BPAY (thicker)
              const becnMidY = boxY + boxHeight / 2;
              const bpayToBecnLine1 = createStyledLine(
                newHeaderX, becnMidY - 2.5,
                bpayX + bpayWidth, becnMidY - 2.5,
                {
                  stroke: '#800020',
                  strokeWidth: '4',
                  strokeLinecap: 'round'
                }
              );
              labelsGroup.insertBefore(bpayToBecnLine1, labelsGroup.firstChild);

              const bpayToBecnLine2 = createStyledLine(
                newHeaderX, becnMidY + 2.5,
                bpayX + bpayWidth, becnMidY + 2.5,
                {
                  stroke: '#800020',
                  strokeWidth: '4',
                  strokeLinecap: 'round'
                }
              );
              labelsGroup.insertBefore(bpayToBecnLine2, labelsGroup.firstChild);

              // Curved lines from BECN and BECG to BECS (which is now labeled on APCS box)
              if (window.directEntryChild1 && window.directEntryChild2 && window.apcsBoxData) {
                // Common endpoint at APCS (labeled BECS) left edge midpoint
                const becsLeftX = window.apcsBoxData.x;
                const becsMidY = window.apcsBoxData.y + window.apcsBoxData.height / 2;

                // BECN to BECS curved line
                const becnBottomX = window.directEntryChild1.x + window.directEntryChild1.width / 2;
                const becnBottomY = window.directEntryChild1.y + window.directEntryChild1.height;

                // Calculate vertical midpoint between start and end for control points
                const verticalMidpoint = (becnBottomY + becsMidY) / 2;

                // Single thick red J-shaped curved path from BECN bottom to BECS left midpoint
                const becnToBecsPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const becnPathData = `M ${becnBottomX} ${becnBottomY} ` +
                  `Q ${becnBottomX} ${becsMidY}, ` + // Control point at corner
                  `${becsLeftX} ${becsMidY}`; // End at BECS
                becnToBecsPath.setAttribute('d', becnPathData);
                becnToBecsPath.setAttribute('stroke', '#ff073a');
                becnToBecsPath.setAttribute('stroke-width', '4');
                becnToBecsPath.setAttribute('fill', 'none');
                becnToBecsPath.setAttribute('stroke-linecap', 'round');
                labelsGroup.insertBefore(becnToBecsPath, labelsGroup.firstChild);

                // BECG to BECS curved line
                const becgBottomX = window.directEntryChild2.x + window.directEntryChild2.width / 2;
                const becgBottomY = window.directEntryChild2.y + window.directEntryChild2.height;

                // Single thick red J-shaped curved path from BECG bottom to BECS left midpoint
                const becgToBecsPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const becgPathData = `M ${becgBottomX} ${becgBottomY} ` +
                  `Q ${becgBottomX} ${becsMidY}, ` + // Control point at corner
                  `${becsLeftX} ${becsMidY}`; // End at BECS
                becgToBecsPath.setAttribute('d', becgPathData);
                becgToBecsPath.setAttribute('stroke', '#ff073a');
                becgToBecsPath.setAttribute('stroke-width', '4');
                becgToBecsPath.setAttribute('fill', 'none');
                becgToBecsPath.setAttribute('stroke-linecap', 'round');
                labelsGroup.insertBefore(becgToBecsPath, labelsGroup.firstChild);
              }
            }

            // XXX-to-ADI line update removed
            // if (typeof window.updateXXXToAdiLine === 'function') {
            //   window.updateXXXToAdiLine();
            // }
            if (typeof window.updateDirectEntryToAdiLine === 'function') {
              window.updateDirectEntryToAdiLine();
            }
            if (typeof window.updateOskoToAdiLine === 'function') {
              window.updateOskoToAdiLine();
            }

            if (typeof window.updateCardLeftLines === 'function') {
              window.updateCardLeftLines();
            }

            const actualGap = pexaConveyY - (eftposY + stackedHeight);
            window.pexaExtensions.gap = actualGap;
            window.pexaExtensions.baseX = baseX;
            window.pexaExtensions.reducedHeight = reducedHeight;

            const eftposStartX = baseX + stackWidth;
            const eftposEndX = window.hexagonPositions.mastercardX;
            const eftposMidY = eftposY + stackedHeight / 2;
            const offsets = [-1.5, 1.5];
            if (window.pexaExtensions.eftposLines) {
              window.pexaExtensions.eftposLines.forEach((line, idx) => {
                if (!line) return;
                const offset = offsets[idx] !== undefined ? offsets[idx] : 0;
                line.setAttribute('x1', eftposStartX.toFixed(2));
                line.setAttribute('y1', (eftposMidY + offset).toFixed(2));
                line.setAttribute('x2', eftposEndX.toFixed(2));
                line.setAttribute('y2', (eftposMidY + offset).toFixed(2));
              });
            }

            const mastercardStartX = baseX + stackWidth;
            const mastercardEndX = window.hexagonPositions.mastercardX;
            const mastercardMidY = mastercardY + stackedHeight / 2;
            if (window.pexaExtensions.mastercardLines) {
            window.pexaExtensions.mastercardLines.forEach((line, idx) => {
              if (!line) return;
              const offset = offsets[idx] !== undefined ? offsets[idx] : 0;
              line.setAttribute('x1', mastercardStartX.toFixed(2));
              line.setAttribute('y1', (mastercardMidY + offset).toFixed(2));
              line.setAttribute('x2', mastercardEndX.toFixed(2));
              line.setAttribute('y2', (mastercardMidY + offset).toFixed(2));
            });
          }
          if (typeof window.updateOskoLine === 'function') {
            window.updateOskoLine();
          }
        }

        if (window.pexaHorizontalLines && window.pexaHorizontalLines.length) {
            const pexaStart = newPexaConveyX + pexaConveyWidth;
            let pexaEnd = pexaStart;
            if (window.hexagonPositions) {
              pexaEnd = window.hexagonPositions.pexaX;
            }
            const pexaYCenter = pexaConveyY + pexaConveyHeight / 2;
            const offsets = [-1.5, 1.5]; // Double lines (gap = 1.5 to match curved lines)
            window.pexaHorizontalLines.forEach((line, idx) => {
              if (!line) return;
              const offset = offsets[idx] !== undefined ? offsets[idx] : 0;
              line.setAttribute('x1', pexaStart.toFixed(2));
              line.setAttribute('y1', (pexaYCenter + offset).toFixed(2));
              line.setAttribute('x2', pexaEnd.toFixed(2));
              line.setAttribute('y2', (pexaYCenter + offset).toFixed(2));
            });
          }
        }

        // Use the original values for the label positioning
        const newAsxBoxX = asxBoxX;
        const newAsxBoxWidth = asxBoxWidth;

        // Add ASX label at bottom
        const asxLabel = createStyledText(
          asxBoxX + asxBoxWidth / 2,
          asxBoxY + asxBoxHeight - 19, // Moved down by 3 pixels (was -22, now -19)
          'ASX',
          {
            fill: '#e8ecf7', // Swapped text color
            fontSize: '26', // Bigger font size
            fontWeight: 'normal' // Explicitly set to normal weight
          }
        );
        labelsGroup.appendChild(asxLabel);

        // Add blue line from ASX bounding box to under SWIFT HVCS
        if (window.asxBoxData && window.asxBoxData.needsLine && window.hvcsLineData) {
          const asxToHvcsLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');

          // Start from center bottom of ASX bounding box
          const asxLineStartX = asxBoxX + (asxBoxWidth / 2); // Center of box
          const asxLineStartY = asxBoxY + asxBoxHeight; // Bottom edge of box

          // Get SWIFT HVCS position from stored data
          const hvcsLineY_update = window.hvcsLineData.startY;
          const horizontalY = hvcsLineY_update  ; // Blue line 8px below green line

          // Simple path: straight down then curve right
          const cornerRadius = 100;
          const goDownDistance = 175; // How far down to go - increased to move below green line

          // Store line data for later use by non-ADIs curve
          if (!window.asxLineData) window.asxLineData = {};
          window.asxLineData.horizontalY = asxLineStartY + goDownDistance + cornerRadius;
          window.asxLineData.startX = asxLineStartX;
          window.asxLineData.startY = asxLineStartY;
          window.asxLineData.cornerRadius = cornerRadius;
          window.asxLineData.horizontalLength = 150;
          window.asxLineData.goDownDistance = goDownDistance;

          const asxPath = `M ${asxLineStartX} ${asxLineStartY} ` +
                        `L ${asxLineStartX} ${asxLineStartY + goDownDistance} ` + // Go straight down
                        `Q ${asxLineStartX} ${asxLineStartY + goDownDistance + cornerRadius}, ` +
                        `${asxLineStartX + cornerRadius} ${asxLineStartY + goDownDistance + cornerRadius} ` + // Curve right
                        `L ${asxLineStartX + 150} ${asxLineStartY + goDownDistance + cornerRadius}`; // Extend right

          const asxToHvcsLineStyled = createStyledPath(asxPath, {
            stroke: '#009fff',
            strokeWidth: '6',
            fill: 'none',
            strokeLinecap: 'round',
            id: 'asx-to-hvcs-line'
          });
          blueLinesGroup.appendChild(asxToHvcsLineStyled);
          window.asxLineData.pathElement = asxToHvcsLineStyled;
          window.asxLineData.neonAdjusted = false;

          // Add third blue line from ASX box (60% from right) curving into ADIs
          const asxToAdiLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');

          // Start from center bottom of ASX bounding box (same as first line)
          const asxLine2StartX = asxBoxX + (asxBoxWidth / 2); // Center of box
          const asxLine2StartY = asxBoxY + asxBoxHeight; // Bottom edge of box

          // Same initial path structure as first blue line but go deeper
          const extraDownForRightLine = 0; // Extra distance to put right line below left line - reduced by 5
          const asxPath2 = `M ${asxLine2StartX} ${asxLine2StartY} ` +
                        `L ${asxLine2StartX} ${asxLine2StartY + goDownDistance + extraDownForRightLine} ` + // Go straight down (extra to separate from first line)
                        `Q ${asxLine2StartX} ${asxLine2StartY + goDownDistance + extraDownForRightLine + cornerRadius}, ` +
                        `${asxLine2StartX + cornerRadius} ${asxLine2StartY + goDownDistance + extraDownForRightLine + cornerRadius} ` + // Curve right
                        `L ${asxLine2StartX + 150} ${asxLine2StartY + goDownDistance + extraDownForRightLine + cornerRadius}`; // Extend right

          const asxToAdiLineStyled = createStyledPath(asxPath2, {
            stroke: '#009fff',
            strokeWidth: '6',
            fill: 'none',
            strokeLinecap: 'butt', // Square cap so it doesn't show at box edge
            id: 'asx-to-adi-line'
          });
          blueLinesGroup.appendChild(asxToAdiLineStyled);
          if (!window.asxLine2Data) window.asxLine2Data = {};
          window.asxLine2Data.pathElement = asxToAdiLineStyled;
          window.asxLine2Data.neonAdjusted = false;

          // Store line data for later extension
          window.asxLine2Data.horizontalY = asxLine2StartY + goDownDistance + extraDownForRightLine + cornerRadius;
          window.asxLine2Data.startX = asxLine2StartX;
          window.asxLine2Data.startY = asxLine2StartY;
          window.asxLine2Data.cornerRadius = cornerRadius;
          window.asxLine2Data.horizontalLength = 150;
          window.asxLine2Data.extraDown = extraDownForRightLine;
          window.asxLine2Data.baseGoDownDistance = goDownDistance;
        }

        // Add blue line connecting clearing/netting to ASX Settlement
        const blueLineColor = '#009fff'; // Same as austraclear lines

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

        // Create double yellow line style like other ASXB connections
        const clearingToAsxPath1 = createStyledPath(pathData, {
          stroke: '#ab20fd', // Purple matching ASXB right side lines
          strokeWidth: '2.5', // Exact same width as drawCurvedDoubleLine
          fill: 'none'
        });
        labelsGroup.appendChild(clearingToAsxPath1);

        // Create second yellow line with offset for double line effect
        const pathData2 = `M ${clearingRightX} ${clearingCenterY + 3}
                         C ${clearingRightX + controlOffset} ${clearingCenterY + 3},
                           ${asxSettlementLeftX - controlOffset} ${asxSettlementCenterY + 3},
                           ${asxSettlementLeftX} ${asxSettlementCenterY + 3}`;

        const clearingToAsxPath2 = createStyledPath(pathData2, {
          stroke: '#ab20fd', // Purple matching ASXB right side lines
          strokeWidth: '2.5', // Exact same width as drawCurvedDoubleLine
          fill: 'none'
        });
        labelsGroup.appendChild(clearingToAsxPath2);

        // Calculate the 1/3 point on ASXF box using the UPDATED position
        const sympliCenterY = sympliY + sympliHeight / 2;
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
        // Use the updated position if available
        const actualPexaConveyX = window.newPexaConveyX !== undefined ? window.newPexaConveyX : pexaConveyX;
        const actualPexaConveyWidth = window.newPexaConveyWidth !== undefined ? window.newPexaConveyWidth : pexaConveyWidth;
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
          asxSettlementTextElement.setAttribute('fill', '#0055FF'); // Ensure text color is set
          asxSettlementTextElement.setAttribute('font-size', '12'); // Ensure font size is set
          asxSettlementTextElement.style.visibility = 'visible'; // Also set CSS visibility
          asxSettlementTextElement.style.display = 'block'; // Ensure not hidden
        } else {
          console.log('ASX Settlement text element not found!');
        }

        // Add yellow double lines from eftpos (right) to ESSB (left) and Mastercard (right) to MCAU (left)
        if (window.hexagonPositions) {
          // Get stacked box positions (right side)
          const stackedHeight = pexaConveyHeight;
          const boxWidth = window.hexagonPositions.mastercardWidth;
          const centerX = pexaConveyX + pexaConveyWidth / 2;
          const baseX = centerX - boxWidth / 2;

          // Calculate Y positions for stacked boxes
          const sympliBottom = sympliY + sympliHeight;
          let gapSympliPexa = pexaConveyY - sympliBottom;
          if (!Number.isFinite(gapSympliPexa) || gapSympliPexa <= 0) {
            gapSympliPexa = 12; // fallback
          }

          const baseEftposY = pexaConveyY - gapSympliPexa - stackedHeight;
          const essbY = window.hexagonPositions.eftposY;
          const shift = essbY - baseEftposY;
          const stackedEftposY = baseEftposY + shift;
          const stackedMastercardY = stackedEftposY - gapSympliPexa - stackedHeight;

          // Yellow/orange double lines from eftpos to ESSB
          const eftposLineGap = 3;
          const eftposLineColor = '#ab20fd'; // Orange color to match other admin lines
          const eftposLineOffsets = [-eftposLineGap / 2, eftposLineGap / 2];

          // From right side of eftpos (stacked) to left side of ESSB box
          const eftposStartX = baseX + boxWidth; // Right edge of stacked eftpos
          const eftposEndX = widerAdminBoxX; // Left edge of ESSB box
          const eftposLineY = stackedEftposY + stackedHeight / 2;

          eftposLineOffsets.forEach((offset) => {
            const line = createStyledLine(
              eftposStartX,
              eftposLineY + offset,
              eftposEndX,
              eftposLineY + offset,
              {
                stroke: eftposLineColor,
                strokeWidth: '2',
                strokeLinecap: 'round'
              }
            );
            adminLinesGroup.appendChild(line);
          });

          // Yellow double lines from Mastercard to MCAU
          const mastercardLineY = stackedMastercardY + stackedHeight / 2;

          eftposLineOffsets.forEach((offset) => {
            const line = createStyledLine(
              eftposStartX, // Same X as eftpos
              mastercardLineY + offset,
              eftposEndX, // Same end X as eftpos
              mastercardLineY + offset,
              {
                stroke: eftposLineColor,
                strokeWidth: '2',
                strokeLinecap: 'round'
              }
            );
            adminLinesGroup.appendChild(line);
          });
        }

        // Removed the Visa-PEXA connection line
        // Horizontal line connecting SSS/CCP to DvP RTGS
        const sssCcpLineY = sssCcpY + smallRectHeight * 0.9 / 2; // Middle of SSS/CCP box
        const sssCcpLine = createStyledLine(
          alignedSssCcpX + alignedSssCcpWidth, sssCcpLineY,
          dvpRtgsX, sssCcpLineY,
          {
            stroke: austraclearLineColor,
            strokeWidth: austraclearLineWidth,
            strokeLinecap: 'round'
          }
        );
        svg.insertBefore(sssCcpLine, labelsGroup);

        // Get the actual trade-by-trade width and position for the dotted line
        const actualTradeByTradeWidth = rectWidth;
        const actualTradeByTradeX = window.asxBoxesAlignment ? 
          window.asxBoxesAlignment.center - (actualTradeByTradeWidth / 2) : 
          moneyMarketX;

        // Add dotted line from DvP RTGS (right edge) to trade-by-trade (left edge) at CHESS-RTGS center height
        const chessRtgsCenterY = chessY + smallRectHeight / 2; // Center Y of CHESS-RTGS
        const dvpRtgsRightX = dvpRtgsX + rectWidth / 4; // Right edge of DvP RTGS (it has 1/4 width)

        const dottedLine = createStyledLine(
          dvpRtgsRightX, chessRtgsCenterY,
          actualTradeByTradeX, chessRtgsCenterY,
          {
            stroke: austraclearLineColor,
            strokeWidth: austraclearLineWidth,
            strokeLinecap: 'round',
            strokeDasharray: '5,5'
          }
        );
        svg.insertBefore(dottedLine, labelsGroup);




        // Rectangle above SWIFT box
        // CLS AUD uses adjusted position if available
        const clsAudYFinal = window.clsAudAdjustedY || clsAudY;
        const bottomRect = createStyledRect(rectX, clsAudYFinal, swiftRectWidth, smallRectHeight, {
          fill: '#5dd9b8',  // Green SWIFT line color
          stroke: '#ffffff', // Very thin white border
          strokeWidth: '0.5'
          // Square corners - no rx/ry
        });
        bottomRect.setAttribute('id', 'cls-aud-rect'); // Add ID for later reference
        labelsGroup.appendChild(bottomRect);

        // Debug log CLS AUD box actual position
        console.log('CLS AUD box actual position:', {
          x: rectX,
          y: clsAudYFinal,
          width: swiftRectWidth,
          height: smallRectHeight,
          rightEdgeX: rectX + swiftRectWidth,
          topY: clsAudYFinal,
          centerY: clsAudYFinal + smallRectHeight / 2,
          bottomY: clsAudYFinal + smallRectHeight
        });

        // Add label to bottom rectangle
        const bottomText = createStyledText(
          rectX + swiftRectWidth / 2,
          clsAudYFinal + smallRectHeight / 2,
          'CLS AUD',
          {
            fill: '#063d38', // Dark text (swapped)
            fontSize: '12', // Smaller font size
            dominantBaseline: 'middle', // Ensure vertical centering
            textAnchor: 'middle' // Ensure horizontal centering
          }
        );
        labelsGroup.appendChild(bottomText);

        // CLS AUD to RITS line will be added at the end of script after all adjustments

        // Add connecting lines between the three left boxes and SWIFT PDS box
        const lineColor = '#5dd9b8'; // Brighter shade
        const lineWidth = '6'; // Thick lines matching other thick lines
        // const hvcsShift = 15; // Already declared above


        // Connecting lines will be added after SWIFT HVCS final positioning

        // SWIFT HVCS connecting lines removed

        // Removed horizontal line connecting pacs.009 to CLS AUD

        // Add curved lines from right side of boxes to big blue circle
        const curvedLineGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        curvedLineGroup.setAttribute('id', 'swift-to-circle-curves');

        // Store curved lines for later updates
        window.swiftToCurves = [];

        // Get big blue circle position
        const bigCircleX = 300; // cx value
        const bigCircleY = 450; // cyBig value
        const bigCircleRadius = 113; // rBig value

        // Create curved lines from the boxes
        // Use adjusted position if available, otherwise use calculated position
        const rectYForCurves = window.swiftGroupAdjustedY || rectY;
        const clsAudYForCurves = window.clsAudAdjustedY || clsAudY;

        // Log the Y coordinates where lines touch SWIFT PDS
        console.log('SWIFT PDS box position:', {
          top: rectYForCurves,
          bottom: rectYForCurves + rectHeight,
          height: rectHeight,
          rightEdgeX: rectX + swiftRectWidth
        });

        // Calculate positions at 1/6, 1/2, and 5/6 of SWIFT PDS height
        const swiftPdsTop = rectYForCurves;
        const swiftPdsHeightForLines = rectHeight;
        const line1Y = swiftPdsTop + swiftPdsHeightForLines * (1/6); // 1/6 way down
        const line2Y = swiftPdsTop + swiftPdsHeightForLines * 0.5;   // 1/2 way down
        const line3Y = swiftPdsTop + swiftPdsHeightForLines * (5/6); // 5/6 way down

        console.log('Lines touching SWIFT PDS right edge at Y coordinates:', {
          line1: line1Y,
          line2: line2Y,
          line3: line3Y,
          swiftPdsTop: swiftPdsTop,
          swiftPdsHeight: swiftPdsHeight
        });

        const curveSources = [
          // Three lines from SWIFT box at 1/4, 1/2, 3/4 height
          { x: rectX + swiftRectWidth, y: line1Y },
          { x: rectX + swiftRectWidth, y: line2Y },
          { x: rectX + swiftRectWidth, y: line3Y },
          // Line from CLS AUD
          { x: rectX + swiftRectWidth, y: clsAudYForCurves + smallRectHeight / 2 },
          // Two lines from Austraclear
          { x: baseX + rectWidth, y: austraclearY + austraclearHeight / 3 },
          { x: baseX + rectWidth, y: austraclearY + 2 * austraclearHeight / 3 },
          // One line from CHESS-RTGS
          { x: chessBoxX + chessBoxWidth, y: chessY + smallRectHeight / 2 }
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
            // Skip the normal curve path for CLS AUD - we'll draw it separately
            d = ''; // Empty path
          } else {
            d = `M ${source.x} ${source.y} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;
          }

          // Use blue color for Austraclear and CHESS-RTGS lines (indices 4, 5, 6)
          // Use neon yellow for CLS AUD line (index 3)
          let strokeColor;
          if (i === 3) {
            strokeColor = '#00FF33'; // Neon green for CLS AUD
          } else if (i >= 4) {
            strokeColor = austraclearLineColor;
          } else {
            strokeColor = lineColor;
          }
          // Make CLS AUD and SWIFT PDS lines thicker (6), Austraclear/CHESS lines medium (4), others thin (3)
          let strokeWidth;
          if (i === 3 || i < 3) {
            strokeWidth = '6'; // CLS AUD and SWIFT PDS lines
          } else if (i >= 4 && i <= 6) {
            strokeWidth = '4'; // Austraclear and CHESS lines matching ASX
          } else {
            strokeWidth = '3'; // Other lines
          }

          // Only create path if d is not empty
          if (d) {
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

            // Store the first three paths (SWIFT PDS lines) for updates
            if (i < 3) {
              window.swiftToCurves.push(path);
            }
          }
        });

        // Draw simple horizontal CLS AUD line
        const clsAudRect = document.getElementById('cls-aud-rect');
        console.log('CLS AUD line check:', {
          clsAudRect: !!clsAudRect,
          swiftHvcsElements: !!window.swiftHvcsElements,
          boundingBox: !!(window.swiftHvcsElements && window.swiftHvcsElements.boundingBox)
        });

        if (clsAudRect && window.swiftHvcsElements && window.swiftHvcsElements.boundingBox) {
          const swiftHvcsRect = window.swiftHvcsElements.boundingBox;
          const clsBoxX = parseFloat(clsAudRect.getAttribute('x'));
          const clsBoxY = parseFloat(clsAudRect.getAttribute('y'));
          const clsStartY = clsBoxY + smallRectHeight / 2; // Center of CLS AUD box

          // Get SWIFT HVCS right edge
          const hvcsX = parseFloat(swiftHvcsRect.getAttribute('x'));
          const hvcsWidth = parseFloat(swiftHvcsRect.getAttribute('width'));
          const hvcsRightEdge = hvcsX + hvcsWidth;

          // Get SWIFT HVCS dimensions for curving around it
          const hvcsY = parseFloat(swiftHvcsRect.getAttribute('y'));
          const hvcsHeight = parseFloat(swiftHvcsRect.getAttribute('height'));
          const hvcsBottomY = hvcsY + hvcsHeight;

          // Create a path that curves around SWIFT HVCS box
          // Start from CLS AUD left edge, go left, then down along SWIFT HVCS left side, then right under it
          const cornerRadius = 15; // Radius for rounded corners
          const leftPadding = 10; // Distance from SWIFT HVCS left edge (reduced from 20 to match bottom)
          const bottomPadding = 10; // Distance below SWIFT HVCS bottom (reduced from 20)

          // Get SWIFT PDS right edge
          const swiftPdsRect = swiftRect; // We already have reference to SWIFT PDS rect
          const swiftPdsX = parseFloat(swiftPdsRect.getAttribute('x'));
          const swiftPdsWidth = parseFloat(swiftPdsRect.getAttribute('width'));
          const swiftPdsRightEdge = swiftPdsX + swiftPdsWidth;

          const pathStartX = clsBoxX;
          const pathStartY = clsStartY;
          const verticalX = hvcsX - leftPadding; // X position for vertical segment
          const turnY1 = clsStartY; // Y position where we start turning down
          const turnY2 = hvcsBottomY + bottomPadding; // Y position where we turn right
          const pathEndX = swiftPdsRightEdge; // Extend to SWIFT PDS right edge

          // Create path with smooth corners
          const clsPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          const pathData = `M ${pathStartX} ${pathStartY} ` + // Start at CLS AUD
                         `L ${verticalX + cornerRadius} ${pathStartY} ` + // Go left to corner
                         `Q ${verticalX} ${pathStartY}, ${verticalX} ${pathStartY + cornerRadius} ` + // Round corner down
                         `L ${verticalX} ${turnY2 - cornerRadius} ` + // Go down along left side
                         `Q ${verticalX} ${turnY2}, ${verticalX + cornerRadius} ${turnY2} ` + // Round corner right
                         `L ${pathEndX} ${turnY2}`; // Go right under SWIFT HVCS

          clsPath.setAttribute('d', pathData);
          clsPath.setAttribute('stroke', '#00FF33'); // Neon green
          clsPath.setAttribute('stroke-width', '6');
          clsPath.setAttribute('fill', 'none');
          clsPath.setAttribute('stroke-linecap', 'round');
          clsPath.setAttribute('stroke-linejoin', 'round');
          clsPath.setAttribute('id', 'cls-aud-line-new');

          curvedLineGroup.appendChild(clsPath);

          // Store CLS AUD endpoint for sigmoid curve
          if (!window.clsEndpoints) {
            window.clsEndpoints = {};
          }
          window.clsEndpoints.audLineEndX = pathEndX;
          window.clsEndpoints.audLineEndY = turnY2;
          window.clsEndpoints.neonLineEndX = pathEndX;
          window.clsEndpoints.neonLineEndY = turnY2;
          adjustAsxBlueLinesToNeonSpacing();
          console.log('Stored CLS AUD endpoint:', {audLineEndX: pathEndX, audLineEndY: turnY2});
          // S-curve will be drawn at the end when we have both endpoints
        }

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
      } // End of special handling when i === 0

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

        // Create orange line from orange dot to center of small orange circle
        const orangeLine = createStyledLine(cx, cySmall, innerCircleX, innerCircleY, {
          stroke: '#FFFF00',
          strokeWidth: '2.5',
          opacity: '1'
        });
        // For RBA dot (i=0), insert before big-group so line renders over black circle but under FSS
        if (i === 0) {
          const bigGroup = document.getElementById('big-group');
          if (bigGroup && bigGroup.parentNode) {
            bigGroup.parentNode.insertBefore(orangeLine, bigGroup);
          } else {
            orangeLinesGroup.appendChild(orangeLine);
          }
          // Make RBA yellow line interactive
          if (typeof makeInteractive === 'function') {
            makeInteractive(orangeLine, 'rba-yellow-line');
          }
        } else {
          orangeLinesGroup.appendChild(orangeLine);
        }

        const orangeCircle = createStyledCircle(innerCircleX, innerCircleY, orangeCircleRadius, {
          fill: '#FFFF00',
          stroke: '#ffffff',
          strokeWidth: '1'
        });
        // For RBA dot (i=0), insert before big-group so dot renders over line but under FSS
        if (i === 0) {
          const bigGroup = document.getElementById('big-group');
          if (bigGroup && bigGroup.parentNode) {
            bigGroup.parentNode.insertBefore(orangeCircle, bigGroup);
          } else {
            circlesGroup.appendChild(orangeCircle);
          }
          // Make RBA yellow dot interactive
          if (typeof makeInteractive === 'function') {
            makeInteractive(orangeCircle, 'rba-yellow-dot');
          }
        } else {
          circlesGroup.appendChild(orangeCircle);
        }
      }

      // Dot positions are now stored outside the if block

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
        92: "Adyen Australia Pty Limited",
        93: "EFTEX Pty Limited",
        94: "First Data Network Australia Limited",
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
        } else if (i === 92) {
          // Adyen Australia - align with dot
          labelX = actualCircleX + 25;
          labelY = actualCircleY - 6;
        } else if (i === 93) {
          // EFTEX - just below Adyen
          labelX = actualCircleX + 25;
          labelY = window.dotPositions[92] ? window.dotPositions[92].y + 6 : actualCircleY + 6;
        } else if (i === 94) {
          // First Data Network - below EFTEX
          labelX = actualCircleX + 25;
          labelY = window.dotPositions[92] ? window.dotPositions[92].y + 16 : actualCircleY + 16;
        } else if (i === 96) {
          // ASX Settlement - level with its dot
          labelX = actualCircleX + 35; // Align horizontally
          labelY = actualCircleY - 2; // Same Y as dot, raised by 2 pixels
        } else if (i === 97) {
          // ASX Clearing - one line below ASX Settlement
          labelX = actualCircleX + 35; // Same X position
          labelY = window.dotPositions[96] ? window.dotPositions[96].y + 10 - 2 : actualCircleY + 10 - 2; // Raised by 2 pixels
        } else if (i === 98) {
          // LCH Limited - one line below ASX Clearing
          labelX = actualCircleX + 35; // Same X position
          labelY = window.dotPositions[96] ? window.dotPositions[96].y + 20 - 2 : actualCircleY + 20 - 2; // Raised by 2 pixels
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
              stroke: '#ffffff',
              strokeWidth: '0.5',
              fill: 'none'
            }
          );
          labelsGroup.appendChild(path);
        } else {
          // Regular straight line for other labels
          const pointerLine = createStyledLine(
            actualCircleX + dotRadius, actualCircleY,
            labelX - 5, labelY,
            {
              stroke: '#ffffff',
              strokeWidth: '0.5'
            }
          );
          labelsGroup.insertBefore(pointerLine, labelsGroup.firstChild);
        }

        // Add text label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', labelX);
        text.setAttribute('y', labelY);
        text.setAttribute('text-anchor', 'start');
        text.setAttribute('dominant-baseline', 'middle');
        // All labels white
        text.setAttribute('fill', '#ffffff'); // white for all ESA account labels
        text.setAttribute('font-family', 'Arial, sans-serif');
        text.setAttribute('font-size', '10');
        text.textContent = label;
        labelsGroup.appendChild(text);
      } // End of if (dotLabels[i])
    } // End of main for loop (let i = 0; i < numCircles; i++)

  if ((!window.clsPositions || !window.clsEndpoints || !window.clsEndpoints.dotLineEndX) && window.dotPositions && window.dotPositions[99]) {
    const clsDot = window.dotPositions[99];
    const clsRadius = smallCircleRadius * 12;
    const clsStartX = clsDot.x - clsRadius;
    const clsStartY = clsDot.y;
    const baseDistance = 87;
    const clsEndX = clsStartX - baseDistance;
    const clsEndY = clsStartY;
    if (!window.clsPositions) {
      window.clsPositions = {
        startX: clsStartX,
        startY: clsStartY,
        endX: clsEndX,
        endY: clsEndY
      };
    }
    if (!window.clsEndpoints) {
      window.clsEndpoints = {};
    }
    window.clsEndpoints.dotLineEndX = clsEndX;
    window.clsEndpoints.dotLineEndY = clsEndY;
    window.clsPositions.startX = clsStartX;
    window.clsPositions.startY = clsStartY;
    window.clsPositions.endX = clsEndX;
    window.clsPositions.endY = clsEndY;
    console.log('CLS fallback position calculated from dot data:', window.clsPositions);
  }

  if (window.clsEndpoints && !window.clsEndpoints.audLineEndX && window.clsPositions) {
    window.clsEndpoints.audLineEndX = window.clsPositions.endX;
    window.clsEndpoints.audLineEndY = window.clsPositions.endY;
    console.log('CLS fallback AUD line endpoints set from dot data:', window.clsEndpoints);
  }

  // Add BDF square for dots 50-53
  if (window.dotPositions && window.dotPositions[50] && window.dotPositions[53]) {
      const squareSize = 60; // 50% larger (was 40)
      // Calculate position for BDF square (moved further right)
      // Add RBA red border now that all positions are set
      if (window.addRbaRedBorder) {
        window.addRbaRedBorder();
      }

      const bdfX = window.dotPositions[50].x + 60 + squareSize/2; // Moved further right
      const bdfY = (window.dotPositions[50].y + window.dotPositions[53].y) / 2 + 60; // Shifted down by 60px (was 55)

      // Create square with lighter red fill and dark red border
      const bdfSquare = createStyledRect(bdfX - squareSize/2, bdfY - squareSize/2, squareSize, squareSize, {
        fill: '#000000', // black fill
        stroke: '#ff0000', // bright red border
        strokeWidth: '3.5'
        // No rx/ry = square corners
      });
      labelsGroup.appendChild(bdfSquare);

      const bdfLabel = createStyledText(
        bdfX,
        bdfY,
        'BDF',
        {
          fill: '#ffffff',
          fontSize: '24',
          fontWeight: 'bold'
        }
      );
      bdfLabel.setAttribute('text-anchor', 'middle');
      bdfLabel.setAttribute('dominant-baseline', 'middle');
      labelsGroup.appendChild(bdfLabel);

      // Add OPA box to the left of RBA dot
      if (window.dotPositions && window.dotPositions[0]) {
        const opaBoxSize = 45; // 25% smaller than BDF box (60 * 0.75 = 45)
        const rbaX = window.dotPositions[0].x;
        const rbaY = window.dotPositions[0].y;

        // Position OPA box closer to ESAs edge
        // If ESAs box data is available, position relative to its right edge
        let opaX;
        if (window.esasBoxData) {
          const esasRightEdge = window.esasBoxData.x + window.esasBoxData.width;
          opaX = esasRightEdge + 40; // 40px from ESAs right edge
        } else {
          opaX = rbaX - 100; // Fallback position
        }
        const opaY = rbaY;

        // Create the black OPA box
        const opaSquare = createStyledRect(
          opaX - opaBoxSize/2,
          opaY - opaBoxSize/2,
          opaBoxSize,
          opaBoxSize,
          {
            fill: '#000000',
            stroke: '#ff0000',
            strokeWidth: '3.5',
            rx: '0',
            ry: '0'
          }
        );
        labelsGroup.appendChild(opaSquare);

        // Make OPA box interactive
        if (typeof makeInteractive === 'function') {
          makeInteractive(opaSquare, 'opa-box');
        }

        // Add OPA label
        const opaLabel = createStyledText(
          opaX,
          opaY,
          'OPA',
          {
            fill: '#ffffff',
            fontSize: '16',
            fontWeight: 'bold'
          }
        );
        opaLabel.setAttribute('text-anchor', 'middle');
        opaLabel.setAttribute('dominant-baseline', 'middle');
        labelsGroup.appendChild(opaLabel);

        // Make OPA label interactive
        if (typeof makeInteractive === 'function') {
          makeInteractive(opaLabel, 'opa-label');
        }

        // Draw red horizontal line from OPA box to edge of RBA red circle
        // RBA circle has radius stored in window.rbaCircleInfo
        const rbaRadius = window.rbaCircleInfo ? window.rbaCircleInfo.radius : 0;
        const redLineEndX = rbaX - rbaRadius; // Stop at left edge of circle
        const opaLine = createStyledLine(
          opaX + opaBoxSize/2, opaY,
          redLineEndX, rbaY,
          {
            stroke: '#ff0000',
            strokeWidth: '2'
          }
        );
        labelsGroup.appendChild(opaLine);

        // Make OPA line interactive
        if (typeof makeInteractive === 'function') {
          makeInteractive(opaLine, 'opa-to-rba-line');
        }
      }

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
              stroke: '#ff0000', // bright red
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
          const angleToCenter = Math.atan2(dy, dx);

          const endX = bigCircleX - bigCircleRadius * Math.cos(angleToCenter);
          const endY = bigCircleY - bigCircleRadius * Math.sin(angleToCenter);

          const distX = endX - source.x;
          const distY = endY - source.y;

          const controlX1 = source.x + Math.abs(distX) * 0.7;
          const controlY1 = source.y;
          const controlX2 = endX - 10;
          const controlY2 = source.y + distY * 0.5;

          const pathData = `M ${source.x} ${source.y} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;
          const path = createStyledPath(pathData, {
            stroke: darkRedLineColor,
            strokeWidth: '2',
            fill: 'none',
            strokeLinecap: 'round'
          });
          labelsGroup.appendChild(path);
        });
      }
  } // End of if (window.dotPositions && window.dotPositions[50] && window.dotPositions[53])


  // Draw refreshed double lines from admin boxes into RITS once positions are ready
  const removeAdminLines = group => {
    if (!group) {
      return;
    }
    const existing = group.querySelectorAll('.admin-double-line');
    existing.forEach(line => line.remove());
  };

  removeAdminLines(redLinesGroup);
  removeAdminLines(yellowLinesGroup);

  const drawCurvedDoubleLine = (startX, startY, strokeColor, targetGroup) => {
    if (!targetGroup) {
      return;
    }

    const dx = cx - startX;
    const dy = cyBig - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance === 0) {
      return;
    }

    const endX = cx - ((rBig - 20) * dx) / distance; // Extend 20px into circle
    const endY = cyBig - ((rBig - 20) * dy) / distance;

    const horizontalDelta = endX - startX;
    const verticalDelta = endY - startY;

    // Check if this is the pink color that needs triple thin lines
    const isPinkColor = strokeColor === '#B91199';
    const offsetMagnitude = isPinkColor ? 2.5 : 1.5;
    const strokeWidth = isPinkColor ? '1' : '2.25';
    const nearlyHorizontal = Math.abs(verticalDelta) < 1.0;

    if (nearlyHorizontal) {
      const lineOffsets = isPinkColor ? [-offsetMagnitude, 0, offsetMagnitude] : [offsetMagnitude, -offsetMagnitude];
      lineOffsets.forEach(offset => {
        const yLine = startY + offset;
        const deltaY = yLine - cyBig;
        const spanSquared = (rBig * rBig) - (deltaY * deltaY);
        if (spanSquared <= 0) {
          return;
        }
        const horizontalReach = Math.sqrt(spanSquared);
        const lineEndX = Math.max(startX, cx + horizontalReach - 20); // Stop 20px before edge (inside circle)

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', startX.toFixed(2));
        line.setAttribute('y1', yLine.toFixed(2));
        line.setAttribute('x2', lineEndX.toFixed(2));
        line.setAttribute('y2', yLine.toFixed(2));
        line.setAttribute('stroke', strokeColor);
        line.setAttribute('stroke-width', strokeWidth);
        line.setAttribute('stroke-linecap', 'round');
        line.classList.add('admin-double-line');
        targetGroup.appendChild(line);
      });
      return;
    }

    const control1X = startX + Math.max(40, Math.abs(horizontalDelta) * 0.6);
    const control1Y = startY;
    const control2X = endX - Math.max(25, Math.abs(horizontalDelta) * 0.2);
    const control2Y = endY - verticalDelta * 0.3;

    const normX = verticalDelta === 0 && horizontalDelta === 0 ? 0 : -verticalDelta;
    const normY = horizontalDelta;
    const normLength = Math.sqrt(normX * normX + normY * normY) || 1;
    const offsetX = (normX / normLength) * offsetMagnitude;
    const offsetY = (normY / normLength) * offsetMagnitude;

    const points = isPinkColor ? [
      {
        sx: startX + offsetX,
        sy: startY + offsetY,
        c1x: control1X + offsetX,
        c1y: control1Y + offsetY,
        c2x: control2X + offsetX,
        c2y: control2Y + offsetY,
        ex: endX + offsetX,
        ey: endY + offsetY
      },
      {
        sx: startX,
        sy: startY,
        c1x: control1X,
        c1y: control1Y,
        c2x: control2X,
        c2y: control2Y,
        ex: endX,
        ey: endY
      },
      {
        sx: startX - offsetX,
        sy: startY - offsetY,
        c1x: control1X - offsetX,
        c1y: control1Y - offsetY,
        c2x: control2X - offsetX,
        c2y: control2Y - offsetY,
        ex: endX - offsetX,
        ey: endY - offsetY
      }
    ] : [
      {
        sx: startX + offsetX,
        sy: startY + offsetY,
        c1x: control1X + offsetX,
        c1y: control1Y + offsetY,
        c2x: control2X + offsetX,
        c2y: control2Y + offsetY,
        ex: endX + offsetX,
        ey: endY + offsetY
      },
      {
        sx: startX - offsetX,
        sy: startY - offsetY,
        c1x: control1X - offsetX,
        c1y: control1Y - offsetY,
        c2x: control2X - offsetX,
        c2y: control2Y - offsetY,
        ex: endX - offsetX,
        ey: endY - offsetY
      }
    ];

    points.forEach(pt => {
      const d = 'M ' + pt.sx.toFixed(2) + ' ' + pt.sy.toFixed(2) +
                ' C ' + pt.c1x.toFixed(2) + ' ' + pt.c1y.toFixed(2) + ', ' +
                 pt.c2x.toFixed(2) + ' ' + pt.c2y.toFixed(2) + ', ' +
                 pt.ex.toFixed(2) + ' ' + pt.ey.toFixed(2);
      const path = createStyledPath(d, {
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        fill: 'none',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      });
      path.classList.add('admin-double-line');
      targetGroup.appendChild(path);
    });
  };

      if (window.hexagonPositions && window.bridgePositions) {
        const hexHeightValue = window.hexagonPositions.hexHeight;

        const redColor = '#FF0090';
      const yellowColor = '#ab20fd';

      const pexaStartX = window.hexagonPositions.pexaX + window.hexagonPositions.pexaWidth;
      const pexaStartY = window.hexagonPositions.pexaY + hexHeightValue / 2;
      drawCurvedDoubleLine(pexaStartX, pexaStartY, redColor, redLinesGroup);

        const asxfStartX = window.hexagonPositions.asxfX + window.hexagonPositions.asxfWidth;
        const asxfStartY = window.hexagonPositions.asxfY + window.hexagonPositions.asxfHeight / 2;
        drawCurvedDoubleLine(asxfStartX, asxfStartY, redColor, redLinesGroup);

        const mcauStartX = window.hexagonPositions.mastercardX + window.hexagonPositions.mastercardWidth;
        const mcauStartY = window.hexagonPositions.mastercardY + hexHeightValue / 2;
        drawCurvedDoubleLine(mcauStartX, mcauStartY, yellowColor, yellowLinesGroup);

        const essbStartX = window.hexagonPositions.mastercardX + window.hexagonPositions.mastercardWidth;
        const essbStartY = window.hexagonPositions.eftposY + hexHeightValue / 2;
        drawCurvedDoubleLine(essbStartX, essbStartY, yellowColor, yellowLinesGroup);

        const asxbStartX = window.bridgePositions.bridgeX + window.bridgePositions.bridgeWidth;
        const asxbStartY = window.bridgePositions.bridgeY + hexHeightValue / 2;
        drawCurvedDoubleLine(asxbStartX, asxbStartY, yellowColor, yellowLinesGroup);
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
      esaRect.setAttribute('fill', '#2D3748'); // Much darker grey fill
      esaRect.setAttribute('fill-opacity', '1'); // Fully opaque
      esaRect.setAttribute('stroke', '#A0AEC0'); // More prominent grey border
      esaRect.setAttribute('stroke-width', '2'); // Thicker border
      // Square edges - no rx attribute

      // Add ESAs label to top right corner of grey rectangle
      const rectWidth = (maxX - minX) + leftPadding + rightPadding + dotRadius * 2;
      const esasText = createStyledText(
        rectX + rectWidth - 10, // 10px from right edge
        rectY + 15, // 15px from top edge
        'ESAs',
        {
          textAnchor: 'end',
          fill: '#ffffff', // White text
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
          fill: '#ffffff', // White text
          fontSize: '14' // Same as top label
        }
      );
      labelsGroup.appendChild(esasText2);

      // Store ESAs box dimensions for later use
      window.esasBoxData = {
        x: rectX,
        y: rectY,
        width: rectWidth,
        height: rectHeight,
        bottom: rectY + rectHeight
      };

      // Now align SWIFT PDS bottom with ESAs bottom
      console.log('Aligning SWIFT PDS with ESAs:', {
        swiftOriginalY: window.swiftGroupOriginalY,
        swiftPdsHeight: window.swiftPdsHeight,
        esasBottom: window.esasBoxData.bottom,
        hasHvcsElements: !!window.swiftHvcsElements
      });

      if (window.swiftGroupOriginalY && window.swiftPdsHeight && window.swiftHvcsElements) {
        // Calculate where SWIFT PDS should be positioned
        const newSwiftPdsY = window.esasBoxData.bottom - window.swiftPdsHeight;

        // Get current position of SWIFT PDS box - use ID selector
        const swiftRect = document.getElementById('swift-pds-rect');

        console.log('Found SWIFT PDS box:', !!swiftRect);

        if (swiftRect) {
          const currentSwiftY = parseFloat(swiftRect.getAttribute('y'));
          // Calculate how much more we need to move
          const additionalAdjustment = newSwiftPdsY - currentSwiftY;

          console.log('SWIFT PDS adjustment:', {
            currentY: currentSwiftY,
            targetY: newSwiftPdsY,
            adjustment: additionalAdjustment
          });

          // Only adjust if there's a meaningful difference
          if (Math.abs(additionalAdjustment) > 0.1) {
            // Apply adjustment to SWIFT PDS box
            swiftRect.setAttribute('y', newSwiftPdsY.toFixed(2));

            // Update SWIFT PDS text elements - find by checking tspan content
            const allTexts = Array.from(labelsGroup.getElementsByTagName('text'));
            const swiftTexts = allTexts.filter(text => {
              const tspans = text.getElementsByTagName('tspan');
              let hasSwift = false;
              let hasPds = false;
              for (let tspan of tspans) {
                if (tspan.textContent === 'SWIFT') hasSwift = true;
                if (tspan.textContent === 'PDS') hasPds = true;
              }
              return hasSwift && hasPds;
            });

            console.log('Found SWIFT text elements:', swiftTexts.length);

            swiftTexts.forEach(text => {
              const currentY = parseFloat(text.getAttribute('y'));
              text.setAttribute('y', (currentY + additionalAdjustment).toFixed(2));
              // Update tspan children - they don't have y attributes, they position relative to parent
            });

            // Update SWIFT HVCS elements
            if (window.swiftHvcsElements.boundingBox) {
              const currentY = parseFloat(window.swiftHvcsElements.boundingBox.getAttribute('y'));
              window.swiftHvcsElements.boundingBox.setAttribute('y', (currentY + additionalAdjustment).toFixed(2));
            }

            // Update all pacs rectangles
            if (window.swiftHvcsElements.pacsElements) {
              window.swiftHvcsElements.pacsElements.forEach(elem => {
                const currentY = parseFloat(elem.rect.getAttribute('y'));
                elem.rect.setAttribute('y', (currentY + additionalAdjustment).toFixed(2));
                // Also update the text
                const textY = parseFloat(elem.text.getAttribute('y'));
                elem.text.setAttribute('y', (textY + additionalAdjustment).toFixed(2));
              });
            }

            // Update HVCS label
            if (window.swiftHvcsElements.hvcsLabel) {
              const currentY = parseFloat(window.swiftHvcsElements.hvcsLabel.getAttribute('y'));
              window.swiftHvcsElements.hvcsLabel.setAttribute('y', (currentY + additionalAdjustment).toFixed(2));
            }

            // Update pacs to SWIFT connecting lines
            if (window.pacsToSwiftLines) {
              const positions = [1/6, 0.5, 5/6];
              window.pacsToSwiftLines.forEach((line, index) => {
                // Update Y coordinates for both ends of the line
                const newY = newSwiftPdsY + window.swiftPdsHeight * positions[index];
                line.setAttribute('y1', newY.toFixed(2));
                line.setAttribute('y2', newY.toFixed(2));
              });
            }

            // Update CLS AUD box
            const clsAudRect = document.getElementById('cls-aud-rect');
            if (clsAudRect) {
              const currentY = parseFloat(clsAudRect.getAttribute('y'));
              const newY = currentY + additionalAdjustment;
              clsAudRect.setAttribute('y', newY.toFixed(2));
              console.log('CLS AUD box position AFTER adjustment:', {
                oldY: currentY,
                adjustment: additionalAdjustment,
                newY: newY,
                height: parseFloat(clsAudRect.getAttribute('height')),
                centerY: newY + parseFloat(clsAudRect.getAttribute('height')) / 2
              });
            }

            // Update CLS AUD text
            const clsAudTexts = Array.from(labelsGroup.children).filter(el => 
              el.tagName === 'text' && el.textContent === 'CLS AUD'
            );
            clsAudTexts.forEach(text => {
              const currentY = parseFloat(text.getAttribute('y'));
              text.setAttribute('y', (currentY + additionalAdjustment).toFixed(2));
            });

            // Update the horizontal lines if needed
            if (window.hvcsLineData) {
              window.hvcsLineData.startY += additionalAdjustment;
            }

            // Update curved lines from SWIFT boxes to blue circle
            if (window.swiftToCurves) {
              // Recalculate the Y positions for the three lines at 1/6, 1/2, 5/6 of SWIFT PDS height
              const newLine1Y = newSwiftPdsY + window.swiftPdsHeight * (1/6);
              const newLine2Y = newSwiftPdsY + window.swiftPdsHeight * 0.5;
              const newLine3Y = newSwiftPdsY + window.swiftPdsHeight * (5/6);
              const newLineYs = [newLine1Y, newLine2Y, newLine3Y];

              window.swiftToCurves.forEach((path, index) => {
                if (index < 3) {
                  // Recalculate the entire path with new start position
                  // Get SWIFT PDS box to find its right edge
                  const swiftPdsBox = document.querySelector('rect[fill="#063d38"][id="swift-pds-rect"]') ||
                                     document.querySelector('rect[fill="#063d38"][width="' + window.swiftPdsWidth + '"]');
                  let startX = 0;
                  if (swiftPdsBox) {
                    startX = parseFloat(swiftPdsBox.getAttribute('x')) + parseFloat(swiftPdsBox.getAttribute('width'));
                  } else {
                    // Fallback - estimate based on stored values
                    console.error('Could not find SWIFT PDS box for line update');
                    return;
                  }
                  const startY = newLineYs[index];

                  // Get big blue circle position
                  const bigCircleX = 300;
                  const bigCircleY = 450;
                  const bigCircleRadius = 113;

                  // Calculate end point on circle
                  const dx = bigCircleX - startX;
                  const dy = bigCircleY - startY;
                  const angleToCenter = Math.atan2(dy, dx);
                  const endX = bigCircleX - bigCircleRadius * Math.cos(angleToCenter);
                  const endY = bigCircleY - bigCircleRadius * Math.sin(angleToCenter);

                  // Control points for J-shaped curve
                  const distX = endX - startX;
                  const distY = endY - startY;
                  const controlX1 = startX + Math.abs(distX) * 0.7;
                  const controlY1 = startY;
                  const controlX2 = endX - 10;
                  const controlY2 = startY + distY * 0.5;

                  const newPath = `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;
                  path.setAttribute('d', newPath);
                }
              });
            }

            // Update new CLS AUD path
            const clsAudNewPath = document.getElementById('cls-aud-line-new');
            if (clsAudNewPath && clsAudNewPath.tagName === 'path') {
              // Parse the path data and adjust Y coordinates
              const currentPath = clsAudNewPath.getAttribute('d');
              const adjustedPath = currentPath.replace(/(\d+\.?\d*)\s+(\d+\.?\d*)/g, (match, x, y) => {
                const yNum = parseFloat(y);
                const adjustedY = (yNum + additionalAdjustment).toFixed(2);
                return `${x} ${adjustedY}`;
              });
              clsAudNewPath.setAttribute('d', adjustedPath);
            }

            // Update stored CLS endpoints if they exist
            if (window.clsEndpoints && window.clsEndpoints.audLineEndY) {
              window.clsEndpoints.audLineEndY += additionalAdjustment;
            }
          }
        }
      }

      // Now align NPP top with ESAs top
      console.log('Aligning NPP with ESAs:', {
        nppOriginalY: window.nppBoxData?.originalY,
        esasTop: window.esasBoxData?.y,
        hasNppData: !!window.nppBoxData
      });

      if (window.nppBoxData && window.esasBoxData) {
        // Calculate where NPP should be positioned (align tops)
        const newNppY = window.esasBoxData.y;

        // Get NPP box element
        const nppBox = document.getElementById('npp-box');
        if (nppBox) {
          const currentNppY = parseFloat(nppBox.getAttribute('y'));
          // Calculate adjustment needed
          const nppAdjustment = newNppY - currentNppY;

          console.log('NPP adjustment:', {
            currentY: currentNppY,
            targetY: newNppY,
            adjustment: nppAdjustment
          });

          // Only adjust if there's a meaningful difference
          if (Math.abs(nppAdjustment) > 0.1) {
            // Apply adjustment to NPP box
            nppBox.setAttribute('y', newNppY.toFixed(2));

            // Update NPP text
            if (window.nppTextElements) {
              ['top', 'bottom'].forEach(key => {
                const el = window.nppTextElements[key];
                if (el) {
                  const currentY = parseFloat(el.getAttribute('y'));
                  el.setAttribute('y', (currentY + nppAdjustment).toFixed(2));
                }
              });
            } else {
              const nppTexts = Array.from(labelsGroup.getElementsByTagName('text')).filter(text => 
                text.textContent === 'NPP BI' || text.textContent === '(SWIFT)'
              );
            nppTexts.forEach(text => {
              const currentY = parseFloat(text.getAttribute('y'));
              text.setAttribute('y', (currentY + nppAdjustment).toFixed(2));
            });
          }

          if (window.nppLabelElement && window.nppBoundingData) {
            const labelX = window.nppBoundingData.x + window.nppBoundingData.width / 2;
            const labelY = window.nppBoundingData.y + window.nppBoundingData.height / 2;
            window.nppLabelElement.setAttribute('x', labelX.toFixed(2));
            window.nppLabelElement.setAttribute('y', labelY.toFixed(2));
          }

          // Update NPP to FSS sigmoid curve
            const nppToFssPath = document.getElementById('npp-to-fss-path');
            if (nppToFssPath) {
              const d = nppToFssPath.getAttribute('d');
              if (d) {
                // Update Y coordinates in the path
                const updatedD = d.replace(/M ([\d.]+) ([\d.]+)/g, (match, x, y) => {
                  const oldY = parseFloat(y);
                  const newY = oldY + nppAdjustment;
                  return `M ${x} ${newY.toFixed(2)}`;
                }).replace(/C ([\d.]+) ([\d.]+), ([\d.]+) ([\d.]+), ([\d.]+) ([\d.]+)/g, 
                  (match, x1, y1, x2, y2, x3, y3) => {
                    const newY1 = parseFloat(y1) + nppAdjustment;
                    const newY2 = parseFloat(y2) + nppAdjustment;
                    const newY3 = parseFloat(y3) + nppAdjustment;
                    return `C ${x1} ${newY1.toFixed(2)}, ${x2} ${newY2.toFixed(2)}, ${x3} ${newY3.toFixed(2)}`;
                });
                nppToFssPath.setAttribute('d', updatedD);
              }
            }

            // Keep XX1/XX2/XX3 anchored to the admin batches layout; do not shift them with NPP

            // Update stored NPP data
            window.nppBoxData.y = newNppY;

          updateNppToAdiLine();
          }
        }
      }

      // Shift NPP box upward by BSCT height while leaving BSCT in place
      const nppToFssPath = document.getElementById('npp-to-fss-path');

      // Add dark red LVSS gear circle above Administered Batches box
      // Position LVSS to the right of the moved boxes
      // Use stored mastercard position
      const mastercardRightEdgeForLVSS = window.hexagonPositions.mastercardX + window.hexagonPositions.mastercardWidth;
      const redCircleX = mastercardRightEdgeForLVSS + 50 + 37 * 1.2; // Position 50px to the right of the moved boxes, plus half the circle width (radius increased by 20%)

      // Create LVSS circle - REFACTORED to diagram-circles.js
      createLvssCircle({redCircleX}, labelsGroup);

      // Now draw magenta-rose lines from boxes to LVSS
      if (window.lvssBoxPositions) {
        const magentaRoseColor = '#E94B9C'; // Saddle brown shade
        const lvssLines = [];
        const lvssX = window.lvssPosition.x;
        let lvssY = window.lvssPosition.y;
        const lvssRadius = window.lvssPosition.radius;

        // Blue circle position
        const blueCircleX = 300;
        const blueCircleY = 450;
        const blueCircleRadius = 113;

        const narrowBoxX = window.lvssBoxPositions.narrowBoxX;
        const narrowBoxWidth = window.lvssBoxPositions.narrowBoxWidth;
        const boxHeight = window.lvssBoxPositions.boxHeight;

        // CECS - thick line
        const iacLineY = window.lvssBoxPositions.cecsY + boxHeight / 2;

        // Force LVSS to be at same Y as CECS
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
            const transform = path.getAttribute('transform') || '';
            // Check if this path is transformed to LVSS position
            if (transform.includes(`translate(${lvssX},`)) {
              // This is the LVSS gear path - update its Y position
              const newTransform = transform.replace(/translate\([^,]+,\s*([^)]+)\)/, `translate(${lvssX}, ${iacLineY})`);
              path.setAttribute('transform', newTransform);
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

        // BECS - single thick line at center (like other boxes)
        lvssLines.push({
          x: narrowBoxX + narrowBoxWidth,
          y: window.lvssBoxPositions.becsY + boxHeight / 2,  // Center
          label: 'BECS',
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
          // Extend far into the circle by reducing the radius offset significantly
          const endX = blueCircleX - (blueCircleRadius - 30) * Math.cos(angleToBlue);
          const endY = blueCircleY - (blueCircleRadius - 30) * Math.sin(angleToBlue) + verticalOffset;

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
          const greyColor = '#C0C0C0'; // Silver color

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
              stroke: greyColor,
              strokeWidth: '2.5', // Thin lines for double effect
              fill: 'none',
              strokeLinecap: 'round'
            });
            svg.insertBefore(parallelPath, svg.firstChild); // Insert at beginning so lines appear behind everything
          }
        });
      }

  }

  // Only create these boxes once, after all dots have been recorded
  if (window.dotPositions && window.dotPositions[99]) {
    console.log('Creating group boxes after main loop - dotPositions entries:', Object.keys(window.dotPositions || {}).length);

    // Define dotRadius for all the group boxes
    const dotRadius = 3.5; // Standard small circle radius

  // Add second rectangle for dots excluding special ones (RBA, red, green, magenta bordered)
  // This excludes dots: 0 (RBA), 92-95 (red border), 96-98 (green border), 99 (magenta/CLS)
  let minX2 = null, minY2 = null, maxX2 = null, maxY2 = null;

  // Find boundaries excluding special dots
  console.log('ADI box debug: Looking for dots 1-91 after main loop');
  let foundDots = 0;
  for (let j = 1; j < 92; j++) {  // Start from 1 (skip RBA) and go up to 91
    if (window.dotPositions && window.dotPositions[j]) {
      foundDots++;
      if (minX2 === null || window.dotPositions[j].x < minX2) minX2 = window.dotPositions[j].x;
      if (maxX2 === null || window.dotPositions[j].x > maxX2) maxX2 = window.dotPositions[j].x;
      if (minY2 === null || window.dotPositions[j].y < minY2) minY2 = window.dotPositions[j].y;
      if (maxY2 === null || window.dotPositions[j].y > maxY2) maxY2 = window.dotPositions[j].y;
    }
  }
  console.log('ADI box debug: Found', foundDots, 'dots out of 91 expected');

      console.log('ADI box debug: minX2=', minX2, 'maxX2=', maxX2);
      if (minX2 !== null && maxX2 !== null) {
        console.log('ADI box debug: Creating ADI box');
        console.log('ADI box debug: dotRadius =', typeof dotRadius !== 'undefined' ? dotRadius : 'UNDEFINED');
        // Use similar padding but slightly less
        const innerPadding = 10;
        const innerLeftPadding = 60; // Increased to move left edge left
        const innerTopPadding = 30;
        const innerBottomPadding = 6; // One extra pixel
        const innerRightPadding = 290;

        const adiRect = createStyledRect(
          minX2 - innerLeftPadding - dotRadius,
          minY2 - innerTopPadding - dotRadius,
          (maxX2 - minX2) + innerLeftPadding + innerRightPadding + dotRadius * 2,
          (maxY2 - minY2) + innerTopPadding + innerBottomPadding + dotRadius * 2,
          {
            fill: '#080520', // Even darker indigo
            stroke: 'rgba(140, 165, 220, 1)', // Swapped: light blue border
            strokeWidth: '1',
            rx: '8' // Slightly less rounded corners
          }
        );
        adiRect.setAttribute('fill-opacity', '0.9'); // More opaque

        // Insert after the background rectangle so it appears above it
        const esaRect = document.getElementById('blue-dots-background');
        svg.insertBefore(adiRect, esaRect.nextSibling);
        console.log('ADI box debug: ADI rect inserted into DOM');

        // Store ADI box position for HVCS line
        if (!window.adiBoxData) window.adiBoxData = {};
        window.adiBoxData.x = minX2 - innerLeftPadding - dotRadius;
        window.adiBoxData.y = minY2 - innerTopPadding - dotRadius;
        window.adiBoxData.width = (maxX2 - minX2) + innerLeftPadding + innerRightPadding + dotRadius * 2;
        window.adiBoxData.height = (maxY2 - minY2) + innerTopPadding + innerBottomPadding + dotRadius * 2;
        // XXX-to-ADI line update removed
        // if (typeof window.updateXXXToAdiLine === 'function') {
        //   window.updateXXXToAdiLine();
        // }
        if (typeof window.updateDirectEntryToAdiLine === 'function') {
          window.updateDirectEntryToAdiLine();
        }
        if (typeof window.updateOskoToAdiLine === 'function') {
          window.updateOskoToAdiLine();
        }
        if (typeof window.updateCardLeftLines === 'function') {
          window.updateCardLeftLines();
        }

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
           fill: '#ffffff', // White (matching Non-ADIs label)
           fontSize: '24' // Slightly bigger
         }
       );
       labelsGroup.appendChild(adisText);
        console.log('ADIs label coords:', {
          rectX: adiRectX,
          rectWidth: adiRectWidth,
          textX: adiRectX + adiRectWidth - 15,
          textY: adiRectY + 35
        });
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
        const yellowTopPadding = 24;
        const yellowBottomPadding = 21;
        const yellowRightPadding = 210;

        const yellowRect = createStyledRect(
          minX3 - yellowLeftPadding - dotRadius,
          minY3 - yellowTopPadding - dotRadius,
          (maxX3 - minX3) + yellowLeftPadding + yellowRightPadding + dotRadius * 2,
          (maxY3 - minY3) + yellowTopPadding + yellowBottomPadding + dotRadius * 2,
          {
            fill: '#415366', // Slightly lighter blue-grey
            stroke: '#dde6ff', // Light blue (swapped with fill)
            strokeWidth: '0.5', // Very thin border
            rx: '6' // Smaller rounded corners
          }
        );
        yellowRect.setAttribute('fill-opacity', '0.2'); // Reduced opacity

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
            fill: '#dde6ff', // Light blue (swapped text color)
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
            fill: '#dde6ff', // Light blue (swapped text color)
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
        const greenTopPadding = 10;
        const greenBottomPadding = 4;
        const greenRightPadding = 280;

        const greenRect = createStyledRect(
          minX4 - greenLeftPadding - dotRadius,
          minY4 - greenTopPadding - dotRadius,
          (maxX4 - minX4) + greenLeftPadding + greenRightPadding + dotRadius * 2,
          (maxY4 - minY4) + greenTopPadding + greenBottomPadding + dotRadius * 2,
          {
            fill: '#8B4DB8', // Even lighter purple
            stroke: '#e4d4f4', // Light Excel purple (swapped with fill)
            strokeWidth: '0.5', // Very thin border
            rx: '5' // Smaller rounded corners
          }
        );
        greenRect.setAttribute('fill-opacity', '0.2'); // Reduced opacity

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
            fill: '#e4d4f4', // Light purple (swapped text color)
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
        const group2TopPadding = 19;
        const group2BottomPadding = 1;
        const group2RightPadding = 110;

        const group2Rect = createStyledRect(
          minX5 - group2LeftPadding - dotRadius,
          minY5 - group2TopPadding - dotRadius,
          (maxX5 - minX5) + group2LeftPadding + group2RightPadding + dotRadius * 2,
          (maxY5 - minY5) + group2TopPadding + group2BottomPadding + dotRadius * 2,
          {
            fill: '#1E7088', // Slightly lighter aqua/cyan
            stroke: '#7DF9FF', // Electric cyan
            strokeWidth: '0.5',
            rx: '4' // Small rounded corners
          }
        );
        group2Rect.setAttribute('fill-opacity', '0.2'); // Reduced opacity

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
            fill: '#7DF9FF', // Electric cyan
            fontSize: '11', // Bigger font
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
        const group3TopPadding = 5;
        const group3BottomPadding = 16;
        const group3RightPadding = 205;

        const group3Rect = createStyledRect(
          minX6 - group3LeftPadding - dotRadius,
          minY6 - group3TopPadding - dotRadius,
          (maxX6 - minX6) + group3LeftPadding + group3RightPadding + dotRadius * 2,
          (maxY6 - minY6) + group3TopPadding + group3BottomPadding + dotRadius * 2,
          {
            fill: '#1E7088', // Slightly lighter aqua/cyan
            stroke: '#7DF9FF', // Electric cyan
            strokeWidth: '0.5',
            rx: '4' // Small rounded corners
          }
        );
        group3Rect.setAttribute('fill-opacity', '0.2'); // Reduced opacity

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
            fill: '#7DF9FF', // Electric cyan
            fontSize: '11', // Bigger font
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
        const group5aTopPadding = 9;
        const group5aBottomPadding = 3;
        const group5aRightPadding = 295;  // Same as group 4

        const group5aRect = createStyledRect(
          minX7 - group5aLeftPadding - dotRadius,
          minY7 - group5aTopPadding - dotRadius,
          (maxX7 - minX7) + group5aLeftPadding + group5aRightPadding + dotRadius * 2,
          (maxY7 - minY7) + group5aTopPadding + group5aBottomPadding + dotRadius * 2,
          {
            fill: '#8129a0', // Intermediate purple (swapped with border)
            stroke: '#f5e6ff', // Light intermediate purple (swapped with fill)
            strokeWidth: '0.75',
            rx: '4' // Small rounded corners
          }
        );
        group5aRect.setAttribute('fill-opacity', '0.5'); // Reduced opacity

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
            fill: '#f5e6ff', // Light purple (swapped text color)
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
        const group5bTopPadding = 8;
        const group5bBottomPadding = 3;
        const group5bRightPadding = 281;  // Same as group 4

        const group5bRect = createStyledRect(
          minX8 - group5bLeftPadding - dotRadius,
          minY8 - group5bTopPadding - dotRadius,
          (maxX8 - minX8) + group5bLeftPadding + group5bRightPadding + dotRadius * 2,
          (maxY8 - minY8) + group5bTopPadding + group5bBottomPadding + dotRadius * 2,
          {
            fill: '#942193', // Based on hex 942193 (swapped with border)
            stroke: '#ffe0f7', // Light version (swapped with fill)
            strokeWidth: '0.75',
            rx: '4' // Small rounded corners
          }
        );
        group5bRect.setAttribute('fill-opacity', '0.5'); // Reduced opacity

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
            fill: '#ffe0f7', // Light version (swapped text color)
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
        // Recompute ADI bounds so we can align Group 6 consistently
        let minX2 = null, minY2 = null, maxX2 = null, maxY2 = null;
        for (let j = 1; j < 92; j++) {
          if (window.dotPositions && window.dotPositions[j]) {
            const { x, y } = window.dotPositions[j];
            if (minX2 === null || x < minX2) minX2 = x;
            if (maxX2 === null || x > maxX2) maxX2 = x;
            if (minY2 === null || y < minY2) minY2 = y;
            if (maxY2 === null || y > maxY2) maxY2 = y;
          }
        }

        if (minX2 === null || maxX2 === null || minY2 === null || maxY2 === null) {
          console.warn('Group 6 box skipped: unable to derive ADI bounds');
        } else {
          // Calculate position based on ADI box
          // Use the same left padding as ADI rect
          const innerLeftPadding = 60; // Match the ADI box
          const innerTopPadding = 30;
          const innerBottomPadding = 7; // Match the ADI box
          const innerRightPadding = 290;

          // Calculate ADI box position
          const adiBoxX = minX2 - innerLeftPadding - dotRadius;
          const adiBoxY = minY2 - innerTopPadding - dotRadius;
          const adiBoxHeight = (maxY2 - minY2) + innerTopPadding + innerBottomPadding + dotRadius * 2;
          const adiBoxWidth = (maxX2 - minX2) + innerLeftPadding + innerRightPadding + dotRadius * 2;

          if (!window.adiBoxData) window.adiBoxData = {};
          window.adiBoxData.x = adiBoxX;
          window.adiBoxData.y = adiBoxY;
          window.adiBoxData.width = adiBoxWidth;
          window.adiBoxData.height = adiBoxHeight;
          // XXX-to-ADI line update removed
          // if (typeof window.updateXXXToAdiLine === 'function') {
          //   window.updateXXXToAdiLine();
          // }
          if (typeof window.updateDirectEntryToAdiLine === 'function') {
            window.updateDirectEntryToAdiLine();
          }
          if (typeof window.updateOskoToAdiLine === 'function') {
            window.updateOskoToAdiLine();
          }

          // Create orange line from Sympli to ADIs now that both box data are available
          if (window.sympliBoxData && window.adiBoxData && window.asxLineData) {
            const sympliToAdiPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');

            // Recalculate actual Sympli box position (it may have been adjusted after initial creation)
            let actualSympliX = window.sympliBoxData.x;
            if (window.finalAsxBox) {
              // If ASX box data is available, recalculate Sympli position to be centered over ASX
              const asxBoxCenter = window.finalAsxBox.x + window.finalAsxBox.width / 2;
              actualSympliX = asxBoxCenter - window.sympliBoxData.width / 2;
            }

            // Start from left side of Sympli box (middle height)
            const startX = actualSympliX;
            const startY = window.sympliBoxData.y + window.sympliBoxData.height / 2;

            // Curve down to same Y level as blue lines (where they turn horizontal)
            const cornerRadius = 20;
            const downToY = window.asxLineData.horizontalY + 8; // Go 8px below the blue lines (was 20, moved up 12)

            // Follow the same curve pattern as the blue line but extend much further right
            const nonAdiRightEdge = window.nonAdiBoxData ? window.nonAdiBoxData.x + window.nonAdiBoxData.width : 0;
            // Start curving up even closer to the ADIs box
            const curveStartX = window.adiBoxData.x + 320; // Extended 20px further right
            const extendPastNonAdi = window.adiBoxData.x + 420; // Control point for curve

            // End point for orange line - next to where blue line connects
            const greenEndX = extendPastNonAdi + 15; // Where green line ends
            const blueEndX = greenEndX + 20; // Where blue line ends
            const orangeEndX = blueEndX + 20; // 20px to the right of blue line

            // Bottom of ADIs box
            const endY = window.adiBoxData.y + window.adiBoxData.height;
            const actualVerticalDistance = downToY - endY;

            const bottomCornerRadius = 100; // Back to 100 for very rounded corner
            const pathData =
              `M ${startX} ${startY} ` + // Start at left side of Sympli
              `L ${startX - 5} ${startY} ` + // Go slightly left from the box edge
              `Q ${startX - 5 - cornerRadius} ${startY}, ${startX - 5 - cornerRadius} ${startY + cornerRadius} ` + // Curve down
              `L ${startX - 5 - cornerRadius} ${downToY - bottomCornerRadius} ` + // Go down (stop earlier for large curve)
              `Q ${startX - 5 - cornerRadius} ${downToY}, ${startX - 5 - cornerRadius + bottomCornerRadius} ${downToY} ` + // Larger curve right
              `L ${curveStartX} ${downToY} ` + // Go right under the blue lines to where curve starts
              `C ${curveStartX + 60} ${downToY}, ` + // Same curve as blue line
              `${extendPastNonAdi} ${downToY - actualVerticalDistance * 0.15}, ` + // Gradual rise like blue line
              `${orangeEndX} ${endY}`; // Curve up to ADIs box

            const sympliToAdiLineStyled = createStyledPath(pathData, {
              stroke: 'rgb(239,136,51)', // Sympli original color
              strokeWidth: '3',
              fill: 'none',
              id: 'sympli-to-adis-line'
            });

            labelsGroup.insertBefore(sympliToAdiLineStyled, labelsGroup.firstChild);
          }

          if (window.pexaConveyBoxData && window.adiBoxData && window.asxLineData) {
            const offsetBetweenLines = 5;
            const horizontalSeparation = 5; // drop slightly lower than the Sympli path
            const verticalSegmentShift = 10; // position entry segment 5px further left than Sympli
            let actualPexaX = window.pexaConveyBoxData.x;
            if (window.finalAsxBox) {
              const asxBoxCenter = window.finalAsxBox.x + window.finalAsxBox.width / 2;
              actualPexaX = asxBoxCenter - window.pexaConveyBoxData.width / 2;
            }

            const startX = actualPexaX;
            const startY = window.pexaConveyBoxData.y + window.pexaConveyBoxData.height / 2;
            const cornerRadius = 20;
            const baseDownToY = window.asxLineData.horizontalY + 8; // Was 20, moved up 12 total
            let downToY = baseDownToY + horizontalSeparation;
            const curveStartX = window.adiBoxData.x + 320; // Extended 20px further right to match orange line
            const extendPastNonAdi = window.adiBoxData.x + 420;
            const greenEndX = extendPastNonAdi + 15;
            const blueEndX = greenEndX + 20;
            const orangeEndX = blueEndX + 20;
            const pinkEndX = orangeEndX + 3; // 3 pixels to the right of orange line
            const endY = window.adiBoxData.y + window.adiBoxData.height;
            if (!Number.isFinite(downToY) || downToY <= endY + 1) {
              downToY = baseDownToY;
            }
            const actualVerticalDistance = downToY - endY;
            const bottomCornerRadius = 100;

            const verticalEntryX = startX - verticalSegmentShift;
            const controlX = verticalEntryX - cornerRadius;

            const pexaPathData =
              `M ${startX} ${startY} ` +
              `L ${verticalEntryX} ${startY} ` +
              `Q ${controlX} ${startY}, ${controlX} ${startY + cornerRadius} ` +
              `L ${controlX} ${downToY - bottomCornerRadius} ` +
              `Q ${controlX} ${downToY}, ${controlX + bottomCornerRadius} ${downToY} ` +
              `L ${curveStartX} ${downToY} ` +
              `C ${curveStartX + 60} ${downToY}, ` +
                `${extendPastNonAdi} ${downToY - actualVerticalDistance * 0.15}, ` +
                `${pinkEndX} ${endY}`;

            const pexaToAdiLineStyled = createStyledPath(pexaPathData, {
              stroke: 'rgb(179,46,161)',
              strokeWidth: '2',
              fill: 'none',
              id: 'pexa-to-adis-line'
            });

            labelsGroup.insertBefore(pexaToAdiLineStyled, labelsGroup.firstChild);
          }

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

          const nonAdiRect = createStyledRect(rectX - 3, rectY, rectWidth + 3, rectHeight, {
            fill: '#5C0A0A', // Dark maroon
            stroke: '#fbbf24', // Light gold
            strokeWidth: '1',
            rx: '8' // Same rounded corners as ADI box
          });
          nonAdiRect.setAttribute('fill-opacity', '0.85'); // Made more opaque

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
            console.log('=== HVCS TO ADI LINE CONNECTION ===');
            console.log('HVCS line start X:', window.hvcsLineData.startX);
            console.log('SWIFT HVCS box right edge:', window.swiftHvcsElements ? window.swiftHvcsElements.rightEdge : 'not set');

            const nonAdiRightEdge = rectX + rectWidth;
          const extendPastNonAdi = nonAdiRightEdge + 60; // Extend 60px past non-ADIs (further right)

          // Get ADI box left edge and bottom position
          const adiLeftEdge = window.adiBoxData.x;
          const adiBottom = window.adiBoxData.y + window.adiBoxData.height;

          // Create path: horizontal to past non-ADIs, then symmetrical J-curve up to ADI bottom
          // Adjust end point to account for stroke width using helper
          const strokeWidth = 6; // Updated stroke width
          const adiEdge = getBoxEdgePoint(window.adiBoxData, 'bottom', strokeWidth);
          const adjustedAdiBottom = adiEdge.y;

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
          // Use the updated SWIFT HVCS right edge if available, otherwise fall back to stored value
          const hvcsStartX = window.swiftHvcsElements && window.swiftHvcsElements.rightEdge ? 
                             window.swiftHvcsElements.rightEdge : 
                             window.hvcsLineData.startX;

          const hvcsEndX = extendPastNonAdi + 15;
          const path = `M ${hvcsStartX} ${window.hvcsLineData.startY} ` +
                      `L ${curveStartX} ${window.hvcsLineData.startY} ` +
                      `C ${curveStartX + 60} ${window.hvcsLineData.startY}, ` +
                      `${extendPastNonAdi} ${window.hvcsLineData.startY - verticalDistance * 0.15}, ` +
                      `${hvcsEndX} ${adjustedAdiBottom}`;

          hvcsHorizontalLine.setAttribute('d', path);

          if (!window.clsEndpoints) {
            window.clsEndpoints = {};
          }
          window.clsEndpoints.audLineEndX = hvcsEndX;
          window.clsEndpoints.audLineEndY = adjustedAdiBottom;
          window.clsEndpoints.audLineExitX = hvcsEndX;
          window.clsEndpoints.audLineExitY = adjustedAdiBottom;

          updateNppToAdiLine();
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
            const asxStrokeWidth = parseFloat(asxLine2Extension.getAttribute('stroke-width')) || 4;
            const adiEdge = getBoxEdgePoint(window.adiBoxData, 'bottom', asxStrokeWidth);
            const curveEndY = adiEdge.y;
            const actualVerticalDistance = window.asxLine2Data.horizontalY - curveEndY;

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
                      `${targetX} ${curveEndY}`;

            asxLine2Extension.setAttribute('d', extensionPath);
          }
        }

        // Add "Non-ADIs" label to bottom right corner of group 6 box
        const nonAdiRectX = parseFloat(nonAdiRect.getAttribute('x'));
        const nonAdiRectY = parseFloat(nonAdiRect.getAttribute('y'));
        const nonAdiRectWidth = parseFloat(nonAdiRect.getAttribute('width'));
        const nonAdiRectHeight = parseFloat(nonAdiRect.getAttribute('height'));

        // Position in bottom right corner
        const nonAdiLabelRightPadding = 15;
        const nonAdiLabelBottomPadding = 20; // Move label lower (approx 15% closer to bottom edge)
        const nonADIsText = createStyledText(
          nonAdiRectX + nonAdiRectWidth - nonAdiLabelRightPadding + 3,
          nonAdiRectY + nonAdiRectHeight - nonAdiLabelBottomPadding,
          'Non-ADIs',
          {
            textAnchor: 'end',
            fill: '#ffffff', // White
            fontSize: '24' // Match ADIs font size
          }
        );
        labelsGroup.appendChild(nonADIsText);

        // Extend ASX blue line to curve into non-ADIs box (mirroring green line)
        if (window.asxLineData && window.nonAdiBoxData) {
          if (!window.asxLineData.neonAdjusted || !window.asxLine2Data || !window.asxLine2Data.neonAdjusted) {
            adjustAsxBlueLinesToNeonSpacing();
          }
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
        const redTopPadding = 10; // Increased headroom
        const redBottomPadding = 5; // Increased headroom
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
            fill: '#b91c1c', // Darker red
            stroke: '#fca5a5', // Light red
            strokeWidth: '1',
            rx: '3' // Small rounded corners
          }
        );
        redBorderRect.setAttribute('fill-opacity', '0.5'); // Reduced opacity

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
            fill: '#ffffff', // White text
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
        const greenBorderLeftPadding = -25 + 2 - 1 - 3 + 1; // Slight left adjustment + 2px left padding - 1px to reduce left margin - 3px additional trim + 1px increase
        const greenBorderTopPadding = 8 + 2 - 1; // Increased headroom + 2px additional padding - 1px reduction
        const greenBorderBottomPadding = 10 + 2 - 2 + 1 - 1 - 3; // Increased headroom + 2px additional padding - 2px reduction + 1px extra - 1px to reduce bottom margin - 3px additional trim
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
            fill: '#15803d', // Darker green
            stroke: '#86efac', // Light green closer to white
            strokeWidth: '1',
            rx: '3' // Small rounded corners
          }
        );
        greenBorderRect.setAttribute('fill-opacity', '0.5'); // Reduced opacity

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
            fill: '#ffffff', // White text
            fontSize: '13'
          }
        );
        labelsGroup.appendChild(csText);
      }

    // === Adjust how far above/below the arc extends ===
    // Increase arcSpan to extend farther above/below; decrease to tighten it.
    // Increase arcR to move the arc farther away from the circles (larger "enclosure"); decrease to bring it closer.
    // To move the arc to the LEFT side instead of right: change base angle from 90° to 270°:
    // const base = 270; then recompute start/end around 'base'.
    // Add sigmoid curve connecting CLS AUD line to CLS dot line
    // Remove conditional - just try to create it if possible
    if (window.clsEndpoints && window.clsEndpoints.dotLineEndX) {
  // Create sigmoid S-curve - shifted right (preserve endpoint slopes + vertical fallback)
  // Create sigmoid S-curve - shifted right (preserve endpoint slopes + robust fallbacks)
  var shiftX = 0; // No shift - lines already extended

  // Define start and end points from CLS endpoints
  // Start from dot (top) and end at AUD (bottom) for correct downward slope
  var clsStartX = window.clsEndpoints.dotLineEndX;
  var clsStartY = window.clsEndpoints.dotLineEndY;
  var clsEndX = window.clsEndpoints.audLineEndX || window.clsEndpoints.dotLineEndX - 100; // Default to 100px left if not set
  var clsEndY = window.clsEndpoints.audLineEndY || window.clsEndpoints.dotLineEndY + 100; // Default to 100px down if not set

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

  // REMOVED: Sigmoid curve from CLS dot
  // var svgEl = document.getElementById('circles-arc-svg') || document.querySelector('svg');
  // var sigmoidPath = document.getElementById('sigmoid-path');
  // if (!sigmoidPath) {
  //   sigmoidPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  //   sigmoidPath.setAttribute('id', 'sigmoid-path');
  //   if (svgEl) svgEl.appendChild(sigmoidPath);
  // }

  // Apply geometry + styling
  // sigmoidPath.setAttribute('d', sigmoidD);
  // sigmoidPath.setAttribute('stroke', '#CCFF00'); // neon lime green
  // sigmoidPath.setAttribute('stroke-width', '8');
  // sigmoidPath.setAttribute('fill', 'none');
  // sigmoidPath.setAttribute('stroke-linecap', 'round');

  // No extension lines needed since we're using original endpoints
    } // End of sigmoid curve conditional

  // Add new pacs-style box to the left of NPP with bounding box
  console.log('Creating new pacs-style box left of NPP');

  // Get NPP box final position
  const finalNppBox = document.getElementById('npp-box');
  if (finalNppBox && window.swiftHvcsElements) {
const nppX = parseFloat(finalNppBox.getAttribute('x'));
const nppY = parseFloat(finalNppBox.getAttribute('y'));
const nppWidth = parseFloat(finalNppBox.getAttribute('width'));
const nppHeight = parseFloat(finalNppBox.getAttribute('height'));

// Verify NPP BI is aligned with ESAs
console.log('NPP BI (SWIFT) box position check:', {
  nppY: nppY,
  esasY: window.esasBoxData ? window.esasBoxData.y : 'not set',
  aligned: window.esasBoxData && Math.abs(nppY - window.esasBoxData.y) < 1
});

// Get SWIFT HVCS bounding box dimensions for reference
const swiftHvcsBox = window.swiftHvcsElements.boundingBox;
const hvcsBoxWidth = parseFloat(swiftHvcsBox.getAttribute('width'));
const hvcsBoxHeight = parseFloat(swiftHvcsBox.getAttribute('height'));
const hvcsBoxY = parseFloat(swiftHvcsBox.getAttribute('y'));

// Get the small rect height for proper calculation
const existingPacsRect = window.swiftHvcsElements.pacsElements[0].rect;
const smallRectHeight = parseFloat(existingPacsRect.getAttribute('height'));

// Calculate the new height with updated label space
const verticalGapRef = 5; // Use the standard vertical gap (declare first)
const labelSpaceUpdated = 45; // Match the increased SWIFT HVCS label space
const boundingBoxPaddingVRef = 5; // Same as SWIFT HVCS
const newBoundingBoxHeight = (smallRectHeight + verticalGapRef) * 3 - verticalGapRef + boundingBoxPaddingVRef * 2 + labelSpaceUpdated - 20; // Reduced by 20 pixels

// Calculate position for new bounding box
// Position bottom 5 pixels below NPP BI bottom, then shift upward by BSCT height
const nppBIBottom = nppY + nppHeight;
const newBoundingBoxBottom = nppBIBottom + 5; // 5 pixels below NPP BI bottom
const boundingBoxVerticalShift = smallRectHeight; // Match BSCT height
const adjustedBoundingBoxBottom = newBoundingBoxBottom - boundingBoxVerticalShift;
const boundingBoxY = adjustedBoundingBoxBottom - newBoundingBoxHeight; // Calculate top from adjusted bottom

// Position it to the left of NPP with same gap
const newBoundingBoxX = nppX - verticalGapRef - hvcsBoxWidth;

// Create the bounding box first (so it's behind)
const newBoundingBox = createStyledRect(
  newBoundingBoxX,
  boundingBoxY,
  hvcsBoxWidth,
  newBoundingBoxHeight + 5,
  {
    fill: 'rgb(80,58,130)', // Dark purple interior
    stroke: 'rgb(158,138,239)', // Light purple border
    strokeWidth: '2.5',
    rx: '12', // Rounded corners (matching BPAY)
    ry: '12' // Rounded corners (matching BPAY)
  }
);
newBoundingBox.setAttribute('id', 'npp-purple-box');

// Insert into backgroundGroup to be behind everything
const backgroundGroupRef = document.getElementById('background-elements');
if (backgroundGroupRef) {
  backgroundGroupRef.appendChild(newBoundingBox);
} else {
  // If background group doesn't exist, insert before labels
  svg.insertBefore(newBoundingBox, labelsGroup);
}

window.nppBoundingData = {
  x: newBoundingBoxX,
  y: boundingBoxY,
  width: hvcsBoxWidth,
  height: newBoundingBoxHeight
};

// Now create the pacs-style box inside the bounding box
// Match the style and size of pacs.008
const pacsStyle = {
  fill: '#5dd9b8', // Green SWIFT line color
  stroke: '#ffffff', // Very thin white border
  strokeWidth: '0.5',
  rx: '12', // More rounded corners
  ry: '12' // More rounded corners
};

// Get dimensions from existing pacs boxes
const existingPacsRectForBSCT = window.swiftHvcsElements.pacsElements[1].rect; // pacs.008
const pacsBoxHeight = parseFloat(existingPacsRectForBSCT.getAttribute('height'));

// Position BSCT box INSIDE the NPP BI bounding box
const internalPadding = 10;
const pacsBoxWidth = hvcsBoxWidth - (internalPadding * 2);
const pacsBoxX = newBoundingBoxX + internalPadding; // Inside the bounding box
// Position BSCT at the TRUE vertical center of the NPP BI (SWIFT) bounding box
// The bounding box center should be LOWER than the NPP center since NPP is at the top
const nppBiBoundingBoxCenterY = boundingBoxY + (newBoundingBoxHeight / 2);
// Recalculate vertical placement so BSCT sits between PayID and PayTo
const boxGap = 5; // Same vertical gap used between stacked boxes
const bottomPadding = 5; // Match padding used below
// PayTo is now at the bottom
const payToBaseY = boundingBoxY + newBoundingBoxHeight - bottomPadding - pacsBoxHeight;
const adjustedPayToBoxY = payToBaseY; // PayTo at bottom
// BSCT is now in the middle
const bsctBoxY = adjustedPayToBoxY - pacsBoxHeight - boxGap;
const adjustedBsctY = bsctBoxY; // BSCT in middle
// PayID stays at the top
const payIdBoxY = adjustedBsctY - pacsBoxHeight - boxGap;
const adjustedPayIdBoxY = payIdBoxY + 1; // Slight downward adjustment for PayID
const pacsBoxY = adjustedBsctY; // pacsBoxY points to BSCT position

// Debug logging
console.log('BSCT Debug: boundingBoxY=', boundingBoxY, 'height=', newBoundingBoxHeight, 'center=', nppBiBoundingBoxCenterY);

// Position NPP label centered in the space above PayID box
// Calculate the center between the top of the purple box and the top of PayID box
const payIdTopY = adjustedPayIdBoxY; // Now adjustedPayIdBoxY is defined
const nppLabelY = boundingBoxY + (payIdTopY - boundingBoxY) / 2 + 3; // Center between top and PayID, nudged down slightly
const nppBoundingLabel = createStyledText(
  newBoundingBoxX + hvcsBoxWidth / 2,
  nppLabelY,
  'NPP',
  {
    fill: '#ffffff', // White text (matching BPAY)
    fontSize: '18', // Larger font size
    fontWeight: 'bold'
  }
);
labelsGroup.appendChild(nppBoundingLabel);
window.nppLabelElement = nppBoundingLabel;

const newPacsBox = createStyledRect(pacsBoxX, pacsBoxY, pacsBoxWidth, pacsBoxHeight, pacsStyle);
labelsGroup.appendChild(newPacsBox);

const newPacsText = createStyledText(
  pacsBoxX + pacsBoxWidth / 2,
  pacsBoxY + pacsBoxHeight / 2,
  'BSCT',
  {
    fill: '#063d38', // Dark text (same as pacs boxes)
    fontSize: '11'
  }
);
labelsGroup.appendChild(newPacsText);

// PayTo box (bottom) - light purple style
const purpleBoxStyle = {
  fill: 'rgb(158,138,239)', // Light purple (matching borders)
  stroke: '#ffffff', // Very thin white border
  strokeWidth: '0.5',
  rx: '12',
  ry: '12'
};
const payToBox = createStyledRect(pacsBoxX, adjustedPayToBoxY, pacsBoxWidth, pacsBoxHeight, purpleBoxStyle);
labelsGroup.appendChild(payToBox);

const payToText = createStyledText(
  pacsBoxX + pacsBoxWidth / 2,
  adjustedPayToBoxY + pacsBoxHeight / 2,
  'PayTo',
  {
    fill: 'rgb(30,20,60)', // Darker purple text
    fontSize: '11'
  }
);
labelsGroup.appendChild(payToText);

// PayID box (above PayTo) - dark purple style
// Now update BSCT box position to use the new Y
// First remove the old BSCT box
const oldBsctBox = newPacsBox;
oldBsctBox.setAttribute('y', adjustedBsctY.toFixed(2));
// Update BSCT text position
newPacsText.setAttribute('y', (adjustedBsctY + pacsBoxHeight / 2).toFixed(2));
const payIdBox = createStyledRect(pacsBoxX, adjustedPayIdBoxY, pacsBoxWidth, pacsBoxHeight, purpleBoxStyle);
labelsGroup.appendChild(payIdBox);

const payIdText = createStyledText(
  pacsBoxX + pacsBoxWidth / 2,
  adjustedPayIdBoxY + pacsBoxHeight / 2,
  'PayID',
  {
    fill: 'rgb(30,20,60)', // Darker purple text
    fontSize: '11'
  }
);
labelsGroup.appendChild(payIdText);

// Draw connecting line from BSCT box to NPP BI (SWIFT) bounding box
// Start from right edge of BSCT box (using new position), middle height
const lineStartX = pacsBoxX + pacsBoxWidth;
const lineStartY = adjustedBsctY + pacsBoxHeight / 2;

// End at left edge of purple NPP box at BSCT height (horizontal line)
const lineEndX = nppX;
const lineEndY = lineStartY; // Same Y for horizontal line

const connectingLine = createStyledLine(
  lineStartX, lineStartY,
  lineEndX, lineEndY,
  {
    stroke: '#5dd9b8',
    strokeWidth: '6',
    strokeLinecap: 'round',
    id: 'new-pacs-to-npp-line'
  }
);

// Insert line before labels so it appears behind
svg.insertBefore(connectingLine, labelsGroup);

console.log('Created new pacs-style box and bounding box:', {
  boundingBox: { x: newBoundingBoxX, y: boundingBoxY, width: hvcsBoxWidth, height: newBoundingBoxHeight },
  pacsBox: { x: pacsBoxX, y: pacsBoxY, width: pacsBoxWidth, height: pacsBoxHeight },
  line: { from: [lineStartX, lineStartY], to: [lineEndX, lineEndY] }
});

updateNppToAdiLine();

// Now move ONLY the purple NPP box to align its bottom with NPP BI (SWIFT) bounding box bottom
// The NPP BI bounding box bottom is at: boundingBoxY + newBoundingBoxHeight
const nppBiBoundingBoxBottom = boundingBoxY + newBoundingBoxHeight;
// We want NPP bottom to align with that
const desiredNppBottom = nppBiBoundingBoxBottom;
const desiredNppY = desiredNppBottom - nppHeight;

// Update NPP to FSS path to exit at same Y as BSCT line
const nppToFssPathElement = document.getElementById('npp-to-fss-path');
if (nppToFssPathElement && desiredNppY !== undefined) {
  // The BSCT line enters NPP at lineStartY
  const alignedY = lineStartY;

  // Get the current path data
  const currentPath = nppToFssPathElement.getAttribute('d');

  // Update the starting Y coordinate in the path
  // The path starts with M [x] [y] where y is what we want to change
  const updatedPath = currentPath.replace(/M ([\d.]+) ([\d.]+)/, `M $1 ${alignedY.toFixed(2)}`);

  // Also update the first control point Y to maintain smooth curve
  const updatedPathWithControl = updatedPath.replace(/C ([\d.]+) ([\d.]+)/, `C $1 ${alignedY.toFixed(2)}`);

  nppToFssPathElement.setAttribute('d', updatedPathWithControl);

  console.log('Aligned NPP to FSS exit with BSCT entry at Y:', alignedY);
}

// Move the NPP box
finalNppBox.setAttribute('y', desiredNppY.toFixed(2));

// Update NPP text positions
if (window.nppTextElements) {
  const nppYAdjustment = desiredNppY - nppY;
  ['top', 'bottom'].forEach(key => {
    const el = window.nppTextElements[key];
    if (el) {
      const currentY = parseFloat(el.getAttribute('y'));
      el.setAttribute('y', (currentY + nppYAdjustment).toFixed(2));
    }
  });
}

// No need to update the connecting line - it stays horizontal to NPP BI bounding box

console.log('Moved NPP box to align bottom with NPP BI bounding box:', {
  nppBiBoundingBoxBottom,
  oldNppY: nppY,
  newNppY: desiredNppY
});

// Add Osko box directly above NPP box
const oskoGap = 5; // Small gap like between pacs boxes
// Use same height as Direct Entry box
const directEntryHeight = typeof window.pexaExtensions !== 'undefined' && window.pexaExtensions.stackHeader ?
  window.pexaExtensions.stackHeader.height :
  (typeof pexaConveyHeight !== 'undefined' ? pexaConveyHeight : 25);
const oskoHeight = directEntryHeight; // Same height as Direct Entry box
// Position above NPP bounding box, not just NPP rect
const nppTopY = window.nppBoundingData ? window.nppBoundingData.y : desiredNppY;
const oskoY = nppTopY - oskoGap - oskoHeight; // Position above NPP bounding box
const oskoWidth = hvcsBoxWidth; // Same width as NPP BI (SWIFT) bounding box
const oskoX = newBoundingBoxX; // Same X as NPP BI (SWIFT) bounding box

const oskoBox = createStyledRect(oskoX, oskoY, oskoWidth, oskoHeight, {
  fill: 'rgb(80,58,130)', // Dark purple interior
  stroke: 'rgb(158,138,239)', // Light purple border
  strokeWidth: '2.5',
  rx: '12', // Same rounded corners as PayID/PayTo boxes inside NPP
  ry: '12'
});
labelsGroup.appendChild(oskoBox);

// Add Osko label
const oskoText = createStyledText(
  oskoX + oskoWidth / 2,
  oskoY + oskoHeight / 2,
  'Osko',
  {
    fill: '#ffffff', // White text (matching BPAY)
    fontSize: '14', // Same font size as Direct Entry
    fontWeight: 'bold' // Same weight as Direct Entry
  }
);
labelsGroup.appendChild(oskoText);

const oskoLine = createStyledLine(
  oskoX + oskoWidth / 2,
  oskoY + oskoHeight, // Start from bottom of Osko
  (window.nppBoundingData ? window.nppBoundingData.x + window.nppBoundingData.width / 2 : window.nppBoxData.x + window.nppBoxData.width / 2),
  (window.nppBoundingData ? window.nppBoundingData.y : desiredNppY), // End at top of NPP
  {
    stroke: 'rgb(180,160,220)', // Light purple
    strokeWidth: '8', // Made thicker (was 4)
    strokeLinecap: 'round'
  }
);
// Insert the line before the purple box so it renders underneath
const purpleBox = document.getElementById('npp-purple-box');
if (purpleBox && purpleBox.parentNode) {
  purpleBox.parentNode.insertBefore(oskoLine, purpleBox);
} else {
  // Fallback: insert at the beginning of the labels group
  labelsGroup.insertBefore(oskoLine, labelsGroup.firstChild);
}

const updateOskoLine = () => {
  if (!window.oskoElements || !window.oskoElements.line) {
    return;
  }
  const oskoRect = window.oskoElements.box;
  const oskoXPos = parseFloat(oskoRect.getAttribute('x'));
  const oskoWidthPos = parseFloat(oskoRect.getAttribute('width'));
  const oskoYPos = parseFloat(oskoRect.getAttribute('y'));
  const oskoHeightPos = parseFloat(oskoRect.getAttribute('height'));
  if (!Number.isFinite(oskoXPos) || !Number.isFinite(oskoWidthPos) || !Number.isFinite(oskoYPos) || !Number.isFinite(oskoHeightPos)) {
    return;
  }
  const bounding = window.nppBoundingData;
  const fallbackRect = document.getElementById('npp-box');
  let nppXPos = bounding ? bounding.x : (fallbackRect ? parseFloat(fallbackRect.getAttribute('x')) : NaN);
  let nppWidthPos = bounding ? bounding.width : (fallbackRect ? parseFloat(fallbackRect.getAttribute('width')) : NaN);
  let nppYPos = bounding ? bounding.y : (fallbackRect ? parseFloat(fallbackRect.getAttribute('y')) : NaN);
  let nppHeightPos = bounding ? bounding.height : (fallbackRect ? parseFloat(fallbackRect.getAttribute('height')) : NaN);
  if (![nppXPos, nppWidthPos, nppYPos, nppHeightPos].every(Number.isFinite)) {
    return;
  }
  const lineEl = window.oskoElements.line;
  lineEl.setAttribute('x1', (oskoXPos + oskoWidthPos / 2).toFixed(2));
  lineEl.setAttribute('y1', (oskoYPos + oskoHeightPos).toFixed(2)); // Start from bottom of Osko
  lineEl.setAttribute('x2', (nppXPos + nppWidthPos / 2).toFixed(2));
  lineEl.setAttribute('y2', nppYPos.toFixed(2)); // End at top of NPP
};

window.oskoElements = {
  box: oskoBox,
  text: oskoText,
  line: oskoLine
};
window.updateOskoLine = updateOskoLine;

// Update the OSKO to ADI curve now that OSKO box exists
if (typeof window.updateOskoToAdiLine === 'function') {
  window.updateOskoToAdiLine();
}
updateOskoLine();
// XXX-to-ADI line update removed
// if (typeof window.updateXXXToAdiLine === 'function') {
//   window.updateXXXToAdiLine();
// }
if (typeof window.updateDirectEntryToAdiLine === 'function') {
  window.updateDirectEntryToAdiLine();
}
if (typeof window.updateOskoToAdiLine === 'function') {
  window.updateOskoToAdiLine();
}

  } // Close if (finalNppBox && window.swiftHvcsElements)

  // Add CLS AUD to RITS line at the end after all adjustments
  const clsAudRectFinal = document.getElementById('cls-aud-rect');
  if (clsAudRectFinal) {
    const clsToRitsLineFinal = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    // Get the actual final position of CLS AUD box
    const boxX = parseFloat(clsAudRectFinal.getAttribute('x'));
const boxY = parseFloat(clsAudRectFinal.getAttribute('y'));
const boxWidth = parseFloat(clsAudRectFinal.getAttribute('width'));
const boxHeight = parseFloat(clsAudRectFinal.getAttribute('height'));

// Start from right edge center of CLS AUD box
const clsLineStartX = boxX + boxWidth;
const clsLineStartY = boxY + boxHeight / 2;

console.log('CLS AUD to RITS line FINAL position:', {
  boxX: boxX,
  boxY: boxY,
  boxWidth: boxWidth,
  boxHeight: boxHeight,
  rightEdgeX: clsLineStartX,
  centerY: clsLineStartY
});

// Get RITS circle position
const ritsCircleX = 300; // cx value
const ritsCircleY = 450; // cy value  
const ritsCircleRadius = 113; // r value

// Calculate angle from CLS AUD to RITS center
const dx = ritsCircleX - clsLineStartX;
const dy = ritsCircleY - clsLineStartY;
const angleToCenter = Math.atan2(dy, dx);

// End point on RITS circle edge
const clsLineEndX = ritsCircleX - ritsCircleRadius * Math.cos(angleToCenter);
const clsLineEndY = ritsCircleY - ritsCircleRadius * Math.sin(angleToCenter);

// Control points for J-shaped curve (matching SWIFT PDS pattern)
const distX = clsLineEndX - clsLineStartX;
const distY = clsLineEndY - clsLineStartY;

// J-shape: go straight right, then curve down/up to target
const controlX1 = clsLineStartX + Math.abs(distX) * 0.7; // Go mostly horizontal first
const controlY1 = clsLineStartY; // Keep same height initially
const controlX2 = clsLineEndX - 10; // Near the end point
const controlY2 = clsLineStartY + distY * 0.5; // Start curving vertically

const clsToRitsPath = `M ${clsLineStartX} ${clsLineStartY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${clsLineEndX} ${clsLineEndY}`;

clsToRitsLineFinal.setAttribute('d', clsToRitsPath);
clsToRitsLineFinal.setAttribute('stroke', '#00FF33'); // Neon green
clsToRitsLineFinal.setAttribute('stroke-width', '6'); // Thick line
clsToRitsLineFinal.setAttribute('fill', 'none');
clsToRitsLineFinal.setAttribute('stroke-linecap', 'round');
clsToRitsLineFinal.setAttribute('id', 'cls-to-rits-line-final');

    // Insert at beginning of SVG so it goes behind the blue circle
    svg.insertBefore(clsToRitsLineFinal, svg.firstChild);
  }

  // Create S-curve from CLS AUD line to CLS dot at the very end

// Create S-curve from CLS AUD line to CLS dot at the very end
  console.log('End of script - checking for S-curve creation.');
  console.log('window.clsEndpoints:', window.clsEndpoints);

  if (!window.clsEndpoints) {
    window.clsEndpoints = {};
  }

  const ensureClsEndpointData = () => {
    const endpoints = window.clsEndpoints;

    // Ensure we have CLS dot geometry (center + radius) to derive edge position
    if ((endpoints.clsCircleCenterX === undefined ||
         endpoints.clsCircleCenterY === undefined ||
         endpoints.clsCircleRadius === undefined) && typeof document !== 'undefined') {
      const arcGroup = document.getElementById('arc-circles');
      if (arcGroup) {
        const clsCircle = arcGroup.querySelector('circle:last-of-type');
        if (clsCircle) {
          const centerX = parseFloat(clsCircle.getAttribute('cx'));
          const centerY = parseFloat(clsCircle.getAttribute('cy'));
          const radius = parseFloat(clsCircle.getAttribute('r'));
          if (Number.isFinite(centerX) && Number.isFinite(centerY) && Number.isFinite(radius)) {
            endpoints.clsCircleCenterX = centerX;
            endpoints.clsCircleCenterY = centerY;
            endpoints.clsCircleRadius = radius;
          }
        }
      }
    }

    if ((endpoints.clsCircleEdgeX === undefined || endpoints.clsCircleEdgeY === undefined) &&
        endpoints.clsCircleCenterX !== undefined && endpoints.clsCircleRadius !== undefined) {
      endpoints.clsCircleEdgeX = endpoints.clsCircleCenterX - endpoints.clsCircleRadius;
      endpoints.clsCircleEdgeY = endpoints.clsCircleCenterY;
    }

    // Fallback for neon line endpoint - sample path if coordinates missing
    if ((endpoints.neonLineEndX === undefined || endpoints.neonLineEndY === undefined) && typeof document !== 'undefined') {
      const neonPath = document.getElementById('cls-aud-line-new') || document.getElementById('cls-to-rits-line-final');
      if (neonPath && typeof neonPath.getTotalLength === 'function') {
        try {
          const totalLength = neonPath.getTotalLength();
          const point = neonPath.getPointAtLength(totalLength);
          if (Number.isFinite(point.x) && Number.isFinite(point.y)) {
            endpoints.neonLineEndX = point.x;
            endpoints.neonLineEndY = point.y;
          }
        } catch (err) {
          console.warn('Unable to sample CLS neon path endpoint (fallback):', err);
        }
      }
    }
  };

  ensureClsEndpointData();

  if (window.clsEndpoints) {
    console.log('audLineEndX:', window.clsEndpoints.audLineEndX);
    console.log('audLineEndY:', window.clsEndpoints.audLineEndY);
    console.log('dotLineEndX:', window.clsEndpoints.dotLineEndX);
    console.log('dotLineEndY:', window.clsEndpoints.dotLineEndY);
  }

  if (window.clsEndpoints &&
      (window.clsEndpoints.neonLineEndX !== undefined || window.clsEndpoints.audLineEndX !== undefined) &&
      (window.clsEndpoints.neonLineEndY !== undefined || window.clsEndpoints.audLineEndY !== undefined) &&
      (window.clsEndpoints.clsCircleEdgeX !== undefined || window.clsEndpoints.clsCircleCenterX !== undefined)) {
    let startX = window.clsEndpoints.neonLineEndX !== undefined ? Number(window.clsEndpoints.neonLineEndX)
                : Number(window.clsEndpoints.audLineEndX);
    let startY = window.clsEndpoints.neonLineEndY !== undefined ? Number(window.clsEndpoints.neonLineEndY)
                : Number(window.clsEndpoints.audLineEndY);

    const clsNeonPath = document.getElementById('cls-aud-line-new');
    if (clsNeonPath && typeof clsNeonPath.getTotalLength === 'function') {
      try {
        const totalLength = clsNeonPath.getTotalLength();
        const point = clsNeonPath.getPointAtLength(totalLength);
        if (Number.isFinite(point.x) && Number.isFinite(point.y)) {
          startX = point.x;
          startY = point.y;
        }
      } catch (err) {
        console.warn('Unable to sample CLS neon path endpoint:', err);
      }
    } else if (window.clsEndpoints.neonLineEndX === undefined && window.clsEndpoints.neonLineEndY === undefined) {
      // Last resort: sample the final CLS-to-RITS line
      const fallbackPath = document.getElementById('cls-to-rits-line-final');
      if (fallbackPath && typeof fallbackPath.getTotalLength === 'function') {
        try {
          const totalLength = fallbackPath.getTotalLength();
          const point = fallbackPath.getPointAtLength(totalLength);
          if (Number.isFinite(point.x) && Number.isFinite(point.y)) {
            startX = point.x;
            startY = point.y;
          }
        } catch (err) {
          console.warn('Unable to sample CLS fallback line endpoint:', err);
        }
      }
    }
    const endX = window.clsEndpoints.clsCircleEdgeX !== undefined ? Number(window.clsEndpoints.clsCircleEdgeX)
                 : Number(window.clsEndpoints.clsCircleCenterX);
    const endY = window.clsEndpoints.clsCircleEdgeY !== undefined ? Number(window.clsEndpoints.clsCircleEdgeY)
                 : Number(window.clsEndpoints.clsCircleCenterY);

    if (Number.isFinite(startX) && Number.isFinite(startY) && Number.isFinite(endX) && Number.isFinite(endY)) {
      const dx = endX - startX;
      const dy = endY - startY;

      const direction = dx >= 0 ? 1 : -1;
      const controlOffset = Math.max(60, Math.abs(dx) * 0.35);

      const cp1X = startX + direction * controlOffset;
      const cp1Y = startY;
      const cp2X = endX - direction * controlOffset;
      const cp2Y = endY;

      const pathData = `M ${startX.toFixed(2)} ${startY.toFixed(2)} ` +
                       `C ${cp1X.toFixed(2)} ${cp1Y.toFixed(2)}, ` +
                         `${cp2X.toFixed(2)} ${cp2Y.toFixed(2)}, ` +
                         `${endX.toFixed(2)} ${endY.toFixed(2)}`;

      const svg = document.getElementById('diagram');
      let container = document.getElementById('cls-s-curve-group');
      if (!container && svg) {
        container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        container.setAttribute('id', 'cls-s-curve-group');
        const bigGroup = document.getElementById('big-group');
        if (bigGroup && bigGroup.nextSibling) {
          svg.insertBefore(container, bigGroup.nextSibling);
        } else {
          svg.appendChild(container);
        }
      }

      let sCurvePath = document.getElementById('cls-s-curve');
      if (!sCurvePath) {
        sCurvePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        sCurvePath.setAttribute('id', 'cls-s-curve');
        if (container) {
          container.appendChild(sCurvePath);
        } else if (svg) {
          svg.appendChild(sCurvePath);
        }
      } else if (container && sCurvePath.parentNode !== container) {
        container.appendChild(sCurvePath);
      }

      if (sCurvePath) {
        sCurvePath.setAttribute('d', pathData);
        sCurvePath.setAttribute('stroke', '#00FF33');
        sCurvePath.setAttribute('stroke-width', '6');
        sCurvePath.setAttribute('fill', 'none');
        sCurvePath.setAttribute('stroke-linecap', 'round');
        sCurvePath.setAttribute('stroke-linejoin', 'round');
      }

      console.log('CLS S-curve created from neon line to CLS dot.');
    } else {
      console.log('CLS S-curve skipped: invalid numeric endpoints', {
        startX,
        startY,
        endX,
        endY
      });
    }
  } else {
    console.log('window.clsEndpoints not found or incomplete');
  }

  console.log('Test 3: After S-curve check');
    } // End of main for loop

  // Now create group boxes after all dots are positioned
  console.log('Creating group boxes after main loop');
  console.log('window.dotPositions available:', Object.keys(window.dotPositions || {}).length);

  // Add ADI box (dots 1-91)
  if (window.dotPositions) {
    const dotRadius = 3.5; // Define dotRadius here since it's out of scope
    const svg = document.getElementById('diagram');
    const labelsGroup = document.getElementById('dot-labels');

    let minX2 = null, minY2 = null, maxX2 = null, maxY2 = null;

    // Find boundaries excluding special dots
    console.log('ADI box debug: Looking for dots 1-91 after main loop');
    let foundDots = 0;
    for (let j = 1; j < 92; j++) {  // Start from 1 (skip RBA) and go up to 91
      if (window.dotPositions[j]) {
        foundDots++;
        if (minX2 === null || window.dotPositions[j].x < minX2) minX2 = window.dotPositions[j].x;
        if (maxX2 === null || window.dotPositions[j].x > maxX2) maxX2 = window.dotPositions[j].x;
        if (minY2 === null || window.dotPositions[j].y < minY2) minY2 = window.dotPositions[j].y;
        if (maxY2 === null || window.dotPositions[j].y > maxY2) maxY2 = window.dotPositions[j].y;
      }
    }
    console.log('ADI box debug: Found', foundDots, 'dots out of 91 expected');

    console.log('ADI box debug: minX2=', minX2, 'maxX2=', maxX2);
    if (minX2 !== null && maxX2 !== null) {
      console.log('ADI box debug: Creating ADI box');
      // Use similar padding but slightly less
      const innerLeftPadding = 60; // Increased to move left edge left
      const innerTopPadding = 30;
      const innerBottomPadding = 6; // Slightly increased to add extra bottom padding
      const innerRightPadding = 290;

      const adiRect = createStyledRect(
        minX2 - innerLeftPadding - dotRadius,
        minY2 - innerTopPadding - dotRadius,
        (maxX2 - minX2) + innerLeftPadding + innerRightPadding + dotRadius * 2,
        (maxY2 - minY2) + innerTopPadding + innerBottomPadding + dotRadius * 2,
        {
          fill: 'rgba(140, 165, 220, 1)', // Light blue fully opaque
          stroke: '#2563eb', // Darker blue border
          strokeWidth: '2',
          rx: '8' // Slightly less rounded corners
        }
      );
      adiRect.setAttribute('fill-opacity', '0.65'); // Less opaque

      const esaRect = document.getElementById('blue-dots-background');
      svg.insertBefore(adiRect, esaRect.nextSibling);

      // Store ADI box position for HVCS line
      if (!window.adiBoxData) window.adiBoxData = {};
      window.adiBoxData.x = minX2 - innerLeftPadding - dotRadius;
      window.adiBoxData.y = minY2 - innerTopPadding - dotRadius;
      window.adiBoxData.width = (maxX2 - minX2) + innerLeftPadding + innerRightPadding + dotRadius * 2;
      window.adiBoxData.height = (maxY2 - minY2) + innerTopPadding + innerBottomPadding + dotRadius * 2;

      // Add "ADIs" text
      const adiRectX = parseFloat(adiRect.getAttribute('x'));
      const adiRectY = parseFloat(adiRect.getAttribute('y'));
      const adiRectWidth = parseFloat(adiRect.getAttribute('width'));

      const adisText = createStyledText(
        adiRectX + adiRectWidth - 15,
        adiRectY + 35,
        'ADIs',
        {
          textAnchor: 'end',
          fill: '#ffffff', // White (matching Non-ADIs label)
          fontSize: '24' // Slightly bigger
        }
      );
      labelsGroup.appendChild(adisText);
    }
  }

  console.log('Test 4: After IIFE');


}

window.initializeDiagram = initializeDiagram;
