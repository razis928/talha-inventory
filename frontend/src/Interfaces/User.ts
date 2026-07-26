export interface UserData {
  readonly id: string;
  readonly first_name: string;
  readonly last_name: string;
  readonly middle_name?: string;
  readonly password?: string;
  readonly email: string;
  readonly mobile_phone?: string;
  readonly office_phone?: string;
  readonly date_joined?: string;
  readonly last_login?: string;
  readonly external_id?: string;
  readonly type?: "organization" | "brand" | "company" | "contact";
  readonly created?: string;
  readonly updated?: string;
  readonly is_trash?: boolean;
  readonly is_active?: boolean;
  readonly is_staff?: boolean;
  readonly is_supersuper?: boolean;
  readonly profilePic?: string;
}

export interface UserResponse {
  readonly results: Array<UserData>;
  readonly page?: number;
  readonly count?: number;
  readonly total?: number;
  readonly pages?: number;
}

export interface User {
  readonly id: string;
  readonly first_name: string;
  readonly last_name: string;
  readonly middle_name: string;
  readonly email: string;
  readonly is_superuser: boolean;
  readonly is_staff: boolean;
}
