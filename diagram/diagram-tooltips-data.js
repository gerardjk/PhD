/**
 * Tooltip content for all interactive elements
 * Structured data that populates tooltips when hovering
 */

const tooltipContent = {
  // RBA and related
  'dot-0': {
    title: 'RBA',
    subtitle: 'Reserve Bank of Australia',
    description: 'Central bank responsible for monetary policy and financial system stability',
    details: [
      'Operates RITS (Reserve Bank Information and Transfer System)',
      'Provides high-value settlement services',
      'Oversees payment system stability'
    ]
  },
  'opa-box': {
    title: 'OPA',
    subtitle: 'Official Public Account',
    description: 'Commonwealth government\'s account with the Reserve Bank',
    details: [
      'Holds Australian Government funds',
      'Used for government payments and receipts',
      'Managed by Reserve Bank of Australia'
    ],
    hours: 'Monday-Friday (RITS operating hours)'
  },
  'opa-label': {
    title: 'OPA',
    subtitle: 'Official Public Account',
    description: 'Commonwealth government\'s account with the Reserve Bank'
  },
  'swift-pds-box': {
    title: 'SWIFT PDS',
    subtitle: 'SWIFT Payment Delivery System',
    description: 'International payment messaging service',
    details: [
      'Connects to global SWIFT network',
      'Handles cross-border payment messages',
      'Operated by SWIFT'
    ]
  },

  // NPP ecosystem
  'npp-box': {
    title: 'NPP BI (SWIFT)',
    subtitle: 'New Payments Platform Basic Infrastructure',
    description: 'Real-time payment infrastructure for Australia',
    details: [
      'Enables instant payments 24/7',
      'Supports PayID and PayTo',
      'Operated by NPP Australia',
      'Built on ISO 20022 messaging'
    ],
    hours: '24/7 availability'
  },
  'osko-box': {
    title: 'Osko',
    subtitle: 'Fast payment service',
    description: 'Consumer-facing brand for NPP payments',
    details: [
      'Real-time account-to-account payments',
      'PayID address resolution',
      'Payment with message capability'
    ]
  },
  'payid-box': {
    title: 'PayID',
    subtitle: 'Payment addressing service',
    description: 'Simplified payment addressing using mobile, email, or ABN',
    details: [
      'Links easy-to-remember addresses to BSB/account',
      'Supports multiple address types',
      'Managed by NPP Australia'
    ]
  },
  'payto-box': {
    title: 'PayTo',
    subtitle: 'Payment initiation service',
    description: 'Digital alternative to direct debits',
    details: [
      'Real-time payment authorization',
      'Customer controls from banking app',
      'Replaces traditional direct debit'
    ]
  },

  // RITS and FSS
  'big-circle': {
    title: 'RITS Settlement Engine',
    subtitle: 'Reserve Bank Information and Transfer System',
    description: 'High-value real-time gross settlement system',
    details: [
      'Processes high-value and time-critical payments',
      'Real-time gross settlement (RTGS)',
      'Operated by Reserve Bank of Australia'
    ],
    hours: 'Monday-Friday 7:30-22:00 AEST/AEDT'
  },
  'small-circle': {
    title: 'FSS',
    subtitle: 'Fast Settlement Service',
    description: 'Real-time settlement service for retail payments',
    details: [
      'Supports NPP and other fast payment systems',
      'Operates 24/7/365',
      'Managed by Reserve Bank of Australia'
    ],
    hours: '24/7 availability'
  },

  // Card payments
  'eftpos-box': {
    title: 'eftpos',
    subtitle: 'Electronic Funds Transfer at Point of Sale',
    description: 'Australian domestic debit card scheme',
    details: [
      'Processes debit card transactions',
      'Domestic scheme owned by Australian institutions',
      'ESSB (eftpos Shared Services Bridge) settlement'
    ]
  },
  'mastercard-box': {
    title: 'Mastercard',
    subtitle: 'International card scheme',
    description: 'Global credit and debit card network',
    details: [
      'International card payments',
      'MCAU (Mastercard Australia) settlement',
      'Settled through administered batches'
    ]
  },
  'visa-box': {
    title: 'Visa',
    subtitle: 'International card scheme',
    description: 'Global credit and debit card network',
    details: [
      'International card payments',
      'Settled through card networks',
      'Processed via administered batches'
    ]
  },
  'other-cards-box': {
    title: 'Other Cards',
    subtitle: 'Additional card schemes',
    description: 'Other international and domestic card networks',
    details: [
      'American Express, Diners, etc.',
      'Various settlement arrangements',
      'Batch settlement to ADIs'
    ]
  },

  // Direct Entry / BECS
  'becn-box': {
    title: 'BECN',
    subtitle: 'Bulk Electronic Clearing (Net)',
    description: 'Net settlement for bulk electronic payments',
    details: [
      'Direct Entry payment batches',
      'Salary, pension, and bill payments',
      'Settled via BECS (Bulk Electronic Clearing System)'
    ]
  },
  'becg-box': {
    title: 'BECG',
    subtitle: 'Bulk Electronic Clearing (Gross)',
    description: 'Gross settlement for high-value bulk payments',
    details: [
      'Same-day high-value direct entry',
      'Gross settlement mode',
      'BECS processing'
    ]
  },
  'bpay-box': {
    title: 'BPAY',
    subtitle: 'Bill payment service',
    description: 'Electronic bill payment system',
    details: [
      'Consumer bill payments',
      'Biller code and reference number',
      'Operated by BPAY Group'
    ]
  },

  // LVSS and clearing
  'lvss-circle': {
    title: 'LVSS',
    subtitle: 'Low Value Settlement Service',
    description: 'Settlement service for retail payment streams',
    details: [
      'Multilateral net settlement',
      'Processes BECS, CECS, and other clearing streams',
      'Operated by RBA',
      'Multiple settlement cycles per day'
    ]
  },
  'cecs-box': {
    title: 'IAC',
    subtitle: 'Industry Administered Clearing',
    description: 'Clearing arrangements managed by industry bodies',
    details: [
      'Various industry-specific clearing',
      'Settled through LVSS',
      'Multiple clearing streams'
    ]
  },
  'becs-box': {
    title: 'BECS',
    subtitle: 'Bulk Electronic Clearing System',
    description: 'Processes Direct Entry payment batches',
    details: [
      'Handles BECN and BECG streams',
      'Multiple settlement cycles',
      'Operated by Australian Payments Network'
    ]
  },
  'apcs-box': {
    title: 'APCS',
    subtitle: 'Australian Paper Clearing System',
    description: 'Processes paper-based instruments',
    details: [
      'Cheques and payment orders',
      'Declining volume',
      'Legacy clearing system'
    ]
  },
  'gabs-box': {
    title: 'GABS',
    subtitle: 'Government & Banking Settlement',
    description: 'Settlement for government payments',
    details: [
      'Government agency payments',
      'Settled through LVSS',
      'Managed by specific government arrangements'
    ]
  },

  // ASX ecosystem
  'asx-settlement-dot': {
    title: 'ASX Settlement Pty Limited',
    subtitle: 'Securities settlement operator',
    description: 'Provides settlement services for equities and other securities',
    details: [
      'Operates CHESS (Clearing House Electronic Subregister System)',
      'T+2 settlement cycle',
      'Part of ASX Group'
    ]
  },
  'asx-clearing-dot': {
    title: 'ASX Clearing Corporation Limited',
    subtitle: 'Central counterparty',
    description: 'Provides clearing and risk management for trades',
    details: [
      'Acts as central counterparty (CCP)',
      'Manages counterparty risk',
      'Operates margin and collateral systems'
    ]
  },
  'lch-dot': {
    title: 'LCH Limited',
    subtitle: 'London Clearing House',
    description: 'International clearing house',
    details: [
      'Clears OTC derivatives and repos',
      'Multi-asset clearing',
      'Part of LSEG Group'
    ]
  },

  // Participant groups
  'adi-box': {
    title: 'ADIs',
    subtitle: 'Authorised Deposit-taking Institutions',
    description: 'Banks and other institutions authorized to take deposits',
    details: [
      'Regulated by APRA',
      'Includes banks, building societies, credit unions',
      'Direct participants in payment systems'
    ]
  },
  'domestic-banks-box': {
    title: 'Domestic Banks',
    subtitle: 'Australian-owned banks',
    description: 'Major Australian retail and commercial banks',
    details: [
      'Big Four: ANZ, CBA, NAB, Westpac',
      'Regional and smaller banks',
      'Provide full retail banking services'
    ]
  },
  'non-adi-box': {
    title: 'Non-ADIs',
    subtitle: 'Non-bank participants',
    description: 'Financial service providers that are not ADIs',
    details: [
      'Payment service providers',
      'Clearing and settlement facilities',
      'Indirect participants via sponsoring ADIs'
    ]
  },
  'psps-box': {
    title: 'PSPs',
    subtitle: 'Payment Service Providers',
    description: 'Non-bank payment facilitators',
    details: [
      'Fintechs and payment platforms',
      'Require ADI sponsorship',
      'Examples: Adyen, First Data Network'
    ]
  },
  'cs-box': {
    title: 'CS',
    subtitle: 'Clearing and Settlement',
    description: 'Clearing and settlement facility operators',
    details: [
      'ASX Settlement, ASX Clear, LCH',
      'Licensed under Corporations Act',
      'Provide post-trade infrastructure'
    ]
  },

  // Major banks
  'dot-50': {
    title: 'ANZ',
    subtitle: 'Australia and New Zealand Banking Group',
    description: 'One of Australia\'s Big Four banks',
    details: [
      'Full-service retail and commercial bank',
      'Major participant in all payment systems',
      'Listed on ASX'
    ]
  },
  'dot-51': {
    title: 'Commonwealth Bank',
    subtitle: 'Commonwealth Bank of Australia',
    description: 'Australia\'s largest bank by market cap',
    details: [
      'Full-service retail and commercial bank',
      'Major payment system participant',
      'Listed on ASX'
    ]
  },
  'dot-52': {
    title: 'NAB',
    subtitle: 'National Australia Bank',
    description: 'One of Australia\'s Big Four banks',
    details: [
      'Full-service retail and commercial bank',
      'Strong business banking presence',
      'Listed on ASX'
    ]
  },
  'dot-53': {
    title: 'Westpac',
    subtitle: 'Westpac Banking Corporation',
    description: 'Australia\'s oldest bank (founded 1817)',
    details: [
      'Full-service retail and commercial bank',
      'Major payment system participant',
      'Listed on ASX'
    ]
  }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.tooltipContent = tooltipContent;
}
