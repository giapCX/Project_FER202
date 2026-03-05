import { useState } from "react";
import { Card, Form, Button, Alert, ListGroup } from "react-bootstrap";
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

  const calculateLeaveDays = () => {
    if (!startDate || !endDate) return 0;
    const diff =
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
    return diff >= 0 ? diff + 1 : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !startDate || !endDate || !reason) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const leaveDays = calculateLeaveDays();
    if (leaveDays <= 0) {
      setError("Ngày nghỉ không hợp lệ");
      return;
    }

    await createRequest(1, title, {
      startDate,
      endDate,
      leaveDays,
      reason,
      attachments,
    });

    alert("Tạo đơn thành công");
    navigate("/dashboard");
  };

  return (
    <Card className="mt-4 shadow-sm">
      <Card.Header className="bg-success text-white">
        Leave Application
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
            <Form.Label>Ngày bắt đầu *</Form.Label>
            <Form.Control
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ngày kết thúc *</Form.Label>
            <Form.Control
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
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
