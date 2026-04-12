import { useEffect, useState } from "react";
import axios from "axios";

import { FaUser, FaUsers } from "react-icons/fa";
import Navbar from "../components/Navbar.jsx";
import GroupModal from "../components/GroupModal";

function FirstVisit() {

    const [user, setUser] = useState(null);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [soloMode, setSoloMode] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await axios.get(
                    "http://localhost:5000/api/auth/me",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setUser(res.data);

            } catch (err) {
                console.log(err);
                window.location.href = "/";
            }
        };

        fetchUser();
    }, []);

    // SOLO
    const handleSolo = () => {
        setSoloMode(true);
        setShowGroupModal(true);
    };

    // GROUP
    const handleGroup = () => {
        setSoloMode(false);
        setShowGroupModal(true);
    };

    // redirect to dashboard after create/join
    const handleSuccess = () => {
        window.location.href = "/dashboard";
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col">

            <Navbar isDashboard={true} user={user} />

            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">

                <h1 className="text-4xl md:text-5xl font-semibold text-gray-800 mb-4">
                    Where's your heart <br /> taking you next?
                </h1>

                <p className="text-gray-600 mb-12">
                    Choose your travel style to start planning.
                </p>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">

                    {/* Solo */}
                    <div className="p-8 rounded-2xl bg-white/40 backdrop-blur-sm
                                    shadow-[0_10px_30px_rgba(0,0,0,0.1)]
                                    hover:scale-105 transition-all duration-300 text-center">

                        <div className="w-16 h-16 mx-auto flex items-center justify-center
                                        rounded-full bg-[#89f5e7] text-[#00685f] text-2xl mb-4">
                            <FaUser />
                        </div>

                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Solo Travel
                        </h3>

                        <button
                            onClick={handleSolo}
                            className="px-5 py-2 rounded-full border border-dashed border-[#00685f] text-[#00685f] text-sm hover:bg-[#00685f] hover:text-white transition"
                        >
                            Plan Solo Journey
                        </button>
                    </div>

                    {/* Group */}
                    <div className="p-8 rounded-2xl bg-white/40 backdrop-blur-sm
                                    shadow-[0_10px_30px_rgba(0,0,0,0.1)]
                                    hover:scale-105 transition-all duration-300 text-center">

                        <div className="w-16 h-16 mx-auto flex items-center justify-center
                                        rounded-full bg-[#a5b4fc] text-[#1e3a8a] text-2xl mb-4">
                            <FaUsers />
                        </div>

                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Group Travel
                        </h3>

                        <button
                            onClick={handleGroup}
                            className="px-5 py-2 rounded-full border border-dashed border-[#00685f] text-[#00685f] text-sm hover:bg-[#00685f] hover:text-white transition"
                        >
                            Plan Group Trip
                        </button>
                    </div>

                </div>
            </div>

            {showGroupModal && (
                <GroupModal
                    soloMode={soloMode}
                    onClose={() => setShowGroupModal(false)}
                    onSuccess={handleSuccess}
                />
            )}

        </div>
    );
}

export default FirstVisit;