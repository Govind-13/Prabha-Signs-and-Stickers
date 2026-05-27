// src/types/api.ts
// Shared type definitions that mirror the Mongoose schemas.

export interface Sticker {
  _id: string;
  title: string;
  imageUrl: string;
  publicId?: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminLoginResponse {
  _id: string;
  username: string;
  token: string;
}

export interface Settings {
  headerAnimation?: 'fade' | 'slide' | 'bounce';
  [key: string]: string | undefined;
}

export type AnimationType = 'fade' | 'slide' | 'bounce';
