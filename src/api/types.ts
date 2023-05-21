export interface CurrentUser {
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

export interface GenerateTokensResponse {
  class: string;
  className: string;
  pdfUrl: string;
  tokens: string[];
  timestamp: number;
  batchUuid: string;
}

export interface Token {
  token: string;
  used: boolean;
}

export interface TokenBatch {
  batchUuid: string;
  class: string;
  className: string;
  timestamp: number;
  tokens: Token[];
}

export interface ResultsLogoClass {
  number: number;
  uuid: string;
  name: string;
}

export interface ResultsLogo {
  number: number;
  class: ResultsLogoClass,
  totalPoints: number;
  detailedPoints: {
    points: number;
    count: number;
  }[];
  ranking: number;
}
