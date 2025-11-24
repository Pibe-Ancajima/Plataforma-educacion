
import { Course, Plan, ExamResult, StudentStats, Lesson, Question } from './types';

// Helper to generate 5 realistic questions based on topic
const generateRealisticQuestions = (topic: string, category: string): Question[] => {
  const baseQuestions = [];
  
  if (category === 'Matemáticas') {
    baseQuestions.push(
      { id: 'q1', text: '¿Cuánto es 15 + 25?', options: ['30', '40', '45'], correctAnswer: 1 },
      { id: 'q2', text: 'Si tienes 3 manzanas y comes 1, ¿cuántas quedan?', options: ['2', '1', '0'], correctAnswer: 0 },
      { id: 'q3', text: '¿Cuánto es 5 x 5?', options: ['10', '25', '55'], correctAnswer: 1 },
      { id: 'q4', text: '¿Cuál es el número par?', options: ['3', '7', '8'], correctAnswer: 2 },
      { id: 'q5', text: '¿Cuánto es 100 - 50?', options: ['40', '50', '60'], correctAnswer: 1 }
    );
  } else if (category === 'Arte') {
    baseQuestions.push(
      { id: 'q1', text: '¿Cuál de los siguientes es un color primario?', options: ['Verde', 'Rojo', 'Naranja'], correctAnswer: 1 },
      { id: 'q2', text: '¿Qué herramienta se usa para pintar en lienzo?', options: ['Martillo', 'Pincel', 'Destornillador'], correctAnswer: 1 },
      { id: 'q3', text: '¿Qué color obtienes al mezclar azul y amarillo?', options: ['Verde', 'Morado', 'Naranja'], correctAnswer: 0 },
      { id: 'q4', text: '¿Cuál es el opuesto de negro?', options: ['Azul', 'Blanco', 'Rojo'], correctAnswer: 1 },
      { id: 'q5', text: '¿Qué forma tiene un balón de fútbol?', options: ['Cuadrado', 'Esfera', 'Triángulo'], correctAnswer: 1 }
    );
  } else if (category === 'Inglés') {
    baseQuestions.push(
      { id: 'q1', text: '¿Cómo se dice "Perro" en inglés?', options: ['Cat', 'Dog', 'Bird'], correctAnswer: 1 },
      { id: 'q2', text: 'Completa la frase: "Hello, how are ____?"', options: ['you', 'is', 'me'], correctAnswer: 0 },
      { id: 'q3', text: '¿Qué color es "Blue"?', options: ['Rojo', 'Azul', 'Verde'], correctAnswer: 1 },
      { id: 'q4', text: 'Traduce "Good Morning"', options: ['Buenas noches', 'Buenos días', 'Hola'], correctAnswer: 1 },
      { id: 'q5', text: 'El número "One" es:', options: ['1', '2', '3'], correctAnswer: 0 }
    );
  } else if (category === 'Computación') {
    baseQuestions.push(
      { id: 'q1', text: '¿Qué dispositivo se usa para mover el cursor?', options: ['Teclado', 'Ratón (Mouse)', 'Impresora'], correctAnswer: 1 },
      { id: 'q2', text: '¿Cuál es el cerebro de la computadora?', options: ['Monitor', 'CPU', 'Teclado'], correctAnswer: 1 },
      { id: 'q3', text: '¿Para qué sirve el monitor?', options: ['Para ver la información', 'Para escribir', 'Para escuchar música'], correctAnswer: 0 },
      { id: 'q4', text: 'Internet nos sirve para:', options: ['Solo jugar', 'Buscar información y comunicarse', 'Cocinar'], correctAnswer: 1 },
      { id: 'q5', text: '¿Qué tecla borra caracteres?', options: ['Enter', 'Espacio', 'Backspace (Retroceso)'], correctAnswer: 2 }
    );
  } else if (category === 'Ciencias') {
    baseQuestions.push(
      { id: 'q1', text: '¿Qué necesitan las plantas para crecer?', options: ['Solo oscuridad', 'Agua y Sol', 'Jugo'], correctAnswer: 1 },
      { id: 'q2', text: '¿Cuál es el planeta más grande del sistema solar?', options: ['Tierra', 'Marte', 'Júpiter'], correctAnswer: 2 },
      { id: 'q3', text: 'El agua hierve a:', options: ['100°C', '0°C', '50°C'], correctAnswer: 0 },
      { id: 'q4', text: '¿Qué animal es un mamífero?', options: ['Perro', 'Cocodrilo', 'Pez'], correctAnswer: 0 },
      { id: 'q5', text: 'La Tierra gira alrededor de:', options: ['La Luna', 'El Sol', 'Marte'], correctAnswer: 1 }
    );
  } else if (category === 'Música') {
    baseQuestions.push(
      { id: 'q1', text: '¿Cuántas notas musicales básicas existen (Do-Si)?', options: ['5', '7', '10'], correctAnswer: 1 },
      { id: 'q2', text: '¿Qué instrumento tiene teclas blancas y negras?', options: ['Guitarra', 'Piano', 'Tambor'], correctAnswer: 1 },
      { id: 'q3', text: 'El sonido fuerte se llama:', options: ['Forte', 'Piano', 'Silencio'], correctAnswer: 0 },
      { id: 'q4', text: '¿Qué figura musical dura 4 tiempos?', options: ['Negra', 'Redonda', 'Corchea'], correctAnswer: 1 },
      { id: 'q5', text: 'Para cantar usamos:', options: ['Las manos', 'La voz', 'Los pies'], correctAnswer: 1 }
    );
  } else {
    // Default / Generic fillers if category is unknown
    for(let i=1; i<=5; i++) {
        baseQuestions.push({
            id: `q${i}`,
            text: `Pregunta de control #${i} sobre ${topic}`,
            options: ['Respuesta Correcta', 'Incorrecta A', 'Incorrecta B'],
            correctAnswer: 0
        });
    }
  }
  return baseQuestions;
};

export const generateExamQuestions = (courseCategory: string): Question[] => {
    // Generate 10 questions for the final exam (100 points total)
    const questions: Question[] = [];
    
    for (let i = 0; i < 10; i++) {
        questions.push({
            id: `exam_q_${i}`,
            text: `Pregunta de Examen Final #${i + 1} (${courseCategory}): ¿Cuál es la opción correcta?`,
            options: [
                `Respuesta Correcta`, 
                `Opción Incorrecta A`, 
                `Opción Incorrecta B`, 
                `Opción Incorrecta C`
            ],
            correctAnswer: 0
        });
    }
    return questions;
};

const generateLessons = (courseTopic: string, category: string): Lesson[] => {
  return Array.from({ length: 5 }, (_, i) => ({ 
    id: `l-${i + 1}-${Math.random().toString(36).substr(2,5)}`,
    title: `Clase ${i + 1}: ${courseTopic} - Parte ${i + 1}`,
    duration: `${15 + i * 2} min`,
    isCompleted: false,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', 
    questions: generateRealisticQuestions(`${courseTopic} Parte ${i + 1}`, category)
  }));
};

export const MOCK_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Arte y Diseño Digital',
    category: 'Arte',
    description: 'Domina los fundamentos del color y herramientas digitales. (Plan Gratuito)',
    image: 'https://picsum.photos/seed/art/400/250',
    price: 0,
    progress: 0,
    instructor: 'María Rodríguez',
    lessons: generateLessons('Diseño Digital', 'Arte'),
    comments: [],
    minPlan: 'free'
  },
  {
    id: 'c4',
    title: 'Matemáticas Divertidas',
    category: 'Matemáticas',
    description: 'Aprende matemáticas jugando. (Plan Gratuito)',
    image: 'https://picsum.photos/seed/math/400/250',
    price: 0,
    progress: 0,
    instructor: 'Prof. Carlos Ruiz',
    lessons: generateLessons('Matemáticas', 'Matemáticas'),
    comments: [],
    minPlan: 'free'
  },
  {
    id: 'c5',
    title: 'Inglés para Niños',
    category: 'Inglés',
    description: 'Vocabulario básico y frases divertidas. (Plan Gratuito)',
    image: 'https://picsum.photos/seed/english/400/250',
    price: 0,
    progress: 0,
    instructor: 'Sarah Jenkins',
    lessons: generateLessons('Inglés', 'Inglés'),
    comments: [],
    minPlan: 'free'
  },
  {
    id: 'c2',
    title: 'Computación Básica',
    category: 'Computación',
    description: 'Conoce tu computadora y navega seguro. (Plan Individual)',
    image: 'https://picsum.photos/seed/comp/400/250',
    price: 31.00,
    progress: 0,
    instructor: 'Juan Pérez',
    lessons: generateLessons('Computación', 'Computación'),
    comments: [],
    minPlan: 'individual'
  },
  {
    id: 'c3',
    title: 'Ciencias Naturales',
    category: 'Ciencias',
    description: 'Explora el mundo natural y el espacio. (Plan Individual)',
    image: 'https://picsum.photos/seed/science/400/250',
    price: 31.00,
    progress: 0,
    instructor: 'Dra. Elena Gómez',
    lessons: generateLessons('Ciencias', 'Ciencias'),
    comments: [],
    minPlan: 'individual'
  },
  {
    id: 'c6',
    title: 'Música y Ritmo',
    category: 'Música',
    description: 'Aprende las notas musicales y ritmos básicos. (Plan Individual)',
    image: 'https://picsum.photos/seed/music/400/250',
    price: 31.00,
    progress: 0,
    instructor: 'Maestro Luis Torres',
    lessons: generateLessons('Música', 'Música'),
    comments: [],
    minPlan: 'individual'
  }
];

export const MOCK_PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Plan Gratuito',
    price: 0,
    features: ['Acceso a cursos de Arte, Matemáticas e Inglés', 'Videos educativos', 'Cuestionarios básicos'],
    type: 'free'
  },
  {
    id: 'individual',
    name: 'Plan Individual',
    price: 31.00,
    features: ['Acceso a TODOS los cursos', 'Certificados de finalización', 'Exámenes completos', 'Sin publicidad'],
    isPopular: true,
    type: 'individual'
  },
  {
    id: 'business',
    name: 'Plan Business',
    price: 99.99,
    features: ['Todo lo del Plan Individual', 'Cursos Avanzados Exclusivos', 'Panel para padres/maestros', 'Soporte 24/7'],
    type: 'business'
  }
];

export const MOCK_EXAMS: ExamResult[] = [];

export const MOCK_STATS: StudentStats = {
  coursesCompleted: 0,
  hoursSpent: 0,
  averageScore: 0,
  certificates: 0
};

export const COUNTRIES = [
  { name: 'Perú', code: 'PE', prefix: '+51', flag: '🇵🇪' },
  { name: 'México', code: 'MX', prefix: '+52', flag: '🇲🇽' },
  { name: 'Colombia', code: 'CO', prefix: '+57', flag: '🇨🇴' },
  { name: 'Argentina', code: 'AR', prefix: '+54', flag: '🇦🇷' },
  { name: 'Chile', code: 'CL', prefix: '+56', flag: '🇨🇱' },
  { name: 'Ecuador', code: 'EC', prefix: '+593', flag: '🇪🇨' },
  { name: 'España', code: 'ES', prefix: '+34', flag: '🇪🇸' },
  { name: 'Estados Unidos', code: 'US', prefix: '+1', flag: '🇺🇸' },
  { name: 'Brasil', code: 'BR', prefix: '+55', flag: '🇧🇷' },
  { name: 'Uruguay', code: 'UY', prefix: '+598', flag: '🇺🇾' },
];
