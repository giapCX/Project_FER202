import { useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { useAppContext } from "../../provider/AppProvider";
import { useNavigate } from "react-router-dom";
import MarketingBudgetForm from "./MarketingBudgetForm";

function MarketingBudgetRequestForm() {
    const { createRequest, forms } = useAppContext();
    const navigate = useNavigate();
    const marketingForm = forms.find(f => f.code === "marketing_budget_campaign_proposal");

    const [title, setTitle] = useState("");
    const [fields, setFields] = useState({});
    const [attachments, setAttachments] = useState([]);
    const [error, setError] = useState("");

    const handleCancel = () => {
        setTitle("");
        setFields({});
        setAttachments([]);
        setError("");
        navigate("/dashboard");
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files || []);
        const fileNames = files.map((file) => file.name);
        setAttachments((prev) => [...new Set([...prev, ...fileNames])]);
    };

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        let parsed = value;
        if (name === "budget" || name === "expectedROI") {
            parsed = value === "" ? "" : Number(value);
        }
        setFields((prev) => ({ ...prev, [name]: parsed }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            setError("Vui lòng nhập tiêu đề đơn.");
            return;
        }

        if (!fields.campaignName || !fields.budget || !fields.startDate || !fields.endDate || !fields.expectedROI || !fields.description) {
            setError("Vui lòng nhập đầy đủ thông tin chiến dịch.");
            return;
        }

        if (fields.startDate > fields.endDate) {
            setError("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
            return;
        }

        const payload = {
            ...fields,
            attachments: attachments.length > 0 ? attachments : undefined,
        };

        try {
            await createRequest(marketingForm ? marketingForm.id : 4, title, payload);
            alert("Tạo đơn thành công");
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            setError("Có lỗi xảy ra, vui lòng thử lại.");
        }
    };

    return (
        <Card className="mt-4 shadow-sm">
            <Card.Header className="bg-primary text-white">
                Marketing Budget & Campaign Proposal
            </Card.Header>

            <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Tiêu đề *</Form.Label>
                        <Form.Control
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Nhập tiêu đề đơn..."
                            required
                        />
                    </Form.Group>

                    <MarketingBudgetForm fields={fields} onChange={handleFieldChange} />

                    <Form.Group className="mb-4 mt-3">
                        <Form.Label>File đính kèm</Form.Label>
                        <Form.Control type="file" multiple onChange={handleFileSelect} />
                    </Form.Group>

                    <div className="d-flex justify-content-end gap-2">
                        <Button variant="outline-danger" onClick={handleCancel}>
                            Hủy
                        </Button>
                        <Button type="submit" variant="primary">
                            Gửi đơn
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
}

export default MarketingBudgetRequestForm;
