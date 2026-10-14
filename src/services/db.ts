import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  Job,
  JobCategory,
  JobSubmission,
  JobConversation,
  ChatMessage,
  DualWallet,
  WalletTransaction,
  DepositRequest,
  WithdrawalRequest,
  PlatformNotification,
  ContactMessage,
  PlatformSettings,
  AuditLog,
  UserProfile,
} from '../types';

// Default initial categories
export const DEFAULT_CATEGORIES: Omit<JobCategory, 'id'>[] = [
  {
    nameEn: 'Social Media & Engagement',
    nameBn: 'সোশ্যাল মিডিয়া ও এনগেজমেন্ট',
    icon: 'Share2',
    descriptionEn: 'Follow, like, comment, and share social campaigns on Facebook, YouTube, Instagram.',
    descriptionBn: 'ফেসবুক, ইউটিউব, ইন্সটাগ্রামে ফলো, লাইক, কমেন্ট ও শেয়ারের কাজ।',
    active: true,
    order: 1,
  },
  {
    nameEn: 'YouTube & Video Tasks',
    nameBn: 'ইউটিউব ও ভিডিও টাস্ক',
    icon: 'Video',
    descriptionEn: 'Watch full videos, subscribe to channels, like and leave authentic comments.',
    descriptionBn: 'ভিডিও সম্পূর্ণ দেখা, চ্যানেল সাবস্ক্রাইব ও লাইক-কমেন্ট করা।',
    active: true,
    order: 2,
  },
  {
    nameEn: 'App Reviews & Testing',
    nameBn: 'অ্যাপ রিভিউ ও টেস্টিং',
    icon: 'Smartphone',
    descriptionEn: 'Install Play Store apps, test user journeys, and leave genuine 5-star reviews.',
    descriptionBn: 'প্লে-স্টোর থেকে অ্যাপ ইনস্টল, টেস্টিং এবং রিভিউ দেওয়া।',
    active: true,
    order: 3,
  },
  {
    nameEn: 'Website Signups & Referrals',
    nameBn: 'ওয়েবসাইট সাইন আপ ও রেফারেল',
    icon: 'UserPlus',
    descriptionEn: 'Create accounts on verified portals, verify emails, and join community groups.',
    descriptionBn: 'বিভিন্ন পোর্টালে একাউন্ট তৈরি, ইমেইল ভেরিফিকেশন ও গ্রুপে যুক্ত হওয়া।',
    active: true,
    order: 4,
  },
  {
    nameEn: 'Data Entry & Typing',
    nameBn: 'ডাটা এন্ট্রি ও টাইপিং',
    icon: 'FileText',
    descriptionEn: 'Simple Bengali/English typing, Excel data copying, and form digitizing.',
    descriptionBn: 'বাংলা/ইংরেজি টাইপিং, এক্সেল ডাটা কপি ও তথ্য সংগ্রহ।',
    active: true,
    order: 5,
  },
  {
    nameEn: 'Surveys & Feedback',
    nameBn: 'সার্ভে ও মতামত প্রদান',
    icon: 'CheckSquare',
    descriptionEn: 'Complete consumer surveys, opinion polls, and product feedback forms.',
    descriptionBn: 'ভোক্তা মতামত জরিপ ও গুগল ফর্ম পূরণ করা।',
    active: true,
    order: 6,
  },
];

// ==================== CATEGORIES ====================

export async function getCategories(): Promise<JobCategory[]> {
  try {
    const snap = await getDocs(collection(db, 'categories'));
    if (snap.empty) {
      return DEFAULT_CATEGORIES.map((cat, i) => ({ id: `default_cat_${i + 1}`, ...cat }));
    }
    const categories: JobCategory[] = [];
    snap.forEach((doc) => {
      categories.push({ id: doc.id, ...(doc.data() as Omit<JobCategory, 'id'>) });
    });
    return categories.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.warn('Could not fetch categories from Firestore, using default taxonomy:', error);
    return DEFAULT_CATEGORIES.map((cat, i) => ({ id: `default_cat_${i + 1}`, ...cat }));
  }
}

export async function saveCategory(category: Partial<JobCategory>): Promise<void> {
  try {
    if (category.id) {
      const docRef = doc(db, 'categories', category.id);
      const { id, ...data } = category;
      await updateDoc(docRef, data);
    } else {
      await addDoc(collection(db, 'categories'), {
        ...category,
        active: category.active ?? true,
        order: category.order ?? 99,
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'categories');
  }
}

// ==================== JOBS ====================

export interface JobFilters {
  categoryId?: string;
  minReward?: number;
  maxReward?: number;
  search?: string;
  status?: string;
  sortBy?: 'newest' | 'reward_desc' | 'reward_asc';
}

export async function getJobs(filters?: JobFilters): Promise<Job[]> {
  try {
    const jobsRef = collection(db, 'jobs');
    let q = query(jobsRef);

    const snap = await getDocs(q);
    let jobs: Job[] = [];
    snap.forEach((d) => {
      jobs.push({ id: d.id, ...(d.data() as Omit<Job, 'id'>) });
    });

    // Client-side filtering & sorting for flexible UI
    if (filters?.status) {
      jobs = jobs.filter((j) => j.status === filters.status);
    } else {
      // Default to active for public browsing
      jobs = jobs.filter((j) => j.status === 'active');
    }

    if (filters?.categoryId && filters.categoryId !== 'all') {
      jobs = jobs.filter((j) => j.categoryId === filters.categoryId);
    }

    if (filters?.minReward !== undefined && filters.minReward > 0) {
      jobs = jobs.filter((j) => j.rewardPerWorker >= filters.minReward!);
    }

    if (filters?.maxReward !== undefined && filters.maxReward > 0) {
      jobs = jobs.filter((j) => j.rewardPerWorker <= filters.maxReward!);
    }

    if (filters?.search && filters.search.trim()) {
      const term = filters.search.toLowerCase().trim();
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(term) ||
          j.description.toLowerCase().includes(term) ||
          j.clientName.toLowerCase().includes(term)
      );
    }

    if (filters?.sortBy === 'reward_desc') {
      jobs.sort((a, b) => b.rewardPerWorker - a.rewardPerWorker);
    } else if (filters?.sortBy === 'reward_asc') {
      jobs.sort((a, b) => a.rewardPerWorker - b.rewardPerWorker);
    } else {
      // newest
      jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return jobs;
  } catch (error) {
    console.warn('Could not fetch jobs from Firestore:', error);
    return [];
  }
}

export async function getJobById(jobId: string): Promise<Job | null> {
  try {
    const docRef = doc(db, 'jobs', jobId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Omit<Job, 'id'>) };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `jobs/${jobId}`);
  }
}

export async function getClientJobs(clientId: string): Promise<Job[]> {
  try {
    const q = query(collection(db, 'jobs'), where('clientId', '==', clientId));
    const snap = await getDocs(q);
    const jobs: Job[] = [];
    snap.forEach((d) => {
      jobs.push({ id: d.id, ...(d.data() as Omit<Job, 'id'>) });
    });
    return jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `jobs (clientId: ${clientId})`);
  }
}

// Atomically post a job and reserve budget from Client Deposit Wallet
export async function postJobWithBudgetReservation(
  jobData: Omit<Job, 'id' | 'workersCompleted' | 'createdAt' | 'updatedAt'>,
  clientId: string
): Promise<string> {
  const now = new Date().toISOString();
  const walletRef = doc(db, 'wallets', clientId);
  const newJobRef = doc(collection(db, 'jobs'));

  try {
    await runTransaction(db, async (tx) => {
      const walletSnap = await tx.get(walletRef);
      if (!walletSnap.exists()) {
        throw new Error('Client wallet not found. Please contact support.');
      }
      const wallet = walletSnap.data() as DualWallet;
      if (wallet.clientDepositBalance < jobData.totalBudget) {
        throw new Error(
          `Insufficient deposit balance. Required: ৳${jobData.totalBudget}, Available: ৳${wallet.clientDepositBalance}. Please deposit funds first.`
        );
      }

      // 1. Deduct available, increment reserved
      const newDepositBal = wallet.clientDepositBalance - jobData.totalBudget;
      const newReservedBal = wallet.clientReservedBalance + jobData.totalBudget;

      tx.update(walletRef, {
        clientDepositBalance: newDepositBal,
        clientReservedBalance: newReservedBal,
        updatedAt: now,
      });

      // 2. Save Job
      const fullJob: Omit<Job, 'id'> = {
        ...jobData,
        workersCompleted: 0,
        createdAt: now,
        updatedAt: now,
      };
      tx.set(newJobRef, fullJob);

      // 3. Append-only ledger transaction
      const txDocRef = doc(collection(db, 'walletTransactions'));
      const ledgerEntry: Omit<WalletTransaction, 'id'> = {
        userId: clientId,
        walletType: 'client_deposit',
        type: 'job_budget_reserve',
        amount: jobData.totalBudget,
        currency: 'BDT',
        status: 'completed',
        referenceId: newJobRef.id,
        description: `Reserved budget for job: ${jobData.title}`,
        createdAt: now,
      };
      tx.set(txDocRef, ledgerEntry);
    });

    return newJobRef.id;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Insufficient deposit balance')) {
      throw error;
    }
    handleFirestoreError(error, OperationType.WRITE, 'jobs');
  }
}

export async function updateJobStatus(jobId: string, status: Job['status'], reason?: string): Promise<void> {
  try {
    const docRef = doc(db, 'jobs', jobId);
    const updatePayload: Record<string, any> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (reason !== undefined) {
      updatePayload.rejectionReason = reason;
    }
    await updateDoc(docRef, updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `jobs/${jobId}`);
  }
}

// ==================== SUBMISSIONS ====================

export async function submitWork(
  submission: Omit<JobSubmission, 'id' | 'submittedAt' | 'status'>
): Promise<string> {
  try {
    // Check for existing submission by this freelancer for this job
    const existingQ = query(
      collection(db, 'submissions'),
      where('jobId', '==', submission.jobId),
      where('freelancerId', '==', submission.freelancerId)
    );
    const existingSnap = await getDocs(existingQ);
    if (!existingSnap.empty) {
      const existing = existingSnap.docs[0].data() as JobSubmission;
      if (existing.status !== 'revision_requested') {
        throw new Error('You have already submitted work for this job.');
      }
    }

    const now = new Date().toISOString();
    const newDoc = await addDoc(collection(db, 'submissions'), {
      ...submission,
      status: 'submitted',
      submittedAt: now,
    });

    // Notify client
    await createNotification({
      userId: submission.clientId,
      titleEn: 'New Work Submitted',
      titleBn: 'নতুন কাজ জমা পড়েছে',
      messageEn: `${submission.freelancerName} submitted work for "${submission.jobTitle}".`,
      messageBn: `${submission.freelancerName} "${submission.jobTitle}" কাজে প্রমাণ জমা দিয়েছেন।`,
      type: 'submission',
      link: `/client/jobs`,
      isRead: false,
    });

    return newDoc.id;
  } catch (error) {
    if (error instanceof Error && error.message.includes('already submitted')) {
      throw error;
    }
    handleFirestoreError(error, OperationType.WRITE, 'submissions');
  }
}

export async function getSubmissionsForJob(jobId: string): Promise<JobSubmission[]> {
  try {
    const q = query(collection(db, 'submissions'), where('jobId', '==', jobId));
    const snap = await getDocs(q);
    const items: JobSubmission[] = [];
    snap.forEach((d) => items.push({ id: d.id, ...(d.data() as Omit<JobSubmission, 'id'>) }));
    return items.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `submissions (jobId: ${jobId})`);
  }
}

export async function getFreelancerSubmissions(freelancerId: string): Promise<JobSubmission[]> {
  try {
    const q = query(collection(db, 'submissions'), where('freelancerId', '==', freelancerId));
    const snap = await getDocs(q);
    const items: JobSubmission[] = [];
    snap.forEach((d) => items.push({ id: d.id, ...(d.data() as Omit<JobSubmission, 'id'>) }));
    return items.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `submissions (freelancerId: ${freelancerId})`);
  }
}

// Atomically approve submission, pay freelancer, increment job worker count
export async function approveSubmission(submission: JobSubmission): Promise<void> {
  const now = new Date().toISOString();
  const subRef = doc(db, 'submissions', submission.id);
  const clientWalletRef = doc(db, 'wallets', submission.clientId);
  const freelancerWalletRef = doc(db, 'wallets', submission.freelancerId);
  const jobRef = doc(db, 'jobs', submission.jobId);

  try {
    await runTransaction(db, async (tx) => {
      const subSnap = await tx.get(subRef);
      if (!subSnap.exists()) throw new Error('Submission not found');
      const currentSub = subSnap.data() as JobSubmission;
      if (currentSub.status === 'approved') throw new Error('Submission already approved');

      const jobSnap = await tx.get(jobRef);
      if (!jobSnap.exists()) throw new Error('Associated job not found');
      const job = jobSnap.data() as Job;

      const clientWalletSnap = await tx.get(clientWalletRef);
      const freelancerWalletSnap = await tx.get(freelancerWalletRef);

      if (!clientWalletSnap.exists() || !freelancerWalletSnap.exists()) {
        throw new Error('Wallets not found for transaction');
      }

      const clientWallet = clientWalletSnap.data() as DualWallet;
      const freelancerWallet = freelancerWalletSnap.data() as DualWallet;

      // 1. Update Client Wallet (reduce reserved balance, increase total spent)
      const newClientReserved = Math.max(0, clientWallet.clientReservedBalance - submission.reward);
      const newClientSpent = clientWallet.totalSpent + submission.reward;
      tx.update(clientWalletRef, {
        clientReservedBalance: newClientReserved,
        totalSpent: newClientSpent,
        updatedAt: now,
      });

      // 2. Update Freelancer Wallet (credit earnings balance, increase total earned)
      const newFreelancerEarnings = freelancerWallet.freelancerEarningsBalance + submission.reward;
      const newFreelancerEarned = freelancerWallet.totalEarned + submission.reward;
      tx.update(freelancerWalletRef, {
        freelancerEarningsBalance: newFreelancerEarnings,
        totalEarned: newFreelancerEarned,
        updatedAt: now,
      });

      // 3. Update Submission Status
      tx.update(subRef, {
        status: 'approved',
        reviewedAt: now,
        paidAt: now,
      });

      // 4. Increment Job workersCompleted
      const updatedWorkersCompleted = job.workersCompleted + 1;
      const isJobCompleted = updatedWorkersCompleted >= job.workersNeeded;
      tx.update(jobRef, {
        workersCompleted: updatedWorkersCompleted,
        status: isJobCompleted ? 'completed' : job.status,
        updatedAt: now,
      });

      // 5. Financial Ledger Transaction for Freelancer
      const txDocRef = doc(collection(db, 'walletTransactions'));
      const ledgerEntry: Omit<WalletTransaction, 'id'> = {
        userId: submission.freelancerId,
        walletType: 'freelancer_earnings',
        type: 'worker_payout',
        amount: submission.reward,
        currency: 'BDT',
        status: 'completed',
        referenceId: submission.id,
        description: `Earnings for completing job: ${submission.jobTitle}`,
        createdAt: now,
      };
      tx.set(txDocRef, ledgerEntry);
    });

    // Notify Freelancer
    await createNotification({
      userId: submission.freelancerId,
      titleEn: 'Work Approved! Payment Received',
      titleBn: 'কাজ অনুমোদিত হয়েছে! টাকা জমা হয়েছে',
      messageEn: `Your submission for "${submission.jobTitle}" was approved. ৳${submission.reward} added to your Earnings Wallet!`,
      messageBn: `"${submission.jobTitle}" কাজে আপনার প্রমাণ অনুমোদিত হয়েছে। ৳${submission.reward} আপনার আর্নিংস ওয়ালেটে যুক্ত হয়েছে!`,
      type: 'payment',
      link: '/freelancer/submissions',
      isRead: false,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `submissions/${submission.id}`);
  }
}

export async function requestSubmissionRevision(submissionId: string, notes: string, freelancerId: string, jobTitle: string): Promise<void> {
  try {
    const docRef = doc(db, 'submissions', submissionId);
    await updateDoc(docRef, {
      status: 'revision_requested',
      revisionNotes: notes,
      reviewedAt: new Date().toISOString(),
    });

    await createNotification({
      userId: freelancerId,
      titleEn: 'Revision Requested on Submission',
      titleBn: 'কাজে সংশোধন চাওয়া হয়েছে',
      messageEn: `Client requested revisions on "${jobTitle}": "${notes}"`,
      messageBn: `"${jobTitle}" কাজে ক্লায়েন্ট সংশোধন চেয়েছেন: "${notes}"`,
      type: 'submission',
      link: '/freelancer/submissions',
      isRead: false,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `submissions/${submissionId}`);
  }
}

export async function rejectSubmission(submissionId: string, reason: string, freelancerId: string, jobTitle: string): Promise<void> {
  try {
    const docRef = doc(db, 'submissions', submissionId);
    await updateDoc(docRef, {
      status: 'rejected',
      rejectionReason: reason,
      reviewedAt: new Date().toISOString(),
    });

    await createNotification({
      userId: freelancerId,
      titleEn: 'Submission Rejected',
      titleBn: 'কাজ বাতিল করা হয়েছে',
      messageEn: `Your submission for "${jobTitle}" was rejected. Reason: ${reason}`,
      messageBn: `"${jobTitle}" কাজে আপনার কাজ বাতিল করা হয়েছে। কারণ: ${reason}`,
      type: 'submission',
      link: '/freelancer/submissions',
      isRead: false,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `submissions/${submissionId}`);
  }
}

export async function resubmitRevision(submissionId: string, proofAnswers: JobSubmission['proofAnswers'], clientId: string, jobTitle: string): Promise<void> {
  try {
    const docRef = doc(db, 'submissions', submissionId);
    await updateDoc(docRef, {
      proofAnswers,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    });

    await createNotification({
      userId: clientId,
      titleEn: 'Work Re-submitted with Revisions',
      titleBn: 'সংশোধিত কাজ পুনরায় জমা হয়েছে',
      messageEn: `Worker resubmitted updated proof for "${jobTitle}".`,
      messageBn: `"${jobTitle}" কাজের সংশোধিত প্রমাণ পুনরায় জমা দেওয়া হয়েছে।`,
      type: 'submission',
      link: '/client/jobs',
      isRead: false,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `submissions/${submissionId}`);
  }
}

// ==================== DEPOSITS ====================

export async function submitDepositRequest(
  data: Omit<DepositRequest, 'id' | 'status' | 'requestedAt'>
): Promise<string> {
  try {
    // Check if duplicate transactionId exists
    const q = query(
      collection(db, 'depositRequests'),
      where('transactionId', '==', data.transactionId)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      throw new Error('This Transaction ID (TrxID) has already been submitted.');
    }

    const now = new Date().toISOString();
    const newDoc = await addDoc(collection(db, 'depositRequests'), {
      ...data,
      status: 'pending',
      requestedAt: now,
    });

    // Notify admins
    await createNotification({
      userId: 'all',
      titleEn: 'New Deposit Request Pending Verification',
      titleBn: 'নতুন ডিপোজিট রিকোয়েস্ট যাচাইয়ের অপেক্ষায়',
      messageEn: `User ${data.userName} deposited ৳${data.amount} via ${data.paymentMethod.toUpperCase()} (TrxID: ${data.transactionId}).`,
      messageBn: `${data.userName} ${data.paymentMethod.toUpperCase()}-এ ৳${data.amount} ডিপোজিট রিকোয়েস্ট পাঠিয়েছেন (TrxID: ${data.transactionId})।`,
      type: 'payment',
      link: '/admins',
      isRead: false,
    });

    return newDoc.id;
  } catch (error) {
    if (error instanceof Error && error.message.includes('already been submitted')) {
      throw error;
    }
    handleFirestoreError(error, OperationType.WRITE, 'depositRequests');
  }
}

export async function getDepositRequests(userId?: string): Promise<DepositRequest[]> {
  try {
    let q = query(collection(db, 'depositRequests'));
    if (userId) {
      q = query(collection(db, 'depositRequests'), where('userId', '==', userId));
    }
    const snap = await getDocs(q);
    const list: DepositRequest[] = [];
    snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<DepositRequest, 'id'>) }));
    return list.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'depositRequests');
  }
}

// Admin approves deposit -> credits client deposit wallet atomically + records immutable ledger
export async function approveDeposit(
  request: DepositRequest,
  adminUid: string,
  adminEmail: string
): Promise<void> {
  const now = new Date().toISOString();
  const reqRef = doc(db, 'depositRequests', request.id);
  const walletRef = doc(db, 'wallets', request.userId);

  try {
    await runTransaction(db, async (tx) => {
      const reqSnap = await tx.get(reqRef);
      if (!reqSnap.exists()) throw new Error('Deposit request not found');
      const curReq = reqSnap.data() as DepositRequest;
      if (curReq.status !== 'pending') throw new Error(`Deposit already ${curReq.status}`);

      const walletSnap = await tx.get(walletRef);
      if (!walletSnap.exists()) throw new Error('Client wallet not found');
      const wallet = walletSnap.data() as DualWallet;

      // 1. Credit wallet
      const newBalance = wallet.clientDepositBalance + request.amount;
      const newTotalDeposited = wallet.totalDeposited + request.amount;
      tx.update(walletRef, {
        clientDepositBalance: newBalance,
        totalDeposited: newTotalDeposited,
        updatedAt: now,
      });

      // 2. Mark deposit request approved
      tx.update(reqRef, {
        status: 'approved',
        reviewedAt: now,
        reviewedBy: adminUid,
      });

      // 3. Append-only ledger transaction
      const txDocRef = doc(collection(db, 'walletTransactions'));
      const ledgerEntry: Omit<WalletTransaction, 'id'> = {
        userId: request.userId,
        walletType: 'client_deposit',
        type: 'deposit',
        amount: request.amount,
        currency: 'BDT',
        status: 'completed',
        referenceId: request.transactionId,
        description: `Verified deposit via ${request.paymentMethod.toUpperCase()} (TrxID: ${request.transactionId})`,
        createdAt: now,
      };
      tx.set(txDocRef, ledgerEntry);

      // 4. Audit Log
      const auditRef = doc(collection(db, 'auditLogs'));
      const audit: Omit<AuditLog, 'id'> = {
        actorUid: adminUid,
        actorEmail: adminEmail,
        actionType: 'APPROVE_DEPOSIT',
        targetCollection: 'depositRequests',
        targetId: request.id,
        details: `Approved ৳${request.amount} for user ${request.userId} via ${request.paymentMethod}`,
        timestamp: now,
      };
      tx.set(auditRef, audit);
    });

    // Notify user
    await createNotification({
      userId: request.userId,
      titleEn: 'Deposit Approved & Credited!',
      titleBn: 'ডিপোজিট সফলভাবে জমা হয়েছে!',
      messageEn: `Your deposit of ৳${request.amount} via ${request.paymentMethod.toUpperCase()} has been approved and added to your Deposit Wallet.`,
      messageBn: `${request.paymentMethod.toUpperCase()}-এর মাধ্যমে ৳${request.amount} ডিপোজিট অনুমোদিত হয়ে আপনার ক্লায়েন্ট ওয়ালেটে যুক্ত হয়েছে।`,
      type: 'payment',
      link: '/client/dashboard',
      isRead: false,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `depositRequests/${request.id}`);
  }
}

export async function rejectDeposit(
  requestId: string,
  userId: string,
  reason: string,
  adminUid: string
): Promise<void> {
  try {
    const docRef = doc(db, 'depositRequests', requestId);
    await updateDoc(docRef, {
      status: 'rejected',
      rejectionReason: reason,
      reviewedAt: new Date().toISOString(),
      reviewedBy: adminUid,
    });

    await createNotification({
      userId,
      titleEn: 'Deposit Request Rejected',
      titleBn: 'ডিপোজিট রিকোয়েস্ট বাতিল করা হয়েছে',
      messageEn: `Your deposit request was rejected. Reason: ${reason}`,
      messageBn: `আপনার ডিপোজিট রিকোয়েস্ট বাতিল করা হয়েছে। কারণ: ${reason}`,
      type: 'payment',
      link: '/client/deposits',
      isRead: false,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `depositRequests/${requestId}`);
  }
}

// ==================== WITHDRAWALS ====================

// Freelancer requests withdrawal -> reserves balance from Freelancer Earnings Wallet
export async function submitWithdrawalRequest(
  data: Omit<WithdrawalRequest, 'id' | 'status' | 'requestedAt'>
): Promise<string> {
  if (data.amount < 20) {
    throw new Error('Minimum withdrawal amount is ৳20.');
  }

  const now = new Date().toISOString();
  const walletRef = doc(db, 'wallets', data.userId);
  const newReqRef = doc(collection(db, 'withdrawalRequests'));

  try {
    await runTransaction(db, async (tx) => {
      const walletSnap = await tx.get(walletRef);
      if (!walletSnap.exists()) throw new Error('Freelancer wallet not found.');
      const wallet = walletSnap.data() as DualWallet;

      if (wallet.freelancerEarningsBalance < data.amount) {
        throw new Error(
          `Insufficient available balance. Available: ৳${wallet.freelancerEarningsBalance}, Requested: ৳${data.amount}.`
        );
      }

      // Deduct from available earnings, add to pending withdrawal
      const newBal = wallet.freelancerEarningsBalance - data.amount;
      const newPending = wallet.freelancerPendingWithdrawal + data.amount;

      tx.update(walletRef, {
        freelancerEarningsBalance: newBal,
        freelancerPendingWithdrawal: newPending,
        updatedAt: now,
      });

      // Create withdrawal request
      const fullReq: Omit<WithdrawalRequest, 'id'> = {
        ...data,
        status: 'pending',
        requestedAt: now,
      };
      tx.set(newReqRef, fullReq);

      // Ledger reserve
      const txDocRef = doc(collection(db, 'walletTransactions'));
      const ledgerEntry: Omit<WalletTransaction, 'id'> = {
        userId: data.userId,
        walletType: 'freelancer_earnings',
        type: 'withdrawal_reserve',
        amount: data.amount,
        currency: 'BDT',
        status: 'pending',
        referenceId: newReqRef.id,
        description: `Reserved for withdrawal to ${data.paymentMethod.toUpperCase()} (${data.recipientNumber})`,
        createdAt: now,
      };
      tx.set(txDocRef, ledgerEntry);
    });

    // Notify admins
    await createNotification({
      userId: 'all',
      titleEn: 'New Withdrawal Request',
      titleBn: 'নতুন টাকা উত্তোলনের আবেদন',
      messageEn: `${data.userName} requested payout of ৳${data.amount} to ${data.paymentMethod.toUpperCase()} (${data.recipientNumber}).`,
      messageBn: `${data.userName} ${data.paymentMethod.toUpperCase()} নম্বরে (${data.recipientNumber}) ৳${data.amount} উত্তোলনের আবেদন করেছেন।`,
      type: 'payment',
      link: '/admins',
      isRead: false,
    });

    return newReqRef.id;
  } catch (error) {
    if (error instanceof Error && (error.message.includes('Minimum') || error.message.includes('Insufficient'))) {
      throw error;
    }
    handleFirestoreError(error, OperationType.WRITE, 'withdrawalRequests');
  }
}

export async function getWithdrawalRequests(userId?: string): Promise<WithdrawalRequest[]> {
  try {
    let q = query(collection(db, 'withdrawalRequests'));
    if (userId) {
      q = query(collection(db, 'withdrawalRequests'), where('userId', '==', userId));
    }
    const snap = await getDocs(q);
    const list: WithdrawalRequest[] = [];
    snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<WithdrawalRequest, 'id'>) }));
    return list.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'withdrawalRequests');
  }
}

// Admin marks withdrawal as paid after sending money through bKash/Nagad
export async function completeWithdrawal(
  request: WithdrawalRequest,
  payoutTxId: string,
  adminUid: string,
  adminEmail: string
): Promise<void> {
  const now = new Date().toISOString();
  const reqRef = doc(db, 'withdrawalRequests', request.id);
  const walletRef = doc(db, 'wallets', request.userId);

  try {
    await runTransaction(db, async (tx) => {
      const reqSnap = await tx.get(reqRef);
      if (!reqSnap.exists()) throw new Error('Withdrawal request not found');
      const curReq = reqSnap.data() as WithdrawalRequest;
      if (curReq.status === 'paid') throw new Error('Withdrawal already marked paid');

      const walletSnap = await tx.get(walletRef);
      if (!walletSnap.exists()) throw new Error('Freelancer wallet not found');
      const wallet = walletSnap.data() as DualWallet;

      // 1. Finalize reserved withdrawal
      const newPending = Math.max(0, wallet.freelancerPendingWithdrawal - request.amount);
      const newTotalWithdrawn = wallet.totalWithdrawn + request.amount;
      tx.update(walletRef, {
        freelancerPendingWithdrawal: newPending,
        totalWithdrawn: newTotalWithdrawn,
        updatedAt: now,
      });

      // 2. Mark request as paid
      tx.update(reqRef, {
        status: 'paid',
        transactionId: payoutTxId,
        completedAt: now,
        completedBy: adminUid,
      });

      // 3. Finalize ledger record
      const txDocRef = doc(collection(db, 'walletTransactions'));
      const ledgerEntry: Omit<WalletTransaction, 'id'> = {
        userId: request.userId,
        walletType: 'freelancer_earnings',
        type: 'withdrawal_paid',
        amount: request.amount,
        currency: 'BDT',
        status: 'completed',
        referenceId: payoutTxId,
        description: `Completed payout via ${request.paymentMethod.toUpperCase()} (TrxID: ${payoutTxId})`,
        createdAt: now,
      };
      tx.set(txDocRef, ledgerEntry);

      // 4. Audit Log
      const auditRef = doc(collection(db, 'auditLogs'));
      const audit: Omit<AuditLog, 'id'> = {
        actorUid: adminUid,
        actorEmail: adminEmail,
        actionType: 'COMPLETE_WITHDRAWAL',
        targetCollection: 'withdrawalRequests',
        targetId: request.id,
        details: `Sent ৳${request.amount} to ${request.recipientNumber} via ${request.paymentMethod} (TrxID: ${payoutTxId})`,
        timestamp: now,
      };
      tx.set(auditRef, audit);
    });

    // Notify user
    await createNotification({
      userId: request.userId,
      titleEn: 'Withdrawal Completed & Paid!',
      titleBn: 'টাকা উত্তোলন সফল হয়েছে!',
      messageEn: `৳${request.amount} has been sent to your ${request.paymentMethod.toUpperCase()} number (${request.recipientNumber}). TrxID: ${payoutTxId}.`,
      messageBn: `৳${request.amount} আপনার ${request.paymentMethod.toUpperCase()} নম্বরে (${request.recipientNumber}) পাঠানো হয়েছে। TrxID: ${payoutTxId}।`,
      type: 'payment',
      link: '/freelancer/withdrawals',
      isRead: false,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `withdrawalRequests/${request.id}`);
  }
}

// Admin rejects withdrawal -> releases reserved balance back to earnings
export async function rejectWithdrawal(
  request: WithdrawalRequest,
  reason: string,
  adminUid: string,
  adminEmail: string
): Promise<void> {
  const now = new Date().toISOString();
  const reqRef = doc(db, 'withdrawalRequests', request.id);
  const walletRef = doc(db, 'wallets', request.userId);

  try {
    await runTransaction(db, async (tx) => {
      const reqSnap = await tx.get(reqRef);
      if (!reqSnap.exists()) throw new Error('Withdrawal request not found');

      const walletSnap = await tx.get(walletRef);
      if (!walletSnap.exists()) throw new Error('Freelancer wallet not found');
      const wallet = walletSnap.data() as DualWallet;

      // 1. Release reserved amount back to earnings balance
      const newPending = Math.max(0, wallet.freelancerPendingWithdrawal - request.amount);
      const newEarnings = wallet.freelancerEarningsBalance + request.amount;
      tx.update(walletRef, {
        freelancerPendingWithdrawal: newPending,
        freelancerEarningsBalance: newEarnings,
        updatedAt: now,
      });

      // 2. Mark request as rejected
      tx.update(reqRef, {
        status: 'rejected',
        rejectionReason: reason,
        completedAt: now,
        completedBy: adminUid,
      });

      // 3. Ledger refund record
      const txDocRef = doc(collection(db, 'walletTransactions'));
      const ledgerEntry: Omit<WalletTransaction, 'id'> = {
        userId: request.userId,
        walletType: 'freelancer_earnings',
        type: 'withdrawal_rejected_refund',
        amount: request.amount,
        currency: 'BDT',
        status: 'completed',
        referenceId: request.id,
        description: `Refunded rejected withdrawal of ৳${request.amount}. Reason: ${reason}`,
        createdAt: now,
      };
      tx.set(txDocRef, ledgerEntry);

      // 4. Audit Log
      const auditRef = doc(collection(db, 'auditLogs'));
      const audit: Omit<AuditLog, 'id'> = {
        actorUid: adminUid,
        actorEmail: adminEmail,
        actionType: 'REJECT_WITHDRAWAL',
        targetCollection: 'withdrawalRequests',
        targetId: request.id,
        details: `Rejected withdrawal of ৳${request.amount} for ${request.userId}. Reason: ${reason}`,
        timestamp: now,
      };
      tx.set(auditRef, audit);
    });

    // Notify user
    await createNotification({
      userId: request.userId,
      titleEn: 'Withdrawal Request Rejected',
      titleBn: 'উত্তোলন আবেদন বাতিল হয়েছে',
      messageEn: `Your withdrawal request of ৳${request.amount} was rejected. Funds restored to your Earnings Wallet. Reason: ${reason}`,
      messageBn: `আপনার ৳${request.amount} উত্তোলনের আবেদন বাতিল করা হয়েছে এবং টাকা ওয়ালেটে ফেরত দেওয়া হয়েছে। কারণ: ${reason}`,
      type: 'payment',
      link: '/freelancer/withdrawals',
      isRead: false,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `withdrawalRequests/${request.id}`);
  }
}

// ==================== TRANSACTIONS ====================

export async function getUserTransactions(userId: string): Promise<WalletTransaction[]> {
  try {
    const q = query(
      collection(db, 'walletTransactions'),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    const list: WalletTransaction[] = [];
    snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<WalletTransaction, 'id'>) }));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `walletTransactions (userId: ${userId})`);
  }
}

// ==================== NOTIFICATIONS ====================

export async function createNotification(
  notification: Omit<PlatformNotification, 'id' | 'createdAt'>
): Promise<void> {
  try {
    await addDoc(collection(db, 'notifications'), {
      ...notification,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Notification creation silent error:', error);
  }
}

export async function getUserNotifications(userId: string): Promise<PlatformNotification[]> {
  try {
    const q = query(collection(db, 'notifications'), where('userId', 'in', [userId, 'all']));
    const snap = await getDocs(q);
    const list: PlatformNotification[] = [];
    snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<PlatformNotification, 'id'>) }));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'notifications');
  }
}

export async function markNotificationAsRead(id: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'notifications', id), { isRead: true });
  } catch (error) {
    console.warn('Could not mark notification as read:', error);
  }
}

export async function markAllNotificationsAsRead(notifications: PlatformNotification[]): Promise<void> {
  try {
    const unread = notifications.filter((n) => !n.isRead);
    await Promise.all(unread.map((n) => updateDoc(doc(db, 'notifications', n.id), { isRead: true })));
  } catch (error) {
    console.warn('Failed to mark all as read:', error);
  }
}

// ==================== CONTACT MESSAGES ====================

export async function sendContactMessage(name: string, email: string, subject: string, message: string): Promise<string> {
  try {
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, 'contactMessages'), {
      name,
      email,
      subject,
      message,
      status: 'new',
      createdAt: now,
    });

    await createNotification({
      userId: 'all',
      titleEn: 'New Contact Form Inquiry',
      titleBn: 'নতুন যোগাযোগ বার্তা এসেছে',
      messageEn: `From ${name} (${email}): "${subject}"`,
      messageBn: `${name} (${email}) থেকে নতুন বার্তা: "${subject}"`,
      type: 'system',
      link: '/admins',
      isRead: false,
    });

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'contactMessages');
  }
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  try {
    const snap = await getDocs(collection(db, 'contactMessages'));
    const list: ContactMessage[] = [];
    snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<ContactMessage, 'id'>) }));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'contactMessages');
  }
}

export async function updateContactStatus(messageId: string, status: ContactMessage['status']): Promise<void> {
  try {
    const docRef = doc(db, 'contactMessages', messageId);
    await updateDoc(docRef, {
      status,
      resolvedAt: status === 'resolved' ? new Date().toISOString() : undefined,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `contactMessages/${messageId}`);
  }
}

// ==================== PLATFORM SETTINGS ====================

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  id: 'global',
  siteName: 'Microjob BD',
  contactEmail: 'mrs.engineers.bd26@gmail.com',
  minimumWithdrawal: 20,
  platformFeePercent: 0,
  maintenanceMode: false,
  announcementEn: 'Welcome to Microjob BD! Deposit via bKash/Nagad & start completing jobs.',
  announcementBn: 'মাইক্রোজব বিডিতে স্বাগতম! বিকাশ ও নগদে ডিপোজিট করে কাজ শুরু করুন।',
  bkashNumber: '01XXXXXXXXX',
  bkashInstructionsEn: '1. Go to your bKash App or dial *247#.\n2. Select "Send Money".\n3. Enter our bKash Personal Number: 01XXXXXXXXX.\n4. Enter the exact deposit amount.\n5. Copy the 10-character Transaction ID (TrxID) and submit it below.',
  bkashInstructionsBn: '১. আপনার বিকাশ অ্যাপ ওপেন করুন অথবা *২৪৭# ডায়াল করুন।\n২. "Send Money" নির্বাচন করুন।\n৩. আমাদের বিকাশ পার্সোনাল নম্বর দিন: 01XXXXXXXXX।\n৪. ডিপোজিটের পরিমাণ লিখুন।\n৫. ট্রানজেকশন সফল হলে ১০ ডিজিটের TrxID কপি করে নিচে সাবমিট করুন।',
  nagadNumber: '01XXXXXXXXX',
  nagadInstructionsEn: '1. Open Nagad App or dial *167#.\n2. Select "Send Money".\n3. Enter our Nagad Personal Number: 01XXXXXXXXX.\n4. Enter deposit amount and your PIN.\n5. Copy the Transaction ID and submit it below.',
  nagadInstructionsBn: '১. নগদ অ্যাপ ওপেন করুন অথবা *১৬৭# ডায়াল করুন।\n২. "Send Money" নির্বাচন করুন।\n৩. আমাদের নগদ পার্সোনাল নম্বর দিন: 01XXXXXXXXX।\n৪. ডিপোজিটের পরিমাণ ও পিন দিন।\n৫. ট্রানজেকশন আইডি কপি করে নিচে সাবমিট করুন।',
  updatedAt: new Date().toISOString(),
};

export async function getPlatformSettings(): Promise<PlatformSettings> {
  try {
    const docRef = doc(db, 'platformSettings', 'global');
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return DEFAULT_PLATFORM_SETTINGS;
    }
    return snap.data() as PlatformSettings;
  } catch (error) {
    console.warn('Using default platform settings:', error);
    return DEFAULT_PLATFORM_SETTINGS;
  }
}

export async function updatePlatformSettings(
  settings: Partial<PlatformSettings>,
  adminUid: string,
  adminEmail: string
): Promise<void> {
  try {
    const docRef = doc(db, 'platformSettings', 'global');
    const now = new Date().toISOString();
    const updated = {
      ...settings,
      updatedAt: now,
    };
    await setDoc(docRef, updated, { merge: true });

    // Audit Log
    await addDoc(collection(db, 'auditLogs'), {
      actorUid: adminUid,
      actorEmail: adminEmail,
      actionType: 'UPDATE_SETTINGS',
      targetCollection: 'platformSettings',
      targetId: 'global',
      details: 'Updated global platform configuration and payment numbers',
      timestamp: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'platformSettings/global');
  }
}

// ==================== JOB SPECIFIC CHAT ====================

export async function getOrCreateConversation(
  jobId: string,
  jobTitle: string,
  clientId: string,
  freelancerId: string,
  clientName: string,
  freelancerName: string
): Promise<string> {
  try {
    const convId = `${jobId}_${freelancerId}`;
    const docRef = doc(db, 'jobConversations', convId);
    const snap = await getDoc(docRef);

    const now = new Date().toISOString();
    if (!snap.exists()) {
      const convData: JobConversation = {
        id: convId,
        jobId,
        jobTitle,
        clientId,
        freelancerId,
        clientName,
        freelancerName,
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(docRef, convData);
    }
    return convId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'jobConversations');
  }
}

export async function sendChatMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  text: string,
  recipientId: string,
  jobTitle: string
): Promise<void> {
  try {
    const now = new Date().toISOString();
    const messagesRef = collection(db, 'jobConversations', conversationId, 'messages');
    await addDoc(messagesRef, {
      conversationId,
      senderId,
      senderName,
      text: text.slice(0, 2000),
      timestamp: now,
    });

    // Update conversation metadata
    await updateDoc(doc(db, 'jobConversations', conversationId), {
      lastMessage: text.slice(0, 100),
      lastMessageAt: now,
      lastSenderId: senderId,
      updatedAt: now,
    });

    // Notify recipient
    await createNotification({
      userId: recipientId,
      titleEn: `New Message regarding "${jobTitle}"`,
      titleBn: `"${jobTitle}" কাজে নতুন মেসেজ এসেছে`,
      messageEn: `${senderName}: ${text.slice(0, 80)}`,
      messageBn: `${senderName}: ${text.slice(0, 80)}`,
      type: 'chat',
      link: `/chat/${conversationId}`,
      isRead: false,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `jobConversations/${conversationId}/messages`);
  }
}

export function subscribeToChatMessages(
  conversationId: string,
  callback: (messages: ChatMessage[]) => void
) {
  const messagesRef = collection(db, 'jobConversations', conversationId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(100));

  return onSnapshot(
    q,
    (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((d) => msgs.push({ id: d.id, ...(d.data() as Omit<ChatMessage, 'id'>) }));
      callback(msgs);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `jobConversations/${conversationId}/messages`);
    }
  );
}

// ==================== ADMIN STATS & USERS ====================

export interface AdminStats {
  totalUsers: number;
  verifiedUsers: number;
  activeJobs: number;
  pendingJobs: number;
  totalSubmissions: number;
  pendingDeposits: number;
  approvedDepositsTotal: number;
  pendingWithdrawals: number;
  completedWithdrawalsTotal: number;
  unreadContacts: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  try {
    const [usersSnap, jobsSnap, subsSnap, depSnap, withSnap, contSnap] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'jobs')),
      getDocs(collection(db, 'submissions')),
      getDocs(collection(db, 'depositRequests')),
      getDocs(collection(db, 'withdrawalRequests')),
      getDocs(collection(db, 'contactMessages')),
    ]);

    let verifiedUsers = 0;
    usersSnap.forEach((d) => {
      if (d.data().isVerified) verifiedUsers++;
    });

    let activeJobs = 0;
    let pendingJobs = 0;
    jobsSnap.forEach((d) => {
      const st = d.data().status;
      if (st === 'active') activeJobs++;
      if (st === 'pending') pendingJobs++;
    });

    let pendingDeposits = 0;
    let approvedDepositsTotal = 0;
    depSnap.forEach((d) => {
      const st = d.data().status;
      if (st === 'pending') pendingDeposits++;
      if (st === 'approved') approvedDepositsTotal += Number(d.data().amount || 0);
    });

    let pendingWithdrawals = 0;
    let completedWithdrawalsTotal = 0;
    withSnap.forEach((d) => {
      const st = d.data().status;
      if (st === 'pending' || st === 'under_review') pendingWithdrawals++;
      if (st === 'paid') completedWithdrawalsTotal += Number(d.data().amount || 0);
    });

    let unreadContacts = 0;
    contSnap.forEach((d) => {
      if (d.data().status === 'new') unreadContacts++;
    });

    return {
      totalUsers: usersSnap.size,
      verifiedUsers,
      activeJobs,
      pendingJobs,
      totalSubmissions: subsSnap.size,
      pendingDeposits,
      approvedDepositsTotal,
      pendingWithdrawals,
      completedWithdrawalsTotal,
      unreadContacts,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'adminStats');
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const users: UserProfile[] = [];
    snap.forEach((d) => users.push({ ...(d.data() as UserProfile), uid: d.id }));
    return users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users');
  }
}

export async function toggleUserSuspension(
  userId: string,
  currentSuspended: boolean,
  adminUid: string,
  adminEmail: string
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      suspended: !currentSuspended,
      updatedAt: new Date().toISOString(),
    });

    await addDoc(collection(db, 'auditLogs'), {
      actorUid: adminUid,
      actorEmail: adminEmail,
      actionType: currentSuspended ? 'UNSUSPEND_USER' : 'SUSPEND_USER',
      targetCollection: 'users',
      targetId: userId,
      details: `${currentSuspended ? 'Un-suspended' : 'Suspended'} user account ${userId}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
  }
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  try {
    const q = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(100));
    const snap = await getDocs(q);
    const logs: AuditLog[] = [];
    snap.forEach((d) => logs.push({ id: d.id, ...(d.data() as Omit<AuditLog, 'id'>) }));
    return logs;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'auditLogs');
  }
}
