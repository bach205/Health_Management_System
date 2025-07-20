import { Button, DatePicker, Form, Image, Input, InputNumber, message, Modal, Select, Upload, type FormInstance, type UploadFile, type UploadProps } from "antd";
import { useEffect, useState } from "react";
import { specialtyOptions, TYPE_EMPLOYEE_STR } from "../../../constants/user.const";
import type { IUserBase } from "../../../types/index.type";
import dayjs from "dayjs";
import Uploader from "../../../pages/Profile/Uploader";
import { useSpecialtyList } from "../../../hooks/useSpecialtyList";
import { getBase64 } from "../../../utils";
import imageCompression from "browser-image-compression";
import { Plus } from "lucide-react";


interface IProps {
  isVisible: boolean;
  handleOk: () => void;
  handleCancel: () => void;
  form: FormInstance;
  role: IUserBase["role"];
  user: any;
  reload: boolean;
  setReload: (reload: boolean) => void;
}


const ModalUpdateDoctor = ({ role, isVisible, handleOk, handleCancel, form, user, reload, setReload }: IProps) => {
  const [specialtyId, setSpecialtyId] = useState<number | null>(null);
  const handleReload = () => {
    handleCancel();
    setReload(!reload);
  }

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewImage, setPreviewImage] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (user?.avatar) {
      setFileList([{
        uid: user.id,
        name: "avatar.png",
        status: 'done',
        url: user.avatar,
      }]);
    }
  }, [user]);

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
      // Set giá trị vào form để submit cùng dữ liệu khác
      form.setFieldsValue({ avatar: base64 });
    } catch (error) {
      console.log(error);
      message.error("Cập nhật ảnh thất bại");
    }

    return false; // Ngăn Upload mặc định
  };



  const { specialties, loading: specialtyLoading, reload: specialtyReload, handleTableChange: specialtyTableChange } = useSpecialtyList(undefined, true);
  console.log("specialties", specialties)

  return (
    <Modal
      open={isVisible}
      title={`Cập nhật ${TYPE_EMPLOYEE_STR[role]}`}
      onOk={handleOk}
      okText={"Cập nhật"}
      cancelText="Hủy"
      onCancel={handleCancel}
      destroyOnHidden
      centered

    >


      <Form
        name="updateUserForm"
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        style={{ marginTop: 20 }}
        initialValues={{ gender: "male" }}
      >

        <Form.Item label="Ảnh đại diện" name="avatar" valuePropName="avatar">
          <div>
            <Upload
              listType="picture-card"
              fileList={fileList}
              beforeUpload={beforeUpload}
              onPreview={async (file) => {
                if (!file.url && !file.preview) {
                  file.preview = await getBase64(file.originFileObj as File);
                }
                setPreviewImage(file.url || (file.preview as string));
                setPreviewOpen(true);
              }}
              onRemove={() => {
                setFileList([]);
                form.setFieldsValue({ avatar: undefined });
              }}
              maxCount={1}
            >
              {fileList.length >= 1 ? null : (
                <div className="flex items-center justify-center flex-col gap-2">
                  <Plus className="w-4 h-4" />
                  <div className="mx-auto">Chọn ảnh</div>
                </div>
              )}
            </Upload>

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
          </div>
        </Form.Item>
        <Form.Item
          label="Họ tên"
          name="full_name"
          rules={[
            { required: true, message: "Vui lòng nhập họ tên!" },
            { max: 25, message: "Họ tên không được vượt quá 25 ký tự!" }
          ]}
        >
          <Input placeholder={`Họ tên ${TYPE_EMPLOYEE_STR[role]}`} maxLength={25} />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, type: "email", message: "Vui lòng nhập đúng format email!" },
            { max: 50, message: "Email không được vượt quá 50 ký tự!" }
          ]}
        >
          <Input disabled={true} placeholder={`Email ${TYPE_EMPLOYEE_STR[role]}`} maxLength={50} />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[
            // { required: true, message: "Vui lòng nhập số điện thoại!" },
            { pattern: new RegExp(/^\d{10}$/), message: "Số điện thoại không hợp lệ!" },
            { max: 10, message: "Số điện thoại không được vượt quá 10 ký tự!" }
          ]}
        >
          <Input placeholder={`Số điện thoại ${TYPE_EMPLOYEE_STR[role]}`} maxLength={20} />
        </Form.Item>

        {role === "doctor" && (
          <>
            <Form.Item
              label="Khoa"
              name="specialty_id"
            >
              <Select
                style={{ width: 120 }}
                value={specialtyId}
                onChange={(value) => setSpecialtyId(value)}
                options={specialties.map((specialty) => ({
                  label: specialty.name,
                  value: specialty.id,
                }))}
              />
            </Form.Item>
            <Form.Item name="bio" label="Tiểu sử">
              <Input.TextArea placeholder="Tiểu sử bác sĩ" />
            </Form.Item>
            <Form.Item name="price" label="Giá khám" rules={[{ required: true, message: "Vui lòng nhập giá khám!" }]}>
              <InputNumber placeholder="Giá khám" min={0} />
              {/* <span className="ml-2">Đ</span> */}
            </Form.Item>
          </>
        )}

        <Form.Item
          name="gender"
          label="Giới tính"
        // rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
        >
          <Select style={{ width: 100 }}>
            <Select.Option value="male"><span className="text-black">Nam</span></Select.Option>
            <Select.Option value="female"><span className="text-black">Nữ</span></Select.Option>
            <Select.Option value="other"><span className="text-black">Khác</span></Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="address" label="Địa chỉ">
          <Input placeholder="Địa chỉ" />
        </Form.Item>

        <Form.Item name="date_of_birth" label="Ngày sinh">
          <DatePicker format="DD/MM/YYYY" placeholder="Ngày sinh" minDate={dayjs().subtract(100, "year") as any} maxDate={dayjs().subtract(18, "year") as any} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalUpdateDoctor;
