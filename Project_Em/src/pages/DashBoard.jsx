import { useAppContext } from "../provider/AppProvider";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";

function DashBoard() {
  const { forms, requests } = useAppContext();
  const { user, isLoggedIn } = useAuth();

  const [availableForms, setAvailableForms] = useState([]);
  const [activeTab, setActiveTab] = useState("service");

  const [userRequests, setUserRequests] = useState({
    inprogress: [],
    finish: [],
    reject: [],
    cancel: [],
    needApproval: [],
  });

  useEffect(() => {
    if (!user) return;

    setAvailableForms(
      forms.filter((form) => form.allowedDepartmentsId.includes(user.departmentId))
    );

    const inprogress = requests.filter(
      (r) => r.creatorId === user.id && r.status === "inprogress"
    );
    const finish = requests.filter(
      (r) => r.creatorId === user.id && r.status === "finish"
    );
    const reject = requests.filter(
      (r) => r.creatorId === user.id && r.status === "reject"
    );
    const cancel = requests.filter(
      (r) => r.creatorId === user.id && r.status === "cancel"
    );

    const needApproval =
      user.roleId !== 1
        ? requests.filter((r) =>
            r.requestApprovalSteps?.some(
              (step) => step.approverId === user.id && step.status === "pending"
            )
          )
        : [];

    setUserRequests({ inprogress, finish, reject, cancel, needApproval });
  }, [forms, requests, user]);

  if (!isLoggedIn) {
    return (
      <div className="text-center mt-5">
        <p>You are not logged in. </p>
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

  if (user?.roleId !== 1) tabs.push({ key: "needApproval", label: "Need Approval" });

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
                    <button className="btn btn-success btn-sm">Create Form</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted">Don't have service</p>
          )
        ) : userRequests[activeTab]?.length > 0 ? (
          userRequests[activeTab].map((req) => (
            <div className="col-md-4 mb-3" key={req.id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{req.title}</h5>
                  <p className="card-text">
                    <small className="text-muted">
                      {forms.find((f) => f.id === req.formId)?.name}
                    </small>
                  </p>
                  <p>
                    Status: <strong>{req.status}</strong>
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted">No request</p>
        )}
      </div>
    </>
  );
}

export default DashBoard;