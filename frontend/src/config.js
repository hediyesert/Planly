const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:5001";

export const apiUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export { API_BASE_URL };

