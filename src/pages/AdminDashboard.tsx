import React, { useState } from "react";
import {
  Users,
  Dumbbell,
  Settings as SettingsIcon,
  MessageSquare,
  Video,
  FileText,
  Utensils,
  UserCheck,
  Folder,
  Layers,
} from "lucide-react";
import UserManagement from "../components/admin/UserManagement";
import WorkoutManagement from "../components/admin/WorkoutManagement";
import MealPlanManagement from "../components/admin/MealPlanManagement";
import ContentManagement from "../components/admin/ContentManagement";
import TestimonialManagement from "../components/admin/TestimonialManagement";
import VideoManagement from "../components/admin/VideoManagement";
import Settings from "../components/admin/Settings";
import ClientInfo from "../components/admin/ClientInfo";

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("users");

  const customerTabs = [
    { id: "users", label: "Quản lý học viên", icon: Users },
    { id: "clientinfo", label: "Thông tin học viên", icon: UserCheck },
    { id: "workouts", label: "Quản lý bài tập", icon: Dumbbell },
    { id: "meals", label: "Chế độ dinh dưỡng", icon: Utensils },
  ];

  const contentTabs = [
    { id: "content", label: "Nội dung trang chủ", icon: FileText },
    { id: "testimonials", label: "Phản hồi học viên", icon: MessageSquare },
    { id: "videos", label: "Video hướng dẫn", icon: Video },
    { id: "settings", label: "Cài đặt", icon: SettingsIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "users":
        return <UserManagement />;
      case "clientinfo":
        return <ClientInfo />;
      case "workouts":
        return <WorkoutManagement />;
      case "meals":
        return <MealPlanManagement />;
      case "content":
        return <ContentManagement />;
      case "testimonials":
        return <TestimonialManagement />;
      case "videos":
        return <VideoManagement />;
      case "settings":
        return <Settings />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="bg-gradient-to-r from-fitness-black to-fitness-red rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-2xl">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
              🎯 Admin Dashboard
            </h1>
            <p className="text-gray-200 text-sm sm:text-base lg:text-lg">
              Quản lý hệ thống PT của bạn một cách chuyên nghiệp
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-md px-0 py-0 border border-transparent flex flex-col items-stretch min-h-[calc(100vh-32px)]">
              {/* Group: Quản trị khách hàng */}
              <div className="px-8 pt-9 pb-2">
                <div className="flex items-center gap-2 mb-5">
                  <Folder className="h-5 w-5 text-[#E53935] -ml-1" />
                  <span className="font-extrabold text-[#E53935] bg-[#FEE2E2] rounded px-3 py-1 uppercase tracking-wider text-[14px] shadow-sm">
                    Quản trị khách hàng
                  </span>
                </div>
                <nav className="flex flex-col gap-2">
                  {customerTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-200 font-medium text-base
                          ${
                            isActive
                              ? "bg-[#E53935] text-white shadow-none"
                              : "bg-transparent text-gray-800 hover:bg-gray-100"
                          }
                        `}
                        style={{ fontWeight: isActive ? 700 : 500 }}
                      >
                        <Icon
                          className={`h-5 w-5 ${
                            isActive ? "text-white" : "text-gray-700"
                          }`}
                        />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
              {/* Divider line */}
              <div className="mx-8 my-4 border-t-2 border-gray-200" />
              {/* Group: Quản trị nội dung hệ thống */}
              <div className="px-8 pt-2 pb-9">
                <div className="flex items-center gap-2 mb-5">
                  <Layers className="h-5 w-5 text-[#2563EB] -ml-1" />
                  <span className="font-extrabold text-[#2563EB] bg-[#DBEAFE] rounded px-3 py-1 uppercase tracking-wider text-[14px] shadow-sm">
                    Quản trị nội dung hệ thống
                  </span>
                </div>
                <nav className="flex flex-col gap-2">
                  {contentTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-200 font-medium text-base
                          ${
                            isActive
                              ? "bg-[#E53935] text-white shadow-none"
                              : "bg-transparent text-gray-800 hover:bg-gray-100"
                          }
                        `}
                        style={{ fontWeight: isActive ? 700 : 500 }}
                      >
                        <Icon
                          className={`h-5 w-5 ${
                            isActive ? "text-white" : "text-gray-700"
                          }`}
                        />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
              <div className="flex-1" />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
