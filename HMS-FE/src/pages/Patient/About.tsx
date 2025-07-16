import React from "react";
import { assets } from "../../assets/assets";
import Title from "antd/es/typography/Title";

const About: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Title level={3} style={{ borderLeft: '4px solid #1890ff', paddingLeft: 12 }}>
        Về chúng tôi
      </Title>
      <div className="my-10 flex flex-col md:flex-row gap-12">
        <img
          className="w-full md:max-w-[360px]"
          src={assets.about_image}
          alt="về chúng tôi"
        />
        <div className="flex flex-col justify-center gap-6 md:w-2/4 text-sm text-gray-600">
          <p>
            Chào mừng bạn đến với HMS – Hệ thống quản lý sức khỏe thông minh. Chúng tôi ra đời với mong muốn giúp mọi người dễ dàng hơn trong việc đặt lịch khám, theo dõi quá trình điều trị và quản lý hồ sơ y tế một cách tiện lợi, nhanh chóng.
          </p>
          <p>
            Với HMS, bạn không cần phải chờ đợi lâu hay ghi nhớ quá nhiều thông tin. Chúng tôi luôn nỗ lực phát triển công nghệ để mang lại trải nghiệm tốt nhất cho người dùng – từ lần đặt khám đầu tiên cho đến các dịch vụ chăm sóc sức khỏe dài hạn.
          </p>
          <b className="text-gray-800">Tầm nhìn</b>
          <p>
            HMS hướng đến xây dựng một hệ sinh thái y tế hiện đại, kết nối hiệu quả giữa người bệnh và cơ sở y tế. Chúng tôi mong muốn ai cũng có thể tiếp cận dịch vụ chăm sóc sức khỏe một cách dễ dàng, đúng lúc, đúng nhu cầu.
          </p>
        </div>
      </div>

      <div className="text-xl my-4">
        <p>
          VÌ SAO <span className="text-gray-700 font-semibold">CHỌN CHÚNG TÔI</span>
        </p>
      </div>
      <div className="flex flex-col md:flex-row mb-20">
        <div className="border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer">
          <b>Nhanh chóng:</b>
          <p>
            Đặt lịch khám dễ dàng, tiết kiệm thời gian và phù hợp với lịch trình của bạn.
          </p>
        </div>
        <div className="border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer">
          <b>Tiện lợi:</b>
          <p>
            Kết nối với các bác sĩ, phòng khám uy tín chỉ trong vài thao tác.
          </p>
        </div>
        <div className="border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer">
          <b>Cá nhân hóa:</b>
          <p>
            Gợi ý và nhắc nhở phù hợp với tình trạng sức khỏe và thói quen của bạn.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
