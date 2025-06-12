import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Plus, Edit, Trash2, Star, User, Search, X } from 'lucide-react';
import ImageUpload from '../ImageUpload';

const TestimonialManagement: React.FC = () => {
  const { testimonials, addTestimonial, updateTestimonial, deleteTestimonial } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    rating: 5,
    avatar: '',
    beforeImage: '',
    afterImage: ''
  });

  const filteredTestimonials = testimonials.filter(testimonial =>
    testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    testimonial.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const testimonialData = {
      id: editingTestimonial?.id || `testimonial-${Date.now()}`,
      ...formData
    };

    if (editingTestimonial) {
      updateTestimonial(editingTestimonial.id, testimonialData);
    } else {
      addTestimonial(testimonialData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      content: '',
      rating: 5,
      avatar: '',
      beforeImage: '',
      afterImage: ''
    });
    setEditingTestimonial(null);
    setShowForm(false);
  };

  const handleEdit = (testimonial: any) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      content: testimonial.content,
      rating: testimonial.rating,
      avatar: testimonial.avatar || '',
      beforeImage: testimonial.beforeImage || '',
      afterImage: testimonial.afterImage || ''
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa phản hồi này?')) {
      deleteTestimonial(id);
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-3xl font-bold text-fitness-black">Quản lý phản hồi học viên</h2>
          <p className="text-gray-600 mt-1">Quản lý testimonials và đánh giá từ học viên</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-fitness-red to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span className="font-medium">Thêm phản hồi</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc nội dung phản hồi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-fitness-red focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Testimonials List */}
      <div className="grid gap-8 mb-6">
        {filteredTestimonials.map((testimonial) => (
          <div key={testimonial.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  {testimonial.avatar ? (
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover border-4 border-gray-100"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-fitness-red to-red-600 rounded-full flex items-center justify-center shadow-lg">
                      <User className="h-8 w-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-fitness-black">{testimonial.name}</h3>
                    <div className="flex items-center mt-1">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                      ))}
                      <span className="ml-2 text-sm text-gray-500">({testimonial.rating}/5)</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(testimonial)}
                    className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial.id)}
                    className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <p className="text-gray-700 italic text-lg leading-relaxed">"{testimonial.content}"</p>
              </div>
              
              {(testimonial.beforeImage || testimonial.afterImage) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {testimonial.beforeImage && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">📸 Ảnh trước</p>
                      <img
                        src={testimonial.beforeImage}
                        alt="Before"
                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                      />
                    </div>
                  )}
                  {testimonial.afterImage && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">✨ Ảnh sau</p>
                      <img
                        src={testimonial.afterImage}
                        alt="After"
                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredTestimonials.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">Không tìm thấy phản hồi</h3>
          <p className="text-gray-400">Thử thay đổi từ khóa tìm kiếm</p>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-fitness-black">
                  {editingTestimonial ? '✏️ Chỉnh sửa phản hồi' : '➕ Thêm phản hồi mới'}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên khách hàng
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-fitness-red focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Đánh giá (số sao)
                    </label>
                    <select
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-fitness-red focus:border-transparent transition-all duration-200"
                    >
                      {[1, 2, 3, 4, 5].map(num => (
                        <option key={num} value={num}>⭐ {num} sao</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung phản hồi
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-fitness-red focus:border-transparent transition-all duration-200"
                    placeholder="Nhập nội dung phản hồi từ khách hàng..."
                    required
                  />
                </div>

                <ImageUpload
                  value={formData.avatar}
                  onChange={(url) => setFormData({ ...formData, avatar: url })}
                  label="Ảnh đại diện khách hàng"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ImageUpload
                    value={formData.beforeImage}
                    onChange={(url) => setFormData({ ...formData, beforeImage: url })}
                    label="Ảnh trước (tùy chọn)"
                  />

                  <ImageUpload
                    value={formData.afterImage}
                    onChange={(url) => setFormData({ ...formData, afterImage: url })}
                    label="Ảnh sau (tùy chọn)"
                  />
                </div>

                <div className="flex space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-fitness-red to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium"
                  >
                    {editingTestimonial ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialManagement;