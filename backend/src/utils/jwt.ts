import jwt from "jsonwebtoken";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  return secret;
}

export async function generateAccessWebToken(userId: Number): Promise<string>{
    return jwt.sign(
        {
            userId,
        },
        getJwtSecret(),
        {
            expiresIn: "15m",
        }
    );
}

export function verifyAccessWebToken(token: string) {
  return jwt.verify(token, getJwtSecret());
}