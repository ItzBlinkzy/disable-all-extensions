import {allExtensionInfo, updateIconState, enableExtensions, disableAllExtensions} from "./utils/functions.js"

const CTX_MENU_IDS = {
    whitelistID: "open-whitelist",
}

// Update the icon in case the update button is pressed from extensions page
updateIconState()

// Run everytime extension is started and listener prevents service-worker from being inactive on startup
chrome.runtime.onStartup.addListener(() => {
    updateIconState()
})


chrome.action.onClicked.addListener((tab) => {

    chrome.storage.local.get(["isDisablingOtherExts"], async ({isDisablingOtherExts}) => {
        // Get information on all the currently added extensions
        const extensionList = await chrome.management.getAll()
        // Divide them into enabled and disabled extensions.
        const {enabledExts, disabledExts} = allExtensionInfo(extensionList)
        // If this extension is currently disabling other extensions.
        if (isDisablingOtherExts) {

            // retrieve the last stored enabled extensions and re-enable them
            chrome.storage.local.get(["lastEnabledExts"], async ({lastEnabledExts}) => {
                enableExtensions(lastEnabledExts)

                // Save the state in the case extension is turned off.
                chrome.storage.local.set({isDisablingOtherExts: false}, () => {})
    
                // change icon to OFF state
                updateIconState()
            })
        }
    
    
        else {
    
            // Save the currently enabled extensions before disabling all extensions.
    
            chrome.storage.local.set({lastEnabledExts: enabledExts}, async () => {
                disableAllExtensions(extensionList) 

                // Save the state in the case extension is turned off.
                chrome.storage.local.set({isDisablingOtherExts: true}, () => {})
                
                // change icon to ON state
                updateIconState()
            })
        }
    })
})


// Create the context menu once the extension is installed.
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        title: "Open whitelist",
        contexts: ["all"], // change to only work on toolbar
        id: CTX_MENU_IDS.whitelistID,
    })   
})


// Handling contextMenu clicks
chrome.contextMenus.onClicked.addListener((data) => {
    const {menuItemId, pageUrl} = data
    
    if (menuItemId === CTX_MENU_IDS.whitelistID) {
        chrome.tabs.create({
            url: "../public/index.html"
        })
    }
})
