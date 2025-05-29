import { Result, Button } from "antd";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

function Unauthorized() {
    toast.error("You don't have permission to access this page");
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