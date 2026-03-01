import { useState } from "react";
import { Container, Card, Form, Button, Row, Col, Alert, Image } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import { useAppContext } from "../provider/AppProvider";
import { useNavigate } from "react-router-dom";

function Profile() {
    const { user, login } = useAuth();
    const { updateEmployee, departments } = useAppContext();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: user?.fullName || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
        gender: user?.gender || "male",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    if (!user) {
        return <Container className="mt-5"><p>Please log in to view your profile.</p></Container>;
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!formData.fullName || !formData.email) {
            setError("Full Name and Email are required.");
            return;
        }

        try {
            const updatedUser = { ...user, ...formData };
            await updateEmployee(user.id, updatedUser);
            // Update local storage and context
            login(updatedUser);
            setSuccess("Profile updated successfully!");
            setIsEditing(false);
        } catch (err) {
            setError("Failed to update profile. Please try again.");
        }
    };

    return (
        <Container className="mt-5" style={{ maxWidth: "850px" }}>
            <Card className="shadow-sm">
                <Card.Header className="bg-success text-white">
                    <h5 className="mb-0">My Profile</h5>
                </Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Form onSubmit={handleSave}>
                        <Row>
                            <Col md={4} className="text-center mb-4 mb-md-0 border-end">
                                <Image
                                    src={user.avatar ? `/${user.avatar}` : "https://via.placeholder.com/150"}
                                    roundedCircle
                                    fluid
                                    style={{ width: "150px", height: "150px", objectFit: "cover", border: "3px solid #198754" }}
                                    className="mb-3 shadow-sm"
                                    alt="User Avatar"
                                />
                                <h5 className="fw-bold">{user.fullName}</h5>
                                <p className="text-muted mb-1">@{user.username}</p>
                                <span className="badge bg-success">
                                    {departments.find(d => d.id === user.departmentId)?.name || 'General'}
                                </span>
                            </Col>

                            <Col md={8} className="ps-md-4">
                                <h6 className="text-muted mb-4 border-bottom pb-2">Personal Information</h6>

                                <Row className="mb-3 align-items-center">
                                    <Col sm={4} className="fw-bold text-secondary">Username</Col>
                                    <Col sm={8}>
                                        <Form.Control type="text" value={user.username} disabled />
                                    </Col>
                                </Row>

                                <Row className="mb-3 align-items-center">
                                    <Col sm={4} className="fw-bold text-secondary">Full Name</Col>
                                    <Col sm={8}>
                                        <Form.Control
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            required
                                        />
                                    </Col>
                                </Row>

                                <Row className="mb-3 align-items-center">
                                    <Col sm={4} className="fw-bold text-secondary">Email</Col>
                                    <Col sm={8}>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            required
                                        />
                                    </Col>
                                </Row>

                                <Row className="mb-3 align-items-center">
                                    <Col sm={4} className="fw-bold text-secondary">Phone Number</Col>
                                    <Col sm={8}>
                                        <Form.Control
                                            type="text"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                        />
                                    </Col>
                                </Row>

                                <Row className="mb-3 align-items-center">
                                    <Col sm={4} className="fw-bold text-secondary">Gender</Col>
                                    <Col sm={8}>
                                        <Form.Select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </Form.Select>
                                    </Col>
                                </Row>

                                <div className="text-end mt-4 pt-3 border-top">
                                    {isEditing ? (
                                        <>
                                            <Button variant="outline-secondary" className="me-2" onClick={() => setIsEditing(false)}>
                                                Cancel
                                            </Button>
                                            <Button variant="success" type="submit">
                                                Save Changes
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button variant="outline-secondary" className="me-2" onClick={() => navigate(-1)}>
                                                Back
                                            </Button>
                                            <Button variant="primary" onClick={(e) => { e.preventDefault(); setIsEditing(true); }}>
                                                Edit Profile
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default Profile;
