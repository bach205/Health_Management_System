import Button from "@/components/ui/Button";

const Header = () => {
  return (
    <header className="shadow-sm px-4 py-2 ">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center text-yellow-500 font-bold text-lg">
            <div className="w-10 h-10 flex items-center justify-center text-white mr-1">
              🏥
            </div>
            Hospital
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <button className="bg-yellow-400 text-white px-3 py-1 rounded-full font-semibold">
              Tất cả
            </button>
            <button className="text-gray-800 hover:font-semibold">
              Tại nhà
            </button>
            <button className="text-gray-800 hover:font-semibold">
              Tại viện
            </button>
            <button className="text-gray-800 hover:font-semibold">
              Sống khỏe
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Tìm bác sĩ"
              className="pl-8 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none"
            />
            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
        </div>

        <div className="flex items-center">
          <div className="flex flex-col items-center">
            <Button>Đặt lịch</Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
