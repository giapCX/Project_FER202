import { useAppContext } from "../provider/AppProvider";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import EmployeeManager from "../components/EmployeeManager";
import {
  Button,
  Card,
  Form,
  Row,
  Col,
  InputGroup,
  Alert,
} from "react-bootstrap";

function DashBoard() {
  const { forms, requests, createRequest, user } = useAppContext();
  const { isLoggedIn } = useAuth();

  const [availableForms, setAvailableForms] = useState([]);
  const [activeTab, setActiveTab] = useState("service");

  const [selectedForm, setSelectedForm] = useState(null); // form đang được chọn để tạo đơn
  const [title, setTitle] = useState("");
  const [fields, setFields] = useState({});
  const [attachments, setAttachments] = useState([]);
  const [newFileName, setNewFileName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [userRequests, setUserRequests] = useState({
    inprogress: [],
    finish: [],
    reject: [],
    cancel: [],
    needApproval: [],
  });

  useEffect(() => {
    if (!user) return;

    setAvailableForms(
      forms.filter((form) =>
        form.allowedDepartmentsId.includes(user.departmentId),
      ),
    );

    const inprogress = requests.filter(
      (r) => r.creatorId === user.id && r.status === "inprogress",
    );
    const finish = requests.filter(
      (r) => r.creatorId === user.id && r.status === "finish",
    );
    const reject = requests.filter(
      (r) => r.creatorId === user.id && r.status === "reject",
    );
    const cancel = requests.filter(
      (r) => r.creatorId === user.id && r.status === "cancel",
    );

    const needApproval =
      user.roleId !== 1
        ? requests.filter((r) =>
            r.requestApprovalSteps?.some(
              (step) =>
                step.approverId === user.id && step.status === "pending",
            ),
          )
        : [];

    setUserRequests({ inprogress, finish, reject, cancel, needApproval });
  }, [forms, requests, user]);

  if (!isLoggedIn) {
    return (
      <div className="text-center mt-5">
        <p>You are not logged in.</p>
        <Link to="/" className="btn btn-success btn-sm">
          Please click this link to log in.
        </Link>
      </div>
    );
  }

  const tabs = [
    { key: "service", label: "Service" },
    { key: "inprogress", label: "Ongoing Request" },
    { key: "finish", label: "Finished Request" },
    { key: "reject", label: "Rejected Request" },
    { key: "cancel", label: "Canceled Request" },
  ];

  if (user?.roleId !== 1)
    tabs.push({ key: "needApproval", label: "Need Approval" });
  if (user?.roleId === 2 && user?.departmentId === 1) {
    tabs.push({ key: "manageEmployees", label: "Manage Employees" });
  }

  // Xử lý khi bấm "Tạo đơn"
  const handleSelectForm = (form) => {
    setSelectedForm(form);
    setTitle("");
    setFields({});
    setAttachments([]);
    setNewFileName("");
    setError("");
  };

  // Xử lý thay đổi field
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    let parsed = value;
    if (["leaveDays", "amount"].includes(name)) {
      parsed = value === "" ? "" : Number(value);
    }
    setFields((prev) => ({ ...prev, [name]: parsed }));
  };

  // Thêm file đính kèm
  const addAttachment = () => {
    if (newFileName.trim()) {
      setAttachments((prev) => [...prev, newFileName.trim()]);
      setNewFileName("");
    }
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Gửi đơn
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề đơn.");
      return;
    }

    const isLeave = selectedForm.code === "leave_application";
    const isExpense = selectedForm.code === "expense_advance_request";
    const isInternalTransfer = selectedForm.code === "internal_transfer_request";

    if (isLeave) {
      if (
        !fields.fromDate ||
        !fields.toDate ||
        !fields.leaveDays ||
        !fields.reason
      ) {
        setError("Vui lòng điền đầy đủ thông tin nghỉ phép.");
        return;
      }
    }

    if (isExpense) {
      if (!fields.purpose || !fields.amount || fields.amount <= 0) {
        setError("Vui lòng điền mục đích và số tiền hợp lệ.");
        return;
      }
    }

    if (isInternalTransfer) {
      if (!fields.currentDepartment || !fields.targetDepartment || !fields.reason) {
        setError("Vui lòng nhập đầy đủ phòng ban và lý do điều chuyển.");
        return;
      }

      if (fields.currentDepartment === fields.targetDepartment) {
        setError("Phòng ban mới phải khác phòng ban hiện tại.");
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
      alert("Tạo đơn thành công!");

      // Reset form sau khi gửi thành công
      setSelectedForm(null);
      setTitle("");
      setFields({});
      setAttachments([]);
      setNewFileName("");
    } catch (err) {
      setError("Không thể tạo đơn. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ul className="nav nav-tabs mb-4">
        {tabs.map((tab) => (
          <li className="nav-item" key={tab.key}>
            <button
              className={`nav-link ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="row">
        {activeTab === "service" ? (
          <>
            {/* Danh sách các loại form */}
            {availableForms.length > 0 ? (
              availableForms.map((form) => (
                <div className="col-md-4 mb-3" key={form.id}>
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title">{form.name}</h5>
                      <p className="card-text">
                        <small className="text-muted">{form.code}</small>
                      </p>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleSelectForm(form)}
                        disabled={selectedForm?.id === form.id}
                      >
                        {selectedForm?.id === form.id
                          ? "Đang tạo..."
                          : "Tạo đơn"}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted">Không có dịch vụ nào khả dụng</p>
            )}

            {/* Form tạo đơn hiển thị bên dưới khi bấm */}
            {selectedForm && (
              <div className="col-12 mt-4">
                <Card className="shadow-sm">
                  <Card.Header className="bg-success text-white">
                    <h5 className="mb-0">Tạo đơn: {selectedForm.name}</h5>
                  </Card.Header>
                  <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-4">
                        <Form.Label>
                          Tiêu đề đơn <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Nhập tiêu đề..."
                          required
                        />
                      </Form.Group>

                      {selectedForm.code === "leave_application" && (
                        <>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Từ ngày *</Form.Label>
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
                                <Form.Label>Đến ngày *</Form.Label>
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
                            <Form.Label>Số ngày nghỉ *</Form.Label>
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
                            <Form.Label>Lý do nghỉ phép *</Form.Label>
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

                      {selectedForm.code === "expense_advance_request" && (
                        <>
                          <Form.Group className="mb-3">
                            <Form.Label>Mục đích / Nội dung *</Form.Label>
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
                            <Form.Label>Số tiền (VND) *</Form.Label>
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
                            <Form.Label>Ghi chú thêm</Form.Label>
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

                      {selectedForm.code === "internal_transfer_request" && (
                        <>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Phòng ban hiện tại *</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="currentDepartment"
                                  value={fields.currentDepartment || ""}
                                  onChange={handleFieldChange}
                                  placeholder="Nhập phòng ban hiện tại"
                                  required
                                />
                              </Form.Group>
                            </Col>

                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Phòng ban chuyển đến *</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="targetDepartment"
                                  value={fields.targetDepartment || ""}
                                  onChange={handleFieldChange}
                                  placeholder="Nhập phòng ban muốn chuyển đến"
                                  required
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          <Form.Group className="mb-3">
                            <Form.Label>Chức danh mới (nếu có)</Form.Label>
                            <Form.Control
                              type="text"
                              name="newPosition"
                              value={fields.newPosition || ""}
                              onChange={handleFieldChange}
                              placeholder="Nhập chức danh mới nếu có"
                            />
                          </Form.Group>

                          <Form.Group className="mb-4">
                            <Form.Label>Lý do điều chuyển *</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              name="reason"
                              value={fields.reason || ""}
                              onChange={handleFieldChange}
                              placeholder="Trình bày lý do điều chuyển nội bộ..."
                              required
                            />
                          </Form.Group>
                        </>
                      )}

                      {/* Đính kèm */}
                      <Form.Group className="mb-4">
                        <Form.Label>File đính kèm (tên file)</Form.Label>
                        <InputGroup className="mb-2">
                          <Form.Control
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            placeholder="Ví dụ: don-nghi-phep.pdf"
                          />
                          <Button
                            variant="outline-primary"
                            onClick={addAttachment}
                          >
                            Thêm
                          </Button>
                        </InputGroup>
                        {attachments.length > 0 && (
                          <div className="mt-2">
                            {attachments.map((file, idx) => (
                              <div
                                key={idx}
                                className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded"
                              >
                                <span>{file}</span>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => removeAttachment(idx)}
                                >
                                  Xóa
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </Form.Group>

                      <div className="text-end mt-4">
                        <Button
                          variant="secondary"
                          className="me-3"
                          onClick={() => setSelectedForm(null)}
                        >
                          Hủy
                        </Button>
                        <Button
                          variant="success"
                          type="submit"
                          disabled={submitting}
                        >
                          {submitting ? "Đang gửi..." : "Gửi đơn"}
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              </div>
            )}
          </>
        ) : activeTab === "manageEmployees" ? (
          <EmployeeManager />
        ) : userRequests[activeTab]?.length > 0 ? (
          userRequests[activeTab].map((req) => (
            <div className="col-md-4 mb-3" key={req.id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{req.title}</h5>
                  <p className="card-text">
                    <small className="text-muted">
                      {forms.find((f) => f.id === req.formId)?.name}
                    </small>
                  </p>
                  <p>
                    Status: <strong>{req.status}</strong>
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted">No request</p>
        )}
      </div>
    </>
  );
}

export default DashBoard;
