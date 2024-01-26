import { disableExtensions, enableExtensions, allExtensionInfo, updateIconState} from "./utils/functions.js";

// Type definitions.
/** 
 * @typedef {object} TExtension
 * @property {string} description
 * @property {boolean} enabled
 * @property {string} homepageUrl
 * @property {string[]} hostPermissions
 * @property {object[]} icons
 * @property {number} icons.size
 * @property {string} icons.url
 * @property {string} id
 * @property {string} installType
 * @property {boolean} isApp
 * @property {boolean} mayDisable
 * @property {string} name
 * @property {boolean} offlineEnabled
 * @property {string} optionsUrl
 * @property {string[]} permissions
 * @property {string} shortName
 * @property {string} type
 * @property {string} updateUrl
 * @property {string} version
 */


/**
   * 
   * @param {TExtension[]}
   * @param {number} step 
   * @returns {TExtension}
*/

async function isolationMode(extensionList, step=0) {
  console.log(`Isolation Mode running in step ${step}`)
  // Completed isolation mode
  if (extensionList.length == 1) {
    isRunning = !isRunning
    return extensionList[0];
  }

  const halfIndex = Math.floor(extensionList.length / 2);
  // Split the extensions into two halves.
  const half1 = extensionList.slice(0, halfIndex);
  const half2 = extensionList.slice(halfIndex);
  
  // Retreiving the bigger and smaller sizes for less steps to occur during isolation.
  const [biggerHalf, smallerHalf] = [half1, half2].sort((a, b) => b.length - a.length)
  console.log("---------------- All Extensions in this step. ---------------")
  console.log(getExtensionNames(extensionList))
  console.log("----------------- BIGGER HALF -------------------")
  console.log(getExtensionNames(biggerHalf))
  console.log("----------------- SMALLER HALF -------------------")
  console.log(getExtensionNames(smallerHalf))
  
  
  // Isolate and enable only the biggerHalf of the extension list.
  enableExtensions(biggerHalf)
  disableExtensions(smallerHalf)
  const response = await getUserFeedback(biggerHalf)
  // Disable the previously enabled extensions to prepare for the next step.
  disableExtensions(biggerHalf)
  // if response is true problematic extension is in biggerHalf
  if (response) {
    return isolationMode(biggerHalf, step+1)
  }
  else {
    return isolationMode(smallerHalf, step+1)
  }
}


/**
 * Returns boolean based on whether one of the extensions in are problematic for the user
 * @param {TExtension[]} firstHalf
 * @returns {boolean}
*/

async function getUserFeedback(firstHalf) {
  if (firstHalf.length === 1) {
    dialogMessage.textContent = `This extension has been enabled.\n Are you still having issues?`;
  } else {
    dialogMessage.textContent = `These extensions have been enabled.\nAre you still having issues?`;
  }

  // Create a container div to hold the extension information
  const extensionContainer = document.createElement('div');
  extensionContainer.classList.add('extension-container');

  // Add individual divs for each extension with name and icon
  firstHalf.forEach(extension => {
    const extensionDiv = document.createElement('div');

    // Create an img tag for the extension icon
    extensionDiv.style.display = "flex"
    extensionDiv.style.gap = "0.2em"
    const iconImg = document.createElement('img');
    iconImg.src = extension.icons[0].url;
    iconImg.alt = 'Extension Icon';

    iconImg.style.width = "25px";
    iconImg.style.height = "25px"


    // Create a div to display the extension name
    const nameDiv = document.createElement('div');
    nameDiv.textContent = extension.name;

    // Append the img and name divs to the extensionDiv
    extensionDiv.appendChild(iconImg);
    extensionDiv.appendChild(nameDiv);

    // Append the extensionDiv to the extensionContainer
    extensionContainer.appendChild(extensionDiv);
  });

  // Append the extensionContainer to the dialogMessage
  dialogMessage.appendChild(extensionContainer);

  return new Promise((resolve) => {
    customDialog.style.display = "block";

    confirmYes.addEventListener("click", () => {
      customDialog.style.display = "none";
      resolve(true);
    });

    confirmNo.addEventListener("click", () => {
      customDialog.style.display = "none";
      resolve(false);
    });
  });
}



function getExtensionNames(extList) {
  return extList.map(ext => ext.name)
}

const isolationBtn = document.getElementById("isolation-btn")
const customDialog = document.getElementById("custom-dialog");
const dialogBox = document.getElementById("dialog-box");
const dialogMessage = document.getElementById("dialog-message");
const confirmButtons = document.getElementById("confirm-buttons")
const confirmYes = document.getElementById("confirm-yes")
const confirmNo = document.getElementById("confirm-no")
let isRunning = false;

// Get all extensions excluding itself.
const extensions = (await chrome.management.getAll()).filter(ext => ext.id !== chrome.runtime.id)
// Get currently enabled and disabled extensions revert to original state (excluding itself).
const {enabledExts, disabledExts} = allExtensionInfo(extensions)
// Set extensions state to local storage in the case the window is closed
await chrome.storage.local.set({lastEnabledExts: enabledExts, lastDisabledExts: disabledExts})

isolationBtn.addEventListener("click", async () => {
    console.log("Clicked.")
    confirmYes.textContent = "Yes"
    isolationBtn.style.disabled = true
    if (isRunning) {
      // Set extensions back to original state.
      isRunning = !isRunning
      return
    }
    confirmButtons.style.display = "flex"
    dialogBox.style.display = "block"
    confirmYes.style.display = "block"
    confirmNo.style.display = "block"

    isRunning = !isRunning
    console.log("Starting isolation Mode.")
    const result = await isolationMode(extensions)

    console.log("COMPLETED ISOLATION MODE!!!")
    console.log("Found problematic extension", result.name)

    customDialog.style.display = "block";
    confirmButtons.style.display = "flex"
    confirmYes.textContent = "Continue"
    confirmNo.style.display = "none"
    dialogMessage.textContent = `The extension possibly causing issues is: ${result.name}`
    
    enableExtensions(enabledExts)
    disableExtensions(disabledExts)
})