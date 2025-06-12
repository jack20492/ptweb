import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Save, Phone, Facebook, MessageCircle, Mail } from 'lucide-react';

const Settings: React.FC = () => {
  const { contactInfo, updateContactInfo } = useData();
  const [formData, setFormData] = useState(contactInfo);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    updateContactInfo(formData);
    
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Thông tin liên hệ đã được cập nhật thành công!');
    }, 500);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-fitness-black">Cài đặt hệ thống</h2>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-fitness-black mb-4 flex items-center">
          <Phone className="h-5 w-5 mr-2" />
          Thông tin liên hệ
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Phone className="h-4 w-4 inline mr-1" />
              Số điện thoại
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-fitness-red focus:border-transparent"
              placeholder="0123456789"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Facebook className="h-4 w-4 inline mr-1" />
              Facebook URL
            </label>
            <input
              type="url"
              value={formData.facebook}
              onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-fitness-red focus:border-transparent"
              placeholder="https://facebook.com/username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MessageCircle className="h-4 w-4 inline mr-1" />
              Zalo URL
            </label>
            <input
              type="url"
              value={formData.zalo}
              onChange={(e) => setFormData({ ...formData, zalo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-fitness-red focus:border-transparent"
              placeholder="https://zalo.me/0123456789"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="h-4 w-4 inline mr-1" />
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-fitness-red focus:border-transparent"
              placeholder="contact@example.com"
              required
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-6 py-3 bg-fitness-red text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;