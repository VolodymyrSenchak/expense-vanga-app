export interface AuthCommand {
  email: string;
  password: string;
}

export interface PasswordResetCommand {
  email: string;
  redirectTo: string;
}
