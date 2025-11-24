


export enum UserRole {
  STUDENT = 'student',
  STAFF = 'staff'
}

export enum ViewState {
  DASHBOARD = 'dashboard',
  COURSES = 'courses',
  COURSE_DETAIL = 'course_detail',
  LEARNING_PATH = 'learning_path',
  EXAMS = 'exams',
  PLANS = 'plans',
  PAYMENTS = 'payments',
  PROFILE = 'profile',
  SETTINGS = 'settings',
  SUPPORT = 'support',
  
  // Staff Specific Views
  STAFF_SUMMARY = 'staff_summary',
  STAFF_USERS = 'staff_users',
  STAFF_GRADES = 'staff_grades',
  STAFF_COURSES = 'staff_courses',
  STAFF_FINANCE = 'staff_finance',
  STAFF_PRIVACY = 'staff_privacy',
  STAFF_LOGS = 'staff_logs',
  STAFF_REPORTS = 'staff_reports'
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; // index
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  isCompleted: boolean;
  videoUrl: string;
  questions: Question[];
}

export interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  date: string;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  price: number;
  progress: number; // 0-100
  instructor: string;
  lessons: Lesson[];
  comments: Comment[];
  minPlan: 'free' | 'individual' | 'business';
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  isPopular?: boolean;
  type: 'free' | 'individual' | 'business';
}

// Maps to 'exam_results' table
export interface ExamResult {
  id: string;
  courseName: string; // from course_name column
  score: number;
  date: string; // created_at
  status: 'passed' | 'failed';
}

export interface StudentStats {
  coursesCompleted: number;
  hoursSpent: number;
  averageScore: number;
  certificates: number;
}

// Maps to 'profiles' table
export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  planId: string; // derived from 'user_plans'
  joinDate: string;
  phone: string;
  country: string;
  password?: string; // Optional for profile view
}

// Maps to 'payments' table
export interface PaymentRequest {
  id: string;
  userEmail: string;
  userName: string;
  planId: string;
  planName: string;
  amount: number;
  method: 'Credit Card' | 'Payment App';
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  details: string; 
}

// Maps to 'support_tickets' table
export interface SupportTicket {
  id: string;
  userId: string;
  message: string;
  status: 'open' | 'resolved';
  date: string;
}

// Maps to 'audit_logs' table
export interface AuditLog {
  id: string;
  action: string;
  user: string;
  details: string;
  date: string;
}
