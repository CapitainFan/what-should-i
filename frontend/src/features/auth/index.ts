export { AuthSwitch } from './ui/AuthSwitch';
export { CancelButtonAuth } from './ui/CancelButtonAuth';
export { CheckboxAuth } from './ui/CheckboxAuth';
export { SocialIcons } from './ui/SocialIcons';

// export { useAuthFetch, useAuth } from './model/hooks';
// export { AuthContext } from './model/context';
// export type { AuthContextValue } from './model/context';
// export type { AuthState, LoginCredentials, RegisterCredentials } from './model/types';


export { useAuth, AuthContext } from './model/context';
export { useAuthFetch } from './model/hooks';
export { authApi } from './api/authApi';
export type { LoginCredentials, RegisterCredentials, AuthState } from './model/types';