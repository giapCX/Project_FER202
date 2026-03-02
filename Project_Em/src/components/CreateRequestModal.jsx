import { useState } from "react";
import { Modal, Form, Button, Row, Col, Alert } from "react-bootstrap";
import { useAppContext } from "../provider/AppProvider";

function CreateRequestModal({ show, onHide, selectedForm }) {
  const { createRequest, user } = useAppContext();

  const [title, setTitle] = useState("");
  const [fields, setFields] = useState({});
  const [attachments, setAttachments] = useState([]); // lưu mảng tên file
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!show || !selectedForm) return null;

  const isLeave = selectedForm.code === "leave_application";
  const isExpense = selectedForm.code === "expense_advance_request";

  const resetForm = () => {
    setTitle("");
    setFields({});
    setAttachments([]);
    setError("");
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    let parsed = value;
    if (["leaveDays", "amount"].includes(name)) {
      parsed = value === "" ? "" : Number(value);
    }
    setFields((prev) => ({ ...prev, [name]: parsed }));
  };

  // Xử lý chọn file từ máy tính → tự động lấy tên file
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Lấy tên các file được chọn
    const newFileNames = files.map((file) => file.name);

    // Thêm vào danh sách attachments (không trùng lặp nếu cần)
    setAttachments((prev) => {
      const existing = new Set(prev);
      const updated = [...prev];
      newFileNames.forEach((name) => {
        if (!existing.has(name)) {
          updated.push(name);
        }
      });
      return updated;
    });

    // Reset input để có thể chọn lại cùng file nếu muốn
    e.target.value = null;
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter the request title.");
      return;
    }

    if (isLeave) {
      if (
        !fields.fromDate ||
        !fields.toDate ||
        !fields.leaveDays ||
        !fields.reason
      ) {
        setError("Please fill in all leave request information.");
        return;
      }
      if (fields.leaveDays < 1) {
        setError("Number of leave days must be at least 1.");
        return;
      }
      if (fields.fromDate > fields.toDate) {
        setError("Start date cannot be after end date.");
        return;
      }
    }

    if (isExpense) {
      if (!fields.purpose || !fields.amount || fields.amount <= 0) {
        setError("Please enter purpose and a valid amount.");
        return;
      }
    }

    setSubmitting(true);

    try {
      const payload = {
        ...fields,
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      await createRequest(selectedForm.id, title.trim(), payload);
      alert("Request created successfully!");
      resetForm();
      onHide();
    } catch (err) {
      console.error(err);
      setError("Failed to create request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Create Request: {selectedForm.name}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          {/* Tiêu đề */}
          <Form.Group className="mb-4">
            <Form.Label>
              Request Title <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title..."
              required
            />
          </Form.Group>

          {/* Fields cho nghỉ phép */}
          {isLeave && (
            <>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>From Date *</Form.Label>
                    <Form.Control
                      type="date"
                      name="fromDate"
                      value={fields.fromDate || ""}
                      onChange={handleFieldChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>To Date *</Form.Label>
                    <Form.Control
                      type="date"
                      name="toDate"
                      value={fields.toDate || ""}
                      onChange={handleFieldChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Number of Leave Days *</Form.Label>
                <Form.Control
                  type="number"
                  name="leaveDays"
                  min="1"
                  value={fields.leaveDays || ""}
                  onChange={handleFieldChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Reason for Leave *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="reason"
                  value={fields.reason || ""}
                  onChange={handleFieldChange}
                  required
                />
              </Form.Group>
            </>
          )}

          {/* Fields cho tạm ứng */}
          {isExpense && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Purpose / Description *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="purpose"
                  value={fields.purpose || ""}
                  onChange={handleFieldChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Amount (VND) *</Form.Label>
                <Form.Control
                  type="number"
                  name="amount"
                  min="1"
                  value={fields.amount || ""}
                  onChange={handleFieldChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Additional Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="note"
                  value={fields.note || ""}
                  onChange={handleFieldChange}
                />
              </Form.Group>
            </>
          )}

          {/* Phần đính kèm file - chọn từ máy */}
          <Form.Group className="mb-4">
            <Form.Label>
              Attachments (select files from your computer)
            </Form.Label>
            <Form.Control type="file" multiple onChange={handleFileSelect} />
            <Form.Text className="text-muted">
              Select one or more files. Only file names will be saved.
            </Form.Text>

            {attachments.length > 0 && (
              <div className="mt-3">
                <h6>Selected Files:</h6>
                <ul className="list-group">
                  {attachments.map((fileName, idx) => (
                    <li
                      key={idx}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      {fileName}
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeAttachment(idx)}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Form.Group>

          <div className="text-end mt-4">
            <Button variant="secondary" onClick={onHide} className="me-3">
              Cancel
            </Button>
            <Button variant="success" type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default CreateRequestModal;
