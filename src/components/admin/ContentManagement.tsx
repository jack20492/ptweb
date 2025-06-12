import React, { useState } from 'react';
import { useData } from '../../contexts/SupabaseDataContext';
import { Save } from 'lucide-react';
import ImageUpload from '../ImageUpload';

const ContentManagement: React.FC = () => {
  const { homeContent, updateHomeContent } = useData();
  const [formData, setFormData] = useState(homeContent || {
    hero_title: '',
    hero_subtitle: '',
    hero_image: '',
    about_text: '',
    about_image: '',
    services_title: '',
    services: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updateHomeContent(formData);
      alert('Nội dung đã được cập nhật thành công!');
    } catch (error) {
      console.error('Error updating home content:', error);
      alert('Có lỗi xảy ra khi cập nhật nội dung');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleServiceChange = (index: number, value: string) => {
    const newServices = [...formData.services];
    newServices[index] = value;
    setFormData({ ...formData, services: newServices });
  };

  const addService = () => {
    setFormData({
      ...formData,
      services: [...formData.services, '']
    });
  };

  const removeService = (index: number) => {
    const newServices = formData.services.filter((_, i) => i !== index);
    setFormData({ ...formData, services: newServices });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-fitness-black">Quản lý nội dung trang chủ</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hero Section */}
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-fitness-black mb-4">Hero Section</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề chính
              </label>
              <input
                type="text"
                value={formData.hero_title}
                onChange={(e) => setFormData({ ...formData, hero_title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-fitness-red focus:border-transparent text-sm sm:text-base"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phụ đề
              </label>
              <textarea
                value={formData.hero_subtitle}
                onChange={(e) => setFormData({ ...formData, hero_subtitle: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-fitness-red focus:border-transparent text-sm sm:text-base"
                required
              />
            </div>
            <ImageUpload
              value={formData.hero_image || ''}
              onChange={(url) => setFormData({ ...formData, hero_image: url })}
              label="Ảnh hero (tùy chọn)"
            />
          </div>
        </div>

        {/* About Section */}
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-fitness-black mb-4">Giới thiệu</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nội dung giới thiệu
              </label>
              <textarea
                value={formData.about_text}
                onChange={(e) => setFormData({ ...formData, about_text: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-fitness-red focus:border-transparent text-sm sm:text-base"
                required
              />
            </div>
            <ImageUpload
              value={formData.about_image || ''}
              onChange={(url) => setFormData({ ...formData, about_image: url })}
              label="Ảnh giới thiệu (tùy chọn)"
            />
          </div>
        </div>

        {/* Services Section */}
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-fitness-black mb-4">Dịch vụ</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề phần dịch vụ
              </label>
              <input
                type="text"
                value={formData.services_title}
                onChange={(e) => setFormData({ ...formData, services_title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-fitness-red focus:border-transparent text-sm sm:text-base"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh sách dịch vụ
              </label>
              {formData.services.map((service, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={service}
                    onChange={(e) => handleServiceChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-fitness-red focus:border-transparent text-sm sm:text-base"
                    placeholder="Nhập dịch vụ"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                    disabled={formData.services.length <= 1}
                  >
                    Xóa
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addService}
                className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
              >
                Thêm dịch vụ
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-fitness-red text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
          >
            <Save className="h-4 w-4" />
            <span>{isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContentManagement;