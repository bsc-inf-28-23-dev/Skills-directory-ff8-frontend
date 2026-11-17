import axios from "axios";

const api = axios.create({
  // We are forcing the IP address here to make sure it is used.
  baseURL: "http://192.168.1.101:3000/api", 
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;