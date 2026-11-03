(function () {
  window.AlienSupabaseConfig = Object.freeze({
    loaded: false,
    url: null,
    async load() {
      if (this.loaded) return this;
      const response = await fetch("/api/config/supabase", { credentials: "include" });
      if (!response.ok) throw new Error("Supabase frontend configuration could not be loaded.");
      const body = await response.json();
      this.url = body?.data?.url ?? null;
      this.loaded = true;
      return this;
    }
  });
})();
