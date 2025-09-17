import { Link } from "react-router-dom";
import heroImage from "../../../assets/images/Home/hero.png";

const Showcase = () => {
    return (
        <div className="bg-[#B9F3E0] mb-8 relative">
            <div className="w-full h-full">
                <div className="container px-[20px] lg:px-[96px] md:px-[48px] sm:px-[24px] relative z-20">
                    <div className="flex flex-col md:flex-row items-center">
                        {/* Left side - Text and Button */}
                        <div className="w-full md:w-[60%] lg:w-[70%] mb-8 md:mb-0 md:pr-8">
                            <h1 className="font-bold text-3xl md:text-4xl lg:text-5xl mb-6 text-[#00374D] text-left">
                                Welcome to<br />Crewvar
                            </h1>
                            <p className="text-base md:text-black lg:text-[#069B93] md:text-lg lg:mb-[20px] mb-[15px] text-[#069B93] text-left">
                                Because crew is family, wherever the sea takes us.
                            </p>
                            <Link to="/auth/signup" className="inline-block font-semibold text-sm bg-[#069B93] hover:bg-[#058A7A] transition-colors rounded-lg py-3 px-6 text-white">
                                Join now — it's free for crew
                            </Link>
                        </div>
                        
                        {/* Right side - Empty space for image positioning */}
                        <div className="w-full md:w-[40%] lg:w-[30%] h-80 md:h-70"></div>
                    </div>
                </div>
            </div>
            
            {/* Image positioned absolutely outside the container */}
            <div className="absolute right-0 bottom-0 md:w-[60%] lg:w-[40%] z-0 pointer-events-none">
                <img 
                    src={heroImage} 
                    alt="Crewvar Crew" 
                    className="h-full w-full object-contain object-bottom object-center md:object-right"
                    onError={(e) => {
                        console.error('Hero image failed to load, trying fallback:', e);
                        e.currentTarget.src = '/hero.png';
                    }}
                    onLoad={() => console.log('Hero image loaded successfully')}
                />
            </div>
        </div>
    );
};

export default Showcase;
