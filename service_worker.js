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
                break;
            
            case "close":
                const tabIds = tabs.map(tab => tab.id);
                if (tabIds.length > 0) {
                    await chrome.tabs.remove(tabIds);
                }
                break;
            
            case "closeAllAndNewTab":
                const createdTab = await chrome.tabs.create({ url: "chrome://newtab" });
                const tabIdsToClose = tabs.filter(tab => tab.id !== createdTab.id).map(tab => tab.id);
                await chrome.tabs.remove(tabIdsToClose);
                break;
            
            case "closeAllExceptCurrentandpinned":
                const activeTabs = await chrome.tabs.query({ active: true, currentWindow: true });
                if (activeTabs.length > 0) {
                    const currentTab = activeTabs[0];
                    const tabIdsToRemove = tabs.filter(tab => tab.id !== currentTab.id && !tab.pinned).map(tab => tab.id);
                    await chrome.tabs.remove(tabIdsToRemove);
                }
                break;
            
            case "closeAllExceptCurrent":
                const currentTabs = await chrome.tabs.query({ active: true, currentWindow: true });
                if (currentTabs.length > 0) {
                    const currentTab = currentTabs[0];
                    const tabIdsToClose = tabs.filter(tab => tab.id !== currentTab.id).map(tab => tab.id);
                    await chrome.tabs.remove(tabIdsToClose);
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
                }
                break;
                
            case "closeAndClearHistory":
                await chrome.tabs.create({ url: "chrome://newtab" });
                const tabIdsToRemove = tabs.map(tab => tab.id);
                await chrome.tabs.remove(tabIdsToRemove);
                
                await chrome.browsingData.remove({
                    "since": 0
                }, {
                    "history": true,
                    "fileSystems": true,
                });
                break;

            default:
                break;
        }
    } catch (error) {
       
    }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "closeTabs") {
        chrome.storage.local.get(['actionType']).then(items => {
            const actionType = items.actionType || "newtab";
            closeAllTabs(actionType);
            sendResponse({ status: "Closing tabs initiated" });
        }).catch(error => {
            sendResponse({ status: "Error", error: error.message });
        });
        return true; 
    }
});
        return true; // Indicates that the response is sent asynchronously
    }
});

console.log('Service worker script loaded');
