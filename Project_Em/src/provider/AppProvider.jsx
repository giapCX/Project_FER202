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
        // 1. Manager (cùng phòng người tạo)
        steps.push({ roleId: 2, departmentId: user.departmentId });
        // 2. HR Manager (role 2, dept 1 - HR)
        steps.push({ roleId: 2, departmentId: 1 });
        // 3. General Manager (nếu nghỉ > 3 ngày)
        if (fields.leaveDays > 3) steps.push({ roleId: 3 });
        break;

      case "expense_advance_request":
        // 1. Manager (cùng phòng người tạo)
        steps.push({ roleId: 2, departmentId: user.departmentId });
        // 2. Manager AF (role 2, dept 2 - AF)
        steps.push({ roleId: 2, departmentId: 2 });
        // 3. General Manager (nếu > 5tr)
        if (fields.amount > 5000000) steps.push({ roleId: 3 });
        break;

      case "internal_transfer_request":
        // 1. Manager (cùng phòng người tạo)
        steps.push({ roleId: 2, departmentId: user.departmentId });
        // 2. HR Manager (role 2, dept 1 - HR)
        steps.push({ roleId: 2, departmentId: 1 });
        // 3. Deputy General Director (role 4)
        steps.push({ roleId: 4 });
        break;

      case "sales_contract_discount_approval":
        // 1. Manager SA (Role 2, Dept 3 - SA)
        steps.push({ roleId: 2, departmentId: 3 });
        // 2. General Manager
        steps.push({ roleId: 3 });
        // 3. General Director (nếu giảm > 10%)
        if (fields.discount > 10) {
          steps.push({ roleId: 5 });
        }
        break;

      case "marketing_budget_campaign_proposal":
        // 1. Manager MK (Role 2, Dept 4 - Marketing)
        steps.push({ roleId: 2, departmentId: 4 });
        // 2. Manager AF (Role 2, Dept 2 - Accounting & Finance)
        steps.push({ roleId: 2, departmentId: 2 });
        // 3. Deputy General Director (nếu ngân sách > 10tr)
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
      const isMyRole = step.approverRoleId === user.roleId;
      const isMyDept = step.approverDepartmentId ? step.approverDepartmentId === user.departmentId : true;

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

  /* ================= EMPLOYEE MANAGEMENT ================= */

  const fetchEmployees = async () => {
    const res = await axios.get("http://localhost:9999/employees");
    setEmployees(res.data);
  };

  const addEmployee = async (employeeData) => {
    await axios.post("http://localhost:9999/employees", employeeData);
    await fetchEmployees();
  };

  const updateEmployee = async (id, employeeData) => {
    await axios.put(`http://localhost:9999/employees/${id}`, employeeData);
    await fetchEmployees();
  };

  const deleteEmployee = async (id) => {
    await axios.delete(`http://localhost:9999/employees/${id}`);
    await fetchEmployees();
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
        addEmployee,
        updateEmployee,
        deleteEmployee,
        fetchRequests,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
export default AppProvider;
