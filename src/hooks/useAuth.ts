import { useAuthContext } from '../contexts';

export const useAuth = () => {
  return useAuthContext();
};

export default useAuth;
