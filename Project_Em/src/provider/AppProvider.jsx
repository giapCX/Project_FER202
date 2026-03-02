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
  const [requestApprovalSteps, setRequestApprovalSteps] = useState([]);

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  // Fetch tất cả data ban đầu
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          rolesRes,
          departmentsRes,
          employeesRes,
          formsRes,
          requestsRes,
          stepsRes,
        ] = await Promise.all([
          axios.get("http://localhost:9999/roles"),
          axios.get("http://localhost:9999/departments"),
          axios.get("http://localhost:9999/employees"),
          axios.get("http://localhost:9999/forms"),
          axios.get("http://localhost:9999/requests"),
          axios.get("http://localhost:9999/requestApprovalSteps"),
        ]);

        setRoles(rolesRes.data);
        setDepartments(departmentsRes.data);
        setEmployees(employeesRes.data);
        setForms(formsRes.data);
        setRequests(requestsRes.data);
        setRequestApprovalSteps(stepsRes.data);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    fetchData();
  }, []);

  // Fetch employees riêng (đã có sẵn)
  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:9999/employees");
      setEmployees(res.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  // Fetch requests riêng (thêm mới để refresh sau khi tạo đơn)
  const fetchRequests = async () => {
    try {
      const res = await axios.get("http://localhost:9999/requests");
      setRequests(res.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  // Hàm tạo request mới (đây là phần chính bạn cần)
  const createRequest = async (formId, title, fields) => {
    if (!user) {
      throw new Error("Bạn chưa đăng nhập");
    }

    const newRequest = {
      formId,
      title,
      creatorId: user.id,
      departmentId: user.departmentId,
      status: "inprogress",
      fields, // object chứa các trường như leaveDays, fromDate, amount, purpose,...
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await axios.post(
        "http://localhost:9999/requests",
        newRequest,
      );
      // Refresh danh sách requests để Dashboard cập nhật ngay
      await fetchRequests();
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo đơn:", error);
      throw error;
    }
  };

  const addEmployee = async (newEmployee) => {
    try {
      const res = await axios.post(
        "http://localhost:9999/employees",
        newEmployee,
      );
      setEmployees([...employees, res.data]);
      return res.data;
    } catch (error) {
      console.error("Error adding employee:", error);
      throw error;
    }
  };

  const updateEmployee = async (id, updatedData) => {
    try {
      const res = await axios.put(
        `http://localhost:9999/employees/${id}`,
        updatedData,
      );
      setEmployees(employees.map((emp) => (emp.id === id ? res.data : emp)));
      return res.data;
    } catch (error) {
      console.error("Error updating employee:", error);
      throw error;
    }
  };

  const deleteEmployee = async (id) => {
    try {
      await axios.delete(`http://localhost:9999/employees/${id}`);
      setEmployees(employees.filter((emp) => emp.id !== id));
    } catch (error) {
      console.error("Error deleting employee:", error);
      throw error;
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        roles,
        departments,
        employees,
        forms,
        requests,
        requestApprovalSteps,
        fetchEmployees,
        fetchRequests, // thêm để dùng ở nơi khác nếu cần
        addEmployee,
        updateEmployee,
        deleteEmployee,
        createRequest, // thêm hàm tạo đơn
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

export default AppProvider;
