import { useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { useAppContext } from "../../provider/AppProvider";
import { useNavigate } from "react-router-dom";

function LeaveRequestForm() {
  const { createRequest } = useAppContext();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState("");

  const handleCancel = () => {
    setTitle("");
    setStartDate("");
    setEndDate("");
    setReason("");
    setAttachments([]);
    setError("");
    navigate("/dashboard");
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const fileNames = files.map((file) => file.name);
    setAttachments((prev) => [...new Set([...prev, ...fileNames])]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !startDate || !endDate || !reason) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      setError("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu");
      return;
    }

    // Tính số ngày nghỉ (bao gồm cả ngày đầu và cuối)
    const diffTime = Math.abs(end - start);
    const leaveDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    try {
      await createRequest(1, title, {
        startDate,
        endDate,
        leaveDays, // Quan trọng: gửi leaveDays để lọc bước duyệt
        reason,
        attachments,
      });

      alert("Tạo đơn nghỉ phép thành công!");
      navigate("/dashboard");
    } catch (err) {
      setError("Lỗi khi tạo đơn: " + (err.message || "Không tạo được"));
    }
  };

  return (
    <Card className="mt-4 shadow-sm">
      <Card.Header className="bg-primary text-white">
        Đơn xin nghỉ phép
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Tiêu đề đơn *</Form.Label>
            <Form.Control
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Từ ngày *</Form.Label>
            <Form.Control
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Đến ngày *</Form.Label>
            <Form.Control
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Lý do *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>File đính kèm</Form.Label>
            <Form.Control type="file" multiple onChange={handleFileSelect} />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="outline-danger" onClick={handleCancel}>
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

export default LeaveRequestForm;
