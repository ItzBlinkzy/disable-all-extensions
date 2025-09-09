import {updateIconState, enableExtensions, debounce, disableExtensions, getExtensionStateById} from "../public/utils/functions.js"

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

chrome.storage.onChanged.addListener(async (changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    // Check to see if icon was clicked, to change the icon on any device.
    if (key === 'isDisablingOtherExts') {
      // app now disabling extensions
      if (newValue) {
        await chrome.action.setIcon({path: {"16": "../public/images/appOn_16.png"}})
      }
      else {
        await chrome.action.setIcon({path: {"16": "../public/images/appOff_16.png"}})
      }
    }
  }

  // Storage debugging for chrome synchronization.

  // chrome.storage.sync.get(null, (items) => {
  //   const jsonString = JSON.stringify(items);
  //   const jsonSize = new Blob([jsonString]).size;

  //   console.log('chrome.storage.sync data:', items);
  //   console.log('Size of JSON data:', jsonSize / 1000, 'KB');

  //   for (const [key, value] of Object.entries(items)) {
  //     const keyJsonString = JSON.stringify(value);
  //     const keyJsonSize = new Blob([keyJsonString]).size;

  //     console.log(`Size of JSON data for key "${key}":`, keyJsonSize / 1000, 'KB');
  //   }
  // });
});


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
        const {enabledExts, disabledExts} = getExtensionStateById(extensionList)
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
            chrome.storage.sync.set({lastEnabledExts: enabledExts}, () => {
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
        contexts: ["action"],
        id: CTX_MENU_IDS.whitelistID,
    })

    chrome.contextMenus.create({
      title: "Isolation Mode",
      contexts: ["action"],
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
    const enabledExts = await chrome.storage.sync.get("lastEnabledExts")
    const disabledExts = await chrome.storage.sync.get("lastDisabledExts")
    console.log({enabledExts, disabledExts})
    // Return to previous extension state before isolation mode started.
    enableExtensions(enabledExts)
    disableExtensions(disabledExts)
  }
 })
// UNINSTALL URL
chrome.runtime.setUninstallURL('https://forms.gle/67uQG24BVd9jPkbF6', () => {
  if (chrome?.runtime?.lastError) {
    console.error("Error setting uninstall URL", chrome?.runtime?.lastError)
  }
})

chrome.storage.sync.get("disableContextMenu", ({ disableContextMenu }) => {
  if (disableContextMenu) {
    chrome.contextMenus.removeAll();
  }
});

// Listen for changes to the disableContextMenu setting
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.disableContextMenu) {
    const { newValue } = changes.disableContextMenu;
    if (newValue) {
      // Remove all context menus
      chrome.contextMenus.removeAll();
    } else {
      // Recreate context menus
      chrome.contextMenus.create({
        title: "Open whitelist",
        contexts: ["all"],
        id: CTX_MENU_IDS.whitelistID,
      });

      chrome.contextMenus.create({
        title: "Isolation Mode",
        contexts: ["all"],
        id: CTX_MENU_IDS.isolationID,
      });
    }
  }
});
