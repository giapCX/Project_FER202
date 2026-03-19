import { useEffect, useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { useAppContext } from "../../provider/AppProvider";
import { useNavigate } from "react-router-dom";

function InternalTransferForm() {
  const { createRequest, user, departments, employees } = useAppContext();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [fromDepartment, setFromDepartment] = useState("");
  const [toDepartment, setToDepartment] = useState("");
  const [toDepartmentId, setToDepartmentId] = useState("");
  const [employeeToTransfer, setEmployeeToTransfer] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const currentDeptName =
    departments?.find((d) => String(d.id) === String(user?.departmentId))
      ?.name || "";

  useEffect(() => {
    // Auto-fill current department display for creator
    if (!fromDepartment && currentDeptName) {
      setFromDepartment(currentDeptName);
    }
  }, [fromDepartment, currentDeptName]);

  const handleCancel = () => {
    setTitle("");
    setFromDepartment("");
    setToDepartment("");
    setToDepartmentId("");
    setEmployeeToTransfer("");
    setReason("");
    setError("");
    navigate("/dashboard");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // For internal_transfer_request: destination department must be selected
    if (
      !title ||
      !fromDepartment ||
      (!toDepartmentId && !toDepartment) ||
      !employeeToTransfer ||
      !reason
    ) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    // Prefer selected departmentId when available
    const finalToDepartment = toDepartmentId ? Number(toDepartmentId) : toDepartment;

    // internal_transfer_request has id = 5 in database.json
    await createRequest(5, title, {
      employeeToTransfer: Number(employeeToTransfer),
      fromDepartment,
      toDepartment: finalToDepartment,
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
          {/* <div className="mb-3 p-3 border rounded bg-light">
            <div className="fw-semibold mb-2">Thông tin người tạo</div>
            <div className="row g-2">
              <div className="col-md-4">
                <div className="text-muted small">Họ tên</div>
                <div>{user?.fullName || "-"}</div>
              </div>
              <div className="col-md-4">
                <div className="text-muted small">Username</div>
                <div>{user?.username || "-"}</div>
              </div>
              <div className="col-md-4">
                <div className="text-muted small">Phòng ban</div>
                <div>{currentDeptName || "-"}</div>
              </div>
            </div>
          </div> */}

          <Form.Group className="mb-3">
            <Form.Label>Tiêu đề *</Form.Label>
            <Form.Control
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nhân viên cần điều chuyển *</Form.Label>
            <Form.Select
              value={employeeToTransfer}
              onChange={(e) => setEmployeeToTransfer(e.target.value)}
              required
            >
              <option value="">-- Chọn nhân viên --</option>
              {(employees || []).map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} (#{emp.id})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Phòng ban hiện tại *</Form.Label>
            <Form.Control
              value={fromDepartment}
              onChange={(e) => setFromDepartment(e.target.value)}
              readOnly={!!currentDeptName}
            />
            {currentDeptName && (
              <Form.Text className="text-muted">
                Tự động lấy theo tài khoản đang đăng nhập.
              </Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Phòng ban chuyển đến (chọn) *</Form.Label>
            <Form.Select
              value={toDepartmentId}
              onChange={(e) => {
                setToDepartmentId(e.target.value);
                // keep legacy string field in sync (no removal)
                const deptName = departments?.find(
                  (d) => String(d.id) === String(e.target.value),
                )?.name;
                if (deptName) setToDepartment(deptName);
              }}
              required
            >
              <option value="">-- Chọn phòng ban --</option>
              {(departments || []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Phòng ban chuyển đến *</Form.Label>
            <Form.Control
              value={toDepartment}
              onChange={(e) => setToDepartment(e.target.value)}
              placeholder="(Giữ lại input cũ, nhưng nên chọn bằng select phía trên)"
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
