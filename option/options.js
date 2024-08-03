/*
MIT License

Copyright (c) 2024 Subham Mahesh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
document.addEventListener('DOMContentLoaded', async function() {
    const form = document.getElementById('optionsForm');
    const status = document.getElementById('status');
    const saveButton = document.getElementById('saveButton');
    const saveExitButton = document.getElementById('saveExitButton');
    const executeButton = document.getElementById('executeButton');
    const saveExecuteExitButton = document.getElementById('saveExecuteExit');
    const quickexecutionButton = document.getElementById('quickexecution');

    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = chrome.i18n.getMessage(el.getAttribute('data-i18n'));
    });

    
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
    async function quickexecution(actionType) {
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
                    }, -0);
                } else {
                    status.textContent = chrome.i18n.getMessage('tabClosureFailure');
                    console.error("Failed to initiate tab closure.");
                    reject(new Error("Failed to initiate tab closure"));
                }
            });
        });
    }

   
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
    quickexecutionButton.addEventListener('click', async function() {
        try {
            const currentSetting = await chrome.storage.local.get(['actionType']);
            const selectedActionType = document.querySelector('input[name="actionType"]:checked').value;
            await quickexecution(selectedActionType);
            await chrome.storage.local.set({ actionType: currentSetting.actionType });
            document.querySelector(`input[name="actionType"][value="${currentSetting.actionType}"]`).checked = true;
        } catch (none) {
            ;
        }
    });
});
