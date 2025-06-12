import { Button, Flex, message } from "antd";

import React, { useEffect, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Upload } from 'antd';
import type { UploadProps, UploadFile } from 'antd';


const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

const Uploader = ({ user, reload, setReload }: { user: any, reload: boolean, setReload: (reload: boolean) => void }) => {
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [removeUserImage, setRemoveUserImage] = useState(false)
    useEffect(() => {
        if (user.avatar) {
            setFileList([{
                uid: user.id,
                name: "avatar.png",
                status: 'done',
                url: user.avatar,
            }])
        }
    }, [user])
    const beforeUpload: UploadProps['beforeUpload'] = async (file) => {
        const base64 = await getBase64(file);
        // console.log(base64)
        const newFile: UploadFile = {
            uid: Date.now().toString(),
            name: file.name,
            status: 'done',
            url: base64,
        };
        setFileList([newFile]);
        return false;
    };

    const handleRemove = () => {
        setFileList([]);
    };

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Chọn ảnh</div>
        </div>
    );

    const handleUpload = async () => {
        const userData = {
            id: user?.id,
            avatar: fileList[0]?.url
        }
        setFileList([])
        setRemoveUserImage(false)
        setReload(!reload)
        console.log(userData)
        message.success("Cập nhật ảnh thành công")
    }
    const SubmitImageButton = ({ title }: { title: string }) => <Button type="primary"
        onClick={() => {
            handleUpload()
        }}
        className="w-1/3">{title}</Button>
    const ImageButton = ({ title }: { title: string }) => <Button type="primary"
        onClick={() => {
            setFileList([])
            setRemoveUserImage(true)
        }}
        className="w-1/3">{title}</Button>
    return (
        <Flex align="center" vertical gap={10}>
            <Upload
                listType="picture-card"
                fileList={fileList}
                beforeUpload={beforeUpload}
                onRemove={handleRemove}
                maxCount={1}
                showUploadList={{ showPreviewIcon: false }}
            >
                {fileList.length >= 1 ? null : uploadButton}
            </Upload>
            {user?.avatar ?
                !removeUserImage ?
                    fileList.length >= 1 && <ImageButton title="Đổi ảnh" />
                    :
                    fileList.length >= 1 && <SubmitImageButton title="Xác nhận thay ảnh" />
                :
                fileList.length >= 1 && <SubmitImageButton title="Xác nhận thay ảnh" />
            }
        </Flex>
    );
};

export default Uploader;
