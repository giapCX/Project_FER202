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
      try {
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
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get("http://localhost:9999/requests");
      setRequests(res.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:9999/employees");
      setEmployees(res.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
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

  // ───────────────────────────────────────────────────────────────
  // HÀM TẠO ĐƠN - CHỈ THÊM LOGIC ĐIỀU KIỆN CHO ĐƠN NGHỈ PHÉP
  // ───────────────────────────────────────────────────────────────
  const createRequest = async (formId, title, fields) => {
    if (!user) throw new Error("Bạn chưa đăng nhập");

    const form = forms.find((f) => f.id === formId);
    if (!form) throw new Error("Form không tồn tại");

    // Tạo request mới
    const requestPayload = {
      formId,
      title,
      creatorId: user.id,
      departmentId: user.departmentId,
      status: "inprogress",
      fields,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const requestRes = await axios.post(
      "http://localhost:9999/requests",
      requestPayload,
    );
    const createdRequest = requestRes.data;

    // Lấy danh sách bước duyệt từ form.workflowSteps
    let approvalSteps = [...(form.workflowSteps || [])];

    // CHỈ ÁP DỤNG CHO ĐƠN NGHỈ PHÉP
    if (form.code === "leave_application") {
      const leaveDays = Number(fields.leaveDays) || 0;

      // Nếu nghỉ ≤ 3 ngày → loại bỏ bước General Manager
      if (leaveDays <= 3) {
        approvalSteps = approvalSteps.filter(
          (step) =>
            !step.condition || !step.condition.includes("leave_days > 3"),
        );
      }
      // Nếu > 3 ngày → giữ nguyên tất cả bước
    }

    // Tạo từng approval step
    for (const step of approvalSteps) {
      let approverId = null;

      // Bước 1: Trưởng phòng (manager cùng phòng)
      if (step.step === 1 && step.roleId === 2) {
        const deptManager = employees.find(
          (e) => e.departmentId === user.departmentId && e.roleId === 2,
        );
        approverId = deptManager?.id;
      }

      // Bước 2: HR Manager (departmentId=1, roleId=2)
      if (step.step === 2 && step.roleId === 2 && step.departmentId === 1) {
        const hrManager = employees.find(
          (e) => e.departmentId === 1 && e.roleId === 2,
        );
        approverId = hrManager?.id;
      }

      // Bước 3: General Manager (roleId=3)
      if (step.step === 3 && step.roleId === 3) {
        const gm = employees.find((e) => e.roleId === 3);
        approverId = gm?.id;
      }

      if (approverId) {
        await axios.post("http://localhost:9999/requestApprovalSteps", {
          requestId: createdRequest.id,
          step: step.step,
          approverId,
          status: "pending",
          comment: "",
        });
      }
    }

    // Refresh danh sách requests
    await fetchRequests();

    return createdRequest;
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
        addEmployee,
        updateEmployee,
        deleteEmployee,
        fetchRequests,
        fetchEmployees,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
export default AppProvider;
