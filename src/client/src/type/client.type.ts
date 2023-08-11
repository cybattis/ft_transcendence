export interface TokenData {
  id: number;
  email: string;
  nickname: string;
}

export interface ErrorResponse {
  response: {
    status: number;
    data: {
      message: string;
    };
  };
}

export enum ProfileType {
  MyProfile,
  IdProfile,
  NicknameProfile,
}
