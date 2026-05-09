'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import StarRating from '@/components/ui/StarRating';
import api from '@/lib/axiosConfig';
import toast from 'react-hot-toast';

const fmtDt = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

const SORT_OPTIONS = [
  { value: 'newest',  label: 'Mới nhất' },
  { value: 'helpful', label: 'Hữu ích nhất' },
  { value: 'highest', label: 'Điểm cao nhất' },
  { value: 'lowest',  label: 'Điểm thấp nhất' },
];

export default function ReviewSection({ productId, avgRating = 0, totalReviews = 0 }) {
  const { user }  = useAuth();
  const [reviews,       setReviews]      = useState([]);
  const [distribution,  setDistribution] = useState([]);
  const [loading,       setLoading]      = useState(true);
  const [submitting,    setSubmitting]   = useState(false);
  const [showForm,      setShowForm]     = useState(false);
  const [sort,          setSort]         = useState('newest');
  const [filterRating,  setFilterRating] = useState(0);
  const [page,          setPage]         = useState(1);
  const [total,         setTotal]        = useState(totalReviews);
  const [hasMore,       setHasMore]      = useState(false);
  const [myReview,      setMyReview]     = useState(null);

  // Form state
  const [rating,  setRating]  = useState(5);
  const [title,   setTitle]   = useState('');
  const [comment, setComment] = useState('');

  const fetchReviews = async (reset = false) => {
    try {
      setLoading(true);
      const p = reset ? 1 : page;
      const { data } = await api.get(`/reviews/product/${productId}`, {
        params: { page: p, limit: 8, sort, rating: filterRating || undefined },
      });
      setReviews(prev => reset ? data.reviews : [...prev, ...data.reviews]);
      setDistribution(data.distribution || []);
      setTotal(data.total);
      setHasMore(p < data.pages);
      if (!reset) setPage(p + 1);

      // Kiểm tra user đã review chưa
      if (user) {
        const found = data.reviews.find(r => r.user === user._id || r.userEmail === user.email);
        if (found) setMyReview(found);
      }
    } catch (err) {
      toast.error('Không thể tải đánh giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(1); fetchReviews(true); }, [productId, sort, filterRating]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user)           { toast.error('Vui lòng đăng nhập để đánh giá'); return; }
    if (rating < 1)      { toast.error('Vui lòng chọn số sao'); return; }
    if (comment.trim().length < 10) { toast.error('Đánh giá tối thiểu 10 ký tự'); return; }

    try {
      setSubmitting(true);
      await api.post('/reviews', { productId, rating, title, comment });
      toast.success('Cảm ơn bạn đã đánh giá! 🌟');
      setShowForm(false);
      setRating(5); setTitle(''); setComment('');
      fetchReviews(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId) => {
    if (!user) { toast.error('Vui lòng đăng nhập'); return; }
    try {
      const { data } = await api.post(`/reviews/${reviewId}/helpful`);
      setReviews(prev => prev.map(r =>
        r._id === reviewId ? { ...r, helpfulCount: data.helpfulCount, _marked: data.helpful } : r
      ));
    } catch {}
  };

  const handleDelete = async (reviewId) => {
    if (!confirm('Xóa đánh giá này?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      toast.success('Đã xóa đánh giá');
      setReviews(prev => prev.filter(r => r._id !== reviewId));
      setMyReview(null);
    } catch { toast.error('Xóa thất bại'); }
  };

  const maxCount = Math.max(...distribution.map(d => d.count), 1);

  return (
    <section className="mt-20 md:mt-28 pb-4">
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <p className="text-[9px] tracking-[0.35em] uppercase text-[#C9A96E] mb-3">Đánh Giá</p>
          <h2 className="font-['Cormorant_Garamond'] font-light text-white" style={{ fontSize: 'clamp(28px,3.5vw,44px)' }}>
            Từ Khách <em className="italic text-[#C9A96E]">Hàng Thật</em>
          </h2>
        </div>

        {/* Write review button */}
        {user && !myReview && !showForm && (
          <button onClick={() => setShowForm(true)}
            className="self-start sm:self-auto px-5 py-2.5 border border-[rgba(201,169,110,0.4)] text-[10px] tracking-[0.2em] uppercase text-[#C9A96E] hover:bg-[#C9A96E] hover:text-black transition-all duration-300 cursor-pointer bg-transparent flex-shrink-0">
            ✍️ Viết Đánh Giá
          </button>
        )}
        {!user && (
          <a href="/login" className="self-start sm:self-auto text-[10px] tracking-[0.18em] uppercase text-white/30 hover:text-[#C9A96E] transition-colors no-underline">
            Đăng nhập để đánh giá →
          </a>
        )}
      </div>

      {/* ── Rating summary ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-8 mb-10 pb-10"
        style={{ borderBottom: '1px solid rgba(245,240,232,0.06)' }}>
        {/* Big avg score */}
        <div className="flex flex-col items-center justify-center px-8 py-6 flex-shrink-0"
          style={{ border: '1px solid rgba(245,240,232,0.06)', background: 'rgba(201,169,110,0.03)', minWidth: 140 }}>
          <span className="font-['Cormorant_Garamond'] text-5xl font-light text-[#C9A96E]">
            {avgRating > 0 ? avgRating.toFixed(1) : '—'}
          </span>
          <StarRating value={avgRating} size="sm" />
          <span className="text-[10px] text-white/30 mt-1.5">{total} đánh giá</span>
        </div>

        {/* Distribution bars */}
        <div className="flex flex-col justify-center gap-2">
          {distribution.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-3">
              <button onClick={() => setFilterRating(filterRating === star ? 0 : star)}
                className="flex items-center gap-1 text-[10px] text-white/40 hover:text-[#C9A96E] transition-colors cursor-pointer bg-transparent border-none flex-shrink-0 w-12">
                {star}★
              </button>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(245,240,232,0.08)' }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(count / maxCount) * 100}%`, background: filterRating === star ? '#C9A96E' : 'rgba(201,169,110,0.5)' }} />
              </div>
              <span className="text-[10px] text-white/30 w-6 text-right">{count}</span>
            </div>
          ))}
          {filterRating > 0 && (
            <button onClick={() => setFilterRating(0)}
              className="text-[9px] tracking-[0.15em] uppercase text-[#C9A96E]/60 hover:text-[#C9A96E] transition-colors cursor-pointer bg-transparent border-none text-left mt-1">
              ✕ Bỏ lọc
            </button>
          )}
        </div>
      </div>

      {/* ── Write review form ───────────────────────────────────────────── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-10 p-6"
          style={{ border: '1px solid rgba(201,169,110,0.2)', background: 'rgba(201,169,110,0.03)' }}>
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#C9A96E] mb-5">Đánh Giá Của Bạn</p>

          {/* Star picker */}
          <div className="mb-5">
            <p className="text-[9px] tracking-[0.2em] uppercase text-white/35 mb-3">Số Sao *</p>
            <div className="flex items-center gap-3">
              <StarRating value={rating} onChange={setRating} size="lg" />
              <span className="text-[13px] text-white/50">
                {['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Xuất sắc'][rating]}
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-[9px] tracking-[0.2em] uppercase text-white/35 mb-2">Tiêu Đề (tuỳ chọn)</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Tóm tắt trải nghiệm của bạn"
              className="w-full bg-transparent border-b border-[rgba(245,240,232,0.12)] focus:border-[#C9A96E] pb-2.5 text-[13px] text-white/80 outline-none placeholder:text-white/20 transition-colors" />
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-[9px] tracking-[0.2em] uppercase text-white/35 mb-2">
              Nội Dung * <span className="text-white/20 normal-case tracking-normal">({comment.length}/1000)</span>
            </label>
            <textarea value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này (tối thiểu 10 ký tự)..."
              rows={4} maxLength={1000}
              className="w-full bg-transparent border-b border-[rgba(245,240,232,0.12)] focus:border-[#C9A96E] pb-2.5 text-[13px] text-white/80 outline-none placeholder:text-white/20 transition-colors resize-none" />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 py-3 border border-[rgba(245,240,232,0.1)] text-[10px] tracking-[0.2em] uppercase text-white/35 hover:text-white/60 transition-colors cursor-pointer bg-transparent">
              Hủy
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 py-3 bg-[#C9A96E] text-black text-[10px] tracking-[0.2em] uppercase font-medium cursor-pointer border-none transition-opacity hover:opacity-90 disabled:opacity-50">
              {submitting ? 'Đang Gửi...' : 'Gửi Đánh Giá'}
            </button>
          </div>
        </form>
      )}

      {/* ── Sort & Filter bar ───────────────────────────────────────────── */}
      {total > 0 && (
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <p className="text-[11px] text-white/30">
            {filterRating ? `${reviews.length} đánh giá ${filterRating}★` : `${total} đánh giá`}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-wider text-white/25">Sắp xếp:</span>
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="bg-transparent border-b border-[rgba(245,240,232,0.12)] text-[11px] text-white/50 outline-none cursor-pointer pb-1"
              style={{ colorScheme: 'dark' }}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} style={{ background: '#09090b' }}>{o.label}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* ── Review cards ───────────────────────────────────────────────── */}
      {loading && reviews.length === 0 ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse" style={{ background: 'rgba(245,240,232,0.03)', border: '1px solid rgba(245,240,232,0.05)' }} />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-14 text-center">
          <span className="text-4xl opacity-20 block mb-3">💬</span>
          <p className="text-white/25 text-sm">
            {filterRating ? `Chưa có đánh giá ${filterRating} sao` : 'Chưa có đánh giá nào. Hãy là người đầu tiên!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <ReviewCard
              key={review._id}
              review={review}
              currentUser={user}
              onHelpful={handleHelpful}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && !loading && (
        <div className="flex justify-center mt-8">
          <button onClick={() => fetchReviews(false)}
            className="px-8 py-3 border border-[rgba(245,240,232,0.12)] text-[10px] tracking-[0.2em] uppercase text-white/35 hover:border-[#C9A96E] hover:text-[#C9A96E] transition-all duration-300 cursor-pointer bg-transparent">
            Xem Thêm Đánh Giá
          </button>
        </div>
      )}
    </section>
  );
}

// ── Single review card ────────────────────────────────────────────────────────
function ReviewCard({ review, currentUser, onHelpful, onDelete }) {
  const isOwner = currentUser?._id === review.user || currentUser?.email === review.userEmail;

  return (
    <div className="p-5 md:p-6 transition-all duration-300 group"
      style={{ border: '1px solid rgba(245,240,232,0.06)', background: 'rgba(245,240,232,0.01)' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,169,110,0.12)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(245,240,232,0.06)'}>

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar initials */}
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-medium text-sm"
            style={{ background: 'rgba(201,169,110,0.15)', color: '#C9A96E', border: '1px solid rgba(201,169,110,0.2)' }}>
            {review.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] text-white/75 font-medium">{review.username}</span>
              {review.isVerified && (
                <span className="text-[8px] tracking-[0.15em] uppercase px-1.5 py-0.5 text-green-400"
                  style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
                  ✓ Đã Mua
                </span>
              )}
            </div>
            <span className="text-[10px] text-white/25">{fmtDt(review.createdAt)}</span>
          </div>
        </div>
        <StarRating value={review.rating} size="sm" />
      </div>

      {/* Title */}
      {review.title && (
        <p className="text-[13px] text-white/75 font-medium mb-1.5">{review.title}</p>
      )}

      {/* Comment */}
      <p className="text-[12px] text-white/50 leading-[1.75] mb-4">{review.comment}</p>

      {/* Footer actions */}
      <div className="flex items-center justify-between">
        <button onClick={() => onHelpful(review._id)}
          className="flex items-center gap-1.5 text-[10px] text-white/25 hover:text-white/50 transition-colors cursor-pointer bg-transparent border-none">
          👍 Hữu ích
          {review.helpfulCount > 0 && <span className="text-white/35">({review.helpfulCount})</span>}
        </button>

        {isOwner && (
          <button onClick={() => onDelete(review._id)}
            className="text-[9px] tracking-[0.15em] uppercase text-red-400/30 hover:text-red-400 transition-colors cursor-pointer bg-transparent border-none">
            Xóa
          </button>
        )}
      </div>
    </div>
  );
}
