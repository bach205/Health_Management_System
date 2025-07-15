import React, { useState } from 'react';
import { Upload, Modal, Button, message, notification } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import Papa from 'papaparse';
import { createDoctorsFromCSV } from '../../services/doctor.service';

const { Dragger } = Upload;

interface IProps {
    type: string,
}

const CSVImportModal = ({ type }: IProps) => {
    const [visible, setVisible] = useState(false);
    const [fileList, setFileList] = useState<any[]>([]);
    const [csvData, setCsvData] = useState<any[]>([]);
    const [confirming, setConfirming] = useState(false);

    const showModal = () => setVisible(true);
    const closeModal = () => {
        setVisible(false);
        setFileList([]);
        setCsvData([]);
    };

    const handleConfirmImport = async () => {
        setConfirming(true);
        if (csvData.length > 0) {
            // Call the service to create doctors from CSV
            try {
                await createDoctorsFromCSV(csvData);
                message.success("Import CSV thành công!");
                closeModal();
            } catch (error: any) {
                console.log(error);
                if (error?.response?.data) {
                    notification.error({ message: error.response.data.message });
                } else if (error?.errorFields?.length > 0) {
                    notification.error({ message: error.errorFields[0].errors[0] });
                } else {
                    notification.error({ message: "Lỗi khi import CSV: " + error.message });
                }
            } finally {
                setConfirming(false);
            }
        } else {
            message.error("Không có dữ liệu để import.");
            setConfirming(false);
        }
    };

    const uploadProps = {
        accept: '.csv',
        multiple: false,
        maxCount: 1,
        beforeUpload: (file: File) => {
            const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
            if (!isCSV) {
                message.error('Chỉ chấp nhận file CSV!');
                return Upload.LIST_IGNORE;
            }
            setFileList([file as any]);
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: function (results) {
                    const parseData = results.data as any[];
                    if (parseData.length === 0) {
                        message.error("File CSV không chứa dữ liệu hợp lệ.");
                        setConfirming(false);
                        return;
                    }
                    setCsvData((parseData || []).map((item, index) => ({
                        ...item,
                        date_of_birth: item.date_of_birth ? new Date(item.date_of_birth) : null,

                    })));
                    setConfirming(false);
                },
                error: function () {
                    message.error("Không thể đọc file CSV.");
                    setConfirming(false);
                },
            });
            return false;
        },
        onRemove: () => {
            setFileList([]);
            setCsvData([]);
        },
        fileList,
    };
                    console.log(csvData);


    return (
        <>
            <Button type="default" onClick={showModal}>
                Import CSV
            </Button>

            <Modal
                open={visible}
                title="Nhập dữ liệu từ CSV"
                onCancel={closeModal}
                centered
                footer={[
                    <Button key="cancel" onClick={closeModal}>
                        Đóng
                    </Button>,
                    <Button
                        key="import"
                        type="primary"
                        onClick={handleConfirmImport}
                        loading={confirming}
                        disabled={fileList.length === 0}
                    >
                        Xác nhận import
                    </Button>,
                ]}
            >
                <Dragger {...uploadProps} style={{ padding: 16 }}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Kéo thả hoặc click để chọn file CSV</p>
                    <p className="ant-upload-hint">Chỉ chấp nhận file có định dạng .csv</p>
                </Dragger>

                {/* {csvData.length > 0 && (
                    <pre style={{ marginTop: 20, maxHeight: 300, overflowY: 'auto', background: '#f6f6f6', padding: 10 }}>
                        {JSON.stringify(csvData, null, 2)}
                    </pre>
                )} */}
            </Modal>
        </>
    );
};

export default CSVImportModal;
