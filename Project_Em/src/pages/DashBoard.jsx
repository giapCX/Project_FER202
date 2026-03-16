import { useAppContext } from "../provider/AppProvider";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import EmployeeManager from "../components/EmployeeManager";
import RequestList from "../components/requests/RequestList";
import RequestHistory from "../components/requests/RequestHistory";

function DashBoard() {
  const { forms, requests, requestApprovalSteps, employees } = useAppContext();
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
  });

  // ===== GIỮ NGUYÊN LOGIC CỦA BẠN =====
  useEffect(() => {
    if (!user) return;

    setAvailableForms(forms);

    const myRequests = requests.filter((req) => req.creatorId === user.id);

    setUserRequests((prev) => ({
      ...prev,
      inprogress: myRequests.filter((req) => req.status === "inprogress"),
      finish: myRequests.filter(
        (req) => req.status === "finish" || req.status === "approved",
      ),
      reject: myRequests.filter(
        (req) => req.status === "reject" || req.status === "rejected",
      ),
      cancel: myRequests.filter((req) => req.status === "cancel"),
    }));
  }, [requests, user, forms]);

  useEffect(() => {
    if (!user || !requestApprovalSteps?.length) return;

    const pendingSteps = requestApprovalSteps.filter(
      (step) => step.status === "pending" && step.approverId === user.id,
    );

    const pendingRequestIds = pendingSteps.map((step) => step.requestId);

    const pendingRequests = requests.filter((req) =>
      pendingRequestIds.includes(req.id),
    );

    setUserRequests((prev) => ({
      ...prev,
      needApproval: pendingRequests,
    }));
  }, [requests, requestApprovalSteps, user]);

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

  // ===== FORM TAB GIỐNG FILE =====
  const tabs = [
    { key: "service", label: "Service" },
    {
      key: "ongoing",
      label: `Ongoing Request (${userRequests.inprogress.length})`,
    },
    {
      key: "needApproval",
      label: `Need Approval (${userRequests.needApproval.length})`,
    },
    {
      key: "finish",
      label: `Finished Request (${userRequests.finish.length})`,
    },
    {
      key: "reject",
      label: `Rejected Request (${userRequests.reject.length})`,
    },
    {
      key: "cancel",
      label: `Canceled Request (${userRequests.cancel.length})`,
    },
    { key: "requestList", label: "Request List" },
    { key: "requestHistory", label: "Request History" },
  ];

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
        {/* SERVICE */}
        {activeTab === "service" &&
          availableForms.map((form) => (
            <div className="col-md-4 mb-3" key={form.id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{form.name}</h5>
                  <p className="card-text">
                    <small className="text-muted">{form.code}</small>
                  </p>

                  <Link to={`/${form.code}`} className="btn btn-success btn-sm">
                    Create Form
                  </Link>
                </div>
              </div>
            </div>
          ))}

        {/* ONGOING */}
        {activeTab === "ongoing" &&
          (userRequests.inprogress.length > 0 ? (
            userRequests.inprogress.map((req) => {
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
                        Status:
                        <span className="badge bg-info text-dark ms-2">
                          {req.status}
                        </span>
                      </p>

                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/request/${req.id}`)}
                      >
                        View Detail
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-muted">Không có đơn đang xử lý</p>
          ))}

        {/* NEED APPROVAL */}
        {activeTab === "needApproval" &&
          (userRequests.needApproval.length > 0 ? (
            userRequests.needApproval.map((req) => {
              const form = forms.find((f) => f.id === req.formId);
              const creator = employees.find((e) => e.id === req.creatorId);

              return (
                <div className="col-md-4 mb-3" key={req.id}>
                  <div className="card h-100 shadow-sm border-warning">
                    <div className="card-body">
                      <h5 className="card-title">{req.title}</h5>

                      <p className="text-muted mb-2">
                        <small>
                          {form?.name} • Từ: {creator?.fullName || "N/A"}
                        </small>
                      </p>

                      <p className="mb-3">
                        Status:
                        <span className="badge bg-warning text-dark ms-2">
                          Pending Approval
                        </span>
                      </p>

                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => navigate(`/request/${req.id}`)}
                      >
                        Xem & Duyệt
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-muted">Không có đơn nào cần duyệt</p>
          ))}

        {/* FINISH */}
        {activeTab === "finish" &&
          (userRequests.finish.length > 0 ? (
            userRequests.finish.map((req) => {
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
                        Status:
                        <span className="badge bg-success ms-2">Finished</span>
                      </p>

                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/request/${req.id}`)}
                      >
                        View Detail
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-muted">Không có đơn đã hoàn thành</p>
          ))}

        {/* REJECT */}
        {activeTab === "reject" &&
          (userRequests.reject.length > 0 ? (
            userRequests.reject.map((req) => {
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
                        Status:
                        <span className="badge bg-danger ms-2">Rejected</span>
                      </p>

                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/request/${req.id}`)}
                      >
                        View Detail
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-muted">Không có đơn bị từ chối</p>
          ))}
      </div>

      <EmployeeManager />
      <RequestList />
      <RequestHistory />
    </>
  );
}

export default DashBoard;
