export interface JwtPayload {
  id: string;
  email: string;
  username: string;
}

export interface ErrorResponse {
  response: {
    status: number;
    data: {
      message: string;
    };
  };
}
