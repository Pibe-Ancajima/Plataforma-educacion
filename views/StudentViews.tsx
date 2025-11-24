
import React, { useState } from 'react';
import { Course, Plan, ExamResult, StudentStats, UserProfile, Lesson, PaymentRequest, Question } from '../types';
import CourseCard from '../components/CourseCard';
import { CheckCircle2, XCircle, Clock, Trophy, Target, Play, Lock, Check, MessageSquare, AlertCircle, User, FileText, PlayCircle, ChevronLeft, Headphones, Send, CreditCard, Smartphone, Wallet, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { generateExamQuestions } from '../constants';

/* --- Courses View --- */
export const CoursesView: React.FC<{ courses: Course[], isDarkMode: boolean, onSelectCourse: (c: Course) => void, userPlanId: string }> = ({ courses, isDarkMode, onSelectCourse, userPlanId }) => {
  
  const canAccess = (courseMinPlan: string, userPlan: string) => {
      if (courseMinPlan === 'free') return true;
      if (courseMinPlan === 'individual' && (userPlan === 'individual' || userPlan === 'business')) return true;
      if (courseMinPlan === 'business' && userPlan === 'business') return true;
      return false;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Explorar Cursos</h1>
        <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>Descubre nuevas habilidades. Algunos cursos requieren el Plan Individual.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <CourseCard 
            key={course.id} 
            course={course} 
            isDarkMode={isDarkMode} 
            onSelect={onSelectCourse}
            isLocked={!canAccess(course.minPlan, userPlanId)} 
          />
        ))}
      </div>
    </div>
  );
};

/* --- Lesson Player Component --- */
const LessonPlayer: React.FC<{
    lesson: Lesson;
    isDarkMode: boolean;
    onComplete: () => void;
    onExit: () => void;
}> = ({ lesson, isDarkMode, onComplete, onExit }) => {
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [showResult, setShowResult] = useState(false);
    const [passed, setPassed] = useState(false);
    const [score, setScore] = useState(0);

    // Require 4 out of 5 (80%) to pass
    const PASS_THRESHOLD = 4; 
    
    const handleAnswer = (qId: string, optionIdx: number) => {
        if (showResult) return; // Locked after submitting
        setAnswers(prev => ({ ...prev, [qId]: optionIdx }));
    };

    const allAnswered = lesson.questions.every(q => answers[q.id] !== undefined);

    const submitLesson = () => {
        let correctCount = 0;
        lesson.questions.forEach(q => {
            if (answers[q.id] === q.correctAnswer) correctCount++;
        });

        setScore(correctCount);
        const isPass = correctCount >= PASS_THRESHOLD;
        setPassed(isPass);
        setShowResult(true);

        if (isPass) {
            // Wait a moment before triggering completion so user sees the success screen
            setTimeout(() => {
               onComplete();
            }, 2000);
        }
    };

    const handleRetry = () => {
        setAnswers({});
        setShowResult(false);
        setPassed(false);
        setScore(0);
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-sm`}>
            <div className={`w-full max-w-5xl h-full max-h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
                <div className="flex items-center justify-between p-4 border-b border-opacity-10 border-current">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <PlayCircle size={20} className="text-blue-500" />
                        {lesson.title}
                    </h2>
                    <button onClick={onExit} className="text-sm font-semibold hover:underline opacity-70 hover:opacity-100">
                        Cerrar
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Video Placeholder */}
                    <div className="aspect-video bg-black rounded-xl mb-8 flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                         <div className="text-center z-10">
                             <PlayCircle size={64} className="text-white opacity-80 mb-2 mx-auto group-hover:scale-110 transition-transform" />
                             <p className="text-white font-medium">Reproducir Video de la Clase</p>
                         </div>
                    </div>

                    {/* Result Overlay */}
                    {showResult && (
                         <div className={`mb-8 p-6 rounded-xl border text-center animate-fade-in ${
                             passed 
                             ? 'bg-green-100 border-green-300 text-green-800' 
                             : 'bg-red-100 border-red-300 text-red-800'
                         }`}>
                             {passed ? (
                                 <>
                                     <CheckCircle2 size={48} className="mx-auto mb-2"/>
                                     <h3 className="text-2xl font-bold">¡Clase Aprobada!</h3>
                                     <p className="font-medium">Acertaste {score} de {lesson.questions.length}.</p>
                                     <p className="text-sm opacity-80 mt-2">Cerrando clase y guardando progreso...</p>
                                 </>
                             ) : (
                                 <>
                                     <XCircle size={48} className="mx-auto mb-2"/>
                                     <h3 className="text-2xl font-bold">Clase Reprobada</h3>
                                     <p className="font-medium">Acertaste {score} de {lesson.questions.length}. Necesitas {PASS_THRESHOLD} para aprobar.</p>
                                     <button 
                                        onClick={handleRetry}
                                        className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
                                     >
                                         Intentar Nuevamente
                                     </button>
                                 </>
                             )}
                         </div>
                    )}

                    {/* Questions */}
                    <div className={`max-w-3xl mx-auto ${showResult ? 'opacity-50 pointer-events-none' : ''}`}>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <FileText size={24} className="text-blue-500" />
                            Cuestionario de la Clase ({lesson.questions.length} preguntas)
                        </h3>
                        
                        <div className="space-y-6 mb-8">
                            {lesson.questions.map((q, idx) => (
                                <div key={q.id} className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                    <p className="font-semibold mb-4">{idx + 1}. {q.text}</p>
                                    <div className="space-y-2">
                                        {q.options.map((opt, oIdx) => (
                                            <label key={oIdx} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                                answers[q.id] === oIdx 
                                                    ? (isDarkMode ? 'bg-blue-900/50 border border-blue-500' : 'bg-blue-100 border border-blue-300')
                                                    : (isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100')
                                            }`}>
                                                <input 
                                                    type="radio" 
                                                    name={q.id} 
                                                    checked={answers[q.id] === oIdx}
                                                    onChange={() => handleAnswer(q.id, oIdx)}
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                <span>{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-opacity-10 border-current flex justify-end">
                    {!showResult && (
                        <button 
                            onClick={submitLesson}
                            disabled={!allAnswered}
                            className={`px-8 py-3 rounded-lg font-bold transition-all ${
                                allAnswered
                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            {allAnswered ? 'Enviar Respuestas' : 'Responde todas las preguntas'}
                        </button>
                    )}
                    {showResult && passed && (
                        <button onClick={onExit} className="px-8 py-3 rounded-lg font-bold bg-green-600 text-white">
                            Continuar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

/* --- Exam Player Component --- */
const ExamPlayer: React.FC<{
    courseName: string;
    questions: Question[];
    isDarkMode: boolean;
    onComplete: (score: number) => void;
    onExit: () => void;
}> = ({ courseName, questions, isDarkMode, onComplete, onExit }) => {
    const [answers, setAnswers] = useState<Record<string, number>>({});
    
    const handleAnswer = (qId: string, optionIdx: number) => {
        setAnswers(prev => ({ ...prev, [qId]: optionIdx }));
    };
    
    const allAnswered = questions.every(q => answers[q.id] !== undefined);

    const submitExam = () => {
        let correctCount = 0;
        questions.forEach(q => {
            if (answers[q.id] === q.correctAnswer) correctCount++;
        });
        // Score out of 100
        const totalPoints = 100;
        const pointsPerQ = totalPoints / questions.length;
        const finalScore = Math.round(correctCount * pointsPerQ);
        
        onComplete(finalScore);
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-sm`}>
             <div className={`w-full max-w-4xl h-full max-h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
                <div className="p-6 border-b border-opacity-10 border-current flex justify-between items-center bg-blue-600 text-white">
                    <h2 className="font-bold text-xl flex items-center gap-2">
                        <GraduationCapIcon /> Examen Final: {courseName}
                    </h2>
                    <button onClick={onExit} className="hover:bg-blue-700 p-1 rounded"><XCircle/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8">
                     <div className="mb-6 p-4 bg-yellow-100 text-yellow-800 rounded-lg flex items-start gap-3">
                        <AlertTriangle className="shrink-0 mt-1"/>
                        <div>
                            <p className="font-bold">Instrucciones:</p>
                            <ul className="list-disc pl-4 text-sm">
                                <li>Este examen consta de 10 preguntas.</li>
                                <li>Cada pregunta vale 10 puntos. Total: 100 puntos.</li>
                                <li>Necesitas 60 puntos para aprobar y obtener tu certificado.</li>
                            </ul>
                        </div>
                     </div>

                     <div className="space-y-8">
                        {questions.map((q, idx) => (
                            <div key={q.id} className="border-b border-opacity-10 border-current pb-6 last:border-0">
                                <p className="font-bold text-lg mb-4">{idx + 1}. {q.text}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {q.options.map((opt, oIdx) => (
                                        <label key={oIdx} className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                                            answers[q.id] === oIdx 
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                                                : (isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50')
                                        }`}>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                answers[q.id] === oIdx ? 'border-white' : 'border-gray-400'
                                            }`}>
                                                {answers[q.id] === oIdx && <div className="w-2.5 h-2.5 rounded-full bg-white"></div>}
                                            </div>
                                            <span className="font-medium">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                     </div>
                </div>

                <div className="p-6 border-t border-opacity-10 border-current flex justify-end gap-4 bg-opacity-5 bg-black">
                    <button onClick={onExit} className="px-6 py-3 rounded-lg font-bold opacity-60 hover:opacity-100">Cancelar</button>
                    <button 
                        onClick={submitExam}
                        disabled={!allAnswered}
                        className={`px-8 py-3 rounded-lg font-bold shadow-lg transition-all ${
                            allAnswered 
                            ? 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105' 
                            : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        }`}
                    >
                        Finalizar Examen
                    </button>
                </div>
             </div>
        </div>
    );
}

const GraduationCapIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
);


/* --- Course Detail View (Lessons & Exam) --- */
export const CourseDetailView: React.FC<{ 
    course: Course, 
    isDarkMode: boolean, 
    onUpdateProgress: (courseId: string, lessonId: string) => void,
    onExamComplete: (courseId: string, score: number) => void,
    onBack: () => void 
}> = ({ course, isDarkMode, onUpdateProgress, onExamComplete, onBack }) => {
    
    const [activeTab, setActiveTab] = useState<'lessons' | 'exam' | 'comments'>('lessons');
    const [examScore, setExamScore] = useState<number | null>(null);
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [takingExam, setTakingExam] = useState(false);
    const [examQuestions, setExamQuestions] = useState<Question[]>([]);

    const completedCount = course.lessons.filter(l => l.isCompleted).length;
    const isExamUnlocked = completedCount === course.lessons.length;

    const startExam = () => {
        const questions = generateExamQuestions(course.category);
        setExamQuestions(questions);
        setTakingExam(true);
    };

    const handleExamFinish = (score: number) => {
        setExamScore(score);
        setTakingExam(false);
        onExamComplete(course.id, score);
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {activeLesson && (
                <LessonPlayer 
                    lesson={activeLesson} 
                    isDarkMode={isDarkMode} 
                    onComplete={() => {
                        onUpdateProgress(course.id, activeLesson.id);
                        setActiveLesson(null);
                    }}
                    onExit={() => setActiveLesson(null)}
                />
            )}

            {takingExam && (
                <ExamPlayer 
                    courseName={course.title}
                    questions={examQuestions}
                    isDarkMode={isDarkMode}
                    onComplete={handleExamFinish}
                    onExit={() => setTakingExam(false)}
                />
            )}

            <button onClick={onBack} className={`mb-6 text-sm hover:underline flex items-center gap-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                <ChevronLeft size={16} /> Volver a Cursos
            </button>

            <div className={`rounded-2xl overflow-hidden mb-8 ${isDarkMode ? 'bg-slate-800' : 'bg-white shadow-sm border border-slate-100'}`}>
                <div className="h-64 relative">
                    <img src={course.image} className="w-full h-full object-cover" alt="cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                        <div>
                            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-bold mb-2 inline-block">
                                {course.category}
                            </span>
                            <h1 className="text-4xl font-bold text-white mb-2">{course.title}</h1>
                            <p className="text-slate-200">{course.instructor}</p>
                        </div>
                    </div>
                </div>
                
                <div className="p-6">
                     <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${course.progress}%` }}></div>
                        </div>
                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{Math.round(course.progress)}% Completado</span>
                     </div>

                     <div className="flex gap-6 border-b border-slate-200 dark:border-slate-700">
                        {['lessons', 'exam', 'comments'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`pb-4 px-2 font-medium capitalize transition-colors relative ${
                                    activeTab === tab 
                                    ? (isDarkMode ? 'text-blue-400' : 'text-blue-600') 
                                    : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800')
                                }`}
                            >
                                {tab === 'lessons' ? 'Clases' : tab === 'exam' ? 'Examen Final' : 'Comentarios'}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                                )}
                            </button>
                        ))}
                     </div>

                     <div className="mt-8">
                        {activeTab === 'lessons' && (
                            <div className="space-y-3">
                                {course.lessons.map((lesson, idx) => (
                                    <div key={lesson.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                                        lesson.isCompleted 
                                            ? (isDarkMode ? 'bg-slate-700/50 border-green-900/30' : 'bg-green-50 border-green-100')
                                            : (isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 hover:border-blue-200')
                                    }`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                                lesson.isCompleted 
                                                ? 'bg-green-500 text-white' 
                                                : (isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500')
                                            }`}>
                                                {lesson.isCompleted ? <Check size={16}/> : idx + 1}
                                            </div>
                                            <div>
                                                <h4 className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{lesson.title}</h4>
                                                <span className="text-xs opacity-60 flex items-center gap-1">
                                                    <Clock size={12}/> {lesson.duration} • 5 Preguntas
                                                </span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setActiveLesson(lesson)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                lesson.isCompleted
                                                ? (isDarkMode ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-green-100 text-green-700')
                                                : (isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-600 text-white hover:bg-blue-700')
                                            }`}
                                        >
                                            {lesson.isCompleted ? 'Repasar' : 'Entrar a Clase'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'exam' && (
                            <div className="text-center py-12">
                                {examScore !== null ? (
                                    <div className="animate-fade-in">
                                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                                            examScore >= 60 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                            <Trophy size={48} />
                                        </div>
                                        <h2 className="text-3xl font-bold mb-2">
                                            {examScore >= 60 ? '¡Felicidades! Aprobaste.' : 'No Aprobado'}
                                        </h2>
                                        <p className="text-4xl font-black mb-6 text-blue-600">{examScore}/100</p>
                                        <p className="mb-8 opacity-70">Has completado el examen final del curso. Tu calificación ha sido enviada.</p>
                                        <button 
                                            onClick={onBack}
                                            className="px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold"
                                        >
                                            Volver a mis Cursos
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                                            isExamUnlocked ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                                        }`}>
                                            {isExamUnlocked ? <FileText size={40}/> : <Lock size={40} />}
                                        </div>
                                        <h3 className="text-2xl font-bold mb-4">Examen Final de Certificación</h3>
                                        <p className="mb-8 max-w-md mx-auto opacity-70">
                                            {isExamUnlocked 
                                                ? "Este examen consta de 10 preguntas y vale 100 puntos. Necesitas aprobar todas las clases primero."
                                                : "Debes completar todas las clases (ver video y responder preguntas) para desbloquear el examen final."}
                                        </p>
                                        <button 
                                            onClick={startExam}
                                            disabled={!isExamUnlocked}
                                            className={`px-8 py-3 rounded-xl font-bold text-lg transition-all ${
                                                isExamUnlocked
                                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30'
                                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                            }`}
                                        >
                                            {isExamUnlocked ? 'Comenzar Examen' : 'Bloqueado'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'comments' && (
                            <div>
                                <div className={`p-8 text-center rounded-xl border border-dashed ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`}>
                                    <MessageSquare size={48} className="mx-auto mb-4 opacity-30" />
                                    <h3 className="text-lg font-medium mb-2">Aún no hay comentarios</h3>
                                    <p className="opacity-60 mb-6">Sé el primero en compartir tu experiencia sobre este curso.</p>
                                </div>
                            </div>
                        )}
                     </div>
                </div>
            </div>
        </div>
    );
}

/* --- Learning Path / Progress View --- */
export const ProgressView: React.FC<{ courses: Course[], stats: StudentStats, isDarkMode: boolean }> = ({ courses, stats, isDarkMode }) => {
  
  // Prepare data for chart
  const data = courses.map(c => ({
    name: c.category,
    progress: c.progress
  })).filter(c => c.progress >= 0);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Tu Ruta de Aprendizaje</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-100 shadow-sm'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-green-100 text-green-600'}`}>
              <CheckCircle2 size={20} />
            </div>
            <span className="text-sm font-medium opacity-70">Completados</span>
          </div>
          <p className="text-2xl font-bold">{courses.filter(c => c.progress === 100).length} Cursos</p>
        </div>
        
        <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-100 shadow-sm'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-blue-100 text-blue-600'}`}>
              <Clock size={20} />
            </div>
            <span className="text-sm font-medium opacity-70">Horas Totales</span>
          </div>
          <p className="text-2xl font-bold">0 Horas</p>
        </div>

        <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-100 shadow-sm'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-orange-100 text-orange-600'}`}>
              <Target size={20} />
            </div>
            <span className="text-sm font-medium opacity-70">Promedio</span>
          </div>
          <p className="text-2xl font-bold">0</p>
        </div>

        <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-100 shadow-sm'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-purple-100 text-purple-600'}`}>
              <Trophy size={20} />
            </div>
            <span className="text-sm font-medium opacity-70">Certificados</span>
          </div>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>

      {/* Charts */}
      <div className={`p-6 rounded-xl border mb-8 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-100 shadow-sm'}`}>
        <h2 className="text-xl font-bold mb-6">Progreso por Materia</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#334155" : "#eee"} vertical={false} />
              <XAxis dataKey="name" stroke={isDarkMode ? "#94a3b8" : "#64748b"} />
              <YAxis stroke={isDarkMode ? "#94a3b8" : "#64748b"} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                  border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                  color: isDarkMode ? '#fff' : '#000'
                }} 
              />
              <Bar dataKey="progress" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={isDarkMode ? '#60a5fa' : '#2563eb'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

/* --- Exams View --- */
export const ExamsView: React.FC<{ exams: ExamResult[], isDarkMode: boolean }> = ({ exams, isDarkMode }) => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Exámenes y Evaluaciones</h1>
      
      {exams.length === 0 ? (
          <div className={`text-center p-12 rounded-xl border border-dashed ${isDarkMode ? 'border-slate-700 text-slate-400' : 'border-slate-300 text-slate-500'}`}>
              <FileText size={48} className="mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-bold mb-2">No hay exámenes</h3>
              <p>Aún no has realizado ninguna evaluación. ¡Comienza un curso para aprender!</p>
          </div>
      ) : (
          <div className={`rounded-xl overflow-hidden border ${isDarkMode ? 'border-slate-700' : 'border-blue-100 shadow-sm'}`}>
            <table className={`w-full text-left ${isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-white'}`}>
            <thead className={isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}>
                <tr>
                <th className="p-4 font-semibold text-sm">Curso</th>
                <th className="p-4 font-semibold text-sm">Fecha</th>
                <th className="p-4 font-semibold text-sm">Puntaje</th>
                <th className="p-4 font-semibold text-sm">Estado</th>
                <th className="p-4 font-semibold text-sm">Acción</th>
                </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                {exams.map(exam => (
                <tr key={exam.id} className={isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-blue-50'}>
                    <td className="p-4 font-medium">{exam.courseName}</td>
                    <td className="p-4 text-sm opacity-80">{exam.date}</td>
                    <td className="p-4 font-bold">
                        {exam.score}/100
                    </td>
                    <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                        exam.status === 'passed' ? (isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700') :
                        (isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700')
                    }`}>
                        {exam.status === 'passed' ? 'Aprobado' : 'Reprobado'}
                    </span>
                    </td>
                    <td className="p-4">
                    <button className={`text-sm font-medium underline ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        Ver Resultados
                    </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      )}
    </div>
  );
};

/* --- Plans View --- */
interface PlansViewProps {
    plans: Plan[];
    isDarkMode: boolean;
    userPlanId: string;
    paymentRequests: PaymentRequest[];
    onRequestUpgrade: (details: Omit<PaymentRequest, 'id' | 'status' | 'date' | 'userEmail' | 'userName'>) => void;
}

export const PlansView: React.FC<PlansViewProps> = ({ plans, isDarkMode, userPlanId, paymentRequests, onRequestUpgrade }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Credit Card' | 'Payment App'>('Credit Card');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [appDetails, setAppDetails] = useState({ phone: '' });

  const handlePlanSelect = (plan: Plan) => {
      if (plan.id === userPlanId) return; // Already on plan
      setSelectedPlan(plan);
      setShowModal(true);
  };

  const handleSubmitPayment = () => {
      if (selectedPlan) {
          onRequestUpgrade({
              planId: selectedPlan.id,
              planName: selectedPlan.name,
              amount: selectedPlan.price,
              method: paymentMethod,
              details: paymentMethod === 'Credit Card' ? `**** ${cardDetails.number.slice(-4)}` : `App: ${appDetails.phone}`
          });
          setShowModal(false);
          setSelectedPlan(null);
          // Reset forms
          setCardDetails({ number: '', expiry: '', cvv: '' });
          setAppDetails({ phone: '' });
      }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl font-bold mb-4">Elige tu Plan de Estudios</h1>
        <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
          Desbloquea todo el potencial de Tecnokids.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map(plan => {
          const isCurrent = userPlanId === plan.id;
          const pendingRequest = paymentRequests.find(r => r.planId === plan.id && r.status === 'pending');
          const isPending = !!pendingRequest;

          return (
            <div key={plan.id} className={`relative p-8 rounded-2xl border flex flex-col transition-all duration-300 ${
                plan.isPopular 
                ? (isDarkMode ? 'border-blue-500 shadow-lg shadow-blue-900/20 scale-105 bg-slate-800' : 'border-blue-500 shadow-xl scale-105 bg-white') 
                : (isDarkMode ? 'border-slate-700 bg-slate-900' : 'border-slate-200 shadow-sm bg-white')
            }`}>
                
                {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-blue-600 text-white">
                    Más Popular
                </div>
                )}

                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                <div className={`flex items-baseline gap-1 mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-sm opacity-70">/mes</span>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 size={18} className={isDarkMode ? "text-blue-400 flex-shrink-0" : "text-blue-600 flex-shrink-0"} />
                    <span className={isDarkMode ? "text-slate-300" : "text-slate-600"}>{feature}</span>
                    </li>
                ))}
                </ul>

                <button 
                    onClick={() => handlePlanSelect(plan)}
                    disabled={isCurrent || isPending}
                    className={`w-full py-3 rounded-lg font-bold transition-all ${
                        isCurrent 
                        ? 'bg-green-100 text-green-700 cursor-default'
                        : isPending 
                            ? 'bg-yellow-100 text-yellow-700 cursor-wait'
                            : plan.isPopular
                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30'
                                : (isDarkMode ? 'bg-slate-800 border border-slate-600 hover:bg-slate-700' : 'bg-blue-50 text-blue-700 hover:bg-blue-100')
                    }`}
                >
                    {isCurrent ? 'Plan Actual' : isPending ? 'Verificando Pago...' : 'Seleccionar Plan'}
                </button>
            </div>
          );
        })}
      </div>

      {/* PAYMENT MODAL */}
      {showModal && selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className={`w-full max-w-md rounded-2xl overflow-hidden shadow-2xl ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}`}>
                  <div className="p-6 border-b border-opacity-10 border-current flex justify-between items-center">
                      <h2 className="text-xl font-bold">Confirmar Suscripción</h2>
                      <button onClick={() => setShowModal(false)} className="opacity-50 hover:opacity-100"><XCircle size={24}/></button>
                  </div>
                  <div className="p-6">
                      <div className="mb-6 p-4 rounded-xl bg-blue-600 text-white">
                          <p className="text-sm opacity-80">Estás adquiriendo:</p>
                          <div className="flex justify-between items-end mt-1">
                              <h3 className="text-xl font-bold">{selectedPlan.name}</h3>
                              <span className="text-2xl font-bold">${selectedPlan.price}</span>
                          </div>
                      </div>

                      <div className="mb-6">
                          <label className="block text-sm font-medium mb-2">Método de Pago</label>
                          <div className="grid grid-cols-2 gap-3">
                              <button 
                                onClick={() => setPaymentMethod('Credit Card')}
                                className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all ${
                                    paymentMethod === 'Credit Card' 
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                                    : 'border-opacity-20 dark:border-slate-600'
                                }`}
                              >
                                  <CreditCard size={20}/>
                                  <span className="text-xs font-bold">Tarjeta</span>
                              </button>
                              <button 
                                onClick={() => setPaymentMethod('Payment App')}
                                className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all ${
                                    paymentMethod === 'Payment App' 
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                                    : 'border-opacity-20 dark:border-slate-600'
                                }`}
                              >
                                  <Smartphone size={20}/>
                                  <span className="text-xs font-bold">App Pago</span>
                              </button>
                          </div>
                      </div>

                      {paymentMethod === 'Credit Card' ? (
                          <div className="space-y-4 animate-fade-in">
                              <div>
                                  <label className="block text-xs uppercase font-bold opacity-50 mb-1">Número de Tarjeta</label>
                                  <input 
                                    type="text" 
                                    placeholder="0000 0000 0000 0000" 
                                    className="w-full p-3 rounded-lg bg-transparent border border-opacity-20 border-current outline-none focus:border-blue-500"
                                    value={cardDetails.number}
                                    onChange={e => setCardDetails({...cardDetails, number: e.target.value})}
                                  />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="block text-xs uppercase font-bold opacity-50 mb-1">Expira</label>
                                      <input 
                                        type="text" 
                                        placeholder="MM/YY" 
                                        className="w-full p-3 rounded-lg bg-transparent border border-opacity-20 border-current outline-none focus:border-blue-500"
                                        value={cardDetails.expiry}
                                        onChange={e => setCardDetails({...cardDetails, expiry: e.target.value})}
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-xs uppercase font-bold opacity-50 mb-1">CVC</label>
                                      <input 
                                        type="text" 
                                        placeholder="123" 
                                        className="w-full p-3 rounded-lg bg-transparent border border-opacity-20 border-current outline-none focus:border-blue-500"
                                        value={cardDetails.cvv}
                                        onChange={e => setCardDetails({...cardDetails, cvv: e.target.value})}
                                      />
                                  </div>
                              </div>
                          </div>
                      ) : (
                          <div className="space-y-4 animate-fade-in">
                              <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-900 border text-center">
                                  <p className="text-sm mb-2">Envía tu pago al número:</p>
                                  <p className="text-xl font-mono font-bold text-blue-600">55-1234-5678</p>
                              </div>
                              <div>
                                  <label className="block text-xs uppercase font-bold opacity-50 mb-1">Tu Número de Confirmación / Teléfono</label>
                                  <input 
                                    type="text" 
                                    placeholder="+52..." 
                                    className="w-full p-3 rounded-lg bg-transparent border border-opacity-20 border-current outline-none focus:border-blue-500"
                                    value={appDetails.phone}
                                    onChange={e => setAppDetails({...appDetails, phone: e.target.value})}
                                  />
                              </div>
                          </div>
                      )}
                  </div>
                  <div className="p-6 border-t border-opacity-10 border-current">
                      <button 
                        onClick={handleSubmitPayment}
                        className="w-full py-3 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2"
                      >
                          <CheckCircle2 size={18} /> Confirmar Pago
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

/* --- Profile View --- */
export const ProfileView: React.FC<{ isDarkMode: boolean, user: UserProfile }> = ({ isDarkMode, user }) => {
    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Mi Cuenta</h1>
            
            <div className={`rounded-2xl overflow-hidden mb-8 border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-400"></div>
                <div className="px-8 pb-8">
                    <div className="relative -top-12 mb-[-30px] flex justify-between items-end">
                        <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center text-4xl font-bold ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-white text-blue-600 shadow'}`}>
                            {user.name.charAt(0)}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                            {user.role === 'staff' ? 'Administrador' : 'Estudiante'}
                        </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-xl font-bold mb-1">{user.name}</h2>
                            <p className="opacity-60 mb-6">Se unió en {user.joinDate}</p>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs uppercase font-bold opacity-50 mb-1">Correo Electrónico</label>
                                    <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                        {user.email}
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs uppercase font-bold opacity-50 mb-1">Teléfono</label>
                                        <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                            {user.phone || '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase font-bold opacity-50 mb-1">País</label>
                                        <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                            {user.country || '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-blue-50 border-blue-100'}`}>
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Target size={18}/> Plan Actual
                            </h3>
                            <div className="text-2xl font-bold text-blue-600 mb-2">
                                {user.planId === 'individual' ? 'Plan Individual' : user.planId === 'business' ? 'Plan Business' : 'Plan Gratuito'}
                            </div>
                            <p className="text-sm opacity-70 mb-4">
                                {user.planId === 'individual'
                                    ? 'Tienes acceso a cursos adicionales.' 
                                    : user.planId === 'business' 
                                        ? 'Acceso total para empresas.' 
                                        : 'Acceso limitado a cursos básicos (Arte, Matemáticas, Inglés).'}
                            </p>
                            {user.planId !== 'individual' && user.planId !== 'business' && (
                                <div className="w-full py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold text-center">
                                    Ve a la sección Planes para actualizar
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* --- Payments View (Simple) --- */
export const PaymentsView: React.FC<{ isDarkMode: boolean, paymentRequests: PaymentRequest[] }> = ({ isDarkMode, paymentRequests }) => {
    const approvedPayments = paymentRequests.filter(r => r.status === 'approved');

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Métodos de Pago y Facturación</h1>
            
            <div className={`p-6 rounded-xl border mb-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Billetera</h3>
                    <Wallet size={20} className="text-blue-500"/>
                </div>
                <div className="text-center py-8 opacity-60">
                    <p>Los métodos de pago se gestionan al realizar una compra.</p>
                </div>
            </div>

            <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h3 className="font-bold text-lg mb-4">Historial de Transacciones</h3>
                <div className={`space-y-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {approvedPayments.length === 0 ? (
                        <p className="text-sm opacity-50 italic">No hay transacciones aprobadas.</p>
                    ) : approvedPayments.map(p => (
                        <div key={p.id} className={`flex justify-between items-center py-2 border-b last:border-0 ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                            <div>
                                <p className="font-medium text-sm">Actualización a {p.planName}</p>
                                <p className="text-xs opacity-60">{p.date}</p>
                                <p className="text-xs opacity-60">{p.method}</p>
                            </div>
                            <span className="font-bold text-sm text-green-600">${p.amount.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

/* --- Support View --- */
export const SupportView: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
    const [message, setMessage] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTimeout(() => {
            setSent(true);
            setMessage('');
        }, 500);
    };

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Soporte Técnico</h1>
            <p className={`mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                ¿Tienes algún problema? Estamos aquí para ayudarte.
            </p>

            <div className={`p-8 rounded-xl border shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                {sent ? (
                    <div className="text-center py-12 animate-fade-in">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={32}/>
                        </div>
                        <h3 className="text-xl font-bold mb-2">¡Mensaje Enviado!</h3>
                        <p className="opacity-70 mb-6">Nuestro equipo te responderá pronto.</p>
                        <button 
                            onClick={() => setSent(false)}
                            className="text-blue-500 font-semibold hover:underline"
                        >
                            Enviar otro mensaje
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Tu Mensaje</label>
                            <textarea 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                                className={`w-full p-4 rounded-lg border h-32 focus:ring-2 outline-none transition-all ${
                                    isDarkMode 
                                    ? 'bg-slate-900 border-slate-600 focus:ring-blue-500 text-white' 
                                    : 'bg-slate-50 border-slate-200 focus:ring-blue-500 focus:border-blue-500 text-slate-900'
                                }`}
                                placeholder="Describe tu problema o pregunta aquí..."
                            ></textarea>
                        </div>
                        <button 
                            type="submit"
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Send size={18}/>
                            Enviar Mensaje
                        </button>
                    </form>
                )}
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <h3 className="font-bold mb-2">Preguntas Frecuentes</h3>
                    <p className="text-sm opacity-60">Revisa nuestra documentación antes de contactar.</p>
                </div>
                 <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <h3 className="font-bold mb-2">Chat en Vivo</h3>
                    <p className="text-sm opacity-60">Disponible de Lunes a Viernes, 9am - 5pm.</p>
                </div>
            </div>
        </div>
    );
};
