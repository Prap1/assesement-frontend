import axios from 'axios';

export const loginUser = async (data) => {
  const res = await axios.post('http://localhost:8000/api/auth/login', data);
  return res.data;
};

export const registerUser = async (data) => {
  const res = await axios.post('http://localhost:8000/api/auth/register', data);
  return res.data;
};
