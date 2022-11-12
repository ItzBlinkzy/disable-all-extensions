
// Listener for when any checkbox is clicked.
const handleClick = async (e) => {
    // e.preventDefault()
    const checkedVal = e.target.checked
    const extensionId = e.target.id


    chrome.storage.sync.get(["alwaysOn"], async ({alwaysOn}) => {
        alwaysOn = alwaysOn || []
        
        // Save the extension id that was checked.
        if (checkedVal) {
            alwaysOn.push(extensionId)
            chrome.storage.sync.set({alwaysOn: alwaysOn})
        }


        else {
            // Find the extension id that was unchecked and remove it from storage.
            const extIndex = alwaysOn.findIndex(id => id === extensionId)

            alwaysOn.splice(extIndex, 1)
            chrome.storage.sync.set({alwaysOn: alwaysOn})
        }
    })
}


(async () => {

    chrome.storage.local.get(["alwaysOn"], async ({alwaysOn}) => {
        alwaysOn = alwaysOn || []
        const extensionList = await chrome.management.getAll()
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


                // If extension is in the alwaysOn array then pre-check the box
                if (alwaysOn.includes(ext.id)) {
                    inputEl.setAttribute("checked", "checked")
                }


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


