import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const NotFound = () => {

  const { user } = useAuthStore();

  return (
    <Result
      status="404"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
      extra={
        user?.role === "patient" ? (
          <Link to="/">
            <Button type="primary">Back Home</Button>
          </Link>
        ) : user ?
          (
            <Link to={`/${user?.role}`}>
              <Button type="primary">Back to Dashboard</Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button type="primary">Login</Button>
            </Link>
          )
      }
    />
  );
};

export default NotFound;
