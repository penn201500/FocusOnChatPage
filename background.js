function isValidUrlOrWildcard(input) {
  const urlRegex = /^(https?:\/\/)?([a-z0-9-]{1,}\.){1,}[a-z]{2,}(\/.*)?$/i;
  const domainWithWildcard = /^https?:\/\/[a-z0-9-]{1,}(\.[a-z0-9-]{1,})*\/\*$/i;
  return urlRegex.test(input) || domainWithWildcard.test(input);
}

function showErrorNotification() {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',
    title: 'Invalid target URL',
    message: 'Please configure the correct URL in the extension settings.'
  });
}

function getDomainWithoutWWW(url) {
  const domain = url.hostname;
  return domain.startsWith('www.') ? domain.slice(4) : domain;
}

chrome.action.onClicked.addListener(() => {
  chrome.storage.sync.get('targetUrl', (data) => {
    const targetUrl = data.targetUrl;
    console.log('Target URL:', targetUrl);

    if (!targetUrl || !isValidUrlOrWildcard(targetUrl)) {
      console.log('Invalid target URL');
      showErrorNotification();
      return;
    }

    const isWildcard = targetUrl.endsWith('/*');
    let target;
    try {
      target = new URL(targetUrl.replace('/*', ''));
    } catch (e) {
      console.log('Error parsing target URL:', e);
      showErrorNotification();
      return;
    }

    chrome.tabs.query({}, (tabs) => {
      let existingTab = null;

      for (const tab of tabs) {
        const tabUrl = new URL(tab.url);
        console.log('Inspecting tab:', tabUrl.href);
        console.log(`${getDomainWithoutWWW(tabUrl)}`)
        console.log(`${getDomainWithoutWWW(target)}`)
        console.log(`taburl.pathname is ${tabUrl.pathname}`)
        console.log(`target.pathname is ${target.pathname}`)

        if (isWildcard) {
          if (
            getDomainWithoutWWW(tabUrl) === getDomainWithoutWWW(target) &&
            tabUrl.pathname.startsWith(target.pathname)
          ) {
            console.log('Matching wildcard tab found:', tabUrl.href);
            existingTab = tab;
            break;
          }
        } else {
          if (tabUrl.href === target.href) {
            console.log('Matching exact tab found:', tabUrl.href);
            existingTab = tab;
            break;
          }
        }
      }

      if (existingTab) {
        console.log('Activating existing tab:', existingTab.url);
        // chrome.tabs.update(existingTab.id, { active: true });
        chrome.windows.update(existingTab.windowId, { focused: true }, () => {
        chrome.tabs.update(existingTab.id, { active: true });
    });
      } else {
        console.log('Creating new tab with URL:', targetUrl);
        if (isWildcard) {
          chrome.tabs.create({ url: targetUrl.replace('/*', '') });
        } else {
          chrome.tabs.create({ url: targetUrl });
        }
      }
    });
  });
});
