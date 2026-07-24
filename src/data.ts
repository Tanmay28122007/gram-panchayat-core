import { Issue, FinanceEntry } from './types';

export const mockUsers = [
  { id: 'USR-001', firstName: 'Ramesh', lastName: 'Kumar', email: 'ramesh@example.com', phoneNumber: '9876543210', password: 'password123' },
  { id: 'USR-002', firstName: 'Sita', lastName: 'Devi', email: 'sita@example.com', phoneNumber: '9123456789', password: 'password123' },
];

export const mockIssues: Issue[] = [
  {
    id: 'TKT-001',
    title: 'Complaint Regarding Water Supply Disruption',
    category: 'water',
    description: 'The main hand pump near the primary school is not working for the last 3 days.',
    location: 'Sundhiya, Vadnagar',
    coordinates: { lat: 28.6139, lng: 77.2090 },
    reporter: 'Ramesh Kumar',
    reporterId: 'USR-001',
    upvotes: 12,
    status: 'red',
    reportedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    escalated: false,
  },
  {
    id: 'TKT-002',
    title: 'Complaint Regarding Streetlight Failure',
    category: 'electricity',
    description: 'Streetlight pole #12 is not turning on.',
    location: 'Sipor, Vadnagar',
    coordinates: { lat: 28.6145, lng: 77.2095 },
    reporter: 'Sita Devi',
    reporterId: 'USR-002',
    upvotes: 4,
    status: 'yellow',
    reportedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    escalated: false,
  },
  {
    id: 'TKT-003',
    title: 'Complaint Regarding Certificate Issuance',
    category: 'certificates',
    description: 'Applied for caste certificate for school admission.',
    location: 'Bhabipura, Vadnagar',
    coordinates: { lat: 28.6120, lng: 77.2100 },
    reporter: '99887XXXXX',
    upvotes: 0,
    status: 'green',
    reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    escalated: false,
  },
  {
    id: 'TKT-004',
    title: 'Complaint Regarding Sanitation and Cleanliness',
    category: 'sanitation',
    description: 'Foul smell and overflowing water from the main drain.',
    location: 'Sulipur, Vadnagar',
    coordinates: { lat: 28.6150, lng: 77.2080 },
    reporter: '94567XXXXX',
    upvotes: 25,
    status: 'red',
    reportedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    escalated: true,
  },
  {
    id: 'TKT-005',
    title: 'Complaint Regarding Damaged Road',
    category: 'roads',
    description: 'Large pothole causing accidents.',
    location: 'Navapura, Vadnagar',
    coordinates: { lat: 28.6110, lng: 77.2110 },
    reporter: '98888XXXXX',
    upvotes: 2,
    status: 'resolved',
    reportedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    proofImageUrl: 'https://images.unsplash.com/photo-1541888040058-005809633e70?q=80&w=200&auto=format&fit=crop',
    escalated: false,
  },
  {
    id: 'TKT-006',
    title: 'Complaint Regarding Water Supply Disruption',
    category: 'water',
    description: 'No action taken on the water pipeline breakage.',
    location: 'Anandpura, Vadnagar',
    reporter: '98888XXXXX',
    upvotes: 4,
    status: 'yellow',
    reportedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    escalated: false,
  },
  {
    id: 'TKT-007',
    title: 'Complaint Regarding Sanitation and Cleanliness',
    category: 'sanitation',
    description: 'The drains have been completely blocked since last month.',
    location: 'Sarna, Vadnagar',
    reporter: '11111XXXXX',
    upvotes: 8,
    status: 'red',
    reportedAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    escalated: false,
  }
];

export const mockLedger: FinanceEntry[] = [
  { id: 'FIN-101', category: '15th FC Grants', amount: 500000, date: '2023-04-10', status: 'allocated', project: 'Panchayat Fund' },
  { id: 'FIN-102', category: 'MGNREGA Wages', amount: -120000, date: '2023-05-15', status: 'spent', project: 'Pond Digging' },
  { id: 'FIN-103', category: 'Sanitation', amount: -45000, date: '2023-06-02', status: 'spent', project: 'Drain Cleaning' },
  { id: 'FIN-104', category: 'Solar Lights', amount: -80000, date: '2023-07-20', status: 'spent', project: 'Street Lighting' },
  { id: 'FIN-105', category: 'State Govt Scheme', amount: 300000, date: '2023-08-01', status: 'allocated', project: 'Road Repair' },
  { id: 'FIN-106', category: 'Roads', amount: -150000, date: '2023-09-10', status: 'spent', project: 'Village Entry Road' }
];
