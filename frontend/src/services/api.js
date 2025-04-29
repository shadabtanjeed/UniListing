/*
 * API SERVICE
 * Base configuration for API calls
 */

import axios from 'axios';
import { API_BASE_URL } from '../config/api-config';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

export default api;