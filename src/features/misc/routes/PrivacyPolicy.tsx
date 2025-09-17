import { Link } from 'react-router-dom';
import logo from '../../../assets/images/Home/logo.png';

export const PrivacyPolicy = () => {
    const sections = [
        {
            title: "1. Information We Collect",
            content: "When you use Crewvar, you may voluntarily provide: name, email address, and profile photo; your role (crew member or passenger); cruise line, ship, and calendar dates you choose to enter; and any social media links or contact information you decide to share. We do not import or access employment contracts, official crew lists, or passenger booking data. All information is entered directly by the user."
        },
        {
            title: "2. How We Use Information",
            content: "We use your information to create your Crewvar profile, allow other users to connect with you when you approve requests, show who is currently on a ship or in a port (based only on user-submitted information), and improve the functionality and safety of Crewvar. We do not sell your personal information to third parties."
        },
        {
            title: "3. Sharing of Information",
            content: "Your profile is only visible to other verified users, according to the privacy settings you choose. Crew members can see and connect only with other crew members. Passengers can see and connect with both passengers and crew members. Detailed profile information such as contact details is visible only after you approve a connection request."
        },
        {
            title: "4. Your Choices and Rights",
            content: "You may edit or delete your profile at any time, control what information is shared with other users, and request deletion of your data by contacting us at support@crewvar.com. If you are located in the European Union, you have rights under GDPR. If you are a California resident, you have rights under CCPA. We will comply with these requests."
        },
        {
            title: "5. Data Security",
            content: "We use reasonable technical and organizational measures to protect your information. However, no online platform can guarantee absolute security."
        },
        {
            title: "6. Independence from Cruise Lines",
            content: "Crewvar is an independent platform and is not affiliated with any cruise line or operator. All user data is voluntarily entered and not provided by cruise companies."
        },
        {
            title: "7. Changes to This Policy",
            content: "We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date."
        },
        {
            title: "8. Contact Us",
            content: "If you have questions about this Privacy Policy or how your data is handled, please contact us at: support@crewvar.com"
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
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h2>
                        <p className="text-lg text-gray-600 mb-2">Effective Date: September 12, 2025</p>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Your privacy is our top priority. Learn how we protect your information.
                        </p>
                    </div>
                </div>

                {/* Privacy Content */}
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

                {/* Key Privacy Highlights */}
                <div className="mt-12 bg-blue-50 border border-blue-200 rounded-2xl p-8">
                    <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">🔒 Your Privacy is Protected</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">Connection-Based Privacy</h4>
                                <p className="text-gray-600 text-sm">Full profiles only visible after approval</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">No Data Selling</h4>
                                <p className="text-gray-600 text-sm">We never sell your personal information</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">Independent Platform</h4>
                                <p className="text-gray-600 text-sm">Not affiliated with any cruise line</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">Full Control</h4>
                                <p className="text-gray-600 text-sm">Edit or delete your data anytime</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="mt-12 bg-gradient-to-r from-[#069B93] to-[#058a7a] rounded-2xl p-8 text-white text-center">
                    <h3 className="text-2xl font-bold mb-4">Questions about Privacy?</h3>
                    <p className="text-lg mb-6 opacity-90">
                        We're committed to transparency. Contact us if you have any privacy concerns.
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
