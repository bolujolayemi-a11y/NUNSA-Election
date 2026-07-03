import { create } from 'zustand';

const useAuthStore = create((set) => ({
  voterToken: localStorage.getItem('voter_token'),
  voter: JSON.parse(localStorage.getItem('voter_user') || 'null'),

  adminToken: localStorage.getItem('admin_token'),
  admin: JSON.parse(localStorage.getItem('admin_user') || 'null'),

  masterToken: localStorage.getItem('master_token'),
  master: JSON.parse(localStorage.getItem('master_user') || 'null'),

  loginVoter: (token, user) => {
    localStorage.setItem('voter_token', token);
    localStorage.setItem('voter_user', JSON.stringify(user));
    set({ voterToken: token, voter: user });
  },
  loginAdmin: (token, user) => {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(user));
    set({ adminToken: token, admin: user });
  },
  loginMaster: (token, user) => {
    localStorage.setItem('master_token', token);
    localStorage.setItem('master_user', JSON.stringify(user));
    set({ masterToken: token, master: user });
  },

  logoutVoter: () => {
    localStorage.removeItem('voter_token');
    localStorage.removeItem('voter_user');
    set({ voterToken: null, voter: null });
  },
  logoutAdmin: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    set({ adminToken: null, admin: null });
  },
  logoutMaster: () => {
    localStorage.removeItem('master_token');
    localStorage.removeItem('master_user');
    set({ masterToken: null, master: null });
  },
}));

export default useAuthStore;
