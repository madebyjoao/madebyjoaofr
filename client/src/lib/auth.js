import { ref, computed } from "vue";

const TOKEN_KEY = "mbj_admin_token";


const token = ref(localStorage.getItem(TOKEN_KEY));

export const isLoggedIn = computed(() => !!token.value);

export function setToken(newToken) {
  token.value = newToken;
  localStorage.setItem(TOKEN_KEY, newToken);
}

export function clearToken() {
  token.value = null;
  localStorage.removeItem(TOKEN_KEY);
}

export function getToken() {
  return token.value;
}