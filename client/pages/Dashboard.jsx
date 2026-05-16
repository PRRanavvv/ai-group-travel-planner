import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import EmptyDashboard from "./EmptyDashboard.jsx";
import TripsDashboard from "./TripsDashboard.jsx";
import { getMyGroups } from "../src/api/groupApi";

function Dashboard() {

    const navigate = useNavigate();
    const [groups, setGroups] = useState(null); // null = loading

    const fetchGroups = async () => {
        try {
            const data = await getMyGroups();
            setGroups(data.groups ?? []);

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
