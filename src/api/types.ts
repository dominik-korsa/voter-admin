export interface CurrentUser {
  nonce: string;
  username: string;
  email: string;
  uuid: string;
  admin: true;
}

export interface ClassResponse {
  class: string;
  name: string;
  logos: readonly number[];
}

export interface TokenListItem {
  class: string;
  name: string;
  tokens: string[];
  usedTokens: string[];
  unusedTokens: string[];
}

export interface SystemInfoResponseReset {
  provisioned: false;
  voting: false;
}

export interface SystemInfoResponseProvisioned {
  provisioned: true;
  voting: boolean;
}

export type SystemInfoResponse = SystemInfoResponseReset | SystemInfoResponseProvisioned;

export interface SystemInfoProvisioned extends SystemInfoResponseProvisioned {
  classes: ClassResponse[];
}

export type SystemInfo = SystemInfoResponseReset | SystemInfoProvisioned;

export interface AdminListItem {
  uuid: string;
  name: string;
  email: string;
}

export interface CreateAdminBody {
  email: string;
  username: string;
  password: string;
}
