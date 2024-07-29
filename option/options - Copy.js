document.addEventListener('DOMContentLoaded', async function() {
    const form = document.getElementById('optionsForm');
    const status = document.getElementById('status');
    const saveButton = document.getElementById('saveButton');
    const saveExitButton = document.getElementById('saveExitButton');
    const executeButton = document.getElementById('executeButton');
    const saveExecuteExitButton = document.getElementById('saveExecuteExit');

    // Translate all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = chrome.i18n.getMessage(el.getAttribute('data-i18n'));
    });

    // Load saved options
    const items = await chrome.storage.local.get(['actionType']);
    document.querySelector(`input[name="actionType"][value="${items.actionType || 'newtab'}"]`).checked = true;

    async function saveOptions() {
        const actionType = document.querySelector('input[name="actionType"]:checked').value;
        await chrome.storage.local.set({ actionType: actionType });
        status.textContent = chrome.i18n.getMessage('settingsSaved');
        setTimeout(() => {
            status.textContent = '';
        }, 750);
    }

    async function closeOptionsPage() {
        const tabs = await chrome.tabs.query({});
        if (tabs.length === 1) {
            await chrome.tabs.create({ url: 'chrome://newtab' });
            await chrome.tabs.remove(tabs[0].id);
        } else {
            const currentTab = await chrome.tabs.getCurrent();
            await chrome.tabs.remove(currentTab.id);
        }
    }

    async function executeTabs(actionType) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                action: "closeTabs",
                actionType: actionType
            }, function(response) {
                if (response && response.status === "Closing tabs initiated") {
                    status.textContent = chrome.i18n.getMessage('executingTabClosure');
                    setTimeout(() => {
                        status.textContent = '';
                        resolve();
                    }, 750);
                } else {
                    status.textContent = chrome.i18n.getMessage('tabClosureFailure');
                    console.error("Failed to initiate tab closure.");
                    reject(new Error("Failed to initiate tab closure"));
                }
            });
        });
    }

    // Event listeners remain the same
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        await saveOptions();
    });

    saveButton.addEventListener('click', function(e) {
        e.preventDefault();
        form.dispatchEvent(new Event('submit'));
    });

    saveExitButton.addEventListener('click', async function(e) {
        e.preventDefault();
        await saveOptions();
        setTimeout(closeOptionsPage, 750);
    });

    executeButton.addEventListener('click', async function() {
        const actionType = document.querySelector('input[name="actionType"]:checked').value;
        await chrome.storage.local.set({ actionType: actionType });
        await executeTabs(actionType);
    });

    saveExecuteExitButton.addEventListener('click', async function() {
        try {
            await saveOptions();
            const actionType = document.querySelector('input[name="actionType"]:checked').value;
            await executeTabs(actionType);
            await closeOptionsPage();
        } catch (error) {
            console.error("Error during save, execute, and exit:", error);
        }
    });
});
