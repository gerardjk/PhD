/**
 * Tooltip content for all interactive elements
 * Structured data that populates tooltips when hovering
 */

const tooltipContent = {
  // ESA box
  'blue-dots-background': {
    title: 'ESAs',
    subtitle: 'Exchange Settlement Accounts',
    description: 'Accounts held by financial institutions at the Reserve Bank for settling payment obligations',
    details: [
      'Used to settle interbank payments',
      '101 Accounts: 92 ADIs, 8 non-ADIs, and the Reserve Bank',
      'FSS Participants hold separate FSS balance in addition to RITS balance',
      'RITS balance earns overnight cash rate'
    ],
    link: 'https://www.rba.gov.au/payments-and-infrastructure/esa/'
  },

  // Group boxes
  'adi-box': {
    title: 'ADIs',
    subtitle: 'Authorised Deposit-taking Institutions',
    description: 'Financial institutions authorised by APRA to take deposits from the public',
    details: [
      'Includes banks, building societies, and credit unions',
      'Regulated by the Australian Prudential Regulation Authority',
      'Direct participants in payment systems',
      '92 ADIs hold Exchange Settlement Accounts'
    ],
    link: 'https://www.apra.gov.au/register-of-authorised-deposit-taking-institutions'
  },

  'non-adis-box': {
    title: 'Non-ADIs',
    subtitle: 'Non-Authorised Deposit-taking Institutions',
    description: 'Financial service providers that do not take deposits but participate in payment systems',
    details: [
      'Includes payment service providers and clearing facilities',
      'Require ADI sponsorship to access payment systems',
      'Subject to Reserve Bank oversight',
      '8 non-ADIs hold Exchange Settlement Accounts'
    ],
    link: 'https://www.rba.gov.au/payments-and-infrastructure/'
  },

  'domestic-banks-box': {
    title: 'Domestic Banks',
    subtitle: 'Australian-owned banking institutions',
    description: 'Banks incorporated and headquartered in Australia',
    details: [
      'Includes the Big Four: ANZ, CBA, NAB, Westpac',
      'Regional and smaller Australian banks',
      'Provide full retail and commercial banking services',
      'Major participants in all payment systems'
    ],
    link: 'https://www.apra.gov.au/monthly-authorised-deposit-taking-institution-statistics'
  },

  'international-banks-box': {
    title: 'International Banks',
    subtitle: 'Foreign-owned banking operations in Australia',
    description: 'Banks with foreign ownership operating in Australia',
    details: [
      'Includes both branches and subsidiaries of foreign banks',
      'Provide wholesale and retail banking services',
      'Subject to APRA prudential standards',
      'Participate in Australian payment systems'
    ],
    link: 'https://www.apra.gov.au/register-of-authorised-deposit-taking-institutions'
  },

  'foreign-branches-box': {
    title: 'Foreign Branches',
    subtitle: 'Australian branches of foreign banks',
    description: 'Branches of overseas banks operating in Australia',
    details: [
      'Not separate legal entities from parent bank',
      'Capital and liquidity backed by parent',
      'Primarily wholesale banking operations',
      'Subject to APRA supervision'
    ],
    link: 'https://www.apra.gov.au/register-of-authorised-deposit-taking-institutions'
  },

  'foreign-subsidiaries-box': {
    title: 'Foreign Subsidiaries',
    subtitle: 'Australian subsidiaries of foreign banks',
    description: 'Locally incorporated subsidiaries of overseas banks',
    details: [
      'Separate legal entities from parent bank',
      'Must meet Australian capital requirements',
      'Offer retail and wholesale banking services',
      'Supervised by APRA as Australian ADIs'
    ],
    link: 'https://www.apra.gov.au/register-of-authorised-deposit-taking-institutions'
  },

  'specialised-adis-box': {
    title: 'Specialised ADIs',
    subtitle: 'ADIs with focused business models',
    description: 'Deposit-taking institutions serving specific market segments',
    details: [
      'Payment-focused institutions',
      'May not offer traditional banking products',
      'Examples: Wise Australia, Tyro Payments',
      'Subject to full APRA prudential standards'
    ],
    link: 'https://www.apra.gov.au/register-of-authorised-deposit-taking-institutions'
  },

  'other-adis-box': {
    title: 'Other ADIs',
    subtitle: 'Building societies and credit unions',
    description: 'Customer-owned banking institutions',
    details: [
      'Mutual ownership structure',
      'Primarily retail banking services',
      'Examples: Indue, CUSCAL, Australian Settlements',
      'Full ADI regulatory requirements'
    ],
    link: 'https://www.apra.gov.au/register-of-authorised-deposit-taking-institutions'
  },

  'psps-box': {
    title: 'PSPs',
    subtitle: 'Payment Service Providers',
    description: 'Non-bank entities providing payment services',
    details: [
      'Fintechs and payment platforms',
      'Require ADI sponsor for payment system access',
      'Examples: Adyen, First Data Network',
      'Subject to Reserve Bank oversight'
    ],
    link: 'https://www.rba.gov.au/payments-and-infrastructure/'
  },

  'cs-box': {
    title: 'CS',
    subtitle: 'Clearing and Settlement Facilities',
    description: 'Entities providing post-trade infrastructure services',
    details: [
      'ASX Settlement, ASX Clear, LCH',
      'Licensed under Corporations Act',
      'Subject to Reserve Bank oversight',
      'Critical financial market infrastructure'
    ],
    link: 'https://www.rba.gov.au/fin-stability/financial-market-infrastructure/'
  },

  // RBA System
  'dot-0': {
    title: 'RBA',
    subtitle: 'Reserve Bank of Australia',
    description: 'Central bank responsible for Australian monetary policy and financial system stability',
    details: [
      'Operator of RITS (Reserve Bank Information and Transfer System)',
      'Supervisor of payment systems and financial market infrastructures',
      'Manages aggregate Exchange Settlement funds supply',
      'Producer of Australian banknotes',
      'FSS participant'
    ],
    link: 'https://www.rba.gov.au/about-rba/'
  },

  // Foreign Branch Banks (dots 2-44)
  'dot-1': {
    title: 'Citibank, N.A.',
    subtitle: 'CINA',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in United States',
      'FSS Member'
    ]
  },
  'dot-2': {
    title: 'JPMorgan Chase Bank, National Association',
    subtitle: 'CHAM',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in United States',
      'FSS Member'
    ]
  },
  'dot-3': {
    title: 'Agricultural Bank of China Limited',
    subtitle: 'ABOC',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in China'
    ]
  },
  'dot-4': {
    title: 'Bank of America, National Association',
    subtitle: 'BOFA',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in United States'
    ]
  },
  'dot-5': {
    title: 'Bank of China Limited, Sydney Branch',
    subtitle: 'BOCS',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in China'
    ]
  },
  'dot-6': {
    title: 'Bank of Communications Co. Ltd.',
    subtitle: 'BCOM',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in China'
    ]
  },
  'dot-7': {
    title: 'Barclays Bank PLC',
    subtitle: 'BARC',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in United Kingdom'
    ]
  },
  'dot-8': {
    title: 'BNP Paribas',
    subtitle: 'BNPT',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in France'
    ]
  },
  'dot-9': {
    title: 'China Construction Bank Corporation',
    subtitle: 'CCBC',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in China'
    ]
  },
  'dot-10': {
    title: 'China Everbright Bank Co., Ltd',
    subtitle: 'EVER',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in China'
    ]
  },
  'dot-11': {
    title: 'China Merchants Bank Co., Ltd.',
    subtitle: 'CMBC',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in China'
    ]
  },
  'dot-12': {
    title: 'Cooperatieve Rabobank U.A.',
    subtitle: 'RANE',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in Netherlands'
    ]
  },
  'dot-13': {
    title: 'Credit Agricole Corporate and Investment Bank',
    subtitle: 'CACB',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in France'
    ]
  },
  'dot-14': {
    title: 'DBS Bank Ltd',
    subtitle: 'DBSA',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in Singapore'
    ]
  },
  'dot-15': {
    title: 'Deutsche Bank AG',
    subtitle: 'DBAL',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in Germany'
    ]
  },
  'dot-16': {
    title: 'Industrial and Commercial Bank of China Limited',
    subtitle: 'ICBK',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in China'
    ]
  },
  'dot-17': {
    title: 'ING Bank NV',
    subtitle: 'INGA',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in Netherlands'
    ]
  },
  'dot-18': {
    title: 'Mega International Commercial Bank Co. Ltd',
    subtitle: 'ICBC',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in Taiwan'
    ]
  },
  'dot-19': {
    title: 'Mizuho Bank, Ltd',
    subtitle: 'MHCB',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in Japan'
    ]
  },
  'dot-20': {
    title: 'MUFG Bank, Ltd.',
    subtitle: 'BOTK',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in Japan'
    ]
  },
  'dot-21': {
    title: 'Oversea-Chinese Banking Corporation Limited',
    subtitle: 'OCBC',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in Singapore'
    ]
  },
  'dot-22': {
    title: 'Royal Bank of Canada',
    subtitle: 'ROYC',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in Canada'
    ]
  },
  'dot-23': {
    title: 'Standard Chartered Bank',
    subtitle: 'SCBA',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in United Kingdom'
    ]
  },
  'dot-24': {
    title: 'State Bank of India',
    subtitle: 'SBIS',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in India'
    ]
  },
  'dot-25': {
    title: 'State Street Bank and Trust Company',
    subtitle: 'SSBS',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in United States'
    ]
  },
  'dot-26': {
    title: 'Sumitomo Mitsui Banking Corporation',
    subtitle: 'SMBC',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in Japan'
    ]
  },
  'dot-27': {
    title: 'Taiwan Business Bank, Ltd',
    subtitle: 'TBBS',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in Taiwan'
    ]
  },
  'dot-28': {
    title: 'The Hongkong and Shanghai Banking Corporation Limited',
    subtitle: 'HKSB',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in Hong Kong'
    ]
  },
  'dot-29': {
    title: 'The Northern Trust Company',
    subtitle: 'TNTC',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in United States'
    ]
  },
  'dot-30': {
    title: 'UBS AG',
    subtitle: 'UBSB',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in Switzerland'
    ]
  },
  'dot-31': {
    title: 'United Overseas Bank Limited',
    subtitle: 'UOBL',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in Singapore'
    ]
  },
  'dot-32': {
    title: 'Bank of Baroda',
    subtitle: 'BOBA',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in India',
      'Uses Settlement Agent'
    ]
  },
  'dot-33': {
    title: 'Bank of Taiwan',
    subtitle: 'BOTS',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in Taiwan',
      'Uses Settlement Agent'
    ]
  },
  'dot-34': {
    title: 'Canadian Imperial Bank of Commerce',
    subtitle: 'CIBS',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in Canada',
      'Uses Settlement Agent'
    ]
  },
  'dot-35': {
    title: 'E.SUN Commercial Bank, Ltd.',
    subtitle: 'ESUN',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in Taiwan',
      'Uses Settlement Agent'
    ]
  },
  'dot-36': {
    title: 'First Commercial Bank, Ltd',
    subtitle: 'FCBL',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in Taiwan',
      'Uses Settlement Agent'
    ]
  },
  'dot-37': {
    title: 'Hua Nan Commercial Bank Ltd',
    subtitle: 'HNCB',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in Taiwan',
      'Uses Settlement Agent'
    ]
  },
  'dot-38': {
    title: 'KEB Hana Bank',
    subtitle: 'KEBL',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in South Korea',
      'Uses Settlement Agent'
    ]
  },
  'dot-39': {
    title: 'Shinhan Bank Co., Ltd.',
    subtitle: 'SHIN',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in South Korea',
      'Uses Settlement Agent'
    ]
  },
  'dot-40': {
    title: 'Taishin International Bank Co., Ltd.',
    subtitle: 'TAIS',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in Taiwan',
      'Uses Settlement Agent'
    ]
  },
  'dot-41': {
    title: 'Taiwan Cooperative Bank, Ltd',
    subtitle: 'TCBA',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in Taiwan',
      'Uses Settlement Agent'
    ]
  },
  'dot-42': {
    title: 'The Bank of New York Mellon',
    subtitle: 'BNYM',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in United States',
      'Uses Settlement Agent'
    ]
  },
  'dot-43': {
    title: 'The Bank of Nova Scotia',
    subtitle: 'BNSS',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in Canada',
      'Uses Settlement Agent'
    ]
  },
  'dot-44': {
    title: 'Union Bank of India',
    subtitle: 'UBOI',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in India',
      'Uses Settlement Agent'
    ]
  },
  'dot-45': {
    title: 'Woori Bank',
    subtitle: 'WOOR',
    description: 'International Bank: Foreign Branch',
    details: [
      'Headquartered in South Korea',
      'Uses Settlement Agent'
    ]
  },

  'opa-box': {
    title: 'OPA',
    subtitle: 'Official Public Account',
    description: 'Commonwealth Government\'s account with the Reserve Bank',
    details: [
      'Holds Commonwealth funds prior to disbursement',
      'Commonwealth is required by law to bank with the Reserve Bank'
    ],
    link: 'https://www.finance.gov.au/about-us/glossary/pgpa/term-official-public-account-opa'
  },
  'bdf-box': {
    title: 'BDF',
    subtitle: 'Banknote Distribution Framework',
    description: 'Framework for distributing Australian banknotes from the Reserve Bank to financial institutions',
    details: [
      'Four major banks: ANZ, CBA, NAB, and Westpac',
      'Manage banknote inventory and distribution to branches and ATMs',
      'Coordinate with RBA for banknote supply and withdrawal'
    ],
    link: 'https://www.rba.gov.au/currency/'
  },
  'bdf-line-50': {
    title: 'Domestic Banks',
    subtitle: 'Australian-owned banking institutions',
    description: 'Banks incorporated and headquartered in Australia',
    details: [
      'Includes the Big Four: ANZ, CBA, NAB, Westpac',
      'Regional and smaller Australian banks',
      'Provide full retail and commercial banking services',
      'Major participants in all payment systems'
    ],
    link: 'https://www.apra.gov.au/monthly-authorised-deposit-taking-institution-statistics'
  },
  'bdf-line-51': {
    title: 'Domestic Banks',
    subtitle: 'Australian-owned banking institutions',
    description: 'Banks incorporated and headquartered in Australia',
    details: [
      'Includes the Big Four: ANZ, CBA, NAB, Westpac',
      'Regional and smaller Australian banks',
      'Provide full retail and commercial banking services',
      'Major participants in all payment systems'
    ],
    link: 'https://www.apra.gov.au/monthly-authorised-deposit-taking-institution-statistics'
  },
  'bdf-line-52': {
    title: 'Domestic Banks',
    subtitle: 'Australian-owned banking institutions',
    description: 'Banks incorporated and headquartered in Australia',
    details: [
      'Includes the Big Four: ANZ, CBA, NAB, Westpac',
      'Regional and smaller Australian banks',
      'Provide full retail and commercial banking services',
      'Major participants in all payment systems'
    ],
    link: 'https://www.apra.gov.au/monthly-authorised-deposit-taking-institution-statistics'
  },
  'bdf-line-53': {
    title: 'Domestic Banks',
    subtitle: 'Australian-owned banking institutions',
    description: 'Banks incorporated and headquartered in Australia',
    details: [
      'Includes the Big Four: ANZ, CBA, NAB, Westpac',
      'Regional and smaller Australian banks',
      'Provide full retail and commercial banking services',
      'Major participants in all payment systems'
    ],
    link: 'https://www.apra.gov.au/monthly-authorised-deposit-taking-institution-statistics'
  },
  'rits-circle': {
    title: 'RITS',
    subtitle: 'Reserve Bank Information and Transfer System',
    description: 'Australia\'s high-value real-time gross settlement system operated by the Reserve Bank',
    details: [
      'Settles interbank payments in real-time',
      'Processes high-value and time-critical payments',
      'Integrates with FSS (Fast Settlement Service)',
      'Core infrastructure for Australian payment systems'
    ],
    link: 'https://www.rba.gov.au/payments-and-infrastructure/rits/about.html'
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
  'fss-circle': {
    title: 'FSS',
    subtitle: 'Fast Settlement Service',
    description: 'Real-time settlement service for retail payments',
    details: [
      'Supports NPP and other fast payment systems',
      'Operates 24/7/365',
      'Managed by Reserve Bank of Australia'
    ],
    link: 'https://www.rba.gov.au/payments-and-infrastructure/rits/about.html'
  },

  // CLS - Continuous Linked Settlement
  'cls-circle': {
    title: 'CLS',
    subtitle: 'Continuous Linked Settlement',
    description: 'Global multi-currency settlement system that eliminates settlement risk in foreign exchange transactions through payment-versus-payment (PvP) settlement',
    details: [
      'Settles FX transactions for 18 currencies including AUD',
      'Eliminates Herstatt risk (FX settlement risk)',
      'Operated by CLS Bank International (New York)',
      'RBA holds an ESA on behalf of CLS for AUD settlements',
      'Settles over USD 6 trillion daily'
    ],
    link: 'https://www.cls-group.com/'
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
  'lvss-gear': {
    title: 'LVSS',
    subtitle: 'Low Value Settlement Service',
    description: 'Settlement hub for retail payment clearing streams. Receives batched settlement instructions from APCS, BECS, CSHD, CECS and GABS, then settles net positions across Exchange Settlement Accounts in RITS.',
    details: [
      'Multilateral net settlement',
      'Multiple settlement cycles per day',
      'Operated by RBA'
    ],
    link: 'https://www.rba.gov.au/payments-and-infrastructure/payments-system.html'
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

  // Foreign Subsidiaries (indices 46-51)
  'dot-46': {
    title: 'HSBC Bank Australia Limited',
    subtitle: 'HKBA',
    description: 'International Bank: Foreign Subsidiary',
    details: [
      'Subsidiary of HSBC Holdings (UK)',
      'FSS Member'
    ]
  },
  'dot-47': {
    title: 'ING Bank (Australia) Limited',
    subtitle: 'IMMB',
    description: 'International Bank: Foreign Subsidiary',
    details: [
      'Subsidiary of ING Group (Netherlands)',
      'FSS Member'
    ]
  },
  'dot-48': {
    title: 'Arab Bank Australia Limited',
    subtitle: 'ARAB',
    description: 'International Bank: Foreign Subsidiary',
    details: [
      'Subsidiary of Arab Bank (Jordan)',
      'Australian banking licence'
    ]
  },
  'dot-49': {
    title: 'Bank of China (Australia) Limited',
    subtitle: 'BOCA',
    description: 'International Bank: Foreign Subsidiary',
    details: [
      'Subsidiary of Bank of China (China)',
      'Australian banking licence'
    ]
  },
  'dot-50': {
    title: 'Bank of Sydney Ltd',
    subtitle: 'LIKI',
    description: 'International Bank: Foreign Subsidiary',
    details: [
      'Formerly Laiki Bank',
      'Australian banking licence'
    ]
  },
  'dot-51': {
    title: 'Rabobank Australia Limited',
    subtitle: 'RABL',
    description: 'International Bank: Foreign Subsidiary',
    details: [
      'Subsidiary of Rabobank (Netherlands)',
      'Focus on agribusiness banking'
    ]
  },

  // Major banks (indices 52-55)
  'dot-52': {
    title: 'ANZ',
    subtitle: 'ANZB',
    description: 'Big Four bank',
    details: [
      'FSS member'
    ]
  },
  'dot-53': {
    title: 'Commonwealth Bank',
    subtitle: 'CBAA',
    description: 'Big Four bank',
    details: [
      'FSS member'
    ]
  },
  'dot-54': {
    title: 'NAB',
    subtitle: 'NABL',
    description: 'Big Four bank',
    details: [
      'FSS member'
    ]
  },
  'dot-55': {
    title: 'Westpac',
    subtitle: 'WPAC',
    description: 'Big Four bank',
    details: [
      'FSS member'
    ]
  },
  'dot-56': {
    title: 'Macquarie Bank',
    subtitle: 'MACQ',
    description: 'Domestic bank',
    details: [
      'FSS member'
    ]
  },
  'dot-57': {
    title: 'Bendigo and Adelaide Bank',
    subtitle: 'BEND',
    description: 'Domestic bank',
    details: [
      'FSS member'
    ]
  },

  // Remaining Domestic Banks (58-86)
  'dot-58': { title: 'Alex Bank', subtitle: 'ALEX', description: 'Domestic bank', details: ['Direct RITS participant'] },
  'dot-59': { title: 'AMP Bank', subtitle: 'AMPB', description: 'Domestic bank', details: ['Direct RITS participant'] },
  'dot-60': { title: 'Bank of Queensland', subtitle: 'BQLQ', description: 'Domestic bank', details: ['Direct RITS participant'] },
  'dot-61': { title: 'Heritage and People\'s Choice', subtitle: 'HBSL', description: 'Domestic bank', details: ['Direct RITS participant'] },
  'dot-62': { title: 'Judo Bank', subtitle: 'JUDO', description: 'Domestic bank', details: ['Direct RITS participant'] },
  'dot-63': { title: 'Norfina', subtitle: 'METW', description: 'Domestic bank', details: ['Direct RITS participant'] },
  'dot-64': { title: 'Australian Military Bank', subtitle: 'ADCU', description: 'Domestic bank', details: ['Uses settlement agent'] },
  'dot-65': { title: 'Australian Mutual Bank', subtitle: 'SYCU', description: 'Domestic bank', details: ['Uses settlement agent'] },
  'dot-66': { title: 'B&E Ltd', subtitle: 'BEPB', description: 'Domestic bank', details: ['Uses settlement agent'] },
  'dot-67': { title: 'Bank Australia', subtitle: 'MECU', description: 'Domestic bank', details: ['Uses settlement agent'] },
  'dot-68': { title: 'Beyond Bank Australia', subtitle: 'CCPS', description: 'Domestic bank', details: ['Uses settlement agent'] },
  'dot-69': { title: 'Credit Union Australia', subtitle: 'CUAL', description: 'Domestic bank', details: ['Uses settlement agent'] },
  'dot-70': { title: 'Defence Bank', subtitle: 'DEFB', description: 'Domestic bank', details: ['Uses settlement agent'] },
  'dot-71': { title: 'Gateway Bank', subtitle: 'GATE', description: 'Domestic bank', details: ['Uses settlement agent'] },
  'dot-72': { title: 'Hume Bank', subtitle: 'HUBS', description: 'Domestic bank', details: ['Uses settlement agent'] },
  'dot-73': { title: 'IMB', subtitle: 'IMBS', description: 'Domestic bank', details: ['Uses settlement agent'] },
  'dot-74': { title: 'Maitland Mutual', subtitle: 'MMBS', description: 'Domestic bank', details: ['Uses settlement agent'] },
  'dot-75': { title: 'Members Banking Group', subtitle: 'QTCU', description: 'Domestic bank', details: ['Uses settlement agent'] },
  'dot-76': { title: 'MyState Bank', subtitle: 'MSFL', description: 'Domestic bank', details: ['Uses settlement agent'] },
  'dot-77': { title: 'Newcastle Greater Mutual', subtitle: 'NEWC', description: 'Domestic bank', details: ['Uses settlement agent'] },
  'dot-78': { title: 'Police & Nurses', subtitle: 'PNCS', description: 'Domestic bank', details: ['Uses settlement agent'] },
  'dot-79': { title: 'Police Bank', subtitle: 'PCUL', description: 'Domestic bank', details: ['Uses settlement agent'] },
  'dot-80': { title: 'Police Financial Services', subtitle: 'PACC', description: 'Domestic bank', details: ['Uses settlement agent'] },
  'dot-81': { title: 'QPCU', subtitle: 'QPCU', description: 'Domestic bank', details: ['Uses settlement agent'] },
  'dot-82': { title: 'Queensland Country Bank', subtitle: 'QCCU', description: 'Domestic bank', details: ['Uses settlement agent'] },
  'dot-83': { title: 'Regional Australia Bank', subtitle: 'NECU', description: 'Domestic bank', details: ['Uses settlement agent'] },
  'dot-84': { title: 'Teachers Mutual Bank', subtitle: 'TMBL', description: 'Domestic bank', details: ['Uses settlement agent'] },
  'dot-85': { title: 'Unity Bank', subtitle: 'SGCU', description: 'Domestic bank', details: ['Uses settlement agent'] },
  'dot-86': { title: 'Victoria Teachers', subtitle: 'VTCU', description: 'Domestic bank', details: ['Uses settlement agent'] },

  // Specialised ADIs (87-88)
  'dot-87': {
    title: 'Wise Australia',
    subtitle: 'WISE',
    description: 'Specialised ADI',
    details: [
      'International money transfer provider',
      'FSS member'
    ]
  },
  'dot-88': {
    title: 'Tyro Payments',
    subtitle: 'MONY',
    description: 'Specialised ADI',
    details: [
      'EFTPOS and merchant services provider'
    ]
  },

  // Other ADIs (89-91)
  'dot-89': {
    title: 'Australian Settlements',
    subtitle: 'ASLL',
    description: 'Other ADI',
    details: [
      'Clearing and settlement services',
      'FSS member'
    ]
  },
  'dot-90': {
    title: 'CUSCAL',
    subtitle: 'CUFS',
    description: 'Other ADI',
    details: [
      'Payment infrastructure for credit unions',
      'FSS member'
    ]
  },
  'dot-91': {
    title: 'Indue',
    subtitle: 'INDU',
    description: 'Other ADI',
    details: [
      'Payment services for mutual banks',
      'FSS member'
    ]
  },

  // PSPs (92-95)
  'dot-92': {
    title: 'Adyen Australia',
    subtitle: 'ADYE',
    description: 'Payment Service Provider',
    details: [
      'Global payment platform'
    ]
  },
  'dot-93': {
    title: 'EFTEX',
    subtitle: 'ETXL',
    description: 'Payment Service Provider',
    details: [
      'Payment processing'
    ]
  },
  'dot-94': {
    title: 'First Data Network',
    subtitle: 'CSCD',
    description: 'Payment Service Provider',
    details: [
      'Payment processing services'
    ]
  },
  'dot-95': {
    title: 'Citigroup',
    subtitle: 'CITI',
    description: 'Payment Service Provider',
    details: [
      'Uses settlement agent'
    ]
  },

  // CS - Clearing and Settlement (96-98)
  'dot-96': {
    title: 'ASX Clearing',
    subtitle: 'ASXC',
    description: 'Clearing and Settlement facility',
    details: [
      'Central counterparty for ASX markets'
    ]
  },
  'dot-97': {
    title: 'ASX Settlement',
    subtitle: 'ASTC',
    description: 'Clearing and Settlement facility',
    details: [
      'Securities settlement operator'
    ]
  },
  'dot-98': {
    title: 'LCH Limited',
    subtitle: 'LCHC',
    description: 'Clearing and Settlement facility',
    details: [
      'Central counterparty clearing house'
    ]
  },

  // CLS (99)
  'dot-99': {
    title: 'CLS Bank',
    subtitle: 'CLSB',
    description: 'Continuous Linked Settlement',
    details: [
      'Multi-currency FX settlement system'
    ]
  }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.tooltipContent = tooltipContent;
}
