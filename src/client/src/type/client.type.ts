export interface JwtPayload {
  id: string;
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
