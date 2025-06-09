// src/components/WriteReviewFormWide.jsx
import React, { useState, useEffect } from 'react';
import { Star, X, SendHorizontal, CheckCircle, AlertTriangle, User, MessageCircle , Loader2 } from 'lucide-react';

// Reusable StarRating Component
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

// Main WriteReviewFormWide Component
const WriteReviewFormWide = ({
  carName: carNameProp, // carName as passed from parent (e.g., specific vehicle)
  onClose,
  onSubmitReview, // Prop for parent to handle submission (e.g., in admin for updates)
  initialData,    // For pre-filling if used for editing by an admin
}) => {
  const isEditMode = !!initialData?.id;

  const [currentRating, setCurrentRating] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  // currentCarName state is for the input field, can be different from carNameProp if user types
  const [currentCarName, setCurrentCarName] = useState(''); 

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // { type: 'success'/'error', message: '...' }

  // Ensure your environment variable is set or defaults correctly
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    setName(initialData?.name || '');
    setCurrentRating(initialData?.rating || 0);
    setComment(initialData?.comment || '');
    // Initialize currentCarName:
    // 1. From carNameProp if provided (means form is for a specific car)
    // 2. From initialData.car_name if editing an existing review that had a car name
    // 3. Else, empty (allowing user to type or defaulting to "General Feedback")
    setCurrentCarName(carNameProp || initialData?.car_name || initialData?.carName || ''); // Check both car_name and carName from initialData
  }, [initialData, carNameProp]);

  const resetForm = () => {
    setName(initialData?.name || '');
    setCurrentRating(initialData?.rating || 0);
    setComment(initialData?.comment || '');
    setCurrentCarName(carNameProp || initialData?.car_name || initialData?.carName || '');
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
      // Send 'carName' to match backend controller expectation for new submissions
      // If currentCarName is empty, default it.
      carName: currentCarName.trim() || "General Feedback", 
    };

    if (isEditMode && typeof initialData.is_approved !== 'undefined') {
        reviewPayload.is_approved = initialData.is_approved;
    }
    
    // If a custom onSubmitReview handler is provided (likely for admin edit scenarios)
    if (onSubmitReview) {
      try {
        await onSubmitReview(reviewPayload, initialData?.id); // Parent handles API call and success/error
        // Parent should set its own submit status or call onClose.
        // For this component, we can assume success if no error is thrown by parent.
        // setSubmitStatus({ type: 'success', message: 'Review action processed by parent.' });
      } catch (error) {
        // Error display should be handled by the parent component in this case
        setSubmitStatus({ type: 'error', message: error.message || 'An error occurred during parent submission.' });
      } finally {
        setIsSubmitting(false); 
      }
      return;
    }

    // --- Direct API Submission (for new reviews from client-side) ---
    const method = isEditMode ? 'PUT' : 'POST';
    const url = isEditMode ? `${API_BASE_URL}/avis/${initialData.id}` : `${API_BASE_URL}/avis`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // TODO: Add Authorization header if required (e.g., for editing)
          // 'Authorization': `Bearer ${your_auth_token}`,
        },
        body: JSON.stringify(reviewPayload),
      });
      const result = await response.json();
      if (!response.ok) {
        let errorMessage = result.message || `HTTP error ${response.status}`;
        if (result.errors) { // Laravel validation errors
            errorMessage = Object.values(result.errors).flat().join(' ');
        }
        throw new Error(errorMessage);
      }
      setSubmitStatus({ type: 'success', message: result.message || `Avis ${isEditMode ? 'updated' : 'submitted'} successfully!` });
      if (!isEditMode && !onSubmitReview) { 
        setTimeout(() => { 
            resetForm(); 
            if (onClose) onClose(); 
        }, 2500);
      }
    } catch (error) {
      setSubmitStatus({ type: 'error', message: error.message || 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus && submitStatus.type === 'success' && !onSubmitReview && !isEditMode) { // Only show full success screen for new submissions not handled by parent
    return (
      <div style={{ backgroundColor: '#1b1b1b' }} className="text-neutral-200 p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-2xl mx-auto text-center">
        <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Avis Submitted!</h3>
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
        {/* Display carNameProp if it's specifically for a car, otherwise allow typing or show initialData */}
        {(carNameProp && !isEditMode) && <p className="text-neutral-400 text-sm mt-1">For: {carNameProp}</p>}
        {(isEditMode && (initialData?.car_name || initialData?.carName)) && <p className="text-neutral-400 text-sm mt-1">For: {initialData.car_name || initialData.carName}</p>}
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
          <StarRatingHorizontal rating={currentRating} setRating={setCurrentRating} interactive={!isSubmitting} />
        </div>
        
        {/* Conditional Car Name Input: Only show if not fixed by carNameProp OR if in edit mode */}
        {(!carNameProp || isEditMode) && (
          <div>
            <label htmlFor={`carNameWideInput-${initialData?.id || 'new'}`} className="block text-xs font-medium text-neutral-400 mb-1 flex items-center">
                Vehicle/Service Name (Optional)
            </label>
            <input 
                type="text" 
                id={`carNameWideInput-${initialData?.id || 'new'}`} 
                value={currentCarName} 
                onChange={(e) => setCurrentCarName(e.target.value)} 
                className="w-full bg-neutral-800 border border-neutral-700 text-neutral-100 rounded-md py-2.5 px-3 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm placeholder-neutral-500" 
                placeholder="e.g., Bentley Continental GT or General Feedback" 
                disabled={isSubmitting} 
            />
          </div>
        )}

        <div>
          <label htmlFor={`reviewCommentWide-${initialData?.id || 'new'}`} className="block text-xs font-medium text-neutral-400 mb-1 flex items-center">
            <MessageCircle size={14} className="mr-1.5 text-amber-400" /> Your Comment (Avis)
          </label>
          <textarea id={`reviewCommentWide-${initialData?.id || 'new'}`} rows="4" value={comment} onChange={(e) => setComment(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 text-neutral-100 rounded-md py-2.5 px-3 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm placeholder-neutral-500 resize-y min-h-[100px]" placeholder="Share your thoughts..." required disabled={isSubmitting} />
        </div>

        {/* Error display specific to direct API calls from this form */}
        {submitStatus && submitStatus.type === 'error' && !onSubmitReview && (
          <div className="bg-red-700/30 border border-red-600/50 text-red-200 p-3 rounded-md text-sm flex items-center">
            <AlertTriangle size={18} className="mr-2 flex-shrink-0" /><span>{submitStatus.message}</span>
          </div>
        )}
        {/* Success message for EDIT mode if not handled by parent */}
        {submitStatus && submitStatus.type === 'success' && isEditMode && !onSubmitReview && (
             <div className="bg-green-700/30 border border-green-600/50 text-green-200 p-3 rounded-md text-sm flex items-center">
                <CheckCircle size={18} className="mr-2 flex-shrink-0" /><span>{submitStatus.message}</span>
            </div>
        )}

        <div className="pt-2 flex justify-end">
          <button type="submit" disabled={isSubmitting} className={`bg-[#FFA600] hover:bg-amber-600 disabled:bg-amber-700 disabled:opacity-70 text-[#1b1b1b] font-semibold py-2.5 px-6 rounded-md text-sm transition-all duration-200 ease-in-out flex items-center justify-center shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-[#1b1b1b]`}>
            {isSubmitting ? <Loader2 size={16} className="animate-spin mr-2" /> : <SendHorizontal size={16} className="mr-2" />}
            {isSubmitting ? 'Submitting...' : (isEditMode ? 'Update Avis' : 'Post Avis')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WriteReviewFormWide;