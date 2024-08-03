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



document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        element.textContent = chrome.i18n.getMessage(element.getAttribute('data-i18n'));
    });

    var closeButton = document.getElementById('closeAllTabs');
    closeButton.addEventListener('click', function() {
        chrome.runtime.sendMessage({ action: "closeTabs" }, function(response) {
            if (response && response.status === "Closing tabs initiated") {
                window.close();
            } else {
                console.error(chrome.i18n.getMessage("tabClosureFailure"));
            }
        });
    });
    var settingsButton = document.getElementById('settings-button');
    settingsButton.addEventListener('click', function() {
        chrome.runtime.openOptionsPage();
    });
});