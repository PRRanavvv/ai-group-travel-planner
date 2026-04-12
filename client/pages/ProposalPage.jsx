import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";
import { FiThumbsUp, FiThumbsDown, FiCheck } from "react-icons/fi";

const API = "http://127.0.0.1:5000";

const ProposalPage = () => {

    const { id } = useParams();

    const [user, setUser] = useState(null);
    const [group, setGroup] = useState(null);

    const [text, setText] = useState("");
    const [type, setType] = useState("modify");
    const [target, setTarget] = useState("");

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await fetch(`${API}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) return;

            const data = await res.json();
            setUser(data.user || data);

        } catch (err) {
            console.error("Fetch user error:", err);
        }
    };

    const fetchGroup = async () => {
        const res = await fetch(`${API}/api/group/${id}`);
        const data = await res.json();
        setGroup(data);
    };

    const submitProposal = async () => {

        if (!text.trim()) return;

        const token = localStorage.getItem("token");

        await fetch(`${API}/api/group/${id}/proposal`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                text,
                type,
                target
            })
        });

        setText("");
        setTarget("");
        setType("modify");

        fetchGroup();
    };

    const vote = async (proposalId, type) => {
        const token = localStorage.getItem("token");

        await fetch(`${API}/api/group/${id}/vote`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ proposalId, type })
        });

        fetchGroup();
    };

    const approve = async (proposalId) => {
        const token = localStorage.getItem("token");

        await fetch(`${API}/api/group/${id}/approve`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ proposalId })
        });

        await fetchGroup();

        window.dispatchEvent(new Event("tripUpdated"));
    };

    useEffect(() => {
        const loadData = async () => {
            await fetchUser();
            await fetchGroup();
        };

        loadData();
    }, [id]);

    return (
        <div className="bg-[#f6f8f9] min-h-screen">
            <Navbar isDashboard tripView user={user} />

            <div className="max-w-6xl mx-auto px-6 py-10">

                <h1 className="text-4xl font-bold mb-6">
                    Collaboration Hub
                </h1>

                <div className="flex gap-8">

                    {/* CREATE */}
                    <div className="w-[320px] bg-white rounded-2xl p-6 shadow-sm space-y-3">

                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full p-2 rounded-lg bg-gray-100"
                        >
                            <option value="modify">Modify Activity</option>
                            <option value="add">Add Activity</option>
                            <option value="remove">Remove Activity</option>
                        </select>

                        <input
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            placeholder="Target activity (e.g. Amber Fort, Lunch, Museum)"
                            className="w-full p-2 rounded-lg bg-gray-100"
                        />

                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder={
                                `Examples: Visit Amber Fort earlier in morning`
                            }
                            className="w-full h-32 p-3 rounded-xl bg-gray-100"
                        />

                        <button
                            onClick={submitProposal}
                            className="w-full mt-2 bg-teal-700 text-white py-3 rounded-full"
                        >
                            Submit Proposal
                        </button>

                    </div>

                    {/* LIST */}
                    <div className="flex-1 space-y-4">

                        {[...(group?.proposals || [])]
                            .filter(p => p.status === "pending")
                            .sort((a, b) => {

                                const scoreA =
                                    (a.upvotes?.length || 0) -
                                    (a.downvotes?.length || 0)

                                const scoreB =
                                    (b.upvotes?.length || 0) -
                                    (b.downvotes?.length || 0)

                                return scoreB - scoreA
                            })
                            .map((p) => {

                                const hasUpvoted =
                                    p.upvotes?.some(
                                        id => id === user?._id || id?._id === user?._id
                                    )

                                const hasDownvoted =
                                    p.downvotes?.some(
                                        id => id === user?._id || id?._id === user?._id
                                    )

                                return (
                                    <div
                                        key={p._id}
                                        className="bg-white p-5 rounded-2xl shadow-sm border"
                                    >

                                        <div className="flex justify-between">

                                            <div>
                                                <p className="font-medium">
                                                    {p.text}
                                                </p>

                                                <p className="text-xs text-gray-400 mt-1">
                                                    {p.type} {p.target && `• ${p.target}`}
                                                </p>
                                            </div>

                                            <span className="text-xs px-3 py-1 rounded-full text-white bg-yellow-500">
                                                PENDING
                                            </span>

                                        </div>

                                        <p className="text-xs text-gray-500 mt-1">
                                            {p.createdBy?.name || "User"}
                                        </p>

                                        <div className="flex items-center gap-6 mt-4">

                                            <button
                                                onClick={() => vote(p._id, "up")}
                                                className={`flex items-center gap-2 ${
                                                    hasUpvoted
                                                        ? "text-green-600"
                                                        : "text-gray-600"
                                                }`}
                                            >
                                                <FiThumbsUp size={16}/>
                                                {p.upvotes?.length || 0}
                                            </button>

                                            <button
                                                onClick={() => vote(p._id, "down")}
                                                className={`flex items-center gap-2 ${
                                                    hasDownvoted
                                                        ? "text-red-600"
                                                        : "text-gray-600"
                                                }`}
                                            >
                                                <FiThumbsDown size={16}/>
                                                {p.downvotes?.length || 0}
                                            </button>

                                            {user?._id === (group?.createdBy?._id || group?.createdBy)
                                                && (
                                                    <button
                                                        onClick={() => approve(p._id)}
                                                        className="ml-auto flex items-center gap-1 text-xs bg-teal-700 text-white px-3 py-1 rounded-full"
                                                    >
                                                        <FiCheck size={14}/>
                                                        Approve
                                                    </button>
                                                )}

                                        </div>

                                    </div>
                                )
                            })}

                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProposalPage;