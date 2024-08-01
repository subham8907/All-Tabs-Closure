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
const closeAllTabs = async function(action) {
    try {
        const tabs = await chrome.tabs.query({});
        
        switch(action) {
            case "newtab":
                const newTab = await chrome.tabs.create({ url: "chrome://newtab" });
                for (let tab of tabs) {
                    if (tab.id !== newTab.id && !tab.pinned) {
                        await chrome.tabs.remove(tab.id);
                    }
                }
                console.log('Closed all tabs except new tab and pinned tabs');
                break;
            
                case "close":
                    const tabIds = tabs.map(tab => tab.id);
                    if (tabIds.length > 0) {
                        console.log('Preparing to close tabs...');
                        await new Promise(resolve => setTimeout(resolve, 500)); // 2 second delay
                        await chrome.tabs.remove(tabIds);
                        console.log('All tabs closed successfully.');
                } else {
                    console.log('No tabs to close.');
                }
                break;
            
            case "closeAllAndNewTab":
                const createdTab = await chrome.tabs.create({ url: "chrome://newtab" });
                const tabIdsToClose = tabs.filter(tab => tab.id !== createdTab.id).map(tab => tab.id);
                await chrome.tabs.remove(tabIdsToClose);
                console.log('Closed all tabs and opened a new tab');
                break;
            
                case "closeAllExceptCurrentandpinned":
                    const activeTabs = await chrome.tabs.query({ active: true, currentWindow: true });
                    if (activeTabs.length > 0) {
                        const currentTab = activeTabs[0];
                        const tabIdsToRemove = tabs.filter(tab => tab.id !== currentTab.id && !tab.pinned).map(tab => tab.id);
                        await chrome.tabs.remove(tabIdsToRemove);
                        console.log('All tabs closed except current tab and pinned tabs');
                    } else {
                        console.log('No active tab found.');
                    }
                    break;
            
            case "closeAllExceptCurrent":
                const currentTabs = await chrome.tabs.query({ active: true, currentWindow: true });
                if (currentTabs.length > 0) {
                    const currentTab = currentTabs[0];
                    const tabIdsToClose = tabs.filter(tab => tab.id !== currentTab.id).map(tab => tab.id);
                    await chrome.tabs.remove(tabIdsToClose);
                    console.log('All tabs closed except current tab');
                } else {
                    console.log('No active tab found.');
                }
                break;
            
            case "closeAllOtherWindows":
                const currentWindow = await chrome.windows.getCurrent({ populate: true });
                const allWindows = await chrome.windows.getAll({ populate: true });
                for (let window of allWindows) {
                    if (window.id !== currentWindow.id) {
                        const tabIdsToClose = window.tabs.map(tab => tab.id);
                        await chrome.tabs.remove(tabIdsToClose);
                    }
                }
                console.log('Closed all tabs in other windows');
                break;
            
            case "exceptPinnedAndGrouped":
                const currentTabInfo = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
                if (currentTabInfo) {
                    const tabIdsToRemove = tabs.filter(tab => 
                        tab.id !== currentTabInfo.id && 
                        !tab.pinned && 
                        tab.groupId === chrome.tabs.TAB_ID_NONE
                    ).map(tab => tab.id);
                    await chrome.tabs.remove(tabIdsToRemove);
                    console.log('All tabs closed except current tab, pinned tabs, and grouped tabs');
                } else {
                    console.log('No active tab found.');
                }
                break;
                
                case "closeAndClearHistory":
                await  chrome.tabs.create({ url: "chrome://newtab" });
                const tabIdsToRemove = tabs.map(tab => tab.id);
                await chrome.tabs.remove(tabIdsToRemove);

                
                await chrome.browsingData.remove({
                    "since": 0
                }, {
                    "history": true,
                    "fileSystems": true,
                });
                console.log('Closed all tabs, opened a new tab, and cleared browsing data');
                break;

            default:
                console.log('Invalid action specified');
                break;
                case "currentwin":
                const currentTab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
                const tabsInCurrentWindow = await chrome.tabs.query({'currentWindow': true});
                for (let tab of tabsInCurrentWindow) {
                    if (tab.id !== currentTab.id && !tab.pinned && tab.groupId === chrome.tabs.TAB_ID_NONE) {
                        await chrome.tabs.remove(tab.id);
                    }
                }
                console.log('Closed all  tabs in current window with exceptions');
                break;
        }
    } catch (none) {
        ;
    }
};
chrome.commands.onCommand.addListener((command) => {
    if (command === "closeTabs") {
      chrome.storage.local.get(['actionType'], (items) => {
        const actionType = items.actionType || "newtab";
        closeAllTabs(actionType);
      });
    } else if (command === "openSettings") {
      chrome.tabs.create({ url: chrome.runtime.getURL("option/options.html") });
    }
  });
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "closeTabs") {
        chrome.storage.local.get(['actionType']).then(items => {
            const actionType = items.actionType || "newtab";
            closeAllTabs(actionType);
            sendResponse({ status: "Closing tabs initiated" });
        }).catch(error => {
            console.error('Error getting storage:', error);
            sendResponse({ status: "Error", error: error.message });
        });
        return true; // Indicates that the response is sent asynchronously
    }
});

console.log('Service worker script loaded');