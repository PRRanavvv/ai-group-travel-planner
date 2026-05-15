






function StepsSection({id}) {
    const steps = [
        {
            number: "1",
            title: "Dream",
            desc: "Input your vibe, dates, and group size. Our AI starts drafting possibilities instantly.",
        },
        {
            number: "2",
            title: "Refine",
            desc: "Collaborate with your group. Vote on activities and watch the itinerary adapt in real-time.",
        },
        {
            number: "3",
            title: "Explore",
            desc: "Hit the road with a dynamic itinerary that lives in your pocket, adjusting to local conditions.",
        },
    ];

    return (
        <section id={id} className="w-full py-24 px-6 bg-gray-100 cursor-pointer">

            {/* Heading */}
            <div className="text-center mb-16">
                <h2 className="text-3xl font-semibold text-gray-800 mb-3">
                    Three Steps to Bliss
                </h2>
                <p className="text-gray-600">
                    We've streamlined the journey from dream to departure.
                </p>
            </div>

            {/* Steps */}
            <div className="relative max-w-6xl mx-auto">

                {/* Line */}
                <div className="hidden md:block absolute top-10 left-0 w-full h-[1px] bg-gray-300"></div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative">

                    {steps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center">

                            {/* Circle */}
                            <div className="w-16 h-16 flex items-center justify-center 
                                            rounded-full bg-white 
                                            shadow-[0_8px_20px_rgba(0,0,0,0.15)]
                                            
                                            transform transition-all duration-300
                                            hover:scale-110">
                                <span className="text-xl font-semibold text-[#00685f]">
                                    {step.number}
                                </span>
                            </div>

                            {/* Title */}
                            <h3 className="mt-6 text-lg font-semibold text-gray-800">
                                {step.title}
                            </h3>

                            {/* Description */}
                            <p className="mt-2 text-gray-600 text-sm max-w-xs">
                                {step.desc}
                            </p>

                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default StepsSection;