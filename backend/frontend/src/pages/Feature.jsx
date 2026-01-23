import React from 'react';

const Features = () => {
  return (
    <div className="features p-8 bg-gray-100">
      <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Our Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {featureData.map((feature, index) => (
          <div
            key={index}
            className="feature-card bg-white shadow-lg p-8 rounded-lg text-center border border-green-600 transition-transform transform hover:-translate-y-2 min-h-[200px] flex flex-col justify-between"
          >
            <h3 className="text-2xl font-semibold mb-6 text-green-600">{feature.title}</h3>
            <p className="text-gray-700">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const featureData = [
  {
    title: 'Discover Amazing Features',
    description: 'From tracking your meals to calculating calories, our platform helps you achieve your health goals effectively. With user-friendly interfaces and seamless integration, stay on top of your nutrition with ease. Customize your experience to suit your unique needs and preferences!'
  },
  {
    title: 'Food Log',
    description: 'Users can easily log their daily meals and snacks to keep tracking. Whether you’re at home or dining out, effortlessly record your food intake with our extensive food database and barcode scanning feature. Keep a comprehensive diary of your eating habits and improve them over time.'
  },
  {
    title: 'Nutritional Information',
    description: 'Display basic nutritional information for logged foods. Gain insights into the nutrients you consume, such as vitamins, minerals, carbohydrates, and proteins. Make informed dietary choices with detailed breakdowns of each meal, helping you meet your nutritional goals and maintain a balanced diet.'
  },
  {
    title: 'Calorie Counter',
    description: 'Automatically calculate total calories consumed and keep you updated with the calorie count. Our smart algorithms ensure accuracy, so you can confidently manage your caloric intake. Stay within your desired calorie range with daily and weekly summaries, and adjust your eating habits to achieve your weight goals.'
  },
  {
    title: 'Progress Tracking',
    description: 'Simple charts to track weight and calorie intake over time. Visualize your journey with easy-to-read graphs and statistics. Track your progress, set achievable targets, and stay motivated by seeing your improvements. Celebrate your milestones and stay on the path to a healthier you.'
  },
  {
    title: 'Meal Plans',
    description: 'Basic templates for common diet types. Choose from a variety of diet plans, such as ketogenic, vegan, Mediterranean, and more. Each plan comes with pre-designed meal templates to help you get started quickly and ensure balanced nutrition. Customize the plans to suit your preferences and dietary requirements, making healthy eating simple and stress-free.'
  }
];


export default Features;
