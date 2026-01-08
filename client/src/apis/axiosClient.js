import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token hết hạn / không hợp lệ
      localStorage.removeItem("token");

      // Redirect về login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);
export default axiosClient;

export const transactionApi = {
  
  getAll: () => axiosClient.get('/api/core/transactions'),
  create: (data) => axiosClient.post('/api/core/transactions', data),
  update: (id, data) => axiosClient.put(`/api/core/transactions/${id}`, data),
  remove: (id) => axiosClient.delete(`/api/core/transactions/${id}`),

  
  getOne: (id) => axiosClient.get(`/api/core/transactions/${id}`),
  
  // Tìm kiếm: ?keyword=abc
  search: (keyword) => axiosClient.get('/api/core/transactions/search', { params: { keyword } }),
  
  // Lọc: ?startDate=...&endDate=...&type=EXPENSE
  filter: (params) => axiosClient.get('/api/core/transactions/filter', { params }),
  
  // Widget: 5 giao dịch gần nhất
  getRecent: () => axiosClient.get('/api/core/transactions/recent'),
};

export const categoryApi = {
  getAll: () => axiosClient.get('/api/core/categories'),
  create: (data) => axiosClient.post('/api/core/categories', data),
 
  update: (id, data) => axiosClient.put(`/api/core/categories/${id}`, data),
  remove: (id) => axiosClient.delete(`/api/core/categories/${id}`),
};

export const budgetApi = {
  getAll: (params) => axiosClient.get('/api/core/budgets', { params }),
  upsert: (data) => axiosClient.post('/api/core/budgets', data),

  remove: (id) => axiosClient.delete(`/api/core/budgets/${id}`),
};


export const reportApi = {
  //  Dashboard tổng quan
  getDashboard: (userId) => axiosClient.get(`/api/reports/dashboard/${userId}`),

 

  //  Dữ liệu biểu đồ năm
  getYearlyStats: (userId, year) => axiosClient.get(`/api/reports/yearly/${userId}`, { params: { year } }),
};


export const authApi = {
  // Login/Register bạn đã có ở chỗ khác hoặc tự xử lý nên tôi không thêm vào đây
  
  // Cập nhật thông tin cá nhân (Tên)
  updateProfile: (userId, data) => axiosClient.put(`/auth/profile/${userId}`, data),
  
  // Đổi mật khẩu
  changePassword: (userId, data) => axiosClient.put(`/auth/change-password/${userId}`, data),
};