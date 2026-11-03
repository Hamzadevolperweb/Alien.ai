(function () {
    const sessionKey = "alienSession";
    const apiBase = window.ALIEN_API_BASE || "/api";
    const readSession = () => {
        try {
            const raw = localStorage.getItem(sessionKey);
            if (!raw) return null;
            const session = JSON.parse(raw);
            if (session?.mode !== "demo" || !session?.user?.email) {
                localStorage.removeItem(sessionKey);
                return null;
            }
            return session;
        } catch {
            localStorage.removeItem(sessionKey);
            return null;
        }
    };
    const saveSession = session => {
        localStorage.setItem(sessionKey, JSON.stringify({
            ...session,
            mode: "demo"
        }));
    };
    const request = async (path, options = {}) => {
        const session = readSession();
        const headers = new Headers(options.headers || {});
        if (options.body && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
        if (session?.access_token) headers.set("Authorization", "Bearer " + session.access_token);
        const response = await fetch(apiBase + path, { ...options, headers, credentials: "include" });
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
        async refreshSession() {
            const session = readSession();
            if (!session) return null;
            try {
                await request("/auth/demo/resume", {
                    method: "POST",
                    body: JSON.stringify({ username: session.user.email })
                });
                return session;
            } catch {
                return session;
            }
        },
        async signIn(email, password) {
            const username = email.trim();
            if (!username || !password) throw new Error("Enter both a username and password.");
            const user = { id: "demo-user", email: username, display_name: username };
            const session = { user, createdAt: Date.now(), mode: "demo" };
            saveSession(session);
            try {
                await request("/auth/demo/login", {
                    method: "POST",
                    body: JSON.stringify({ username, password })
                });
            } catch (error) {
                localStorage.removeItem(sessionKey);
                throw error instanceof Error ? error : new Error("Backend demo login failed.");
            }
            return user;
        },
        async signUp(email, password, displayName) {
            return this.signIn(email, password);
        },
        async signOut() {
            localStorage.removeItem(sessionKey);
            try {
                await fetch(apiBase + "/auth/logout", { method: "POST", credentials: "include" });
            } catch {}
        }
    });
})();
