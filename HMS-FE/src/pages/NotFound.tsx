import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const NotFound = () => {

  const { user } = useAuthStore();

  return (
    <Result
      status="404"
      title="404"
      subTitle="Trang bạn đang tìm kiếm không tồn tại."
      extra={
        user ? (
          <Link to="/">
            <Button type="primary">Trang chủ</Button>
          </Link>
        ) : (
          <Link to="/login">
            <Button type="primary">Đăng nhập</Button>
          </Link>
          )
      }
    />
  );
};

export default NotFound;
