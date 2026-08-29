import bcrypt from "bcrypt";

const Salt_Round = Number(process.env.BCRYPT_SALT_ROUND || 12);

export async function hashPassword(password : string): Promise<string> {
    return bcrypt.hash(password, Salt_Round);
}

export async function comparePassword(
    password: string,
    hashPassword: string
): Promise<boolean> {
    return bcrypt.compare(password, hashPassword);
}