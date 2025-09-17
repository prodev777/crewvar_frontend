import Showcase from "../components/Showcase";
import Navbar from "../../../components/Elements/Navbar";
import newArrivals from "../../../assets/images/Home/yourhomeatsea.png";
import createProfile from "../../../assets/images/Home/createprofile.png";
import findAround from "../../../assets/images/Home/findaround.png";
import connectShare from "../../../assets/images/Home/connectshare.png";
import favi from "../../../assets/images/Home/favi.png";

export const Home = () => {
    return (
        <>
            <Navbar />
            <Showcase />
            <div className="container px-[20px] lg:px-[96px] md:px-[48px] sm:px-[24px]">
                <div className="flex flex-col md:flex-row rounded-lg overflow-hidden">
                    <div className="w-full md:w-1/2 lg:w-[70%] lg:py-[25px] md:py-[40px] bg-[#FFFFEC] px-0 md:px-0 lg:px-0 flex flex-col justify-start items-start">
                        <h2 className="font-bold text-3xl md:text-4xl lg:text-6xl mb-8 text-[#069B93] text-left">
                            Your home at sea
                        </h2>
                        <p className="text-base xs:text-lg sm:text-xl md:text-xl lg:text-2xl mb-9 text-[#20283D] text-left">
                            With Crewvar you can see who's
                            sailing with you today. Check who's
                            on your ship and who's right next to
                            you in port. Old friends, new friends
                            you'll always know who's around.
                        </p>
                    </div>
                    <div className="w-full md:w-1/2 lg:w-[30%] lg:min-h-[100px] mb-[20px]">
                        <img src={newArrivals} alt="New Arrivals" className="w-full h-full object-contain" />
                    </div>
                </div>

                <div className="lg:mb-[35px] md:mb-[50px] mb-[25px]">
                    <div className="text-center">
                        <h3 className="font-bold text-3xl md:text-4xl sm:text-[22px] text-[20px] text-[#093A58] mb-8 text-left">
                            Simple, just like life on board
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="flex justify-center mb-4">
                                <div className="w-48 h-48 flex items-center justify-center">
                                    <img src={createProfile} alt="Create Profile" className="h-40 w-auto object-contain" />
                                </div>
                            </div>
                            <h4 className="font-bold text-xl text-[#093A58] mb-4">1.Create your profile</h4>
                            <p className="text-[#093A58] text-sm leading-relaxed">
                                Add your photo, role, and current ship.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="flex justify-center mb-4">
                                <div className="w-48 h-48 flex items-center justify-center">
                                    <img src={findAround} alt="Find Around" className="h-40 w-auto object-contain" />
                                </div>
                            </div>
                            <h4 className="font-bold text-xl text-[#093A58] mb-4">2.Find who's around</h4>
                            <p className="text-[#093A58] text-sm leading-relaxed">
                                See your shipmates and the crew on ships docked beside you today.
                            </p>
                        </div>

                        {/* Step 3: Connect & Share */}
                        <div className="text-center">
                            <div className="flex justify-center mb-4">
                                <div className="w-48 h-48 flex items-center justify-center">
                                    <img src={connectShare} alt="Connect Share" className="h-40 w-auto object-contain" />
                                </div>
                            </div>
                            <h4 className="font-bold text-xl text-[#093A58] mb-4">3.Connect & share</h4>
                            <p className="text-[#093A58] text-sm leading-relaxed">
                                Send a request, unlock profiles, and keep in touch in a safe, friendly way.
                            </p>
                        </div>
                    </div>
                </div>
                {/* End Homepage Categories Section */}


                {/* Homepage Discounts Section */}
            </div>
            <div className="w-full bg-[#B9F3E0] py-[30px]">
                <div className="container px-[20px] lg:px-[96px] md:px-[48px] sm:px-[24px]">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        {/* Left side - Text content */}
                        <div className="w-full lg:w-[80%] md:w-[70%] mb-8 md:mb-0 md:pr-8">
                            <h2 className="font-bold text-4xl sm:text-5xl mb-6 text-[#069B93]">
                                Why Crewvar?
                            </h2>
                            <p className="text-lg text-[#069B93] leading-relaxed">
                            On every ship, there’s one place where the crew always ends up after a long day:
                                <span className="relative">
                                    the crew bar.
                                </span> It’s where stories are shared, friendships are made, and laughs never end.
                            </p>
                        </div>
                        {/* Right side - Icon */}
                        <div className="w-full lg:w-[20%] md:w-[30%] flex justify-center md:justify-end">
                            <div className="w-32 h-32 lg:w-40 lg:h-40 flex items-center justify-center">
                                <img src={favi} alt="Why Ohana" className="w-full h-full object-contain" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
