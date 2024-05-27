import {allExtensionInfo, updateIconState, enableExtensions, debounce, disableExtensions} from "../public/utils/functions.js"

const CTX_MENU_IDS = {
    whitelistID: "open-whitelist",
    isolationID: "isolation"
}
let isolationTabId;

// Update the icon in case the update button is pressed from extensions page
updateIconState()

// Run everytime a new chrome window is started and listener prevents service-worker from being inactive on startup
chrome.runtime.onStartup.addListener(() => {
    updateIconState()
})

const handleToggleExtensions = () => {
  chrome.storage.sync.get("alwaysOn", ({alwaysOn}) => {
    chrome.storage.sync.get(async ({isDisablingOtherExts, lastEnabledExts}) => {
        // In the case that this property is undefined, set to empty array.
        alwaysOn = alwaysOn || []
        // Get information on all the currently added extensions.	
        const extensionList = await chrome.management.getAll()	
        // Extensions that are not whitelisted.
        const notWhitelistedExts = extensionList.filter(e => !alwaysOn.includes(e.id))
        // Divide them into enabled and disabled extensions.	
        const {enabledExts, disabledExts} = allExtensionInfo(extensionList)	
        // If this extension is currently disabling other extensions.	
        if (isDisablingOtherExts) {	
                enableExtensions(lastEnabledExts)	
                // Save the state in the case extension is turned off.	
                chrome.storage.sync.set({isDisablingOtherExts: false}, () => {})	
        
                // change icon to OFF state	
                updateIconState()	
        }

    
        else {
    
            // Save the currently enabled extensions before disabling all extensions.
            chrome.storage.local.set({lastEnabledExts: enabledExts}, () => { 
                disableExtensions(notWhitelistedExts) 

                // Save the state in the case extension is turned off.
                chrome.storage.sync.set({isDisablingOtherExts: true})
                
                // change icon to ON state
                updateIconState()
            })
        }
    })
})
}
const debouncedClickHandler = debounce(handleToggleExtensions, 50)

chrome.action.onClicked.addListener(() => {
  debouncedClickHandler()
})


// Create the context menu once the extension is installed.
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        title: "Open whitelist",
        contexts: ["all"], // change to only work on toolbar
        id: CTX_MENU_IDS.whitelistID,
    })   

    chrome.contextMenus.create({
      title: "Isolation Mode",
      contexts: ["all"],
      id: CTX_MENU_IDS.isolationID
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
    else if (menuItemId === CTX_MENU_IDS.isolationID) {
      chrome.tabs.create({
        url: "../public/isolation.html"
      }, (tab) => {
        isolationTabId = tab.id
      })
    }
})

chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  console.log({tabId, isolationTabId}, tabId === isolationTabId)
  // Tab closed was isolationMode tab
  if (tabId === isolationTabId) {
    const enabledExts = await chrome.storage.local.get("lastEnabledExts")
    const disabledExts = await chrome.storage.local.get("lastDisabledExts")
    console.log({enabledExts, disabledExts})
    // Return to previous extension state before isolation mode started.
    enableExtensions(enabledExts)
    disableExtensions(disabledExts)
  }
 })