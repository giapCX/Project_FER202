import { useAppContext } from "../provider/AppProvider";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import EmployeeManager from "../components/EmployeeManager";

function DashBoard() {
  const { forms, requests } = useAppContext();
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

    const inprogress = requests.filter(
      (r) => r.creatorId === user.id && r.status === "inprogress",
    );

    const finish = requests.filter(
      (r) => r.creatorId === user.id && r.status === "finish",
    );

    const reject = requests.filter(
      (r) => r.creatorId === user.id && r.status === "reject",
    );

    const cancel = requests.filter(
      (r) => r.creatorId === user.id && r.status === "cancel",
    );

    const needApproval =
      user.roleId !== 1
        ? requests.filter((r) =>
          r.requestApprovalSteps?.some(
            (step) => {
              const isMyRole = step.approverRoleId === user.roleId;
              const isMyDept = step.approverDepartmentId ? step.approverDepartmentId === user.departmentId : true;
              return isMyRole && isMyDept && step.status === "pending";
            }
          ),
        )
        : [];

    const approved =
      user.roleId !== 1
        ? requests.filter((r) =>
          r.requestApprovalSteps?.some(
            (step) => {
              const isMyRole = step.approverRoleId === user.roleId;
              const isMyDept = step.approverDepartmentId ? step.approverDepartmentId === user.departmentId : true;
              return isMyRole && isMyDept && step.status === "approved";
            }
          ),
        )
        : [];

    setUserRequests({
      inprogress,
      finish,
      reject,
      cancel,
      needApproval,
      approved,
    });
  }, [forms, requests, user]);

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
  ];

  if (user?.roleId !== 1) {
    tabs.push({ key: "needApproval", label: "Need Approval" });
    tabs.push({ key: "approved", label: "Approved by Me" });
  }

  // Add Employee Management tab for HR Manager
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
                      Status: <span className="badge bg-info text-dark">{req.status}</span>
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
