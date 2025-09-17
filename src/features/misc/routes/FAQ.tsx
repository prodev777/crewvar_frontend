import { Link } from 'react-router-dom';
import logo from '../../../assets/images/Home/logo.png';

export const FAQ = () => {
    const faqs = [
        {
            question: "What is Crewvar?",
            answer: "Crewvar is your digital crew bar. Just like the real crew bar on board, it's where you meet friends, share stories, and feel at home no matter where you are. It's a warm, friendly space online where crew and passengers can connect with the people they sail with."
        },
        {
            question: "Is my privacy protected?",
            answer: "Yes. Privacy is our top priority. Other users can only see your full profile or contact details if you approve their connection request. If you choose not to approve, the other person will never be notified."
        },
        {
            question: "Can people see my calendar?",
            answer: "No. Nobody can see your full calendar. Other users only see where you are today, never where you will be in the future."
        },
        {
            question: "What can others see about me?",
            answer: "By default, only your name, photo, and position. Your full profile and chat access open only when you accept a connection request."
        },
        {
            question: "Is Crewvar official?",
            answer: "No. Crewvar is completely independent and not affiliated with any cruise line or company. All information comes directly from users who choose to join."
        },
        {
            question: "How do I add my ship and dates?",
            answer: "When creating your profile, simply choose your cruise line, your ship, and the dates you'll be on board. It only takes a few seconds."
        },
        {
            question: "What if my ship or position isn't listed?",
            answer: "No worries. You'll find a link to let us know, and we'll update it as soon as possible."
        },
        {
            question: "Do I have to pay to use Crewvar?",
            answer: "No. Crewvar is free to use. In the future, there may be a very small subscription, just a few cents, to help cover running costs, developers, and staff. For now, enjoy everything at no cost."
        },
        {
            question: "Who can join Crewvar?",
            answer: "Both crew members and passengers. Crew can connect with other crew, and passengers can connect with both passengers and crew, but only if the connection is approved. Your privacy will always remain our priority."
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
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Everything you need to know about Crewvar - your digital crew bar
                        </p>
                    </div>
                </div>

                {/* FAQ Content */}
                <div className="space-y-6">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6 lg:p-8">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-start">
                                    <span className="flex-shrink-0 w-8 h-8 bg-[#069B93] text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                                        Q
                                    </span>
                                    {faq.question}
                                </h3>
                                <div className="ml-11">
                                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact Section */}
                <div className="mt-12 bg-gradient-to-r from-[#069B93] to-[#058a7a] rounded-2xl p-8 text-white text-center">
                    <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
                    <p className="text-lg mb-6 opacity-90">
                        We're here to help! Contact our support team for any additional questions.
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
