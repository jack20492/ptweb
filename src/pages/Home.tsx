import React, { useState, useRef } from "react";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import {
  Star,
  Play,
  Phone,
  MessageCircle,
  Mail,
  Facebook,
  ArrowRight,
  Dumbbell,
  Target,
  Users,
  Award,
} from "lucide-react";
import Login from "../components/Login";

const Home: React.FC = () => {
  const { testimonials, videos, contactInfo, homeContent } = useData();
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const contactRef = useRef<HTMLElement>(null);

  const scrollToContact = () => {
    if (contactRef.current) {
      contactRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-fitness-black via-gray-900 to-fitness-red text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        {homeContent.heroImage && (
          <div className="absolute inset-0">
            <img
              src={homeContent.heroImage}
              alt="Hero background"
              className="w-full h-full object-cover opacity-30"
            />
          </div>
        )}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-40 h-40 sm:w-72 sm:h-72 bg-fitness-red rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-20 right-10 w-40 h-40 sm:w-72 sm:h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-40 h-40 sm:w-72 sm:h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
          <div className="text-center">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-full p-3 sm:p-4 border border-white border-opacity-20">
                <Dumbbell className="h-10 w-10 sm:h-12 sm:w-12 text-fitness-gold" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {homeContent.heroTitle}
            </h1>

            <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 lg:mb-10 text-gray-200 max-w-3xl mx-auto leading-relaxed px-2 sm:px-4">
              {homeContent.heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              {!user && (
                <button
                  onClick={() => setShowLogin(true)}
                  className="group bg-gradient-to-r from-fitness-gold to-yellow-500 hover:from-yellow-500 hover:to-fitness-gold text-fitness-black font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center space-x-2 w-full sm:w-auto"
                >
                  <span>Đăng nhập ngay</span>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
              <button
                onClick={scrollToContact}
                className="group bg-gradient-to-r from-fitness-red to-red-600 hover:from-red-600 hover:to-fitness-red text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center space-x-2 w-full sm:w-auto"
              >
                <span>Liên hệ ngay</span>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex flex-wrap justify-center items-center space-x-4 sm:space-x-6 text-xs sm:text-sm mt-4 sm:mt-0">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-fitness-gold" />
                  <span>100+ Học viên</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 text-fitness-gold" />
                  <span>5+ Năm kinh nghiệm</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16 lg:h-24 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Stats Section */}
        <section className="mb-16 sm:mb-20 lg:mb-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[
              { icon: Users, number: "100+", label: "Học viên đã tập" },
              { icon: Target, number: "95%", label: "Đạt mục tiêu" },
              { icon: Award, number: "5+", label: "Năm kinh nghiệm" },
              { icon: Dumbbell, number: "1000+", label: "Buổi tập hoàn thành" },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 text-center transform hover:scale-105 transition-all duration-300 border-t-4 border-fitness-red"
              >
                <div className="bg-gradient-to-br from-fitness-red to-red-600 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-fitness-black mb-1 sm:mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium text-xs sm:text-sm lg:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* About Section */}
        <section className="mb-16 sm:mb-20 lg:mb-24">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-fitness-black mb-4 sm:mb-6">
              Về PT Phi Nguyễn
            </h2>
            <div className="w-24 sm:w-32 h-2 bg-gradient-to-r from-fitness-red to-red-600 mx-auto mb-6 sm:mb-8 rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed">
                {homeContent.aboutText}
              </p>
            </div>
            {homeContent.aboutImage && (
              <div className="order-first md:order-last">
                <img
                  src={homeContent.aboutImage}
                  alt="About PT Phi Nguyen"
                  className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-2xl shadow-xl"
                />
              </div>
            )}
          </div>
        </section>

        {/* Services Section */}
        <section className="mb-16 sm:mb-20 lg:mb-24">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-fitness-black mb-4 sm:mb-6">
              {homeContent.servicesTitle}
            </h2>
            <div className="w-24 sm:w-32 h-2 bg-gradient-to-r from-fitness-red to-red-600 mx-auto mb-6 sm:mb-8 rounded-full"></div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {homeContent.services.map((service, index) => (
              <div
                key={index}
                className="group bg-white p-6 sm:p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border-l-4 border-fitness-red relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-fitness-red to-red-600 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
                <div className="relative">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-br from-fitness-red to-red-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold text-lg sm:text-2xl">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-gray-700 text-center font-medium text-sm sm:text-base lg:text-lg leading-relaxed">
                    {service}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        {testimonials.length > 0 && (
          <section className="mb-16 sm:mb-20 lg:mb-24">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-fitness-black mb-4 sm:mb-6">
                Phản hồi từ học viên
              </h2>
              <div className="w-24 sm:w-32 h-2 bg-gradient-to-r from-fitness-red to-red-600 mx-auto mb-6 sm:mb-8 rounded-full"></div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-white p-6 sm:p-8 lg:p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-fitness-red to-red-600"></div>

                  <div className="flex items-center mb-4 sm:mb-6">
                    {testimonial.avatar ? (
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mr-3 sm:mr-4 object-cover border-4 border-gray-100"
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-fitness-red to-red-600 rounded-full flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
                        <span className="text-white font-bold text-lg sm:text-xl">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-fitness-black text-base sm:text-lg">
                        {testimonial.name}
                      </h4>
                      <div className="flex items-center">
                        {Array.from({ length: testimonial.rating }).map(
                          (_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-current"
                            />
                          )
                        )}
                        <span className="ml-2 text-xs sm:text-sm text-gray-500">
                          ({testimonial.rating}/5)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
                    <p className="text-gray-700 italic leading-relaxed text-sm sm:text-base lg:text-lg">
                      "{testimonial.content}"
                    </p>
                  </div>

                  {(testimonial.beforeImage || testimonial.afterImage) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      {testimonial.beforeImage && (
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                            📸 Trước
                          </p>
                          <img
                            src={testimonial.beforeImage}
                            alt="Before"
                            className="w-full h-32 sm:h-40 object-cover rounded-xl border-2 border-gray-200"
                          />
                        </div>
                      )}
                      {testimonial.afterImage && (
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                            ✨ Sau
                          </p>
                          <img
                            src={testimonial.afterImage}
                            alt="After"
                            className="w-full h-32 sm:h-40 object-cover rounded-xl border-2 border-gray-200"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Videos Section */}
        {videos.length > 0 && (
          <section className="mb-16 sm:mb-20 lg:mb-24">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-fitness-black mb-4 sm:mb-6">
                Video hướng dẫn
              </h2>
              <div className="w-24 sm:w-32 h-2 bg-gradient-to-r from-fitness-red to-red-600 mx-auto mb-6 sm:mb-8 rounded-full"></div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 group"
                >
                  <div className="relative aspect-video bg-gray-200 overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.youtubeId}`}
                      title={video.title}
                      className="absolute inset-0 w-full h-full group-hover:scale-105 transition-transform duration-500"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <span className="bg-gradient-to-r from-fitness-red to-red-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                        {video.category}
                      </span>
                      <Play className="h-4 w-4 sm:h-5 sm:w-5 text-fitness-red" />
                    </div>
                    <h3 className="font-bold text-fitness-black mb-2 sm:mb-3 text-base sm:text-lg lg:text-xl line-clamp-2 group-hover:text-fitness-red transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-3 leading-relaxed text-sm sm:text-base">
                      {video.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact Section */}
        <section
          ref={contactRef}
          className="bg-gradient-to-br from-fitness-black via-gray-900 to-fitness-red text-white rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute top-10 right-10 w-32 sm:w-40 h-32 sm:h-40 bg-fitness-gold rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
          <div className="absolute bottom-10 left-10 w-32 sm:w-40 h-32 sm:h-40 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>

          <div className="relative text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              Liên hệ với tôi
            </h2>
            <div className="w-24 sm:w-32 h-2 bg-fitness-gold mx-auto mb-6 sm:mb-8 rounded-full"></div>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-200">
              Sẵn sàng bắt đầu hành trình fitness của bạn? Liên hệ ngay!
            </p>
          </div>

          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[
              {
                icon: Phone,
                label: "Điện thoại",
                value: contactInfo.phone,
                href: `tel:${contactInfo.phone}`,
                color: "from-green-500 to-green-600",
              },
              {
                icon: Facebook,
                label: "Facebook",
                value: "Nhắn tin",
                href: contactInfo.facebook,
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: MessageCircle,
                label: "Zalo",
                value: "Chat trực tiếp",
                href: contactInfo.zalo,
                color: "from-blue-400 to-blue-500",
              },
              {
                icon: Mail,
                label: "Email",
                value: contactInfo.email,
                href: `mailto:${contactInfo.email}`,
                color: "from-red-500 to-red-600",
              },
            ].map((contact, index) => (
              <a
                key={index}
                href={contact.href}
                target={contact.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  contact.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                className={`group bg-gradient-to-br ${contact.color} hover:scale-105 p-4 sm:p-6 lg:p-8 rounded-2xl text-center transition-all duration-300 shadow-2xl border border-white border-opacity-20 backdrop-blur-lg`}
              >
                <contact.icon className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 mx-auto mb-2 sm:mb-4 group-hover:scale-110 transition-transform duration-300" />
                <p className="font-bold mb-1 sm:mb-2 text-sm sm:text-base lg:text-lg">
                  {contact.label}
                </p>
                <p className="text-xs sm:text-sm opacity-90">{contact.value}</p>
              </a>
            ))}
          </div>
        </section>
      </div>

      {showLogin && <Login onClose={() => setShowLogin(false)} />}
    </div>
  );
};

export default Home;
