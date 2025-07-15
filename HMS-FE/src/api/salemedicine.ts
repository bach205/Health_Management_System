import mainRequest from "./mainRequest"

const BASE_URL = "api/v1/patient"

export const getUserDataByIdentity = (identity : string) => {
    const res = mainRequest.post(`${BASE_URL}/find-by-cccd`, {
        identity_number : identity
    })
    return res;
}