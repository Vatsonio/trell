import crypto from 'crypto';

export const generateBoardId = (): string => {
  return crypto.randomBytes(8).toString('hex');
};
