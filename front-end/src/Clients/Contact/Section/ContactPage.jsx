import { useState } from "react";
import { Mail, Phone, MapPin, ChevronRight, Instagram, Facebook, Twitter, Clock } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // To disable button during submission
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'

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
    setSubmitStatus(null); // Reset status

    // Basic frontend validation (optional, good practice)
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      alert("Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Replace with your Laravel API endpoint if different
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/contact';

      const response = await fetch(API_URL, {
        method: 'POST',
        withCredentials: true, // ESSENTIAL for Sanctum SPA cookie-based authentication
        headers: {
          'Accept': 'application/json', // We expect JSON responses
          'Content-Type': 'application/json', // When we send data (like for POST/PUT)
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) { // Status code 200-299
        console.log("Form Data Submitted:", result);
        setSubmitStatus('success');
        alert(result.message || "Thank you for your message! We will contact you shortly.");
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: ""
        });
      } else {
        // Handle errors (e.g., validation errors from Laravel)
        setSubmitStatus('error');
        if (result.errors) {
          let errorMessages = "Submission failed:\n";
          for (const field in result.errors) {
            errorMessages += `${field}: ${result.errors[field].join(", ")}\n`;
          }
          alert(errorMessages);
          console.error("Validation errors:", result.errors);
        } else {
          alert(result.message || "An error occurred. Please try again.");
          console.error("Submission error:", result);
        }
      }
    } catch (error) {
      setSubmitStatus('error');
      console.error("Network error or other issue:", error);
      alert("A network error occurred. Please check your connection and try again, or ensure the backend server is running.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Replace with your actual Google Maps embed URL
  const mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3304.599896041801!2d-118.2582006847839!3d34.08008398059837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2c65a5e1a4b9d%3A0x5e2c3f5e9f8e4a2!2sDodger%20Stadium!5e0!3m2!1sen!2sus!4v1678886400000";

  return (
    <div className="min-h-screen bg-[#1B1B1B] text-gray-100 py-10">
      {/* Main Content */}
      <section className="">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Contact Information */}
            <div className="lg:w-1/3">
              <div className="sticky top-24"> {/* Make sure your layout allows for sticky positioning */}
                <h2 className="text-2xl font-bold mb-8 relative">
                  <span className="relative z-10">Contact Information</span>
                  <span className="absolute top-8 left-0 w-60 h-1 bg-gradient-to-r from-blue-500 to-teal-400"></span> {/* Adjusted width */}
                </h2>

                <div className="space-y-6 mb-10">
                  <div className="flex items-start">
                    <div className="bg-gradient-to-br from-blue-500 to-teal-400 p-3 rounded-lg text-white mr-4 flex-shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg mb-1">Our Location</h3>
                      <p className="text-gray-400">
                        3300 Speedway Boulevard<br />
                        Metropolis, CA 90210
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-gradient-to-br from-blue-500 to-teal-400 p-3 rounded-lg text-white mr-4 flex-shrink-0">
                      <Phone size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg mb-1">Phone Number</h3>
                      <p className="text-gray-400">+1 (555) 432-1098</p>
                      <p className="text-gray-500 text-sm">Mon-Fri from 8am to 8pm</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-gradient-to-br from-blue-500 to-teal-400 p-3 rounded-lg text-white mr-4 flex-shrink-0">
                      <Mail size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg mb-1">Email Address</h3>
                      <p className="text-gray-400">info@speedway-rentals.com</p>
                      <p className="text-gray-500 text-sm">Always available for support</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-gradient-to-br from-blue-500 to-teal-400 p-3 rounded-lg text-white mr-4 flex-shrink-0">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg mb-1">Office Hours</h3>
                      <p className="text-gray-400">
                        Monday - Friday: 8:00 AM - 8:00 PM<br />
                        Saturday: 9:00 AM - 6:00 PM<br />
                        Sunday: 10:00 AM - 4:00 PM
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Connect With Us</h3>
                  <div className="flex space-x-4">
                    <a href="#" aria-label="Facebook" className="bg-gray-800 p-3 rounded-full hover:bg-gray-700 transition-colors">
                      <Facebook size={18} className="text-blue-400" />
                    </a>
                    <a href="#" aria-label="Twitter" className="bg-gray-800 p-3 rounded-full hover:bg-gray-700 transition-colors">
                      <Twitter size={18} className="text-blue-400" />
                    </a>
                    <a href="#" aria-label="Instagram" className="bg-gray-800 p-3 rounded-full hover:bg-gray-700 transition-colors">
                      <Instagram size={18} className="text-blue-400" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:w-2/3">
              <div className="bg-[#222222] rounded-xl shadow-lg p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-[#2B2B2B] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                        placeholder="John Doe"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full bg-[#2B2B2B] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                        placeholder="johndoe@example.com"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-400 mb-2">Phone (Optional)</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-[#2B2B2B] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                        placeholder="(555) 123-4567"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full bg-[#2B2B2B] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                        placeholder="Regarding my booking"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-2">Your Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="6"
                      required
                      className="w-full bg-[#2B2B2B] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-500"
                      placeholder="Please let us know how we can help you..."
                      disabled={isSubmitting}
                    ></textarea>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-blue-500 to-teal-400 text-white font-medium px-6 py-3 rounded-lg flex items-center hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSubmitting}
                    >
                      <span>{isSubmitting ? "Sending..." : "Send Message"}</span>
                      {!isSubmitting && <ChevronRight size={20} className="ml-2" />}
                    </button>
                  </div>
                  {submitStatus === 'success' && (
                    <p className="mt-4 text-green-400">Message sent successfully!</p>
                  )}
                  {submitStatus === 'error' && (
                    <p className="mt-4 text-red-400">Failed to send message. Please try again.</p>
                  )}
                </form>
              </div>

              {/* Map Section */}
              <div className="mt-10 rounded-xl overflow-hidden h-72 md:h-96">
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