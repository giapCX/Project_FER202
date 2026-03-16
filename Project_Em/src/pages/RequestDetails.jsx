import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../provider/AppProvider";
import axios from "axios";

function RequestDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { forms, user, approveRequest, rejectRequest, roles, departments } = useAppContext();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequest = async () => {
            try {
                const res = await axios.get(`http://localhost:9999/requests/${id}`);
                setRequest(res.data);
                console.log("Fetched request:", res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchRequest();
    }, [id]);

    if (loading) return <div className="container mt-5 text-center">Đang tải...</div>;
    if (!request) return <div className="container mt-5 text-center">Không tìm thấy đơn!</div>;

    const form = forms.find((f) => f.id === request.formId);

    // Check if there is any pending step for current user's role & dept
    const isPendingForMe = request.requestApprovalSteps?.some(
        (step) => {
            const isMyRole = step.approverRoleId === user?.roleId;
            const isMyDept = step.approverDepartmentId ? step.approverDepartmentId === user?.departmentId : true;
            return isMyRole && isMyDept && step.status === "pending";
        }
    );

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
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>Quay lại</button>
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">Thông tin cơ bản</h5>
                </div>
                <div className="card-body">
                    <p><strong>Loại đơn:</strong> {form?.name}</p>
                    <p><strong>Trạng thái:</strong> <span className="badge bg-info text-dark">{request.status}</span></p>
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
                            customerName: "Tên khách hàng",
                            contractValue: "Giá trị hợp đồng (VND)",
                            discount: "Chiết khấu (%)",
                            contractStartDate: "Ngày bắt đầu",
                            contractEndDate: "Ngày kết thúc",
                            notes: "Ghi chú",
                            leaveDays: "Số ngày nghỉ",
                            fromDate: "Từ ngày",
                            toDate: "Đến ngày",
                            reason: "Lý do",
                            purpose: "Mục đích",
                            amount: "Số tiền (VND)",
                            note: "Ghi chú thêm",
                            currentDepartment: "Phòng ban hiện tại",
                            targetDepartment: "Phòng ban chuyển đến",
                            newPosition: "Chức danh mới",
                        };
                        if (labels[key]) displayKey = labels[key];

                        if (Array.isArray(value)) {
                            displayValue = value.join(", ");
                        } else if (key === "contractValue" || key === "amount") {
                            displayValue = Number(value).toLocaleString("vi-VN");
                        } else if (key === "discount") {
                            displayValue = `${value}%`;
                        } else {
                            displayValue = String(value);
                        }

                        return (
                            <li className="list-group-item d-flex justify-content-between px-4 py-2" key={key}>
                                <span className="fw-semibold text-secondary">{displayKey}:</span>
                                <span className="text-dark" style={{ wordBreak: "break-word" }}>{displayValue}</span>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {request.requestApprovalSteps && request.requestApprovalSteps.length > 0 && (
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-warning text-dark">
                        <h5 className="mb-0">Quy trình duyệt</h5>
                    </div>
                    <div className="card-body">
                        <div className="d-flex flex-column gap-3">
                            {request.requestApprovalSteps.map((step, index) => {
                                const role = roles.find(r => r.id === step.approverRoleId);
                                const dept = step.approverDepartmentId ? departments.find(d => d.id === step.approverDepartmentId) : null;
                                
                                let statusBadge = "";
                                let statusText = "";
                                if (step.status === "approved") {
                                    statusBadge = "bg-success";
                                    statusText = "Đã duyệt";
                                } else if (step.status === "pending") {
                                    statusBadge = "bg-warning text-dark";
                                    statusText = "Đang chờ duyệt";
                                } else if (step.status === "waiting") {
                                    statusBadge = "bg-secondary";
                                    statusText = "Chờ bước trước";
                                }

                                return (
                                    <div key={index} className="d-flex align-items-center gap-3 p-3 border rounded">
                                        <div className="fw-bold text-primary" style={{ minWidth: "80px" }}>
                                            Bước {step.stepOrder}
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="fw-semibold">{role?.name}</div>
                                            {dept && <div className="text-muted small">{dept.name}</div>}
                                        </div>
                                        <span className={`badge ${statusBadge}`}>{statusText}</span>
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
                                if (typeof file === 'string') {
                                    return (
                                        <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                                            <span>{file}</span>
                                            {/* Trong thực tế sẽ trỏ tới file trên server tĩnh, ví dụ /uploads/${file} */}
                                            <a href={`/${file}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary">
                                                Tải xuống / Xem
                                            </a>
                                        </li>
                                    );
                                }

                                return (
                                    <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                                        <span>{file.name}</span>
                                        <a href={file.data} download={file.name} className="btn btn-sm btn-outline-primary">
                                            Tải xuống / Xem
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            )}

            {isPendingForMe && (
                <div className="d-flex justify-content-end mb-5 gap-3">
                    <button className="btn btn-danger px-4" onClick={handleReject}>Từ chối</button>
                    <button className="btn btn-success px-4" onClick={handleApprove}>Duyệt đơn</button>
                </div>
            )}
        </div>
    );
}

export default RequestDetails;
