import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import EmptyDashboard from "./EmptyDashboard.jsx";
import TripsDashboard from "./TripsDashboard.jsx";

function Dashboard() {

    const navigate = useNavigate();
    const [groups, setGroups] = useState(null); // null = loading

    const fetchGroups = async () => {
        try {
            const token = localStorage.getItem("token");

            const res = await axios.get(
                "http://localhost:5000/api/group/my-groups",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setGroups(res.data.groups ?? []);

        } catch {
            setGroups([]);
        }
    };

    // ✅ LOAD ON PAGE OPEN
    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/");
            return;
        }

        (async () => {
            await fetchGroups();
        })();

    }, [navigate]);

    // ✅ LOADING STATE
    if (groups === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading...
            </div>
        );
    }

    // ✅ SWITCH DASHBOARD
    return (
        <>
            {groups.length === 0 ? (
                <EmptyDashboard fetchGroups={fetchGroups} />
            ) : (
                <TripsDashboard groups={groups} fetchGroups={fetchGroups} />
            )}
        </>
    );
}

export default Dashboard;