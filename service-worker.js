chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case "open-in-new-tab-when-possible": {
      const handle = (details) => {
        if (details.tabId !== tab.id) {
          return;
        }

        // TODO: なるべく現在のタブ状態を保ちたいが、リロードされてしまう
        chrome.tabs.update(tab.id, { url: tab.url });
        chrome.tabs.create({ url: details.url });

        cleanup();
      };
      const cleanup = () => {
        chrome.webNavigation.onBeforeNavigate.removeListener(handle);
        chrome.webNavigation.onHistoryStateUpdated.removeListener(handle);
        chrome.webNavigation.onReferenceFragmentUpdated.removeListener(handle);
      };

      chrome.webNavigation.onBeforeNavigate.addListener(handle);
      chrome.webNavigation.onHistoryStateUpdated.addListener(handle);
      chrome.webNavigation.onReferenceFragmentUpdated.addListener(handle);
      setTimeout(cleanup, 1000);

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const selection = getSelection();
          if (!selection) {
            throw new Error("No selection found");
          }

          const anchorElement =
            selection.anchorNode instanceof HTMLElement
              ? selection.anchorNode
              : selection.anchorNode?.parentElement;
          if (!anchorElement) {
            return;
          }

          anchorElement.click();
        },
      });
      break;
    }

    default: {
      throw new Error(`Unknown menu item: ${info.menuItemId}`);
    }
  }
});

chrome.contextMenus.create({
  id: "open-in-new-tab-when-possible",
  title: "Open in new tab when possible",
  contexts: ["selection"],
});
