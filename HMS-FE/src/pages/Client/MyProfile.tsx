import React, { useState, ChangeEvent } from "react";
import { assets } from "../../assets/assets";
import { CgPlayButtonO } from "react-icons/cg";

interface UserData {
  name: string;
  image: string;
  email: string;
  phone: string;
  Address: {
    line1: string;
    line2: string;
  };
  gender: "Male" | "Female";
  dob: string;
}

const MyProfile: React.FC = () => {
  const [userData, setUserData] = useState<UserData>({
    name: "Edward Vincent",
    image: assets.profile_pic,
    email: "anis.pvg1234@gmail.com",
    phone: "998000750",
    Address: {
      line1: "57th Cross Richmond",
      line2: "Circle,Chruch Road,India",
    },
    gender: "Male",
    dob: "2000-05-04",
  });

  const [isEdit, setIsEdit] = useState<boolean>(false);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserData((prev) => ({ ...prev, name: e.target.value }));
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserData((prev) => ({ ...prev, phone: e.target.value }));
  };

  const handleAddressLine1Change = (e: ChangeEvent<HTMLInputElement>) => {
    setUserData((prev) => ({
      ...prev,
      Address: { ...prev.Address, line1: e.target.value },
    }));
  };

  const handleAddressLine2Change = (e: ChangeEvent<HTMLInputElement>) => {
    setUserData((prev) => ({
      ...prev,
      Address: { ...prev.Address, line2: e.target.value },
    }));
  };

  const handleGenderChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setUserData((prev) => ({
      ...prev,
      gender: e.target.value as "Male" | "Female",
    }));
  };

  const handleDobChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserData((prev) => ({ ...prev, dob: e.target.value }));
  };

  return (
    <div className="max-w-lg flex flex-col gap-2 text-sm">
      <img className="w-36 rounded" src={userData.image} alt="profile" />
      {isEdit ? (
        <input
          className="bg-grau-50 text-3xl font-medium max-w-60 mt-4"
          type="text"
          value={userData.name}
          onChange={handleNameChange}
        />
      ) : (
        <p className="font-medium text-3xl text-neutral-800 mt-4">
          {userData.name}
        </p>
      )}
      <hr className="bg-zinc-400 h-[1px] border-none" />
      <div>
        <p className="text-neutral-500 underline mt-3">CONTACT INFORMATION</p>
        <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
          <p className="font-medium">Emailid:</p>
          <p className="text-blue-500">{userData.email}</p>
          <p className="font-medium">Phone:</p>
          {isEdit ? (
            <input
              className="bg-gray-100 max-w-52"
              type="text"
              value={userData.phone}
              onChange={handlePhoneChange}
            />
          ) : (
            <p className="text-blue-400">{userData.phone}</p>
          )}
          <p className="font-medium">Address:</p>
          {isEdit ? (
            <p>
              <input
                className="bg-gray-50"
                onChange={handleAddressLine1Change}
                value={userData.Address.line1}
                type="text"
              />
              <br />
              <input
                className="bg-gray-50"
                onChange={handleAddressLine2Change}
                value={userData.Address.line2}
                type="text"
              />
            </p>
          ) : (
            <p className="text-gray-500">
              {userData.Address.line1}
              <br />
              {userData.Address.line2}
            </p>
          )}
        </div>
      </div>
      <div>
        <p className="text-neutral-500 underline mt-3">BASIC INFORMATION</p>
        <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
          <p className="font-medium">Gender:</p>
          {isEdit ? (
            <select
              className="max-w-20 bg-gray-100"
              onChange={handleGenderChange}
              value={userData.gender}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          ) : (
            <p className="text-gray-400">{userData.gender}</p>
          )}
          <p className="font-medium">Birthday:</p>
          {isEdit ? (
            <input
              className="max-w-28 bg-gray-100"
              type="date"
              onChange={handleDobChange}
              value={userData.dob}
            />
          ) : (
            <p className="text-gray-400">{userData.dob}</p>
          )}
        </div>
      </div>
      <div className="mt-10">
        {isEdit ? (
          <button
            className="border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
            onClick={() => setIsEdit(false)}
          >
            Save information
          </button>
        ) : (
          <button
            className="border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
            onClick={() => setIsEdit(true)}
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
