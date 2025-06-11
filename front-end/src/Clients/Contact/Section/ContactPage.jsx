import { useState } from "react";
import { Mail, Phone, MapPin, ChevronRight, Instagram, Facebook, Twitter, Clock } from "lucide-react";
import apiClient from '../../../services/api'; // Assuming you have apiClient configured

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null
  const [submitMessage, setSubmitMessage] = useState(""); // For detailed messages

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
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
      // Use your apiClient for consistency and pre-configured settings (like baseURL)
      // The endpoint '/contact-submissions' is an example, adjust to your actual Laravel API route
      const response = await apiClient.post('/contact-submissions', formData);

      // apiClient usually throws an error for non-2xx responses if configured to do so.
      // If not, you might still check response.status or response.ok depending on its setup.
      // Assuming apiClient returns the parsed data in response.data for success.

      console.log("Form Data Submitted:", response.data);
      setSubmitStatus('success');
      setSubmitMessage(response.data.message || "Thank you for your message! We will contact you shortly.");
      setFormData({ // Reset form
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      setSubmitStatus('error');
      let errorMessage = "An error occurred. Please try again.";
      if (error.response && error.response.data) {
        if (error.response.data.errors) { // Laravel validation errors
          errorMessage = "Submission failed. Please check the following:\n";
          const fieldErrors = [];
          for (const field in error.response.data.errors) {
            fieldErrors.push(`${field}: ${error.response.data.errors[field].join(", ")}`);
          }
          errorMessage = `Please correct the highlighted errors. ${fieldErrors.join(' ')}`;
          // You might want to set these errors to specific form fields if you have that UI
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = error.message;
      }
      setSubmitMessage(errorMessage);
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Replace with your actual Google Maps embed URL
  const mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3304.599896041801!2d-118.2582006847839!3d34.08008398059837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2c65a5e1a4b9d%3A0x5e2c3f5e9f8e4a2!2sDodger%20Stadium!5e0!3m2!1sen!2sus!4v1678886400000";

  // Merging HEAD and 9fe content for contact details, preferring HEAD's structure and 9fe's data if different
  const contactDetails = {
    location: {
      title: "Our Location",
      addressLine1: "Oujda ,Lazaret Street , Morocco", // From 9fe
      addressLine2: "Recalo, CA 203956"    // From 9fe
    },
    phone: {
      title: "Phone Number",
      numbers: ["+212 606604405"], // From 9fe
      availability: "Mon-Fri from 8am to 8pm"
    },
    email: {
      title: "Email Address",
      address: "contact@Recalo.com", // From 9fe
      availability: "Always available for support"
    },
    officeHours: {
      title: "Office Hours",
      hours: [
        "Monday - Friday: 8:00 AM - 8:00 PM",
        "Saturday: 9:00 AM - 6:00 PM",
        "Sunday: 10:00 AM - 4:00 PM"
      ]
    }
  };


  return (
    <div className="tw-min-h-screen tw-bg-[#1B1B1B] tw-text-gray-100 tw-py-10">
      {/* Main Content */}
      <section className="">
        <div className="tw-container tw-mx-auto tw-px-4">
          <div className="tw-flex tw-flex-col lg:tw-flex-row tw-gap-12">
            {/* Contact Information */}
            <div className="lg:tw-w-1/3">
              <div className="tw-sticky tw-top-24">
                <h2 className="tw-text-2xl tw-font-bold tw-mb-8 tw-relative">
                  <span className="tw-relative tw-z-10">Contact Information</span>
                  <span className="tw-absolute tw-top-8 tw-left-0 tw-w-60 tw-h-1 tw-bg-gradient-to-r tw-from-blue-500 tw-to-teal-400"></span>
                </h2>

                <div className="tw-space-y-6 tw-mb-10">
                  {/* Location */}
                  <div className="tw-flex tw-items-start">
                    <div className="tw-bg-gradient-to-br tw-from-blue-500 tw-to-teal-400 tw-p-3 tw-rounded-lg tw-text-white tw-mr-4 tw-flex-shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h3 className="tw-font-medium tw-text-lg tw-mb-1">{contactDetails.location.title}</h3>
                      <p className="tw-text-gray-400">
                        {contactDetails.location.addressLine1}<br />
                        {contactDetails.location.addressLine2}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="tw-flex tw-items-start">
                    <div className="tw-bg-gradient-to-br tw-from-blue-500 tw-to-teal-400 tw-p-3 tw-rounded-lg tw-text-white tw-mr-4 tw-flex-shrink-0">
                      <Phone size={20} />
                    </div>
                    <div>
                      <h3 className="tw-font-medium tw-text-lg tw-mb-1">{contactDetails.phone.title}</h3>
                      {contactDetails.phone.numbers.map((num, idx) => (
                        <p key={idx} className="tw-text-gray-400">{num}</p>
                      ))}
                      <p className="tw-text-gray-500 tw-text-sm">{contactDetails.phone.availability}</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="tw-flex tw-items-start">
                    <div className="tw-bg-gradient-to-br tw-from-blue-500 tw-to-teal-400 tw-p-3 tw-rounded-lg tw-text-white tw-mr-4 tw-flex-shrink-0">
                      <Mail size={20} />
                    </div>
                    <div>
                      <h3 className="tw-font-medium tw-text-lg tw-mb-1">{contactDetails.email.title}</h3>
                      <p className="tw-text-gray-400">{contactDetails.email.address}</p>
                      <p className="tw-text-gray-500 tw-text-sm">{contactDetails.email.availability}</p>
                    </div>
                  </div>
                  
                  {/* Office Hours */}
                  <div className="tw-flex tw-items-start">
                    <div className="tw-bg-gradient-to-br tw-from-blue-500 tw-to-teal-400 tw-p-3 tw-rounded-lg tw-text-white tw-mr-4 tw-flex-shrink-0">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h3 className="tw-font-medium tw-text-lg tw-mb-1">{contactDetails.officeHours.title}</h3>
                      {contactDetails.officeHours.hours.map((line, idx) => (
                        <p key={idx} className="tw-text-gray-400">{line}</p>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="tw-text-lg tw-font-medium tw-mb-4">Connect With Us</h3>
                  <div className="tw-flex tw-space-x-4">
                    <a href="#" aria-label="Facebook" className="tw-bg-gray-800 tw-p-3 tw-rounded-full hover:tw-bg-gray-700 tw-transition-colors">
                      <Facebook size={18} className="tw-text-blue-400" />
                    </a>
                    <a href="#" aria-label="Twitter" className="tw-bg-gray-800 tw-p-3 tw-rounded-full hover:tw-bg-gray-700 tw-transition-colors">
                      <Twitter size={18} className="tw-text-blue-400" />
                    </a>
                    <a href="#" aria-label="Instagram" className="tw-bg-gray-800 tw-p-3 tw-rounded-full hover:tw-bg-gray-700 tw-transition-colors">
                      <Instagram size={18} className="tw-text-blue-400" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:tw-w-2/3">
              <div className="tw-bg-[#222222] tw-rounded-xl tw-shadow-lg tw-p-6 sm:tw-p-8">
                <h2 className="tw-text-2xl tw-font-bold tw-mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit}>
                  <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6 tw-mb-6">
                    <div>
                      <label htmlFor="name" className="tw-block tw-text-sm tw-font-medium tw-text-gray-400 tw-mb-2">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="tw-w-full tw-bg-[#2B2B2B] tw-border-transparent tw-rounded-lg tw-px-4 tw-py-3 tw-text-white focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent placeholder:tw-text-gray-500"
                        placeholder="Lahyane oussama"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="tw-block tw-text-sm tw-font-medium tw-text-gray-400 tw-mb-2">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="tw-w-full tw-bg-[#2B2B2B] tw-border-transparent tw-rounded-lg tw-px-4 tw-py-3 tw-text-white focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent placeholder:tw-text-gray-500"
                        placeholder="Email@gmail.com"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6 tw-mb-6">
                    <div>
                      <label htmlFor="phone" className="tw-block tw-text-sm tw-font-medium tw-text-gray-400 tw-mb-2">Phone (Optional)</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="tw-w-full tw-bg-[#2B2B2B] tw-border-transparent tw-rounded-lg tw-px-4 tw-py-3 tw-text-white focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent placeholder:tw-text-gray-500"
                        placeholder="+212 606604405"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="tw-block tw-text-sm tw-font-medium tw-text-gray-400 tw-mb-2">Subject</label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="tw-w-full tw-border-transparent tw-bg-[#2B2B2B] tw-rounded-lg tw-px-4 tw-py-3 tw-text-white focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent placeholder:tw-text-gray-500"
                        placeholder="Regarding my booking"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="tw-mb-6">
                    <label htmlFor="message" className="tw-block tw-text-sm tw-font-medium tw-text-gray-400 tw-mb-2">Your Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="6"
                      required
                      className="tw-w-full tw-border-transparent tw-bg-[#2B2B2B] tw-rounded-lg tw-px-4 tw-py-3 tw-text-white focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-resize-none placeholder:tw-text-gray-500"
                      placeholder="Please let us know how we can help you..."
                      disabled={isSubmitting}
                    ></textarea>
                  </div>

                  <div className="tw-flex tw-justify-end">
                    <button
                      type="submit"
                      className="tw-bg-gradient-to-r tw-border-transparent tw-from-blue-500 tw-to-teal-400 tw-text-white tw-font-medium tw-px-6 tw-py-3 tw-rounded-lg tw-flex tw-items-center hover:tw-opacity-90 tw-transition-opacity disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
                      disabled={isSubmitting}
                    >
                      <span>{isSubmitting ? "Sending..." : "Send Message"}</span>
                      {!isSubmitting && <ChevronRight size={20} className="tw-ml-2" />}
                    </button>
                  </div>
                  {submitStatus && ( // Show message if submitStatus is 'success' or 'error'
                    <p className={`tw-mt-4 tw-text-sm ${submitStatus === 'success' ? 'tw-text-green-400' : 'tw-text-red-400'}`}>
                      {submitMessage}
                    </p>
                  )}
                </form>
              </div>

              {/* Map Section */}
              <div className="tw-mt-10 tw-rounded-xl tw-overflow-hidden tw-h-72 md:tw-h-96">
                <iframe
                  src={mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Office Location Map"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}