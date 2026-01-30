import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Clock, Tag, ExternalLink } from "lucide-react";

const Videos = () => {
  const navigate = useNavigate();

  const videos = [
    { 
      id: "oFYjgraF_ds", 
      title: "Counting Macros 101: The Basics", 
      duration: "20 mins", 
      category: "Education", 
      color: "bg-blue-100",
      channel: "Lauren Drain"
    },
    { 
      id: "wfk62eNZiss", 
      title: "5 Minute Healthy Breakfast Recipes", 
      duration: "4 mins", 
      category: "Recipes", 
      color: "bg-green-100",
      channel: "The Domestic Geek" 
    },
    { 
      id: "dBnniua6-oM", 
      title: "Sugar: The Bitter Truth", 
      duration: "1 hr 29 mins", 
      category: "Science", 
      color: "bg-orange-100",
      channel: "UCTV" 
    },
    { 
      id: "9FBIaqr7TjQ", 
      title: "30 Min Full Body Strength (No Equipment)", 
      duration: "30 mins", 
      category: "Fitness", 
      color: "bg-purple-100",
      channel: "Juice & Toya" 
    },
    { 
      id: "nmIAfFzVW8A", 
      title: "Meditation Practice: Mindful Eating", 
      duration: "8 mins", 
      category: "Mindfulness", 
      color: "bg-indigo-100",
      channel: "LEAP Service" 
    },
    { 
      id: "visxjkAQpTU", 
      title: "Chef's Guide To Week Night Meal Prep", 
      duration: "14 mins", 
      category: "Lifestyle", 
      color: "bg-red-100",
      channel: "Andy Cooks" 
    },
  ];

  const handleVideoClick = (videoId) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Wellness Library</h1>
            <p className="text-gray-500 text-sm">Curated videos to support your health journey.</p>
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((vid) => (
            <div 
                key={vid.id} 
                onClick={() => handleVideoClick(vid.id)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group cursor-pointer hover:shadow-md transition flex flex-col h-full"
            >
                {/* Real YouTube Thumbnail */}
                <div className="relative aspect-video bg-gray-200">
                    <img 
                        src={`https://img.youtube.com/vi/${vid.id}/hqdefault.jpg`} 
                        alt={vid.title} 
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition">
                            <Play className="w-6 h-6 text-gray-900 ml-1" />
                        </div>
                    </div>
                    <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {vid.duration}
                    </span>
                </div>
                
                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-2">
                         <div className="flex items-center gap-2">
                            <Tag className="w-3 h-3 text-gray-400" />
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{vid.category}</span>
                         </div>
                         <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-green-500 transition" />
                    </div>
                    
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-green-600 transition leading-snug mb-1">
                        {vid.title}
                    </h3>
                    
                    <p className="text-sm text-gray-500 mt-auto pt-2">
                        by {vid.channel}
                    </p>
                </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Videos;