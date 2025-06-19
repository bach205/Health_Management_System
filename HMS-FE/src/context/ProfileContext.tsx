import { createContext, useEffect, useState } from "react";
import { getProfile } from "../services/patient.service.ts";
const ProfileContext = createContext({} as any);

export default ProfileContext;

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
    const [userData, setUserData] = useState<any>(null);
    const [reloadUser, setReloadUser] = useState<boolean>(false);
    const fetchUser = async () => {
        const res = await getProfile();
        if (res.data.success) {
            setUserData(res.data.user);
        }
    }
    console.log(userData)
    useEffect(() => {
        fetchUser();
    }, [reloadUser]);
    return (
        <ProfileContext.Provider value={{ userData, setUserData, reloadUser, setReloadUser }}>{children}</ProfileContext.Provider>
    );
};

