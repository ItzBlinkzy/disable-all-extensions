let appIsEnabled = false

/**
 * 
 * @param {Object[]} extensionsList 
 */
const disableAllExtensions = async (extensionList) => {

    for await (const ext of extensionList) {
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

const enableAllExtensions = async (extensionList) => {
    
    for await (const ext of extensionList) {
        // enable each extension
        await chrome.management.setEnabled(ext.id, true)
    }
}



/**
 * @param {Array}
 * @returns {Object<Object>} returns an object with enabledExtensions and disabledExtensions
 */
const allExtensionInfo = async (extensionList) => {
    const enabledExtensions = extensionList.filter(ext => ext.enabled === true)
    const disabledExtensions = extensionList.filter(ext => ext.enabled === false)

    return { enabledExtensions, disabledExtensions }
}


let lastEnabledExtensions = []

chrome.action.onClicked.addListener(async (tab) => {
    const extensionList = await chrome.management.getAll()
    const {enabledExtensions, disabledExtensions} = allExtensionInfo(extensionList) // use this to keep track and be able to re-enable same extensions
    // if the extension isnt currently running
    if (appIsEnabled) {
        enableAllExtensions(extensionList) 
        appIsEnabled = false
        await chrome.action.setIcon({path: {"16": "../public/enabled_icon_16.png"}})
    }
    else {
        disableAllExtensions(extensionList) 
        appIsEnabled = true
        await chrome.action.setIcon({path: {"16": "../public/icon_16.png"}})
    }
})