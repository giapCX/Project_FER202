import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import ServiceForms from "../components/ServiceForms";
import RequestList from "../components/requests/RequestList";
import RequestHistory from "../components/requests/RequestHistory";

function Dashboard() {
  const { isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState("service");

  if (!isLoggedIn) {
    return <p>Please login</p>;
  }

  const tabs = [
    { key: "service", label: "Service" },
    { key: "list", label: "Danh sách đơn" },
    { key: "history", label: "Lịch sử đơn" },
  ];

  return (
    <>
      <ul className="nav nav-tabs mb-4">
        {tabs.map((tab) => (
          <li key={tab.key} className="nav-item">
            <button
              className={`nav-link ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      {activeTab === "service" && <ServiceForms />}

      {activeTab === "list" && <RequestList />}

      {activeTab === "history" && <RequestHistory />}
    </>
  );
}

export default Dashboard;