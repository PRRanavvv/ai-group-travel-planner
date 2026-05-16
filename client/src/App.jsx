import { Routes, Route } from "react-router-dom"
import "./App.css"
import Landing from "../pages/Landing.jsx"
import GroupModal from "../components/GroupModal.jsx";
import Dashboard from "../pages/Dashboard.jsx"
import TripPage from "../pages/TripPage.jsx"
import Itinerary from "../pages/ItineraryPage";
import ProposalPage from "../pages/ProposalPage";
import ProposalPreview from "../pages/ProposalPreview";
import GraphItineraryPage from "../pages/GraphItineraryPage";

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing/>} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/group" element={<GroupModal/>} />
        <Route path="/trip/:id" element={<TripPage />} />
        <Route path="/trip/:id/graph" element={<GraphItineraryPage />} />
        <Route path="/trip/:id/itinerary" element={<Itinerary />} />
        <Route path="/trip/:id/preview" element={<ProposalPreview />} />
        <Route path="/trip/:id/proposals" element={<ProposalPage />} />
      </Routes>
    </>
  )
}

export default App
