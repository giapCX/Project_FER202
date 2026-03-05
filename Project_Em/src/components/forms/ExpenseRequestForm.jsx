import { useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { useAppContext } from "../../provider/AppProvider";

function ExpenseRequestForm() {
  const { createRequest } = useAppContext();

  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!purpose || !amount) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    await createRequest(2, title, {
      purpose,
      amount,
      note,
    });

    alert("Tạo đơn thành công");
  };

  return (
    <Card className="mt-4 shadow-sm">
      <Card.Header className="bg-success text-white">
        Tạo đơn: Expense & Advance Request
      </Card.Header>

      <Card.Body>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Tiêu đề đơn *</Form.Label>
            <Form.Control
              value={title}
              onChange={(e)=>setTitle(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Mục đích / Nội dung *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={purpose}
              onChange={(e)=>setPurpose(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Số tiền (VND) *</Form.Label>
            <Form.Control
              type="number"
              value={amount}
              onChange={(e)=>setAmount(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Ghi chú thêm</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={note}
              onChange={(e)=>setNote(e.target.value)}
            />
          </Form.Group>

          <div className="text-end">
            <Button variant="secondary" className="me-2">
              Hủy
            </Button>

            <Button type="submit" variant="success">
              Gửi đơn
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default ExpenseRequestForm;