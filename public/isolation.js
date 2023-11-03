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
  const formattedStrExt = getExtensionNames(firstHalf).join(", ")
  if (firstHalf.length === 1) {
    // return confirm(`Is this extension causing you issues? Test it and come back.\n${formattedStrExt}`,)
    dialogMessage.textContent = `Is this extension causing you issues? Test it and come back.\n${formattedStrExt}`;
  }
  else {
    dialogMessage.textContent = `Are one of these extensions still causing you issues?\nTest it and come back.\n${formattedStrExt}`;
  }

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

  // return confirm(`Are one of these extensions still causing you issues?\nTest it and come back.\n${formattedStrExt}`)
}

function getExtensionNames(extList) {
  return extList.map(ext => ext.shortName)
}

const isolationBtn = document.getElementById("isolationBtn")
const customDialog = document.getElementById("custom-dialog");
const dialogBox = document.getElementById("dialog-box");
const dialogMessage = document.getElementById("dialog-message");
const confirmYes = document.getElementById("confirm-yes");
const confirmNo = document.getElementById("confirm-no");

let isRunning = false;

// Get all extensions excluding itself.
const extensions = (await chrome.management.getAll()).filter(ext => ext.id !== chrome.runtime.id)
// Get currently enabled and disabled extensions revert to original state (excluding itself).
const {enabledExts, disabledExts} = allExtensionInfo(extensions)
// Set extensions state to local storage in the case the window is closed
await chrome.storage.local.set({lastEnabledExts: enabledExts, lastDisabledExts: disabledExts})

isolationBtn.addEventListener("click", async () => {
    console.log("Clicked.")
    if (isRunning) {
      // Set extensions back to original state.
      isRunning = !isRunning
      return
    }
    dialogBox.style.display = "block"

    isRunning = !isRunning
    console.log("Starting isolation Mode.")
    const result = await isolationMode(extensions)
    console.log("COMPLETED ISOLATION MODE!!!")
    console.log("Found problematic extension", result.shortName)
    customDialog.style.display = "block";
    confirmYes.style.display = "none"
    confirmNo.style.display = "none"
    dialogMessage.textContent = `The extension possibly causing issues is: ${result.shortName}`
    enableExtensions(enabledExts)
    disableExtensions(disabledExts)
})