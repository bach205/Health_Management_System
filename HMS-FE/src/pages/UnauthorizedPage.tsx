import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';

const UnauthorizedPage = () => (
  <Result
    status="403"
    title="403"
    subTitle="Bạn không có quyền truy cập trang này."
    extra={
      <Link to="/">
        <Button type="primary">Đi tới trang chủ</Button>
      </Link>
    }
  />
);

export default UnauthorizedPage;
