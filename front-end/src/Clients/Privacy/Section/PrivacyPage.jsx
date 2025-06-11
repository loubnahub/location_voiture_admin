import React from 'react';
import { ShieldCheck, Info, Clock, Users, Mail, Phone ,FileText ,CheckCircle } from 'lucide-react';

const PrivacyPolicyPage = () => {
  const headerHeight = 70;
  const lastUpdated = "October 27, 2023"; // KEEP THIS DATE UPDATED

  const policySections = [
    {
      id: 'introduction',
      title: '1. Introduction',
      icon: <Info size={24} className="tw-text-[#FFA600] tw-mr-3 tw-flex-shrink-0" />,
      content: `Welcome to Recalo  We operate the Recalo.com website and associated mobile applications.
                This Privacy Policy outlines our practices regarding the collection, use, protection, and disclosure of your information when you use our car rental services in Oujda, Morocco, and through our online platforms.
                We are committed to protecting your privacy. By using our Service, you agree to the collection and use of information in accordance with this policy. This policy should be read in conjunction with our Terms and Conditions.`
    },
    {
      id: 'definitions',
      title: '2. Definitions',
      icon: <FileText size={24} className="tw-text-[#FFA600] tw-mr-3 tw-flex-shrink-0" />,
      content: `<strong>SERVICE</strong> means the Recalo.com website, mobile applications, and car rental services provided by Recalo.<br />
                <strong>PERSONAL DATA</strong> means information relating to an identified or identifiable natural person (e.g., name, email, phone number, driver's license details).<br />
                <strong>USAGE DATA</strong> includes information on how the Service is accessed and used (e.g., IP address, browser type, pages visited, time spent on pages).<br />
                <strong>COOKIES</strong> are small data files stored on your device to enhance your experience and for tracking purposes.<br />
                <strong>DATA CONTROLLER</strong> for the purpose of this Privacy Policy, Recalo is the Data Controller of your Personal Data.<br />
                <strong>DATA SUBJECT</strong> refers to any individual whose Personal Data is collected and processed by Recalo.`
    },
    {
      id: 'information_collection',
      title: '3. Information We Collect',
      icon: <Users size={24} className="tw-text-[#FFA600] tw-mr-3 tw-flex-shrink-0" />,
      content: `To provide you with our car rental services, we may collect various types of information, including:
                <ul>
                  <li><strong>Personal Identification Information:</strong> Full name, date of birth, address, phone number, email address.</li>
                  <li><strong>Driver Information:</strong> Driver's license number, issuing country, expiry date, and potentially a copy of the license.</li>
                  <li><strong>Payment Information:</strong> Credit/debit card details (processed securely through our payment gateway, we do not store full card numbers), billing address.</li>
                  <li><strong>Booking Information:</strong> Rental dates, vehicle preferences, pickup and drop-off locations, flight numbers (if applicable for airport services).</li>
                  <li><strong>Geolocation Data:</strong> With your consent, we may collect location data from your device to assist with vehicle pickup/drop-off or if the vehicle is equipped with a GPS tracking device for security and recovery purposes (this will be disclosed).</li>
                  <li><strong>Usage Data:</strong> Information on how you interact with our website and mobile app.</li>
                  <li><strong>Cookies and Tracking Technologies:</strong> To track activity on our Service and hold certain information.</li>
                </ul>`
    },
    {
      id: 'use_of_data',
      title: '4. How We Use Your Information',
      icon: <CheckCircle size={24} className="tw-text-[#FFA600] tw-mr-3 tw-flex-shrink-0" />,
      content: `Recalo uses the collected data for the following purposes:
                <ul>
                  <li>To process your car rental bookings and manage your reservations.</li>
                  <li>To verify your identity and driving eligibility.</li>
                  <li>To process payments and security deposits.</li>
                  <li>To communicate with you regarding your bookings, services, and respond to your inquiries.</li>
                  <li>To provide and maintain our Service, including our website and mobile applications.</li>
                  <li>To improve our Service, offerings, and customer experience based on your feedback and usage patterns.</li>
                  <li>For security purposes, including vehicle tracking in case of theft or accident, and to prevent fraud.</li>
                  <li>To comply with legal and regulatory obligations in Morocco.</li>
                  <li>To send you promotional offers, newsletters, and information about new services or special deals, if you have opted-in to receive such communications. You can opt-out at any time.</li>
                  <li>To manage our fleet and ensure vehicle availability and maintenance.</li>
                </ul>`
    },
    {
      id: 'data_sharing_disclosure',
      title: '5. Sharing and Disclosure of Your Information',
      icon: <Users size={24} className="tw-text-[#FFA600] tw-mr-3 tw-flex-shrink-0" />, // Re-using icon, you can pick another
      content: `We do not sell your Personal Data. We may share your information in the following limited circumstances:
                <ul>
                  <li><strong>Service Providers:</strong> With third-party vendors, consultants, and other service providers who perform services on our behalf (e.g., payment processors, IT support, insurance providers, customer service platforms). These providers are obligated to protect your data and use it only for the purposes we specify.</li>
                  <li><strong>Legal Requirements:</strong> If required by law or in response to valid requests by public authorities (e.g., a court, police, or government agency in Morocco).</li>
                  <li><strong>Business Transfers:</strong> In connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business by another company.</li>
                  <li><strong>To Protect Rights and Property:</strong> To enforce our rental agreements, protect the rights, property, or safety of Recalo, our customers, or others. This includes exchanging information with other companies and organizations for fraud protection and credit risk reduction.</li>
                  <li><strong>With Your Consent:</strong> We may disclose your personal information for any other purpose with your explicit consent.</li>
                </ul>`
    },
    {
      id: 'data_security',
      title: '6. Data Security',
      icon: <ShieldCheck size={24} className="tw-text-[#FFA600] tw-mr-3 tw-flex-shrink-0" />,
      content: `The security of your data is important to us. We implement reasonable administrative, technical, and physical security measures designed to protect your Personal Data from unauthorized access, use, alteration, and disclosure. However, please remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.`
    },
    {
      id: 'data_retention',
      title: '7. Data Retention',
      icon: <Clock size={24} className="tw-text-[#FFA600] tw-mr-3 tw-flex-shrink-0" />,
      content: `Recalo will retain your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy, and to the extent necessary to comply with our legal obligations (e.g., Moroccan financial and tax regulations), resolve disputes, manage our fleet, and enforce our legal agreements and policies. Usage Data is generally retained for a shorter period, except when this data is used to strengthen the security or to improve the functionality of our Service, or we are legally obligated to retain this data for longer periods.`
    },
    {
      id: 'your_rights',
      title: '8. Your Data Protection Rights',
      icon: <FileText size={24} className="tw-text-[#FFA600] tw-mr-3 tw-flex-shrink-0" />,
      content: `Depending on your location and applicable law (e.g., Moroccan data protection laws), you may have certain rights regarding your Personal Data. These may include the right to:
                <ul>
                  <li>Access, update, or delete the information we have on you.</li>
                  <li>Rectify any information that is inaccurate or incomplete.</li>
                  <li>Object to our processing of your Personal Data.</li>
                  <li>Request that we restrict the processing of your personal information.</li>
                  <li>Request a copy of your Personal Data in a structured, machine-readable format.</li>
                  <li>Withdraw your consent at any time where Recalo relied on your consent to process your personal information.</li>
                </ul>
                To exercise these rights, please contact us using the details provided below. We may need to verify your identity before responding to such requests.`
    },
    {
      id: 'cookies_tracking',
      title: '9. Cookies and Tracking Technologies',
      icon: <Info size={24} className="tw-text-[#FFA600] tw-mr-3 tw-flex-shrink-0" />,
      content: `We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service. Examples of Cookies we use: Session Cookies, Preference Cookies, Security Cookies.`
    },
    {
      id: 'childrens_privacy',
      title: "10. Children's Privacy",
      icon: <Users size={24} className="tw-text-[#FFA600] tw-mr-3 tw-flex-shrink-0" />,
      content: `Our Service is not intended for use by children under the age of 18 ("Children"). We do not knowingly collect personally identifiable information from Children. If you are a parent or guardian and you are aware that your Child has provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from Children without verification of parental consent, we take steps to remove that information from our servers.`
    },
     {
      id: 'changes_to_policy',
      title: '11. Changes to This Privacy Policy',
      icon: <Clock size={24} className="tw-text-[#FFA600] tw-mr-3 tw-flex-shrink-0" />,
      content: `We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.`
    },
    {
      id: 'contact_us',
      title: '12. Contact Us',
      icon: <Mail size={24} className="tw-text-[#FFA600] tw-mr-3 tw-flex-shrink-0" />,
      content: `If you have any questions about this Privacy Policy or our data practices, please contact us:
                <ul>
                  <li>By email: Contact@Recalo.com</li>
                  <li>By visiting this page on our website: <a href="https://recalo.com" target="_blank" rel="noopener noreferrer" class="tw-text-[#FFA600] hover:tw-underline">Recalo.com</a></li>
                  <li>By phone number: +212 606604405</li>
                  <li>By mail: Recalo Car Rental, Lazaret Street, Oujda, Morocco.</li>
                </ul>`
    }
  ];

  return (
    <div className="tw-bg-[#1b1b1b] tw-min-h-screen tw-text-gray-300">
      <main 
        className=" tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8"
        style={{ paddingTop: `${headerHeight + 40}px`, paddingBottom: '60px' }}
      >
        <div className="tw-max-w-7xl tw-mx-auto">
          <div className="tw-text-center tw-mb-10 sm:tw-mb-12">
            <ShieldCheck className="tw-mx-auto tw-w-16 tw-h-16 tw-text-[#FFA600] tw-mb-4" />
            <h1 className="tw-text-3xl sm:tw-text-4xl lg:tw-text-5xl tw-font-bold tw-text-white">
              Privacy Policy
            </h1>
            <p className="tw-mt-3 sm:tw-mt-4 tw-text-sm sm:tw-text-base tw-text-gray-400">
              Last updated: {lastUpdated}
            </p>
          </div>

          <div className="tw-bg-[#2a2a2a] tw-w-full tw-rounded-xl tw-shadow-xl tw-p-6 sm:tw-p-8 md:tw-p-10">
            {policySections.map((section) => (
              <section key={section.id} className="tw-mb-8 last:tw-mb-0">
                <div className="tw-flex tw-items-start sm:tw-items-center tw-mb-3 sm:tw-mb-4">
                  {section.icon}
                  <h2 className="tw-text-xl sm:tw-text-2xl tw-font-semibold tw-text-white">
                    {section.title}
                  </h2>
                </div>
                <div 
                  className="tw-prose tw-prose-sm sm:tw-prose-base tw-max-w-none tw-text-gray-300 prose-headings:tw-text-white prose-strong:tw-text-gray-200 prose-a:tw-text-[#FFA600] hover:prose-a:tw-text-[#e09100] prose-ul:tw-list-disc prose-ul:tw-ml-6 prose-li:tw-my-1"
                  dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br />') }}
                />
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;