import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// This function sets up the interceptor and should be called from AuthContext
export function setupApiInterceptors(getUser, setUser) {
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const user = getUser();
      if (
        error.response &&
        error.response.status === 401 &&
        user &&
        !originalRequest._retry &&
        !originalRequest.url.includes("/token/") &&
        !originalRequest.url.includes("/register/")
      ) {
        originalRequest._retry = true;
        try {
          const res = await axios.post(
            `${process.env.REACT_APP_API_URL}/token/refresh/`,
            {
              refresh: user.refresh,
            }
          );
          const newAccess = res.data.access;
          setUser({ ...user, access: newAccess });
          api.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
          originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch (refreshError) {
          setUser(null);
        }
      }
      return Promise.reject(error);
    }
  );
}

export { api };
