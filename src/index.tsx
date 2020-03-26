import { NativeModules } from 'react-native';
const { RNMSAL } = NativeModules;

export interface MSALResult {
  accessToken: string;
  expiresOn: number;
  idToken?: string;
  scopes: string[];
  authority: string;
  tenantId?: string;
  account: MSALAccount;
}

export interface MSALAccount {
  identifier: string;
  username?: string;
}

export enum MSALPromptType {
  SELECT_ACCOUNT,
  LOGIN,
  CONSENT,
  WHEN_REQUIRED,
  DEFAULT = WHEN_REQUIRED,
}

export interface MSALParams {
  authority: string;
}

export interface MSALInterativeParams extends MSALParams {
  scopes: string[];
  promptType?: MSALPromptType;
  loginHint?: string;
  extraQueryParameters?: Record<string, string>;
  extraScopesToConsent?: string[];
}

export interface MSALSilentParams extends MSALParams {
  scopes: string[];
  accountIdentifier: string;
  forceRefresh?: boolean;
}

export interface MSALRemoveAccountParams extends MSALParams {
  accountIdentifier: string;
}

export interface MSALClientOptions {
  iosRedirectUri?: string;
}

export default class MSALClient {
  constructor(private clientId: string, private options?: MSALClientOptions) {}

  /**
   * Acquire a token interactively
   * @param {MSALInterativeParams} params
   * @return {Promise<MSALResult>} Result containing an access token and account identifier
   * used for acquiring subsequent tokens silently
   */
  public acquireToken = (params: MSALInterativeParams): Promise<MSALResult> => {
    const {
      promptType = MSALPromptType.DEFAULT,
      loginHint = '',
      extraQueryParameters = {},
      extraScopesToConsent = [],
      ...rest
    } = params;
    return RNMSAL.acquireToken({
      clientId: this.clientId,
      promptType,
      loginHint,
      extraQueryParameters,
      extraScopesToConsent,
      ...rest,
      ...this.options,
    });
  };

  /**
   * Acquire a token silently
   * @param {MSALSilentParams} params - Includes the account identifer retrieved from a
   * previous interactive login
   * @return {Promise<MSALResult>} Result containing an access token and account identifier
   * used for acquiring subsequent tokens silently
   */
  public acquireTokenSilent = (params: MSALSilentParams): Promise<MSALResult> => {
    const { forceRefresh = false, ...rest } = params;
    return RNMSAL.acquireTokenSilent({
      clientId: this.clientId,
      forceRefresh,
      ...rest,
      ...this.options,
    });
  };

  /**
   * Remove all the tokens for the secified account
   * @param {MSALRemoveAccountParams} params
   * @return {Promise<void>} A promise which resolves if remove is successful,
   * otherwise rejects
   */
  public removeAccount = (params: MSALRemoveAccountParams): Promise<void> => {
    return RNMSAL.removeAccount({ clientId: this.clientId, ...params, ...this.options });
  };
}
