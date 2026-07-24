export type IssueStatus = 'green' | 'yellow' | 'red' | 'resolved'; // Green: New, Yellow: Pending, Red: Overdue
export type IssueCategory = 'water' | 'sanitation' | 'roads' | 'electricity' | 'certificates' | 'other';

export interface Attachment {
  url: string;
  type: 'image' | 'video' | 'pdf' | 'document';
  name: string;
  source?: 'camera' | 'upload';
  timestamp?: string;
}

export interface Comment {
  id: string;
  author: string;
  authorId?: string;
  text: string;
  timestamp: string; // ISO
  role: 'citizen' | 'official';
}

export interface Issue {
  id: string; // Internal database ID
  ticketId?: string; // Human-readable ticket ID like TKT-000001
  title: string;
  category: IssueCategory;
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  reporter: string;
  reporterId?: string;
  upvotes: number;
  status: IssueStatus;
  reportedAt: string; // ISO string
  resolvedAt?: string;
  issueImageUrl?: string;
  proofImageUrl?: string;
  escalated: boolean;
  escalatedTo?: string;
  attachments?: Attachment[];
  comments?: Comment[];
  panchayatOnly?: boolean;
}

export interface FinanceEntry {
  id: string;
  category: string;
  amount: number;
  date: string;
  status: 'allocated' | 'spent';
  project: string;
}

export type ViewState = 'citizen' | 'sarpanch' | 'finance' | 'leaderboard' | 'season';
