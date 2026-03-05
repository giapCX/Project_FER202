import { useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { useAppContext } from "../../provider/AppProvider";
import { useNavigate } from "react-router-dom";

function ExpenseRequestForm() {
  const { createRequest } = useAppContext();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleCancel = () => {
    setTitle("");
    setAmount("");
    setDescription("");
    setError("");
    navigate("/dashboard");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !amount || !description) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    await createRequest(2, title, {
      amount,
      description,
    });

    alert("Tạo đơn thành công");
    navigate("/dashboard");
  };

  return (
    <Card className="mt-4 shadow-sm">
      <Card.Header className="bg-primary text-white">
        Expense Request
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
            <Form.Label>Số tiền *</Form.Label>
            <Form.Control
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Mô tả *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="outline-danger" onClick={handleCancel}>
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              Gửi đơn
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default ExpenseRequestForm;
