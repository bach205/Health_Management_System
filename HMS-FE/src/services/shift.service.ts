import type { IShift } from "../types/index.type";
import instance from "../api/mainRequest";
const BASE_URL = "api/v1/shifts";

export const createShift = (shift: IShift) => {
    return instance.post(`${BASE_URL}/`, shift);
};

export const getShifts = async () => {
    return instance.get(`${BASE_URL}`);
};

export const updateShift = (shift: IShift, id: number) => {
    console.log('shift: ', shift)
    return instance.put(`${BASE_URL}/${id}`, shift);
};

export const getShiftById = (id: number) => {
    return instance.get(`${BASE_URL}/${id}`);
};

export const deleteShift = (id: number) => {
    return instance.delete(`${BASE_URL}/${id}`);
};

// shiftRouter.post(
//     "/",
//     authenticate,
//     authorize(["admin"]),
//     validate({ body: createShiftSchema }),
//     asyncHandler(shiftController.createShift)
//   );
  
//   // Update shift (admin only)
//   shiftRouter.put(
//     "/:id",
//     authenticate,
//     authorize(["admin"]),
//     validate({ body: updateShiftSchema }),
//     asyncHandler(shiftController.updateShift)
//   );
  
//   // Delete shift (admin only)
//   shiftRouter.delete(
//     "/:id",
//     authenticate,
//     authorize(["admin"]),
//     asyncHandler(shiftController.deleteShift)
//   );
