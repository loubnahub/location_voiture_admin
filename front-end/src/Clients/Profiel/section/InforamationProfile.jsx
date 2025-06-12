import React, {useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiEdit, FiUser, FiMail, FiPhone, FiStar, FiCheckCircle, FiShield, FiCalendar, FiMapPin, FiCreditCard } from 'react-icons/fi';
import apiClient from '../../../services/api';

// --- NEW HELPER COMPONENTS for the redesigned layout ---

/**
 * A more visually appealing and aligned row for displaying user information.
 * Uses a definition list for better semantics and accessibility.
 */
const InfoRow = ({ icon, label, children }) => (
    <div className="tw-flex tw-items-start tw-py-4">
        <dt className="tw-w-1/3 tw-flex tw-items-center tw-text-sm tw-font-medium tw-text-gray-400">
            {icon}
            <span className="tw-ml-3">{label}</span>
        </dt>
        <dd className="tw-w-2/3 tw-text-gray-200">{children}</dd>
    </div>
);

/**
 * Redesigned AddressCard with a cleaner, more modern look.
 */
const AddressCard = ({ title, address, icon }) => (
    <div className="tw-bg-brand-card/50 tw-rounded-xl tw-shadow-lg tw-border tw-border-white/10 tw-p-6">
        <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
            <div className="tw-flex tw-items-center">
                <div className="tw-text-brand-amber tw-mr-3">{icon}</div>
                <h3 className="tw-text-lg tw-font-semibold tw-text-white">{title}</h3>
            </div>
            
        </div>
        {address ? (
            <div className="tw-text-gray-300 tw-space-y-1 tw-pl-10"> {/* Aligned with title */}
                <p>{address.address}</p>
                <p>{`${address.city}, ${address.state} ${address.zipCode}`}</p>
                <p>{address.country}</p>
            </div>
        ) : (
            <p className="tw-text-gray-500 tw-pl-10">No address set.</p>
        )}
    </div>
);

// --- MAIN USER PROFILE COMPONENT (Redesigned) ---

const UserProfile = () => {
    const { user_id } = useParams();

    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user_id) {
            setLoading(false);
            setError("User ID not found in URL.");
            return;
        }

        const fetchUserData = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get(`/users/${user_id}`);
                setUserData(response.data);
            } catch (err) {
                console.error("Failed to fetch user profile:", err);
                setError("Could not load user profile. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user_id]);

    if (loading) {
        return <div className="tw-bg-brand-bg tw-min-h-screen tw-flex tw-items-center tw-justify-center tw-text-white">Loading Profile...</div>;
    }

    if (error) {
        return <div className="tw-bg-brand-bg tw-min-h-screen tw-flex tw-items-center tw-justify-center tw-text-red-400">{error}</div>;
    }

    if (!userData) {
        return <div className="tw-bg-brand-bg tw-min-h-screen tw-flex tw-items-center tw-justify-center tw-text-gray-400">User not found.</div>;
    }

    const memberSince = new Date(userData.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

    return (
        <div className="tw-bg-brand-bg tw-min-h-screen tw-font-sans tw-p-4 sm:tw-p-6 lg:tw-p-8">
            <div className="tw-max-w-7xl tw-mx-auto">
                <header className="tw-mb-10">
                    <h1 className="tw-text-4xl tw-font-bold tw-text-white">Account Profile</h1>
                    <p className="tw-text-gray-400 tw-mt-2">Manage your account settings, password, and addresses.</p>
                </header>

                <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-3 tw-gap-8">
                    {/* Left Column: Profile Summary Card */}
                    <div className="lg:tw-col-span-1">
                        <div className="tw-bg-brand-card/50 tw-rounded-xl tw-shadow-lg tw-border tw-border-white/10 tw-p-8 tw-flex tw-flex-col tw-items-center">
                            <div className="tw-relative tw-mb-6">
                                <img
                                    src={userData.profile_picture_url || 'https://i.imgur.com/8Km9tLL.png'}
                                    alt={userData.full_name}
                                    className="tw-w-32 tw-h-32 tw-rounded-full tw-object-cover tw-border-4 tw-border-brand-surface"
                                />
                                
                            </div>
                            <h2 className="tw-text-2xl tw-font-bold tw-text-white">{userData.full_name}</h2>
                            <p className="tw-text-gray-400 tw-mt-1">{userData.email}</p>

                            <div className="tw-w-full tw-border-t tw-border-white/10 tw-my-6"></div>

                            <div className="tw-w-full tw-text-left tw-space-y-4">
                                <div className="tw-flex tw-justify-between tw-items-center">
                                    <span className="tw-text-gray-400 tw-font-medium">Member Since</span>
                                    <span className="tw-text-white tw-font-semibold">{memberSince}</span>
                                </div>
                                <div className="tw-flex tw-justify-between tw-items-center">
                                    <span className="tw-text-gray-400 tw-font-medium">Loyalty Points</span>
                                    <div className="tw-flex tw-items-center tw-gap-2 tw-text-brand-amber tw-font-bold">
                                        <FiStar />
                                        <span>{(userData.loyalty_points || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Details & Addresses */}
                    <div className="lg:tw-col-span-2 tw-space-y-8">
                        {/* Account Information Card */}
                        <div className="tw-bg-brand-card/50 tw-rounded-xl tw-shadow-lg tw-border tw-border-white/10 tw-p-8">
                            <h3 className="tw-text-xl tw-font-semibold tw-text-white tw-mb-2">Account Information</h3>
                            <p className="tw-text-gray-400 tw-mb-6">Basic information associated with your account.</p>
                            <dl className="tw-divide-y tw-divide-white/10">
                                <InfoRow icon={<FiUser size={20} />} label="Full Name">
                                    <span className="tw-font-medium">{userData.full_name}</span>
                                </InfoRow>
                                <InfoRow icon={<FiMail size={20} />} label="Email Address">
                                    <div className="tw-flex tw-items-center tw-gap-2">
                                        <span className="tw-font-medium">{userData.email}</span>
                                        {userData.email_verified_at ? (
                                            <span className="tw-flex tw-items-center tw-bg-green-500/10 tw-text-green-400 tw-text-xs tw-font-semibold tw-px-2 tw-py-1 tw-rounded-full">
                                                <FiCheckCircle size={12} className="tw-mr-1" /> Verified
                                            </span>
                                        ) : (
                                            <span className="tw-flex tw-items-center tw-bg-yellow-500/10 tw-text-yellow-400 tw-text-xs tw-font-semibold tw-px-2 tw-py-1 tw-rounded-full">
                                                Unverified
                                            </span>
                                        )}
                                    </div>
                                </InfoRow>
                                <InfoRow icon={<FiPhone size={20} />} label="Phone Number">
                                    <span className="tw-font-medium">{userData.phone || 'Not provided'}</span>
                                </InfoRow>
                               
                            </dl>
                        </div>
                        
                        {/* Address Cards */}
                        <AddressCard 
                            title="Default Shipping Address" 
                            address={userData.default_shipping_address}
                            icon={<FiMapPin size={22} />}
                        />
                        <AddressCard 
                            title="Default Billing Address" 
                            address={userData.default_billing_address}
                            icon={<FiCreditCard size={22} />} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;