import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { resetPassword } from '../../services/auth.service'
import { toast } from 'react-toastify';

const ForgetPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Lấy token từ query string (?token=...)

  const token = localStorage.getItem('resetToken');
  useEffect(() => {
    if (token === null || token === undefined) {
      toast.error('Token đã hết hạn');
      navigate('/login');
      return;
    }
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword) {
      toast.error('Vui lòng nhập mật khẩu');
      return;
    }
    if (!confirmPassword) {
      toast.error('Vui lòng nhập xác nhận mật khẩu');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token: token as string, newPassword, confirmPassword });
      toast.success('Đổi mật khẩu thành công!');
      setTimeout(() => {
        navigate('/login');
        localStorage.removeItem('resetToken');
      }, 3000);
      setTimeout(() => {
        const id = toast.loading('loading...');
        setTimeout(() => {
          toast.dismiss(id);
        }, 2000);
      }, 1000);

    } catch (err: any) {
      toast.error(err?.response?.data?.errors[0] || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="min-h-[80vh] flex items-center" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
        <p className="text-2xl font-semibold">Cập nhật mật khẩu</p>
        <div className="w-full">
          <p>Mật khẩu mới</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="password"
            onChange={e => setNewPassword(e.target.value)}
            value={newPassword}
           
          />
        </div>
        <div className="w-full">
          <p>Xác nhận mật khẩu mới</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="password"
            onChange={e => setConfirmPassword(e.target.value)}
            value={confirmPassword}
         
          />
        </div>
        <button
          type="submit"
          className="bg-[#5f6fff] hover:bg-[#5f6fffd5] text-white w-full py-2 rounded-md text-base"
          disabled={loading}
        >
          {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu mới'}
        </button>
        <p>
          <span className="text-primary cursor-pointer hover:underline">
            <Link to="/login" className="text-primary hover:underline ms-1">
              Quay về đăng nhập
            </Link>
          </span>
        </p>
      </div>
    </form>
  )
}

export default ForgetPage