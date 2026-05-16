import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowRight,
  FiChevronDown,
  FiChevronUp,
  FiLoader,
  FiMoon,
  FiRefreshCw,
  FiSend,
  FiSun
} from "react-icons/fi";
import { getGroup } from "../src/api/groupApi";
import { generateItinerary, partialRegenerate } from "../src/api/planningApi";

const promptToInterests = (prompt = "") => {
  const text = prompt.toLowerCase();
  const rules = [
    ["heritage", ["heritage", "history", "temple", "fort", "culture"]],
    ["food", ["food", "cafe", "cafes", "restaurant", "local food"]],
    ["adventure", ["adventure", "snow", "trek", "hike", "rafting"]],
    ["wellness", ["wellness", "relax", "slow", "spa", "hot spring"]],
    ["shopping", ["shopping", "market", "souvenir"]],
    ["nature", ["nature", "scenic", "views", "viewpoint", "forest"]]
  ];

  const matched = rules
    .filter(([, words]) => words.some((word) => text.includes(word)))
    .map(([interest]) => interest);

  return matched.length ? matched : ["heritage", "food"];
};

const getTripDays = (group) => {
  if (!group?.startDate || !group?.endDate) return 3;
  const start = new Date(group.startDate);
  const end = new Date(group.endDate);
  return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
};

const GraphItineraryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const generatedOnce = useRef(false);
  const [group, setGroup] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedDay, setExpandedDay] = useState(1);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("wayfinder-theme") === "dark");
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "I can shape this route around your mood: slow cafes, scenic mornings, low budget, premium stays, or less travel fatigue."
    }
  ]);
  const [error, setError] = useState("");

  const activeItinerary = group?.aiPlanning?.activeItinerary;
  const itineraryDays = useMemo(
    () => activeItinerary?.days || group?.itinerary || [],
    [activeItinerary?.days, group?.itinerary]
  );

  const totalStops = useMemo(
    () => itineraryDays.reduce((sum, day) => sum + (day.activities?.length || 0), 0),
    [itineraryDays]
  );

  useEffect(() => {
    localStorage.setItem("wayfinder-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const trip = await getGroup(id);
        setGroup(trip);
        setPrompt(trip.userPreferences?.planningPrompt || "");
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load graph itinerary.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const applyItinerary = useCallback((itinerary) => {
    setGroup((current) => ({
      ...current,
      itinerary: itinerary.days,
      aiPlanning: {
        ...(current?.aiPlanning || {}),
        activeItinerary: itinerary,
        validation: itinerary.validation,
        reliability: itinerary.reliability,
        explanations: itinerary.explanations,
        evaluationMetrics: itinerary.evaluationMetrics
      }
    }));
    setExpandedDay(itinerary.days?.[0]?.day || 1);
  }, []);

  const handleGenerate = useCallback(async (nextPrompt = prompt, automatic = false) => {
    try {
      setGenerating(true);
      setError("");
      if (!automatic) {
        setMessages((items) => [...items, { role: "user", text: nextPrompt || "Generate a balanced itinerary." }]);
      }

      const result = await generateItinerary({
        groupId: id,
        input: {
          destination: group?.destination,
          days: getTripDays(group),
          budget: "balanced",
          interests: promptToInterests(nextPrompt),
          planningPrompt: nextPrompt
        }
      });

      applyItinerary(result.itinerary);
      setMessages((items) => [
        ...items,
        {
          role: "ai",
          text: `Built a ${result.itinerary.days.length}-day graph with ${result.itinerary.days.reduce((sum, day) => sum + day.activities.length, 0)} grounded stops.`
        }
      ]);
    } catch (err) {
      setError(err.response?.data?.message || "Graph itinerary generation failed.");
    } finally {
      setGenerating(false);
    }
  }, [applyItinerary, group, id, prompt]);

  useEffect(() => {
    if (loading || !group || itineraryDays.length || generatedOnce.current) return;
    generatedOnce.current = true;
    handleGenerate(group.userPreferences?.planningPrompt || prompt, true);
  }, [handleGenerate, itineraryDays.length, loading, group, prompt]);

  const handleRefreshDay = async (day) => {
    try {
      setGenerating(true);
      setError("");
      const result = await partialRegenerate({
        groupId: id,
        operation: {
          type: "regenerateDay",
          day,
          replacementInterests: promptToInterests(prompt),
          reason: `Graph workspace refresh for Day ${day}`
        }
      });
      applyItinerary(result.updatedItinerary);
      setMessages((items) => [...items, { role: "ai", text: `Regenerated Day ${day} while preserving the rest of the trip.` }]);
    } catch (err) {
      setError(err.response?.data?.message || "Day regeneration failed.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950 text-white">
        <div className="flex items-center gap-3">
          <FiLoader className="animate-spin" />
          Loading graph workspace...
        </div>
      </div>
    );
  }

  const shell = darkMode
    ? "bg-[#070b10] text-white"
    : "bg-[#eef4f1] text-slate-950";
  const panel = darkMode
    ? "bg-white/7 border-white/10"
    : "bg-white/80 border-white";
  const muted = darkMode ? "text-slate-400" : "text-slate-500";

  return (
    <div className={`min-h-screen ${shell}`}>
      <div className="px-6 py-5 flex items-center justify-between border-b border-white/10">
        <div>
          <button onClick={() => navigate(`/trip/${id}`)} className={`text-sm ${muted}`}>
            Workspace
          </button>
          <h1 className="text-2xl font-semibold mt-1">{group?.destination || "WayFinder Graph"}</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/trip/${id}/itinerary`)}
            className={`px-4 py-2 rounded-full text-sm border ${darkMode ? "border-white/10" : "border-slate-200"}`}
          >
            Classic itinerary
          </button>
          <button
            onClick={() => setDarkMode((value) => !value)}
            className={`p-3 rounded-full border ${darkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}
            aria-label="Toggle theme"
          >
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>
        </div>
      </div>

      <main className="grid grid-cols-1 xl:grid-cols-[1fr_390px] gap-6 p-6">
        <section className={`rounded-[28px] border ${panel} p-6 shadow-2xl shadow-black/10 overflow-hidden`}>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <p className={`uppercase text-xs tracking-[0.22em] ${muted}`}>AI graph itinerary</p>
              <h2 className="text-4xl font-semibold mt-2">Trip map as connected days</h2>
              <p className={`${muted} mt-2`}>
                {itineraryDays.length || getTripDays(group)} days · {totalStops} planned stops · expandable day nodes
              </p>
            </div>

            <button
              onClick={() => handleGenerate(prompt)}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 disabled:opacity-60"
            >
              {generating ? <FiLoader className="animate-spin" /> : <FiRefreshCw />}
              Regenerate graph
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="relative min-h-[620px]">
            <div className="absolute inset-0 opacity-40">
              <div className={`h-full w-full ${darkMode ? "bg-[radial-gradient(circle_at_25%_25%,rgba(16,185,129,0.24),transparent_26%),radial-gradient(circle_at_80%_40%,rgba(59,130,246,0.18),transparent_22%)]" : "bg-[radial-gradient(circle_at_30%_25%,rgba(16,185,129,0.18),transparent_28%),radial-gradient(circle_at_80%_50%,rgba(20,184,166,0.16),transparent_24%)]"}`} />
            </div>

            <div className="relative grid gap-8">
              {(itineraryDays.length ? itineraryDays : [{ day: 1, title: "Ready to generate", activities: [] }]).map((day, index) => {
                const expanded = expandedDay === day.day;
                return (
                  <div key={day.day} className="relative">
                    {index < itineraryDays.length - 1 && (
                      <div className="absolute left-[42px] top-[96px] bottom-[-32px] border-l-2 border-dashed border-emerald-400/60" />
                    )}

                    <div className="flex gap-5 items-start">
                      <div className="relative z-10 flex h-[84px] w-[84px] shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/30">
                        <div className="text-center">
                          <div className="text-[10px] uppercase tracking-widest opacity-80">Day</div>
                          <div className="text-2xl font-bold">{day.day}</div>
                        </div>
                      </div>

                      <div className={`w-full rounded-3xl border ${darkMode ? "border-white/10 bg-black/30" : "border-white bg-white/90"} p-5 backdrop-blur-xl`}>
                        <button
                          onClick={() => setExpandedDay(expanded ? null : day.day)}
                          className="w-full text-left"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-xl font-semibold">{day.title || `Day ${day.day}`}</h3>
                              <p className={`${muted} mt-1`}>{day.subtitle || "Generate to fill this day with grounded recommendations."}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`rounded-full px-3 py-1 text-xs ${darkMode ? "bg-white/10" : "bg-slate-100"}`}>
                                {day.activities?.length || 0} stops
                              </span>
                              {expanded ? <FiChevronUp /> : <FiChevronDown />}
                            </div>
                          </div>
                        </button>

                        {expanded && (
                          <div className="mt-5 grid gap-3">
                            {(day.activities || []).map((activity, activityIndex) => (
                              <div
                                key={activity.placeId || `${day.day}-${activityIndex}`}
                                className={`rounded-2xl border ${darkMode ? "border-white/10 bg-white/5" : "border-slate-100 bg-slate-50"} p-4`}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500">{activity.time}</p>
                                    <h4 className="mt-1 font-semibold">{activity.title}</h4>
                                    <p className={`${muted} mt-1 text-sm`}>{activity.description}</p>
                                  </div>
                                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs ${darkMode ? "bg-emerald-400/10 text-emerald-300" : "bg-emerald-100 text-emerald-700"}`}>
                                    {activity.type || "stop"}
                                  </span>
                                </div>
                              </div>
                            ))}

                            <button
                              onClick={() => handleRefreshDay(day.day)}
                              disabled={generating}
                              className={`mt-2 inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm ${darkMode ? "border-white/10" : "border-slate-200"}`}
                            >
                              <FiRefreshCw />
                              Re-plan this day
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <aside className={`rounded-[28px] border ${panel} p-5 shadow-2xl shadow-black/10 flex flex-col min-h-[720px]`}>
          <div className="mb-5">
            <p className={`uppercase text-xs tracking-[0.22em] ${muted}`}>WayFinder AI</p>
            <h2 className="text-2xl font-semibold mt-2">Prompt cockpit</h2>
            <p className={`${muted} text-sm mt-2`}>
              Ask for a mood or constraint, then regenerate the graph without leaving this page.
            </p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`rounded-2xl p-4 text-sm ${message.role === "user"
                  ? "bg-emerald-500 text-white ml-8"
                  : darkMode ? "bg-white/8" : "bg-white"}`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <div className={`mt-5 rounded-3xl border ${darkMode ? "border-white/10 bg-black/30" : "border-slate-200 bg-white"} p-3`}>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Example: Keep mornings scenic, add cafes, avoid too much travel, stay balanced budget."
              className={`min-h-[130px] w-full resize-none bg-transparent p-2 text-sm outline-none ${darkMode ? "placeholder:text-slate-500" : "placeholder:text-slate-400"}`}
            />
            <button
              onClick={() => handleGenerate(prompt)}
              disabled={generating}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {generating ? <FiLoader className="animate-spin" /> : <FiSend />}
              Generate graph itinerary
              <FiArrowRight />
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default GraphItineraryPage;
