import { useEffect, useContext, useState, createContext } from "react";
import axios from "axios";

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")));

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

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:9999/employees");
      setEmployees(res.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const addEmployee = async (newEmployee) => {
    try {
      const res = await axios.post("http://localhost:9999/employees", newEmployee);
      setEmployees([...employees, res.data]);
      return res.data;
    } catch (error) {
      console.error("Error adding employee:", error);
      throw error;
    }
  };

  const updateEmployee = async (id, updatedData) => {
    try {
      const res = await axios.put(`http://localhost:9999/employees/${id}`, updatedData);
      setEmployees(employees.map(emp => emp.id === id ? res.data : emp));
      return res.data;
    } catch (error) {
      console.error("Error updating employee:", error);
      throw error;
    }
  };

  const deleteEmployee = async (id) => {
    try {
      await axios.delete(`http://localhost:9999/employees/${id}`);
      setEmployees(employees.filter(emp => emp.id !== id));
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
        addEmployee,
        updateEmployee,
        deleteEmployee,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

export default AppProvider;