import { SlCompass } from "react-icons/sl";
import { FaGlobe, FaShareAlt } from "react-icons/fa";

function Footer({openLogin}) {
    return (
        <section className="w-full px-6 pb-10 bg-gray-100">

            <div className="max-w-6xl mx-auto bg-gradient-to-r from-[#0f766e] to-[#0d9488]
                            rounded-[2rem] py-20 px-6 text-center text-white relative overflow-hidden">

                <div className="absolute inset-0 opacity-20">
                    <img
                        src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b"
                        alt="mountains"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="relative z-10 max-w-2xl mx-auto">
                    <h2 className="text-4xl font-semibold mb-4">
                        Ready to write your next story?
                    </h2>

                    <p className="text-white/90 mb-8">
                        Your journey deserves more than plans — it deserves intelligence.
                    </p>

                    <button
                        onClick={openLogin}
                        className="bg-white text-[#0f766e] px-8 py-3 rounded-full font-semibold
                                   shadow-md hover:scale-105 transition">
                        CREATE YOUR FIRST TRIP
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-4 gap-10 text-sm text-gray-600">

                <div>
                    <h1 className="flex items-center gap-2 text-lg font-semibold text-[#00685f] mb-3">
                        <SlCompass />
                        Wayfinder
                    </h1>
                    <p>
                        Intelligent travel planning for the modern era. © 2024 Wayfinder AI. All rights reserved.
                    </p>
                </div>

                <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Company</h4>
                    <ul className="space-y-2">
                        <li className="hover:text-[#00685f] cursor-pointer">Features</li>
                        <li className="hover:text-[#00685f] cursor-pointer">How it Works</li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Support</h4>
                    <ul className="space-y-2">
                        <li className="hover:text-[#00685f] cursor-pointer">Contact</li>
                        <li className="hover:text-[#00685f] cursor-pointer">Privacy Policy</li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Follow Us</h4>
                    <div className="flex gap-4">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 cursor-pointer">
                            <FaGlobe />
                        </div>
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 cursor-pointer">
                            <FaShareAlt />
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}

export default Footer;