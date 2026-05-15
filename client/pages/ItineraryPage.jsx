import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

import {
    HiOutlineViewGrid,
    HiOutlineCalendar,
    HiOutlineChatAlt2
} from "react-icons/hi";

import {
    FiLoader,
    FiClock
} from "react-icons/fi";

import { FaMapMarkerAlt } from "react-icons/fa";

const API = "http://127.0.0.1:5000";

const Itinerary = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await fetch("http://127.0.0.1:5000/api/auth/me", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = await res.json();
                setUser(data);

            } catch (err) {
                console.log(err);
            }
        };

        fetchUser();
    }, []);


    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    const fetchGroup = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API}/api/group/${id}`);
            setGroup(res.data);
        } catch (err) {
            console.error(err);
            alert("Failed to load trip data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchGroup();
    }, [id]);

    const handleGenerate = async () => {
        try {
            if (generating) return;

            setGenerating(true);

            const token = localStorage.getItem("token");

            await axios.post(
                `${API}/api/itinerary/generate-itinerary`,
                { groupId: id },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            await fetchGroup();
        } catch (err) {
            console.error(err);
        } finally {
            setGenerating(false);
        }
    };

    const handleRegenerate = async () => {
        try {
            if (generating) return;

            setGenerating(true);

            const token = localStorage.getItem("token");

            await axios.post(
                `${API}/api/group/${id}/regenerate`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            await fetchGroup();
        } catch (err) {
            console.error(err);
        } finally {
            setGenerating(false);
        }
    };

    useEffect(() => {
        const reload = () => {
            fetchGroup();
        };

        window.addEventListener("tripUpdated", reload);

        return () => window.removeEventListener("tripUpdated", reload);
    }, []);

    if (loading) {
        return (
            <div className="p-6 flex items-center gap-2">
                <FiLoader className="animate-spin" />
                Loading trip data...
            </div>
        );
    }

    const hasItinerary =
        group?.itinerary && group.itinerary.length > 0;

    return (
        <div className="bg-[#f6f7f8] min-h-screen">
            <Navbar isDashboard  user={user} />

            <div className="p-8 max-w-6xl mx-auto">

                {/* HEADER */}
                <div className="mb-12">
                    <div className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm inline-block mb-3">
                        ✨ AI-OPTIMIZED ITINERARY
                    </div>

                    <h1 className="text-4xl font-bold flex items-center gap-3">
                        <FaMapMarkerAlt />
                        {group?.destination || group?.groupName}
                    </h1>

                    <p className="text-gray-500 mt-2">
                        A curated travel experience designed by AI.
                    </p>
                </div>

                {!hasItinerary && (
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="bg-teal-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                    >
                        {generating ? (
                            <>
                                <FiLoader className="animate-spin" />
                                Generating...
                            </>
                        ) : (
                            "Generate Itinerary"
                        )}
                    </button>
                )}

                {hasItinerary &&
                    group.itinerary.map((day) => (
                        <div key={day.day} className="mb-16">

                            {/* DAY HEADER */}
                            <div className="flex items-start gap-5 mb-8">

                                <div className="text-center">
                                    <div className="text-xs text-gray-400">
                                        DAY
                                    </div>
                                    <div className="text-3xl font-bold text-teal-700">
                                        {String(day.day).padStart(2, "0")}
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-2xl font-semibold text-gray-900">
                                        {day.title}
                                    </h2>
                                    <p className="text-gray-500 text-sm">
                                        {day.subtitle}
                                    </p>
                                </div>

                            </div>

                            {/* TIMELINE */}
                            <div className="relative pl-8">

                                <div className="absolute left-2 top-0 bottom-0 w-[2px] bg-gray-300"></div>

                                <div className="space-y-10">
                                    {day.activities?.map((act, i) => (
                                        <div key={i} className="relative">

                                            {/* DOT */}
                                            <div className="absolute -left-[6px] top-8 w-3 h-3 bg-teal-600 rounded-full"></div>

                                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                                                <div className="flex">

                                                    {/* IMAGE FULL HEIGHT */}
                                                    <div className="w-[280px] h-full bg-gray-200">
                                                        <img
                                                            src={`https://picsum.photos/seed/${group.destination}-${act.title}-${i}/800/600`}
                                                            className="w-full h-full object-cover"
                                                            onError={(e)=>{
                                                                e.target.src="https://picsum.photos/800/600"
                                                            }}
                                                        />
                                                    </div>

                                                    {/* RIGHT TEXT */}
                                                    <div className="flex flex-col justify-between p-6 flex-1">

                                                        <div>
                                                            <p className="text-sm tracking-wider text-teal-600 font-semibold mb-2">
                                                                {act.time}
                                                            </p>

                                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                                {act.title}
                                                            </h3>

                                                            <p className="text-md text-gray-600 leading-relaxed">
                                                                {act.description}
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center gap-2 mt-6 text-orange-500 text-xs">
                                                            <FiClock />
                                                            <span>3 hours est.</span>
                                                        </div>

                                                    </div>

                                                </div>

                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}

                {hasItinerary && (
                    <div className="mt-10 text-center">
                        <button
                            onClick={handleRegenerate}
                            disabled={generating}
                            className="bg-teal-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                        >
                            {generating ? (
                                <>
                                    <FiLoader className="animate-spin"/>
                                    Recalculating...
                                </>
                            ) : (
                                "Recalculate Itinerary"
                            )}
                        </button>
                    </div>
                )}

            </div>

            {/* FLOATING NAV */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2
                bg-white shadow-lg border border-gray-200
                rounded-2xl px-10 py-3 flex items-center gap-16 z-50">

                <div
                    onClick={() => navigate(`/trip/${id}`)}
                    className="flex flex-col items-center text-gray-400 cursor-pointer hover:text-gray-600"
                >
                    <HiOutlineViewGrid className="text-xl" />
                    <span className="text-[10px] mt-1 font-medium">
                        WORKSPACE
                    </span>
                </div>

                <div className="flex flex-col items-center text-teal-700">
                    <div className="bg-teal-100 p-2 rounded-lg">
                        <HiOutlineCalendar className="text-lg" />
                    </div>
                    <span className="text-[10px] mt-1 font-semibold">
                        ITINERARY
                    </span>
                </div>

                <div
                    onClick={() => navigate(`/trip/${id}/proposals`)}
                    className="flex flex-col items-center text-gray-400 cursor-pointer hover:text-gray-600"
                >
                    <HiOutlineChatAlt2 className="text-xl" />
                    <span className="text-[10px] mt-1 font-medium">
                        PROPOSALS
                    </span>
                </div>

            </div>
        </div>
    );
};

export default Itinerary;