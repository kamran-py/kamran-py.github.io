(function () {
  const root = document.documentElement;
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    root.dataset.theme = "dark";
  }

  document.querySelector(".theme-toggle")?.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    if (next === "dark") {
      root.dataset.theme = "dark";
      localStorage.setItem("theme", "dark");
    } else {
      delete root.dataset.theme;
      localStorage.setItem("theme", "light");
    }
  });

  document.querySelector(".feedback-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const status = form.querySelector(".feedback-status");
    const button = form.querySelector("button[type='submit']");
    const feedback = form.elements.feedback.value.trim();

    if (!feedback) {
      status.textContent = "Please write a note before sending.";
      return;
    }

    status.textContent = "Sending...";
    button.disabled = true;

    try {
      const response = await fetch("https://formsubmit.co/ajax/4957a65271f1d4accd246dab51ea8750", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          _subject: "Anonymous website feedback",
          _template: "box",
          _captcha: "false",
          feedback,
        }),
      });

      if (!response.ok) {
        throw new Error("Feedback request failed");
      }

      form.reset();
      status.textContent = "Sent. Thank you.";
    } catch {
      status.textContent = "Something went wrong. Please try again later.";
    } finally {
      button.disabled = false;
    }
  });

})();
