import { useState } from "react";
import axios from "axios";

function GroupModal({ onClose, fetchGroups, soloMode }) {

    const [mode, setMode] = useState("create");

    const [groupName, setGroupName] = useState("");
    const [destination, setDestination] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // ✅ solo default = 1
    const [maxMembers, setMaxMembers] = useState(soloMode ? 1 : 2);

    const [code, setCode] = useState("");

    const token = localStorage.getItem("token");


    // CREATE
    const handleCreate = async () => {
        try {
            if (!groupName || !destination || !startDate || !endDate) {
                alert("Fill all fields");
                return;
            }

            if (!token) {
                alert("Login required");
                return;
            }

            if (new Date(endDate) < new Date(startDate)) {
                alert("End date must be after start date");
                return;
            }

            await axios.post(
                "http://localhost:5000/api/group/create",
                {
                    groupName,
                    destination,
                    startDate,
                    endDate,
                    maxMembers: soloMode ? 1 : maxMembers
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


            await fetchGroups?.();

            // ✅ redirect dashboard
            window.location.href = "/dashboard";

        } catch (err) {
            console.log(err);
        }
    };

    // JOIN
    const handleJoin = async () => {
        try {
            if (!code.trim()) {
                alert("Enter join code");
                return;
            }

            if (!token) {
                alert("Login required");
                return;
            }

            await axios.post(
                "http://localhost:5000/api/group/join",
                { code },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            await fetchGroups?.();

            // ✅ redirect dashboard
            window.location.href = "/dashboard";

        } catch (err) {
            console.log(err.response?.data);
            alert(err.response?.data?.message || "Join failed");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">

            <div className="w-[420px] max-h-[90vh] overflow-y-auto p-8 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg relative cursor-pointer">

                <button
                    onClick={onClose}
                    className="absolute top-3 right-4 text-gray-600"
                >
                    ✕
                </button>

                <div className="flex justify-center gap-6 mb-6">
                    <button
                        onClick={() => {
                            setMode("create");
                            setCode("");
                        }}
                        className={`${mode === "create" ? "font-semibold text-[#00685f]" : "text-gray-500"}`}
                    >
                        Create
                    </button>

                    {!soloMode && (
                        <button
                            onClick={() => setMode("join")}
                            className={`${mode === "join" ? "font-semibold text-[#00685f]" : "text-gray-500"}`}
                        >
                            Join
                        </button>
                    )}
                </div>

                {mode === "create" && (
                    <>
                        <h2 className="text-xl font-semibold mb-4 text-center">
                            {soloMode ? "Create Solo Trip" : "Create Group"}
                        </h2>

                        <input
                            className="w-full p-3 border rounded-lg mb-3"
                            placeholder="Group Name"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />

                        <input
                            className="w-full p-3 border rounded-lg mb-3"
                            placeholder="Destination"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                        />

                        <div className="flex gap-4 w-full mt-2 mb-3">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="p-2 border rounded-lg w-1/2"
                            />

                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate}
                                className="p-2 border rounded-lg w-1/2"
                            />
                        </div>

                        {/* hide when solo */}
                        {!soloMode && (
                            <input
                                type="number"
                                className="w-full p-3 border rounded-lg mb-4"
                                placeholder="Max Members"
                                value={maxMembers}
                                onChange={(e) => setMaxMembers(Number(e.target.value))}
                                min={1}
                            />
                        )}

                        <button
                            onClick={handleCreate}
                            className="w-full bg-[#00685f] text-white py-2 rounded-lg"
                        >
                            Create
                        </button>
                    </>
                )}

                {mode === "join" && !soloMode && (
                    <>
                        <h2 className="text-xl font-semibold mb-4 text-center">
                            Join Group
                        </h2>

                        <input
                            className="w-full p-3 border rounded-lg mb-4"
                            placeholder="Enter join code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />

                        <button
                            onClick={handleJoin}
                            className="w-full bg-[#00685f] text-white py-2 rounded-lg"
                        >
                            Join
                        </button>
                    </>
                )}

            </div>
        </div>
    );
}

export default GroupModal;