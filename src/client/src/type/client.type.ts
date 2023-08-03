export interface JwtPayload {
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
