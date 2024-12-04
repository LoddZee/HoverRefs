document.addEventListener("DOMContentLoaded", () => {
  const activateHrefsButton = document.getElementById("activateHrefs");

  // Load the saved toggle state
  activateHrefsButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;

      // Inject content script first
      chrome.scripting.executeScript(
        {
          target: { tabId: tabId },
          files: ["content.js"],
        },
        () => {
          // Send message to toggle visibility
          chrome.tabs.sendMessage(tabId, { activate: true });
        }
      );
    });
  });
});
