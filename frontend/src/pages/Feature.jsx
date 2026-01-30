import React from 'react';
import { 
  Utensils, 
  Flame, 
  TrendingUp, 
  CalendarDays, 
  FileText, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

const Features = () => {
  return (
    <section className="relative py-24 bg-gray-50 font-sans overflow-hidden">
      
      {/* Background Decorative Pattern (Subtle Dots) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#166534 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="text-sm font-bold tracking-wider text-green-600 uppercase bg-green-100 px-4 py-1.5 rounded-full">
            Why Choose Us
          </span>
          <h2 className="mt-6 text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-400">eat smarter</span>
          </h2>
          <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
            Powerful features designed to help you take control of your nutrition journey effortlessly.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureData.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {/* Hover Gradient Overlay */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${feature.gradient}`}></div>

              {/* Icon */}
              <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm`}>
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-700 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-500 leading-relaxed mb-6">
                {feature.description}
              </p>

              {/* Decorative 'Read More' Link */}
              <div className="flex items-center text-sm font-semibold text-green-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                Learn more <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Data Array
const featureData = [
  {
    title: 'Smart Features',
    description: 'From tracking your meals to calculating calories, our platform helps you achieve your health goals effectively with seamless integration.',
    icon: <Sparkles className="w-7 h-7 text-amber-500" />,
    bg: "bg-amber-50",
    gradient: "bg-gradient-to-br from-amber-400 to-orange-500"
  },
  {
    title: 'Easy Food Log',
    description: 'Effortlessly record your food intake with our extensive food database and barcode scanning feature. Keep a comprehensive diary anywhere.',
    icon: <Utensils className="w-7 h-7 text-blue-500" />,
    bg: "bg-blue-50",
    gradient: "bg-gradient-to-br from-blue-400 to-cyan-500"
  },
  {
    title: 'Nutritional Info',
    description: 'Gain insights into vitamins, minerals, and macros. Make informed dietary choices with detailed breakdowns of every meal.',
    icon: <FileText className="w-7 h-7 text-purple-500" />,
    bg: "bg-purple-50",
    gradient: "bg-gradient-to-br from-purple-400 to-pink-500"
  },
  {
    title: 'Calorie Counter',
    description: 'Our smart algorithms ensure accuracy so you can confidently manage your caloric intake and stay within your desired daily range.',
    icon: <Flame className="w-7 h-7 text-orange-500" />,
    bg: "bg-orange-50",
    gradient: "bg-gradient-to-br from-orange-400 to-red-500"
  },
  {
    title: 'Progress Tracking',
    description: 'Visualize your journey with easy-to-read graphs. Track weight changes, set achievable targets, and celebrate your milestones.',
    icon: <TrendingUp className="w-7 h-7 text-emerald-500" />,
    bg: "bg-emerald-50",
    gradient: "bg-gradient-to-br from-emerald-400 to-green-500"
  },
  {
    title: 'Custom Meal Plans',
    description: 'Choose from Keto, Vegan, Mediterranean, and more. Get pre-designed meal templates to jumpstart your healthy eating habits.',
    icon: <CalendarDays className="w-7 h-7 text-rose-500" />,
    bg: "bg-rose-50",
    gradient: "bg-gradient-to-br from-rose-400 to-red-500"
  }
];

export default Features;