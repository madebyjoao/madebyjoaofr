import { ref, computed } from "vue";

const TOKEN_KEY = "mbj_admin_token";


function isExpired(jwtString) {
  try {
    const payload = JSON.parse(atob(jwtString.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}


const stored = localStorage.getItem(TOKEN_KEY);
if (stored && isExpired(stored)) {
  localStorage.removeItem(TOKEN_KEY);
}
const token = ref(stored && !isExpired(stored) ? stored : null);

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