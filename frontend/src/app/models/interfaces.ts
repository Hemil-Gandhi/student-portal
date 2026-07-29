export interface User {
  id: string;
  name: string;
  email: string;
  studentId?: string;
  department?: string;
  year?: number;
  avatar?: string;
  role: 'student' | 'admin';
  createdAt?: Date;
}

export interface Expense {
  _id?: string;
  title: string;
  amount: number;
  category: 'food' | 'transport' | 'accommodation' | 'books' | 'fees' | 'entertainment' | 'medical' | 'other';
  date: Date;
  description?: string;
  paymentMethod?: 'cash' | 'card' | 'upi' | 'wallet' | 'other';
  isRecurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Attendance {
  _id?: string;
  subject: string;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  totalClasses?: number;
  attendedClasses?: number;
  notes?: string;
  semester?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Task {
  _id?: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  dueDate?: Date;
  category: 'academic' | 'personal' | 'project' | 'assignment' | 'exam' | 'other';
  tags?: string[];
  completedAt?: Date;
  reminder?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Exam {
  _id?: string;
  subject: string;
  examType: 'quiz' | 'midterm' | 'final' | 'practical' | 'oral' | 'other';
  examDate: Date;
  duration?: number;
  venue?: string;
  maxMarks?: number;
  marksObtained?: number;
  grade?: string;
  percentage?: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  syllabus?: string;
  notes?: string;
  semester?: string;
  reminder?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Note {
  _id?: string;
  title: string;
  content?: string;
  subject?: string;
  tags?: string[];
  isFavorite?: boolean;
  attachments?: Attachment[];
  color?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Attachment {
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

export interface Placement {
  _id?: string;
  companyName: string;
  role: string;
  jobType: 'internship' | 'full-time' | 'part-time' | 'contract' | 'freelance';
  status: 'applied' | 'interviewing' | 'offer-received' | 'rejected' | 'accepted' | 'declined';
  applicationDate: Date;
  interviewDate?: Date;
  ctc?: number;
  location?: string;
  jobDescription?: string;
  requirements?: string[];
  notes?: string;
  contactPerson?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  applicationLink?: string;
  documents?: Attachment[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DashboardData {
  overview: {
    tasks: {
      pending: number;
      completed: number;
      inProgress: number;
      total: number;
    };
    expenses: {
      today: number;
      monthly: number;
    };
    attendance: {
      percentage: number;
      totalClasses: number;
    };
    exams: {
      averagePercentage: number;
      totalExams: number;
    };
    placements: {
      applied: number;
      interviewing: number;
      offers: number;
      accepted: number;
    };
    notes: {
      favorites: number;
    };
  };
  upcomingTasks: Task[];
  upcomingExams: Exam[];
  recentNotes: Note[];
}
