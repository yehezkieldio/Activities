const presence = new Presence({
  clientId: '1431637804630151360',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/2k5FDbp.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const [
    showReading,
    showBrowsing,
  ] = await Promise.all([
    presence.getSetting<boolean>('showReading'),
    presence.getSetting<boolean>('showBrowsing'),
  ])

  const path = window.location.pathname;
  const search = window.location.search;

  // Homepage
  if (path === "/" || path === "/forums/") {
    presenceData.details = "Viewing Homepage";
  }

  // Reading a thread
  else if (path.includes("/threads/")) {
    if (showReading) {
      const threadTitle = document.querySelector("h1.p-title-value")?.textContent?.trim();

      const hash = window.location.hash;
      const isOnSpecificPost = hash && hash.startsWith("#post-");
      const postId = isOnSpecificPost ? hash.replace("#post-", "") : null;

      let details = "Reading a thread";
      let state = "";
      let threadmarkTitle = null;

      if (isOnSpecificPost && postId) {
        // Find the anchor element for the specific post.
        const targetPostAnchor = document.getElementById(`post-${postId}`);

        if (targetPostAnchor) {
          const postContainer = targetPostAnchor.closest('.message') || targetPostAnchor.parentElement;

          if (postContainer) {
            const threadmarkLabelEl = postContainer.querySelector(".threadmarkLabel");
            const threadmarkCategoryEl = postContainer.querySelector(".threadmarkCategory");

            const threadmarkLabel = threadmarkLabelEl?.textContent?.trim();
            const threadmarkCategory = threadmarkCategoryEl?.textContent?.trim();

            if (threadmarkLabel) {
              // Combine category and label if both exist.
              threadmarkTitle = threadmarkCategory
                ? `${threadmarkCategory}: ${threadmarkLabel}`
                : threadmarkLabel;
            }
          }
        }
      }

      if (threadTitle) {
        details = threadTitle.length > 50 ? threadTitle.substring(0, 47) + "..." : threadTitle;
      }

      if (threadmarkTitle) {
        state = threadmarkTitle.length > 50 ? threadmarkTitle.substring(0, 47) + "..." : threadmarkTitle;
      }

      presenceData.details = details;
      presenceData.state = state || undefined;
    } else {
      presenceData.details = "Reading a thread";
      presenceData.state = "On Questionable Questing";
    }
  }

  // Viewing a forum section
  else if (path.includes("/forums/") && !path.includes("/threads/")) {
    const forumName = document.querySelector("h1.p-title-value")?.textContent?.trim();
    const pageMatch = search.match(/page=(\d+)/);

    if (showBrowsing) {
      presenceData.details = forumName ? `Browsing ${forumName}` : "Browsing forums";
    } else {
      presenceData.details = "Browsing forums";
    }
  }

  // Default fallback
  else {
    if (showBrowsing) {
      presenceData.details = "On Questionable Questing";
      presenceData.state = "Browsing forums";
    } else {
      presenceData.details = "On Questionable Questing";
    }
  }

  // Set activity
  if (presenceData.details) {
    presence.setActivity(presenceData);
  } else {
    presence.setActivity();
  }
});