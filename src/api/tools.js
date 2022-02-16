import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/',
  timeout: 60000000000,
  // withCredentials: true,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
    'Accept': 'application/json',
  },
});

axiosInstance.interceptors.response.use(resp => {
  if (resp.status >= 200 && resp.status < 300 || resp.status === 304) {
    return resp;
  }
  return Promise.reject(new Error('请求错误，可能是网络问题'));
}, error => Promise.reject(new Error(error.message)));

export function post(setting) {
  const {
    url,
    data,
    config,
  } = setting;

  return axiosInstance.post(
    url,
    {
      ...data,
    },
    config,
  );
}

export function get(setting) {
  const {
    url,
    config,
  } = setting;

  return axiosInstance.get(
    url,
    config,
  );
}