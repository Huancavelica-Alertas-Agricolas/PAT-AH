import axios from 'axios';
import { FormData } from '../types/form';

const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3003/api';

export const registerFarmer = async (data: FormData) => {
  // El endpoint de creación de usuario en el backend es POST /api/users
  return axios.post(`${API_URL}/users`, {
    nombre: data.nombre,
    telefono: data.telefono,
    password: data.contraseña,
    email: data.email,
    ciudad: data.provincia
  }, { timeout: 8000 });
};

export const getAlerts = async () => {
  return axios.get(`${API_URL}/alerts`, { timeout: 5000 });
};
