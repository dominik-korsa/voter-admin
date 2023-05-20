import type {
  AdminListItem,
  ClassResponse,
  CreateAdminBody,
  CurrentUser,
  GenerateTokensResponse, ResultsLogo,
  SystemInfo,
  SystemInfoResponse, TokenBatch,
} from 'src/api/types';
import axios, { AxiosInstance, AxiosError } from 'axios';
import { UserManager, useUserManager } from 'src/composables/user-manager';

export type LoginResult = {
  type: 'ok',
  user: CurrentUser,
} | {
  type: 'user_does_not_exist' | 'wrong_password',
}

export class API {
  private readonly instance: AxiosInstance;

  private readonly userManager: Readonly<UserManager>;

  constructor(userManager: Readonly<UserManager>) {
    this.instance = axios.create({
      baseURL: '/api',
      responseType: 'json',
      withCredentials: true,
    });
    this.userManager = userManager;

    this.instance.interceptors.response.use(
      (response) => response,
      (error: unknown) => {
        if (error instanceof AxiosError && error.response?.status === 401) {
          this.userManager.replaceUser(null);
        }
        throw error;
      },
    );
  }

  async getCurrentUser(): Promise<CurrentUser | null> {
    try {
      const response = await this.instance.get<CurrentUser>('admin/currentuser');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) return null;
      throw error;
    }
  }

  async login(username: string, password: string): Promise<LoginResult> {
    try {
      const response = await this.instance.post<CurrentUser>('admin/login', {
        username,
        password,
      });
      return {
        type: 'ok',
        user: response.data,
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) return { type: 'user_does_not_exist' };
        if (error.response?.status === 403) return { type: 'wrong_password' };
      }
      throw error;
    }
  }

  async getSystemInfo(): Promise<SystemInfo> {
    const response = await this.instance.get<SystemInfoResponse>('user/getinfo');
    if (!response.data.provisioned) return response.data;
    const classesResponse = await this.instance.get<ClassResponse[]>('admin/logos/get');
    return {
      ...response.data,
      classes: classesResponse.data,
    };
  }

  async provision(
    classes: { class: string; logos: number[]; }[],
  ): Promise<null | 'ALREADY_PROVISIONED'> {
    try {
      await this.instance.post<CurrentUser>('admin/setup/provision', classes);
    } catch (error) {
      if (error instanceof AxiosError && error.response !== undefined) {
        const data = error.response.data as { error: string };
        if (data.error === 'ALREADY_PROVISIONED') return 'ALREADY_PROVISIONED';
      }
      throw error;
    }
    return null;
  }

  async setVotingEnabled(enabled: boolean): Promise<void> {
    await this.instance.post(`admin/voting/${enabled ? 'start' : 'stop'}`);
  }

  async resetAll(): Promise<void> {
    await this.instance.delete('admin/setup/resetall');
  }

  async getAdminList() {
    const response = await this.instance.get<AdminListItem[]>('admin/users/get');
    return response.data;
  }

  async createAdmin(
    body: CreateAdminBody,
  ): Promise<null | 'INVALID_EMAIL_ADDRESS' | 'USERNAME_OR_EMAIL_TAKEN'> {
    try {
      await this.instance.put('admin/users/add', body);
    } catch (error) {
      if (error instanceof AxiosError && error.response !== undefined) {
        const data = error.response.data as { error: string };
        if (data.error === 'INVALID_EMAIL_ADDRESS') return 'INVALID_EMAIL_ADDRESS';
        if (data.error === 'USERNAME_OR_EMAIL_TAKEN') return 'USERNAME_OR_EMAIL_TAKEN';
      }
      throw error;
    }
    return null;
  }

  async deleteAdmin(uuid: string) {
    await this.instance.delete(`admin/users/delete/${uuid}`);
  }

  async changePassword(uuid: string, newPassword: string) {
    await this.instance.patch('admin/users/setpassword', {
      uuid,
      newPassword,
    });
  }

  async signOut() {
    await this.instance.post('admin/logout');
  }

  async generateTokens(classId: string, number: number) {
    const response = await this.instance.post<GenerateTokensResponse>('admin/tokens/generate', {
      class: classId,
      number,
    });
    return response.data;
  }

  async getTokenBatches() {
    const response = await this.instance.get<TokenBatch[]>('admin/tokens/get');
    return response.data;
  }

  async getResults() {
    const response = await this.instance.get<ResultsLogo[]>('admin/voting/results/get');
    return response.data;
  }

  async logoutAllSquared() {
    await this.instance.post('admin/logoutallall');
  }
}

export const useAPI = (
  userManager?: Readonly<UserManager> | undefined,
) => new API(userManager ?? useUserManager());
