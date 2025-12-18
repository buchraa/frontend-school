export type Role = 'ADMIN' | 'TEACHER' | 'PARENT' | 'BENEVOL' | 'STAFF';
export interface CurrentUser {
  userId: number;
  email: string;
  role: Role;
  parent?: { id: number; fullName: string; familyCode: string } | null;
   exp?: number;
  iat?: number;
}
