interface IMFAList {
  mfa_id: number;
  mfa_type: string;
}

export interface IMFA {
  mfa_required: boolean;
  mfa_token: string;
  mfa_methods: IMFAList[];
  message: string;
}

export interface IMFAListType {
  mfa_id: number;
  user_id: number;
  mfa_type: string;
  identifier: string;
  mfa_secret: string;
  mfa_enabled: boolean;
  is_primary: boolean;
  failed_attempts: number;
  locked_until: string;
  last_verified_at: string;
  metadata: {
    hex: string;
    ascii: string;
    base32: string;
    otpauth_url: string;
  };
  created_at: string;
  updated_at: string;
}
