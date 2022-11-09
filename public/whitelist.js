import { allExtensionInfo } from "../src/utils/functions.js"


const handleClick = (e) => {
    // e.preventDefault()
    const {checkedVal, id: extensionId} = e.target

    

    chrome.storage.local.get(["alwaysOn"], async ({alwaysOn}) => {
        if (checkedVal) {
            chrome.storage.local.set({alwaysOn: []})
        }
    })
    // extensionbutton.onclick set extension id in alwaysOn
    // alwaysOn: [{name: "U-Block Origin", id: ksjbsbuisbsiuvsuibsivubsvnsnskdskjvnsdnk}] set using chrome storage
}


(async () => {

    chrome.storage.local.get(["alwaysOn"], async () => {
        
        const extensionList = await chrome.management.getAll()
        const {enabledExts, disabledExts} = allExtensionInfo(extensionList)
    
        const extensionElement = document.getElementById("extension-list")


        for (const ext of extensionList) {
            // Every extension but itself.
            if (ext.id !== chrome.runtime.id && ext.type === "extension") {
                // Create div element
                // Add input element to this div^ element

                const div = document.createElement("div")
                const inputEl = document.createElement("input")
                inputEl.setAttribute("type", "checkbox")
                inputEl.setAttribute("id", ext.id)
                // inputEl.setAttribute("checked") - Make a check using chrome.local.storage to see if it is already part of whitelisted ext array of ids
                inputEl.onclick = handleClick

                const labelEl = document.createElement("label")
                labelEl.textContent = ext.name
                div.appendChild(inputEl)
                div.appendChild(labelEl)

                extensionElement.appendChild(div)
            }
        }
    })
})() 


