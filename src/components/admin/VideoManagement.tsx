import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Plus, Edit, Trash2, Play, X } from 'lucide-react';

const VideoManagement: React.FC = () => {
  const { videos, addVideo, updateVideo, deleteVideo } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    youtubeId: '',
    description: '',
    category: 'Cardio'
  });

  const extractYouTubeId = (url: string): string => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : url;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const videoData = {
      id: editingVideo?.id || `video-${Date.now()}`,
      ...formData,
      youtubeId: extractYouTubeId(formData.youtubeId)
    };

    if (editingVideo) {
      updateVideo(editingVideo.id, videoData);
    } else {
      addVideo(videoData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      youtubeId: '',
      description: '',
      category: 'Cardio'
    });
    setEditingVideo(null);
    setShowForm(false);
  };

  const handleEdit = (video: any) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      youtubeId: video.youtubeId,
      description: video.description,
      category: video.category
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa video này?')) {
      deleteVideo(id);
    }
  };

  const categories = ['Cardio', 'Strength', 'Flexibility', 'HIIT', 'Yoga', 'Other'];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-fitness-black">Quản lý video hướng dẫn</h2>
          <p className="text-gray-600 mt-1">Thêm và quản lý video YouTube</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-fitness-red to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span className="font-medium">Thêm video</span>
        </button>
      </div>

      {/* Videos List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {videos.map((video) => (
          <div key={video.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="relative aspect-video bg-gray-200">
              <iframe
                src={`https://www.youtube.com/embed/${video.youtubeId}`}
                title={video.title}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
              />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="bg-gradient-to-r from-fitness-red to-red-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  {video.category}
                </span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(video)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-fitness-black mb-2 line-clamp-2 text-lg">
                {video.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-3">{video.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-fitness-black">
                  {editingVideo ? '✏️ Chỉnh sửa video' : '📹 Thêm video mới'}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề video
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-fitness-red focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    YouTube URL hoặc Video ID
                  </label>
                  <input
                    type="text"
                    value={formData.youtubeId}
                    onChange={(e) => setFormData({ ...formData, youtubeId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-fitness-red focus:border-transparent transition-all duration-200"
                    placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ hoặc dQw4w9WgXcQ"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Bạn có thể dán toàn bộ URL YouTube hoặc chỉ Video ID
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-fitness-red focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-fitness-red focus:border-transparent transition-all duration-200"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Preview */}
                {formData.youtubeId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Xem trước
                    </label>
                    <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                      <iframe
                        src={`https://www.youtube.com/embed/${extractYouTubeId(formData.youtubeId)}`}
                        title="Preview"
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

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
                    {editingVideo ? 'Cập nhật' : 'Thêm'}
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

export default VideoManagement;