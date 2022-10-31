let isDisablingOtherExts = false

/**
 * Disables all Extensions from a given Array of objects.
 * @param {Object[]} extensionsList 
 */
const disableAllExtensions = (extensionList) => {

    for (const ext of extensionList) {
        // if extension isn't itself then disable the extension

        if (ext.id !== chrome.runtime.id) {
            // disable each extension
            chrome.management.setEnabled(ext.id, false)
        }

    }
}

/**
 * Enables extensions from a given Array of objects.
 * @param {Object[]} extensionsList
 */

const enableExtensions = (extensionList) => {
    
    for (const ext of extensionList) {
        // enable each extension
        chrome.management.setEnabled(ext.id, true)
    }
}



/**
 * Get enabled and disable extensions from an array of extension objects.
 * @param {Array}
 * @returns {Object} returns an object with enabledExtensions and disabledExtensions
 */
const allExtensionInfo = (extensionList) => {
    const enabledExts = extensionList.filter(ext => ext.enabled === true && ext.type === "extension")
    const disabledExts = extensionList.filter(ext => ext.enabled === false && ext.type === "extension")

    return { enabledExts, disabledExts }
}


chrome.action.onClicked.addListener(async (tab) => {
    // Get information on all the currently added extensions
    const extensionList = await chrome.management.getAll()
    // Divide them into enabled and disabled extensions.
    const {enabledExts, disabledExts} = allExtensionInfo(extensionList)
    // If this extension is currently disabling other extensions.
    if (isDisablingOtherExts) {

        // retrieve the last stored enabled extensions and re-enable them

        chrome.storage.local.get(["lastEnabledExts"], async (exts) => {
            enableExtensions(exts.lastEnabledExts)
            isDisablingOtherExts = false

            // change icon to OFF state
            await chrome.action.setIcon({path: {"16": "../public/enabled_icon_16.png"}})
        })
    }


    else {

        // Save the currently enabled extensions before disabling all extensions.

        chrome.storage.local.set({lastEnabledExts: enabledExts}, async () => {
            disableAllExtensions(extensionList) 
            isDisablingOtherExts = true

            // change icon to ON state
            await chrome.action.setIcon({path: {"16": "../public/icon_16.png"}})
        })
    }
})