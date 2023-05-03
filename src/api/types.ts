export interface CurrentUser {
  nonce: string;
  username: string;
  email: string;
  uuid: string;
  admin: true;
}

export type SystemInfo = {
  provisioned: false;
  voting: false;
} | {
  provisioned: true;
  voting: boolean;
}
