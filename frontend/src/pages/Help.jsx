import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Mail, ChevronDown, ChevronUp, Stethoscope, Video, 
  ArrowRight, Phone, HeartHandshake 
} from "lucide-react";

const Help = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const navigate = useNavigate();

  // SECURITY CHECK
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    { question: "How do I reset my calorie goal?", answer: "Go to the 'Profile' page. You can recalculate your BMR and set a new target there." },
    { question: "How do I delete a food entry?", answer: "Navigate to 'Food Log', find the meal, and click the trash icon." },
    { question: "Is the meal planner AI-powered?", answer: "Yes! It generates recipes based on your specific dietary needs." },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        
        {/* PAGE HEADER */}
        <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900">Support & Resources</h1>
            <p className="text-gray-500 mt-1">Access professional help and learning materials.</p>
        </div>

        {/* --- MAIN NAVIGATION CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            
            {/* 1. Specialist Card (Click to go to /specialists) */}
            <div 
                onClick={() => navigate('/specialists')}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md transition cursor-pointer group relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                    <Stethoscope className="w-24 h-24 text-green-600" />
                </div>
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                        <Stethoscope className="w-6 h-6 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Find a Specialist</h2>
                    <p className="text-gray-500 mb-6 max-w-sm">
                        Browse our directory of certified nutritionists, dietitians, and doctors to get personalized advice.
                    </p>
                    <span className="inline-flex items-center gap-2 font-bold text-green-600 group-hover:gap-3 transition-all">
                        View Directory <ArrowRight className="w-5 h-5" />
                    </span>
                </div>
            </div>

            {/* 2. Video Library Card (Click to go to /videos) */}
            <div 
                onClick={() => navigate('/videos')}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition cursor-pointer group relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                    <Video className="w-24 h-24 text-blue-600" />
                </div>
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                        <Video className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Wellness Library</h2>
                    <p className="text-gray-500 mb-6 max-w-sm">
                        Watch expert-curated videos on nutrition science, healthy recipes, and mental wellness.
                    </p>
                    <span className="inline-flex items-center gap-2 font-bold text-blue-600 group-hover:gap-3 transition-all">
                        Watch Videos <ArrowRight className="w-5 h-5" />
                    </span>
                </div>
            </div>

        </div>

        {/* EMERGENCY SUPPORT SECTION */}
        <div className="mb-12 bg-red-50 rounded-2xl p-6 border border-red-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 rounded-full text-red-600">
                    <HeartHandshake className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-red-900">Need immediate support?</h3>
                    <p className="text-red-700 text-sm mt-1 max-w-xl">
                        Confidential support for eating disorders and mental health is available 24/7.
                    </p>
                </div>
            </div>
            <button className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-red-700 transition whitespace-nowrap">
                <Phone className="w-5 h-5" /> Get Help Now
            </button>
        </div>

        {/* FAQ & CONTACT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* FAQ */}
            <div className="lg:col-span-2 space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Common Questions</h2>
                {faqs.map((faq, index) => (
                    <div key={index} className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden ${openFaq === index ? 'border-green-500 shadow-md' : 'border-gray-200'}`}>
                        <button onClick={() => toggleFaq(index)} className="w-full flex justify-between items-center p-5 text-left focus:outline-none hover:bg-gray-50">
                            <span className="font-semibold text-gray-800">{faq.question}</span>
                            {openFaq === index ? <ChevronUp className="w-5 h-5 text-green-500" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                        </button>
                        <div className={`px-5 text-gray-500 text-sm leading-relaxed transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
                            {faq.answer}
                        </div>
                    </div>
                ))}
            </div>

            {/* CONTACT FORM */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-green-600" /> App Support
                </h2>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject</label>
                        <select className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500">
                            <option>Technical Issue</option>
                            <option>Account Help</option>
                            <option>Feedback</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Message</label>
                        <textarea rows="3" className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500" placeholder="Describe your issue..."></textarea>
                    </div>
                    <button className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-black transition">Send Message</button>
                </form>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Help;