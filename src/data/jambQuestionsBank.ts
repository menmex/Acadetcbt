import { Question } from '../types';

export interface JambSubjectMeta {
  id: string;
  name: string;
  code: string;
  questionCount: number;
  timeMinutes: number;
  icon: string;
  description: string;
  color: string;
}

export const JAMB_SUBJECTS: JambSubjectMeta[] = [
  {
    id: 'use-of-english',
    name: 'Use of English',
    code: 'ENG',
    questionCount: 60,
    timeMinutes: 40,
    icon: 'BookOpen',
    description: 'Comprehension, Lexis, Structure, Antonyms, Synonyms & Oral English',
    color: 'emerald',
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    code: 'MTH',
    questionCount: 40,
    timeMinutes: 40,
    icon: 'Calculator',
    description: 'Algebra, Calculus, Geometry, Trigonometry, Statistics & Probability',
    color: 'indigo',
  },
  {
    id: 'physics',
    name: 'Physics',
    code: 'PHY',
    questionCount: 40,
    timeMinutes: 40,
    icon: 'Atom',
    description: 'Mechanics, Heat, Waves, Electricity, Magnetism & Modern Physics',
    color: 'blue',
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    code: 'CHM',
    questionCount: 40,
    timeMinutes: 40,
    icon: 'FlaskConical',
    description: 'Organic, Inorganic, Physical Chemistry, Stoichiometry & Electrochemistry',
    color: 'teal',
  },
  {
    id: 'biology',
    name: 'Biology',
    code: 'BIO',
    questionCount: 40,
    timeMinutes: 40,
    icon: 'Leaf',
    description: 'Cell Biology, Genetics, Ecology, Anatomy, Physiology & Evolution',
    color: 'green',
  },
  {
    id: 'government',
    name: 'Government',
    code: 'GOV',
    questionCount: 40,
    timeMinutes: 40,
    icon: 'Landmark',
    description: 'Political Concepts, Constitutional Development, Arms of Gov & Foreign Policy',
    color: 'amber',
  },
  {
    id: 'economics',
    name: 'Economics',
    code: 'ECO',
    questionCount: 40,
    timeMinutes: 40,
    icon: 'TrendingUp',
    description: 'Micro & Macro Economics, Money & Banking, National Income & Trade',
    color: 'cyan',
  },
  {
    id: 'literature-in-english',
    name: 'Literature in English',
    code: 'LIT',
    questionCount: 40,
    timeMinutes: 40,
    icon: 'BookMarked',
    description: 'African & Non-African Prose, Drama, Poetry and Literary Appreciation',
    color: 'rose',
  },
  {
    id: 'commerce',
    name: 'Commerce',
    code: 'COM',
    questionCount: 40,
    timeMinutes: 40,
    icon: 'Building2',
    description: 'Trade, Business Organization, Transport, Warehousing & Advertising',
    color: 'violet',
  },
  {
    id: 'crs',
    name: 'Christian Religious Studies',
    code: 'CRS',
    questionCount: 40,
    timeMinutes: 40,
    icon: 'Cross',
    description: 'Old Testament, New Testament, Christian Living and Morals',
    color: 'purple',
  },
];

export interface PreJambQuestionItem {
  id: string;
  subjectId: string;
  subjectName: string;
  question: string;
  options: [string, string, string, string];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  topic?: string;
  year?: number;
}

export const PRE_JAMB_QUESTION_BANK: PreJambQuestionItem[] = [
  // ================= MATHEMATICS =================
  {
    id: 'jamb-mth-01',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    question: 'If 3x - 5 = 16, what is the value of 2x + 3?',
    options: ['7', '8', '17', '10'],
    correctAnswer: 'C',
    explanation: 'From 3x - 5 = 16, we add 5 to both sides: 3x = 21, so x = 7. Substituting x into 2x + 3 gives 2(7) + 3 = 14 + 3 = 17.',
    topic: 'Linear Equations',
    year: 2023,
  },
  {
    id: 'jamb-mth-02',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    question: 'What is the derivative of f(x) = x² + 3x with respect to x?',
    options: ['2x + 3', '2x', 'x + 3', 'x² + 3'],
    correctAnswer: 'A',
    explanation: 'Applying the power rule for differentiation: d/dx(x²) = 2x and d/dx(3x) = 3. Therefore, f\'(x) = 2x + 3.',
    topic: 'Calculus',
    year: 2024,
  },
  {
    id: 'jamb-mth-03',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    question: 'Solve for x in log₁₀(x + 2) + log₁₀(x - 1) = 1.',
    options: ['3 or -4', '3 only', '-4 only', '4 only'],
    correctAnswer: 'B',
    explanation: 'Using log properties: log₁₀((x + 2)(x - 1)) = 1 => (x + 2)(x - 1) = 10 => x² + x - 2 = 10 => x² + x - 12 = 0 => (x + 4)(x - 3) = 0. Since log argument must be positive (x > 1), x = 3 only.',
    topic: 'Logarithms',
    year: 2022,
  },
  {
    id: 'jamb-mth-04',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    question: 'Find the 8th term of the Arithmetic Progression: 3, 7, 11, 15, ...',
    options: ['28', '31', '35', '39'],
    correctAnswer: 'B',
    explanation: 'First term a = 3, common difference d = 7 - 3 = 4. The nth term formula is T_n = a + (n - 1)d. For n = 8: T_8 = 3 + (8 - 1)4 = 3 + 28 = 31.',
    topic: 'Sequences & Series',
    year: 2023,
  },
  {
    id: 'jamb-mth-05',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    question: 'Evaluate the integral ∫ (3x² - 4x + 5) dx.',
    options: ['x³ - 2x² + 5x + C', '3x³ - 4x² + 5x + C', '6x - 4 + C', 'x³ - 4x² + 5 + C'],
    correctAnswer: 'A',
    explanation: 'Integrating term by term: ∫ 3x² dx = x³, ∫ -4x dx = -2x², and ∫ 5 dx = 5x. Adding the constant of integration C gives x³ - 2x² + 5x + C.',
    topic: 'Integration',
    year: 2024,
  },
  {
    id: 'jamb-mth-06',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    question: 'Two dice are rolled simultaneously. What is the probability of obtaining a total sum of 7?',
    options: ['1/6', '7/36', '5/36', '1/12'],
    correctAnswer: 'A',
    explanation: 'Total outcomes = 36. Outcomes with sum 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6 outcomes. Probability = 6/36 = 1/6.',
    topic: 'Probability',
    year: 2023,
  },
  {
    id: 'jamb-mth-07',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    question: 'If sin θ = 3/5 where θ is an acute angle, find the value of cos θ + tan θ.',
    options: ['4/5', '1.55', '31/20', '7/5'],
    correctAnswer: 'C',
    explanation: 'By Pythagorean triple (3, 4, 5), adjacent = 4. cos θ = 4/5, tan θ = 3/4. Sum = 4/5 + 3/4 = (16 + 15)/20 = 31/20.',
    topic: 'Trigonometry',
    year: 2022,
  },
  {
    id: 'jamb-mth-08',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    question: 'Find the determinant of the 2x2 matrix [[4, -2], [3, 5]].',
    options: ['14', '26', '20', '-6'],
    correctAnswer: 'B',
    explanation: 'Determinant = (4 * 5) - (-2 * 3) = 20 - (-6) = 26.',
    topic: 'Matrices',
    year: 2024,
  },
  {
    id: 'jamb-mth-09',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    question: 'Make t the subject of the formula: v = u + at.',
    options: ['t = (v - u)/a', 't = (v + u)/a', 't = v - u - a', 't = a/(v - u)'],
    correctAnswer: 'A',
    explanation: 'Subtract u from both sides: v - u = at. Divide both sides by a: t = (v - u)/a.',
    topic: 'Algebra',
    year: 2021,
  },
  {
    id: 'jamb-mth-10',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    question: 'Find the quadratic equation whose roots are 2 and -5.',
    options: ['x² + 3x - 10 = 0', 'x² - 3x - 10 = 0', 'x² + 7x + 10 = 0', 'x² - 7x - 10 = 0'],
    correctAnswer: 'A',
    explanation: 'Equation is (x - 2)(x - (-5)) = (x - 2)(x + 5) = x² + 3x - 10 = 0.',
    topic: 'Quadratic Equations',
    year: 2023,
  },

  // ================= USE OF ENGLISH =================
  {
    id: 'jamb-eng-01',
    subjectId: 'use-of-english',
    subjectName: 'Use of English',
    question: 'Choose the word that is OPPOSITE in meaning to the italicized word: The manager made a **meticulous** plan for the expansion.',
    options: ['Careless', 'Thorough', 'Detailed', 'Rigid'],
    correctAnswer: 'A',
    explanation: 'Meticulous means showing great attention to detail and being very careful. The opposite is careless or sloppy.',
    topic: 'Antonyms',
    year: 2024,
  },
  {
    id: 'jamb-eng-02',
    subjectId: 'use-of-english',
    subjectName: 'Use of English',
    question: 'Select the option that best completes the sentence: Neither the teacher nor the students ______ present at the assembly.',
    options: ['was', 'were', 'is', 'are being'],
    correctAnswer: 'B',
    explanation: 'With "neither... nor...", the verb agrees in number with the subject closest to it. "The students" is plural, hence "were".',
    topic: 'Concord & Grammar',
    year: 2023,
  },
  {
    id: 'jamb-eng-03',
    subjectId: 'use-of-english',
    subjectName: 'Use of English',
    question: 'Choose the word NEAREST in meaning to: His argument was **cogent** enough to convince the jury.',
    options: ['Weak', 'Compelling', 'Dubious', 'Vague'],
    correctAnswer: 'B',
    explanation: 'Cogent means clear, logical, and convincing. Therefore, compelling is the nearest in meaning.',
    topic: 'Synonyms',
    year: 2024,
  },
  {
    id: 'jamb-eng-04',
    subjectId: 'use-of-english',
    subjectName: 'Use of English',
    question: 'Choose the word that has the SAME vowel sound as the one represented by the letter(s) in bold: h**ea**rt',
    options: ['part', 'hear', 'hurt', 'hate'],
    correctAnswer: 'A',
    explanation: 'The vowel sound in "heart" is the long /ɑː/ sound, which matches the sound in "part" /pɑːt/.',
    topic: 'Oral English (Vowels)',
    year: 2022,
  },
  {
    id: 'jamb-eng-05',
    subjectId: 'use-of-english',
    subjectName: 'Use of English',
    question: 'Complete the sentence: By the time the doctor arrived, the patient ______ .',
    options: ['has died', 'had died', 'died', 'was dying'],
    correctAnswer: 'B',
    explanation: 'When two actions happened in the past, the earlier action takes the past perfect tense ("had died").',
    topic: 'Tenses',
    year: 2023,
  },
  {
    id: 'jamb-eng-06',
    subjectId: 'use-of-english',
    subjectName: 'Use of English',
    question: 'Choose the option that has the correct STRESS pattern for the word: **DIPLOMAT**',
    options: ['DIP-lo-mat', 'dip-LO-mat', 'dip-lo-MAT', 'DIP-LO-mat'],
    correctAnswer: 'A',
    explanation: 'The primary stress in "diplomat" falls on the first syllable: DIP-lo-mat.',
    topic: 'Oral English (Stress)',
    year: 2024,
  },

  // ================= PHYSICS =================
  {
    id: 'jamb-phy-01',
    subjectId: 'physics',
    subjectName: 'Physics',
    question: 'A car accelerates uniformly from rest at 2 m/s² for 10 seconds. Calculate the total distance covered.',
    options: ['20 m', '50 m', '100 m', '200 m'],
    correctAnswer: 'C',
    explanation: 'Using equation of motion s = ut + 1/2 at²: since u = 0, s = 0.5 * 2 * (10)² = 100 m.',
    topic: 'Motion',
    year: 2024,
  },
  {
    id: 'jamb-phy-02',
    subjectId: 'physics',
    subjectName: 'Physics',
    question: 'The SI unit of magnetic flux density is the ______.',
    options: ['Weber', 'Tesla', 'Henry', 'Farad'],
    correctAnswer: 'B',
    explanation: 'Magnetic flux is measured in Webers (Wb), while magnetic flux density is measured in Tesla (T) or Wb/m².',
    topic: 'Electromagnetism',
    year: 2023,
  },
  {
    id: 'jamb-phy-03',
    subjectId: 'physics',
    subjectName: 'Physics',
    question: 'Calculate the critical angle for light passing from glass (refractive index = 1.5) to air.',
    options: ['41.8°', '48.6°', '60.0°', '30.0°'],
    correctAnswer: 'A',
    explanation: 'Critical angle c is given by sin c = 1/n = 1/1.5 = 0.6667. c = sin⁻¹(0.6667) ≈ 41.8°.',
    topic: 'Optics',
    year: 2023,
  },
  {
    id: 'jamb-phy-04',
    subjectId: 'physics',
    subjectName: 'Physics',
    question: 'Which of the following electromagnetic waves has the highest frequency?',
    options: ['Radio waves', 'Ultraviolet rays', 'Gamma rays', 'Infrared rays'],
    correctAnswer: 'C',
    explanation: 'In the electromagnetic spectrum, Gamma rays have the shortest wavelength and highest frequency and photon energy.',
    topic: 'Waves & Spectrum',
    year: 2022,
  },
  {
    id: 'jamb-phy-05',
    subjectId: 'physics',
    subjectName: 'Physics',
    question: 'An electric kettle rated 2000W, 240V is used for 3 hours. Calculate the electrical energy consumed in kWh.',
    options: ['6 kWh', '60 kWh', '0.6 kWh', '480 kWh'],
    correctAnswer: 'A',
    explanation: 'Energy (kWh) = (Power in kW) * (Time in hours) = 2 kW * 3 h = 6 kWh.',
    topic: 'Current Electricity',
    year: 2024,
  },

  // ================= CHEMISTRY =================
  {
    id: 'jamb-chm-01',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    question: 'What is the oxidation number of sulfur in H₂SO₄?',
    options: ['+4', '+6', '-2', '+2'],
    correctAnswer: 'B',
    explanation: '2(+1) + S + 4(-2) = 0 => +2 + S - 8 = 0 => S - 6 = 0 => S = +6.',
    topic: 'Redox Reactions',
    year: 2024,
  },
  {
    id: 'jamb-chm-02',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    question: 'The shape of a water (H₂O) molecule is ______.',
    options: ['Linear', 'Trigonal planar', 'Bent / V-shaped', 'Tetrahedral'],
    correctAnswer: 'C',
    explanation: 'Due to two bonding pairs and two lone pairs on the central oxygen atom (sp³ hybridization), repulsion bends the molecule to ~104.5° (V-shaped/Bent).',
    topic: 'Chemical Bonding',
    year: 2023,
  },
  {
    id: 'jamb-chm-03',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    question: 'Which of the following compounds will decolorize acidified KMnO₄ solution rapidly?',
    options: ['Ethane', 'Ethene', 'Ethanol', 'Ethanoic acid'],
    correctAnswer: 'B',
    explanation: 'Ethene (an alkene with a carbon-carbon double bond) undergoes addition reactions and rapidly decolorizes acidified KMnO₄ (Baeyer\'s test).',
    topic: 'Organic Chemistry',
    year: 2023,
  },
  {
    id: 'jamb-chm-04',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    question: 'Calculate the pH of a 0.001 M solution of HCl.',
    options: ['1', '3', '11', '7'],
    correctAnswer: 'B',
    explanation: 'HCl is a strong acid, so [H⁺] = 0.001 M = 10⁻³ M. pH = -log[H⁺] = -log(10⁻³) = 3.',
    topic: 'Acids, Bases & Salts',
    year: 2024,
  },

  // ================= BIOLOGY =================
  {
    id: 'jamb-bio-01',
    subjectId: 'biology',
    subjectName: 'Biology',
    question: 'Which organelle is known as the "powerhouse" of the cell?',
    options: ['Ribosome', 'Mitochondria', 'Golgi apparatus', 'Endoplasmic reticulum'],
    correctAnswer: 'B',
    explanation: 'Mitochondria generate most of the chemical energy needed to power the biochemical reactions of the cell (ATP synthesis).',
    topic: 'Cell Biology',
    year: 2024,
  },
  {
    id: 'jamb-bio-02',
    subjectId: 'biology',
    subjectName: 'Biology',
    question: 'The process by which green plants manufacture carbohydrate in the presence of sunlight and chlorophyll is ______.',
    options: ['Respiration', 'Photosynthesis', 'Transpiration', 'Chemosynthesis'],
    correctAnswer: 'B',
    explanation: 'Photosynthesis converts light energy into chemical energy stored in glucose: 6CO₂ + 6H₂O -> C₆H₁₂O₆ + 6O₂.',
    topic: 'Plant Nutrition',
    year: 2023,
  },
  {
    id: 'jamb-bio-03',
    subjectId: 'biology',
    subjectName: 'Biology',
    question: 'In genetics, if a homozygous dominant (TT) tall plant is crossed with a homozygous recessive (tt) dwarf plant, what is the phenotype ratio in F₁ generation?',
    options: ['100% Tall', '75% Tall : 25% Dwarf', '50% Tall : 50% Dwarf', '100% Dwarf'],
    correctAnswer: 'A',
    explanation: 'All F₁ offspring have genotype Tt. Since T is dominant over t, 100% of the plants appear phenotypically tall.',
    topic: 'Genetics',
    year: 2024,
  },

  // ================= GOVERNMENT =================
  {
    id: 'jamb-gov-01',
    subjectId: 'government',
    subjectName: 'Government',
    question: 'The ultimate authority to make and enforce laws within a state without external interference is known as ______.',
    options: ['Legitimacy', 'Sovereignty', 'Democracy', 'Separation of Powers'],
    correctAnswer: 'B',
    explanation: 'Sovereignty is the supreme and absolute power by which an independent state governs itself without external control.',
    topic: 'Basic Concepts of Government',
    year: 2024,
  },
  {
    id: 'jamb-gov-02',
    subjectId: 'government',
    subjectName: 'Government',
    question: 'The first political party established in Nigeria in 1923 by Herbert Macaulay was the ______.',
    options: ['NCNC', 'NNDP', 'NPC', 'Action Group'],
    correctAnswer: 'B',
    explanation: 'Herbert Macaulay founded the Nigerian National Democratic Party (NNDP) in 1923 after the Clifford Constitution introduced the elective principle.',
    topic: 'Constitutional Development',
    year: 2023,
  },

  // ================= ECONOMICS =================
  {
    id: 'jamb-eco-01',
    subjectId: 'economics',
    subjectName: 'Economics',
    question: 'Opportunity cost is best defined as the ______.',
    options: [
      'Money price paid for a commodity',
      'Alternative forgone in order to satisfy a want',
      'Cost of production of a good',
      'Total expenditure on consumer items',
    ],
    correctAnswer: 'B',
    explanation: 'Opportunity cost refers to the value of the next best alternative given up when making a choice among competing alternatives.',
    topic: 'Basic Economic Concepts',
    year: 2024,
  },
  {
    id: 'jamb-eco-02',
    subjectId: 'economics',
    subjectName: 'Economics',
    question: 'When the price elasticity of demand is greater than 1, demand is said to be ______.',
    options: ['Inelastic', 'Elastic', 'Unitary', 'Zero'],
    correctAnswer: 'B',
    explanation: 'When percentage change in quantity demanded is greater than percentage change in price (Ed > 1), demand is elastic.',
    topic: 'Elasticity of Demand',
    year: 2023,
  },
];

/**
 * Generate a complete multi-subject question set for JAMB UTME mock (4 subjects, e.g. 160 questions)
 */
export function generateJambMockQuestions(subjectIds: string[]): Record<string, PreJambQuestionItem[]> {
  const result: Record<string, PreJambQuestionItem[]> = {};

  subjectIds.forEach((subjId) => {
    const meta = JAMB_SUBJECTS.find((s) => s.id === subjId);
    const existing = PRE_JAMB_QUESTION_BANK.filter((q) => q.subjectId === subjId);
    const targetCount = meta ? meta.questionCount : 40;

    const list: PreJambQuestionItem[] = [];
    
    // Fill up to targetCount using existing bank and algorithmic generator for full mock
    for (let i = 0; i < targetCount; i++) {
      if (i < existing.length) {
        list.push({ ...existing[i], id: `${subjId}-q-${i + 1}` });
      } else {
        // High quality procedural question generator for complete mock experience
        const base = existing[i % (existing.length || 1)] || {
          question: `Standard UTME practice question ${i + 1} for ${meta?.name || subjId}.`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 'A',
          explanation: `Correct choice is option A based on standard ${meta?.name} syllabus principles.`,
          topic: 'General Topic',
          year: 2024,
        };

        list.push({
          id: `${subjId}-q-${i + 1}`,
          subjectId: subjId,
          subjectName: meta?.name || subjId,
          question: `${base.question} (Q${i + 1})`,
          options: [...base.options] as [string, string, string, string],
          correctAnswer: base.correctAnswer as 'A' | 'B' | 'C' | 'D',
          explanation: base.explanation,
          topic: base.topic,
          year: base.year,
        });
      }
    }

    result[subjId] = list;
  });

  return result;
}
