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
      setRequests(normalizeRequests(requestsRes.data));
    };

    fetchData();
  }, []);

  const ensureInternalTransferSteps = (req) => {
    if (!req || req.formId !== 5) return req?.requestApprovalSteps;

    const deptId = req.departmentId;
    const existing = Array.isArray(req.requestApprovalSteps)
      ? req.requestApprovalSteps
      : [];

    const base = [
      { stepOrder: 1, approverRoleId: 2, approverDepartmentId: deptId || null },
      { stepOrder: 2, approverRoleId: 2, approverDepartmentId: 1 },
      { stepOrder: 3, approverRoleId: 4, approverDepartmentId: null },
      { stepOrder: 4, approverRoleId: 2, approverDepartmentId: 1 },
    ];

    if (existing.length >= 4) return existing;

    const merged = base.map((b) => {
      const match = existing.find((s) => {
        const sameRole = Number(s.approverRoleId) === Number(b.approverRoleId);
        const sameDept =
          (s.approverDepartmentId ?? null) === (b.approverDepartmentId ?? null);
        const sameOrder =
          s.stepOrder ? Number(s.stepOrder) === Number(b.stepOrder) : true;
        return sameRole && sameDept && sameOrder;
      });
      return {
        ...b,
        status: match?.status,
      };
    });

    const hasPending = merged.some((s) => s.status === "pending");
    return merged.map((s, idx) => ({
      ...s,
      status:
        s.status || (hasPending ? "waiting" : idx === 0 ? "pending" : "waiting"),
    }));
  };

  const normalizeRequests = (list) => {
    const arr = Array.isArray(list) ? list : [];
    return arr.map((r) => {
      if (r?.formId !== 5) return r;
      const fixedSteps = ensureInternalTransferSteps(r);
      return fixedSteps ? { ...r, requestApprovalSteps: fixedSteps } : r;
    });
  };

  const fetchRequests = async () => {
    const res = await axios.get("http://localhost:9999/requests");
    setRequests(normalizeRequests(res.data));
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
        // Step 1: Manager cùng phòng
        steps.push({ roleId: 2, departmentId: user.departmentId });

        // chỉ thêm step 2 nếu KHÁC phòng AF
        if (user.departmentId !== 2) {
          steps.push({ roleId: 2, departmentId: 2 });
        }

        // Step 3: GM nếu > 5tr
        if (fields.amount > 5000000) {
          steps.push({ roleId: 3 });
        }
        break;

      case "internal_transfer_request":
        // Workflow:
        // employee creates -> manager (same dept) -> HR manager (role 2, dept 1)
        // -> deputy general director (role 4) -> HR manager executes edit employee
        steps.push({ roleId: 2, departmentId: user.departmentId });
        steps.push({ roleId: 2, departmentId: 1 });
        steps.push({ roleId: 4 });
        steps.push({ roleId: 2, departmentId: 1 });
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

    let safeForm = form;
    if (!safeForm) {
      safeForm = forms.find((f) => f.code === "leave_application");
    }
    if (!safeForm) {
      throw new Error("Form chưa load hoặc không tồn tại");
    }

    const approvalSteps = generateApprovalSteps(form?.code, fields);
    const fixedApprovalSteps = generateApprovalSteps(safeForm.code, fields);

    const newRequest = {
      formId,
      title,
      creatorId: user.id,
      departmentId: user.departmentId,
      status: "inprogress",
      fields,
      requestApprovalSteps: approvalSteps,
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

    let foundNext = false;

    const updatedSteps = steps.map((step) => {
      if (!foundNext && step.status === "waiting") {
        foundNext = true;
        return { ...step, status: "pending" };
      }
      return step;
    });

    const allApproved = updatedSteps.every((s) => s.status === "approved");

    const updatedRequest = {
      ...request,
      requestApprovalSteps: updatedSteps,
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
      status: "reject",
      requestApprovalSteps: steps,
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
