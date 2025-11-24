
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { ViewState, UserRole, Course, UserProfile, PaymentRequest, AuditLog } from './types';
import { MOCK_COURSES, MOCK_EXAMS, MOCK_PLANS, MOCK_STATS, COUNTRIES } from './constants';
import { CoursesView, ProgressView, ExamsView, PlansView, PaymentsView, CourseDetailView, ProfileView, SupportView } from './views/StudentViews';
import { StaffDashboard } from './views/StaffViews';
import CourseCard from './components/CourseCard';
import { Settings, UserCircle, LogIn, ChevronRight, UserPlus, Sun, Moon, Globe, Phone, ShieldCheck, Eye, EyeOff, CheckCircle2, BookOpen, Loader2, Lock, Shield } from 'lucide-react';
import { supabase } from './supabaseClient';

// Types for Auth
type AuthMode = 'login' | 'register';

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  password?: string; // Added for Staff visibility
  planId: string;
  phone: string;
  country: string;
  joinDate: string;
  exams: any[];
  courses: { course_id: string; progress: number; is_completed: boolean }[];
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  
  // General Loading (for auth/operations)
  const [isLoading, setIsLoading] = useState(false);
  // Initial App Loading (checking session)
  const [isAppInitializing, setIsAppInitializing] = useState(true);
  
  // Auth State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [isStaffPortal, setIsStaffPortal] = useState(false); // Separates Login Logic

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  
  // Registration specific fields
  const [name, setName] = useState(''); 
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Perú');
  
  const [authError, setAuthError] = useState('');
  const [notification, setNotification] = useState<{msg: string, type: 'success'|'info'} | null>(null);

  // DATABASE STATE (Synced with Supabase)
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [myExams, setMyExams] = useState<any[]>([]);

  // Current User Data
  const [currentUser, setCurrentUser] = useState<UserProfile>({
      name: '',
      email: '',
      role: UserRole.STUDENT,
      planId: 'free',
      joinDate: '',
      phone: '',
      country: ''
  });
  
  // State to manage course progress dynamically
  const [courses, setCourses] = useState<Course[]>([]); // Initialize empty, fetch from DB
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Show temporary notification
  const showNotification = (msg: string, type: 'success'|'info' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // --- INITIALIZATION & DATA SYNC ---

  // 1. Fetch Courses (Public)
  const fetchCourses = async () => {
      const { data: coursesData, error: cError } = await supabase.from('courses').select('*');
      const { data: lessonsData, error: lError } = await supabase.from('lessons').select('*');

      if (cError || lError) {
          console.error("Error fetching content", cError, lError);
          // If DB is empty or error, use MOCK but don't crash
          setCourses(MOCK_COURSES); 
          return;
      }

      if (coursesData && coursesData.length > 0) {
          const formattedCourses: Course[] = coursesData.map(c => ({
              id: c.id,
              title: c.title,
              category: c.category,
              description: c.description,
              image: c.image,
              price: c.price,
              progress: 0, // Will be updated per user later
              instructor: c.instructor,
              minPlan: c.min_plan as any,
              comments: [],
              lessons: lessonsData 
                  ? lessonsData
                      .filter((l: any) => l.course_id === c.id)
                      .sort((a:any, b:any) => a.order_index - b.order_index)
                      .map((l: any) => ({
                          id: l.id,
                          title: l.title,
                          duration: l.duration,
                          videoUrl: l.video_url,
                          isCompleted: false, // Default
                          questions: l.questions || []
                      }))
                  : []
          }));
          setCourses(formattedCourses);
      } else {
         setCourses(MOCK_COURSES);
      }
  };

  // 2. Fetch Staff Data (Students + Progress + Payments)
  const fetchStaffData = async () => {
      setIsLoading(true);
      
      // Fetch STUDENTS (Added password field)
      const { data: students, error: sErr } = await supabase.from('students').select('*');
      if (sErr) console.error("Error fetching students:", sErr);

      // Fetch Progress
      const { data: progress } = await supabase.from('user_progress').select('*');
      // Fetch Exams
      const { data: exams } = await supabase.from('exam_results').select('*');
      // Fetch Payments
      const { data: payments } = await supabase.from('payments').select('*');

      if (payments) {
          setPaymentRequests(payments.map((p: any) => ({
              id: p.id,
              userEmail: students?.find((u:any) => u.id === p.user_id)?.email || 'Unknown',
              userName: students?.find((u:any) => u.id === p.user_id)?.full_name || 'Unknown',
              planId: p.plan_id,
              planName: p.plan_name,
              amount: p.amount,
              method: p.method,
              status: p.status,
              date: new Date(p.created_at).toLocaleDateString(),
              details: p.details
          })));
      }

      if (students) {
          const formattedUsers: RegisteredUser[] = students.map((p: any) => {
              // Calculate Courses Progress based on lesson completion
              const userProgress = progress?.filter((prog: any) => prog.user_id === p.id) || [];
              
              // Group by course
              const userCoursesMap: Record<string, number> = {};
              userProgress.forEach((prog: any) => {
                  userCoursesMap[prog.course_id] = (userCoursesMap[prog.course_id] || 0) + 1;
              });

              const userCourses = Object.keys(userCoursesMap).map(cId => {
                  const courseDef = courses.find(c => c.id === cId);
                  const totalLessons = courseDef?.lessons.length || 5;
                  const completedLessons = userCoursesMap[cId];
                  const progPercent = Math.min((completedLessons / totalLessons) * 100, 100);
                  
                  return {
                      course_id: cId,
                      progress: progPercent,
                      is_completed: progPercent >= 100
                  };
              });

              // User Exams
              const userExams = exams?.filter((e:any) => e.user_id === p.id).map((e:any) => ({
                  id: e.id,
                  courseName: courses.find(c => c.id === e.course_id)?.title || e.course_id,
                  score: e.score,
                  date: new Date(e.created_at).toLocaleDateString(),
                  status: e.status
              })) || [];

              return {
                  id: p.id,
                  name: p.full_name,
                  email: p.email,
                  password: p.password || '******', // Show password from DB
                  planId: p.plan_id,
                  phone: p.phone,
                  country: p.country,
                  joinDate: new Date(p.created_at).toLocaleDateString(),
                  exams: userExams,
                  courses: userCourses
              };
          });
          setRegisteredUsers(formattedUsers);
      }
      setIsLoading(false);
  };

  // 3. Load User Specific Progress
  const loadUserProgress = async (userId: string) => {
      const { data: progressData } = await supabase.from('user_progress').select('*').eq('user_id', userId);
      const { data: examData } = await supabase.from('exam_results').select('*').eq('user_id', userId);

      if (examData) {
          const myExamsFormatted = examData.map((e: any) => ({
              id: e.id,
              courseName: courses.find(c => c.id === e.course_id)?.title || 'Curso',
              score: e.score,
              date: new Date(e.created_at).toLocaleDateString(),
              status: e.status
          }));
          setMyExams(myExamsFormatted);
      }

      if (progressData) {
          setCourses(prevCourses => prevCourses.map(c => {
             const completedLessons = progressData.filter((p: any) => p.course_id === c.id);
             const lessonIds = completedLessons.map((p: any) => p.lesson_id);
             
             const updatedLessons = c.lessons.map(l => ({
                 ...l,
                 isCompleted: lessonIds.includes(l.id)
             }));

             const completedCount = updatedLessons.filter(l => l.isCompleted).length;
             const progressPercent = (completedCount / c.lessons.length) * 100;

             return {
                 ...c,
                 lessons: updatedLessons,
                 progress: isNaN(progressPercent) ? 0 : progressPercent
             };
          }));
      }
  };

  // Dual Check: Staff vs Student
  const loadUserProfile = async (uid: string, email: string, passwordInput?: string, fallbackMeta?: { name?: string, phone?: string, country?: string }) => {
      setIsLoading(true);
      
      try {
          // 1. Check if STAFF first (By Email in public.staff table)
          const { data: staffData } = await supabase.from('staff').select('*').eq('email', email).maybeSingle();
          
          if (staffData) {
              // User IS Staff
              
              // Ensure we update the ID in public.staff to match the actual Auth ID if it was a placeholder
              if (staffData.id !== uid) {
                  await supabase.from('staff').update({ id: uid }).eq('email', email);
              }

              setCurrentUser({
                  id: uid,
                  name: staffData.full_name,
                  email: staffData.email,
                  role: UserRole.STAFF,
                  planId: 'business',
                  joinDate: new Date(staffData.created_at).toLocaleDateString(),
                  phone: '',
                  country: ''
              });
              setIsAuthenticated(true);
              setUserRole(UserRole.STAFF);
              await fetchCourses(); // ensure courses loaded
              await fetchStaffData(); // Load admin data
              setCurrentView(ViewState.STAFF_SUMMARY);
              setIsLoading(false);
              setIsStaffPortal(true); 
              return;
          }

          // If in Staff Portal but not staff -> DENY
          if (isStaffPortal) {
             await supabase.auth.signOut();
             throw new Error("No tienes permisos de administrador. Por favor accede por el portal de estudiantes.");
          }

          // 2. Check if STUDENT (Use 'students' table as storage)
          
          let fullName = fallbackMeta?.name || 'Usuario Nuevo';
          let phone = fallbackMeta?.phone || '';
          let country = fallbackMeta?.country || 'Desconocido';

          // Get metadata if fallback is empty
          if (!fallbackMeta) {
              const { data: userData } = await supabase.auth.getUser();
              if (userData?.user?.user_metadata) {
                  const meta = userData.user.user_metadata;
                  fullName = meta.full_name || meta.name || fullName;
                  phone = meta.phone || phone;
                  country = meta.country || country;
              }
          }

          // --- SYNC TO STUDENTS TABLE ---
          // Verify if user exists to allow password/details update without resetting PLAN
          const { data: existingUser } = await supabase.from('students').select('*').eq('id', uid).maybeSingle();
          
          let studentData;

          if (existingUser) {
              // UPDATE EXISTING: Sync password and contact info, PRESERVE plan_id
              const updates: any = {
                  full_name: fullName,
                  phone: phone,
                  country: country
              };
              
              // Always sync password if provided (so staff can see it)
              if (passwordInput) {
                  updates.password = passwordInput;
              }

              const { data, error } = await supabase.from('students').update(updates).eq('id', uid).select().single();
              if (error) throw error;
              studentData = data;
          } else {
              // INSERT NEW: Create full record with default plan
              const { data, error } = await supabase.from('students').insert({
                  id: uid,
                  email: email,
                  password: passwordInput || '******', // Store password for Staff visibility
                  full_name: fullName,
                  phone: phone,
                  country: country,
                  plan_id: 'free' // Default only for new users
              }).select().single();

              if (error) throw error;
              studentData = data;
          }

          // Set STUDENT State from the Table Data
          if (studentData) {
               setCurrentUser({
                  id: uid,
                  name: studentData.full_name,
                  email: studentData.email,
                  role: UserRole.STUDENT,
                  planId: studentData.plan_id, // Use plan from DB table
                  joinDate: new Date(studentData.created_at).toLocaleDateString(),
                  phone: studentData.phone,
                  country: studentData.country,
                  password: studentData.password
              });
              setIsAuthenticated(true);
              setUserRole(UserRole.STUDENT);
              await fetchCourses();
              await loadUserProgress(uid);
              setCurrentView(ViewState.COURSES);
          } else {
              throw new Error("No se pudo cargar el perfil del estudiante.");
          }

      } catch (err: any) {
          console.error("Profile Load Error:", err);
          setAuthError(err.message);
          setIsAuthenticated(false);
      } finally {
          setIsLoading(false);
      }
  };

  // Initial Load
  useEffect(() => {
      const init = async () => {
          await fetchCourses();
          
          // Check active session
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
             // Pass null password on auto-login (it won't update in DB, preserving existing)
             await loadUserProfile(session.user.id, session.user.email!);
          }
          setIsAppInitializing(false);
      };
      init();
  }, []);

  // Handlers
  const handleAuthSubmit = async () => {
    setAuthError('');
    setIsLoading(true);

    try {
        if (authMode === 'register' && !isStaffPortal) {
            // -- REGISTER (STUDENTS ONLY) --
            if (!email || !password || !name || !phone || !country) {
                setAuthError('Por favor completa todos los campos.');
                setIsLoading(false);
                return;
            }

            const selectedCountryData = COUNTRIES.find(c => c.name === country) || COUNTRIES[0];
            const fullPhone = `${selectedCountryData.prefix} ${phone}`;

            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: name,
                        phone: fullPhone,
                        country: country,
                    }
                }
            });

            if (error) throw error;

            if (data.session) {
                await loadUserProfile(data.user!.id, email, password, { name, phone: fullPhone, country });
                setShowAuthModal(false);
                showNotification("¡Registro exitoso!", 'success');
            } else if (data.user) {
                // If user created but no session (auto-confirm off?), try signing in
                // Or if it worked, just alert.
                setAuthError('Cuenta creada. Por favor inicia sesión.');
            }

        } else {
            // -- LOGIN (STUDENT OR STAFF) --
            if (isStaffPortal) {
                // Staff Login: Direct check against the 'staff' table
                const { data: staffUser, error: staffError } = await supabase
                    .from('staff')
                    .select('*')
                    .eq('email', email)
                    .eq('password', password) // Direct password check
                    .maybeSingle();

                if (staffError) {
                    console.error("Error during staff login:", staffError);
                    throw new Error("Ocurrio un error en el servidor. Intente de nuevo.");
                }

                if (staffUser) {
                    // Successful login for staff
                    // Manually set auth state without a Supabase session
                    await loadUserProfile(staffUser.id, staffUser.email);
                    setShowAuthModal(false);
                    showNotification("Sesión iniciada como administrador", 'success');
                } else {
                    // Failed login for staff
                    throw new Error("Acceso denegado. Verifique sus credenciales de administrador.");
                }
            } else {
                // Student Login: Use Supabase Auth
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password,
                });

                if (error) throw error;
                
                if (data.user) {
                    await loadUserProfile(data.user.id, email, password);
                    setShowAuthModal(false);
                    showNotification("Sesión iniciada", 'success');
                }
            }
        }
    } catch (error: any) {
        console.error(error);
        setAuthError(error.message || 'Error en autenticación.');
        setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserRole(null);
    setIsAuthenticated(false);
    setCurrentView(ViewState.DASHBOARD);
    setIsStaffPortal(false); // Reset portal
    setCurrentUser({
        name: '', email: '', role: UserRole.STUDENT, planId: 'free',
        joinDate: '', phone: '', country: ''
    });
    setCourses(prev => prev.map(c => ({ ...c, progress: 0, lessons: c.lessons.map(l => ({...l, isCompleted: false})) })));
    setMyExams([]);
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleSelectCourse = (course: Course) => {
      if (!isAuthenticated) {
          setIsStaffPortal(false);
          setAuthMode('register');
          setShowAuthModal(true);
          return;
      }
      setSelectedCourseId(course.id);
      setCurrentView(ViewState.COURSE_DETAIL);
  };

  // --- Course Management Handlers for Staff ---
  const handleSaveCourse = async (updatedCourse: Course) => {
      // Update DB
      const exists = courses.some(c => c.id === updatedCourse.id);
      
      const coursePayload = {
          id: updatedCourse.id,
          title: updatedCourse.title,
          category: updatedCourse.category,
          description: updatedCourse.description,
          image: updatedCourse.image,
          price: updatedCourse.price,
          min_plan: updatedCourse.minPlan,
          instructor: updatedCourse.instructor
      };

      if (exists) {
          await supabase.from('courses').upsert(coursePayload);
      } else {
          await supabase.from('courses').insert(coursePayload);
      }

      // Handle Lessons (Simple delete all and re-insert for simplicity in this demo)
      await supabase.from('lessons').delete().eq('course_id', updatedCourse.id);
      const lessonsPayload = updatedCourse.lessons.map((l, i) => ({
          id: l.id,
          course_id: updatedCourse.id,
          title: l.title,
          duration: l.duration,
          video_url: l.videoUrl,
          questions: l.questions,
          order_index: i
      }));
      if (lessonsPayload.length > 0) {
          await supabase.from('lessons').insert(lessonsPayload);
      }

      fetchCourses(); // Refresh local state
      showNotification("Curso guardado correctamente.");
  };

  const handleDeleteCourse = async (id: string) => {
      await supabase.from('courses').delete().eq('id', id);
      setCourses(prev => prev.filter(c => c.id !== id));
  };

  // --- Student Progress Handlers ---

  const handleUpdateProgress = async (courseId: string, lessonId: string) => {
      if (!currentUser.id) return;

      // 1. Update Local State for immediate UI feedback
      setCourses(prevCourses => prevCourses.map(course => {
          if (course.id !== courseId) return course;
          const updatedLessons = course.lessons.map(lesson => {
              if (lesson.id === lessonId) return { ...lesson, isCompleted: true };
              return lesson;
          });
          const completedCount = updatedLessons.filter(l => l.isCompleted).length;
          const courseProgress = (completedCount / updatedLessons.length) * 100;
          return { ...course, lessons: updatedLessons, progress: courseProgress };
      }));

      // 2. Update Database
      await supabase.from('user_progress').upsert({
          user_id: currentUser.id,
          course_id: courseId,
          lesson_id: lessonId,
          completed_at: new Date().toISOString()
      }, { onConflict: 'user_id, lesson_id' });
  };

  const handleExamComplete = async (courseId: string, score: number) => {
      if (!currentUser || userRole !== UserRole.STUDENT) return;

      const status = score >= 60 ? 'passed' : 'failed';
      
      // Insert into DB
      const { data, error } = await supabase.from('exam_results').insert({
          user_id: currentUser.id,
          course_id: courseId,
          score: score,
          status: status
      }).select();

      if (!error) {
          const courseName = courses.find(c => c.id === courseId)?.title || 'Curso';
          const newExam = {
              id: data[0].id,
              courseName,
              score,
              date: new Date().toLocaleDateString(),
              status
          };
          setMyExams(prev => [...prev, newExam]);
          showNotification("¡Examen enviado correctamente!");
      }
  };

  // --- PAYMENT LOGIC ---
  const handlePaymentRequest = async (details: Omit<PaymentRequest, 'id' | 'status' | 'date' | 'userEmail' | 'userName'>) => {
      if (!isAuthenticated) {
          setIsStaffPortal(false);
          setAuthMode('register');
          setShowAuthModal(true);
          return;
      }

      const { error } = await supabase.from('payments').insert({
          user_id: currentUser.id,
          amount: details.amount,
          plan_name: details.planName,
          plan_id: details.planId,
          method: details.method,
          details: details.details,
          status: 'pending'
      });

      if (!error) {
          showNotification("Solicitud enviada. Espera la aprobación del administrador.");
      }
  };

  const handlePaymentAction = async (requestId: string, action: 'approve' | 'reject') => {
      const status = action === 'approve' ? 'approved' : 'rejected';
      
      // Update Payment Status
      const { data, error } = await supabase.from('payments').update({ status }).eq('id', requestId).select();
      
      if (!error && data && data.length > 0) {
          const payment = data[0];
          
          // If approved, update user profile plan in the STUDENTS table
          if (status === 'approved') {
              await supabase.from('students').update({ plan_id: payment.plan_id }).eq('id', payment.user_id);
          }

          fetchStaffData(); // Refresh staff dashboard
          showNotification(`Solicitud ${status === 'approved' ? 'aprobada' : 'rechazada'} con éxito`);
      }
  };

  // --- RENDER HELPERS ---
  const selectedCourse = courses.find(c => c.id === selectedCourseId);
  const displayedPaymentRequests = userRole === UserRole.STAFF ? paymentRequests : paymentRequests.filter(p => p.userEmail === currentUser.email);
  const isStaffView = Object.values(ViewState).includes(currentView) && currentView.startsWith('staff_');

  if (isAppInitializing) {
      return (
          <div className={`min-h-screen flex items-center justify-center flex-col gap-4 ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
              <Loader2 size={48} className="animate-spin text-blue-600" />
              <p className="font-medium opacity-70">Cargando Tecnokids...</p>
          </div>
      );
  }

  // --- PUBLIC LANDING PAGE LOGIC ---
  if (!isAuthenticated) {
    const selectedCountryData = COUNTRIES.find(c => c.name === country) || COUNTRIES[0];

    return (
      <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
          {/* Header */}
          <header className={`sticky top-0 z-30 px-6 py-4 flex justify-between items-center backdrop-blur-md border-b ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                   <BookOpen size={20} />
                </div>
                <span className="font-bold text-xl tracking-tight">Tecnokids</span>
             </div>
             
             <div className="flex items-center gap-4">
                <button 
                    onClick={toggleDarkMode}
                    className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-blue-50 text-slate-600'}`}
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                
                {/* Regular User Actions */}
                <button 
                    onClick={() => { setIsStaffPortal(false); setAuthMode('login'); setShowAuthModal(true); }}
                    className="font-semibold hover:text-blue-600 px-2 text-sm"
                >
                    Iniciar Sesión
                </button>
                <button 
                    onClick={() => { setIsStaffPortal(false); setAuthMode('register'); setShowAuthModal(true); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30"
                >
                    Registrarse
                </button>
                
                {/* Separator */}
                <div className="w-px h-6 bg-current opacity-20 mx-1"></div>
                
                {/* STAFF Action */}
                <button 
                    onClick={() => { setIsStaffPortal(true); setAuthMode('login'); setShowAuthModal(true); }}
                    className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2 ${isDarkMode ? 'border-slate-600 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-100'}`}
                    title="Acceso solo para personal administrativo"
                >
                    <Shield size={14}/> Soy Staff
                </button>
             </div>
          </header>

          {/* Auth Modal Overlay */}
          {showAuthModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative flex flex-col ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
                     
                     {/* Modal Header */}
                     <div className={`p-6 pb-0 flex justify-between items-start ${isStaffPortal ? 'bg-gradient-to-r from-slate-800 to-slate-900' : ''}`}>
                         <div className={isStaffPortal ? 'text-white' : ''}>
                             <h2 className={`text-2xl font-bold mb-1 ${isStaffPortal ? 'text-white' : (isDarkMode ? 'text-white' : 'text-blue-600')}`}>
                                {isStaffPortal 
                                    ? 'Acceso Administrativo' 
                                    : (authMode === 'login' ? 'Bienvenido' : 'Crear Cuenta')
                                }
                             </h2>
                             <p className="text-sm opacity-70">
                                {isStaffPortal 
                                    ? 'Ingresa tus credenciales de staff.'
                                    : (authMode === 'login' ? 'Ingresa a tu cuenta de estudiante.' : 'Únete para desbloquear todos los cursos.')
                                }
                             </p>
                         </div>
                         <button 
                            onClick={() => setShowAuthModal(false)}
                            className={`p-2 rounded-full ${isStaffPortal ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                         >
                             <EyeOff size={20} className="opacity-50"/>
                         </button>
                     </div>

                     <div className="p-8 pt-6">
                        {/* Portal Switcher Warning */}
                        {isStaffPortal && (
                            <div className="mb-6 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3 text-xs text-yellow-600 dark:text-yellow-400">
                                <Lock size={16} className="shrink-0 mt-0.5"/>
                                <p>Área restringida. Solo el personal autorizado puede iniciar sesión aquí. Si eres estudiante, vuelve al acceso principal.</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            {authError && (
                                <div className="p-3 rounded bg-red-100 text-red-700 text-sm font-medium border border-red-200 flex items-center gap-2">
                                    <Lock size={16} className="shrink-0"/>
                                    {authError}
                                </div>
                            )}

                            {/* REGISTER FIELDS (Students Only) */}
                            {authMode === 'register' && !isStaffPortal && (
                                <div className="space-y-4 animate-fade-in">
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Nombre Completo"
                                        className={`w-full p-3 rounded-lg border outline-none ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50 border-slate-200'}`}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <select 
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                            className={`w-full p-3 rounded-lg border outline-none appearance-none ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50 border-slate-200'}`}
                                        >
                                            {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.flag} {c.name}</option>)}
                                        </select>
                                        <div className="flex">
                                            <span className={`inline-flex items-center px-2 rounded-l-lg border border-r-0 text-sm ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-slate-200 border-slate-200'}`}>{selectedCountryData.prefix}</span>
                                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Teléfono" className={`w-full p-3 rounded-r-lg border outline-none ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50 border-slate-200'}`}/>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* COMMON FIELDS */}
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={isStaffPortal ? "Correo Corporativo" : "Correo Electrónico"}
                                className={`w-full p-3 rounded-lg border outline-none ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50 border-slate-200'}`}
                            />
                            <div className="relative">
                                <input 
                                    type={showPasswordText ? "text" : "password"} 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Contraseña"
                                    className={`w-full p-3 rounded-lg border outline-none ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50 border-slate-200'}`}
                                />
                                <button onClick={() => setShowPasswordText(!showPasswordText)} className="absolute right-3 top-3 opacity-50">
                                    {showPasswordText ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            {/* SUBMIT BUTTON */}
                            <button 
                                onClick={handleAuthSubmit}
                                disabled={isLoading}
                                className={`w-full py-3 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 transition-all ${
                                    isLoading ? 'opacity-70' : ''
                                } ${
                                    isStaffPortal 
                                    ? 'bg-slate-800 text-white hover:bg-black' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : (authMode === 'login' ? (isStaffPortal ? 'Ingresar al Panel' : 'Entrar') : 'Registrarse')}
                            </button>

                            {/* FOOTER LINKS */}
                            <div className="text-center text-sm mt-4 space-y-3">
                                {!isStaffPortal && (
                                    <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="underline opacity-70 hover:opacity-100 block w-full">
                                        {authMode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia Sesión'}
                                    </button>
                                )}
                                
                                <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-opacity-20 border-current"></div></div>
                                    <div className="relative flex justify-center"><span className={`px-2 text-xs opacity-50 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>Cambiar Portal</span></div>
                                </div>

                                <button 
                                    onClick={() => {
                                        setIsStaffPortal(!isStaffPortal);
                                        setAuthMode('login'); // Always reset to login when switching portals
                                        setAuthError('');
                                    }}
                                    className={`text-xs font-bold uppercase tracking-wide ${isStaffPortal ? 'text-blue-500' : 'text-slate-500'} hover:underline`}
                                >
                                    {isStaffPortal ? '← Volver a Acceso Estudiantes' : 'Ir a Acceso Administrativo →'}
                                </button>
                            </div>
                        </div>
                     </div>
                </div>
              </div>
          )}

          {/* Landing Page Content */}
          <main className="flex-1">
             {/* Hero */}
             <div className="relative py-20 px-6 text-center overflow-hidden">
                 <div className={`absolute inset-0 -z-10 ${isDarkMode ? 'bg-slate-900' : 'bg-blue-50'}`}>
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                 </div>
                 <div className="max-w-4xl mx-auto">
                     <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-600 text-sm font-bold mb-6">Educación del Futuro</span>
                     <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">Aprendizaje Interactivo para <span className="text-blue-600">Mentes Brillantes</span></h1>
                     <p className="text-xl opacity-70 mb-8 max-w-2xl mx-auto">
                         Plataforma educativa líder en latinoamérica. Cursos de matemáticas, arte, inglés y más, diseñados para niños y adolescentes.
                     </p>
                     <button 
                        onClick={() => { setIsStaffPortal(false); setAuthMode('register'); setShowAuthModal(true); }}
                        className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-xl hover:bg-blue-700 hover:scale-105 transition-all"
                     >
                         Comenzar Ahora Gratis
                     </button>
                 </div>
             </div>

             {/* Courses Preview */}
             <div className="py-16 px-6 max-w-7xl mx-auto">
                 <div className="text-center mb-12">
                     <h2 className="text-3xl font-bold mb-4">Nuestros Cursos Populares</h2>
                     <p className="opacity-70">Explora una variedad de temas. Regístrate para acceder al contenido completo.</p>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {courses.length > 0 ? courses.slice(0, 6).map(course => (
                         <div key={course.id} className="relative">
                             <CourseCard 
                                course={course} 
                                isDarkMode={isDarkMode} 
                                onSelect={() => { setIsStaffPortal(false); setAuthMode('register'); setShowAuthModal(true); }} 
                                isLocked={true} 
                             />
                             <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1">
                                 <BookOpen size={12} /> Vista Previa
                             </div>
                         </div>
                     )) : (
                         <div className="col-span-3 text-center opacity-50">Cargando cursos...</div>
                     )}
                 </div>
             </div>

             {/* Plans Preview */}
             <div className={`py-16 px-6 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                 <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Planes Flexibles</h2>
                        <p className="opacity-70">Elige el plan que mejor se adapte a tus necesidades de aprendizaje.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {MOCK_PLANS.map(plan => (
                            <div key={plan.id} className={`p-8 rounded-2xl border flex flex-col ${isDarkMode ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'} ${plan.isPopular ? 'ring-2 ring-blue-500 shadow-xl scale-105' : ''}`}>
                                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                <div className="text-4xl font-bold mb-6 text-blue-600">${plan.price}</div>
                                <ul className="space-y-4 mb-8 flex-1">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm opacity-80">
                                            <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5"/> {f}
                                        </li>
                                    ))}
                                </ul>
                                <button 
                                    onClick={() => { setIsStaffPortal(false); setAuthMode('register'); setShowAuthModal(true); }}
                                    className={`w-full py-3 rounded-lg font-bold ${plan.isPopular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                                >
                                    Seleccionar Plan
                                </button>
                            </div>
                        ))}
                    </div>
                 </div>
             </div>
          </main>

          {/* Footer */}
          <footer className={`py-8 px-6 border-t text-center ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="mb-4 flex items-center justify-center gap-2 font-bold text-xl opacity-90">
                   <BookOpen size={24} className="text-blue-600"/> Tecnokids
              </div>
              <p className="text-sm opacity-60">
                  © 2025 Academia Digital. Todos los derechos reservados.
              </p>
              <div className="mt-4">
                   <button onClick={() => { setIsStaffPortal(true); setAuthMode('login'); setShowAuthModal(true); }} className="text-xs opacity-30 hover:opacity-100">Acceso Staff</button>
              </div>
          </footer>
      </div>
    );
  }

  // --- MAIN APP (AUTHENTICATED) ---
  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {notification && (
         <div className="fixed top-4 right-4 z-50 animate-bounce-in">
            <div className={`px-6 py-3 rounded-lg shadow-xl font-bold text-white ${notification.type === 'success' ? 'bg-green-600' : 'bg-blue-600'}`}>
                {notification.msg}
            </div>
         </div>
      )}

      {/* Sidebar */}
      <Sidebar 
        currentView={currentView} 
        onChangeView={(view) => {
            setCurrentView(view);
            if(view !== ViewState.COURSE_DETAIL) setSelectedCourseId(null);
        }}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        userRole={userRole}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto">
        {/* Header (Top Bar) */}
        <header className={`sticky top-0 z-10 px-8 py-4 flex justify-between items-center border-b backdrop-blur-sm ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/80 border-blue-100'
        }`}>
           <div className="flex items-center gap-2 text-sm opacity-60">
             <span>Inicio</span>
             <ChevronRight size={14} />
             <span className="font-medium capitalize">{currentView.replace(/_/g, ' ')}</span>
           </div>

           <div className="flex items-center gap-4">
             <button 
                onClick={toggleDarkMode}
                className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-blue-50 text-slate-600'}`}
             >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>

             <div className="text-right hidden md:block">
               <p className="text-sm font-bold">{userRole === UserRole.STAFF ? 'Administrador' : currentUser.name}</p>
               <p className="text-xs opacity-60">{currentUser.email}</p>
             </div>
             <button onClick={() => setCurrentView(ViewState.PROFILE)}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isDarkMode ? 'bg-blue-900 text-white' : 'bg-blue-100 text-blue-600'
                }`}>
                <UserCircle size={24} />
                </div>
             </button>
           </div>
        </header>

        {/* View Routing */}
        <div className="animate-fade-in pb-10">
          {/* STAFF VIEWS */}
          {userRole === UserRole.STAFF && isStaffView && (
             <StaffDashboard 
                currentView={currentView}
                isBW={isDarkMode} 
                users={registeredUsers} 
                paymentRequests={paymentRequests}
                auditLogs={auditLogs}
                courses={courses}
                onPaymentAction={handlePaymentAction}
                onSaveCourse={handleSaveCourse}
                onDeleteCourse={handleDeleteCourse}
             />
          )}

          {/* STUDENT VIEWS */}
          {(currentView === ViewState.DASHBOARD || currentView === ViewState.COURSES) && (
             userRole === UserRole.STAFF 
                ? <StaffDashboard 
                    currentView={ViewState.STAFF_SUMMARY}
                    isBW={isDarkMode} 
                    users={registeredUsers}
                    paymentRequests={paymentRequests}
                    auditLogs={auditLogs}
                    courses={courses}
                    onPaymentAction={handlePaymentAction}
                    onSaveCourse={handleSaveCourse}
                   />
                : <CoursesView courses={courses} isDarkMode={isDarkMode} onSelectCourse={handleSelectCourse} userPlanId={currentUser.planId} /> 
          )}

          {currentView === ViewState.COURSE_DETAIL && selectedCourse && (
            <CourseDetailView 
                course={selectedCourse} 
                isDarkMode={isDarkMode} 
                onUpdateProgress={handleUpdateProgress}
                onExamComplete={handleExamComplete}
                onBack={() => {
                    setSelectedCourseId(null);
                    setCurrentView(ViewState.COURSES);
                }}
            />
          )}

          {currentView === ViewState.LEARNING_PATH && (
             <ProgressView courses={courses} stats={MOCK_STATS} isDarkMode={isDarkMode} />
          )}

          {currentView === ViewState.EXAMS && (
             <ExamsView exams={myExams} isDarkMode={isDarkMode} />
          )}

          {currentView === ViewState.PLANS && (
             <PlansView 
                plans={MOCK_PLANS} 
                isDarkMode={isDarkMode} 
                userPlanId={currentUser.planId}
                paymentRequests={displayedPaymentRequests}
                onRequestUpgrade={handlePaymentRequest}
             />
          )}

          {currentView === ViewState.PAYMENTS && (
             <PaymentsView isDarkMode={isDarkMode} paymentRequests={displayedPaymentRequests} />
          )}
          
          {/* SHARED VIEWS */}
          {currentView === ViewState.SUPPORT && (
             <SupportView isDarkMode={isDarkMode} />
          )}

          {currentView === ViewState.PROFILE && (
             <ProfileView isDarkMode={isDarkMode} user={currentUser} />
          )}

          {currentView === ViewState.SETTINGS && (
            <div className="p-8 max-w-4xl mx-auto">
               <h1 className="text-3xl font-bold mb-6">Ajustes de Aplicación</h1>
               <div className={`p-6 rounded-xl border max-w-2xl ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center gap-4 mb-6">
                     <Settings size={24} />
                     <h2 className="text-xl font-semibold">Preferencias</h2>
                  </div>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <span>Notificaciones por correo</span>
                        <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${isDarkMode ? 'bg-blue-900' : 'bg-blue-500'}`}>
                           <div className={`w-4 h-4 rounded-full shadow-sm transform translate-x-6 transition-transform bg-white`}></div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
