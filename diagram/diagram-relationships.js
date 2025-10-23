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
  'cecs-box': {
    groups: ['lvss-ecosystem', 'clearing-settlement'],
    related: ['lvss-circle', 'lvss-to-cecs']
  },
  'becs-box': {
    groups: ['lvss-ecosystem', 'clearing-settlement', 'direct-entry'],
    related: ['lvss-circle', 'lvss-to-becs', 'becn-box', 'becg-box']
  },

  // Example: ADI groups
  'adi-box': {
    groups: ['adis', 'participants'],
    related: ['domestic-banks-box', 'specialised-adis-box', 'other-adis-box', 'dot-1', 'dot-50', 'dot-51', 'dot-52', 'dot-53']
  },
  'domestic-banks-box': {
    groups: ['adis', 'participants', 'domestic-banks'],
    related: ['adi-box', 'dot-50', 'dot-51', 'dot-52', 'dot-53'] // ANZ, CBA, NAB, Westpac
  },

  // Major bank dots
  'dot-50': { // ANZ
    groups: ['domestic-banks', 'big-four', 'adis'],
    related: ['dot-51', 'dot-52', 'dot-53', 'domestic-banks-box', 'adi-box']
  },
  'dot-51': { // CBA
    groups: ['domestic-banks', 'big-four', 'adis'],
    related: ['dot-50', 'dot-52', 'dot-53', 'domestic-banks-box', 'adi-box']
  },
  'dot-52': { // NAB
    groups: ['domestic-banks', 'big-four', 'adis'],
    related: ['dot-50', 'dot-51', 'dot-53', 'domestic-banks-box', 'adi-box']
  },
  'dot-53': { // Westpac
    groups: ['domestic-banks', 'big-four', 'adis'],
    related: ['dot-50', 'dot-51', 'dot-52', 'domestic-banks-box', 'adi-box']
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
