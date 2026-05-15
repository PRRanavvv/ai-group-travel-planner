import { FaBrain, FaUsers, FaChartLine } from "react-icons/fa";

function Feature({id}) {
    const features = [
        {
            title: "AI-Curated Perfection",
            desc: "Our algorithms analyze millions of data points to generate the most efficient routes and hidden gems tailored to your preferences.",
            icon: <FaBrain />,
        },
        {
            title: "Effortless Collaboration",
            desc: "Stop the endless chat threads. Vote on destinations, propose changes, and reach group consensus in seconds with integrated social tools.",
            icon: <FaUsers />,
        },
        {
            title: "Real-Time Insights",
            desc: "Monitor group energy levels and itinerary synergy. We suggest recovery time and adjustments in real-time to keep everyone happy.",
            icon: <FaChartLine />,
        },
    ];

    return (
        <section id={id} className="w-full py-20 px-6 bg-gray-50 cursor-pointer">
            {/* Heading */}
            <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl font-semibold text-gray-800 mb-3">
                    Travel Smarter, Together
                </h2>
                <p className="text-gray-600">
                    Modern technology designed to handle the complexity of group travel so you can focus on the memories.
                </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {features.map((item, index) => (
                    <div
                        key={index}
                        className="p-6 rounded-2xl
                                   bg-white/40 backdrop-blur-sm
                                   border border-white/30
                                   shadow-[0_10px_30px_rgba(0,0,0,0.08)]

                                   transform transition-all duration-300 ease-in-out
                                   hover:scale-105 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)]

                                   active:scale-95"
                    >
                        {/* Icon */}
                        <div className="w-12 h-12 flex items-center justify-center
                                        rounded-xl bg-white/60
                                        shadow-md mb-4 text-[#2a465b] text-xl">
                            {item.icon}
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            {item.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {item.desc}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Feature;