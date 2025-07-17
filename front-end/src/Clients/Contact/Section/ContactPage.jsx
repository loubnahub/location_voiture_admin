// src/pages/contact/ContactPage.jsx (or your file path)

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MapPin, ChevronRight, Instagram, Facebook, Twitter, Clock } from "lucide-react";
import { fetchAgencyInfo  } from '../../../services/api'; // Make sure this path is correct
import apiClient from '../../../services/api'; // Make sure this path is correct

// --- Animation Variants (Unchanged) ---
const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};
const leftColumnVariants = {
  hidden: { x: -50, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};
const rightColumnVariants = {
  hidden: { x: 50, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};
const staggerListContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
};
const statusMessageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
};

export default function ContactPage() {
  // --- STATE MANAGEMENT ---
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitMessage, setSubmitMessage] = useState("");
  
  // State for dynamic content from API
  const [agencyInfo, setAgencyInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- DATA FETCHING LIFECYCLE ---
  useEffect(() => {
    const getInfo = async () => {
      try {
        const response = await fetchAgencyInfo();
        setAgencyInfo(response.data);
      } catch (error) {
        console.error("Failed to fetch agency info for Contact Page:", error);
      } finally {
        setLoading(false);
      }
    };
    getInfo();
  }, []); // Empty array ensures this runs only once on mount

  // --- FORM HANDLERS (Unchanged) ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage("");
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setSubmitStatus('error');
      setSubmitMessage("Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }
    try {
      const response = await apiClient.post('/contact-submissions', formData);
      setSubmitStatus('success');
      setSubmitMessage(response.data.message || "Thank you! We'll be in touch soon.");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDER STATES ---
  if (loading) {
    return (
      <div className="tw-min-h-screen tw-bg-[#1B1B1B] tw-flex tw-items-center tw-justify-center">
        <p className="tw-text-gray-400 tw-animate-pulse">Loading Contact Information...</p>
      </div>
    );
  }

  if (!agencyInfo) {
    return (
       <div className="tw-min-h-screen tw-bg-[#1B1B1B] tw-flex tw-items-center tw-justify-center">
        <p className="tw-text-red-400">Could not load contact details. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="tw-min-h-screen tw-bg-[#1B1B1B] tw-text-gray-100 tw-py-10">
      <section>
        <div className="tw-container tw-mx-auto tw-px-4">
          <motion.div
            className="tw-flex tw-flex-col lg:tw-flex-row tw-gap-12"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Contact Information (NOW DYNAMIC) */}
            <motion.div className="lg:tw-w-1/3" variants={leftColumnVariants}>
              <div className="tw-sticky tw-top-24">
                <h2 className="tw-text-2xl tw-font-bold tw-mb-8 tw-relative">
                  <span className="tw-relative tw-z-10">Contact Information</span>
                  <span className="tw-absolute tw-top-8 tw-left-0 tw-w-60 tw-h-1 tw-bg-gradient-to-r tw-from-blue-500 tw-to-teal-400"></span>
                </h2>

                <motion.div className="tw-space-y-6 tw-mb-10" variants={staggerListContainer}>
                  {agencyInfo.address && (
                    <motion.div className="tw-flex tw-items-start" variants={itemVariants}>
                      <div className="tw-bg-gradient-to-br tw-from-blue-500 tw-to-teal-400 tw-p-3 tw-rounded-lg tw-text-white tw-mr-4 tw-flex-shrink-0"><MapPin size={20} /></div>
                      <div><h3 className="tw-font-medium tw-text-lg tw-mb-1">Our Location</h3><p className="tw-text-gray-400">{agencyInfo.address}</p></div>
                    </motion.div>
                  )}
                  {(agencyInfo.phone_number || agencyInfo.phone_fixed) && (
                    <motion.div className="tw-flex tw-items-start" variants={itemVariants}>
                      <div className="tw-bg-gradient-to-br tw-from-blue-500 tw-to-teal-400 tw-p-3 tw-rounded-lg tw-text-white tw-mr-4 tw-flex-shrink-0"><Phone size={20} /></div>
                      <div>
                        <h3 className="tw-font-medium tw-text-lg tw-mb-1">Phone Number</h3>
                        {agencyInfo.phone_number && <p className="tw-text-gray-400">{agencyInfo.phone_number}</p>}
                        {agencyInfo.phone_fixed && <p className="tw-text-gray-400">{agencyInfo.phone_fixed}</p>}
                      </div>
                    </motion.div>
                  )}
                  {agencyInfo.email && (
                    <motion.div className="tw-flex tw-items-start" variants={itemVariants}>
                      <div className="tw-bg-gradient-to-br tw-from-blue-500 tw-to-teal-400 tw-p-3 tw-rounded-lg tw-text-white tw-mr-4 tw-flex-shrink-0"><Mail size={20} /></div>
                      <div><h3 className="tw-font-medium tw-text-lg tw-mb-1">Email Address</h3><p className="tw-text-gray-400">{agencyInfo.email}</p></div>
                    </motion.div>
                  )}
                  {agencyInfo.office_hours && (
                    <motion.div className="tw-flex tw-items-start" variants={itemVariants}>
                      <div className="tw-bg-gradient-to-br tw-from-blue-500 tw-to-teal-400 tw-p-3 tw-rounded-lg tw-text-white tw-mr-4 tw-flex-shrink-0"><Clock size={20} /></div>
                      <div>
                        <h3 className="tw-font-medium tw-text-lg tw-mb-1">Office Hours</h3>
                        {agencyInfo.office_hours.split('\n').map((line, idx) => (
                          <p key={idx} className="tw-text-gray-400">{line}</p>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <h3 className="tw-text-lg tw-font-medium tw-mb-4">Connect With Us</h3>
                  <div className="tw-flex tw-space-x-4">
                    {agencyInfo.facebook_url && <a href={agencyInfo.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="tw-bg-gray-800 tw-p-3 tw-rounded-full hover:tw-bg-gray-700 tw-transition-colors"><Facebook size={18} className="tw-text-blue-400" /></a>}
                    {agencyInfo.twitter_url && <a href={agencyInfo.twitter_url} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="tw-bg-gray-800 tw-p-3 tw-rounded-full hover:tw-bg-gray-700 tw-transition-colors"><Twitter size={18} className="tw-text-blue-400" /></a>}
                    {agencyInfo.instagram_url && <a href={agencyInfo.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="tw-bg-gray-800 tw-p-3 tw-rounded-full hover:tw-bg-gray-700 tw-transition-colors"><Instagram size={18} className="tw-text-blue-400" /></a>}
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Contact Form & Map */}
            <motion.div className="lg:tw-w-2/3" variants={rightColumnVariants}>
              <motion.div className="tw-bg-[#222222] tw-rounded-xl tw-shadow-lg tw-p-6 sm:tw-p-8" variants={itemVariants}>
                <h2 className="tw-text-2xl tw-font-bold tw-mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit}>
                    <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6 tw-mb-6">
                        <div>
                            <label htmlFor="name" className="tw-block tw-text-sm tw-font-medium tw-text-gray-400 tw-mb-2">Full Name</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="tw-w-full tw-bg-[#2B2B2B] tw-border-transparent tw-rounded-lg tw-px-4 tw-py-3 tw-text-white focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 placeholder:tw-text-gray-500" placeholder="Lahyane oussama" disabled={isSubmitting}/>
                        </div>
                        <div>
                            <label htmlFor="email" className="tw-block tw-text-sm tw-font-medium tw-text-gray-400 tw-mb-2">Email Address</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="tw-w-full tw-bg-[#2B2B2B] tw-border-transparent tw-rounded-lg tw-px-4 tw-py-3 tw-text-white focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 placeholder:tw-text-gray-500" placeholder="Email@gmail.com" disabled={isSubmitting}/>
                        </div>
                    </div>
                    <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6 tw-mb-6">
                         <div>
                            <label htmlFor="phone" className="tw-block tw-text-sm tw-font-medium tw-text-gray-400 tw-mb-2">Phone (Optional)</label>
                            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className="tw-w-full tw-bg-[#2B2B2B] tw-border-transparent tw-rounded-lg tw-px-4 tw-py-3 tw-text-white focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 placeholder:tw-text-gray-500" placeholder="+212 606604405" disabled={isSubmitting}/>
                        </div>
                         <div>
                            <label htmlFor="subject" className="tw-block tw-text-sm tw-font-medium tw-text-gray-400 tw-mb-2">Subject</label>
                            <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} required className="tw-w-full tw-border-transparent tw-bg-[#2B2B2B] tw-rounded-lg tw-px-4 tw-py-3 tw-text-white focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 placeholder:tw-text-gray-500" placeholder="Regarding my booking" disabled={isSubmitting}/>
                        </div>
                    </div>
                    <div className="tw-mb-6">
                        <label htmlFor="message" className="tw-block tw-text-sm tw-font-medium tw-text-gray-400 tw-mb-2">Your Message</label>
                        <textarea id="message" name="message" value={formData.message} onChange={handleChange} rows="6" required className="tw-w-full tw-border-transparent tw-bg-[#2B2B2B] tw-rounded-lg tw-px-4 tw-py-3 tw-text-white focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 tw-resize-none placeholder:tw-text-gray-500" placeholder="Please let us know how we can help you..." disabled={isSubmitting}></textarea>
                    </div>
                    <div className="tw-flex tw-justify-end">
                        <button type="submit" className="tw-bg-gradient-to-r tw-border-transparent tw-from-blue-500 tw-to-teal-400 tw-text-white tw-font-medium tw-px-6 tw-py-3 tw-rounded-lg tw-flex tw-items-center hover:tw-opacity-90 transition-opacity disabled:tw-opacity-50 disabled:tw-cursor-not-allowed" disabled={isSubmitting}>
                            <span>{isSubmitting ? "Sending..." : "Send Message"}</span>
                            {!isSubmitting && <ChevronRight size={20} className="tw-ml-2" />}
                        </button>
                    </div>
                    <AnimatePresence>
                        {submitStatus && (
                            <motion.p
                                className={`tw-mt-4 tw-text-sm ${submitStatus === 'success' ? 'tw-text-green-400' : 'tw-text-red-400'}`}
                                variants={statusMessageVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                            >
                                {submitMessage}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </form>
              </motion.div>

              {agencyInfo.google_maps_url && (
                <motion.div className="tw-mt-10 tw-rounded-xl tw-overflow-hidden tw-h-72 md:tw-h-96" variants={itemVariants}>
                  <iframe src={agencyInfo.google_maps_url} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Office Location Map"></iframe>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}