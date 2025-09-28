(function () {
  'use strict';

  const BASE_ANCHOR = Object.freeze({ cx: 300, cyBig: 450 });

  const BASE_LAYOUT = Object.freeze({
    anchor: BASE_ANCHOR,
    circles: {
      big: {
        cx: 300,
        cy: 450,
        outerRadius: 117,
        innerRadius: 93,
        gear: { radius: 81, toothHeight: 8, teeth: 16 },
        gearBorder: { outerRadius: 107, innerRadius: 93, toothHeight: 6, teeth: 20 }
      },
      small: {
        cx: 300,
        cy: 266,
        outerRadius: 67,
        innerRadius: 47,
        gear: { radius: 39, toothHeight: 4, teeth: 10 },
        gearBorder: { outerRadius: 60.6, innerRadius: 47, toothHeight: 4, teeth: 12 }
      }
    },
    arc: {
      start: { x: 497, y: -416 },
      end: { x: 497, y: 1182 },
      radiusX: 276,
      radiusY: 276,
      strokeWidth: 3,
      largeArc: 0,
      sweep: 1,
      showPath: false,
      dotRadius: 2.4,
      dotCount: 100,
      ellipse: {
        centerX: 221,
        centerY: 383,
        radiusX: 276,
        radiusY: 289.8,
        startAngle: -1.222849592741449,
        endAngle: 1.222849592741449
      }
    },
    swiftCluster: {
      swift: { x: 53.92491425406945, y: 714, width: 81, height: 81 },
      clsAud: { x: 53.92491425406945, y: 685.3333333333333, width: 81, height: 23.666666666666668 },
      austraclear: { x: 5.324914254069455, y: 607.3333333333333, width: 129.6, height: 54 },
      pacsBoxes: [
        { x: -219.57508574593055, y: 715.6666666666665, width: 121.5, height: 23.666666666666668, label: 'pacs.009' },
        { x: -133.57508574593055, y: 742.6666666666665, width: 121.5, height: 23.666666666666668, label: 'pacs.008' },
        { x: -47.57508574593055, y: 769.6666666666665, width: 121.5, height: 23.666666666666668, label: 'pacs.004' }
      ],
      metadata: {
        hvcsX: -168.07508574593055,
        smallRectHeight: 23.666666666666668
      }
    }
  });

  function readParams() {
    const paramsEl = document.getElementById('params');
    if (!paramsEl) {
      return {};
    }
    const data = paramsEl.dataset || {};

    const toNumber = (key) => {
      const raw = data[key];
      if (raw === undefined) return undefined;
      const value = Number(raw);
      return Number.isFinite(value) ? value : undefined;
    };

    return {
      cx: toNumber('cx'),
      cyBig: toNumber('cyBig'),
      offsetX: toNumber('offsetX'),
      offsetY: toNumber('offsetY')
    };
  }

  function computeOffsets(params) {
    const dx = (Number.isFinite(params?.cx) ? params.cx : BASE_ANCHOR.cx) - BASE_ANCHOR.cx;
    const dy = (Number.isFinite(params?.cyBig) ? params.cyBig : BASE_ANCHOR.cyBig) - BASE_ANCHOR.cyBig;
    const extraX = Number.isFinite(params?.offsetX) ? params.offsetX : 0;
    const extraY = Number.isFinite(params?.offsetY) ? params.offsetY : 0;

    return {
      dx: dx + extraX,
      dy: dy + extraY
    };
  }

  function cloneBaseLayout() {
    return JSON.parse(JSON.stringify(BASE_LAYOUT));
  }

  function translatePoint(point, dx, dy) {
    if (!point || (dx === 0 && dy === 0)) return;
    if (typeof point.x === 'number') point.x += dx;
    if (typeof point.y === 'number') point.y += dy;
  }

  function translateRect(rect, dx, dy) {
    if (!rect || (dx === 0 && dy === 0)) return;
    if (typeof rect.x === 'number') rect.x += dx;
    if (typeof rect.y === 'number') rect.y += dy;
  }

  function translateCircle(circle, dx, dy) {
    if (!circle || (dx === 0 && dy === 0)) return;
    if (typeof circle.cx === 'number') circle.cx += dx;
    if (typeof circle.cy === 'number') circle.cy += dy;
  }

  function translateLayout(layout, dx, dy) {
    if (!layout || (dx === 0 && dy === 0)) return layout;

    translateCircle(layout.circles?.big, dx, dy);
    translateCircle(layout.circles?.small, dx, dy);

    translatePoint(layout.arc?.start, dx, dy);
    translatePoint(layout.arc?.end, dx, dy);
    if (layout.arc?.ellipse) {
      layout.arc.ellipse.centerX += dx;
      layout.arc.ellipse.centerY += dy;
    }

    translateRect(layout.swiftCluster?.swift, dx, dy);
    translateRect(layout.swiftCluster?.clsAud, dx, dy);
    translateRect(layout.swiftCluster?.austraclear, dx, dy);

    if (Array.isArray(layout.swiftCluster?.pacsBoxes)) {
      layout.swiftCluster.pacsBoxes.forEach((box) => translateRect(box, dx, dy));
    }

    if (layout.swiftCluster?.metadata && typeof layout.swiftCluster.metadata.hvcsX === 'number') {
      layout.swiftCluster.metadata.hvcsX += dx;
    }

    return layout;
  }

  function format(value) {
    return Number(value).toFixed(2);
  }

  function buildArcPath(arc) {
    if (!arc) return '';
    return `M ${format(arc.start.x)} ${format(arc.start.y)} ` +
           `A ${format(arc.radiusX)} ${format(arc.radiusY)} 0 ${arc.largeArc} ${arc.sweep} ` +
           `${format(arc.end.x)} ${format(arc.end.y)}`;
  }

  function sampleArcDots(arc) {
    const dots = [];
    if (!arc || !arc.ellipse) return dots;

    const count = Math.max(0, Math.floor(arc.dotCount || 0));
    if (count < 2) return dots;

    const { centerX, centerY, radiusX, radiusY, startAngle, endAngle } = arc.ellipse;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const angle = startAngle + (endAngle - startAngle) * t;
      const x = centerX + radiusX * Math.cos(angle);
      const y = centerY + radiusY * Math.sin(angle);
      dots.push({ x, y, index: i });
    }

    return dots;
  }

  function buildAbsoluteLayout(params) {
    const offsets = computeOffsets(params || {});
    const layout = cloneBaseLayout();
    translateLayout(layout, offsets.dx, offsets.dy);

    layout.arc = layout.arc || {};
    layout.arc.pathD = buildArcPath(layout.arc);
    layout.arc.dots = sampleArcDots(layout.arc);
    layout.arc.offsets = offsets;

    layout.offsets = offsets;
    return layout;
  }

  function renderCircles(svg, circles) {
    if (!circles) return;

    const bigOuter = document.getElementById('big-outer');
    const bigInner = document.getElementById('big-inner');
    const bigGearBorder = document.getElementById('big-gear-border');
    const bigGear = document.getElementById('big-gear');

    if (bigOuter) {
      bigOuter.setAttribute('cx', format(circles.big.cx));
      bigOuter.setAttribute('cy', format(circles.big.cy));
      bigOuter.setAttribute('r', format(circles.big.outerRadius));
    }

    if (bigInner) {
      bigInner.setAttribute('cx', format(circles.big.cx));
      bigInner.setAttribute('cy', format(circles.big.cy));
      bigInner.setAttribute('r', format(circles.big.innerRadius));
    }

    if (bigGearBorder && typeof createGearPath === 'function') {
      const border = circles.big.gearBorder;
      let path = createGearPath(border.outerRadius - border.toothHeight, border.teeth, border.toothHeight, 0.25);
      path += ` M ${border.innerRadius} 0 A ${border.innerRadius} ${border.innerRadius} 0 1 0 ${-border.innerRadius} 0 A ${border.innerRadius} ${border.innerRadius} 0 1 0 ${border.innerRadius} 0`;
      bigGearBorder.setAttribute('d', path);
      bigGearBorder.setAttribute('transform', `translate(${format(circles.big.cx)}, ${format(circles.big.cy)})`);
      bigGearBorder.setAttribute('fill-rule', 'evenodd');
    }

    if (bigGear && typeof createGearPath === 'function') {
      const gear = circles.big.gear;
      bigGear.setAttribute('d', createGearPath(gear.radius, gear.teeth, gear.toothHeight, 0.25));
      bigGear.setAttribute('transform', `translate(${format(circles.big.cx)}, ${format(circles.big.cy)})`);
    }

    const smallOuter = document.getElementById('small-outer');
    const smallInner = document.getElementById('small-inner');
    const smallGearBorder = document.getElementById('small-gear-border');
    const smallGear = document.getElementById('small-gear');

    if (smallOuter) {
      smallOuter.setAttribute('cx', format(circles.small.cx));
      smallOuter.setAttribute('cy', format(circles.small.cy));
      smallOuter.setAttribute('r', format(circles.small.outerRadius));
    }

    if (smallInner) {
      smallInner.setAttribute('cx', format(circles.small.cx));
      smallInner.setAttribute('cy', format(circles.small.cy));
      smallInner.setAttribute('r', format(circles.small.innerRadius));
    }

    if (smallGearBorder && typeof createGearPath === 'function') {
      const border = circles.small.gearBorder;
      let path = createGearPath(border.outerRadius - border.toothHeight, border.teeth, border.toothHeight, 0.25);
      path += ` M ${border.innerRadius} 0 A ${border.innerRadius} ${border.innerRadius} 0 1 0 ${-border.innerRadius} 0 A ${border.innerRadius} ${border.innerRadius} 0 1 0 ${border.innerRadius} 0`;
      smallGearBorder.setAttribute('d', path);
      smallGearBorder.setAttribute('transform', `translate(${format(circles.small.cx)}, ${format(circles.small.cy)})`);
      smallGearBorder.setAttribute('fill-rule', 'evenodd');
    }

    if (smallGear && typeof createGearPath === 'function') {
      const gear = circles.small.gear;
      smallGear.setAttribute('d', createGearPath(gear.radius, gear.teeth, gear.toothHeight, 0.25));
      smallGear.setAttribute('transform', `translate(${format(circles.small.cx)}, ${format(circles.small.cy)})`);
    }

    const bigLabel = document.getElementById('big-label');
    if (bigLabel) {
      bigLabel.setAttribute('x', format(circles.big.cx));
      bigLabel.setAttribute('y', format(circles.big.cy));
      const spans = bigLabel.querySelectorAll('tspan');
      spans.forEach((span) => span.setAttribute('x', format(circles.big.cx)));
    }

    const smallLabel = document.getElementById('small-label');
    if (smallLabel) {
      smallLabel.setAttribute('x', format(circles.small.cx));
      smallLabel.setAttribute('y', format(circles.small.cy));
      const spans = smallLabel.querySelectorAll('tspan');
      spans.forEach((span) => span.setAttribute('x', format(circles.small.cx)));
    }
  }

  function renderArc(svg, arc) {
    if (!arc) return;
    const arcPathEl = document.getElementById('enclosing-arc');
    if (arcPathEl) {
      arcPathEl.setAttribute('d', arc.pathD || '');
      arcPathEl.setAttribute('stroke-width', String(arc.strokeWidth || 0));
      arcPathEl.style.display = arc.showPath ? 'block' : 'none';
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

    const dots = arc.dots || [];
    const dotRadius = arc.dotRadius || 0;

    dots.forEach((dot, index) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', format(dot.x));
      circle.setAttribute('cy', format(dot.y));
      circle.setAttribute('r', format(dotRadius));
      circle.setAttribute('fill', index === 0 ? '#111827' : index === 1 ? '#1d4ed8' : '#3b82f6');
      circle.setAttribute('opacity', index === 0 ? '1' : index === 1 ? '0.9' : '0.75');
      circlesGroup.appendChild(circle);
    });
  }

  function renderSwiftCluster(svg, cluster, arc) {
    if (!cluster) return;
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
    swiftRect.setAttribute('x', format(cluster.swift.x));
    swiftRect.setAttribute('y', format(cluster.swift.y));
    swiftRect.setAttribute('width', format(cluster.swift.width));
    swiftRect.setAttribute('height', format(cluster.swift.height));

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
    const swiftCenterX = cluster.swift.x + cluster.swift.width / 2;
    const swiftCenterY = cluster.swift.y + cluster.swift.height / 2;
    swiftText.setAttribute('x', format(swiftCenterX));
    swiftText.setAttribute('y', format(swiftCenterY));
    const swiftTspans = swiftText.querySelectorAll('tspan');
    swiftTspans[0]?.setAttribute('x', format(swiftCenterX));
    swiftTspans[1]?.setAttribute('x', format(swiftCenterX));

    const clsRect = createOrGet('cls-aud-rect', () => createStyledRect(0, 0, 10, 10, {
      fill: '#0f766e',
      stroke: 'none',
      strokeWidth: '1',
      rx: '12',
      ry: '12'
    }));
    clsRect.setAttribute('x', format(cluster.clsAud.x));
    clsRect.setAttribute('y', format(cluster.clsAud.y));
    clsRect.setAttribute('width', format(cluster.clsAud.width));
    clsRect.setAttribute('height', format(cluster.clsAud.height));

    const austraclearRect = createOrGet('austraclear-rect', () => createStyledRect(0, 0, 10, 10, {
      fill: '#dbeafe',
      stroke: '#1d4ed8',
      strokeWidth: '2',
      rx: '12',
      ry: '12'
    }));
    austraclearRect.setAttribute('x', format(cluster.austraclear.x));
    austraclearRect.setAttribute('y', format(cluster.austraclear.y));
    austraclearRect.setAttribute('width', format(cluster.austraclear.width));
    austraclearRect.setAttribute('height', format(cluster.austraclear.height));

    const existingPacs = labelsGroup.querySelectorAll('[data-section="pacs"]');
    existingPacs.forEach((el) => el.remove());

    cluster.pacsBoxes.forEach((box, idx) => {
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

    if (arc && Array.isArray(arc.dots) && arc.dots.length > 0) {
      const rbaDot = arc.dots[0];
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
      const blackCircleRadius = (arc.dotRadius || 0) * 6;
      rbaText.setAttribute('x', format(rbaDot.x + blackCircleRadius + 5));
      rbaText.setAttribute('y', format(rbaDot.y));
    }
  }

  function initializeDiagramAbsolute() {
    const svg = document.getElementById('diagram');
    if (!svg) {
      throw new Error('Missing #diagram SVG element');
    }

    const params = readParams();
    const layout = buildAbsoluteLayout(params);
    window.absoluteDiagramLayout = layout;

    renderCircles(svg, layout.circles);
    renderArc(svg, layout.arc);
    renderSwiftCluster(svg, layout.swiftCluster, layout.arc);
  }

  window.initializeDiagramAbsolute = initializeDiagramAbsolute;
})();
