import { useUser } from '../context/UserContext';

export default function useGamification() {
  return useUser();
}
