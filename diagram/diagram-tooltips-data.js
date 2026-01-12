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
  'swift-pds-rect': {
    title: 'SWIFT PDS',
    subtitle: 'Payment Data Service',
    description: 'SWIFT messaging gateway for Australian payment systems, providing standardised ISO 20022 message translation and routing',
    details: [
      'Translates domestic formats to ISO 20022 pacs messages',
      'Routes payment instructions to RITS for settlement',
      'Connects Australian systems to global SWIFT network',
      'Handles pacs.009, pacs.008, and pacs.004 message types'
    ],
    link: 'https://www.swift.com/'
  },
  'swift-hvcs-box': {
    title: 'SWIFT HVCS',
    subtitle: 'High Value Clearing System',
    description: 'SWIFT-based messaging system for high-value payments in Australia, processing payment instructions via ISO 20022 messages',
    details: [
      'Processes high-value interbank payments',
      'Uses pacs.009 (Financial Institution Credit Transfer)',
      'Uses pacs.008 (Customer Credit Transfer)',
      'Uses pacs.004 (Payment Return)',
      'Messages routed through SWIFT PDS to RITS'
    ],
    link: 'https://www.rba.gov.au/payments-and-infrastructure/rits/'
  },
  'pacs-009-box': {
    title: 'pacs.009',
    subtitle: 'Financial Institution Credit Transfer',
    description: 'ISO 20022 message for interbank credit transfers',
    smallStyle: true
  },
  'pacs-008-box': {
    title: 'pacs.008',
    subtitle: 'Customer Credit Transfer',
    description: 'ISO 20022 message for customer-initiated transfers',
    smallStyle: true
  },
  'pacs-004-box': {
    title: 'pacs.004',
    subtitle: 'Payment Return',
    description: 'ISO 20022 message for returning/rejecting payments',
    smallStyle: true
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
  'npp-purple-box': {
    title: 'NPP',
    subtitle: 'New Payments Platform',
    description: 'Australia\'s real-time payments infrastructure enabling instant fund transfers between participating financial institutions',
    details: [
      'Real-time clearing and settlement 24/7/365',
      'Supports Osko fast payments',
      'PayID addressing service',
      'PayTo for third-party initiated payments',
      'ISO 20022 messaging standard'
    ],
    link: 'https://nppa.com.au/'
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
  'bsct-box': {
    title: 'BSCT',
    subtitle: 'Basic Single Credit Transfer',
    description: 'ISO 20022 message type for NPP credit transfers',
    details: [
      'Standard message format for NPP payments',
      'Supports real-time fund transfers',
      'Enables rich payment data'
    ]
  },
  'payid-box': {
    title: 'PayID / PayTo',
    subtitle: 'NPP Overlay Services',
    description: 'PayID enables simplified payment addressing using mobile, email, or ABN. PayTo provides real-time payment authorization as a digital alternative to direct debits.',
    details: [
      'PayID links easy-to-remember addresses to BSB/account',
      'PayTo enables customer-controlled recurring payments',
      'Both managed by NPP Australia'
    ]
  },
  'payto-box': {
    title: 'IPS',
    subtitle: 'International Payment Service',
    description: 'Cross-border payment capability for the NPP enabling real-time international transfers',
    details: [
      'Connects NPP to international payment networks',
      'Supports real-time cross-border payments',
      'ISO 20022 messaging standard'
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
  'mcau-box': {
    title: 'MCAU',
    subtitle: 'Mastercard Australia',
    description: 'Australian settlement entity for Mastercard transactions',
    details: [
      'Settles Mastercard card payments in Australia',
      'Administered batch settlement through RITS',
      'Processes domestic Mastercard transactions'
    ]
  },
  'essb-box': {
    title: 'ESSB',
    subtitle: 'eftpos Shared Services Bridge',
    description: 'Settlement entity for eftpos transactions',
    details: [
      'Settles eftpos debit card payments',
      'Administered batch settlement through RITS',
      'Processes domestic eftpos transactions'
    ]
  },
  'pexa-convey-box': {
    title: 'PEXA e-conveyancing',
    subtitle: 'Property Exchange Australia',
    description: 'Electronic property settlement platform',
    details: [
      'Digital platform for property transactions',
      'Enables electronic lodgement and settlement',
      'Settles through PEXA administered batches in RITS'
    ]
  },
  'sympli-box': {
    title: 'Sympli e-conveyancing',
    subtitle: 'Electronic Property Settlement',
    description: 'Alternative electronic property settlement platform',
    details: [
      'Competing e-conveyancing platform to PEXA',
      'Digital property transaction settlement',
      'Settles through ASXF administered batches in RITS'
    ]
  },
  'pexa-box': {
    title: 'PEXA',
    subtitle: 'PEXA Settlement',
    description: 'Settlement entity for PEXA property transactions',
    details: [
      'Processes PEXA e-conveyancing settlements',
      'Administered batch settlement through RITS',
      'Handles property transfer payments'
    ]
  },
  'asxf-box': {
    title: 'ASXF',
    subtitle: 'ASX Feeder',
    description: 'Settlement entity for Sympli and ASX-related transactions',
    details: [
      'Processes Sympli e-conveyancing settlements',
      'Administered batch settlement through RITS',
      'Feeds settlement instructions to RITS'
    ]
  },
  'asxb-box': {
    title: 'ASXB',
    subtitle: 'ASX Batch',
    description: 'Batch settlement facility for ASX clearing and settlement',
    details: [
      'Processes batch settlements from CHESS clearing/netting',
      'Administered batch settlement through RITS',
      'Handles equities and fixed income settlement'
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
  'atms-box': {
    title: 'ATMs',
    subtitle: 'Automated Teller Machines',
    description: 'ATM transaction clearing and settlement',
    details: [
      'Cash withdrawal transactions',
      'Interbank ATM settlements',
      'Cleared through IAC/CECS'
    ]
  },
  'claims-box': {
    title: 'Claims',
    subtitle: 'Medicare and health claims',
    description: 'Health insurance and Medicare claim processing',
    details: [
      'Medicare rebate claims',
      'Health fund claims',
      'Cleared through IAC/CECS'
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
  'de-box': {
    title: 'Direct Entry',
    subtitle: 'Bulk electronic funds transfer',
    description: 'System for processing batched credit and debit transfers between bank accounts',
    details: [
      'Salary payments and superannuation',
      'Direct debits and credits',
      'Processed through BECS',
      'Next-day or same-day settlement'
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
    description: 'Settlement hub for retail payment clearing streams. Receives File Settlement Instructions (FSIs) from APCS, BECS, CSHD, CECS and GABS via the Community of Interest Network (COIN), then settles net positions across Exchange Settlement Accounts in RITS.',
    details: [
      'Multilateral net settlement',
      'Multiple settlement cycles per day',
      'COIN infrastructure operated by Transaction Network Services (TNS)',
      'Operated by RBA'
    ],
    link: 'https://www.rba.gov.au/payments-and-infrastructure/payments-system.html'
  },
  'cecs-box': {
    title: 'CECS',
    subtitle: 'Consumer Electronic Clearing System',
    description: 'Clears card-based transactions for settlement',
    details: [
      'Processes card payment clearing',
      'Settled through LVSS',
      'Connects to IAC (Issuers and Acquirers Community)'
    ]
  },
  'direct-entry-stack-bounding-box': {
    title: 'IAC',
    subtitle: 'Issuers and Acquirers Community',
    description: 'Card payment schemes and clearing arrangements',
    details: [
      'Card payment clearing (eftpos, Mastercard, Visa)',
      'Industry-managed clearing streams',
      'Connects to CECS for settlement'
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
  'cshd-box': {
    title: 'CSHD',
    subtitle: 'Cashcard High Value Direct Entry',
    description: 'High-value direct entry clearing stream',
    details: [
      'Formerly operated by Cashcard Australia Limited',
      'High-value electronic payments',
      'Settled through LVSS',
      'Now defunct or integrated into other systems'
    ]
  },
  'cheques-box': {
    title: 'Cheques',
    subtitle: 'Paper-based payment instruments',
    description: 'Traditional paper-based payment method cleared through the Australian cheque system',
    details: [
      'Declining usage in Australia',
      'Cleared through APCS (Australian Paper Clearing System)',
      'Settlement through LVSS in RITS',
      'Subject to the Cheques Act 1986'
    ]
  },
  'administered-batches-box': {
    title: 'Administered Batches',
    subtitle: 'Batch settlement facilities in RITS',
    description: 'Settlement arrangements where the Reserve Bank administers batch processing on behalf of external systems. PEXA and ASXF submit reservation batches via the Community of Interest Network (COIN), while MCAU, ESSB and ASXB submit settlement-only batches via SWIFT.',
    details: [
      'Includes MCAU, ESSB, PEXA, ASXF, and ASXB',
      'Reservation batches (PEXA, ASXF): RBA proprietary XML over COIN',
      'Settlement-only batches (MCAU, ESSB, ASXB): SWIFT messages',
      'Settles net positions across Exchange Settlement Accounts'
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
  'asx-box': {
    title: 'ASX',
    subtitle: 'Australian Securities Exchange',
    description: 'Australia\'s primary securities exchange and market operator',
    details: [
      'Operates equities, derivatives and fixed income markets',
      'Owns ASX Settlement, ASX Clearing and Austraclear',
      'CHESS provides settlement and subregister services',
      'Part-owner of Sympli e-conveyancing platform'
    ]
  },
  'chess-box': {
    title: 'CHESS',
    subtitle: 'Clearing House Electronic Subregister System',
    description: 'Electronic system for settlement of ASX-listed securities and maintenance of shareholding records',
    details: [
      'Settles equities on T+2 basis',
      'Maintains electronic subregister of shareholdings',
      'Processes corporate actions',
      'Links to CHESS-RTGS for DvP settlement'
    ]
  },
  'chess-rtgs-box': {
    title: 'CHESS-RTGS (CHESS)',
    subtitle: 'CHESS Real-Time Gross Settlement',
    description: 'Interface between CHESS and RITS for real-time delivery versus payment settlement',
    details: [
      'Enables DvP Model 1 settlement',
      'Real-time securities against cash settlement',
      'Reduces settlement risk for high-value transactions',
      'Operated by ASX Settlement'
    ]
  },
  'austraclear-box': {
    title: 'Austraclear',
    subtitle: 'Debt securities depository and settlement',
    description: 'Central securities depository for debt securities and repurchase agreements',
    details: [
      'Settles government and corporate bonds',
      'Processes money market instruments',
      'Provides custody and settlement services',
      'Connects to RITS for cash settlement'
    ]
  },

  // ASX thick blue lines - cash settlement flows
  'asx-to-adi-line': {
    title: 'ASX EXIGO SWIFT Messaging (Austraclear)',
    title2: 'ASX EIS (CHESS)',
    description: 'EXIGO is ASX\'s SWIFT-based messaging system for Austraclear cash movements and fixed income settlement. EIS (CHESS External Interface Specification) handles equities settlement messaging between CHESS and participants.',
    lineStyle: true
  },
  'asx-to-hvcs-line': {
    title: 'ASX EXIGO SWIFT Messaging (Austraclear)',
    title2: 'ASX EIS (CHESS)',
    description: 'EXIGO is ASX\'s SWIFT-based messaging system for Austraclear cash movements and fixed income settlement. EIS (CHESS External Interface Specification) handles equities settlement messaging between CHESS and participants.',
    lineStyle: true
  },
  'clearing-box': {
    title: 'Clearing/Netting',
    subtitle: 'Batch netting of securities transactions',
    description: 'Multilateral netting reduces the number and value of settlements',
    lineStyle: true
  },
  'trade-by-trade-box': {
    title: 'Trade-by-Trade',
    subtitle: 'Gross settlement of securities transactions',
    description: 'Each trade settled individually in real-time via CHESS-RTGS',
    lineStyle: true
  },
  'dvp-cash-leg-box': {
    title: 'Delivery versus Payment Cash Leg',
    subtitle: 'Real Time Gross Settlement',
    description: 'Cash settlement component of DvP transactions in Austraclear',
    lineStyle: true,
    colorFrom: 'dvp-cash-leg-to-dvp-rtgs-line'
  },
  'cash-transfer-box': {
    title: 'Cash Transfer',
    subtitle: 'Real Time Gross Settlement',
    description: 'Non-DvP cash transfers settled through Austraclear to RITS',
    lineStyle: true,
    colorFrom: 'cash-transfer-to-rtgs-line'
  },

  // DvP cash leg settlement path - all elements share same tooltip
  'dvp-cash-leg-to-dvp-rtgs-line': {
    title: 'Delivery versus Payment Cash Leg',
    subtitle: 'Real Time Gross Settlement',
    description: 'Cash settlement component of DvP transactions in Austraclear',
    lineStyle: true
  },
  'dvp-rtgs-box': {
    title: 'Delivery versus Payment Cash Leg',
    subtitle: 'Real Time Gross Settlement',
    description: 'Cash settlement component of DvP transactions in Austraclear',
    lineStyle: true
  },
  'dvp-rtgs-to-austraclear-line': {
    title: 'Delivery versus Payment Cash Leg',
    subtitle: 'Real Time Gross Settlement',
    description: 'Cash settlement component of DvP transactions in Austraclear',
    lineStyle: true
  },
  'austraclear-to-rits-line-upper': {
    title: 'Delivery versus Payment Cash Leg',
    subtitle: 'Real Time Gross Settlement',
    description: 'Cash settlement component of DvP transactions in Austraclear',
    lineStyle: true
  },

  // Cash transfer settlement path - all elements share same tooltip
  'cash-transfer-to-rtgs-line': {
    title: 'Cash Transfer',
    subtitle: 'Real Time Gross Settlement',
    description: 'Non-DvP cash transfers settled through Austraclear to RITS',
    lineStyle: true
  },
  'rtgs-box': {
    title: 'Cash Transfer',
    subtitle: 'Real Time Gross Settlement',
    description: 'Non-DvP cash transfers settled through Austraclear to RITS',
    lineStyle: true
  },
  'rtgs-to-austraclear-line': {
    title: 'Cash Transfer',
    subtitle: 'Real Time Gross Settlement',
    description: 'Non-DvP cash transfers settled through Austraclear to RITS',
    lineStyle: true
  },
  'austraclear-to-rits-line-lower': {
    title: 'Cash Transfer',
    subtitle: 'Real Time Gross Settlement',
    description: 'Non-DvP cash transfers settled through Austraclear to RITS',
    lineStyle: true
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
  },

  // ========== LINE TOOLTIPS ==========
  // ISO 20022 (SWIFT) lines - turquoise color (#5dd9b8)
  // All turquoise lines share the same tooltip style
  'hvcs-horizontal-line': {
    title: 'ISO 20022 (SWIFT)',
    description: 'Standardised financial messaging format used for payment instructions between financial institutions via the SWIFT network',
    lineStyle: true
  },
  'pacs-to-swift-line-0': {
    title: 'ISO 20022 (SWIFT)',
    description: 'Standardised financial messaging format used for payment instructions between financial institutions via the SWIFT network',
    lineStyle: true
  },
  'pacs-to-swift-line-1': {
    title: 'ISO 20022 (SWIFT)',
    description: 'Standardised financial messaging format used for payment instructions between financial institutions via the SWIFT network',
    lineStyle: true
  },
  'pacs-to-swift-line-2': {
    title: 'ISO 20022 (SWIFT)',
    description: 'Standardised financial messaging format used for payment instructions between financial institutions via the SWIFT network',
    lineStyle: true
  },
  'swift-pds-to-rits-line-0': {
    title: 'ISO 20022 (SWIFT)',
    description: 'Standardised financial messaging format used for payment instructions between financial institutions via the SWIFT network',
    lineStyle: true
  },
  'swift-pds-to-rits-line-1': {
    title: 'ISO 20022 (SWIFT)',
    description: 'Standardised financial messaging format used for payment instructions between financial institutions via the SWIFT network',
    lineStyle: true
  },
  'swift-pds-to-rits-line-2': {
    title: 'ISO 20022 (SWIFT)',
    description: 'Standardised financial messaging format used for payment instructions between financial institutions via the SWIFT network',
    lineStyle: true
  },
  // NPP-related turquoise lines
  'npp-to-adi-line': {
    title: 'ISO 20022 (SWIFT)',
    description: 'Standardised financial messaging format used for payment instructions between financial institutions via the SWIFT network',
    lineStyle: true
  },
  'new-pacs-to-npp-line': {
    title: 'ISO 20022 (SWIFT)',
    description: 'Standardised financial messaging format used for payment instructions between financial institutions via the SWIFT network',
    lineStyle: true
  },
  'npp-to-fss-path': {
    title: 'ISO 20022 (SWIFT)',
    description: 'Standardised financial messaging format used for payment instructions between financial institutions via the SWIFT network',
    lineStyle: true
  },

  // CLS PvP lines - neon green color (#00FF33)
  'cls-aud-line-new': {
    title: 'ISO 20022 CLS PvP',
    description: 'Payment-versus-payment settlement messages for foreign exchange transactions via CLS (Continuous Linked Settlement)',
    lineStyle: true
  },
  'cls-to-rits-line-final': {
    title: 'ISO 20022 CLS PvP',
    description: 'Payment-versus-payment settlement messages for foreign exchange transactions via CLS (Continuous Linked Settlement)',
    lineStyle: true
  },
  'cls-s-curve': {
    title: 'ISO 20022 CLS PvP',
    description: 'Payment-versus-payment settlement messages for foreign exchange transactions via CLS (Continuous Linked Settlement)',
    lineStyle: true
  },

  // Direct Entry ABA lines - red color (#ff073a)
  'directentry-to-adi-line': {
    title: 'DE (ABA) File Format',
    description: 'Australian Bankers Association file format used for Direct Entry batch payments through the Bulk Electronic Clearing System',
    lineStyle: true
  },
  'maroon-horizontal-branch': {
    title: 'DE (ABA) File Format',
    description: 'Australian Bankers Association file format used for Direct Entry batch payments through the Bulk Electronic Clearing System',
    lineStyle: true
  },
  'becn-to-becs-line': {
    title: 'DE (ABA) File Format',
    description: 'Australian Bankers Association file format used for Direct Entry batch payments through the Bulk Electronic Clearing System',
    lineStyle: true
  },
  'becg-to-becs-line': {
    title: 'DE (ABA) File Format',
    description: 'Australian Bankers Association file format used for Direct Entry batch payments through the Bulk Electronic Clearing System',
    lineStyle: true
  },

  // APCS Cheques lines - grey color (#e5e7eb)
  'cheques-to-apcs-line': {
    title: 'APCS Truncated Presentment',
    description: 'Electronic exchange of cheque images between financial institutions under the Australian Paper Clearing System',
    lineStyle: true,
    colorFrom: 'cheques-to-apcs-line-visible'
  },
  'osko-to-adi-line': {
    title: 'APCS Truncated Presentment',
    description: 'Electronic exchange of cheque images between financial institutions under the Australian Paper Clearing System',
    lineStyle: true,
    colorFrom: 'osko-to-adi-line-visible'
  },

  // LVSS FSI XML lines - grey double lines through LVSS circle
  'lvss-line-gabs': {
    title: 'LVSS FSI XML',
    description: 'File Settlement Instructions in RBA proprietary XML format submitted to the Low Value Settlement Service via the Community of Interest Network (COIN) for interbank settlement',
    lineStyle: true
  },
  'lvss-line-cecs': {
    title: 'LVSS FSI XML',
    description: 'File Settlement Instructions in RBA proprietary XML format submitted to the Low Value Settlement Service via the Community of Interest Network (COIN) for interbank settlement',
    lineStyle: true
  },
  'lvss-line-cshd': {
    title: 'LVSS FSI XML',
    description: 'File Settlement Instructions in RBA proprietary XML format submitted to the Low Value Settlement Service via the Community of Interest Network (COIN) for interbank settlement',
    lineStyle: true
  },
  'lvss-line-becs': {
    title: 'LVSS FSI XML',
    description: 'File Settlement Instructions in RBA proprietary XML format submitted to the Low Value Settlement Service via the Community of Interest Network (COIN) for interbank settlement',
    lineStyle: true
  },
  'lvss-line-apcs': {
    title: 'LVSS FSI XML',
    description: 'File Settlement Instructions in RBA proprietary XML format submitted to the Low Value Settlement Service via the Community of Interest Network (COIN) for interbank settlement',
    lineStyle: true
  },
  // CECS to IAC lines - also LVSS FSI XML
  'cecs-to-iac-line-1': {
    title: 'LVSS FSI XML',
    description: 'File Settlement Instructions in RBA proprietary XML format submitted to the Low Value Settlement Service via the Community of Interest Network (COIN) for interbank settlement',
    lineStyle: true
  },
  'cecs-to-iac-line-2': {
    title: 'LVSS FSI XML',
    description: 'File Settlement Instructions in RBA proprietary XML format submitted to the Low Value Settlement Service via the Community of Interest Network (COIN) for interbank settlement',
    lineStyle: true
  },

  // PEXA/ASXF Reservation Batch lines - magenta/pink color (#FF0090)
  'pexa-horizontal-line-0': {
    title: 'Reservation Batch XML',
    description: 'RBA proprietary XML messages for property settlement transmitted over the Community of Interest Network (COIN). Funds are reserved in payers\' ESAs while title changes are processed.',
    lineStyle: true
  },
  'pexa-horizontal-line-1': {
    title: 'Reservation Batch XML',
    description: 'RBA proprietary XML messages for property settlement transmitted over the Community of Interest Network (COIN). Funds are reserved in payers\' ESAs while title changes are processed.',
    lineStyle: true
  },
  'pexa-to-rits-line': {
    title: 'Reservation Batch XML',
    description: 'RBA proprietary XML messages for property settlement transmitted over the Community of Interest Network (COIN). Funds are reserved in payers\' ESAs while title changes are processed.',
    lineStyle: true
  },
  'sympli-horizontal-line-0': {
    title: 'Reservation Batch XML',
    description: 'RBA proprietary XML messages for Sympli property settlements transmitted over the Community of Interest Network (COIN). Funds are reserved in payers\' ESAs while title changes are processed.',
    lineStyle: true
  },
  'sympli-horizontal-line-1': {
    title: 'Reservation Batch XML',
    description: 'RBA proprietary XML messages for Sympli property settlements transmitted over the Community of Interest Network (COIN). Funds are reserved in payers\' ESAs while title changes are processed.',
    lineStyle: true
  },
  'asxf-to-rits-line': {
    title: 'Reservation Batch XML',
    description: 'RBA proprietary XML messages for Sympli property settlements transmitted over the Community of Interest Network (COIN). Funds are reserved in payers\' ESAs while title changes are processed.',
    lineStyle: true
  },

  // ASXB batch settlement lines - from clearing/netting to ASXB and ASXB to RITS
  'clearing-to-asxb-line': {
    title: 'Batch Settlement Request (MT198 SMT131)',
    description: 'SWIFT MT198 messages carrying SMT131 batch settlement instructions for ASX Clear equity settlement. Net obligations from CHESS clearing are submitted to RITS for settlement across Exchange Settlement Accounts.',
    lineStyle: true
  },
  'clearing-to-asxb-line-0': {
    title: 'Batch Settlement Request (MT198 SMT131)',
    description: 'SWIFT MT198 messages carrying SMT131 batch settlement instructions for ASX Clear equity settlement. Net obligations from CHESS clearing are submitted to RITS for settlement across Exchange Settlement Accounts.',
    lineStyle: true
  },
  'clearing-to-asxb-line-1': {
    title: 'Batch Settlement Request (MT198 SMT131)',
    description: 'SWIFT MT198 messages carrying SMT131 batch settlement instructions for ASX Clear equity settlement. Net obligations from CHESS clearing are submitted to RITS for settlement across Exchange Settlement Accounts.',
    lineStyle: true
  },
  'asxb-to-rits-line': {
    title: 'Batch Settlement Request (MT198 SMT131)',
    description: 'SWIFT MT198 messages carrying SMT131 batch settlement instructions for ASX Clear equity settlement. Net obligations from CHESS clearing are submitted to RITS for settlement across Exchange Settlement Accounts.',
    lineStyle: true
  },

  // MCAU batch settlement lines - Mastercard to MCAU and MCAU to RITS
  'mastercard-to-mcau-line': {
    title: 'Batch Settlement Request (MT198 SMT131)',
    description: 'SWIFT MT198 messages carrying SMT131 batch settlement instructions for Mastercard scheme settlement. Net card payment obligations are submitted to RITS for settlement across Exchange Settlement Accounts.',
    lineStyle: true
  },
  'mcau-to-rits-line': {
    title: 'Batch Settlement Request (MT198 SMT131)',
    description: 'SWIFT MT198 messages carrying SMT131 batch settlement instructions for Mastercard scheme settlement. Net card payment obligations are submitted to RITS for settlement across Exchange Settlement Accounts.',
    lineStyle: true
  },

  // ESSB batch settlement lines - eftpos to ESSB and ESSB to RITS
  'eftpos-to-essb-line': {
    title: 'Batch Settlement Request (MT198 SMT131)',
    description: 'SWIFT MT198 messages carrying SMT131 batch settlement instructions for eftpos scheme settlement. Net card payment obligations are submitted to RITS for settlement across Exchange Settlement Accounts.',
    lineStyle: true
  },
  'essb-to-rits-line': {
    title: 'Batch Settlement Request (MT198 SMT131)',
    description: 'SWIFT MT198 messages carrying SMT131 batch settlement instructions for eftpos scheme settlement. Net card payment obligations are submitted to RITS for settlement across Exchange Settlement Accounts.',
    lineStyle: true
  },

  // eftpos ePAL lines - purple color rgb(158,138,239)
  'eftpos-left-line': {
    title: 'ePAL Settlement File Format',
    description: 'Bilateral file exchange format used by eftpos Payments Australia Limited (ePAL) for clearing and settlement of eftpos scheme transactions',
    lineStyle: true,
    colorFrom: 'eftpos-left-line-visible'
  },
  'eftpos-left-line-horizontal': {
    title: 'ePAL Settlement File Format',
    description: 'Bilateral file exchange format used by eftpos Payments Australia Limited (ePAL) for clearing and settlement of eftpos scheme transactions',
    lineStyle: true,
    colorFrom: 'eftpos-left-line-horizontal-visible'
  },

  // Mastercard IPM lines - pinkish color rgb(255,120,120)
  'mastercard-left-line': {
    title: 'Mastercard IPM File Format',
    description: 'Integrated Product Messages (IPM) format based on ISO 8583 used for Mastercard clearing and settlement through the Global Clearing Management System',
    lineStyle: true,
    colorFrom: 'mastercard-left-line-visible'
  },
  'mastercard-left-line-horizontal': {
    title: 'Mastercard IPM File Format',
    description: 'Integrated Product Messages (IPM) format based on ISO 8583 used for Mastercard clearing and settlement through the Global Clearing Management System',
    lineStyle: true,
    colorFrom: 'mastercard-left-line-horizontal-visible'
  },

  // IAC stack lines - coming from IAC box
  'direct-entry-stack-line-yellow': {
    title: 'Visa BASE II File Format',
    description: 'Fixed-length clearing file format using 168-byte Transaction Component Records (TCRs) for Visa transaction clearing and settlement',
    lineStyle: true,
    colorFrom: 'direct-entry-stack-line-yellow-visible'
  },
  'direct-entry-stack-line-blue': {
    title: 'Proprietary Scheme Formats',
    description: 'Card scheme-specific clearing formats used by AMEX, UnionPay, Diners Club and other international card networks',
    lineStyle: true,
    colorFrom: 'direct-entry-stack-line-blue-visible'
  },
  'direct-entry-stack-line-green': {
    title: 'Health Claims Protocols',
    description: 'Electronic claiming via EFTPOS terminals including Medicare Easyclaim, ECLIPSE (Electronic Claim Lodgement and Information Processing Service Environment) for hospital claims, HICAPS (Health Industry Claims and Payments Service) for private health insurers, and government schemes such as the Department of Veterans\' Affairs, Transport Accident Commission, WorkSafe, and National Disability Insurance Scheme',
    lineStyle: true,
    colorFrom: 'direct-entry-stack-line-green-visible'
  },
  'direct-entry-stack-line-brown': {
    title: 'ATM Interchange',
    description: 'ATM transactions use AS2805 (Australian Standard for Electronic Funds Transfer) messaging. Cleared through the Issuers and Acquirers Community (IAC) with deferred net settlement in RITS',
    lineStyle: true,
    colorFrom: 'direct-entry-stack-line-brown-visible'
  },

  // E-conveyancing lines to ADIs
  'sympli-to-adis-line': {
    title: 'Sympli NECDS (ELNO)',
    description: 'National Electronic Conveyancing Data Standard messages from Sympli (Electronic Lodgment Network Operator) for property settlement with financial institutions',
    lineStyle: true,
    colorFrom: 'sympli-to-adis-line-visible'
  },
  'pexa-to-adis-line': {
    title: 'PEXA NECDS (ELNO)',
    description: 'National Electronic Conveyancing Data Standard messages from PEXA (Electronic Lodgment Network Operator) for property settlement with financial institutions',
    lineStyle: true,
    colorFrom: 'pexa-to-adis-line-visible'
  }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.tooltipContent = tooltipContent;
}
