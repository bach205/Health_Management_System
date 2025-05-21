import { hash } from "bcrypt";

const securePassword = async (password) => {
    const hashedPassword = await hash(password, 9);
    return hashedPassword;
};

export { securePassword };