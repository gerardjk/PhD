/**
 * Defines relationships between elements for coordinated highlighting
 * When you hover over an element, all elements in its group(s) light up
 */

const elementRelationships = {
  // Example: RBA and related elements
  'dot-0': {
    groups: ['rba-system'],
    related: ['rba-blue-line', 'rba-yellow-line', 'rba-blue-dot', 'rba-yellow-dot', 'opa-box', 'opa-label', 'opa-to-rba-line']
  },
  'rba-blue-line': {
    groups: ['rba-system'],
    related: ['dot-0', 'rba-blue-dot', 'rba-yellow-line', 'rba-yellow-dot', 'opa-box', 'opa-label', 'opa-to-rba-line']
  },
  'rba-yellow-line': {
    groups: ['rba-system'],
    related: ['dot-0', 'rba-blue-line', 'rba-blue-dot', 'rba-yellow-dot', 'opa-box', 'opa-label', 'opa-to-rba-line']
  },
  'rba-blue-dot': {
    groups: ['rba-system'],
    related: ['dot-0', 'rba-blue-line', 'rba-yellow-line', 'rba-yellow-dot', 'opa-box', 'opa-label', 'opa-to-rba-line']
  },
  'rba-yellow-dot': {
    groups: ['rba-system'],
    related: ['dot-0', 'rba-blue-line', 'rba-yellow-line', 'rba-blue-dot', 'opa-box', 'opa-label', 'opa-to-rba-line']
  },
  'opa-box': {
    groups: ['rba-system'],
    related: ['dot-0', 'rba-blue-line', 'rba-yellow-line', 'rba-blue-dot', 'rba-yellow-dot', 'opa-label', 'opa-to-rba-line']
  },
  'opa-label': {
    groups: ['rba-system'],
    related: ['dot-0', 'rba-blue-line', 'rba-yellow-line', 'rba-blue-dot', 'rba-yellow-dot', 'opa-box', 'opa-to-rba-line']
  },
  'opa-to-rba-line': {
    groups: ['rba-system'],
    related: ['dot-0', 'rba-blue-line', 'rba-yellow-line', 'rba-blue-dot', 'rba-yellow-dot', 'opa-box', 'opa-label']
  },

  // RITS ecosystem - only RITS triggers the group highlight
  'rits-circle': {
    groups: ['rits-ecosystem'],
    related: ['rits-circle', 'blue-connecting-lines', 'rba-blue-line', 'small-group', 'yellow-circles', 'lvss-gear-group']
  },

  // FSS (Fast Settlement Service) - the small orange/yellow gearwheel
  'fss-circle': {
    groups: ['fss-ecosystem'],
    related: ['fss-circle', 'small-group', 'yellow-circles']
  },

  // BDF (Banknote Distribution Framework) ecosystem
  // Includes red BDF lines, blue/yellow connecting lines, and dots for big four banks (52-55)
  'bdf-box': {
    groups: ['bdf-system'],
    related: [
      'bdf-line-52', 'bdf-line-53', 'bdf-line-54', 'bdf-line-55',
      'blue-line-52', 'blue-line-53', 'blue-line-54', 'blue-line-55',
      'yellow-line-52', 'yellow-line-53', 'yellow-line-54', 'yellow-line-55',
      'yellow-dot-52', 'yellow-dot-53', 'yellow-dot-54', 'yellow-dot-55',
      'dot-52', 'dot-53', 'dot-54', 'dot-55'
    ]
  },
  'bdf-line-52': {
    groups: ['bdf-system'],
    related: ['bdf-box', 'bdf-line-53', 'bdf-line-54', 'bdf-line-55', 'blue-line-52', 'yellow-line-52', 'yellow-dot-52', 'dot-52']
  },
  'bdf-line-53': {
    groups: ['bdf-system'],
    related: ['bdf-box', 'bdf-line-52', 'bdf-line-54', 'bdf-line-55', 'blue-line-53', 'yellow-line-53', 'yellow-dot-53', 'dot-53']
  },
  'bdf-line-54': {
    groups: ['bdf-system'],
    related: ['bdf-box', 'bdf-line-52', 'bdf-line-53', 'bdf-line-55', 'blue-line-54', 'yellow-line-54', 'yellow-dot-54', 'dot-54']
  },
  'bdf-line-55': {
    groups: ['bdf-system'],
    related: ['bdf-box', 'bdf-line-52', 'bdf-line-53', 'bdf-line-54', 'blue-line-55', 'yellow-line-55', 'yellow-dot-55', 'dot-55']
  },

  'swift-pds-box': {
    groups: ['swift-network'],
    related: ['swift-hvcs-box', 'swift-pds-line']
  },

  // Example: NPP ecosystem
  'npp-box': {
    groups: ['npp-ecosystem', 'fast-payments'],
    related: ['npp-to-adi-line', 'npp-to-fss-line', 'osko-box', 'payid-box', 'payto-box', 'bsct-box']
  },
  'osko-box': {
    groups: ['npp-ecosystem', 'fast-payments'],
    related: ['npp-box', 'npp-to-adi-line', 'osko-to-adi-lines']
  },
  'payid-box': {
    groups: ['npp-ecosystem'],
    related: ['npp-box', 'payto-box']
  },
  'payto-box': {
    groups: ['npp-ecosystem'],
    related: ['npp-box', 'payid-box']
  },

  // Example: Card payments
  'eftpos-box': {
    groups: ['card-payments', 'administered-batches'],
    related: ['eftpos-left-line', 'eftpos-horizontal', 'essb-box', 'mastercard-box', 'visa-box', 'other-cards-box']
  },
  'mastercard-box': {
    groups: ['card-payments', 'administered-batches'],
    related: ['mastercard-left-line', 'mastercard-horizontal', 'mcau-box', 'eftpos-box', 'visa-box']
  },

  // Example: ASX ecosystem
  'asx-settlement-dot': {
    groups: ['asx-ecosystem', 'securities'],
    related: ['asx-settlement-label', 'asx-clearing-dot', 'lch-dot', 'chess-rtgs-box', 'austraclear-box']
  },
  'asx-clearing-dot': {
    groups: ['asx-ecosystem', 'securities'],
    related: ['asx-clearing-label', 'asx-settlement-dot', 'lch-dot']
  },

  // Example: Direct Entry / BECS ecosystem
  'becn-box': {
    groups: ['direct-entry', 'bulk-payments'],
    related: ['becg-box', 'becs-line', 'direct-entry-stack', 'bpay-box']
  },
  'becg-box': {
    groups: ['direct-entry', 'bulk-payments'],
    related: ['becn-box', 'becs-line', 'direct-entry-stack']
  },
  'bpay-box': {
    groups: ['direct-entry', 'bulk-payments'],
    related: ['becn-box', 'becs-line', 'de-line']
  },

  // Example: LVSS and clearing systems
  'lvss-circle': {
    groups: ['lvss-ecosystem', 'clearing-settlement'],
    related: ['lvss-label', 'lvss-to-cecs', 'lvss-to-becs', 'lvss-to-apcs', 'lvss-to-gabs', 'lvss-to-cshd',
              'cecs-box', 'becs-box', 'apcs-box', 'gabs-box', 'cshd-box']
  },
  // LVSS gear hover - lights up clearing boxes and grey lines to RITS
  'lvss-gear': {
    groups: ['lvss-ecosystem'],
    related: [
      'apcs-box', 'becs-box', 'cshd-box', 'cecs-box', 'gabs-box',
      'lvss-line-apcs', 'lvss-line-becs', 'lvss-line-cshd', 'lvss-line-cecs', 'lvss-line-gabs'
    ]
  },
  // APCS box - triggers glowie group including LVSS gear, grey lines, Cheques box and connections
  'apcs-box': {
    groups: ['lvss-ecosystem', 'clearing-settlement'],
    related: ['lvss-gear-group', 'lvss-line-apcs', 'cheques-to-apcs-line', 'cheques-box', 'osko-to-adi-line']
  },

  // BECS box - triggers glowie group including BECN, BECG, DE boxes and red lines
  'becs-box': {
    groups: ['lvss-ecosystem', 'clearing-settlement', 'direct-entry'],
    related: ['becn-box', 'becg-box', 'becn-to-becs-line', 'becg-to-becs-line', 'de-box', 'directentry-to-adi-line', 'maroon-line-duplicate', 'maroon-horizontal-branch', 'lvss-gear-group', 'lvss-line-becs']
  },

  // CECS box - triggers glowie group including LVSS gear, grey lines, IAC box and colored lines
  'cecs-box': {
    groups: ['lvss-ecosystem', 'clearing-settlement'],
    related: [
      'lvss-gear-group', 'lvss-line-cecs',
      'cecs-to-iac-line-1', 'cecs-to-iac-line-2',
      'direct-entry-stack-bounding-box',
      'direct-entry-stack-line-blue', 'direct-entry-stack-line-yellow',
      'direct-entry-stack-line-green', 'direct-entry-stack-line-brown'
    ]
  },

  // IAC (Issuers and Acquirers Community) box - lights up CECS group and internal card boxes (Visa, Other Cards only)
  'direct-entry-stack-bounding-box': {
    groups: ['iac-ecosystem', 'clearing-settlement'],
    related: [
      'cecs-box', 'lvss-gear-group', 'lvss-line-cecs',
      'cecs-to-iac-line-1', 'cecs-to-iac-line-2',
      'direct-entry-stack-line-blue', 'direct-entry-stack-line-yellow',
      'direct-entry-stack-line-green', 'direct-entry-stack-line-brown',
      'visa-box', 'other-cards-box'
    ]
  },

  // GABS box - triggers glowie group including LVSS gear, grey lines, and OPA box
  'gabs-box': {
    groups: ['lvss-ecosystem', 'clearing-settlement'],
    related: ['lvss-gear-group', 'lvss-line-gabs', 'opa-box', 'opa-label']
  },

  // CSHD box - triggers glowie group including LVSS gear and grey lines
  'cshd-box': {
    groups: ['lvss-ecosystem', 'clearing-settlement'],
    related: ['lvss-gear-group', 'lvss-line-cshd']
  },

  // Cheques box - triggers entire APCS group
  'cheques-box': {
    groups: ['apcs-ecosystem'],
    related: ['apcs-box', 'lvss-gear-group', 'lvss-line-apcs', 'cheques-to-apcs-line', 'osko-to-adi-line']
  },

  // DE (Direct Entry) box - triggers entire BECS group plus BPAY
  'de-box': {
    groups: ['becs-ecosystem', 'direct-entry'],
    related: ['becs-box', 'becn-box', 'becg-box', 'becn-to-becs-line', 'becg-to-becs-line', 'directentry-to-adi-line', 'maroon-line-duplicate', 'maroon-horizontal-branch', 'lvss-gear-group', 'lvss-line-becs', 'bpay-box']
  },

  // BECN box - lights up DE, BECN, BECS and associated lines
  'becn-box': {
    groups: ['becs-ecosystem', 'direct-entry'],
    related: ['de-box', 'becs-box', 'becn-to-becs-line', 'lvss-gear-group', 'lvss-line-becs']
  },

  // BECG box - lights up DE, BECG, BECS and associated lines
  'becg-box': {
    groups: ['becs-ecosystem', 'direct-entry'],
    related: ['de-box', 'becs-box', 'becg-to-becs-line', 'lvss-gear-group', 'lvss-line-becs']
  },

  // Example: ADI groups
  'adi-box': {
    groups: ['adis', 'participants'],
    related: ['domestic-banks-box', 'specialised-adis-box', 'other-adis-box', 'dot-1', 'dot-52', 'dot-53', 'dot-54', 'dot-55']
  },
  'domestic-banks-box': {
    groups: ['adis', 'participants', 'domestic-banks'],
    related: ['adi-box', 'dot-52', 'dot-53', 'dot-54', 'dot-55'] // ANZ, CBA, NAB, Westpac
  },

  // Major bank dots (Big Four at indices 52-55)
  'dot-52': { // ANZ
    groups: ['domestic-banks', 'big-four', 'adis'],
    related: ['dot-53', 'dot-54', 'dot-55', 'domestic-banks-box', 'adi-box']
  },
  'dot-53': { // CBA
    groups: ['domestic-banks', 'big-four', 'adis'],
    related: ['dot-52', 'dot-54', 'dot-55', 'domestic-banks-box', 'adi-box']
  },
  'dot-54': { // NAB
    groups: ['domestic-banks', 'big-four', 'adis'],
    related: ['dot-52', 'dot-53', 'dot-55', 'domestic-banks-box', 'adi-box']
  },
  'dot-55': { // Westpac
    groups: ['domestic-banks', 'big-four', 'adis'],
    related: ['dot-52', 'dot-53', 'dot-54', 'domestic-banks-box', 'adi-box']
  },

  // Non-ADI participants
  'non-adi-box': {
    groups: ['non-adis', 'participants'],
    related: ['psps-box', 'cs-box', 'dot-92', 'dot-93', 'dot-94', 'dot-96', 'dot-97', 'dot-98']
  },
  'psps-box': {
    groups: ['non-adis', 'payment-service-providers'],
    related: ['non-adi-box', 'dot-92', 'dot-93', 'dot-94', 'dot-95']
  },
  'cs-box': {
    groups: ['non-adis', 'clearing-settlement'],
    related: ['non-adi-box', 'dot-96', 'dot-97', 'dot-98']
  },

  // Foreign Branch banks with FSS membership (yellow dots/lines)
  'dot-1': { // Citibank, N.A. - FSS Member
    groups: ['foreign-branches', 'fss-members'],
    related: ['blue-line-1', 'yellow-line-1', 'yellow-dot-1']
  },
  'dot-2': { // JPMorgan Chase Bank - FSS Member
    groups: ['foreign-branches', 'fss-members'],
    related: ['blue-line-2', 'yellow-line-2', 'yellow-dot-2']
  },

  // Yellow dots should also highlight their blue companions
  'yellow-dot-1': { // Citibank yellow dot
    groups: ['fss-members'],
    related: ['dot-1', 'blue-line-1', 'yellow-line-1']
  },
  'yellow-dot-2': { // JPMorgan yellow dot
    groups: ['fss-members'],
    related: ['dot-2', 'blue-line-2', 'yellow-line-2']
  }
};

/**
 * Get all elements that should highlight when hovering over an element
 * @param {string} elementId - ID of the element being hovered
 * @returns {Set<string>} - Set of element IDs to highlight
 */
function getRelatedElements(elementId) {
  const relationship = elementRelationships[elementId];
  if (!relationship) return new Set([elementId]); // Just highlight itself

  const toHighlight = new Set([elementId]); // Always include the element itself

  // Add directly related elements
  if (relationship.related) {
    relationship.related.forEach(id => toHighlight.add(id));
  }

  return toHighlight;
}

/**
 * Get all elements in the same group(s) as the hovered element
 * @param {string} elementId - ID of the element being hovered
 * @returns {Set<string>} - Set of element IDs in same groups
 */
function getGroupElements(elementId) {
  const relationship = elementRelationships[elementId];
  if (!relationship || !relationship.groups) return new Set([elementId]);

  const groupElements = new Set([elementId]);

  // Find all elements that share at least one group
  Object.entries(elementRelationships).forEach(([otherId, otherRel]) => {
    if (otherId === elementId) return;
    if (!otherRel.groups) return;

    // Check if any groups overlap
    const hasSharedGroup = relationship.groups.some(group =>
      otherRel.groups.includes(group)
    );

    if (hasSharedGroup) {
      groupElements.add(otherId);
    }
  });

  return groupElements;
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.elementRelationships = elementRelationships;
  window.getRelatedElements = getRelatedElements;
  window.getGroupElements = getGroupElements;
}
