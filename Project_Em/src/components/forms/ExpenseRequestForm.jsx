import { useState } from "react";
import { Card, Form, Button, Alert, ListGroup } from "react-bootstrap";
import { useAppContext } from "../../provider/AppProvider";

function ExpenseRequestForm() {
  const { createRequest } = useAppContext();

  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState("");

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFileNames = files.map((file) => file.name);
    setAttachments((prev) => [...new Set([...prev, ...newFileNames])]);
    e.target.value = null;
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!purpose || !amount) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (Number(amount) <= 0) {
      setError("Số tiền phải lớn hơn 0");
      return;
    }

    await createRequest(2, title, {
      purpose,
      amount: Number(amount),
      note,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    alert("Tạo đơn thành công");

    // Reset form
    setTitle("");
    setPurpose("");
    setAmount("");
    setNote("");
    setAttachments([]);
    setError("");
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
            <Form.Control value={title} onChange={(e) => setTitle(e.target.value)} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Mục đích / Nội dung *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Số tiền (VND) *</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ghi chú thêm</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Form.Group>

          {/* Phần chọn file từ máy */}
          <Form.Group className="mb-4">
            <Form.Label>File đính kèm (chọn từ máy tính)</Form.Label>
            <Form.Control type="file" multiple onChange={handleFileSelect} />
            <Form.Text className="text-muted">
              Chọn một hoặc nhiều file. Chỉ tên file sẽ được lưu.
            </Form.Text>

            {attachments.length > 0 && (
              <div className="mt-3">
                <h6>File đã chọn:</h6>
                <ListGroup>
                  {attachments.map((fileName, idx) => (
                    <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-center">
                      {fileName}
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeAttachment(idx)}
                      >
                        Xóa
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            )}
          </Form.Group>

          <div className="text-end">
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