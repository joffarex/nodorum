export class RegisterUserDto {
  username!: string;
  email!: string;
  password!: string;
  displayName?: string;
  profileImage?: string;
  bio?: string;
}
