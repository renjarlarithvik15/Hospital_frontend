/**
 * Hospital Management System - Central API Client & Authentication
 *
 * BACKEND CONFIGURATION:
 * 1. Localhost (Development): Automatically connects to http://localhost:8080/api
 * 2. Vercel / Cloud: Connects to your deployed Render backend URL.
 * 3. Dynamic Override: Set localStorage.setItem('HMS_API_URL', 'https://your-service.onrender.com/api')
 *    or window.HMS_API_URL in browser console.
 */
const DEFAULT_RENDER_BACKEND = 'https://hospital-management-hh1n.onrender.com/api';

const API_BASE_URL = (() => {
  // Check runtime override via window or localStorage
  if (typeof window !== 'undefined' && window.HMS_API_URL) {
    return window.HMS_API_URL;
  }
  try {
    const stored = localStorage.getItem('HMS_API_URL');
    if (stored) return stored;
  } catch (e) {}

  // Local development
  if (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8080/api';
  }

  // Same-origin on Render
  if (window.location.hostname.endsWith('.onrender.com')) {
    return '/api';
  }

  // Deployed on Vercel or other domain -> Render Backend
  return DEFAULT_RENDER_BACKEND;
})();

const API = {
  // -------------------------------------------------------------
  // Storage & Authentication Helpers
  // -------------------------------------------------------------
  getToken() {
    return localStorage.getItem('hms_token');
  },

  getUser() {
    const userStr = localStorage.getItem('hms_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  setAuth(authResponse) {
    localStorage.setItem('hms_token', authResponse.token);
    localStorage.setItem('hms_user', JSON.stringify({
      id: authResponse.id,
      username: authResponse.username,
      email: authResponse.email,
      fullName: authResponse.fullName,
      role: authResponse.role,
      entityId: authResponse.entityId
    }));
  },

  clearAuth() {
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_user');
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  checkAuth(allowedRoles = []) {
    if (!this.isAuthenticated()) {
      window.location.href = 'login.html';
      return false;
    }
    const user = this.getUser();
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      alert('Access Denied: You do not have permissions for this page.');
      window.location.href = 'index.html';
      return false;
    }
    return true;
  },

  // -------------------------------------------------------------
  // HTTP Fetch Wrapper
  // -------------------------------------------------------------
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401 && !url.includes('/auth/login')) {
          this.clearAuth();
          window.location.href = 'login.html';
        }
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (err) {
      console.error(`API Error on [${endpoint}]:`, err);
      throw err;
    }
  },

  // -------------------------------------------------------------
  // Auth Endpoints
  // -------------------------------------------------------------
  async login(username, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (res.success && res.data) {
      this.setAuth(res.data);
    }
    return res;
  },

  async register(patientData) {
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(patientData)
    });
    if (res.success && res.data) {
      this.setAuth(res.data);
    }
    return res;
  },

  logout() {
    this.clearAuth();
    window.location.href = 'login.html';
  },

  // -------------------------------------------------------------
  // Departments
  // -------------------------------------------------------------
  async getDepartments() {
    const res = await this.request('/departments');
    return res.data || [];
  },

  async createDepartment(department) {
    return await this.request('/departments', {
      method: 'POST',
      body: JSON.stringify(department)
    });
  },

  async updateDepartment(id, department) {
    return await this.request(`/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(department)
    });
  },

  async deleteDepartment(id) {
    return await this.request(`/departments/${id}`, {
      method: 'DELETE'
    });
  },

  // -------------------------------------------------------------
  // Doctors
  // -------------------------------------------------------------
  async getDoctors() {
    const res = await this.request('/doctors');
    return res.data || [];
  },

  async getDoctorsByDepartment(deptId) {
    const res = await this.request(`/doctors/department/${deptId}`);
    return res.data || [];
  },

  async getDoctorById(id) {
    const res = await this.request(`/doctors/${id}`);
    return res.data;
  },

  async createDoctor(doctor) {
    return await this.request('/doctors', {
      method: 'POST',
      body: JSON.stringify(doctor)
    });
  },

  async updateDoctor(id, doctor) {
    return await this.request(`/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(doctor)
    });
  },

  async deleteDoctor(id) {
    return await this.request(`/doctors/${id}`, {
      method: 'DELETE'
    });
  },

  // -------------------------------------------------------------
  // Patients
  // -------------------------------------------------------------
  async getPatients() {
    const res = await this.request('/patients');
    return res.data || [];
  },

  async getMyPatient() {
    const res = await this.request('/patients/me');
    return res.data;
  },

  async getPatientById(id) {
    const res = await this.request(`/patients/${id}`);
    return res.data;
  },

  async updatePatient(id, patient) {
    return await this.request(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patient)
    });
  },

  async deletePatient(id) {
    return await this.request(`/patients/${id}`, {
      method: 'DELETE'
    });
  },

  // -------------------------------------------------------------
  // Staff
  // -------------------------------------------------------------
  async getStaff() {
    const res = await this.request('/staff');
    return res.data || [];
  },

  async createStaff(staff) {
    return await this.request('/staff', {
      method: 'POST',
      body: JSON.stringify(staff)
    });
  },

  async updateStaff(id, staff) {
    return await this.request(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(staff)
    });
  },

  async deleteStaff(id) {
    return await this.request(`/staff/${id}`, {
      method: 'DELETE'
    });
  },

  // -------------------------------------------------------------
  // Appointments
  // -------------------------------------------------------------
  async getAppointments() {
    const res = await this.request('/appointments');
    return res.data || [];
  },

  async getPatientAppointments(patientId) {
    const res = await this.request(`/appointments/patient/${patientId}`);
    return res.data || [];
  },

  async getDoctorAppointments(doctorId) {
    const res = await this.request(`/appointments/doctor/${doctorId}`);
    return res.data || [];
  },

  async bookAppointment(appointment) {
    return await this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointment)
    });
  },

  async updateAppointmentStatus(id, status, doctorNotes = '') {
    return await this.request(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, doctorNotes })
    });
  },

  async cancelAppointment(id) {
    return await this.request(`/appointments/${id}/cancel`, {
      method: 'POST'
    });
  },

  // -------------------------------------------------------------
  // Prescriptions
  // -------------------------------------------------------------
  async getPrescriptions() {
    const res = await this.request('/prescriptions');
    return res.data || [];
  },

  async getPatientPrescriptions(patientId) {
    const res = await this.request(`/prescriptions/patient/${patientId}`);
    return res.data || [];
  },

  async getDoctorPrescriptions(doctorId) {
    const res = await this.request(`/prescriptions/doctor/${doctorId}`);
    return res.data || [];
  },

  async createPrescription(prescription) {
    return await this.request('/prescriptions', {
      method: 'POST',
      body: JSON.stringify(prescription)
    });
  },

  // -------------------------------------------------------------
  // Billing
  // -------------------------------------------------------------
  async getBills() {
    const res = await this.request('/bills');
    return res.data || [];
  },

  async getPatientBills(patientId) {
    const res = await this.request(`/bills/patient/${patientId}`);
    return res.data || [];
  },

  async generateBill(bill) {
    return await this.request('/bills', {
      method: 'POST',
      body: JSON.stringify(bill)
    });
  },

  async recordPayment(billId, amount, paymentMethod) {
    return await this.request(`/bills/${billId}/payment`, {
      method: 'POST',
      body: JSON.stringify({ amount, paymentMethod })
    });
  },

  // -------------------------------------------------------------
  // Dashboard Analytics
  // -------------------------------------------------------------
  async getDashboardStats() {
    const res = await this.request('/dashboard/stats');
    return res.data || {};
  }
};

// -------------------------------------------------------------
// UI Utilities
// -------------------------------------------------------------
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bgClass = type === 'success' ? 'bg-success' : type === 'danger' ? 'bg-danger' : type === 'warning' ? 'bg-warning text-dark' : 'bg-primary';
  toast.className = `toast align-items-center text-white ${bgClass} border-0 show mb-2`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body fw-medium">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
