import { useAppContext } from "../provider/AppProvider";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import EmployeeManager from "../components/EmployeeManager";
import RequestList from "../components/requests/RequestList";
import RequestHistory from "../components/requests/RequestHistory";

function DashBoard() {
  const { forms, requests, requestApprovalSteps } = useAppContext();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [availableForms, setAvailableForms] = useState([]);
  const [activeTab, setActiveTab] = useState("service");

  const [userRequests, setUserRequests] = useState({
    inprogress: [],
    finish: [],
    reject: [],
    cancel: [],
    needApproval: [],
    approved: [],
  });

  useEffect(() => {
    if (!user) return;

    setAvailableForms(
      forms.filter((form) =>
        form.allowedDepartmentsId?.includes(user.departmentId),
      ),
    );

    const myRequests = requests.filter((r) => r.creatorId === user.id);

    const inprogress = myRequests.filter((r) => r.status === "inprogress");

    const finish = myRequests.filter(
      (r) => r.status === "finish" || r.status === "approved",
    );

    const reject = myRequests.filter(
      (r) => r.status === "reject" || r.status === "rejected",
    );

    const cancel = myRequests.filter((r) => r.status === "cancel");

    setUserRequests((prev) => ({
      ...prev,
      inprogress,
      finish,
      reject,
      cancel,
    }));
  }, [forms, requests, user]);

  useEffect(() => {
    if (!user || !requestApprovalSteps?.length) return;

    const pendingSteps = requestApprovalSteps.filter(
      (step) => step.status === "pending" && step.approverId === user.id,
    );

    const pendingIds = pendingSteps.map((s) => s.requestId);

    const needApproval = requests.filter((r) => pendingIds.includes(r.id));

    const approvedSteps = requestApprovalSteps.filter(
      (step) => step.status === "approved" && step.approverId === user.id,
    );

    const approvedIds = approvedSteps.map((s) => s.requestId);

    const approved = requests.filter((r) => approvedIds.includes(r.id));

    setUserRequests((prev) => ({
      ...prev,
      needApproval,
      approved,
    }));
  }, [requests, requestApprovalSteps, user]);

  const handleCreate = (formCode) => {
    switch (formCode) {
      case "leave_application":
        navigate("/leave");
        break;
      case "expense_advance_request":
        navigate("/expense");
        break;
      case "internal_transfer_request":
        navigate("/transfer");
        break;
      case "sales_contract_discount_approval":
        navigate("/sales-contract");
        break;
      case "marketing_budget_campaign_proposal":
        navigate("/marketing-budget");
        break;
      default:
        alert("Form chưa được cấu hình route");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="text-center mt-5">
        <p>You are not logged in.</p>
        <Link to="/" className="btn btn-success btn-sm">
          Please click this link to log in.
        </Link>
      </div>
    );
  }

  const tabs = [
    { key: "service", label: "Service" },
    { key: "inprogress", label: "Ongoing Request" },
    { key: "finish", label: "Finished Request" },
    { key: "reject", label: "Rejected Request" },
    { key: "cancel", label: "Canceled Request" },
    { key: "requestList", label: "Request List" },
    { key: "requestHistory", label: "Request History" },
  ];

  if (user?.roleId !== 1) {
    tabs.push({ key: "needApproval", label: "Need Approval" });
    tabs.push({ key: "approved", label: "Approved by Me" });
  }

  if (user?.roleId === 2 && user?.departmentId === 1) {
    tabs.push({ key: "employeeManagement", label: "Employee Management" });
  }

  return (
    <>
      <ul className="nav nav-tabs mb-4">
        {tabs.map((tab) => (
          <li className="nav-item" key={tab.key}>
            <button
              className={`nav-link ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="row">
        {activeTab === "service" ? (
          availableForms.length > 0 ? (
            availableForms.map((form) => (
              <div className="col-md-4 mb-3" key={form.id}>
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">{form.name}</h5>
                    <p className="card-text">
                      <small className="text-muted">{form.code}</small>
                    </p>

                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleCreate(form.code)}
                    >
                      Create Form
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted">Don't have service</p>
          )
        ) : activeTab === "employeeManagement" ? (
          <div className="col-12">
            <EmployeeManager />
          </div>
        ) : activeTab === "requestList" ? (
          <div className="col-12">
            <RequestList />
          </div>
        ) : activeTab === "requestHistory" ? (
          <div className="col-12">
            <RequestHistory />
          </div>
        ) : userRequests[activeTab]?.length > 0 ? (
          userRequests[activeTab].map((req) => {
            const form = forms.find((f) => f.id === req.formId);
            return (
              <div className="col-md-4 mb-3" key={req.id}>
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">{req.title}</h5>
                    <p className="text-muted mb-2">
                      <small>{form?.name}</small>
                    </p>
                    <p className="mb-3">
                      Status:{" "}
                      <span className="badge bg-info text-dark">
                        {req.status}
                      </span>
                    </p>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/request/${req.id}`)}
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-muted">No request</p>
        )}
      </div>
    </>
  );
}

export default DashBoard;
