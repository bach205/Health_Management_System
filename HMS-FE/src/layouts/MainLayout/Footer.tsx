const Footer = () => {
  return (
    <footer className="bg-gray-100 text-sm text-gray-700 px-6 py-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <p className="font-semibold">Công ty Cổ phần Công nghệ BookingCare</p>
          <p className="mt-2 flex items-start gap-2">
            📍
            <span>
              Lô B4/D21, Khu đô thị mới Cầu Giấy, Phường Dịch Vọng Hậu, Quận Cầu
              Giấy, Thành phố Hà Nội, Việt Nam
            </span>
          </p>
          <p className="mt-1">
            ĐKKD số. 0106790291. Sở KHĐT Hà Nội cấp ngày 16/03/2015
          </p>
          <p className="mt-1 flex items-center gap-2">
            📞{" "}
            <a href="tel:02473012468" className="text-blue-500">
              024-7301-2468
            </a>{" "}
            (7h30 - 18h)
          </p>
          <p className="mt-1 flex items-center gap-2">
            ✉️ support@bookingcare.vn (7h30 - 18h)
          </p>

          <p className="mt-4 font-semibold">Văn phòng tại TP Hồ Chí Minh</p>
          <p className="mt-1 flex items-start gap-2">
            📍
            <span>Tòa nhà H3, 384 Hoàng Diệu, Phường 6, Quận 4, TP.HCM</span>
          </p>

          <div className="mt-3 flex gap-2">
            <img src="/dangky1.png" alt="Đã đăng ký" className="w-14 h-auto" />
            <img src="/dangky2.png" alt="Đã đăng ký" className="w-14 h-auto" />
          </div>
        </div>

        <div>
          <div className="text-yellow-500 font-bold text-lg mb-2">
            BookingCare
          </div>
          <ul className="space-y-1 text-blue-500">
            <li>
              <a href="#">Liên hệ hợp tác</a>
            </li>
            <li>
              <a href="#">Chuyển đổi số</a>
            </li>
            <li>
              <a href="#">Chính sách bảo mật</a>
            </li>
            <li>
              <a href="#">Quy chế hoạt động</a>
            </li>
            <li>
              <a href="#">Tuyển dụng</a>
            </li>
            <li>
              <a href="#">Điều khoản sử dụng</a>
            </li>
            <li>
              <a href="#">Câu hỏi thường gặp</a>
            </li>
            <li>
              <a href="#">Sức khỏe doanh nghiệp</a>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-semibold mb-2">Đối tác bảo trợ nội dung</p>
          <div className="space-y-3">
            <div>
              <img
                src="/hellodoctor.png"
                alt="Hello Doctor"
                className="w-24 mb-1"
              />
              <p className="text-sm">
                Bảo trợ chuyên mục nội dung “sức khỏe tinh thần”
              </p>
            </div>
            <div>
              <img src="/bernard.png" alt="Bernard" className="w-24 mb-1" />
              <p className="text-sm">
                Bảo trợ chuyên mục nội dung “y khoa chuyên sâu”
              </p>
            </div>
            <div>
              <img
                src="/doctorcheck.png"
                alt="Doctor Check"
                className="w-24 mb-1"
              />
              <p className="text-sm">
                Bảo trợ chuyên mục nội dung “sức khỏe tổng quát”
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t pt-4 text-sm text-gray-600 flex flex-col md:flex-row items-center justify-between">
        <p className="text-center w-full">
          Copyright © 2025 TuDEV. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
