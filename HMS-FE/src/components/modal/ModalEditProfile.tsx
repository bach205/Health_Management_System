import { Button, DatePicker, Form, Input, Modal, Select, type FormInstance } from "antd";
import dayjs from "dayjs";

interface IProps {
    isVisible: boolean;
    handleOk: () => void;
    handleCancel: () => void;
    form: FormInstance;
}

const ModalEditProfile = ({ isVisible, handleOk, handleCancel, form }: IProps) => {
    return (
        <Modal
            open={isVisible}
            title={`Cập nhật thông tin cá nhân`}
            onCancel={handleCancel}
            footer={[
                <Button key="back" onClick={handleCancel}>
                  
                    Hủy
                </Button>,
                <Button key="submit" type="primary" onClick={handleOk}>
                    Cập nhật
                </Button>,
            ]}
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
                <Form.Item
                    label="Họ tên"
                    name="full_name"
                    rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                >
                    <Input placeholder={`Họ tên`} />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, type: "email", message:  "Vui lòng nhập đúng format email!" }]}
                >
                    <Input placeholder={`Email`} />
                </Form.Item>

                <Form.Item
                    label="Số điện thoại"
                    name="phone"
                    rules={[
                        // { required: true, message: "Vui lòng nhập số điện thoại!" },
                        { pattern: new RegExp(/^\d{10}$/), message: "Số điện thoại không hợp lệ!" }
                    ]}
                >
                    <Input placeholder={`Số điện thoại`} />
                </Form.Item>



                <Form.Item
                    name="gender"
                    label="Giới tính"
                    rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
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
                    <DatePicker format="DD/MM/YYYY" placeholder="Ngày sinh" minDate={dayjs().subtract(100, "year") as any} maxDate={dayjs().subtract(18, "year") as any} />
                </Form.Item>

                <Form.Item name="identity_number" label="Số CMND">
                    <Input placeholder="Số CMND" />
                </Form.Item>    

         
            </Form>
        </Modal>
    );
};

export default ModalEditProfile;
