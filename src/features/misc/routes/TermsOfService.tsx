import { Link } from 'react-router-dom';
import logo from '../../../assets/images/Home/logo.png';

export const TermsOfService = () => {
    const sections = [
        {
            title: "1. Acceptance of Terms",
            content: "By creating an account or using Crewvar, you agree to these Terms of Service. If you do not agree, you may not use the platform."
        },
        {
            title: "2. Eligibility",
            content: "You must be at least 18 years old to create an account. By registering, you confirm that the information you provide is accurate and truthful."
        },
        {
            title: "3. User Responsibilities",
            content: "You are responsible for the information you share on Crewvar. Do not post false, misleading, offensive, or unlawful content. Respect other users and their privacy. Crewvar reserves the right to remove content or suspend accounts that violate these rules."
        },
        {
            title: "4. Privacy",
            content: "Your use of Crewvar is also governed by our Privacy Policy. Please review it to understand how your personal information is collected and used."
        },
        {
            title: "5. Connections and Messaging",
            content: "Profiles show only limited information until a connection request is accepted. Once accepted, you may view the full profile and exchange messages. Rejected requests will not notify the sender. Crewvar may implement cooldowns or blocking to protect users from unwanted contact."
        },
        {
            title: "6. Independence from Cruise Lines",
            content: "Crewvar is not affiliated with any cruise line, brand, or operator. All user information is voluntarily provided by the individual user."
        },
        {
            title: "7. Intellectual Property",
            content: "All content, branding, and design of Crewvar are owned by us and may not be copied or used without permission."
        },
        {
            title: "8. Service Availability",
            content: "We aim to keep Crewvar available at all times, but we cannot guarantee uninterrupted service. We may modify, suspend, or discontinue features at any time."
        },
        {
            title: "9. Limitation of Liability",
            content: "Crewvar is provided 'as is' without warranties of any kind. We are not liable for damages arising from use of the platform, user interactions, or third-party services."
        },
        {
            title: "10. Changes to These Terms",
            content: "We may update these Terms of Service from time to time. Continued use of Crewvar after changes means you accept the updated terms."
        },
        {
            title: "11. Contact Us",
            content: "If you have questions about these Terms of Service, please contact us at: support@crewvar.com"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <Link to="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                                <img 
                                    src={logo} 
                                    alt="Crewvar Logo" 
                                    className="h-10 w-auto"
                                />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Crewvar</h1>
                                    <p className="text-sm text-gray-500">sail. dock. connect.</p>
                                </div>
                            </Link>
                        </div>
                        <Link 
                            to="/dashboard"
                            className="px-4 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors font-medium"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                    
                    <div className="text-center">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Terms of Service</h2>
                        <p className="text-lg text-gray-600 mb-2">Effective Date: September 12, 2025</p>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Please read these terms carefully before using Crewvar
                        </p>
                    </div>
                </div>

                {/* Terms Content */}
                <div className="space-y-6">
                    {sections.map((section, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6 lg:p-8">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                    {section.title}
                                </h3>
                                <p className="text-gray-700 leading-relaxed">{section.content}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact Section */}
                <div className="mt-12 bg-gradient-to-r from-[#069B93] to-[#058a7a] rounded-2xl p-8 text-white text-center">
                    <h3 className="text-2xl font-bold mb-4">Questions about our Terms?</h3>
                    <p className="text-lg mb-6 opacity-90">
                        If you have any questions about these Terms of Service, please don't hesitate to contact us.
                    </p>
                    <a 
                        href="mailto:support@crewvar.com"
                        className="inline-flex items-center px-6 py-3 bg-white text-[#069B93] rounded-xl hover:bg-gray-100 transition-colors font-semibold"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    );
};
