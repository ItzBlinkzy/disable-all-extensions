let appIsEnabled = false

/**
 * Disables all Extensions from a given Array
 * @param {Object[]} extensionsList 
 */
const disableAllExtensions = async (extensionList) => {

    for (const ext of extensionList) {
        // if extension isn't itself then disable the extension

        if (ext.id !== chrome.runtime.id) {
            // disable each extension
            await chrome.management.setEnabled(ext.id, false)
        }

    }
}

/**
 * @param {Object[]} extensionsList
 */

const enableExtensions = async (extensionList) => {
    
    for (const ext of extensionList) {
        // enable each extension
        await chrome.management.setEnabled(ext.id, true)
    }
}



/**
 * Get enabled and disable extensions from an array of extension objects.
 * @param {Array}
 * @returns {Object<Object>} returns an object with enabledExtensions and disabledExtensions
 */
const allExtensionInfo = (extensionList) => {
    const enabledExts = extensionList.filter(ext => ext.enabled === true)
    const disabledExts = extensionList.filter(ext => ext.enabled === false)

    return { enabledExts, disabledExts }
}


chrome.action.onClicked.addListener(async (tab) => {
    // Get information on all the currently added extensions
    const extensionList = await chrome.management.getAll()
    // Divide them into enabled and disabled extensions.
    const {enabledExts, disabledExts} = allExtensionInfo(extensionList)
    
    // if the extension isnt currently running
    if (appIsEnabled) {

        // retrieve the last stored enabled extensions and re-enable them

        await chrome.storage.sync.get(["lastEnabledExts"], async (exts) => {
            await enableExtensions(exts.lastEnabledExts)
            appIsEnabled = false

            // change icon to OFF state
            await chrome.action.setIcon({path: {"16": "../public/enabled_icon_16.png"}})
        })
    }


    else {

        // Save the currently enabled extensions before disabling all extensions.

        await chrome.storage.sync.set({lastEnabledExts: enabledExts}, async () => {
            await disableAllExtensions(extensionList) 
            appIsEnabled = true

            // change icon to ON state
            await chrome.action.setIcon({path: {"16": "../public/icon_16.png"}})
        })
    }
})