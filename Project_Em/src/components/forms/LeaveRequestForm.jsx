import { useState } from "react";
import { Card, Form, Button, Alert, ListGroup } from "react-bootstrap";
import { useAppContext } from "../../provider/AppProvider";

function LeaveRequestForm() {
  const { createRequest } = useAppContext();

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [attachments, setAttachments] = useState([]); // mảng tên file
  const [error, setError] = useState("");

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFileNames = files.map((file) => file.name);
    setAttachments((prev) => [...new Set([...prev, ...newFileNames])]); // tránh trùng tên
    e.target.value = null; // reset input để chọn lại cùng file nếu cần
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !startDate || !endDate || !reason) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    await createRequest(1, title, {
      startDate,
      endDate,
      reason,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    alert("Tạo đơn nghỉ phép thành công");
    // Reset form nếu muốn
    setTitle("");
    setStartDate("");
    setEndDate("");
    setReason("");
    setAttachments([]);
    setError("");
  };

  return (
    <Card className="mt-4 shadow-sm">
      <Card.Header className="bg-success text-white">
        Tạo đơn: Leave Application
      </Card.Header>

      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Tiêu đề đơn *</Form.Label>
            <Form.Control value={title} onChange={(e) => setTitle(e.target.value)} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ngày bắt đầu *</Form.Label>
            <Form.Control
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ngày kết thúc *</Form.Label>
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

export default LeaveRequestForm;