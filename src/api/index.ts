import type { CurrentUser, SystemInfo } from 'src/api/types';
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
      baseURL: process.env.API_BASE_URL,
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
      const response = await this.instance.get<CurrentUser>('admin/currentuser', {
        withCredentials: true,
      });
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
    const response = await this.instance.get<SystemInfo>('user/getinfo', {
      withCredentials: false,
    });
    return response.data;
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
    await this.instance.post<CurrentUser>(`admin/voting/${enabled ? 'start' : 'stop'}`);
  }
}

export const useAPI = (
  userManager?: Readonly<UserManager> | undefined,
) => new API(userManager ?? useUserManager());
