import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Rocket, ArrowRight, Sparkles } from 'lucide-react';

interface OnboardingAnswer {
  question: string;
  answer: string;
}

interface Question {
  id: string;
  question: string;
  options?: string[];
  type?: 'text';
  placeholder?: string;
}

const questions: Question[] = [
  {
    id: 'stage',
    question: 'What best describes where you\'re at right now?',
    options: [
      'Exploring my first business',
      'Already running something small',
      'Pivoting to a new idea or industry',
      'Just curious to see what\'s possible'
    ]
  },
  {
    id: 'motivation',
    question: 'Why do you want to start a business?',
    options: [
      'Financial freedom',
      'Impact and purpose',
      'Creativity and innovation',
      'Flexibility and lifestyle',
      'Legacy and long-term security'
    ]
  },
  {
    id: 'time_commitment',
    question: 'How much time can you commit each week?',
    options: [
      'Full-time',
      'Part-time / evenings',
      'A few hours here and there',
      'Not sure yet'
    ]
  },
  {
    id: 'strengths',
    question: 'What are your top strengths?',
    options: [
      'Leadership & people skills',
      'Hands-on / technical skills',
      'Communication & sales',
      'Creative & design thinking',
      'Problem solving & strategy'
    ]
  },
  {
    id: 'energizing_work',
    question: 'What kind of work energizes you?',
    options: [
      'Building or fixing things',
      'Working with people',
      'Solving problems',
      'Creating content or art',
      'Helping others'
    ]
  },
  {
    id: 'tech_savvy',
    question: 'How tech-savvy do you feel?',
    options: [
      'Very comfortable',
      'Somewhat comfortable',
      'I\'d like to learn',
      'Not my strength'
    ]
  },
  {
    id: 'budget',
    question: 'What\'s your startup budget range?',
    options: [
      '$0–$500',
      '$500–$2,000',
      '$2,000–$10,000',
      '$10,000+'
    ]
  },
  {
    id: 'build_preference',
    question: 'Would you rather build something…',
    options: [
      'Lean with low overhead',
      'Moderate investment for better returns',
      'Scalable and high-growth'
    ]
  },
  {
    id: 'lifestyle',
    question: 'What kind of lifestyle do you want your business to support?',
    options: [
      'Travel & freedom',
      'Family & stability',
      'Impact & purpose',
      'Creativity & expression'
    ]
  },
  {
    id: 'location',
    question: 'Where would you like to run your business?',
    options: [
      'Fully online',
      'Local / community-based',
      'A mix of both'
    ]
  },
  {
    id: 'industries',
    question: 'Which industries interest you most?',
    options: [
      'Health & wellness',
      'Pets & animals',
      'Food & hospitality',
      'Tech & AI',
      'Real estate & home improvement',
      'Fashion & beauty',
      'Nature & outdoors',
      'Education & coaching',
      'Humanitarian / nonprofit'
    ]
  },
  {
    id: 'surprise_me',
    question: 'Do you want Launch Pad to suggest creative ideas outside your interests?',
    options: [
      'Yes, surprise me',
      'No, stick close to my interests'
    ]
  },
  {
    id: 'risk_tolerance',
    question: 'How do you feel about risk?',
    options: [
      'I prefer to play it safe',
      'I\'m open to moderate risk',
      'I\'ll take bold risks for high reward'
    ]
  },
  {
    id: 'business_size',
    question: 'What size of business do you imagine running?',
    options: [
      'Solo / side hustle',
      'Small team (2–5 people)',
      'Larger company or franchise potential'
    ]
  },
  {
    id: 'launch_timeline',
    question: 'How soon would you like to launch?',
    options: [
      'Within 30 days',
      '1–3 months',
      '3–6 months',
      'Just exploring for now'
    ]
  },
  {
    id: 'passionate_problems',
    question: 'What problems are you passionate about solving?',
    type: 'text',
    placeholder: 'e.g., helping people manage their finances, making healthy food accessible, organizing busy families...'
  },
  {
    id: 'specific_skills',
    question: 'What specific skills or experience do you bring?',
    type: 'text',
    placeholder: 'e.g., 10 years in marketing, certified personal trainer, built 3 websites, fluent in Spanish...'
  },
  {
    id: 'ideal_customer',
    question: 'Who would you most enjoy serving or helping?',
    type: 'text',
    placeholder: 'e.g., busy parents, small business owners, college students, retirees, pet owners...'
  }
];

const encouragements = [
  'Nice choice!',
  'Got it!',
  'Perfect!',
  'Great!',
  'Awesome!',
  'Excellent!'
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [encouragementText, setEncouragementText] = useState('');
  const [saving, setSaving] = useState(false);
  const [direction, setDirection] = useState(1);
  const [textInput, setTextInput] = useState('');
  const [showOtherIndustry, setShowOtherIndustry] = useState(false);
  const [otherIndustryInput, setOtherIndustryInput] = useState('');

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const totalSteps = questions.length + 2;
  const progress = ((currentStep + 2) / totalSteps) * 100;

  useEffect(() => {
    if (currentUser) {
      loadSavedAnswers();
    }
  }, [currentUser]);

  const loadSavedAnswers = async () => {
    if (!currentUser) return;

    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('onboarding_answers, onboarding_completed')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (data?.onboarding_answers) {
        setAnswers(data.onboarding_answers);
      }
    } catch (err) {
      console.error('Failed to load saved answers:', err);
    }
  };

  const saveAnswersToDatabase = async (updatedAnswers: Record<string, string>) => {
    if (!currentUser) return;

    try {
      await supabase
        .from('user_profiles')
        .upsert({
          user_id: currentUser.id,
          onboarding_answers: updatedAnswers,
          updated_at: new Date().toISOString(),
        });
    } catch (err) {
      console.error('Failed to save answers:', err);
    }
  };

  const handleAnswer = (questionId: string, answer: string) => {
    const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    setEncouragementText(randomEncouragement);
    setShowEncouragement(true);

    const updatedAnswers = { ...answers, [questionId]: answer };
    setAnswers(updatedAnswers);
    saveAnswersToDatabase(updatedAnswers);

    setTimeout(() => {
      setShowEncouragement(false);
      setTimeout(() => {
        setDirection(1);
        setCurrentStep(prev => prev + 1);
        setTextInput('');
      }, 200);
    }, 600);
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) return;
    handleAnswer(questions[currentStep].id, textInput.trim());
  };

  const handleBack = () => {
    if (currentStep > -1) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
      setShowOtherIndustry(false);
      setOtherIndustryInput('');
    }
  };

  const handleStart = () => {
    setDirection(1);
    setCurrentStep(0);
  };

  const handleFinish = async () => {
    if (!currentUser) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: currentUser.id,
          onboarding_completed: true,
          onboarding_answers: answers,
          interests: answers.industries || 'General business',
          problems: answers.energizing_work || 'Problem solving',
          budget: answers.budget || '$0–$500',
          availability: answers.time_commitment || null,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Supabase error:', error);
        alert('Failed to save your answers. Please try again.');
        throw error;
      }

      navigate('/ideas');
    } catch (err: any) {
      console.error('Failed to save onboarding:', err);
    } finally {
      setSaving(false);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {currentStep >= -1 && (
        <div className="w-full bg-white shadow-sm">
          <div className="max-w-2xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors group"
                  title="Launch Pad"
                >
                  <Rocket className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>
                <span className="text-sm font-semibold text-gray-600">
                  {currentStep >= 0 ? `${currentStep + 1} of ${questions.length}` : 'Welcome'}
                </span>
              </div>
              <div className="flex gap-3">
                {currentStep > 0 && (
                  <button
                    onClick={handleBack}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    ← Back
                  </button>
                )}
                {currentUser && (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Profile
                  </button>
                )}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait" custom={direction}>
            {currentStep === -1 && (
              <motion.div
                key="welcome"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-3 mb-8">
                  <Rocket className="text-blue-600" size={48} />
                  <span className="text-4xl font-bold text-gray-900 font-['Montserrat']">Launch Pad</span>
                </div>

                <h1 className="text-5xl font-bold text-gray-900 mb-4">
                  Let's get to know you 👋
                </h1>

                <p className="text-xl text-gray-600 mb-12 max-w-lg mx-auto">
                  Answer a few quick questions so Launch Pad can match you with business ideas that actually fit you.
                </p>

                <button
                  onClick={handleStart}
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Let's Start
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </button>
              </motion.div>
            )}

            {currentStep >= 0 && currentStep < questions.length && (
              <motion.div
                key={`question-${currentStep}`}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="w-full"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center px-4">
                  {questions[currentStep].question}
                </h2>

                {questions[currentStep].type === 'text' ? (
                  <div className="space-y-4">
                    <motion.textarea
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder={questions[currentStep].placeholder}
                      className="w-full p-5 bg-white rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none resize-none min-h-[120px] transition-colors"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          handleTextSubmit();
                        }
                      }}
                    />
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      onClick={handleTextSubmit}
                      disabled={!textInput.trim() || showEncouragement}
                      className="w-full p-5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Continue
                    </motion.button>
                    <p className="text-center text-sm text-gray-500">
                      Press Ctrl+Enter to submit
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {questions[currentStep].options?.map((option, index) => (
                      <motion.button
                        key={option}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleAnswer(questions[currentStep].id, option)}
                        disabled={showEncouragement}
                        className="w-full p-5 bg-white rounded-xl text-left text-gray-900 font-medium border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {option}
                      </motion.button>
                    ))}

                    {questions[currentStep].id === 'industries' && (
                      <>
                        <motion.button
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: (questions[currentStep].options?.length || 0) * 0.05 }}
                          onClick={() => setShowOtherIndustry(true)}
                          disabled={showEncouragement || showOtherIndustry}
                          className="w-full p-5 bg-white rounded-xl text-left text-gray-900 font-medium border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Other (specify your own)
                        </motion.button>

                        {showOtherIndustry && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-3"
                          >
                            <input
                              type="text"
                              value={otherIndustryInput}
                              onChange={(e) => setOtherIndustryInput(e.target.value)}
                              placeholder="Enter your industry..."
                              className="w-full p-4 bg-white rounded-xl text-gray-900 border-2 border-blue-500 focus:border-blue-600 focus:outline-none"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && otherIndustryInput.trim()) {
                                  handleAnswer(questions[currentStep].id, otherIndustryInput.trim());
                                  setShowOtherIndustry(false);
                                  setOtherIndustryInput('');
                                }
                              }}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  if (otherIndustryInput.trim()) {
                                    handleAnswer(questions[currentStep].id, otherIndustryInput.trim());
                                    setShowOtherIndustry(false);
                                    setOtherIndustryInput('');
                                  }
                                }}
                                disabled={!otherIndustryInput.trim()}
                                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                Continue
                              </button>
                              <button
                                onClick={() => {
                                  setShowOtherIndustry(false);
                                  setOtherIndustryInput('');
                                }}
                                className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {currentStep >= 0 && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={handleBack}
                      className="text-gray-600 hover:text-gray-900 font-medium transition-colors inline-flex items-center gap-2"
                    >
                      ← Back to previous question
                    </button>
                  </div>
                )}

                <AnimatePresence>
                  {showEncouragement && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="mt-8 text-center"
                    >
                      <span className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-full font-semibold text-lg shadow-lg">
                        <Sparkles size={20} />
                        {encouragementText}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {currentStep === questions.length && (
              <motion.div
                key="final"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="text-center"
              >
                <div className="flex items-center justify-center mb-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="text-blue-600" size={64} />
                  </motion.div>
                </div>

                <h1 className="text-5xl font-bold text-gray-900 mb-4">
                  All set 🚀
                </h1>

                <p className="text-xl text-gray-600 mb-12 max-w-lg mx-auto">
                  Launch Pad is analyzing your responses to generate personalized business ideas tailored to your goals, lifestyle, and strengths.
                </p>

                <button
                  onClick={handleFinish}
                  disabled={saving}
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Generate My Business Ideas'}
                  {!saving && <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
