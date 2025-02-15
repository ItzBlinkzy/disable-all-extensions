// Search for extensions by name.
const searchExtensions = (searchTerm) => {
  const extensionItems = document.querySelectorAll('.extension-item');
  searchTerm = searchTerm.toLowerCase();

  extensionItems.forEach(item => {
    const extensionName = item.querySelector('.extension-name').textContent.toLowerCase();
    if (extensionName.includes(searchTerm)) {
      item.style.display = '';
    } else {
      item.style.display = 'none';
    }
  });
};
// Listener for when any checkbox is clicked.
const handleClick = async (e) => {
    // e.preventDefault()
    const checkedVal = e.target.checked
    const extensionId = e.target.id


    chrome.storage.sync.get("alwaysOn", async ({alwaysOn}) => {
        alwaysOn = alwaysOn || []

        // Enable the extension if it's disabled.
        chrome.management.setEnabled(extensionId, true)

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

            // Disable the extension in the case it's currently on.
            chrome.management.setEnabled(extensionId, false)
        }
    })
}


(async () => {

    chrome.storage.sync.get("alwaysOn", async ({alwaysOn}) => {
        alwaysOn = alwaysOn || []
        const extensionList = await chrome.management.getAll()
        const extensionElement = document.getElementById("extension-list")
        extensionList.sort((a, b) => a.name.localeCompare(b.name))
        for (const ext of extensionList) {
            // Every extension but itself.
            if (ext.id !== chrome.runtime.id && ext.type === "extension") {
                // Create div element
                // Add input element to this div^ element

                const div = document.createElement("div")
                div.classList.add("extension-item")

                const contentDiv = document.createElement("div")
                contentDiv.classList.add("extension-content")

                const iconContainer = document.createElement("div")
                iconContainer.classList.add("extension-icon")
                const iconImg = document.createElement("img")
                iconImg.src = ext?.icons?.[0]?.url || "./images/chrome-32.png"
                iconImg.alt = `${ext.name} icon`
                iconContainer.appendChild(iconImg)

                const extNamePTag = document.createElement("p")
                extNamePTag.classList.add("extension-name")
                const textToAdd = document.createTextNode(ext.name)
                extNamePTag.appendChild(textToAdd)

                const infoContainer = document.createElement("div")
                infoContainer.classList.add("extension-info")
                infoContainer.appendChild(iconContainer)
                infoContainer.appendChild(extNamePTag)

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

                contentDiv.appendChild(infoContainer)
                contentDiv.appendChild(div2)
                div.appendChild(contentDiv)
                extensionElement.appendChild(div)
            }
        }
    })
})()
document.getElementById('extension-search').addEventListener('input', (e) => {
  searchExtensions(e.target.value);
});
