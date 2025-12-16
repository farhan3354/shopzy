import React, { useState } from 'react';
import { 
  FiCheck, 
  FiUsers, 
  FiTruck, 
  FiShield, 
  FiHeadphones, 
  FiGlobe,
  FiAward,
  FiPackage,
  FiShoppingBag,
  FiHeart,
  FiClock,
  FiStar,
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiTrendingUp,
  FiTarget,
  FiSmile
} from 'react-icons/fi';
import { HiFire, HiSparkles } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const About = () => {
  const [activeTeam, setActiveTeam] = useState(0);
  const [activeMilestone, setActiveMilestone] = useState(0);

  const teamMembers = [
    {
      id: 1,
      name: "Alex Johnson",
      role: "CEO & Founder",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&crop=face",
      description: "10+ years in e-commerce innovation",
      social: "@alexjohnson"
    },
    {
      id: 2,
      name: "Sarah Miller",
      role: "Head of Operations",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=500&h=500&fit=crop&crop=face",
      description: "Supply chain optimization expert",
      social: "@sarahmiller"
    },
    {
      id: 3,
      name: "David Chen",
      role: "Chief Technology Officer",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=500&fit=crop&crop=face",
      description: "Tech innovation leader & AI specialist",
      social: "@davidchen"
    },
    {
      id: 4,
      name: "Maria Garcia",
      role: "Customer Experience Director",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&h=500&fit=crop&crop=face",
      description: "Customer satisfaction champion",
      social: "@mariagarcia"
    }
  ];

  const milestones = [
    { 
      year: "2020", 
      title: "Company Founded", 
      description: "Launched with 5 passionate team members and 100 curated products",
      icon: "🚀",
      color: "from-blue-500 to-cyan-500"
    },
    { 
      year: "2021", 
      title: "100K Customers Milestone", 
      description: "Achieved 100,000 happy customers across 20 countries",
      icon: "👥",
      color: "from-purple-500 to-pink-500"
    },
    { 
      year: "2022", 
      title: "Mobile App Launch", 
      description: "Released award-winning mobile app with 500K+ downloads",
      icon: "📱",
      color: "from-green-500 to-emerald-500"
    },
    { 
      year: "2023", 
      title: "Global Expansion", 
      description: "Expanded operations to 50+ countries with local fulfillment centers",
      icon: "🌍",
      color: "from-orange-500 to-red-500"
    },
    { 
      year: "2024", 
      title: "Industry Recognition", 
      description: "Won 'Best E-commerce Platform 2024' at Digital Excellence Awards",
      icon: "🏆",
      color: "from-yellow-500 to-amber-500"
    }
  ];

  const features = [
    {
      icon: FiTruck,
      title: "Lightning Fast Delivery",
      description: "Same-day delivery in major cities",
      color: "from-blue-500 to-blue-600",
      gradient: "bg-gradient-to-r"
    },
    {
      icon: FiShield,
      title: "Military Grade Security",
      description: "256-bit SSL encryption on all transactions",
      color: "from-emerald-500 to-green-600",
      gradient: "bg-gradient-to-r"
    },
    {
      icon: FiHeadphones,
      title: "24/7 Premium Support",
      description: "Instant chat & call support always available",
      color: "from-purple-500 to-pink-600",
      gradient: "bg-gradient-to-r"
    },
    {
      icon: FiPackage,
      title: "Hassle-Free Returns",
      description: "30-day return policy, no questions asked",
      color: "from-amber-500 to-orange-600",
      gradient: "bg-gradient-to-r"
    },
  ];

  const stats = [
    { 
      number: "2M+", 
      label: "Happy Customers", 
      icon: "😊",
      gradient: "bg-gradient-to-br from-pink-500 to-rose-500"
    },
    { 
      number: "50K+", 
      label: "Premium Products", 
      icon: "🛍️",
      gradient: "bg-gradient-to-br from-blue-500 to-cyan-500"
    },
    { 
      number: "50+", 
      label: "Countries Served", 
      icon: "🌎",
      gradient: "bg-gradient-to-br from-emerald-500 to-green-500"
    },
    { 
      number: "99.7%", 
      label: "Satisfaction Rate", 
      icon: "⭐",
      gradient: "bg-gradient-to-br from-amber-500 to-orange-500"
    },
  ];

  const achievements = [
    { title: "Fastest Growing E-commerce", value: "#1", year: "2024" },
    { title: "Customer Service Excellence", value: "4.9/5", year: "2024" },
    { title: "Innovation Award", value: "3x Winner", year: "2023" },
    { title: "Sustainable Business", value: "Carbon Neutral", year: "2024" },
  ];

  const values = [
    {
      title: "Customer Obsession",
      description: "We start with the customer and work backwards",
      icon: <FiHeart className="w-6 h-6" />,
      color: "text-rose-500 bg-rose-50"
    },
    {
      title: "Innovation DNA",
      description: "Constantly pushing boundaries in e-commerce tech",
      icon: <FiTrendingUp className="w-6 h-6" />,
      color: "text-blue-500 bg-blue-50"
    },
    {
      title: "Transparency First",
      description: "Radical honesty in pricing and policies",
      icon: <FiTarget className="w-6 h-6" />,
      color: "text-emerald-500 bg-emerald-50"
    },
    {
      title: "Community Impact",
      description: "Building businesses, empowering communities",
      icon: <FiUsers className="w-6 h-6" />,
      color: "text-purple-500 bg-purple-50"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-blue-50">
      {/* Hero Section with Parallax Effect */}
      <section className="relative h-[70vh] min-h-[600px] overflow-hidden rounded-b-3xl">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&h=1080&fit=crop&auto=format"
            alt="About Hero"
            className="w-full h-full object-cover transform scale-105 animate-zoom-pulse"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
        
        {/* Animated Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 7}s`
              }}
            />
          ))}
        </div>

        <div className="absolute inset-0 z-20 flex items-center">
          <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#BE386E] to-[#8F2B53] backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6 animate-fade-in-up">
                <HiSparkles className="w-4 h-4" />
                Since 2020 • Trusted by Millions
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                We're <span className="bg-gradient-to-r from-[#BE386E] via-[#FF6B9D] to-[#8F2B53] bg-clip-text text-transparent">Reimagining</span> E-commerce
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-lg animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                Where innovation meets convenience, creating unforgettable shopping experiences.
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                <Link
                  to="/products"
                  className="group relative overflow-hidden bg-gradient-to-r from-[#BE386E] to-[#8F2B53] text-white px-8 py-4 rounded-full font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <span className="relative z-10 flex items-center">
                    <FiShoppingBag className="mr-3" />
                    Start Shopping
                    <FiArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B9D] to-[#BE386E] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
                <Link
                  to="/register"
                  className="group relative overflow-hidden bg-white/10 backdrop-blur-md border-2 border-white/30 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/20 hover:border-white/50 transition-all duration-300"
                >
                  Join Our Community
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2" />
          </div>
        </div>
      </section>

      {/* Floating Stats */}
      <div className="relative -mt-16 mb-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="relative group bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full flex items-center justify-center text-2xl opacity-20 group-hover:opacity-30 transition-opacity">
                  {stat.icon}
                </div>
                <div className={`w-16 h-16 ${stat.gradient} rounded-2xl flex items-center justify-center text-3xl mb-4 transform group-hover:scale-110 transition-transform duration-300`}>
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Our Story */}
      <section className="py-16 md:py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/50 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-[#BE386E] font-semibold mb-4">
                <div className="w-2 h-2 bg-[#BE386E] rounded-full" />
                OUR JOURNEY
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                From <span className="text-[#BE386E]">Dream</span> to <span className="text-[#8F2B53]">Reality</span>
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                What started as a passion project in 2020 has blossomed into one of the fastest-growing e-commerce platforms globally. Our journey began with a simple vision: to create a shopping experience that feels personal, effortless, and joyful.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Today, we serve millions of customers across the globe, but our core philosophy remains unchanged: quality products, exceptional service, and genuine relationships.
              </p>
              
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div>
                      <div className="font-semibold text-gray-900">{achievement.title}</div>
                      <div className="text-sm text-gray-500">{achievement.year}</div>
                    </div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-[#BE386E] to-[#8F2B53] bg-clip-text text-transparent">
                      {achievement.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop&auto=format"
                  alt="Our Office" 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              
              {/* Floating Awards */}
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-2xl">
                <div className="flex items-center gap-4">
                  <FiAward className="w-12 h-12 text-amber-500" />
                  <div>
                    <h3 className="font-bold text-lg">Best E-commerce 2024</h3>
                    <p className="text-gray-600 text-sm">Digital Excellence Awards</p>
                  </div>
                </div>
              </div>
              
              {/* Floating Stats Card */}
              <div className="absolute -top-6 -left-6 bg-gradient-to-br from-blue-500 to-cyan-500 text-white p-6 rounded-2xl shadow-2xl">
                <div className="text-center">
                  <div className="text-3xl font-bold">99.7%</div>
                  <div className="text-sm opacity-90">Customer Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-[#BE386E] font-semibold mb-4">
              <HiSparkles className="w-4 h-4" />
              WHY CHOOSE US
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              The <span className="bg-gradient-to-r from-[#BE386E] to-[#8F2B53] bg-clip-text text-transparent">ShopNex</span> Difference
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We go beyond transactions to create meaningful shopping experiences
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className={`absolute -right-6 -top-6 w-24 h-24 ${feature.gradient} ${feature.color} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
                  
                  <div className={`w-16 h-16 ${feature.gradient} ${feature.color} rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 relative z-10`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 relative z-10">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 relative z-10">
                    {feature.description}
                  </p>
                  
                  <div className="mt-6 pt-6 border-t border-gray-100 group-hover:border-gray-200 transition-colors relative z-10">
                    <div className="w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-[#BE386E] to-[#8F2B53] transition-all duration-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" />
        <div className="max-w-6xl mx-auto px-4 relative">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Mission Card */}
            <div className="group bg-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="relative overflow-hidden rounded-2xl mb-8">
                <img 
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop&auto=format"
                  alt="Our Mission"
                  className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white">
                    <FiTarget className="w-4 h-4" />
                    <span className="font-semibold">Our Mission</span>
                  </div>
                </div>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">
                Creating <span className="text-blue-600">Unforgettable</span> Experiences
              </h3>
              <p className="text-gray-600 mb-6">
                To revolutionize online shopping by combining cutting-edge technology with human-centered design, making every interaction delightful and every purchase meaningful.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiCheck className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700">Personalized shopping journeys</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiCheck className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700">AI-powered recommendations</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiCheck className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700">Seamless cross-platform experience</span>
                </div>
              </div>
            </div>
            
            {/* Vision Card */}
            <div className="group bg-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="relative overflow-hidden rounded-2xl mb-8">
                <img 
                  src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop&auto=format"
                  alt="Our Vision"
                  className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white">
                    <FiGlobe className="w-4 h-4" />
                    <span className="font-semibold">Our Vision</span>
                  </div>
                </div>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">
                Shaping the <span className="text-emerald-600">Future</span> of Commerce
              </h3>
              <p className="text-gray-600 mb-6">
                To build the world's most trusted and innovative commerce ecosystem where technology empowers both buyers and sellers, creating sustainable value for all stakeholders.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <FiCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-gray-700">Global marketplace with local soul</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <FiCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-gray-700">Sustainable supply chains</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <FiCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-gray-700">Community-driven innovation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-[#BE386E] font-semibold mb-4">
              <FiUsers className="w-4 h-4" />
              MEET THE VISIONARIES
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              The <span className="bg-gradient-to-r from-[#BE386E] to-[#8F2B53] bg-clip-text text-transparent">Hearts</span> Behind Our Success
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Passionate innovators dedicated to transforming your shopping experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div 
                key={member.id} 
                className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                onMouseEnter={() => setActiveTeam(index)}
              >
                {/* Card Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Member Image */}
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Social Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white">
                      {member.social}
                    </div>
                  </div>
                </div>
                
                {/* Member Info */}
                <div className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                      <p className="text-[#BE386E] font-semibold">{member.role}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-[#BE386E] to-[#8F2B53] rounded-xl flex items-center justify-center text-white text-xl">
                      {member.name.charAt(0)}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{member.description}</p>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FiStar className="w-4 h-4 text-amber-500" />
                      <span>Industry Expert</span>
                    </div>
                  </div>
                </div>
                
                {/* Hover Effect Line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#BE386E] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-[#FF6B9D] font-semibold mb-4">
              <FiClock className="w-4 h-4" />
              OUR MILESTONES
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Journey Through <span className="bg-gradient-to-r from-[#FF6B9D] to-[#BE386E] bg-clip-text text-transparent">Time</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Marking significant moments in our growth story
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-[#BE386E] via-[#FF6B9D] to-[#BE386E]" />
            
            {/* Milestones */}
            <div className="space-y-12 md:space-y-0">
              {milestones.map((milestone, index) => (
                <div 
                  key={index}
                  className={`relative group md:flex md:items-center md:justify-between ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                  onMouseEnter={() => setActiveMilestone(index)}
                >
                  {/* Content */}
                  <div className={`md:w-5/12 ${
                    index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'
                  }`}>
                    <div className={`bg-gradient-to-br ${milestone.color} p-1 rounded-2xl inline-block mb-4 transform group-hover:scale-110 transition-transform duration-300`}>
                      <div className="text-3xl bg-gray-900 rounded-xl p-4">
                        {milestone.icon}
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 hover:border-gray-600 transition-colors duration-300">
                      <div className="text-3xl font-bold text-white mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-bold mb-3">{milestone.title}</h3>
                      <p className="text-gray-300">{milestone.description}</p>
                    </div>
                  </div>
                  
                  {/* Timeline Dot */}
                  <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2">
                    <div className="w-6 h-6 bg-[#BE386E] rounded-full border-4 border-gray-900 shadow-lg group-hover:scale-125 transition-transform duration-300" />
                  </div>
                  
                  {/* Year Display on Right Side */}
                  <div className={`md:w-5/12 ${index % 2 === 0 ? 'md:pl-12' : 'md:pr-12'}`}>
                    <div className="hidden md:block">
                      <div className="text-6xl font-bold opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                        {milestone.year}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-[#BE386E] font-semibold mb-4">
              <FiHeart className="w-4 h-4" />
              OUR CORE VALUES
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              What <span className="bg-gradient-to-r from-[#BE386E] to-[#8F2B53] bg-clip-text text-transparent">Drives</span> Us
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide every decision we make
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${value.color.split(' ')[1]}`}>
                  <div className={value.color.split(' ')[0]}>
                    {value.icon}
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
                
                <div className="mt-4 pt-4 border-t border-gray-100 group-hover:border-gray-200 transition-colors">
                  <div className="w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-[#BE386E] to-[#8F2B53] transition-all duration-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&h=600&fit=crop&auto=format"
            alt="Join Community"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#BE386E]/90 via-[#8F2B53]/90 to-[#BE386E]/90" />
        </div>
        
        {/* Animated Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <HiSparkles className="w-12 h-12 text-white mx-auto mb-6 animate-spin-slow" />
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to Experience the <span className="text-amber-300">Future</span> of Shopping?
          </h2>
          
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join over 2 million satisfied customers who have transformed their shopping experience with ShopNex.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="group bg-white text-[#BE386E] px-10 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 transform hover:-translate-y-1"
            >
              <span className="flex items-center justify-center">
                Start Free Trial
                <FiArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
              </span>
            </Link>
            
            <Link
              to="/products"
              className="group bg-transparent border-2 border-white text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all duration-300"
            >
              <span className="flex items-center justify-center">
                Browse Products
                <FiShoppingBag className="ml-2" />
              </span>
            </Link>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/20">
            <div className="flex flex-wrap justify-center gap-8 text-white/80">
              <div className="text-center">
                <div className="text-2xl font-bold">30-day</div>
                <div className="text-sm">Money Back Guarantee</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm">Premium Support</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">SSL</div>
                <div className="text-sm">Secure Encryption</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add custom animations to global CSS */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes zoom-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-zoom-pulse {
          animation: zoom-pulse 20s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default About;