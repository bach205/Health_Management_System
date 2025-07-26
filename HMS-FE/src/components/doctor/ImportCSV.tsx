import { useState } from 'react';
import { Upload, Modal, Button, message, notification, Typography } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import Papa from 'papaparse';
import { createDoctorsFromCSV } from '../../services/doctor.service';
import { createNursesFromCSV } from '../../api/nurse';
import { FileSpreadsheet } from 'lucide-react';

const { Dragger } = Upload;

interface IProps {
    role: string,

    reload: boolean
    setReload: (reload: boolean) => void
}

const CSVImportModal = ({ role, reload, setReload }: IProps) => {
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
                if (role === 'doctor') {
                    await createDoctorsFromCSV(csvData);
                } else if (role === 'nurse') {
                    await createNursesFromCSV(csvData);
                } else {
                    notification.error({ message: "Loại user không hợp lệ" });
                    setConfirming(false);
                    return;
                }
                message.success("Import CSV thành công!");
                setReload(!reload);
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
                    const data = (parseData || []).map((item, index) => {
                        // message.error("File CSV không chứa dữ liệu hợp lệ.");
                        if (item.email === "") {
                            message.error("Dòng " + (index + 1) + " Email không được để trống.");
                            setConfirming(false);
                            return;
                        }
                        if (item.full_name === "") {
                            message.error("Dòng " + (index + 1) + " Tên không được để trống.");
                            setConfirming(false);
                            return;
                        }
                        if (item.specialty_name === "") {
                            message.error("Dòng " + (index + 1) + " Chuyên khoa không được để trống.");
                            setConfirming(false);
                            return;
                        }
                        if (item.price === "") {
                            message.error("Dòng " + (index + 1) + " Giá khám không được để trống.");
                            setConfirming(false);
                            return;
                        }

                        return ({
                            ...item,

                        })
                    });
                    setCsvData(data);
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
    // console.log(csvData);


    return (
        <>
            <Button type="default" onClick={showModal}>
                <FileSpreadsheet className='w-4 h-4' />Tạo nhanh với CSV
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
                {
                    role === 'doctor' && (
                        <p className='mb-3'>
                            <span className='text-red-500'>*</span> Lưu ý: File phải có các cột:
                            <ul className='list-disc list-inside'>
                                <li><b>email</b>: Email của bác sĩ</li>
                                <li><b>full_name</b>: Tên bác sĩ</li>
                                <li><b>specialty_name</b>: Tên chuyên khoa</li>
                                <li><b>price</b>: Giá khám</li>
                            </ul>
                        </p>
                    )
                }
                {
                    role === 'nurse' && (
                        <p className='mb-3'>
                            <span className='text-red-500'>*</span> Lưu ý: File phải có các cột:
                            <ul className='list-disc list-inside'>
                                <li><b>email</b>: Email của y tá</li>
                                <li><b>full_name</b>: Tên y tá</li>
                            </ul>
                        </p>
                    )
                }
                <Dragger {...uploadProps} style={{ padding: 16 }}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Kéo thả hoặc click để chọn file CSV</p>
                    <p className="ant-upload-hint">Chỉ chấp nhận file có định dạng .csv</p>
                </Dragger>

                {csvData.length > 0 && (
                    <>
                        <Typography.Title level={5} className='mt-3'>Những tài khoản sau sẽ được tạo, mật khẩu sẽ được gửi về mail:</Typography.Title>
                        <pre style={{ marginTop: 20, maxHeight: 300, overflowY: 'auto', background: '#f6f6f6', padding: 10 }}>
                            {csvData.map((item: any) => {
                                console.log(item);
                                return (
                                    <p key={item.id}>{item.email} - {item.full_name}</p>
                                )
                            })}
                        </pre>
                    </>
                )}
            </Modal>
        </>
    );
};

export default CSVImportModal;
