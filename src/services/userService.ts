import { User } from '@/interface/user';
import usersMock from '@/data/mock/users.json';
import { validateProfile } from '@/utils/validation';

let users: User[] = [...usersMock];

export const userService = {
  getCurrentUser: async (walletAddress: string): Promise<User | null> => {
    return users.find((u) => u.walletAddress === walletAddress) || null;
  },

  getUserByWallet: async (walletAddress: string): Promise<User | null> => {
    return users.find((u) => u.walletAddress === walletAddress) || null;
  },

  upsertProfile: async (walletAddress: string, input: Partial<User>): Promise<User> => {
    const errors = validateProfile(input);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const index = users.findIndex((u) => u.walletAddress === walletAddress);
    if (index >= 0) {
      users[index] = { ...users[index], ...input, updatedAt: new Date().toISOString() } as any;
      return users[index];
    } else {
      const newUser: User = {
        walletAddress,
        displayName: input.displayName || '',
        jobTitle: input.jobTitle || '',
        twitterHandle: input.twitterHandle,
        telegramHandle: input.telegramHandle,
        avatar: input.avatar,
        bio: input.bio,
        joinedAt: new Date().toISOString(),
      };
      users.push(newUser);
      return newUser;
    }
  },
};
