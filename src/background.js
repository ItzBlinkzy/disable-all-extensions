let appIsEnabled = false

/**
 * 
 * @param {Object[]} extensionsList 
 */
const disableAllExtensions = async (extensionList) => {

    for await (const ext of extensionList) {
        // if extension isn't itself then disable the extension

        if (ext.id !== chrome.runtime.id) {

            await chrome.management.setEnabled(ext.id, false)
            console.log(`${ext.name} has been disabled`)
        }

    }
}

/**
 * @param {Object[]} extensionsList
 */

const enableAllExtensions = async (extensionList) => {
    
    for await (const ext of extensionList) {
        await chrome.management.setEnabled(ext.id, true)
        console.log(`${ext.name} has been enabled`)
    }
}


/**
 * 
 * @returns {Object<Object>} returns an object with enabledExtensions and disabledExtensions
 */


/**
 * @param {Array}
 * @return {<Object>}
 */
const allExtensionInfo = async (extensionList) => {
    const enabledExtensions = extensionList.filter(ext => ext.enabled === true)
    const disabledExtensions = extensionList.filter(ext => ext.enabled === false)

    return { enabledExtensions, disabledExtensions }
}


console.log("Background running")
let lastEnabledExtensions = []

chrome.action.onClicked.addListener(async (tab) => {
    const extensionList = await chrome.management.getAll()
    const {enabledExtensions, disabledExtensions} = allExtensionInfo(extensionList) // use this to keep track and be able to re-enable same extensions
    console.log({appIsEnabled})

    // if the extension isnt currently running
    if (appIsEnabled) {
        enableAllExtensions(extensionList) 
        appIsEnabled = false
    }
    else {
        disableAllExtensions(extensionList) 
        appIsEnabled = true
    }
})