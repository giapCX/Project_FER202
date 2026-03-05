import { useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { useAppContext } from "../../provider/AppProvider";
import { useNavigate } from "react-router-dom";

function InternalTransferForm() {
  const { createRequest } = useAppContext();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [fromDepartment, setFromDepartment] = useState("");
  const [toDepartment, setToDepartment] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleCancel = () => {
    setTitle("");
    setFromDepartment("");
    setToDepartment("");
    setReason("");
    setError("");
    navigate("/dashboard");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !fromDepartment || !toDepartment || !reason) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    await createRequest(3, title, {
      fromDepartment,
      toDepartment,
      reason,
    });

    alert("Tạo đơn thành công");
    navigate("/dashboard");
  };

  return (
    <Card className="mt-4 shadow-sm">
      <Card.Header className="bg-warning text-dark">
        Internal Transfer
      </Card.Header>

      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Tiêu đề *</Form.Label>
            <Form.Control
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Phòng ban hiện tại *</Form.Label>
            <Form.Control
              value={fromDepartment}
              onChange={(e) => setFromDepartment(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Phòng ban chuyển đến *</Form.Label>
            <Form.Control
              value={toDepartment}
              onChange={(e) => setToDepartment(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Lý do *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="outline-danger" onClick={handleCancel}>
              Hủy
            </Button>
            <Button type="submit" variant="warning">
              Gửi đơn
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default InternalTransferForm;
