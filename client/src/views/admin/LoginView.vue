<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "@/lib/api";
import { setToken } from "@/lib/auth";

const router = useRouter();

const email = ref("");
const password = ref("");
const error = ref("");
const submitting = ref(false);

async function login() {
    error.value = "";
    submitting.value = true;
    try {
        const { data } = await api.post("/auth/login", {
        email: email.value,
        password: password.value,
        });
        setToken(data.token);
        router.push("/admin");
    } catch (err) {
        console.error("LOGIN ERROR:", err);
        error.value = "Identifiants invalides.";
    } finally {
        submitting.value = false;
    }
}
</script>

<template>
    <section class="min-h-dvh flex flex-col justify-center px-4 md:px-6">
        <div class="max-w-sm mx-auto w-full">
        <span class="microlabel text-ink-soft">// administration</span>
        <h1 class="text-lg mt-4">Connexion</h1>

        <div class="mt-8 space-y-4">
            <div>
            <label class="microlabel text-ink-soft" for="email">E-mail</label>
            <input
                id="email" v-model="email" type="email" autocomplete="username"
                @keyup.enter="login"
                class="mt-2 w-full bg-surface-raised border border-line rounded-xs px-4 py-3 text-ink
                    transition-colors duration-(--dur-fast) ease-out-machined
                    focus:outline-none focus:border-accent"
            />
            </div>

            <div>
            <label class="microlabel text-ink-soft" for="password">Mot de passe</label>
            <input
                id="password" v-model="password" type="password" autocomplete="current-password"
                @keyup.enter="login"
                class="mt-2 w-full bg-surface-raised border border-line rounded-xs px-4 py-3 text-ink
                    transition-colors duration-(--dur-fast) ease-out-machined
                    focus:outline-none focus:border-accent"
            />
            </div>
        </div>

        <button
            @click="login" :disabled="submitting"
            class="inline-flex items-center gap-2 microlabel text-ink mt-8
                border border-line hover:border-line-hover rounded-xs px-6 py-3
                transition-colors duration-(--dur-fast) ease-out-machined
                disabled:opacity-50"
        >
            {{ submitting ? "Connexion…" : "Se connecter" }}
            <span class="text-accent">→</span>
        </button>

        <p v-if="error" class="microlabel text-accent mt-6">{{ error }}</p>
        </div>
    </section>
</template>