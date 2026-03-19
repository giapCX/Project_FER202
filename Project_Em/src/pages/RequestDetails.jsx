import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../provider/AppProvider";
import axios from "axios";

function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    forms,
    user,
    approveRequest,
    rejectRequest,
    roles,
    departments,
    fetchRequests,
  } = useAppContext();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizeInternalTransferRequest = (data) => {
    if (
      data?.formId !== 5 ||
      (Array.isArray(data?.requestApprovalSteps) && data.requestApprovalSteps.length >= 4)
    ) {
      return data;
    }

    const existing = Array.isArray(data?.requestApprovalSteps)
      ? data.requestApprovalSteps
      : [];

    const base = [
      {
        stepOrder: 1,
        approverRoleId: 2,
        approverDepartmentId: data.departmentId ?? null,
      },
      { stepOrder: 2, approverRoleId: 2, approverDepartmentId: 1 },
      { stepOrder: 3, approverRoleId: 4, approverDepartmentId: null },
      { stepOrder: 4, approverRoleId: 2, approverDepartmentId: 1 },
    ];

    const merged = base.map((b) => {
      const match = existing.find((s) => {
        const sameRole = Number(s.approverRoleId) === Number(b.approverRoleId);
        const sameDept =
          (s.approverDepartmentId ?? null) === (b.approverDepartmentId ?? null);
        const sameOrder = s.stepOrder
          ? Number(s.stepOrder) === Number(b.stepOrder)
          : true;
        return sameRole && sameDept && sameOrder;
      });
      return { ...b, status: match?.status };
    });

    const hasPending = merged.some((s) => s.status === "pending");
    return {
      ...data,
      requestApprovalSteps: merged.map((s, idx) => ({
        ...s,
        status:
          s.status || (hasPending ? "waiting" : idx === 0 ? "pending" : "waiting"),
      })),
    };
  };

  const cancelRequest = async () => {
    if (window.confirm("Bạn có chắc muốn hủy đơn này?")) {
      try {
        const updatedRequest = {
          ...request,
          status: "cancel",
          updatedAt: new Date().toISOString(),
        };
        await axios.put(
          `http://localhost:9999/requests/${request.id}`,
          updatedRequest,
        );
        await fetchRequests(); // Refresh requests in context
        alert("Đã hủy đơn thành công");
        navigate("/dashboard");
      } catch (err) {
        console.error(err);
        alert("Có lỗi xảy ra khi hủy đơn");
      }
    }
  };

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await axios.get(`http://localhost:9999/requests/${id}`);
        setRequest(normalizeInternalTransferRequest(res.data));
        console.log("Fetched request:", res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id]);

  if (loading)
    return <div className="container mt-5 text-center">Đang tải...</div>;
  if (!request)
    return (
      <div className="container mt-5 text-center">Không tìm thấy đơn!</div>
    );

  const form = forms.find((f) => f.id === request.formId);
  const isInternalTransfer =
    form?.code === "internal_transfer_request" || request.formId === 5;
  const isHrManager = user?.roleId === 2 && user?.departmentId === 1;
  const canExecuteInternalTransfer =
    isInternalTransfer &&
    request.status === "finish" &&
    isHrManager &&
    !request?.executedAt;

  const executeInternalTransfer = async () => {
    if (!canExecuteInternalTransfer) return;

    const rawEmployeeId =
      request?.fields?.employeeToTransfer ??
      request?.fields?.employeeToTransferId ??
      request?.fields?.employeeId;

    const rawToDepartment =
      request?.fields?.toDepartment ??
      request?.fields?.toDepartmentId ??
      request?.fields?.targetDepartmentId;

    const employeeId =
      rawEmployeeId === undefined || rawEmployeeId === null || rawEmployeeId === ""
        ? null
        : Number(rawEmployeeId);

    let toDepartmentId =
      rawToDepartment === undefined || rawToDepartment === null || rawToDepartment === ""
        ? null
        : Number(rawToDepartment);

    if (!Number.isFinite(toDepartmentId)) {
      const toDeptName = String(rawToDepartment || "").trim().toLowerCase();
      const dept = departments?.find(
        (d) => String(d.name || "").trim().toLowerCase() === toDeptName,
      );
      toDepartmentId = dept ? Number(dept.id) : null;
    }

    if (!Number.isFinite(employeeId) || !Number.isFinite(toDepartmentId)) {
      alert(
        "Thiếu dữ liệu employeeToTransfer hoặc toDepartment để thực hiện điều chuyển.\n" +
          "Gợi ý: hãy tạo đơn với 'Nhân viên cần điều chuyển' và chọn 'Phòng ban chuyển đến' bằng select.",
      );
      return;
    }

    if (!window.confirm("Xác nhận HR thực hiện điều chuyển theo đơn này?")) return;

    try {
      const empRes = await axios.get(
        `http://localhost:9999/employees/${employeeId}`,
      );
      const emp = empRes.data;

      const updatedEmployee = {
        ...emp,
        departmentId: Number(toDepartmentId),
      };

      await axios.put(
        `http://localhost:9999/employees/${employeeId}`,
        updatedEmployee,
      );

      const updatedRequest = {
        ...request,
        executedAt: new Date().toISOString(),
        executedBy: user?.id,
        updatedAt: new Date().toISOString(),
      };
      await axios.put(
        `http://localhost:9999/requests/${request.id}`,
        updatedRequest,
      );

      await fetchRequests();
      alert("HR đã thực hiện điều chuyển và cập nhật nhân sự.");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi thực hiện điều chuyển.");
    }
  };

  // Check if there is any pending step for current user's role & dept
  const isPendingForMe =
    request.status === "inprogress" &&
    request.requestApprovalSteps?.some((step) => {
      const isMyRole = step.approverRoleId === user?.roleId;
      const isMyDept = step.approverDepartmentId
        ? step.approverDepartmentId === user?.departmentId
        : true;
      return isMyRole && isMyDept && step.status === "pending";
    });

  // Check if current user is the creator and request is not finished
  const isCreator = request.creatorId === user?.id;
  const canCancel =
    isCreator &&
    request.status !== "finish" &&
    request.status !== "cancel" &&
    request.status !== "reject";

  const handleApprove = async () => {
    if (isPendingForMe) {
      await approveRequest(request);
      navigate(-1); // Quay lại trang trước
    }
  };

  const handleReject = async () => {
    if (isPendingForMe) {
      await rejectRequest(request);
      navigate(-1);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Chi tiết đơn: {request.title}</h2>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Quay lại
        </button>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Thông tin cơ bản</h5>
        </div>
        <div className="card-body">
          <p>
            <strong>Loại đơn:</strong> {form?.name}
          </p>
          <p>
            <strong>Trạng thái:</strong>{" "}
            <span className="badge bg-info text-dark">{request.status}</span>
          </p>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">Dữ liệu đơn</h5>
        </div>
        <ul className="list-group list-group-flush">
          {Object.entries(request.fields).map(([key, value]) => {
            if (key === "attachments") return null;

            let displayKey = key;
            let displayValue = value;

            const labels = {
              customerName: "Tên Khách Hàng",
              contractValue: "Giá Trị Hợp Đồng (VND)",
              discount: "Chiết Khấu (%)",
              contractStartDate: "Ngày Bắt Đầu",
              contractEndDate: "Ngày Kết Thúc",
              notes: "Ghi Chú",
              leaveDays: "Số Ngày Nghỉ",
              leaveType: "Loại Nghỉ Phép",
              startDate: "Ngày Bắt Đầu",
              endDate: "Ngày Kết Thúc",
              fromDate: "Từ Ngày",
              toDate: "Đến Ngày",
              reason: "Lý Do",
              purpose: "Mục Đích",
              amount: "Số Tiền (VND)",
              currency: "Loại Tiền",
              expenseDate: "Ngày Chi Phí",
              note: "Ghi Chú Thêm",
              currentDepartment: "Phòng Ban Hiện Tại",
              targetDepartment: "Phòng Ban Chuyển Đến",
              newPosition: "Chức Danh Mới",
              campaignName: "Tên Chiến Dịch",
              budget: "Ngân Sách (VND)",
              expectedROI: "ROI Dự Kiến (%)",
              description: "Mô Tả Chiến Dịch",
              employeeToTransfer: "Nhân Viên Điều Chuyển",
              fromDepartment: "Từ Phòng Ban",
              toDepartment: "Đến Phòng Ban",
              transferDate: "Ngày Điều Chuyển",
            };
            if (labels[key]) displayKey = labels[key];

            if (Array.isArray(value)) {
              displayValue = value.join(", ");
            } else if (
              key === "contractValue" ||
              key === "amount" ||
              key === "budget"
            ) {
              displayValue = Number(value).toLocaleString("vi-VN");
            } else if (key === "discount" || key === "expectedROI") {
              displayValue = `${value}%`;
            } else {
              displayValue = String(value);
            }

            return (
              <li
                className="list-group-item d-flex justify-content-between px-4 py-2"
                key={key}
              >
                <span className="fw-semibold text-secondary">
                  {displayKey}:
                </span>
                <span className="text-dark" style={{ wordBreak: "break-word" }}>
                  {displayValue}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {request.requestApprovalSteps &&
        request.requestApprovalSteps.length > 0 && (
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-warning text-dark">
              <h5 className="mb-0">Quy trình duyệt</h5>
            </div>
            <div className="card-body">
              <div className="d-flex flex-column gap-3">
                {request.requestApprovalSteps.map((step, index) => {
                  const role = roles.find((r) => r.id === step.approverRoleId);
                  const dept = step.approverDepartmentId
                    ? departments.find(
                        (d) => d.id === step.approverDepartmentId,
                      )
                    : null;

                  let statusBadge = "";
                  let statusText = "";
                  if (step.status === "approved") {
                    statusBadge = "bg-success";
                    statusText = "Đã duyệt";
                  } else if (step.status === "rejected") {
                    statusBadge = "bg-danger";
                    statusText = "Đã từ chối";
                  } else if (step.status === "pending") {
                    if (request.status === "cancel") {
                      statusBadge = "bg-secondary text-white";
                      statusText = "Đã hủy";
                    } else if (request.status === "reject") {
                      statusBadge = "bg-danger text-white";
                      statusText = "Từ chối";
                    } else {
                      statusBadge = "bg-warning text-dark";
                      statusText = "Đang chờ duyệt";
                    }
                  } else if (step.status === "waiting") {
                    if (request.status === "cancel" || request.status === "reject") {
                      statusBadge = "bg-secondary text-white";
                      statusText = "Không thực hiện";
                    } else {
                      statusBadge = "bg-secondary text-white";
                      statusText = "Chờ bước trước";
                    }
                  }

                  return (
                    <div
                      key={index}
                      className="d-flex align-items-center gap-3 p-3 border rounded"
                    >
                      <div
                        className="fw-bold text-primary"
                        style={{ minWidth: "80px" }}
                      >
                        Bước {step.stepOrder}
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-semibold">{role?.name}</div>
                        {dept && (
                          <div className="text-muted small">{dept.name}</div>
                        )}
                      </div>
                      <span className={`badge ${statusBadge}`}>
                        {statusText}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      {request.fields.attachments && request.fields.attachments.length > 0 && (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-light">
            <h5 className="mb-0">Tài liệu đính kèm</h5>
          </div>
          <div className="card-body">
            <ul className="list-group">
              {request.fields.attachments.map((file, idx) => {
                if (typeof file === "string") {
                  return (
                    <li
                      key={idx}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <span>{file}</span>
                      {/* Trong thực tế sẽ trỏ tới file trên server tĩnh, ví dụ /uploads/${file} */}
                      <a
                        href={`/${file}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-outline-primary"
                      >
                        Tải xuống / Xem
                      </a>
                    </li>
                  );
                }

                return (
                  <li
                    key={idx}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <span>{file.name}</span>
                    <a
                      href={file.data}
                      download={file.name}
                      className="btn btn-sm btn-outline-primary"
                    >
                      Tải xuống / Xem
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {canCancel && (
        <div className="d-flex justify-content-end mb-3">
          <button
            className="btn btn-outline-danger px-4"
            onClick={cancelRequest}
          >
            Hủy đơn
          </button>
        </div>
      )}

      {canExecuteInternalTransfer && (
        <div className="d-flex justify-content-end mb-3">
          <button
            className="btn btn-warning px-4"
            onClick={executeInternalTransfer}
          >
            HR thực hiện điều chuyển
          </button>
        </div>
      )}

      {isPendingForMe && (
        <div className="d-flex justify-content-end mb-5 gap-3">
          <button className="btn btn-danger px-4" onClick={handleReject}>
            Từ chối
          </button>
          <button className="btn btn-success px-4" onClick={handleApprove}>
            Duyệt đơn
          </button>
        </div>
      )}
    </div>
  );
}

export default RequestDetails;
