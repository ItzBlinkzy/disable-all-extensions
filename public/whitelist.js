
// Listener for when any checkbox is clicked.
const handleClick = async (e) => {
    // e.preventDefault()
    const checkedVal = e.target.checked
    const extensionId = e.target.id


    chrome.storage.sync.get("alwaysOn", async ({alwaysOn}) => {
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

    chrome.storage.sync.get("alwaysOn", async ({alwaysOn}) => {
        alwaysOn = alwaysOn || []
        const extensionList = await chrome.management.getAll()
        const extensionElement = document.getElementById("extension-list")


        for (const ext of extensionList) {
            // Every extension but itself.
            if (ext.id !== chrome.runtime.id && ext.type === "extension") {
                // Create div element
                // Add input element to this div^ element

                const div = document.createElement("div")
                div.classList.add("item")

                const div2 = document.createElement("div")
                div2.classList.add("toggle-pill-bw")

                const inputEl = document.createElement("input")
                inputEl.setAttribute("type", "checkbox")
                inputEl.setAttribute("id", ext.id)
                inputEl.setAttribute("name", "check")


                // If extension is in the alwaysOn array then pre-check the box
                if (alwaysOn.includes(ext.id)) {
                    inputEl.setAttribute("checked", "checked")
                }


                inputEl.onclick = handleClick

                const labelEl = document.createElement("label")
                labelEl.setAttribute("for", ext.id)
                
                div2.appendChild(inputEl)
                div2.appendChild(labelEl)

                const extNamePTag = document.createElement("p")
                const textToAdd = document.createTextNode(ext.name)
                extNamePTag.appendChild(textToAdd)

                div.appendChild(div2)
                div.appendChild(extNamePTag)
                extensionElement.appendChild(div)
            }
        }
    })
})() 


