(function () {
    const sessionKey = "alienSession";
    const apiBase = window.ALIEN_API_BASE || "/api";
    const readSession = () => {
        try {
            const raw = localStorage.getItem(sessionKey);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    };
    const saveSession = session => {
        localStorage.setItem(sessionKey, JSON.stringify(session));
    };
    const request = async (path, options = {}) => {
        const session = readSession();
        const headers = new Headers(options.headers || {});
        if (options.body && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
        if (session?.access_token) headers.set("Authorization", `Bearer ${session.access_token}`);
        const response = await fetch(apiBase + path, { ...options, headers });
        const body = await response.json().catch(() => null);
        if (!response.ok) {
            throw new Error(body?.error?.message || `Request failed (${response.status})`);
        }
        return body?.data;
    };

    window.AlienDemoAuth = Object.freeze({
        getUsername() {
            const session = readSession();
            return session?.user?.email || session?.user?.id || null;
        },
        getSession: readSession,
        async signIn(email, password) {
            const data = await request("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email: email.trim(), password })
            });
            if (!data?.session?.access_token) throw new Error("The server did not return a login session.");
            saveSession({ ...data.session, user: data.user });
            return data.user;
        },
        async signOut() {
            try {
                await request("/auth/logout", { method: "POST" });
            } finally {
                localStorage.removeItem(sessionKey);
            }
        }
    });
})();
