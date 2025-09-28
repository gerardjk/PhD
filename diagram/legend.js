// All lines from the diagram
const allLines = [
  { color: '#0a4f8f', strokeWidth: 4, style: 'solid', name: 'ASX to ADI' },
  { color: '#3da88a', strokeWidth: 6, style: 'solid', name: 'SWIFT to RITS' },
  { color: '#7FFF00', strokeWidth: 6, style: 'solid', name: 'CLS AUD' },
  { color: '#800000', strokeWidth: 1.5, style: 'double', name: 'Direct Entry to ADI' },
  { color: '#2d5016', strokeWidth: 1.5, style: 'double', name: 'NPP to ADI' },
  { color: '#808080', strokeWidth: 3, style: 'solid', name: 'Grey ADI Line' },
  { color: '#B91199', strokeWidth: 3, style: 'solid', name: 'Sympli' },
  { color: '#B91199', strokeWidth: 3, style: 'solid', name: 'PEXA' },
  { color: 'rgb(100,80,180)', strokeWidth: 6, style: 'solid', name: 'BPAY' },
  { color: 'rgb(100,80,180)', strokeWidth: 2, style: 'solid', name: 'Osko' },
  { color: '#8B0000', strokeWidth: 2, style: 'double', name: 'BECN/BECG to BECS' },
  { color: 'rgb(100,80,180)', strokeWidth: 2, style: 'solid', name: 'Eftpos' },
  { color: 'rgb(216,46,43)', strokeWidth: 2, style: 'solid', name: 'Mastercard' },
  { color: '#27AEE3', strokeWidth: 1, style: 'double', name: 'Visa/Other Cards' },
  { color: '#FFA500', strokeWidth: 2, style: 'solid', name: 'ATMs' },
  { color: '#008000', strokeWidth: 1.2, style: 'solid', name: 'Claims' },
  { color: '#412e29', strokeWidth: 1.2, style: 'solid', name: 'Other Networks' },
  { color: '#0a4f8f', strokeWidth: 4, style: 'dotted', name: 'Dotted Connection' },
  { color: '#DC143C', strokeWidth: 3, style: 'solid', name: 'Critical Path' },
  { color: '#968F7F', strokeWidth: 1.5, style: 'double', name: 'LVSS' },
  { color: '#8B1538', strokeWidth: 3, style: 'solid', name: 'International Banks' }
];

// Create SVG line sample
function createLineSample(lineConfig) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '200');
  svg.setAttribute('height', '30');
  svg.setAttribute('viewBox', '0 0 200 30');

  if (lineConfig.style === 'double') {
    // Double line
    const gap = 1.5; // Match the spacing in the actual visualization
    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line1.setAttribute('x1', '10');
    line1.setAttribute('y1', `${15 - gap}`);
    line1.setAttribute('x2', '190');
    line1.setAttribute('y2', `${15 - gap}`);
    line1.setAttribute('stroke', lineConfig.color);
    line1.setAttribute('stroke-width', lineConfig.strokeWidth);
    line1.setAttribute('stroke-linecap', 'round');

    const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line2.setAttribute('x1', '10');
    line2.setAttribute('y1', `${15 + gap}`);
    line2.setAttribute('x2', '190');
    line2.setAttribute('y2', `${15 + gap}`);
    line2.setAttribute('stroke', lineConfig.color);
    line2.setAttribute('stroke-width', lineConfig.strokeWidth);
    line2.setAttribute('stroke-linecap', 'round');

    svg.appendChild(line1);
    svg.appendChild(line2);
  } else {
    // Single line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', '10');
    line.setAttribute('y1', '15');
    line.setAttribute('x2', '90');
    line.setAttribute('y2', '15');
    line.setAttribute('stroke', lineConfig.color);
    line.setAttribute('stroke-width', lineConfig.strokeWidth);
    line.setAttribute('stroke-linecap', 'round');

    if (lineConfig.style === 'dotted') {
      line.setAttribute('stroke-dasharray', '5,5');
    } else if (lineConfig.style === 'dashed') {
      line.setAttribute('stroke-dasharray', '10,5');
    }

    svg.appendChild(line);
  }

  return svg;
}

// Create legend item
function createLegendItem(lineConfig) {
  const item = document.createElement('div');
  item.className = 'legend-item';

  const sampleContainer = document.createElement('div');
  sampleContainer.className = 'line-sample';
  sampleContainer.appendChild(createLineSample(lineConfig));

  const label = document.createElement('div');
  label.className = 'line-label';
  label.textContent = lineConfig.name;

  item.appendChild(sampleContainer);
  item.appendChild(label);

  return item;
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('legend-container');
  allLines.forEach(line => {
    container.appendChild(createLegendItem(line));
  });
});