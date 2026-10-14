export type UserRole = 'user' | 'admin';
export type ActiveWorkspace = 'freelancer' | 'client' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  role: UserRole;
  activeRole: ActiveWorkspace;
  photoURL?: string;
  bio?: string;
  skills?: string;
  isVerified: boolean;
  suspended?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobCategory {
  id: string;
  nameEn: string;
  nameBn: string;
  icon: string;
  descriptionEn?: string;
  descriptionBn?: string;
  active: boolean;
  order: number;
}

export type JobStatus = 'draft' | 'pending' | 'active' | 'paused' | 'completed' | 'cancelled' | 'rejected';

export interface ProofRequirement {
  id: string;
  type: 'text' | 'screenshot' | 'url';
  labelEn: string;
  labelBn: string;
  required: boolean;
  instructionsEn?: string;
  instructionsBn?: string;
}

export interface Job {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  categoryId: string;
  description: string;
  instructions: string;
  rewardPerWorker: number; // in BDT (৳)
  workersNeeded: number;
  workersCompleted: number;
  totalBudget: number; // in BDT (৳)
  platformFee: number;
  status: JobStatus;
  rejectionReason?: string;
  deadlineDays: number;
  proofRequirements: ProofRequirement[];
  reviewPeriodHours?: number; // e.g. 72 hours
  createdAt: string;
  updatedAt: string;
}

export type SubmissionStatus = 'submitted' | 'revision_requested' | 'approved' | 'rejected' | 'disputed';

export interface ProofAnswer {
  requirementId: string;
  type: 'text' | 'screenshot' | 'url';
  value: string;
}

export interface JobSubmission {
  id: string;
  jobId: string;
  jobTitle: string;
  clientId: string;
  freelancerId: string;
  freelancerName: string;
  freelancerEmail: string;
  reward: number;
  status: SubmissionStatus;
  proofAnswers: ProofAnswer[];
  rejectionReason?: string;
  revisionNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
  paidAt?: string;
}

export interface JobConversation {
  id: string;
  jobId: string;
  jobTitle: string;
  clientId: string;
  freelancerId: string;
  clientName?: string;
  freelancerName?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  lastSenderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface DualWallet {
  userId: string;
  // Client Deposit Wallet
  clientDepositBalance: number; // Available for posting jobs
  clientReservedBalance: number; // Locked for active open jobs
  totalDeposited: number;
  totalSpent: number;
  // Freelancer Earnings Wallet
  freelancerEarningsBalance: number; // Available for withdrawal
  freelancerPendingWithdrawal: number; // Locked in pending withdrawal requests
  totalEarned: number;
  totalWithdrawn: number;
  updatedAt: string;
}

export type WalletType = 'client_deposit' | 'freelancer_earnings';

export type TransactionType =
  | 'deposit'
  | 'job_budget_reserve'
  | 'job_budget_refund'
  | 'worker_payout'
  | 'platform_fee'
  | 'withdrawal_reserve'
  | 'withdrawal_paid'
  | 'withdrawal_rejected_refund';

export interface WalletTransaction {
  id: string;
  userId: string;
  walletType: WalletType;
  type: TransactionType;
  amount: number;
  currency: string; // 'BDT'
  status: 'completed' | 'pending' | 'failed' | 'reversed';
  referenceId?: string;
  description: string;
  createdAt: string;
}

export type PaymentMethod = 'bkash' | 'nagad';

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  amount: number;
  paymentMethod: PaymentMethod;
  senderNumber: string;
  transactionId: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  paymentMethod: PaymentMethod;
  recipientNumber: string;
  status: 'pending' | 'under_review' | 'approved' | 'paid' | 'rejected';
  transactionId?: string;
  rejectionReason?: string;
  requestedAt: string;
  completedAt?: string;
  completedBy?: string;
}

export interface PlatformNotification {
  id: string;
  userId: string; // user UID or 'all'
  titleEn: string;
  titleBn: string;
  messageEn: string;
  messageBn: string;
  type: 'system' | 'job' | 'submission' | 'payment' | 'chat';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'archived';
  createdAt: string;
  resolvedAt?: string;
}

export interface PlatformSettings {
  id: string;
  siteName: string;
  contactEmail: string;
  minimumWithdrawal: number;
  platformFeePercent: number;
  maintenanceMode: boolean;
  announcementEn?: string;
  announcementBn?: string;
  bkashNumber: string;
  bkashInstructionsEn: string;
  bkashInstructionsBn: string;
  nagadNumber: string;
  nagadInstructionsEn: string;
  nagadInstructionsBn: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actorUid: string;
  actorEmail: string;
  actionType: string;
  targetCollection: string;
  targetId: string;
  details: string;
  timestamp: string;
}
