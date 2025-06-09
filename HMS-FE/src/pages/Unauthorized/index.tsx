import { Result, Button, message } from "antd";
import { Link } from "react-router-dom";


function Unauthorized() {
    message.error("Bạn không có quyền truy cập trang này.");
    return(
          <Result
            status="403"
            title="403"
            subTitle="Bạn không có quyền truy cập trang này."
            extra={
            <Link to="/login">
                <Button type="primary">Đi tới trang đăng nhập</Button>
            </Link>
            }
        />
    )
}
export default Unauthorized;