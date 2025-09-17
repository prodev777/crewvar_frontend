import { Link } from "react-router-dom";
import logo from "../../assets/images/Home/logo.png";

const Navbar = () => {
    return (
        <div className="px-2 xs:px-6 py-5 justify-between rounded-xl items-center relative z-30">
            <div className="flex items-center justify-between">
                {/* Logo */}
                <div className="font-bold">
                    <Link to="/">
                        <img src={logo} alt="Crewvar Logo" className="h-[30px] sm:h-[40px] md:h-[50px] lg:h-[60px] w-auto" />
                    </Link>
                </div>

                {/* Desktop Menu - Empty space where Sign In/Sign Up buttons were */}
                <div className="hidden lg:flex text-secondary text-lg items-auto">
                    {/* Sign In/Sign Up buttons removed - using "Join Now" button instead */}
                </div>
            </div>
        </div>
    );
};

export default Navbar;