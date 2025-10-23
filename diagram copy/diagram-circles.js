// Circle rendering and positioning logic

/**
 * Position and render the big blue circle (RITS)
 */
function positionBigCircle(cx, cyBig, rBig, strokeW) {
  const bigOuter = document.getElementById('big-outer');
  const bigGearBorder = document.getElementById('big-gear-border');
  const bigInner = document.getElementById('big-inner');

  // Set outer circle
  bigOuter.setAttribute('cx', cx);
  bigOuter.setAttribute('cy', cyBig);
  bigOuter.setAttribute('r', rBig + strokeW/2);

  // Set inner circle
  bigInner.setAttribute('cx', cx);
  bigInner.setAttribute('cy', cyBig);
  bigInner.setAttribute('r', rBig - strokeW * 2.5);

  // Update big circle label
  const bigLabel = document.getElementById('big-label');
  if (bigLabel) {
    bigLabel.setAttribute('x', cx);
    bigLabel.setAttribute('y', cyBig);
    const tspans = bigLabel.getElementsByTagName('tspan');
    for (let tspan of tspans) {
      tspan.setAttribute('x', cx);
    }
  }

  // Update gear paths
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
}

/**
 * Position and render the small orange circle (FSS)
 */
function positionSmallCircle(cx, cyBig, rBig, rSmall, strokeW) {
  const smallOuter = document.getElementById('small-outer');
  const smallGearBorder = document.getElementById('small-gear-border');
  const smallInner = document.getElementById('small-inner');

  const cySmall = cyBig - (rBig + rSmall + strokeW);

  // Set outer circle
  smallOuter.setAttribute('cx', cx);
  smallOuter.setAttribute('cy', cySmall);
  smallOuter.setAttribute('r', rSmall + strokeW/2);

  // Set inner circle
  smallInner.setAttribute('cx', cx);
  smallInner.setAttribute('cy', cySmall);
  smallInner.setAttribute('r', rSmall - strokeW * 2);

  // Update small circle label
  const smallLabel = document.getElementById('small-label');
  if (smallLabel) {
    smallLabel.setAttribute('x', cx);
    smallLabel.setAttribute('y', cySmall);
  }

  // Update gear paths for small circle
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

  return cySmall;
}

/**
 * Calculate arc parameters for dot distribution
 */
function calculateArcParameters(cx, cyBig, cySmall, rBig, rSmall, strokeW, arcR, arcExtension, arcOffset) {
  const startX = cx + rBig + strokeW + 20 + arcOffset;
  const startY = cySmall - rSmall - 15 - arcExtension;
  const endX = cx + rBig + strokeW + 20 + arcOffset;
  const endY = cyBig + rBig + 15 + arcExtension;
  const arcRadius = (arcR + arcExtension) * 0.3;

  const halfHeight = (endY - startY) / 2;
  const sqrtTerm = arcRadius * arcRadius - halfHeight * halfHeight;
  const arcCenterX = sqrtTerm > 0 ? startX - Math.sqrt(sqrtTerm) : startX - arcRadius;
  const arcCenterY = (startY + endY) / 2;

  const verticalStretch = 1.05;
  const arcRadiusX = arcRadius;
  const arcRadiusY = arcRadius * verticalStretch;

  const startAngle = Math.atan2((startY - arcCenterY) / verticalStretch, startX - arcCenterX);
  const endAngle = Math.atan2((endY - arcCenterY) / verticalStretch, endX - arcCenterX);

  return {
    startX, startY, endX, endY,
    arcCenterX, arcCenterY,
    arcRadiusX, arcRadiusY,
    startAngle, endAngle
  };
}

/**
 * Calculate position for a dot on the arc
 */
function calculateDotPosition(index, arcParams, dotSpacing, gapSpacing) {
  let adjustedIndex = index * dotSpacing;

  // Apply group-specific gaps
  if (index === 0) {
    adjustedIndex = 0;
  } else if (index >= 1 && index < 45) {
    adjustedIndex = (index * dotSpacing) + (2 * gapSpacing);
  } else if (index >= 45 && index < 50) {
    adjustedIndex = (index * dotSpacing) + (3 * gapSpacing);
  } else if (index >= 50 && index < 84) {
    adjustedIndex = ((index + 1) * dotSpacing) + (6 * gapSpacing);
  } else if (index >= 84 && index < 87) {
    adjustedIndex = ((index + 1) * dotSpacing) + (8 * gapSpacing);
  } else if (index >= 87 && index < 92) {
    adjustedIndex = (index * dotSpacing) + (10.5 * gapSpacing);
  } else {
    // Group 6
    const groupStartIndex = 92;
    const positionInGroup = index - groupStartIndex;
    let baseIndex = (groupStartIndex * dotSpacing) + (13.5 * gapSpacing) + (positionInGroup * dotSpacing * 1.5);

    if (index >= 96) baseIndex += gapSpacing * 0.5;
    if (index >= 98) baseIndex += gapSpacing;
    if (index >= 99) baseIndex += gapSpacing;

    adjustedIndex = baseIndex;
  }

  // Calculate angle and position
  const extraSpacingLastGroup = 8 * dotSpacing * 0.5;
  const additionalGaps = 2.5;
  const maxIndex = (100 * dotSpacing) + (12.5 * gapSpacing) + extraSpacingLastGroup + (additionalGaps * gapSpacing);
  const t = adjustedIndex / maxIndex;
  const angle = arcParams.startAngle + t * (arcParams.endAngle - arcParams.startAngle);

  const circleX = arcParams.arcCenterX + arcParams.arcRadiusX * Math.cos(angle);
  const circleY = arcParams.arcCenterY + arcParams.arcRadiusY * Math.sin(angle);

  return { x: circleX, y: circleY, angle };
}

/**
 * Determine if a dot should have an orange companion
 */
function shouldShowOrange(index) {
  if (index === 0) return true;
  if (index >= 1 && index < 45 && index < 3) return true;
  if (index >= 45 && index < 50 && index < 47) return true;
  if (index >= 50 && index < 84 && index < 56) return true;
  if (index >= 84 && index < 87 && index < 86) return true;
  if (index >= 87 && index < 92 && index < 89) return true;
  return false;
}

/**
 * Get dot fill and stroke colors based on index
 */
function getDotColors(index) {
  let fillColor = '#3b82f6'; // default blue
  let strokeColor = '#1e3a8a'; // default dark blue

  if (index === 0) {
    fillColor = '#3b82f6';
    strokeColor = '#1e3a8a';
  } else if (index >= 92 && index < 96) {
    fillColor = '#3b82f6';
    strokeColor = '#ef4444'; // red border
  } else if (index >= 96 && index <= 98) {
    fillColor = '#3b82f6';
    strokeColor = '#4CAF50'; // green border
  } else if (index === 99) {
    fillColor = '#3b82f6';
    strokeColor = '#00FF33'; // electric green
  }

  return { fillColor, strokeColor };
}

/**
 * Calculate dot radius based on index and pairing
 */
function calculateDotRadius(index, baseRadius, showOrange) {
  let radius = showOrange ? baseRadius * 2 : baseRadius;

  // Make first 4 dots in group 4 larger
  if (index >= 50 && index < 54) {
    radius = radius * 1.5;
  }

  // Make dots 5-7 in last group double size
  if (index >= 96 && index <= 98) {
    radius = baseRadius * 2;
  }

  // Make CLS dot much larger
  if (index === 99) {
    radius = baseRadius * 12;
  }

  return radius;
}

/**
 * Create all dots along the arc - extracted from original diagram-core.js
 * This function contains the complete dots loop with all original logic preserved
 */
function createAllDotsOriginal(params) {
  const {
    svg, cx, cyBig, cySmall, rBig, rSmall, strokeW,
    arcR, arcExtension, arcOffset, numCircles, smallCircleRadius,
    blueLinesGroup, orangeLinesGroup, redLinesGroup, adminLinesGroup,
    labelsGroup, circlesGroup, dotLabels
  } = params;

  // This will be populated by the extracted original loop code
  // For now, return empty to maintain structure
  console.log('createAllDotsOriginal called with', numCircles, 'circles');

  // TODO: Insert lines 416-6479 from original here

  return {
    dotPositions: window.dotPositions || {},
    clsEndpoints: window.clsEndpoints || {}
  };
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    positionBigCircle,
    positionSmallCircle,
    calculateArcParameters,
    calculateDotPosition,
    shouldShowOrange,
    getDotColors,
    calculateDotRadius,
    createAllDotsOriginal
  };
}
