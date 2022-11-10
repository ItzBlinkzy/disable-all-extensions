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


/**
 * Updates to the relevant icons based on the applicationState
 */
const updateIconState = () => {

    chrome.storage.local.get(["isDisablingOtherExts"], async ({isDisablingOtherExts}) => {
        if (isDisablingOtherExts) {
            await chrome.action.setIcon({path: {"16": "../public/appOn_16.png"}})
        }
        else {
            await chrome.action.setIcon({path: {"16": "../public/appOff_16.png"}})
        }
    })
}


// Update the icon in case the update button is pressed from extensions page
updateIconState()

// Run everytime a new chrome window is started and listener prevents service-worker from being inactive on startup
chrome.runtime.onStartup.addListener(() => {
    updateIconState()
})


chrome.action.onClicked.addListener(() => {

    chrome.storage.local.get(async ({isDisablingOtherExts, lastEnabledExts}) => {
        // Get information on all the currently added extensions
        const extensionList = await chrome.management.getAll()
        // Divide them into enabled and disabled extensions.
        const {enabledExts, disabledExts} = allExtensionInfo(extensionList)
        // If this extension is currently disabling other extensions.
        if (isDisablingOtherExts) {
                enableExtensions(lastEnabledExts)

                // Save the state in the case extension is turned off.
                chrome.storage.local.set({isDisablingOtherExts: false}, () => {})
    
                // change icon to OFF state
                updateIconState()
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