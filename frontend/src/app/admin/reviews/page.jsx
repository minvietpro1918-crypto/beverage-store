'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axiosConfig';
import toast from 'react-hot-toast';
import StarRating from '@/components/ui/StarRating';

const fmtDt = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/reviews/admin/all');
      setReviews(data.reviews || data); // Adjust based on exact backend response
    } catch (err) {
      toast.error('Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const toggleVisibility = async (id) => {
    try {
      await api.patch(`/reviews/${id}/visibility`);
      toast.success('Đã cập nhật trạng thái hiển thị');
      fetchReviews();
    } catch (err) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const deleteReview = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá này?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      toast.success('Đã xóa đánh giá');
      setReviews(reviews.filter((r) => r._id !== id));
    } catch (err) {
      toast.error('Lỗi khi xóa đánh giá');
    }
  };

  if (loading) {
    return (
      <div className="p-8 min-h-screen text-cream">
        <div className="animate-pulse">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen text-cream">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display text-4xl font-bold text-gold">Quản Lý Đánh Giá</h1>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 border-b border-white/10 text-cream/70">
            <tr>
              <th className="p-4 font-semibold">Khách hàng</th>
              <th className="p-4 font-semibold">Sản phẩm</th>
              <th className="p-4 font-semibold">Đánh giá</th>
              <th className="p-4 font-semibold">Trạng thái</th>
              <th className="p-4 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {reviews.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-white/50">
                  Chưa có đánh giá nào trong hệ thống.
                </td>
              </tr>
            ) : (
              reviews.map((r) => (
                <tr key={r._id} className={`hover:bg-white/5 transition-colors ${!r.isVisible ? 'opacity-50' : ''}`}>
                  <td className="p-4 align-top">
                    <div className="font-medium text-white">{r.username}</div>
                    <div className="text-xs text-white/50">{r.userEmail}</div>
                    <div className="text-xs text-white/30 mt-1">{fmtDt(r.createdAt)}</div>
                  </td>
                  <td className="p-4 align-top max-w-[200px]">
                    <div className="truncate text-white" title={r.product?.name}>
                      {r.product?.name || 'Sản phẩm đã xóa'}
                    </div>
                  </td>
                  <td className="p-4 align-top max-w-[300px]">
                    <div className="flex items-center gap-2 mb-1">
                      <StarRating value={r.rating} size="sm" />
                      <span className="text-xs text-white/50">({r.helpfulCount} hữu ích)</span>
                    </div>
                    {r.title && <div className="font-medium text-white text-xs mb-1">{r.title}</div>}
                    <div className="text-xs text-white/70 line-clamp-3">{r.comment}</div>
                  </td>
                  <td className="p-4 align-top">
                    <button
                      onClick={() => toggleVisibility(r._id)}
                      className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold border transition-colors ${
                        r.isVisible 
                          ? 'bg-emerald/20 text-emerald-400 border-emerald-400/30 hover:bg-emerald/30' 
                          : 'bg-red-500/20 text-red-400 border-red-400/30 hover:bg-red-500/30'
                      }`}
                    >
                      {r.isVisible ? 'Hiển thị' : 'Đã ẩn'}
                    </button>
                  </td>
                  <td className="p-4 align-top text-right">
                    <button
                      onClick={() => deleteReview(r._id)}
                      className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Xóa đánh giá"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
