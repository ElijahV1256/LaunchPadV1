import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Rocket } from "lucide-react";

export default function StoryBrandWizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ideaKey = searchParams.get('ideaKey');

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    customerWant: "",
    problem: "",
    solution: "",
    brandPromise: "",
    cta: "",
    primaryColor: "#2979FF",
    accentColor: "#06D6A0",
    imageUrl: ""
  });

  const steps = [
    {
      question: "What does your ideal customer WANT?",
      field: "customerWant",
      placeholder: "e.g., Save time, make more money, feel confident..."
    },
    {
      question: "What problem do they face?",
      field: "problem",
      placeholder: "e.g., They're overwhelmed, losing customers, spending too much..."
    },
    {
      question: "How does your business solve this?",
      field: "solution",
      placeholder: "e.g., We provide simple tools, expert guidance, automated systems..."
    },
    {
      question: "What transformation do you create?",
      field: "brandPromise",
      placeholder: "e.g., They become successful, confident, profitable..."
    },
    {
      question: "What is your call to action?",
      field: "cta",
      placeholder: "e.g., Get Started Today, Schedule a Call, Try it Free..."
    },
    {
      question: "Choose your brand colors",
      field: "colors",
      placeholder: ""
    }
  ];

  const handleNext = () => {
    const currentField = steps[currentStep].field;

    if (currentField === "colors") {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
      return;
    }

    if (!formData[currentField]?.trim()) {
      alert("Please answer the question before continuing");
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("storyBrandFlyerData", JSON.stringify(formData));

    if (ideaKey) {
      navigate(`/nano-generator?ideaKey=${ideaKey}`);
    } else {
      navigate('/nano-generator');
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const rocketBottomPosition = -10 + currentStep * 18;
  const rocketScale = 1 + currentStep * 0.15;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f1e] relative overflow-hidden">
      {/* Space Launch Bar */}
      <div className="absolute left-0 top-0 bottom-0 w-48 bg-gradient-to-b from-[#0a0a15] via-[#1a1a3e] to-[#0a0a15] border-r border-white/10">
        {/* Stars */}
        <div className="absolute top-[10%] left-[30%] w-1 h-1 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-[25%] left-[60%] w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-[40%] left-[20%] w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-[55%] left-[70%] w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-[70%] left-[40%] w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[85%] left-[50%] w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.7s' }}></div>
      </div>

      {/* Rocket Animation - Launches from bottom to top with increasing boost */}
      <div
        className="absolute left-1/2 -translate-x-1/2 transition-all duration-700 ease-out z-20"
        style={{
          bottom: `${rocketBottomPosition}%`,
          transform: `translateX(-50%) scale(${rocketScale})`,
          left: '96px'
        }}
      >
        <Rocket size={80} className="text-[#06D6A0] animate-pulse transform -rotate-45" />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 relative z-10 ml-48">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">
            StoryBrand Launch Sequence
          </h1>
          <p className="text-gray-400 text-lg">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-3 mb-12">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? "bg-[#06D6A0] scale-125"
                  : index < currentStep
                  ? "bg-[#2979FF]"
                  : "bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* Question Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 mb-8 min-h-[400px] flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            {steps[currentStep].question}
          </h2>

          {steps[currentStep].field === "colors" ? (
            <div className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-3 text-lg">
                  Primary Color
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                    className="w-24 h-24 rounded-lg cursor-pointer border-2 border-white/20"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#06D6A0] transition-colors"
                    placeholder="#2979FF"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-semibold mb-3 text-lg">
                  Accent Color
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={formData.accentColor}
                    onChange={(e) => handleChange("accentColor", e.target.value)}
                    className="w-24 h-24 rounded-lg cursor-pointer border-2 border-white/20"
                  />
                  <input
                    type="text"
                    value={formData.accentColor}
                    onChange={(e) => handleChange("accentColor", e.target.value)}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#06D6A0] transition-colors"
                    placeholder="#06D6A0"
                  />
                </div>
              </div>
            </div>
          ) : (
            <textarea
              value={formData[steps[currentStep].field]}
              onChange={(e) => handleChange(steps[currentStep].field, e.target.value)}
              placeholder={steps[currentStep].placeholder}
              rows={6}
              className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-lg text-white text-lg placeholder-gray-500 focus:outline-none focus:border-[#06D6A0] transition-colors resize-none"
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <button
            onClick={handleNext}
            className="px-8 py-3 bg-gradient-to-r from-[#2979FF] to-[#06D6A0] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            {currentStep === steps.length - 1 ? "Launch!" : "Next"}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
