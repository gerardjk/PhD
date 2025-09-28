// Line definitions based on the main diagram
const lineDefinitions = {
  connectionLines: [
    {
      color: '#0a4f8f',
      strokeWidth: 4,
      style: 'solid',
      name: 'ASX to ADI',
      description: 'ASX Settlement connection lines'
    },
    {
      color: '#3da88a',
      strokeWidth: 6,
      style: 'solid',
      name: 'SWIFT to RITS',
      description: 'SWIFT PDS to Settlement Engine'
    },
    {
      color: '#7FFF00',
      strokeWidth: 6,
      style: 'solid',
      name: 'CLS AUD',
      description: 'CLS AUD settlement line'
    },
    {
      color: '#800000',
      strokeWidth: 1.5,
      style: 'double',
      name: 'Direct Entry to ADI',
      description: 'Direct Entry connection (double maroon)'
    },
    {
      color: '#2d5016',
      strokeWidth: 1.5,
      style: 'double',
      name: 'NPP to ADI',
      description: 'New Payments Platform (double green)'
    },
    {
      color: '#808080',
      strokeWidth: 3,
      style: 'solid',
      name: 'Grey ADI Line',
      description: 'Additional ADI connection'
    }
  ],

  adminLines: [
    {
      color: '#B91199',
      strokeWidth: 3,
      style: 'solid',
      name: 'Sympli',
      description: 'Sympli to ADI connection'
    },
    {
      color: '#B91199',
      strokeWidth: 3,
      style: 'solid',
      name: 'PEXA',
      description: 'PEXA Conveyancing connection'
    },
    {
      color: 'rgb(100,80,180)',
      strokeWidth: 6,
      style: 'solid',
      name: 'BPAY',
      description: 'BPAY connection (purple)'
    },
    {
      color: 'rgb(100,80,180)',
      strokeWidth: 2,
      style: 'solid',
      name: 'Osko',
      description: 'Osko payment line'
    },
    {
      color: '#8B0000',
      strokeWidth: 2,
      style: 'double',
      name: 'BECN/BECG to BECS',
      description: 'Bulk Electronic Clearing System'
    }
  ],

  settlementLines: [
    {
      color: 'rgb(100,80,180)',
      strokeWidth: 2,
      style: 'solid',
      name: 'Eftpos',
      description: 'Eftpos card network (purple)'
    },
    {
      color: 'rgb(216,46,43)',
      strokeWidth: 2,
      style: 'solid',
      name: 'Mastercard',
      description: 'Mastercard network (red)'
    },
    {
      color: '#27AEE3',
      strokeWidth: 1,
      style: 'double',
      name: 'Visa/Other Cards',
      description: 'Visa and other card networks (cyan)'
    },
    {
      color: '#FFA500',
      strokeWidth: 2,
      style: 'solid',
      name: 'ATMs',
      description: 'ATM network connections (orange)'
    },
    {
      color: '#008000',
      strokeWidth: 1.2,
      style: 'solid',
      name: 'Claims',
      description: 'Medicare/Claims processing (green)'
    },
    {
      color: '#412e29',
      strokeWidth: 1.2,
      style: 'solid',
      name: 'Other Networks',
      description: 'Additional payment networks (brown)'
    }
  ],

  specialLines: [
    {
      color: '#0a4f8f',
      strokeWidth: 4,
      style: 'dotted',
      name: 'Dotted Connection',
      description: 'Optional or conditional connection'
    },
    {
      color: '#DC143C',
      strokeWidth: 3,
      style: 'solid',
      name: 'Critical Path',
      description: 'High-priority settlement path'
    },
    {
      color: '#968F7F',
      strokeWidth: 1.5,
      style: 'double',
      name: 'LVSS',
      description: 'Low Value Settlement Service'
    },
    {
      color: '#8B1538',
      strokeWidth: 3,
      style: 'solid',
      name: 'International',
      description: 'International bank connections'
    }
  ]
};

// Function to create SVG line sample
function createLineSample(lineConfig) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100');
  svg.setAttribute('height', '40');
  svg.setAttribute('viewBox', '0 0 100 40');

  if (lineConfig.style === 'double') {
    // Create double line
    const gap = 3;
    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line1.setAttribute('x1', '10');
    line1.setAttribute('y1', `${20 - gap}`);
    line1.setAttribute('x2', '90');
    line1.setAttribute('y2', `${20 - gap}`);
    line1.setAttribute('stroke', lineConfig.color);
    line1.setAttribute('stroke-width', lineConfig.strokeWidth);
    line1.setAttribute('stroke-linecap', 'round');

    const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line2.setAttribute('x1', '10');
    line2.setAttribute('y1', `${20 + gap}`);
    line2.setAttribute('x2', '90');
    line2.setAttribute('y2', `${20 + gap}`);
    line2.setAttribute('stroke', lineConfig.color);
    line2.setAttribute('stroke-width', lineConfig.strokeWidth);
    line2.setAttribute('stroke-linecap', 'round');

    svg.appendChild(line1);
    svg.appendChild(line2);
  } else {
    // Create single line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', '10');
    line.setAttribute('y1', '20');
    line.setAttribute('x2', '90');
    line.setAttribute('y2', '20');
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

// Function to create legend item
function createLegendItem(lineConfig) {
  const item = document.createElement('div');
  item.className = 'legend-item';

  const sampleContainer = document.createElement('div');
  sampleContainer.className = 'line-sample';
  sampleContainer.appendChild(createLineSample(lineConfig));

  const label = document.createElement('div');
  label.className = 'line-label';
  label.innerHTML = `
    <div><strong>${lineConfig.name}</strong></div>
    <div class="description">${lineConfig.description}</div>
  `;

  item.appendChild(sampleContainer);
  item.appendChild(label);

  return item;
}

// Initialize legend when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Add connection lines
  const connectionContainer = document.getElementById('connection-lines');
  lineDefinitions.connectionLines.forEach(line => {
    connectionContainer.appendChild(createLegendItem(line));
  });

  // Add admin lines
  const adminContainer = document.getElementById('admin-lines');
  lineDefinitions.adminLines.forEach(line => {
    adminContainer.appendChild(createLegendItem(line));
  });

  // Add settlement lines
  const settlementContainer = document.getElementById('settlement-lines');
  lineDefinitions.settlementLines.forEach(line => {
    settlementContainer.appendChild(createLegendItem(line));
  });

  // Add special lines
  const specialContainer = document.getElementById('special-lines');
  lineDefinitions.specialLines.forEach(line => {
    specialContainer.appendChild(createLegendItem(line));
  });
});