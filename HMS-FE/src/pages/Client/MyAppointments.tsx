import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";

interface Doctor {
  _id: string;
  name: string;
  speciality: string;
  image: string;
  address: {
    line1: string;
    line2: string;
  };
}

const MyAppointments: React.FC = () => {
  const { doctors } = useContext(AppContext);

  const handlePayOnline = (doctorId: string) => {
    // Implement payment logic here
    console.log("Payment initiated for doctor:", doctorId);
  };

  const handleCancelAppointment = (doctorId: string) => {
    // Implement cancellation logic here
    console.log("Appointment cancelled for doctor:", doctorId);
  };

  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">
        My Appointments
      </p>
      <div>
        {doctors.slice(0, 3).map((item: Doctor, index: number) => (
          <div
            className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
            key={index}
          >
            <div>
              <img
                className="w-32 bg-indigo-50"
                src={item.image}
                alt={item.name}
              />
            </div>
            <div className="flex-1 text-sm text-zinc-600">
              <p className="text-neutral-800 font-semibold">{item.name}</p>
              <p>{item.speciality}</p>
              <p className="text-zinc-700 font-medium mt-1">Address:</p>
              <p className="text-xs">{item.address.line1}</p>
              <p className="text-xs">{item.address.line2}</p>
              <p className="text-sm mt-1">
                <span className="text-sm text-neutral-700 font-medium">
                  Date & Time:
                </span>{" "}
                25,july,2024 8:30 PM
              </p>
            </div>
            <div className="flex flex-col gap-2 justify-end">
              <button
                onClick={() => handlePayOnline(item._id)}
                className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border hover:bg-primary hover:text-white transition-all duration-300 rounded"
              >
                Pay Online
              </button>
              <button
                onClick={() => handleCancelAppointment(item._id)}
                className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border hover:bg-red-600 hover:text-white transition-all duration-300 rounded"
              >
                Cancel appointment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointments;
