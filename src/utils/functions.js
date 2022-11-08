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
    // const enabledExts = extensionList.filter(ext => ext.enabled === true && ext.type === "extension")
    // const disabledExts = extensionList.filter(ext => ext.enabled === false && ext.type === "extension")
    const enabledExts = []
    const disabledExts = []

    for (const ext of extensionList) {

        if (ext.type === "extension") {
            const {description, enabled, id, icons, name} = ext

            if (enabled) {
                enabledExts.push({description, enabled, id, icons, name})
            }

            else {
                disabledExts.push({description, enabled, id, icons, name})
            }
        }
    }
    return { enabledExts, disabledExts }
}


/**
 * Updates to the relevant icons based on the applicationState
 */
const updateIconState = () => {

    chrome.storage.local.get(["isDisablingOtherExts"], async ({isDisablingOtherExts}) => {
        if (isDisablingOtherExts) {
            await chrome.action.setIcon({path: {"16": "../public/images/appOn_16.png"}})
        }
        else {
            await chrome.action.setIcon({path: {"16": "../public/images/appOff_16.png"}})
        }
    })
}


export {disableAllExtensions, enableExtensions, allExtensionInfo, updateIconState}