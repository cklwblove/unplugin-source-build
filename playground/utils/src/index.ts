import { toLowerCase, toUpperCase } from '@/common';

export const strAdd = (str1: string, str2: string) => {
  return `${toUpperCase(str1)}${toLowerCase(str2)}`;
};
