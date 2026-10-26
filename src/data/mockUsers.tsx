
export type UserRole = 'resident' | 'provider';

export interface MockUser {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
}

export const mockUsers: MockUser[] = [
  {
    name: 'Test Resident',
    email: 'resident@test.com',
    password: 'Resident123',
    phone: '0982423795',
    role: 'resident',
  },
  {
    name: 'Test Provider',
    email: 'provider@test.com',
    password: 'Provider123',
    phone: '0888310519',
    role: 'provider',
  },
];
