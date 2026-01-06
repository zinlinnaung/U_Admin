import axios from "axios";
import { AuthModel, UserModel } from "./_models";

const API_URL = "https://mypadminapi.bitmyanmar.info/api";

// Real Login with BCrypt backend
export function login(email: string, password: string) {
  return axios.post<AuthModel>(`${API_URL}/users/login`, {
    email,
    password,
  });
}

// Real User Fetching by Token (Used by AuthInit)
export function getUserByToken(token: string) {
  // We assume 'token' is the User ID for this simple implementation

  return axios.get<UserModel>(`${API_URL}/users/me/${token}`);
}

// Real Registration
export function register(
  email: string,
  first_name: string,
  last_name: string,
  password: string
) {
  return axios.post(`${API_URL}/users`, {
    email,
    first_name,
    last_name,
    password,
  });
}
