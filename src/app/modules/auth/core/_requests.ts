// FRONTEND-ONLY AUTH (NO SERVER)

import { AuthModel, UserModel } from "./_models";

// Hard-coded credentials
const VALID_EMAIL = "admin@admin.com";
const VALID_PASSWORD = "admin123";

// Fake login (replaces axios.post)
export function login(email: string, password: string) {
  return new Promise<{ data: AuthModel }>((resolve, reject) => {
    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      resolve({
        data: {
          api_token: "static-demo-token-123",
        },
      });
    } else {
      reject(new Error("Invalid credentials"));
    }
  });
}

// Fake register (optional, can disable)
export function register(
  email: string,
  firstname: string,
  lastname: string,
  password: string,
  password_confirmation: string
) {
  return new Promise((resolve) => {
    resolve({
      data: {
        api_token: "new-user-token-123",
      },
    });
  });
}

// Fake forgot-password
export function requestPassword(email: string) {
  return new Promise((resolve) => {
    resolve({
      data: { result: true },
    });
  });
}

// VERY IMPORTANT: Fake getUserByToken
// This restores user on page refresh!!!
export function getUserByToken(token: string) {
  return new Promise<{ data: UserModel }>((resolve) => {
    // if token exists, return user
    if (token === "static-demo-token-123") {
      const fakeUser: UserModel = {
        id: 1,
        username: "admin",
        email: VALID_EMAIL,
        password: VALID_PASSWORD,
        first_name: "Admin",
        last_name: "User",
        fullname: "Admin User",
        occupation: "Administrator",
        companyName: "My Company",
        phone: "09999999999",
        roles: [1],
        pic: "",
      };

      resolve({ data: fakeUser });
    } else {
      // no token = not logged in
      resolve({ data: undefined as any });
    }
  });
}
