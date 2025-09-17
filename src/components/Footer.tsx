import { Link } from 'react-router-dom';
import { HiMail, HiQuestionMarkCircle, HiExclamationCircle } from 'react-icons/hi';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6 lg:mb-8">
                    {/* Brand Information */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center space-x-2 mb-2">
                            <div className="w-8 h-8 bg-[#069B93] rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">C</span>
                            </div>
                            <span className="text-xl font-bold">Crewvar</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">
                            Your home at sea. Connect with crew members and discover who's sailing with you today.
                        </p>
                        <p className="text-gray-500 text-xs">
                            © {currentYear} Crewvar. All rights reserved.
                        </p>
                    </div>

                    {/* Support and Contact */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Support & Contact</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center space-x-2">
                                <HiMail className="w-4 h-4 text-[#069B93]" />
                                <a 
                                    href="mailto:support@crewvar.com"
                                    className="text-gray-400 hover:text-white transition-colors text-sm"
                                >
                                    support@crewvar.com
                                </a>
                            </li>
                            <li>
                                <Link 
                                    to="/contact" 
                                    className="text-gray-400 hover:text-white transition-colors text-sm flex items-center space-x-2"
                                >
                                    <HiQuestionMarkCircle className="w-4 h-4" />
                                    <span>Contact Form</span>
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/help" 
                                    className="text-gray-400 hover:text-white transition-colors text-sm flex items-center space-x-2"
                                >
                                    <HiQuestionMarkCircle className="w-4 h-4" />
                                    <span>Help Center</span>
                                </Link>
                            </li>
                            <li>
                                <a 
                                    href="mailto:support@crewvar.com?subject=Report a Problem"
                                    className="text-gray-400 hover:text-white transition-colors text-sm flex items-center space-x-2"
                                >
                                    <HiExclamationCircle className="w-4 h-4" />
                                    <span>Report a Problem</span>
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Legal</h3>
                        <ul className="space-y-1">
                            <li>
                                <Link 
                                    to="/privacy-policy" 
                                    className="text-gray-400 hover:text-white transition-colors text-sm"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/terms-of-service" 
                                    className="text-gray-400 hover:text-white transition-colors text-sm"
                                >
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/faq" 
                                    className="text-gray-400 hover:text-white transition-colors text-sm"
                                >
                                    FAQ
                                </Link>
                            </li>
                        </ul>
                        <div className="mt-2 p-2 bg-gray-800 rounded-lg">
                            <p className="text-gray-400 text-xs leading-relaxed">
                                <strong className="text-gray-300">Disclaimer:</strong> Crewvar is an independent platform and is not affiliated with any cruise line or operator.
                            </p>
                        </div>
                    </div>

                    {/* Social Media */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Follow Us</h3>
                        <div className="flex space-x-3 mb-2">
                            <a 
                                href="https://instagram.com/crewvarapp" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#069B93] transition-colors group"
                                aria-label="Follow us on Instagram"
                            >
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.781c-.49 0-.928-.175-1.297-.49-.368-.315-.49-.753-.49-1.243s.122-.928.49-1.243c.369-.315.807-.49 1.297-.49s.928.175 1.297.49c.368.315.49.753.49 1.243s-.122.928-.49 1.243c-.369.315-.807.49-1.297.49z"/>
                                    <path d="M12.017 5.396c-3.63 0-6.591 2.961-6.591 6.591s2.961 6.591 6.591 6.591 6.591-2.961 6.591-6.591-2.961-6.591-6.591-6.591zm0 10.988c-2.426 0-4.397-1.971-4.397-4.397s1.971-4.397 4.397-4.397 4.397 1.971 4.397 4.397-1.971 4.397-4.397 4.397z"/>
                                </svg>
                            </a>
                            <a 
                                href="https://facebook.com/crewvarapp" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#069B93] transition-colors group"
                                aria-label="Follow us on Facebook"
                            >
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                            </a>
                            <a 
                                href="https://tiktok.com/@crewvarapp" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#069B93] transition-colors group"
                                aria-label="Follow us on TikTok"
                            >
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                                </svg>
                            </a>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Follow us @crewvarapp
                        </p>
                    </div>
                </div>

                {/* Bottom Border */}
                <div className="border-t border-gray-800 pt-3">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                        <p className="text-gray-500 text-sm text-center sm:text-left">
                            © {currentYear} Crewvar. All rights reserved.
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                            <Link 
                                to="/privacy-policy" 
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                Privacy
                            </Link>
                            <Link 
                                to="/terms-of-service" 
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                Terms
                            </Link>
                            <a 
                                href="mailto:support@crewvar.com"
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                Support
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

