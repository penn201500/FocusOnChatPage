document.addEventListener('DOMContentLoaded', () => {
  const targetUrlInput = document.getElementById('targetUrl');
  const saveButton = document.getElementById('save');

  // Load the saved target URL
  chrome.storage.sync.get('targetUrl', (data) => {
    targetUrlInput.value = data.targetUrl || '';
  });

  // Save the target URL when the save button is clicked
  saveButton.addEventListener('click', () => {
      chrome.storage.sync.set({ targetUrl: targetUrlInput.value }, () => {
        alert('Target URL saved.');
      });
});
});