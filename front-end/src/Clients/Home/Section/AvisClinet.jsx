// src/components/WriteReviewFormWide.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext'; // Adjust path as needed
import { Star, X, SendHorizontal, CheckCircle, AlertTriangle, User, MessageCircle, LogIn, Loader2 } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const ACCENT_COLOR_CLASS = 'tw-text-amber-400';


const StarRatingHorizontal = ({ rating, setRating, interactive = true, size = 24, starColor = 'tw-text-amber-400', emptyColor = 'tw-text-neutral-600' }) => {
    const [hoverRating, setHoverRating] = useState(0);
    return (
      <div className="tw-flex tw-items-center tw-space-x-1">
        {[1, 2, 3, 4, 5].map((starVal) => (
          <Star
            key={starVal}
            size={size}
            className={`tw-transition-colors tw-duration-150 ${interactive ? 'tw-cursor-pointer hover:tw-opacity-80' : 'tw-cursor-default'} ${
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

const WriteReviewFormWide = ({
  carName: carNameProp,
  onClose,
  onSubmitReview,
  initialData,
}) => {
  const { isAuthenticated, currentUser, authToken, isLoading: authIsLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isEditMode = !!initialData?.id;

  const [currentRating, setCurrentRating] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [currentCarName, setCurrentCarName] = useState(''); 

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    if (isAuthenticated && currentUser && !isEditMode) {
        setName(currentUser.name || currentUser.full_name || '');
    } else if (isEditMode && initialData) {
        setName(initialData.name || '');
        setCurrentRating(initialData.rating || 0);
        setComment(initialData.comment || '');
        setCurrentCarName(initialData.carName || '');
    } else {
        setName('');
    }
    if (!isEditMode) {
        setCurrentCarName(carNameProp || '');
    }
    
  }, [initialData, currentUser, isAuthenticated, carNameProp, isEditMode]);

  const handleFormInteraction = () => {
    if (showLoginPrompt) setShowLoginPrompt(false);
    if (submitStatus) setSubmitStatus(null);
  };

  const resetForm = () => {
    if (isAuthenticated && currentUser && !isEditMode) {
        setName(currentUser.name || currentUser.full_name || '');
    } else if (isEditMode && initialData) {
        setName(initialData.name || '');
    } else {
        setName('');
    }
    setCurrentRating(initialData?.rating || 0);
    setComment(initialData?.comment || '');
    setCurrentCarName(carNameProp || initialData?.carName || '');
    setSubmitStatus(null);
    setShowLoginPrompt(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated && !authIsLoading) {
        setShowLoginPrompt(true);
        return;
    }
    
    if (!name.trim() && !(isAuthenticated && currentUser?.id) ) { // Name required if not logged in to prefill by currentUser
        setSubmitStatus({ type: 'error', message: 'Please enter your name.' }); return;
    }
    if (currentRating === 0) { setSubmitStatus({ type: 'error', message: 'Please select a star rating.' }); return; }
    if (!comment.trim()) { setSubmitStatus({ type: 'error', message: 'Please write a short comment.' }); return; }

    setIsSubmitting(true);
    setSubmitStatus(null);
    
    const reviewPayload = {
      name: name.trim() || (currentUser?.name || currentUser?.full_name || "Anonymous"),
      rating: currentRating,
      comment: comment.trim(),
      carName: currentCarName.trim() || "General Feedback",
      // --- MODIFICATION: Add user_id if user is authenticated ---
      user_id: isAuthenticated && currentUser ? currentUser.id : null,
    };

    if (isEditMode && typeof initialData?.is_approved === 'boolean' && onSubmitReview) {
        reviewPayload.is_approved = initialData.is_approved;
    }
    
    if (onSubmitReview) {
      try {
        await onSubmitReview(reviewPayload, initialData?.id);
        setSubmitStatus({ type: 'success', message: `Avis ${isEditMode ? 'updated' : 'submitted'} successfully!` });
        if (onClose) setTimeout(() => onClose(), isEditMode ? 1500: 2500);
      } catch (error) {
        setSubmitStatus({ type: 'error', message: error.message || 'An error occurred during submission.' });
      } finally {
        setIsSubmitting(false); 
      }
      return;
    }

    const method = isEditMode ? 'PUT' : 'POST';
    // For new public reviews, it's always a POST to the collection endpoint.
    // Edit mode (if ever handled by this direct submission block, though unlikely if onSubmitReview is used) would target a specific ID.
    const url = isEditMode ? `${API_BASE_URL}/avis/${initialData.id}` : `${API_BASE_URL}/avis`;

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      if (isAuthenticated && authToken) { // Send token if authenticated (for store or edit)
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(url, {
        method: method, // Use determined method
        headers: headers,
        body: JSON.stringify(reviewPayload),
      });
      const result = await response.json();
      if (!response.ok) {
        let errorMessage = result.message || `HTTP error ${response.status}`;
        if (result.errors) {
            errorMessage = Object.values(result.errors).flat().join(' ');
        }
        throw new Error(errorMessage);
      }
      setSubmitStatus({ type: 'success', message: result.message || `Avis ${isEditMode ? 'updated' : 'submitted'} successfully!` });
      
      if (!isEditMode) { // If it was a new submission
        setTimeout(() => { 
            resetForm(); 
            if (onClose) onClose(); 
        }, 2500);
      } else if (isEditMode && onClose) { // If it was an edit (though this path is less likely if onSubmitReview is used)
        setTimeout(() => onClose(), 1500);
      }
    } catch (error) {
      setSubmitStatus({ type: 'error', message: error.message || 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... (rest of the component: loading states, success screen, JSX form) ...
  // (Make sure all Tailwind classes have `tw-` prefix as done in previous versions)

  if (authIsLoading && !isAuthenticated) { 
    return (
        <div style={{ backgroundColor: '#1b1b1b' }} className="tw-text-neutral-200 tw-p-6 sm:tw-p-8 tw-rounded-lg tw-shadow-xl tw-w-full tw-max-w-2xl tw-mx-auto tw-text-center">
            <Loader2 size={40} className="tw-text-amber-500 tw-mx-auto tw-mb-4 tw-animate-spin" />
            <p className="tw-text-neutral-300">Loading review form...</p>
        </div>
    );
  }
  
  if (submitStatus?.type === 'success' && !isEditMode && !onSubmitReview) {
    return (
      <div style={{ backgroundColor: '#1b1b1b' }} className="tw-text-neutral-200 tw-p-6 sm:tw-p-8 tw-rounded-lg tw-shadow-xl tw-w-full tw-max-w-2xl tw-mx-auto tw-text-center">
        <CheckCircle size={56} className="tw-text-green-500 tw-mx-auto tw-mb-4" />
        <h3 className="tw-text-xl tw-font-semibold tw-text-white tw-mb-2">Avis Submitted!</h3>
        <p className="tw-text-neutral-300">{submitStatus.message}</p>
        {onClose && <button onClick={onClose} className="tw-mt-6 tw-bg-amber-500 hover:tw-bg-amber-600 tw-text-black tw-font-semibold tw-py-2 tw-px-4 tw-rounded tw-text-sm">Close</button>}
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#1b1b1b' }} className="tw-text-neutral-200 tw-p-6 sm:tw-p-8 tw-w-full tw-max-w-3xl tw-mx-auto md:tw-my-0 tw-relative tw-rounded-lg">
      {onClose && !isEditMode && (
            <button 
                onClick={onClose} 
                className="tw-absolute tw-top-4 tw-right-4 tw-text-neutral-500 hover:tw-text-neutral-300 tw-transition-colors"
                aria-label="Close review form"
            >
                <X size={24} />
            </button>
        )}
      <div className="tw-mb-6 tw-text-center sm:tw-text-left">
        <h2 className="tw-text-2xl sm:tw-text-3xl tw-font-semibold tw-text-white tw-leading-tight">
          {isEditMode ? 'Edit Your' : 'Leave Your'} <span className="tw-text-[#FFA600]">Avis</span>
        </h2>
        {(carNameProp && !isEditMode) ? (
            <p className="tw-text-neutral-400 tw-text-sm tw-mt-1">For: {carNameProp}</p>
        ) : (isEditMode && initialData?.carName) ? (
            <p className="tw-text-neutral-400 tw-text-sm tw-mt-1">For: {initialData.carName}</p>
        ) : null }
      </div>

      <form onSubmit={handleSubmit} className="tw-space-y-5">
        {(!isAuthenticated || !(currentUser?.name || currentUser?.full_name) || isEditMode) && (
            <div>
              <label htmlFor={`reviewerNameWide-${initialData?.id || 'new'}`} className="tw-block tw-text-xs tw-font-medium tw-text-neutral-400 tw-mb-1 tw-flex tw-items-center">
                <User size={14} className="tw-mr-1.5 tw-text-[#FFA600]" /> Your Name
              </label>
              <input 
                type="text" 
                id={`reviewerNameWide-${initialData?.id || 'new'}`}
                value={name} 
                onChange={(e) => { setName(e.target.value); handleFormInteraction(); }} 
                className="tw-w-full tw-bg-neutral-800 tw-border tw-border-neutral-700 tw-text-neutral-100 tw-rounded-md tw-py-2.5 tw-px-3 focus:tw-ring-1 focus:tw-ring-amber-500 focus:tw-border-amber-500 tw-transition-colors tw-text-sm placeholder:tw-text-neutral-500 disabled:tw-bg-neutral-900 disabled:tw-text-neutral-400" 
                placeholder="Full Name" 
                required={!(isAuthenticated && currentUser?.id)}
                disabled={isSubmitting || (isAuthenticated && !!(currentUser?.name || currentUser?.full_name) && !isEditMode)}
              />
            </div>
        )}
        
        <div>
          <label className="tw-block tw-text-xs tw-font-medium tw-text-neutral-400 tw-mb-2 tw-flex tw-items-center">
            <Star size={14} className="tw-mr-1.5 tw-text-amber-400" /> Your Rating
          </label>
          <StarRatingHorizontal rating={currentRating} setRating={(r) => { setCurrentRating(r); handleFormInteraction(); }} interactive={!isSubmitting} />
        </div>

        {(!carNameProp || isEditMode) && (
          <div>
            <label htmlFor={`carNameWideInput-${initialData?.id || 'new'}`} className="tw-block tw-text-xs tw-font-medium tw-text-neutral-400 tw-mb-1 tw-flex tw-items-center">
                Vehicle/Service Name (Optional)
            </label>
            <input 
                type="text" 
                id={`carNameWideInput-${initialData?.id || 'new'}`} 
                value={currentCarName} 
                onChange={(e) => { setCurrentCarName(e.target.value); handleFormInteraction(); }}
                className="tw-w-full tw-bg-neutral-800 tw-border tw-border-neutral-700 tw-text-neutral-100 tw-rounded-md tw-py-2.5 tw-px-3 focus:tw-ring-1 focus:tw-ring-amber-500 focus:tw-border-amber-500 tw-transition-colors tw-text-sm placeholder:tw-text-neutral-500" 
                placeholder="e.g., Bentley Continental GT or General Feedback" 
                disabled={isSubmitting || (!!carNameProp && !isEditMode)}
            />
          </div>
        )}
        
        <div>
          <label htmlFor={`reviewCommentWide-${initialData?.id || 'new'}`} className="tw-block tw-text-xs tw-font-medium tw-text-neutral-400 tw-mb-1 tw-flex tw-items-center">
            <MessageCircle size={14} className="tw-mr-1.5 tw-text-amber-400" /> Your Comment (Avis)
          </label>
          <textarea 
            id={`reviewCommentWide-${initialData?.id || 'new'}`}
            rows="4" 
            value={comment} 
            onChange={(e) => { setComment(e.target.value); handleFormInteraction(); }} 
            className="tw-w-full tw-bg-neutral-800 tw-border tw-border-neutral-700 tw-text-neutral-100 tw-rounded-md tw-py-2.5 tw-px-3 focus:tw-ring-1 focus:tw-ring-amber-500 focus:tw-border-amber-500 tw-transition-colors tw-text-sm placeholder:tw-text-neutral-500 tw-resize-y tw-min-h-[100px]" 
            placeholder="Share your thoughts..." 
            required 
            disabled={isSubmitting}
          />
        </div>
        
        <div className="tw-pt-2 tw-space-y-4">
            {showLoginPrompt && (
                <div className="tw-bg-amber-500/10 tw-border tw-border-amber-500/30 tw-text-amber-200 tw-p-4 tw-rounded-md tw-text-sm tw-flex tw-items-center tw-justify-between tw-gap-4">
                    <div className="tw-flex tw-items-center">
                        <AlertTriangle size={20} className="tw-mr-3 tw-flex-shrink-0" />
                        <span>You must be logged in to post a review.</span>
                    </div>
                    <Link to="/Login" state={{ from: location.pathname + location.search }} className="tw-no-underline tw-bg-amber-500 hover:tw-bg-amber-600 tw-text-black tw-font-semibold tw-py-1.5 tw-px-4 tw-rounded-md tw-text-xs tw-flex tw-items-center tw-flex-shrink-0 tw-transition-colors">
                        <LogIn size={14} className="tw-mr-1.5" />
                        Log In
                    </Link>
                </div>
            )}
            
            {submitStatus?.type === 'error' && (
                <div className="tw-bg-red-700/30 tw-border tw-border-red-600/50 tw-text-red-200 tw-p-3 tw-rounded-md tw-text-sm tw-flex tw-items-center">
                    <AlertTriangle size={18} className="tw-mr-2 tw-flex-shrink-0" /><span>{submitStatus.message}</span>
                </div>
            )}
            {submitStatus?.type === 'success' && isEditMode && onSubmitReview && (
                <div className="tw-bg-green-700/30 tw-border tw-border-green-600/50 tw-text-green-200 tw-p-3 tw-rounded-md tw-text-sm tw-flex tw-items-center">
                    <CheckCircle size={18} className="tw-mr-2 tw-flex-shrink-0" /><span>{submitStatus.message}</span>
                </div>
            )}
            
            <div className="tw-flex tw-justify-end">
                <button type="submit" disabled={isSubmitting || authIsLoading} className="tw-bg-[#FFA600] hover:tw-bg-amber-600 disabled:tw-bg-amber-700/60 disabled:tw-opacity-70 tw-text-black tw-font-semibold tw-py-2.5 tw-px-6 tw-rounded-md tw-text-sm tw-transition-all tw-duration-200 tw-ease-in-out tw-flex tw-items-center tw-justify-center tw-shadow-md hover:tw-shadow-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-amber-500 focus:tw-ring-offset-2 focus:tw-ring-offset-[#1b1b1b]">
                    {isSubmitting ? <Loader2 size={16} className="tw-animate-spin tw-mr-2" /> : <SendHorizontal size={16} className="tw-mr-2" />}
                    {isSubmitting ? 'Submitting...' : (isEditMode ? 'Update Avis' : 'Post Avis')}
                </button>
            </div>
        </div>
      </form>
    </div>
  );
};
 
export default WriteReviewFormWide;