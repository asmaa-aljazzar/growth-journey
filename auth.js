(function () {
  "use strict";

  const config = window.GROWTH_JOURNEY_CONFIG || {};
  const TABLE = "user_journals";
  let client = null;
  let currentUser = null;
  let cloudSaveTimer = null;
  let resolveReady = null;
  let readyPromise = null;

  function message(text, type = "info") {
    const element = document.querySelector("#auth-message");
    if (!element) return;
    element.textContent = text;
    element.dataset.type = type;
  }

  function setBusy(isBusy) {
    document.querySelectorAll("#auth-shell button, #auth-shell input").forEach((element) => {
      element.disabled = isBusy;
    });
  }

  function showMode(mode) {
    const isRegister = mode === "register";
    document.querySelector("#auth-title").textContent = isRegister ? "Create your private journal" : "Welcome back";
    document.querySelector("#auth-description").textContent = isRegister
      ? "Create an account to keep your journal synchronized across devices."
      : "Sign in to open your private Growth Journey.";
    document.querySelector("#auth-submit").textContent = isRegister ? "Create account" : "Sign in";
    document.querySelector("#auth-mode").value = mode;
    document.querySelector("#show-login").classList.toggle("active", !isRegister);
    document.querySelector("#show-register").classList.toggle("active", isRegister);
    message("");
  }

  async function fetchJournal(user) {
    const { data, error } = await client
      .from(TABLE)
      .select("journal_data")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;
    return data?.journal_data || null;
  }

  async function finishAuthentication(session) {
    if (!session?.user || currentUser?.id === session.user.id) return;
    currentUser = session.user;
    setBusy(true);
    message("Opening your private journal…");
    try {
      const journal = await fetchJournal(session.user);
      document.querySelector("#account-email").textContent = session.user.email || "Signed in";
      document.querySelector("#auth-shell").hidden = true;
      document.querySelector("#app-shell").hidden = false;
      document.body.classList.add("authenticated");
      resolveReady?.({ user: session.user, journal });
      resolveReady = null;
    } catch (error) {
      currentUser = null;
      setBusy(false);
      message(`Could not load your journal: ${error.message}`, "error");
    }
  }

  async function submitAuth(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = form.email.value.trim();
    const password = form.password.value;
    const mode = form.mode.value;
    setBusy(true);
    message(mode === "register" ? "Creating your account…" : "Signing in…");

    try {
      if (mode === "register") {
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.href.split("#")[0] }
        });
        if (error) throw error;
        if (data.session) await finishAuthentication(data.session);
        else {
          setBusy(false);
          showMode("login");
          message("Account created. Check your email and confirm it, then return here to sign in.", "success");
        }
      } else {
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await finishAuthentication(data.session);
      }
    } catch (error) {
      setBusy(false);
      message(error.message, "error");
    }
  }

  async function requestPasswordReset() {
    const email = document.querySelector("#auth-email").value.trim();
    if (!email) {
      message("Enter your email first, then choose Forgot password.", "error");
      return;
    }
    setBusy(true);
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.href.split("#")[0]
    });
    setBusy(false);
    message(error ? error.message : "Password-reset email sent. Check your inbox.", error ? "error" : "success");
  }

  async function start() {
    if (readyPromise) return readyPromise;
    readyPromise = new Promise((resolve) => { resolveReady = resolve; });

    if (!window.supabase?.createClient || !config.supabaseUrl || !config.supabasePublishableKey) {
      message("The cloud connection is not configured.", "error");
      return readyPromise;
    }

    client = window.supabase.createClient(config.supabaseUrl, config.supabasePublishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });

    document.querySelector("#auth-form").addEventListener("submit", submitAuth);
    document.querySelector("#show-login").addEventListener("click", () => showMode("login"));
    document.querySelector("#show-register").addEventListener("click", () => showMode("register"));
    document.querySelector("#forgot-password").addEventListener("click", requestPasswordReset);
    document.querySelector("#sign-out-button").addEventListener("click", async () => {
      await client.auth.signOut();
      window.location.reload();
    });

    client.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        const nextPassword = window.prompt("Enter a new password with at least 8 characters:");
        if (nextPassword && nextPassword.length >= 8) {
          client.auth.updateUser({ password: nextPassword }).then(({ error }) => {
            message(error ? error.message : "Password updated. You can continue.", error ? "error" : "success");
          });
        }
      }
      if (session?.user) finishAuthentication(session);
    });

    const { data } = await client.auth.getSession();
    if (data.session) await finishAuthentication(data.session);
    else setBusy(false);
    return readyPromise;
  }

  function save(journal, onStatus) {
    if (!client || !currentUser) return;
    clearTimeout(cloudSaveTimer);
    onStatus?.("Saving to cloud…");
    cloudSaveTimer = setTimeout(async () => {
      const { error } = await client.from(TABLE).upsert({
        user_id: currentUser.id,
        journal_data: journal
      }, { onConflict: "user_id" });
      onStatus?.(error ? "Cloud save failed" : "Saved to cloud");
      if (error) console.error("Cloud save failed", error);
    }, 500);
  }

  window.GrowthCloud = { start, save };
})();
