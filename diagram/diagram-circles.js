// Circle rendering and positioning logic

/**
 * Initialize and position the main RITS (blue) and FSS (orange/yellow) circles
 * @param {Object} params - Circle parameters
 * @returns {Object} - Circle positions {cySmall}
 */
function initializeMainCircles(params) {
  const {cx, cyBig, rBig, rSmall, strokeW} = params;

  // Position blue circle (RITS) - update all layers
  const bigOuter = document.getElementById('big-outer');
  const bigGearBorder = document.getElementById('big-gear-border');
  const bigInner = document.getElementById('big-inner');

  bigOuter.setAttribute('cx', cx);
  bigOuter.setAttribute('cy', cyBig);
  bigOuter.setAttribute('r', rBig + strokeW/2);

  bigInner.setAttribute('cx', cx);
  bigInner.setAttribute('cy', cyBig);
  bigInner.setAttribute('r', rBig - strokeW * 2.5);

  // Position orange/yellow circle (FSS)
  const smallOuter = document.getElementById('small-outer');
  const smallGearBorder = document.getElementById('small-gear-border');
  const smallInner = document.getElementById('small-inner');

  const cySmall = cyBig - (rBig + rSmall + strokeW);

  smallOuter.setAttribute('cx', cx);
  smallOuter.setAttribute('cy', cySmall);
  smallOuter.setAttribute('r', rSmall + strokeW/2);

  smallInner.setAttribute('cx', cx);
  smallInner.setAttribute('cy', cySmall);
  smallInner.setAttribute('r', rSmall - strokeW * 2);

  // Update circle labels
  const smallLabel = document.getElementById('small-label');
  if (smallLabel) {
    smallLabel.setAttribute('x', cx);
    smallLabel.setAttribute('y', cySmall);
  }

  const bigLabel = document.getElementById('big-label');
  if (bigLabel) {
    bigLabel.setAttribute('x', cx);
    bigLabel.setAttribute('y', cyBig);
    const tspans = bigLabel.getElementsByTagName('tspan');
    for (let tspan of tspans) {
      tspan.setAttribute('x', cx);
    }
  }

  // Create gear paths for both circles
  createMainCircleGears(cx, cyBig, cySmall, rBig, rSmall, strokeW);

  return {cySmall};
}

/**
 * Create gear-shaped borders for RITS and FSS circles
 */
function createMainCircleGears(cx, cyBig, cySmall, rBig, rSmall, strokeW) {
  // Big circle (RITS) gear
  const bigGearBorder = document.getElementById('big-gear-border');
  if (bigGearBorder) {
    const outerRadius = rBig - strokeW * 0.75;
    const innerRadius = rBig - strokeW * 2.5;
    const teeth = 20;
    const toothHeight = 6;

    let path = createGearPath(outerRadius - toothHeight, teeth, toothHeight, 0.25);
    path += ` M ${innerRadius} 0 A ${innerRadius} ${innerRadius} 0 1 0 ${-innerRadius} 0 A ${innerRadius} ${innerRadius} 0 1 0 ${innerRadius} 0`;

    bigGearBorder.setAttribute('d', path);
    bigGearBorder.setAttribute('transform', `translate(${cx}, ${cyBig})`);
    bigGearBorder.setAttribute('fill-rule', 'evenodd');
  }

  const bigGear = document.getElementById('big-gear');
  if (bigGear) {
    const bigInnerRadius = rBig - strokeW * 2.5;
    const bigGearRadius = bigInnerRadius - 12;
    const bigToothHeight = 8;
    bigGear.setAttribute('d', createGearPath(bigGearRadius - bigToothHeight, 16, bigToothHeight, 0.25));
    bigGear.setAttribute('transform', `translate(${cx}, ${cyBig})`);
  }

  // Small circle (FSS) gear
  const smallGearBorder = document.getElementById('small-gear-border');
  if (smallGearBorder) {
    const outerRadius = rSmall - strokeW * 0.3;
    const innerRadius = rSmall - strokeW * 2;
    const teeth = 12;
    const toothHeight = 4;

    let path = createGearPath(outerRadius - toothHeight, teeth, toothHeight, 0.25);
    path += ` M ${innerRadius} 0 A ${innerRadius} ${innerRadius} 0 1 0 ${-innerRadius} 0 A ${innerRadius} ${innerRadius} 0 1 0 ${innerRadius} 0`;

    smallGearBorder.setAttribute('d', path);
    smallGearBorder.setAttribute('transform', `translate(${cx}, ${cySmall})`);
    smallGearBorder.setAttribute('fill-rule', 'evenodd');
  }

  const smallGear = document.getElementById('small-gear');
  if (smallGear) {
    const smallGearRadius = (rSmall - strokeW * 2) - 8;
    const smallToothHeight = 4;
    smallGear.setAttribute('d', createGearPath(smallGearRadius - smallToothHeight, 10, smallToothHeight, 0.25));
    smallGear.setAttribute('transform', `translate(${cx}, ${cySmall})`);
  }
}

/**
 * Create LVSS gear circle with layered effect
 * @param {Object} params - LVSS parameters
 * @param {Object} labelsGroup - SVG group for labels
 * @returns {Object} - LVSS position data
 */
function createLvssCircle(params, labelsGroup) {
  const {redCircleX} = params;

  const lvssGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  // Calculate LVSS Y position
  const redCircleRadius = 37 * 1.2 * 0.9 * 0.9 * 0.9; // 10% smaller
  const mastercardY_ref = window.hexagonPositions ? window.hexagonPositions.mastercardY || 320 : 320;
  const verticalGap_ref = 5;
  const hexHeight_ref = window.hexagonPositions ? window.hexagonPositions.hexHeight || 20 : 20;
  const apcsY_ref = mastercardY_ref - (verticalGap_ref * 2) - hexHeight_ref - 20;

  let redCircleY;
  if (window.needsLvssUpdate && window.needsLvssUpdate.y) {
    redCircleY = window.needsLvssUpdate.y + 5;
  } else if (window.lvssBoxPositions && window.lvssBoxPositions.cecsY) {
    redCircleY = window.lvssBoxPositions.cecsY + (window.lvssBoxPositions.boxHeight / 2) + 5;
  } else {
    redCircleY = apcsY_ref + hexHeight_ref / 2 + 5;
  }

  // Create gear border
  const strokeW = 3;
  const outerRadius = redCircleRadius - strokeW * 0.5;
  const innerRadius = redCircleRadius - strokeW * 2;
  const teeth = 12;
  const toothHeight = 3;

  let path = createGearPath(outerRadius - toothHeight, teeth, toothHeight, 0.25);
  path += ` M ${innerRadius} 0 A ${innerRadius} ${innerRadius} 0 1 0 ${-innerRadius} 0 A ${innerRadius} ${innerRadius} 0 1 0 ${innerRadius} 0`;

  const gearBorder = createStyledPath(path, {
    fill: '#800020', // Maroon
    stroke: '#9ca3af', // Grey outline
    strokeWidth: '1'
  });
  gearBorder.setAttribute('transform', `translate(${redCircleX}, ${redCircleY})`);
  gearBorder.setAttribute('fill-rule', 'evenodd');
  lvssGroup.appendChild(gearBorder);

  // Inner circle
  const redCircleInner = createStyledCircle(redCircleX, redCircleY, innerRadius, {
    fill: '#4A1942', // Red-purple plum
    stroke: 'none'
  });
  lvssGroup.appendChild(redCircleInner);

  labelsGroup.appendChild(lvssGroup);

  // Add LVSS label
  const lvssText = createStyledText(redCircleX, redCircleY, 'LVSS', {
    fill: '#ffffff',
    fontSize: '14'
  });
  labelsGroup.appendChild(lvssText);

  // Store LVSS position
  window.lvssPosition = {
    x: redCircleX,
    y: redCircleY,
    radius: redCircleRadius
  };

  // Adjust LVSS position if needed to align with CECS
  adjustLvssPosition(labelsGroup);

  return window.lvssPosition;
}

/**
 * Adjust LVSS position to align horizontally with CECS box
 */
function adjustLvssPosition(labelsGroup) {
  if (!window.lvssBoxPositions || !window.lvssPosition) return;

  const lvssX = window.lvssPosition.x;
  let lvssY = window.lvssPosition.y;
  const boxHeight = window.lvssBoxPositions.boxHeight;
  const iacLineY = window.lvssBoxPositions.cecsY + boxHeight / 2;

  const yDiff = iacLineY - lvssY;
  if (Math.abs(yDiff) <= 1) return; // No adjustment needed

  // Move all LVSS circles
  const allCircles = labelsGroup.querySelectorAll('circle');
  allCircles.forEach(circle => {
    const cx = parseFloat(circle.getAttribute('cx'));
    const cy = parseFloat(circle.getAttribute('cy'));
    if (Math.abs(cx - lvssX) < 1) {
      circle.setAttribute('cy', cy + yDiff);
    }
  });

  // Move LVSS text
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
    if (transform.includes(`translate(${lvssX},`)) {
      const newTransform = transform.replace(/translate\([^,]+,\s*([^)]+)\)/, `translate(${lvssX}, ${iacLineY})`);
      path.setAttribute('transform', newTransform);
    }
  });

  // Update stored position
  window.lvssPosition.y = iacLineY;
}

// Export functions for module usage
if (typeof window !== 'undefined') {
  window.initializeMainCircles = initializeMainCircles;
  window.createLvssCircle = createLvssCircle;
}
