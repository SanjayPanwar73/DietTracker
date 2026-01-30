import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Mail, Calendar, MapPin, Star } from "lucide-react";

const Specialists = () => {
  const navigate = useNavigate();

  const specialists = [
    {
      id: 1,
      name: "Rujuta Diwekar",
      role: "Celebrity Nutritionist",
      specialty: "Traditional Indian Diets & Weight Loss",
      phone: "+91 22 2605 9797",
      email: "mitahar@rujutadiwekar.com",
      location: "Mumbai, Maharashtra",
      rating: 4.9,
      image: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Rujuta_Diwekar.jpg" 
    },
    {
      id: 2,
      name: "Dr. Shikha Sharma",
      role: "Medical Nutritionist",
      specialty: "Ayurveda & Nutri-Genetics",
      phone: "+91 11 4666 6000",
      email: "ask@drshikha.com",
      location: "New Delhi, Delhi",
      rating: 4.8,
      image: "https://images.squarespace-cdn.com/content/v1/5e73683f80c65e23101901c6/1586246369528-7X8S8239Y01255554332/Dr-Shikha-Sharma.jpg"
    },
    {
      id: 3,
      name: "Luke Coutinho",
      role: "Holistic Lifestyle Coach",
      specialty: "Integrative Medicine & Cancer Care",
      phone: "1800 102 0253",
      email: "info@lukecoutinho.com",
      location: "Mumbai, Maharashtra",
      rating: 5.0,
      image: "https://pbs.twimg.com/profile_images/1364535384844390403/D_qGqD0Y_400x400.jpg"
    },
    {
      id: 4,
      name: "Dr. Anjali Hooda Sangwan",
      role: "Functional Medicine Specialist",
      specialty: "Obesity, Diabetes & Thyroid",
      phone: "+91 99900 88900",
      email: "doctoranjali@gmail.com",
      location: "New Delhi, Delhi",
      rating: 4.9,
      image: "https://pbs.twimg.com/profile_images/1118128387062407168/2x554443_400x400.jpg"
    },
    {
        id: 5,
        name: "Pooja Makhija",
        role: "Clinical Dietitian",
        specialty: "Weight Loss & Clinical Nutrition",
        phone: "+91 98201 44000",
        email: "pooja@poojamakhija.com",
        location: "Mumbai, Maharashtra",
        rating: 4.8,
        image: "https://in.bmscdn.com/iedb/artist/images/website/poster/large/pooja-makhija-1055866-19-09-2017-04-58-18.jpg"
    },
    {
        id: 6,
        name: "Ryan Fernando",
        role: "Sports Nutritionist",
        specialty: "Performance Nutrition",
        phone: "+91 97434 30000",
        email: "ryan@quanutrition.com",
        location: "Bengaluru, Karnataka",
        rating: 4.9,
        image: "https://pbs.twimg.com/profile_images/1544970404095496192/47444344_400x400.jpg"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto">
        
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expert Specialists</h1>
            <p className="text-gray-500 text-sm">Connect with India's top nutritionists and doctors.</p>
          </div>
        </div>

        {/* Specialists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialists.map((doc) => (
            <div key={doc.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
              
              {/* Profile Header */}
              <div className="flex items-center gap-4 mb-4">
                <img src={doc.image} alt={doc.name} className="w-16 h-16 rounded-full object-cover border-2 border-green-100" />
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{doc.name}</h3>
                  <p className="text-green-600 font-medium text-sm">{doc.role}</p>
                  <div className="flex items-center gap-1 text-yellow-500 text-xs mt-1">
                    <Star className="w-3 h-3 fill-current" /> {doc.rating}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 flex justify-center"><Calendar className="w-4 h-4 text-gray-400" /></div>
                    <span>{doc.specialty}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 flex justify-center"><MapPin className="w-4 h-4 text-gray-400" /></div>
                    <span>{doc.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 flex justify-center"><Phone className="w-4 h-4 text-gray-400" /></div>
                    <span>{doc.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 flex justify-center"><Mail className="w-4 h-4 text-gray-400" /></div>
                    <span className="truncate">{doc.email}</span>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={() => window.open(`tel:${doc.phone}`)}
                className="w-full bg-green-600 text-white py-2.5 rounded-xl font-medium hover:bg-green-700 transition"
              >
                Book Consultation
              </button>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Specialists;