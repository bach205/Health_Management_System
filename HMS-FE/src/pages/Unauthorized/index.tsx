import { toast } from "react-toastify";

function Unauthorized() {
    toast.error("You don't have permission to access this page");
    return(
        <div>Unauthorized</div>
    )
}
export default Unauthorized;