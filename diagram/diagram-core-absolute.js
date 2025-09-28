(function () {
  'use strict';

  function readParams() {
    const paramsEl = document.getElementById('params');
    if (!paramsEl) {
      throw new Error('Missing #params element');
    }
    const data = paramsEl.dataset;
    const toNumber = (key, fallback = 0) => {
      const value = Number(data[key]);
      return Number.isFinite(value) ? value : fallback;
    };
    return {
      cx: toNumber('cx', 0),
      cyBig: toNumber('cyBig', 0),
      rBig: toNumber('rBig', 0),
      gap: toNumber('gap', 0),
      rSmall: toNumber('rSmall', 0),
      arcR: toNumber('arcR', 0),
      arcAngleDeg: toNumber('arcAngleDeg', 0),
      arcOffsetDeg: toNumber('arcOffsetDeg', 0),
      strokeWidth: toNumber('strokeWidth', 0)
    };
  }

  function computeCircles(base) {
    const cySmall = base.cyBig - (base.rBig + base.rSmall + base.strokeWidth);
    return {
      big: {
        cx: base.cx,
        cy: base.cyBig,
        outerRadius: base.rBig + base.strokeWidth / 2,
        innerRadius: base.rBig - base.strokeWidth * 2.5,
        gear: {
          radius: base.rBig - base.strokeWidth * 2.5 - 12,
          toothHeight: 8,
          teeth: 16
        },
        gearBorder: {
          outerRadius: base.rBig - base.strokeWidth * 0.75,
          innerRadius: base.rBig - base.strokeWidth * 2.5,
          toothHeight: 6,
          teeth: 20
        }
      },
      small: {
        cx: base.cx,
        cy: cySmall,
        outerRadius: base.rSmall + base.strokeWidth / 2,
        innerRadius: base.rSmall - base.strokeWidth * 2,
        gear: {
          radius: base.rSmall - base.strokeWidth * 2 - 8,
          toothHeight: 4,
          teeth: 10
        },
        gearBorder: {
          outerRadius: base.rSmall - base.strokeWidth * 0.3,
          innerRadius: base.rSmall - base.strokeWidth * 2,
          toothHeight: 4,
          teeth: 12
        }
      }
    };
  }

  function computeArc(base, circleLayout) {
    const big = circleLayout.big;
    const small = circleLayout.small;

    const baseSpacing = 1;
    const newSpacing = 5;
    const gapMultiplier = 2;
    const totalCircles = 100;
    const spacingRatio = (newSpacing + (10 * newSpacing * gapMultiplier) / totalCircles) / baseSpacing;
    const arcExtension = 120 * (spacingRatio - 1);
    const arcOffset = 60;

    const startX = big.cx + big.outerRadius + 20 + arcOffset;
    const startY = small.cy - (small.outerRadius + 15 + arcExtension);
    const endX = big.cx + big.outerRadius + 20 + arcOffset;
    const endY = big.cy + (big.outerRadius + 15 + arcExtension);

    const arcRadius = (base.arcR + arcExtension) * 0.3;
    const largeArc = 0;
    const sweep = 1;
    const d = `M ${startX} ${startY} A ${arcRadius} ${arcRadius} 0 ${largeArc} ${sweep} ${endX} ${endY}`;

    const halfHeight = (endY - startY) / 2;
    const sqrtTerm = arcRadius * arcRadius - halfHeight * halfHeight;
    const verticalStretch = 1.05;
    const arcCenterX = sqrtTerm > 0 ? startX - Math.sqrt(sqrtTerm) : startX - arcRadius;
    const arcCenterY = (startY + endY) / 2;
    const startAngle = Math.atan2((startY - arcCenterY) / verticalStretch, startX - arcCenterX);
    const endAngle = Math.atan2((endY - arcCenterY) / verticalStretch, endX - arcCenterX);

    return {
      path: {
        d,
        strokeWidth: 3,
        visible: false
      },
      ellipse: {
        centerX: arcCenterX,
        centerY: arcCenterY,
        radiusX: arcRadius,
        radiusY: arcRadius * verticalStretch,
        startAngle,
        endAngle
      },
      samples: {
        count: 100,
        radius: 3 * (4 / 5)
      }
    };
  }

  function sampleArcDots(arc) {
    const dots = [];
    const { centerX, centerY, radiusX, radiusY, startAngle, endAngle } = arc.ellipse;
    const count = arc.samples.count;
    if (count <= 1) {
      return dots;
    }
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const angle = startAngle + (endAngle - startAngle) * t;
      const x = centerX + radiusX * Math.cos(angle);
      const y = centerY + radiusY * Math.sin(angle);
      dots.push({ x, y, index: i });
    }
    return dots;
  }

  function computeSwiftCluster(circleLayout, arcLayout) {
    // Reuse constants from original script but expressed only via absolute math.
    const dots = sampleArcDots(arcLayout).map((dot) => ({ x: dot.x, y: dot.y }));
    const rbaDot = dots[0];
    if (!rbaDot) {
      return null;
    }

    const smallCircleRadius = arcLayout.samples.radius;
    const blackCircleRadius = smallCircleRadius * 6;

    const angle225 = (225 * Math.PI) / 180;
    const swPointX = rbaDot.x + blackCircleRadius * Math.cos(angle225);
    const swPointY = rbaDot.y + blackCircleRadius * Math.sin(angle225);

    const rectWidth = 144 * 0.9;
    const rectHeight = 100 * 0.9 * 0.9;
    const swiftRectWidth = rectHeight;

    const verticalGap = 5;
    const horizontalGap = 30;
    const smallRectHeight = (rectHeight - 2 * verticalGap) / 3;
    const austraclearHeight = rectHeight * (2 / 3);

    const baseX = swPointX - rectWidth - 130 - 40;
    const heightReduction = 100 * 0.1;
    const verticalShift = 50;
    const austraclearYBase = circleLayout.big.cy - smallRectHeight + heightReduction + rectHeight + verticalShift;
    const austraclearSpecificShift = 20;
    const austraclearY = austraclearYBase + 20 + austraclearSpecificShift;

    const austraclearRightEdge = baseX + rectWidth;
    const swiftRightShift = austraclearRightEdge - swiftRectWidth - baseX;
    const rectX = baseX + swiftRightShift;
    const swiftSectionDownShift = 25;
    const rectY = austraclearYBase + austraclearHeight + verticalGap + smallRectHeight + austraclearHeight - 15 + swiftSectionDownShift;

    const clsAudY = rectY - smallRectHeight - verticalGap;

    const hvcsX = rectX - swiftRectWidth - horizontalGap - swiftRectWidth - horizontalGap;
    const pacsBoxWidth = swiftRectWidth * 1.5;
    const verticalGapDiff = horizontalGap - verticalGap;

    const pacsBoxes = [];
    const pacsLabels = ['pacs.009', 'pacs.008', 'pacs.004'];
    const positions = [1 / 6, 0.5, 5 / 6];

    for (let j = 0; j < 3; j++) {
      const originalPacsWidth = swiftRectWidth;
      const rightmostPacsRightEdge = rectX - verticalGap;
      const rightmostPacsX = rightmostPacsRightEdge - pacsBoxWidth;
      const originalBoxRightEdge = rectX - verticalGap - (2 - j) * (originalPacsWidth + verticalGap);
      const smallRectX = originalBoxRightEdge - pacsBoxWidth + verticalGapDiff;
      const swiftBoxTop = rectY;
      const lineCenterY = swiftBoxTop + rectHeight * positions[j];
      const smallRectY = lineCenterY - smallRectHeight / 2;

      pacsBoxes.push({
        x: smallRectX,
        y: smallRectY,
        width: pacsBoxWidth,
        height: smallRectHeight,
        label: pacsLabels[j]
      });
    }

    return {
      swift: {
        x: rectX,
        y: rectY,
        width: swiftRectWidth,
        height: rectHeight
      },
      clsAud: {
        x: rectX,
        y: clsAudY,
        width: swiftRectWidth,
        height: smallRectHeight
      },
      austraclear: {
        x: baseX,
        y: austraclearY,
        width: rectWidth,
        height: austraclearHeight
      },
      pacsBoxes,
      metadata: {
        hvcsX,
        smallRectHeight
      }
    };
  }

  function renderCircles(svg, layout) {
    const bigOuter = document.getElementById('big-outer');
    const bigInner = document.getElementById('big-inner');
    const bigGearBorder = document.getElementById('big-gear-border');
    const bigGear = document.getElementById('big-gear');

    if (bigOuter) {
      bigOuter.setAttribute('cx', layout.big.cx);
      bigOuter.setAttribute('cy', layout.big.cy);
      bigOuter.setAttribute('r', layout.big.outerRadius);
    }

    if (bigInner) {
      bigInner.setAttribute('cx', layout.big.cx);
      bigInner.setAttribute('cy', layout.big.cy);
      bigInner.setAttribute('r', layout.big.innerRadius);
    }

    if (bigGearBorder && typeof createGearPath === 'function') {
      const border = layout.big.gearBorder;
      let path = createGearPath(border.outerRadius - border.toothHeight, border.teeth, border.toothHeight, 0.25);
      path += ` M ${border.innerRadius} 0 A ${border.innerRadius} ${border.innerRadius} 0 1 0 ${-border.innerRadius} 0 A ${border.innerRadius} ${border.innerRadius} 0 1 0 ${border.innerRadius} 0`;
      bigGearBorder.setAttribute('d', path);
      bigGearBorder.setAttribute('transform', `translate(${layout.big.cx}, ${layout.big.cy})`);
      bigGearBorder.setAttribute('fill-rule', 'evenodd');
    }

    if (bigGear && typeof createGearPath === 'function') {
      const gear = layout.big.gear;
      bigGear.setAttribute('d', createGearPath(gear.radius, gear.teeth, gear.toothHeight, 0.25));
      bigGear.setAttribute('transform', `translate(${layout.big.cx}, ${layout.big.cy})`);
    }

    const smallOuter = document.getElementById('small-outer');
    const smallInner = document.getElementById('small-inner');
    const smallGearBorder = document.getElementById('small-gear-border');
    const smallGear = document.getElementById('small-gear');

    if (smallOuter) {
      smallOuter.setAttribute('cx', layout.small.cx);
      smallOuter.setAttribute('cy', layout.small.cy);
      smallOuter.setAttribute('r', layout.small.outerRadius);
    }

    if (smallInner) {
      smallInner.setAttribute('cx', layout.small.cx);
      smallInner.setAttribute('cy', layout.small.cy);
      smallInner.setAttribute('r', layout.small.innerRadius);
    }

    if (smallGearBorder && typeof createGearPath === 'function') {
      const border = layout.small.gearBorder;
      let path = createGearPath(border.outerRadius - border.toothHeight, border.teeth, border.toothHeight, 0.25);
      path += ` M ${border.innerRadius} 0 A ${border.innerRadius} ${border.innerRadius} 0 1 0 ${-border.innerRadius} 0 A ${border.innerRadius} ${border.innerRadius} 0 1 0 ${border.innerRadius} 0`;
      smallGearBorder.setAttribute('d', path);
      smallGearBorder.setAttribute('transform', `translate(${layout.small.cx}, ${layout.small.cy})`);
      smallGearBorder.setAttribute('fill-rule', 'evenodd');
    }

    if (smallGear && typeof createGearPath === 'function') {
      const gear = layout.small.gear;
      smallGear.setAttribute('d', createGearPath(gear.radius, gear.teeth, gear.toothHeight, 0.25));
      smallGear.setAttribute('transform', `translate(${layout.small.cx}, ${layout.small.cy})`);
    }

    const bigLabel = document.getElementById('big-label');
    if (bigLabel) {
      bigLabel.setAttribute('x', layout.big.cx);
      bigLabel.setAttribute('y', layout.big.cy);
      const spans = bigLabel.querySelectorAll('tspan');
      spans.forEach((span) => span.setAttribute('x', layout.big.cx));
    }

    const smallLabel = document.getElementById('small-label');
    if (smallLabel) {
      smallLabel.setAttribute('x', layout.small.cx);
      smallLabel.setAttribute('y', layout.small.cy);
      const spans = smallLabel.querySelectorAll('tspan');
      spans.forEach((span) => span.setAttribute('x', layout.small.cx));
    }
  }

  function renderArc(svg, arcLayout) {
    const arcPath = document.getElementById('enclosing-arc');
    if (arcPath) {
      arcPath.setAttribute('d', arcLayout.path.d);
      arcPath.setAttribute('stroke-width', String(arcLayout.path.strokeWidth));
      arcPath.style.display = arcLayout.path.visible ? 'block' : 'none';
    }

    let circlesGroup = document.getElementById('arc-circles');
    if (!circlesGroup) {
      circlesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      circlesGroup.setAttribute('id', 'arc-circles');
      svg.appendChild(circlesGroup);
    } else {
      while (circlesGroup.firstChild) {
        circlesGroup.removeChild(circlesGroup.firstChild);
      }
    }

    const dots = sampleArcDots(arcLayout);
    const dotRadius = arcLayout.samples.radius;

    dots.forEach((dot, index) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', dot.x.toFixed(2));
      circle.setAttribute('cy', dot.y.toFixed(2));
      circle.setAttribute('r', dotRadius.toFixed(2));
      circle.setAttribute('fill', index === 0 ? '#111827' : index === 1 ? '#1d4ed8' : '#3b82f6');
      circle.setAttribute('opacity', index === 0 ? '1' : index === 1 ? '0.9' : '0.75');
      circlesGroup.appendChild(circle);
    });

    return { dots, dotRadius };
  }

  function renderSwiftCluster(svg, layout, dotsInfo) {
    if (!layout || !dotsInfo) return;
    const labelsGroupId = 'dot-labels';
    let labelsGroup = document.getElementById(labelsGroupId);
    if (!labelsGroup) {
      labelsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      labelsGroup.setAttribute('id', labelsGroupId);
      svg.appendChild(labelsGroup);
    }

    const createOrGet = (id, factory) => {
      let el = document.getElementById(id);
      if (!el) {
        el = factory();
        el.setAttribute('id', id);
        labelsGroup.appendChild(el);
      }
      return el;
    };

    const swiftRect = createOrGet('swift-pds-rect', () => createStyledRect(0, 0, 10, 10, {
      fill: '#bdf7e9',
      stroke: '#0f766e',
      strokeWidth: '2'
    }));
    swiftRect.setAttribute('x', layout.swift.x.toFixed(2));
    swiftRect.setAttribute('y', layout.swift.y.toFixed(2));
    swiftRect.setAttribute('width', layout.swift.width.toFixed(2));
    swiftRect.setAttribute('height', layout.swift.height.toFixed(2));

    const swiftText = createOrGet('swift-pds-text', () => {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('fill', '#0f766e');
      text.setAttribute('font-family', 'Arial, sans-serif');
      text.setAttribute('font-size', '18');
      text.setAttribute('font-weight', 'bold');
      const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
      line1.setAttribute('dy', '-0.5em');
      line1.textContent = 'SWIFT';
      const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
      line2.setAttribute('dy', '1.2em');
      line2.textContent = 'PDS';
      text.appendChild(line1);
      text.appendChild(line2);
      return text;
    });
    const swiftCenterX = layout.swift.x + layout.swift.width / 2;
    const swiftCenterY = layout.swift.y + layout.swift.height / 2;
    swiftText.setAttribute('x', swiftCenterX.toFixed(2));
    swiftText.setAttribute('y', swiftCenterY.toFixed(2));
    const swiftTspans = swiftText.querySelectorAll('tspan');
    swiftTspans[0]?.setAttribute('x', swiftCenterX.toFixed(2));
    swiftTspans[1]?.setAttribute('x', swiftCenterX.toFixed(2));

    const clsRect = createOrGet('cls-aud-rect', () => createStyledRect(0, 0, 10, 10, {
      fill: '#0f766e',
      stroke: 'none',
      strokeWidth: '1',
      rx: '12',
      ry: '12'
    }));
    clsRect.setAttribute('x', layout.clsAud.x.toFixed(2));
    clsRect.setAttribute('y', layout.clsAud.y.toFixed(2));
    clsRect.setAttribute('width', layout.clsAud.width.toFixed(2));
    clsRect.setAttribute('height', layout.clsAud.height.toFixed(2));

    const austraclearRect = createOrGet('austraclear-rect', () => createStyledRect(0, 0, 10, 10, {
      fill: '#dbeafe',
      stroke: '#1d4ed8',
      strokeWidth: '2',
      rx: '12',
      ry: '12'
    }));
    austraclearRect.setAttribute('x', layout.austraclear.x.toFixed(2));
    austraclearRect.setAttribute('y', layout.austraclear.y.toFixed(2));
    austraclearRect.setAttribute('width', layout.austraclear.width.toFixed(2));
    austraclearRect.setAttribute('height', layout.austraclear.height.toFixed(2));

    const existingPacs = labelsGroup.querySelectorAll('[data-section="pacs"]');
    existingPacs.forEach((el) => el.remove());

    layout.pacsBoxes.forEach((box, idx) => {
      const rect = createStyledRect(box.x, box.y, box.width, box.height, {
        fill: '#0f766e',
        stroke: 'none',
        strokeWidth: '1',
        rx: '12',
        ry: '12'
      });
      rect.dataset.section = 'pacs';
      rect.dataset.index = String(idx);
      labelsGroup.appendChild(rect);

      const text = createStyledText(
        box.x + box.width / 2,
        box.y + box.height / 2,
        box.label,
        {
          fill: '#ffffff',
          fontSize: '14'
        }
      );
      text.dataset.section = 'pacs';
      text.dataset.index = String(idx);
      labelsGroup.appendChild(text);
    });

    if (dotsInfo && dotsInfo.dots.length > 0) {
      const rbaDot = dotsInfo.dots[0];
      const textId = 'rba-label';
      let rbaText = document.getElementById(textId);
      if (!rbaText) {
        rbaText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        rbaText.setAttribute('id', textId);
        rbaText.setAttribute('text-anchor', 'start');
        rbaText.setAttribute('dominant-baseline', 'middle');
        rbaText.setAttribute('fill', '#991b1b');
        rbaText.setAttribute('font-family', 'Arial, sans-serif');
        rbaText.setAttribute('font-size', '16');
        rbaText.setAttribute('font-weight', 'bold');
        rbaText.textContent = 'RBA';
        labelsGroup.appendChild(rbaText);
      }
      const blackCircleRadius = dotsInfo.dotRadius * 6;
      rbaText.setAttribute('x', (rbaDot.x + blackCircleRadius + 5).toFixed(2));
      rbaText.setAttribute('y', rbaDot.y.toFixed(2));
    }
  }

  function initializeDiagramAbsolute() {
    const svg = document.getElementById('diagram');
    if (!svg) {
      throw new Error('Missing #diagram SVG element');
    }

    const params = readParams();
    const circleLayout = computeCircles(params);
    const arcLayout = computeArc(params, circleLayout);
    const dotsInfo = renderArc(svg, arcLayout);
    renderCircles(svg, circleLayout);
    const swiftLayout = computeSwiftCluster(circleLayout, arcLayout);
    renderSwiftCluster(svg, swiftLayout, dotsInfo);
  }

  window.initializeDiagramAbsolute = initializeDiagramAbsolute;
})();
