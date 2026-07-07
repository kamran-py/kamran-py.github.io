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

  const post = document.querySelector("article.post");

  if (post) {
    const title = post.querySelector("h1")?.textContent.trim() || document.title.replace(/\s*\|.*$/, "");
    const likeKey = `liked:${window.location.pathname}`;
    let actions = post.querySelector(".post-actions");

    if (!actions) {
      actions = document.createElement("div");
      actions.className = "post-actions";
      actions.setAttribute("aria-label", "Writing actions");
      actions.innerHTML = `
        <button class="post-action-button like-button" type="button" aria-pressed="false">
          <span class="like-icon" aria-hidden="true">&#9825;</span>
          <span class="like-label">Like</span>
        </button>
        <button class="post-action-button share-button" type="button">
          <span aria-hidden="true">&#8599;</span>
          <span>Share</span>
        </button>
        <span class="share-status" aria-live="polite"></span>
      `;
      post.querySelector(".post-content")?.after(actions);
    }

    const likeButton = actions.querySelector(".like-button");
    const likeIcon = actions.querySelector(".like-icon");
    const likeLabel = actions.querySelector(".like-label");
    const shareButton = actions.querySelector(".share-button");
    const shareStatus = actions.querySelector(".share-status");

    const setLikeState = (liked) => {
      likeButton.setAttribute("aria-pressed", String(liked));
      likeIcon.innerHTML = liked ? "&#9829;" : "&#9825;";
      likeLabel.textContent = liked ? "Liked" : "Like";
    };

    setLikeState(localStorage.getItem(likeKey) === "true");

    likeButton?.addEventListener("click", () => {
      const nextLiked = likeButton.getAttribute("aria-pressed") !== "true";
      setLikeState(nextLiked);
      localStorage.setItem(likeKey, String(nextLiked));
    });

    shareButton?.addEventListener("click", async () => {
      const shareData = {
        title,
        text: title,
        url: window.location.href,
      };

      try {
        if (navigator.share) {
          await navigator.share(shareData);
          return;
        }

        await navigator.clipboard.writeText(window.location.href);
        shareStatus.textContent = "Link copied.";
        window.setTimeout(() => {
          shareStatus.textContent = "";
        }, 2400);
      } catch {
        shareStatus.textContent = "Copy failed.";
      }
    });
  }

})();
