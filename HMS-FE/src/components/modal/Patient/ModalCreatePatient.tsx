import { DatePicker, Form, Input, Modal, Select, Checkbox, type FormInstance, type UploadFile, message, Upload, Image } from "antd";
import { useState } from "react";
import { TYPE_EMPLOYEE_STR } from "../../../constants/user.const";
import type { IUserBase } from "../../../types/index.type";
import dayjs from "dayjs";
import imageCompression from "browser-image-compression";
import { PlusOutlined } from "@ant-design/icons";

interface IProps {
  isVisible: boolean;
  handleOk: () => void;
  handleCancel: () => void;
  form: FormInstance;
  role: IUserBase["role"];
}
const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
const ModalCreatePatient = ({ role, isVisible, handleOk, handleCancel, form }: IProps) => {
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [identityType, setIdentityType] = useState("citizen");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewImage, setPreviewImage] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  const beforeUpload = async (file: File) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    const isLt5M = file.size / 1024 / 1024 < 5;

    if (!isJpgOrPng) {
      message.error('Chỉ cho phép ảnh JPG hoặc PNG!');
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

      setFileList([{
        uid: Date.now().toString(),
        name: file.name,
        status: 'done',
        url: base64,
      }]);
      form.setFieldsValue({ avatar: base64 });
    } catch (err) {
      console.error(err);
      message.error("Không thể xử lý ảnh.");
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

  const uploadButton = (
    <div className="flex items-center justify-center flex-col gap-2">
      <PlusOutlined />
      <div className="mx-auto">Chọn ảnh</div>
    </div>
  );

  return (
    <Modal
      open={isVisible}
      title={`Thêm ${TYPE_EMPLOYEE_STR[role]}`}
      onOk={handleOk}
      okText="Thêm"
      cancelText="Hủy"
      onCancel={handleCancel}
      destroyOnHidden
      centered
    >
      <Form
        name="addUserForm"
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
              onPreview={handlePreview}
              onRemove={() => {
                setFileList([]);
                form.setFieldsValue({ avatar: undefined });
              }}
              maxCount={1}
            >
              {fileList.length >= 1 ? null : uploadButton}
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
            { required: true, type: "email", message: "Vui lòng nhập đúng format!" },
            { max: 50, message: "Email không được vượt quá 50 ký tự!" }
          ]}
        >
          <Input placeholder={`Email ${TYPE_EMPLOYEE_STR[role]}`} maxLength={50} />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[
            // { required: true, message: "Vui lòng nhập số điện thoại!" },
            {
              pattern: /^\d{10}$/,
              message: "Số điện thoại không hợp lệ!",
            },
            { max: 10, message: "Số điện thoại không được vượt quá 10 ký tự!" }
          ]}
        >
          <Input placeholder={`Số điện thoại ${TYPE_EMPLOYEE_STR[role]}`} maxLength={10} />
        </Form.Item>

        <Form.Item
          name="gender"
          label="Giới tính"
        >
          <Select style={{ width: 100 }}>
            <Select.Option value="male"><span className="text-black">Nam</span></Select.Option>
            <Select.Option value="female"><span className="text-black">Nữ</span></Select.Option>
          </Select>
        </Form.Item>


        <Form.Item name="address" label="Địa chỉ">
          <Input placeholder="Địa chỉ" />
        </Form.Item>

        <Form.Item name="date_of_birth" label="Ngày sinh">
          <DatePicker
            format="DD/MM/YYYY"
            placeholder="Ngày sinh"
            maxDate={dayjs()}
          />
        </Form.Item>

        <Form.Item
          name="identity_type"
          label="Loại định danh"
          initialValue="citizen"
        >
          <Select onChange={(value) => setIdentityType(value)} style={{ width: "100%" }}>
            <Select.Option value="passport"><span className="text-black">Chứng minh nhân dân</span></Select.Option>
            <Select.Option value="citizen"><span className="text-black">Căn cước công dân</span></Select.Option>
          </Select>
        </Form.Item>

        {identityType === "citizen" ? (
          <Form.Item name="identity_number" label="Số CCCD"
            rules={[
              { pattern: new RegExp(/^\d{12}$/), message: "Số CCCD không hợp lệ!", whitespace: true }
            ]}
          >
            <Input placeholder="Số CCCD" maxLength={12} />
          </Form.Item>
        ) : (
          <Form.Item name="identity_number" label="Số CMND"

            rules={[
              { pattern: new RegExp(/^\d{9}(\d{3})?$/), message: "Số CMND không hợp lệ!", whitespace: true }
            ]}
          >
            <Input placeholder="Số CMND" maxLength={12} />
          </Form.Item>
        )}

        <Form.Item
          name="create_password"
          label="Mật khẩu"
          valuePropName="checked"
          tooltip="Nếu không chọn, hệ thống sẽ tự động tạo mật khẩu default"
        >
          <Checkbox onChange={(e) => setShowPasswordFields(e.target.checked)}>
            Tạo mật khẩu tùy chỉnh
          </Checkbox>
        </Form.Item>

        <Form.Item className={showPasswordFields ? "" : "hidden"}
          label="Mật khẩu"
          name="password"
          rules={[
            { required: showPasswordFields, message: "Vui lòng nhập mật khẩu!" },
            { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,
              message: "Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt!"
            }
          ]}
        >
          <Input.Password placeholder="Nhập mật khẩu" />
        </Form.Item>
        {showPasswordFields && (
          <>
            <Form.Item
              label="Xác nhận"
              name="confirm_password"
              dependencies={['password']}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu không khớp!'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Xác nhận mật khẩu" />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>

  );
};

export default ModalCreatePatient;
