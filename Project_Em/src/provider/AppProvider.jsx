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
        steps.push({ roleId: 2, departmentId: user.departmentId });
        steps.push({ roleId: 2, departmentId: 1 });
        if (fields.leaveDays > 3) steps.push({ roleId: 3 });
        break;

      case "expense_advance_request":
        steps.push({ roleId: 2, departmentId: user.departmentId });
        steps.push({ roleId: 2, departmentId: 2 });
        if (fields.amount > 5000000) steps.push({ roleId: 3 });
        break;

      case "internal_transfer_request":
        steps.push({ roleId: 2, departmentId: user.departmentId });
        steps.push({ roleId: 2, departmentId: 1 });
        steps.push({ roleId: 4 });
        break;

      case "sales_contract_discount_approval":
        steps.push({ roleId: 2, departmentId: 3 });
        steps.push({ roleId: 3 });
        if (fields.discount > 10) {
          steps.push({ roleId: 5 });
        }
        break;

      case "marketing_budget_campaign_proposal":
        steps.push({ roleId: 2, departmentId: 4 });
        steps.push({ roleId: 2, departmentId: 2 });
        if (fields.budget > 10000000) {
          steps.push({ roleId: 4 });
        }
        break;

      default:
        break;
    }

    return steps.map((stepConfig, index) => ({
      stepOrder: index + 1,
      approverRoleId: stepConfig.roleId,
      approverDepartmentId: stepConfig.departmentId || null,
      status: index === 0 ? "pending" : "waiting",
    }));
  };

  const createRequest = async (formId, title, fields) => {
    if (!user) throw new Error("Chưa đăng nhập");

    const form = forms.find((f) => f.id === formId);

    // ✅ ADD: chống undefined form
    let safeForm = form;

    if (!safeForm) {
      safeForm = forms.find((f) => f.code === "leave_application");
    }

    if (!safeForm) {
      throw new Error("Form chưa load hoặc không tồn tại");
    }

    // ❌ dòng cũ (giữ nguyên)
    const approvalSteps = generateApprovalSteps(form?.code, fields);

    // ✅ ADD: dùng safeForm
    const fixedApprovalSteps = generateApprovalSteps(safeForm.code, fields);

    const newRequest = {
      formId,
      title,
      creatorId: user.id,
      departmentId: user.departmentId,
      status: "inprogress",
      fields,

      // ❌ giữ nguyên (nhưng sẽ bị override)
      requestApprovalSteps: approvalSteps,

      // ✅ ADD: override lại
      requestApprovalSteps: fixedApprovalSteps,

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await axios.post("http://localhost:9999/requests", newRequest);
    await fetchRequests();
  };

  const approveRequest = async (request) => {
    const steps = request.requestApprovalSteps.map((step) => {
      const isMyRole = step.approverRoleId === user.roleId;
      const isMyDept = step.approverDepartmentId
        ? step.approverDepartmentId === user.departmentId
        : true;

      if (isMyRole && isMyDept && step.status === "pending") {
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
    const steps = request.requestApprovalSteps.map((step) => {
      const isMyRole = step.approverRoleId === user.roleId;
      const isMyDept = step.approverDepartmentId
        ? step.approverDepartmentId === user.departmentId
        : true;

      if (isMyRole && isMyDept && step.status === "pending") {
        return { ...step, status: "rejected" };
      }
      return step;
    });

    const updatedRequest = {
      ...request,
      requestApprovalSteps: steps,
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
        fetchRequests,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
export default AppProvider;
