import { useState, useEffect } from "react";
import { Table, Button, Space, notification, Modal, Popconfirm, Tooltip, Upload, message } from "antd";
import { UploadOutlined, DownloadOutlined, DeleteOutlined, PlusOutlined, InboxOutlined } from "@ant-design/icons";
import { getAllDocuments, uploadDocument, deleteDocument, downloadDocument } from "../../api/documents";
import { getUsers } from "../../api/user";
import type { UploadProps } from "antd";
import UserListTitle from "../../components/ui/UserListTitle";

const DocumentsManagement = () => {
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploadVisible, setUploadVisible] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fileList, setFileList] = useState<any[]>([]);

    // Fetch documents and users, then map user_id to full_name
    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const res = await getAllDocuments();
            setDocuments(res.data.data || res.data);
        } catch (err) {
            notification.error({ message: "Lỗi tải danh sách tài liệu" });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    // Upload handler for Ant Design Upload
    const uploadProps: UploadProps = {
        beforeUpload: (file) => {
            setFileList([file]);
            return false; // Prevent auto upload
        },
        onRemove: () => {
            setFileList([]);
        },
        fileList,
        maxCount: 1,
        accept: ".pdf,.doc,.docx,.txt",
    };

    const handleUploadAntd = async () => {
        if (!fileList.length) {
            message.error("Vui lòng chọn file!");
            return;
        }
        setUploading(true);
        const formData = new FormData();
        formData.append("file", fileList[0]);
        formData.append("user_id", "1");
        try {
            await uploadDocument(formData);
            notification.success({ message: "Tải lên thành công" });
            fetchDocuments();
            setFileList([]);
            setUploadVisible(false);
        } catch (err: any) {
            notification.error({ message: err?.response?.data?.message || "Lỗi tải lên" });
        }
        setUploading(false);
    };

    // Download handler
    const handleDownload = async (id: string, fileName: string) => {
        try {
            const res = await downloadDocument(id);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            notification.error({ message: "Lỗi tải file" });
        }
    };

    // Delete handler
    const handleDelete = async (id: string) => {
        try {
            await deleteDocument(id);
            notification.success({ message: "Xóa thành công" });
            fetchDocuments();
        } catch (err) {
            notification.error({ message: "Lỗi xóa file" });
        }
    };

    const columns = [
        {
            title: "Tên file",
            dataIndex: "File_Name",
            key: "File_Name",
            render: (_: any, record: any) => { console.log(record); return record.file_name || record.File_Name }
        },
        {
            title: "Hành động",
            key: "action",
            width: 90,
            render: (_: any, record: any) => (
                <Space>
                    <Tooltip title="Tải về">
                        <Button
                            icon={<DownloadOutlined />}
                            onClick={() => handleDownload(record.id, record.file_name || record.File_Name)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Bạn chắc chắn muốn xóa file này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <Tooltip title="Xóa">
                            <Button icon={<DeleteOutlined />} danger />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ display: "flex", justifyContent: "center" }}>
            <div>
                <UserListTitle title="tài liệu"></UserListTitle>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setUploadVisible(true)}
                    style={{ marginBottom: 16 }}
                >
                    Tải lên tài liệu
                </Button>
                <Table
                    style={{ width: "750px" }}
                    rowKey="id"
                    columns={columns}
                    dataSource={documents}
                    loading={loading}
                />
                <Modal
                    title="Tải lên tài liệu"
                    open={uploadVisible}
                    onCancel={() => { setUploadVisible(false); setFileList([]); }}
                    footer={[
                        <Button key="cancel" onClick={() => { setUploadVisible(false); setFileList([]); }}>
                            Hủy
                        </Button>,
                        <Button key="upload" type="primary" loading={uploading} onClick={handleUploadAntd}>
                            Tải lên
                        </Button>
                    ]}
                >
                    <Upload.Dragger {...uploadProps} style={{ padding: 16 }}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Nhấn hoặc kéo file vào đây để chọn tài liệu</p>
                        <p className="ant-upload-hint">Chỉ chấp nhận file PDF, Word, TXT...</p>
                    </Upload.Dragger>
                </Modal>
            </div>
        </div>
    );
};

export default DocumentsManagement;