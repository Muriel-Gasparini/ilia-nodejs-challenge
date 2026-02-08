export class LoginResponseDto {
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  access_token: string;
}
