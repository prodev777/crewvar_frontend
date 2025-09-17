import { useLocation } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import SignupForm from "../components/SignupForm";
import logo from "../../../assets/images/Home/logo.png";

const AuthRoutes = () => {
    const location = useLocation();
    const isLogin = location.pathname.includes('/login');

    return <AuthPage isLogin={isLogin} />;
};

const AuthPage = ({ isLogin }: { isLogin: boolean }) => {
    return (
        <div className="w-full h-screen" style={{ backgroundColor: '#B9F3E0' }}>
            <div className="w-full h-full">
                <div className="mx-auto w-full xs:w-3/4 sm:w-2/3 md:w-[60%] lg:w-1/2 h-screen bg-white px-10 flex flex-col justify-center">
                    <div className="flex justify-center mb-8">
                        <img 
                            src={logo} 
                            alt="Crewvar Logo" 
                            className="h-16 w-auto"
                            onError={(e) => {
                                console.error('Logo failed to load, trying fallback:', e);
                                e.currentTarget.src = '/logo.png';
                            }}
                            onLoad={() => console.log('Logo loaded successfully')}
                        />
                    </div>
                    <h3 className="font-semibold text-2xl xs:text-3xl mb-6 text-[#069B93] text-center">
                        {isLogin ? "Sign in to your account" : "Create new account"}
                    </h3>
                    {isLogin ? <LoginForm /> : <SignupForm />}
                </div>
            </div>
        </div>
    );
};

export default AuthRoutes;