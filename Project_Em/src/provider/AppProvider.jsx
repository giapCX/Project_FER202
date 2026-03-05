import { useEffect, useContext, useState, createContext } from "react";
import axios from "axios";

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user")),
  );

  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [forms, setForms] = useState([]);
  const [requests, setRequests] = useState([]);

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      const [rolesRes, departmentsRes, employeesRes, formsRes, requestsRes] =
        await Promise.all([
          axios.get("http://localhost:9999/roles"),
          axios.get("http://localhost:9999/departments"),
          axios.get("http://localhost:9999/employees"),
          axios.get("http://localhost:9999/forms"),
          axios.get("http://localhost:9999/requests"),
        ]);

      setRoles(rolesRes.data);
      setDepartments(departmentsRes.data);
      setEmployees(employeesRes.data);
      setForms(formsRes.data);
      setRequests(requestsRes.data);
    };

    fetchData();
  }, []);

  const fetchRequests = async () => {
    const res = await axios.get("http://localhost:9999/requests");
    setRequests(res.data);
  };

  /* ================= APPROVAL ENGINE ================= */

  const generateApprovalSteps = (formCode, fields) => {
    const steps = [];

    switch (formCode) {
      case "leave_application":
        steps.push(3, 4);
        if (fields.leaveDays > 3) steps.push(6);
        break;

      case "expense_advance_request":
        steps.push(3, 5);
        if (fields.amount > 5000000) steps.push(6);
        break;

      case "internal_transfer_request":
        steps.push(3, 4, 8);
        break;

      default:
        break;
    }

    return steps.map((roleId, index) => ({
      stepOrder: index + 1,
      approverRoleId: roleId,
      status: index === 0 ? "pending" : "waiting",
    }));
  };

  const createRequest = async (formId, title, fields) => {
    if (!user) throw new Error("Chưa đăng nhập");

    const form = forms.find((f) => f.id === formId);
    const approvalSteps = generateApprovalSteps(form.code, fields);

    const newRequest = {
      formId,
      title,
      creatorId: user.id,
      departmentId: user.departmentId,
      status: "inprogress",
      fields,
      requestApprovalSteps: approvalSteps,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await axios.post("http://localhost:9999/requests", newRequest);
    await fetchRequests();
  };

  const approveRequest = async (request) => {
    const steps = request.requestApprovalSteps.map((step) => {
      if (step.approverRoleId === user.roleId && step.status === "pending") {
        return { ...step, status: "approved" };
      }
      return step;
    });

    const nextStep = steps.find((s) => s.status === "waiting");
    if (nextStep) nextStep.status = "pending";

    const allApproved = steps.every((s) => s.status === "approved");

    const updatedRequest = {
      ...request,
      requestApprovalSteps: steps,
      status: allApproved ? "finish" : "inprogress",
      updatedAt: new Date().toISOString(),
    };

    await axios.put(
      `http://localhost:9999/requests/${request.id}`,
      updatedRequest,
    );

    await fetchRequests();
  };

  const rejectRequest = async (request) => {
    const updatedRequest = {
      ...request,
      status: "reject",
      updatedAt: new Date().toISOString(),
    };

    await axios.put(
      `http://localhost:9999/requests/${request.id}`,
      updatedRequest,
    );

    await fetchRequests();
  };

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        roles,
        departments,
        employees,
        forms,
        requests,
        createRequest,
        approveRequest,
        rejectRequest,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
export default AppProvider;
