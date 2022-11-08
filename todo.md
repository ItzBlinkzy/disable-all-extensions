[ ] Add a whitelist for extensions that can be ignored when disable all button clicked (Always On feature) using popups.




```js
contextMenuBtn.onclicked....
const url = "chrome-extension://kelodmiboakdjlbcdfoceeiafckgojel/login.html";
window.open(url);



https://stackoverflow.com/questions/9576615/open-chrome-extension-in-a-new-tab
```

```js
manifest.json

    "action": {
        "default_icon": "./public/images/appOff_16.png",
        "default_title": "Whitelist extensions",
        "default_popup": "./public/popup.html"
    },
    ```

chrome.tabs.create new popup


// chrome.contextMenus.create({
//     title: "Whitelisting",
//     visible: true,
//     id: "whitelistBtn"
// })

// chrome.contextMenus.onClicked.addListener((data) => {
//     console.log(data)
// })