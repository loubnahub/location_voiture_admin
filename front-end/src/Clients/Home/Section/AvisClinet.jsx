import React, { useState, useEffect } from 'react';
import { Star, X, SendHorizontal, CheckCircle, AlertTriangle, User, MessageCircle } from 'lucide-react';

// --- Reusable StarRating Component ---
const StarRatingHorizontal = ({ rating, setRating, interactive = true, size = 24, starColor = 'text-amber-400', emptyColor = 'text-neutral-600' }) => {
  const [hoverRating, setHoverRating] = useState(0);
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((starVal) => (
        <Star
          key={starVal}
          size={size}
          className={`transition-colors duration-150 ${interactive ? 'cursor-pointer hover:opacity-80' : 'cursor-default'} ${
            (hoverRating || rating) >= starVal ? starColor : emptyColor
          }`}
          fill={(hoverRating || rating) >= starVal ? 'currentColor' : 'none'}
          onMouseEnter={() => interactive && setHoverRating(starVal)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          onClick={() => interactive && setRating && setRating(starVal)}
        />
      ))}
    </div>
  );
};

// --- Main WriteReviewFormWide Component ---
const WriteReviewFormWide = ({
  carName: carNameProp,
  onClose,
  onSubmitReview, // Prop for parent to handle submission (e.g., in admin)
  initialData,    // For pre-filling if used for editing
}) => {
  const isEditMode = !!initialData?.id;

  const [currentRating, setCurrentRating] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [currentCarName, setCurrentCarName] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const API_ENDPOINT = (process.env.REACT_APP_API_URL || 'http://localhost:8000/api') + '/avis';

  useEffect(() => {
    setName(initialData?.name || '');
    setCurrentRating(initialData?.rating || 0);
    setComment(initialData?.comment || '');
    setCurrentCarName(carNameProp || initialData?.carName || '');
  }, [initialData, carNameProp]);

  const resetForm = () => {
    setName(initialData?.name || '');
    setCurrentRating(initialData?.rating || 0);
    setComment(initialData?.comment || '');
    setCurrentCarName(carNameProp || initialData?.carName || '');
    setSubmitStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setSubmitStatus({ type: 'error', message: 'Please enter your name.' }); return; }
    if (currentRating === 0) { setSubmitStatus({ type: 'error', message: 'Please select a star rating.' }); return; }
    if (!comment.trim()) { setSubmitStatus({ type: 'error', message: 'Please write a short comment.' }); return; }

    setIsSubmitting(true);
    setSubmitStatus(null);

    const reviewPayload = {
      name,
      rating: currentRating,
      comment,
      carName: currentCarName || "General Feedback",
    };
    // If this form is used for editing by a parent, the parent might add 'is_approved'
    if (isEditMode && typeof initialData.is_approved !== 'undefined' && onSubmitReview) {
        reviewPayload.is_approved = initialData.is_approved; // Maintain approval status during edit via parent
    }


    if (onSubmitReview) {
      try {
        await onSubmitReview(reviewPayload, initialData?.id); // Parent handles API
      } catch (error) { /* Parent should display error */ }
      finally { setIsSubmitting(false); } // Parent should ideally manage its own 'isSubmitting'
      return;
    }

    // --- Direct API Submission (default for create, or edit if no onSubmitReview) ---
    const method = isEditMode ? 'PUT' : 'POST';
    const url = isEditMode ? `${API_ENDPOINT}/${initialData.id}` : API_ENDPOINT;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(reviewPayload),
      });
      const result = await response.json();
      if (!response.ok) {
        let errorMessage = result.message || `HTTP error ${response.status}`;
        if (result.errors) errorMessage = Object.values(result.errors).flat().join(' ');
        throw new Error(errorMessage);
      }
      setSubmitStatus({ type: 'success', message: result.message || `Avis ${isEditMode ? 'updated' : 'submitted'} successfully!` });
      if (!isEditMode) { // Auto-reset and close on successful CREATION
        setTimeout(() => { resetForm(); if (onClose) onClose(); }, 2500);
      } else {
        // For successful EDIT, parent might handle closing or user might want to see updated form
        // if (onClose) onClose(); // Optionally close after edit too
      }
    } catch (error) {
      setSubmitStatus({ type: 'error', message: error.message || 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus && submitStatus.type === 'success' && !onSubmitReview) {
    return (
      <div style={{ backgroundColor: '#1b1b1b' }} className="text-neutral-200 p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-2xl mx-auto text-center">
        <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Avis {isEditMode ? 'Updated' : 'Submitted'}!</h3>
        <p className="text-neutral-300">{submitStatus.message}</p>
        {onClose && <button onClick={onClose} className="mt-6 bg-amber-500 hover:bg-amber-600 text-black font-semibold py-2 px-4 rounded text-sm">Close</button>}
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#1b1b1b' }} className="text-neutral-200 p-6 sm:p-8 w-full max-w-3xl mx-auto md:my-0 relative rounded-lg">
      {onClose && (
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-white z-10 p-1 rounded-full hover:bg-neutral-700/50" aria-label="Close review form">
          <X size={22} />
        </button>
      )}
      <div className="mb-6 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-semibold text-white leading-tight">
          {isEditMode ? 'Edit Your' : 'Leave Your'} <span className="text-[#FFA600]">Avis</span>
        </h2>
        {currentCarName && <p className="text-neutral-400 text-sm mt-1">For: {currentCarName}</p>}
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor={`reviewerNameWide-${initialData?.id || 'new'}`} className="block text-xs font-medium text-neutral-400 mb-1 flex items-center">
            <User size={14} className="mr-1.5 text-[#FFA600]" /> Your Name
          </label>
          <input type="text" id={`reviewerNameWide-${initialData?.id || 'new'}`} value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 text-neutral-100 rounded-md py-2.5 px-3 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm placeholder-neutral-500" placeholder="Full Name" required disabled={isSubmitting} />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-2 flex items-center">
            <Star size={14} className="mr-1.5 text-amber-400" /> Your Rating
          </label>
          <StarRatingHorizontal rating={currentRating} setRating={setCurrentRating} />
        </div>
        {(!carNameProp || isEditMode) && (
          <div>
            <label htmlFor={`carNameWide-${initialData?.id || 'new'}`} className="block text-xs font-medium text-neutral-400 mb-1 flex items-center">Vehicle/Service Name (Optional)</label>
            <input type="text" id={`carNameWide-${initialData?.id || 'new'}`} value={currentCarName} onChange={(e) => setCurrentCarName(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 text-neutral-100 rounded-md py-2.5 px-3 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm placeholder-neutral-500" placeholder="e.g., Deluxe Limo" disabled={isSubmitting} />
          </div>
        )}
        <div>
          <label htmlFor={`reviewCommentWide-${initialData?.id || 'new'}`} className="block text-xs font-medium text-neutral-400 mb-1 flex items-center">
            <MessageCircle size={14} className="mr-1.5 text-amber-400" /> Your Comment (Avis)
          </label>
          <textarea id={`reviewCommentWide-${initialData?.id || 'new'}`} rows="4" value={comment} onChange={(e) => setComment(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 text-neutral-100 rounded-md py-2.5 px-3 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm placeholder-neutral-500 resize-y min-h-[100px]" placeholder="Share your thoughts..." required disabled={isSubmitting} />
        </div>
        {submitStatus && submitStatus.type === 'error' && !onSubmitReview && (
          <div className="bg-red-700/30 border border-red-600/50 text-red-200 p-3 rounded-md text-sm flex items-center">
            <AlertTriangle size={18} className="mr-2 flex-shrink-0" /><span>{submitStatus.message}</span>
          </div>
        )}
        <div className="pt-2 flex justify-end">
          <button type="submit" disabled={isSubmitting} className={`bg-[#FFA600] hover:bg-amber-600 disabled:bg-amber-700 disabled:opacity-70 text-[#1b1b1b] font-semibold py-2.5 px-6 rounded-md text-sm transition-all duration-200 ease-in-out flex items-center justify-center shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-[#1b1b1b]`}>
            <SendHorizontal size={16} className="mr-2" />
            {isSubmitting ? 'Submitting...' : (isEditMode ? 'Update Avis' : 'Post Avis')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WriteReviewFormWide;