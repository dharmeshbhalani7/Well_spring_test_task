export interface JwtPayload {
  sub: string;
  email: string;
}

export interface SanitizedCreator {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
}
