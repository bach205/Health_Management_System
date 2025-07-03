import { Button, Flex, Image, Upload, message } from "antd";
import imageCompression from 'browser-image-compression';
import React, { useEffect, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd';
import { updateAvatar } from "../../services/patient.service";

const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

const Uploader = ({
    user,
    reload,
    setReload,
    reloadUser,
    setReloadUser,
}: {
    user: any,
    reload: boolean,
    setReload: (reload: boolean) => void,
    reloadUser?: boolean,
    setReloadUser?: (reloadUser: boolean) => void
}) => {
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [removeUserImage, setRemoveUserImage] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewOpen, setPreviewOpen] = useState(false);

    useEffect(() => {
        if (user?.avatar) {
            setFileList([{
                uid: user.id,
                name: "avatar.png",
                status: 'done',
                url: user.avatar,
            }])
        }
    }, [user])

    const beforeUpload: UploadProps['beforeUpload'] = async (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        const isLt5M = file.size / 1024 / 1024 < 5;

        if (!isJpgOrPng) {
            message.error('Chỉ cho phép ảnh định dạng JPG/PNG!');
            return Upload.LIST_IGNORE;
        }

        if (!isLt5M) {
            message.error('Ảnh phải nhỏ hơn 5MB!');
            return Upload.LIST_IGNORE;
        }

        try {
            const options = {
                maxSizeMB: 0.75,
                maxWidthOrHeight: 1024,
                useWebWorker: true,
            };
            const compressedFile = await imageCompression(file, options);
            const base64 = await getBase64(compressedFile);

            const newFile: UploadFile = {
                uid: Date.now().toString(),
                name: file.name,
                status: 'done',
                url: base64,
            };
            setFileList([newFile]);
        } catch (error) {
            console.log(error);
            message.error("Cập nhật ảnh thất bại");
        }

        return false;
    };

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as File);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    const handleRemove = () => {
        setFileList([]);
    };

    const handleUpload = async () => {
        try {
            const userData = {
                id: user?.id,
                avatar: fileList[0]?.url
            };
            setFileList([]);
            setRemoveUserImage(false);
            const response = await updateAvatar(userData);
            console.log(response);
            setReload(!reload);
            if (reloadUser !== undefined && setReloadUser !== undefined) {
                setReloadUser(!reloadUser);
            }
            message.success("Cập nhật ảnh thành công");
        } catch (error) {
            console.log(error);
            message.error("Cập nhật ảnh thất bại");
        }
    };

    const SubmitImageButton = ({ title }: { title: string }) => (
        <Button type="primary" onClick={handleUpload} className="w-1/3">
            {title}
        </Button>
    );

    const ImageButton = ({ title }: { title: string }) => (
        <Button type="primary" onClick={() => {
            setFileList([]);
            setRemoveUserImage(true);
        }} className="w-1/3">
            {title}
        </Button>
    );

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Chọn ảnh</div>
        </div>
    );

    return (
        <Flex align="center" vertical gap={10}>
            <Upload
                listType="picture-card"
                fileList={fileList}
                beforeUpload={beforeUpload}
                onRemove={handleRemove}
                onPreview={handlePreview}
                maxCount={1}
                showUploadList={{ showPreviewIcon: true, showRemoveIcon: removeUserImage }}
            >
                {fileList.length >= 1 ? null : uploadButton}
            </Upload>

            {/* Xử lý ảnh hiện trong modal popup */}
            {previewImage && (
                <Image
                    wrapperStyle={{ display: 'none' }}
                    preview={{
                        visible: previewOpen,
                        onVisibleChange: (visible) => setPreviewOpen(visible),
                        afterOpenChange: (visible) => !visible && setPreviewImage(''),
                    }}
                    src={previewImage}
                />
            )}

            {user?.avatar ? (
                !removeUserImage ? (
                    fileList.length >= 1 && <ImageButton title="Đổi ảnh" />
                ) : (
                    fileList.length >= 1 && <SubmitImageButton title="Xác nhận thay ảnh" />
                )
            ) : (
                fileList.length >= 1 && <SubmitImageButton title="Xác nhận thay ảnh" />
            )}
        </Flex>
    );
};

export default Uploader;
