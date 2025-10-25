// Configuration
const config = {
    width: 1200,
    height: 800,
    margin: { top: 80, right: 50, bottom: 50, left: 120 },
    nodeRadius: 25,
    gridSpacing: { x: 180, y: 120 },
    tokenSize: 20,
    animationDuration: 2000 // ms per transfer
};

// Sample data structure
const paymentLayers = [
    { id: 'rtgs', name: 'RTGS' },
    { id: 'cards', name: 'Card Network' },
    { id: 'crypto', name: 'Blockchain' },
    { id: 'mobile', name: 'Mobile Money' }
];

const institutions = [
    { id: 'bank_a', name: 'Bank A' },
    { id: 'bank_b', name: 'Bank B' },
    { id: 'bank_c', name: 'Bank C' },
    { id: 'bank_d', name: 'Bank D' }
];

// Generate wallet nodes (each institution has a wallet on each payment layer)
const wallets = [];
paymentLayers.forEach((layer, rowIndex) => {
    institutions.forEach((institution, colIndex) => {
        wallets.push({
            id: `${layer.id}_${institution.id}`,
            layerId: layer.id,
            layerName: layer.name,
            institutionId: institution.id,
            institutionName: institution.name,
            row: rowIndex,
            col: colIndex,
            balance: Math.floor(Math.random() * 1000) + 100, // Random initial balance
            x: config.margin.left + colIndex * config.gridSpacing.x,
            y: config.margin.top + rowIndex * config.gridSpacing.y
        });
    });
});

// Sample transfers (edges)
const transfers = [
    { from: 'rtgs_bank_a', to: 'rtgs_bank_b', amount: 100, token: '💰' },
    { from: 'cards_bank_b', to: 'cards_bank_c', amount: 50, token: '💳' },
    { from: 'crypto_bank_a', to: 'crypto_bank_d', amount: 75, token: '₿' },
    { from: 'mobile_bank_c', to: 'mobile_bank_a', amount: 30, token: '📱' },
    { from: 'rtgs_bank_b', to: 'cards_bank_b', amount: 200, token: '💵' }, // Cross-layer transfer
];

// Create SVG
const svg = d3.select('#network-viz')
    .attr('width', config.width)
    .attr('height', config.height);

// Create groups for organization
const edgesGroup = svg.append('g').attr('class', 'edges');
const nodesGroup = svg.append('g').attr('class', 'nodes');
const labelsGroup = svg.append('g').attr('class', 'labels');
const tokensGroup = svg.append('g').attr('class', 'tokens');

// Draw row labels (payment layers)
labelsGroup.selectAll('.layer-label')
    .data(paymentLayers)
    .enter()
    .append('text')
    .attr('class', 'layer-label')
    .attr('x', config.margin.left - 20)
    .attr('y', (d, i) => config.margin.top + i * config.gridSpacing.y)
    .attr('text-anchor', 'end')
    .attr('dominant-baseline', 'middle')
    .text(d => d.name);

// Draw column labels (institutions)
labelsGroup.selectAll('.institution-label')
    .data(institutions)
    .enter()
    .append('text')
    .attr('class', 'institution-label')
    .attr('x', (d, i) => config.margin.left + i * config.gridSpacing.x)
    .attr('y', config.margin.top - 30)
    .attr('text-anchor', 'middle')
    .text(d => d.name);

// Helper function to find wallet by id
function getWallet(id) {
    return wallets.find(w => w.id === id);
}

// Draw edges
const edges = edgesGroup.selectAll('.edge')
    .data(transfers)
    .enter()
    .append('line')
    .attr('class', 'edge')
    .attr('x1', d => getWallet(d.from).x)
    .attr('y1', d => getWallet(d.from).y)
    .attr('x2', d => getWallet(d.to).x)
    .attr('y2', d => getWallet(d.to).y);

// Draw wallet nodes
const nodes = nodesGroup.selectAll('.wallet-node')
    .data(wallets)
    .enter()
    .append('g')
    .attr('class', 'wallet-node')
    .attr('transform', d => `translate(${d.x}, ${d.y})`);

// Add circles for wallets
nodes.append('circle')
    .attr('r', config.nodeRadius)
    .attr('fill', d => {
        // Different color per payment layer
        const colors = { rtgs: '#3498db', cards: '#9b59b6', crypto: '#f39c12', mobile: '#2ecc71' };
        return colors[d.layerId] || '#95a5a6';
    })
    .attr('stroke', '#fff')
    .attr('stroke-width', 2);

// Add balance text
nodes.append('text')
    .attr('class', 'balance-text')
    .attr('dy', 5)
    .text(d => `$${d.balance}`);

// Click handler for nodes
nodes.on('click', function(event, d) {
    // Toggle selection
    d3.select(this).classed('selected', !d3.select(this).classed('selected'));

    console.log('Clicked wallet:', d);
    // You can add more interaction logic here
});

// Function to animate a token along an edge
function animateToken(transfer) {
    const fromWallet = getWallet(transfer.from);
    const toWallet = getWallet(transfer.to);

    // Create token
    const token = tokensGroup.append('text')
        .attr('class', 'token-icon')
        .attr('x', fromWallet.x)
        .attr('y', fromWallet.y)
        .attr('font-size', config.tokenSize)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .text(transfer.token);

    // Highlight the edge
    edges.filter(d => d === transfer)
        .classed('active', true);

    // Animate token movement
    token.transition()
        .duration(config.animationDuration)
        .attr('x', toWallet.x)
        .attr('y', toWallet.y)
        .on('end', function() {
            // Remove token after animation
            token.remove();

            // Unhighlight edge
            edges.filter(d => d === transfer)
                .classed('active', false);

            // Update balances
            fromWallet.balance -= transfer.amount;
            toWallet.balance += transfer.amount;

            // Update balance display
            updateBalanceDisplay();
        });
}

// Function to update balance display
function updateBalanceDisplay() {
    nodesGroup.selectAll('.balance-text')
        .text(d => `$${d.balance}`);
}

// Function to start continuous animation of all transfers
function startAnimations() {
    let index = 0;

    function animateNext() {
        if (index < transfers.length) {
            animateToken(transfers[index]);
            index++;
            setTimeout(animateNext, config.animationDuration / 2); // Stagger animations
        } else {
            // Loop back to start after a delay
            setTimeout(() => {
                index = 0;
                animateNext();
            }, config.animationDuration);
        }
    }

    animateNext();
}

// Start animations after a short delay
setTimeout(startAnimations, 1000);

// Export for external use
window.networkViz = {
    animateToken,
    wallets,
    transfers,
    config
};
