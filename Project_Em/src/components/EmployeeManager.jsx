import { useState } from "react";
import { Table, Button, Form, Modal, Container, Row, Col } from "react-bootstrap";
import { useAppContext } from "../provider/AppProvider";

function EmployeeManager() {
    const { employees, departments, roles, addEmployee, updateEmployee, deleteEmployee } = useAppContext();

    const [filterDepartment, setFilterDepartment] = useState("");
    const [filterRole, setFilterRole] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        username: "",
        password: "",
        phoneNumber: "",
        gender: "male",
        departmentId: "",
        roleId: "",
    });

    // Filter employees
    const filteredEmployees = employees.filter((emp) => {
        const matchDept = filterDepartment ? emp.departmentId === parseInt(filterDepartment) : true;
        const matchRole = filterRole ? emp.roleId === parseInt(filterRole) : true;
        return matchDept && matchRole;
    });

    const getDepartmentName = (id) => departments.find(d => d.id === id)?.name || "N/A";
    const getRoleName = (id) => roles.find(r => r.id === id)?.name || "N/A";

    const handleClose = () => {
        setShowModal(false);
        setEditingEmployee(null);
        setFormData({
            fullName: "", email: "", username: "", password: "", phoneNumber: "", gender: "male", departmentId: "", roleId: ""
        });
    };

    const handleShow = (emp = null) => {
        if (emp) {
            setEditingEmployee(emp);
            setFormData(emp);
        } else {
            setEditingEmployee(null);
            setFormData({
                fullName: "", email: "", username: "", password: "", phoneNumber: "", gender: "male", departmentId: "", roleId: ""
            });
        }
        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === 'departmentId' || name === 'roleId' ? (value ? parseInt(value) : null) : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingEmployee) {
                await updateEmployee(editingEmployee.id, formData);
            } else {
                await addEmployee(formData);
            }
            handleClose();
        } catch (error) {
            alert("Error saving employee!");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this employee?")) {
            try {
                await deleteEmployee(id);
            } catch (error) {
                alert("Error deleting employee");
            }
        }
    };

    return (
        <Container fluid className="px-0">
            <Row className="mb-3 align-items-center">
                <Col md={3}>
                    <Form.Select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}>
                        <option value="">All Departments</option>
                        {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </Form.Select>
                </Col>
                <Col md={3}>
                    <Form.Select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                        <option value="">All Roles</option>
                        {roles.map((role) => (
                            <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                    </Form.Select>
                </Col>
                <Col md={6} className="text-end">
                    <Button variant="success" onClick={() => handleShow()}>+ Add New Employee</Button>
                </Col>
            </Row>

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Department</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredEmployees.length > 0 ? (
                        filteredEmployees.map((emp) => (
                            <tr key={emp.id}>
                                <td>{emp.id}</td>
                                <td>{emp.fullName}</td>
                                <td>{emp.username}</td>
                                <td>{getDepartmentName(emp.departmentId)}</td>
                                <td>{getRoleName(emp.roleId)}</td>
                                <td>
                                    <Button variant="primary" size="sm" className="me-2" onClick={() => handleShow(emp)}>Edit</Button>
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(emp.id)}>Delete</Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center text-muted">No employees found.</td>
                        </tr>
                    )}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={handleClose} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>{editingEmployee ? "Edit Employee" : "Add New Employee"}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Full Name <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Username <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" name="username" value={formData.username} onChange={handleChange} required disabled={!!editingEmployee} />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Password <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" name="password" value={formData.password} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Phone</Form.Label>
                                    <Form.Control type="text" name="phoneNumber" value={formData.phoneNumber || ""} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Gender</Form.Label>
                                    <Form.Select name="gender" value={formData.gender} onChange={handleChange}>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Department</Form.Label>
                                    <Form.Select name="departmentId" value={formData.departmentId || ""} onChange={handleChange}>
                                        <option value="">None</option>
                                        {departments.map((dept) => (
                                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Role <span className="text-danger">*</span></Form.Label>
                                    <Form.Select name="roleId" value={formData.roleId || ""} onChange={handleChange} required>
                                        <option value="">Select Role</option>
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button variant="success" type="submit">
                            Save Employee
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

        </Container>
    );
}

export default EmployeeManager;
