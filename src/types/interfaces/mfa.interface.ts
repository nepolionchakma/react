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
