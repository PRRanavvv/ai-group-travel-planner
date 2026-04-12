import {useState} from "react";
import Landing_bg from '../assets/Landingbg.png'
import Navbar from '../components/Navbar.jsx';
import Feature from '../components/Feature.jsx';
import StepsSection from '../components/HowItWorks.jsx';
import Footer from '../components/Footer.jsx';
import LoginModal from "../pages/LoginModal.jsx";


function Landing() {

    const [isLoginOpen, setIsLoginOpen] = useState(false);
    return (
        <>
            <Navbar openLogin={() => setIsLoginOpen(true)}/>
            <section className="pt-12 pb-20 px-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center cursor-pointer">

                <div className="space-y-6">

                    <h1 className="text-6xl font-semibold leading-tight">
                        Travel <br/>
                        <span className="text-[#00685f]">Reimagined</span> by AI
                    </h1>

                    <p className="text-gray-600 text-lg max-w-md">
                        Create curated itineraries that adapt to your group's unique harmony.
                        Effortless collaboration meets intelligent route optimization for your next great escape.
                    </p>

                    <div className="flex gap-4 mt-6">

                        <button
                            onClick={()=>setIsLoginOpen(true)}
                            className="bg-[#00685f] text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition cursor-pointer">
                            START YOUR JOURNEY
                        </button>

                        <button
                            onClick={() => {
                                const section = document.getElementById("HowItWorks");
                                section?.scrollIntoView({ behavior: "smooth" });
                            }}
                            className="bg-gray-100 text-[#00685f] px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition cursor-pointer">
                            SEE HOW IT WORKS
                        </button>

                    </div>
                </div>

                <div className="relative">

                    <div className="rounded-[2rem] overflow-hidden shadow-2xl rotate-3">
                        <img
                            src={Landing_bg}
                            alt="travel"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="absolute -bottom-8 -left-8 p-4 w-64 bg-white/60
                                     shadow-[0_8px_30px_rgba(0,0,0,0.15)]">

                        <div className="flex items-center gap-3 mb-3">

                            <div className="w-8 h-8 bg-[#89f5e7]/80 rounded-full flex items-center justify-center">
                                ✨
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-white">
                                    AI Optimized
                                </p>
                                <p className="text-xs text-white/80">
                                    2.4h travel time saved
                                </p>
                            </div>

                        </div>

                        <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                            <div className="h-full bg-[#00685f] w-[80%]"></div>
                        </div>

                        <p className="text-[10px] mt-2 text-[#00685f]/80 font-bold">
                            SYNERGY SCORE: 92%
                        </p>

                    </div>
                </div>

            </section>

            <Feature id="Features"/>
            <StepsSection id="HowItWorks"/>
            <Footer openLogin={() => setIsLoginOpen(true)}/>

            <LoginModal
                isOpen={isLoginOpen}
                onClose={() => setIsLoginOpen(false)}
            />
        </>
    )
}

export default Landing;