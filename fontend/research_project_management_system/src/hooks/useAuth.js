import { useEffect } from "react";
import { verifyTokenAsync } from "../store/slices/authSlice";
import { useAppDispatch } from "../store";
import { TokenService } from "../services/token";

const AuthCheck = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = TokenService.getToken();
    if (token) {
      dispatch(verifyTokenAsync());
    }
  }, [dispatch]);

  return null;
};

export default AuthCheck;