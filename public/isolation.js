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

let isRunning = false;

// Get all extensions excluding itself.
const extensions = (await chrome.management.getAll()).filter(ext => ext.id !== chrome.runtime.id)
// Get currently enabled and disabled extensions revert to original state (excluding itself).
const {enabledExts, disabledExts} = allExtensionInfo(extensions)
const isolationBtn = document.getElementById("isolationBtn")
  isolationBtn.addEventListener("click", async () => {
    console.log("Clicked.")
    if (isRunning) {
      // Set back to original state.
      isRunning = !isRunning
      return
    }
    isRunning = !isRunning
    console.log("Starting isolation Mode.")
    const result = isolationMode(extensions)
    console.log("Found problematic extension", result.shortName)
    // Prompt the user to either delete this extension, try isolation mode again or exit.
  })

  /**
   * 
   * @param {TExtension[]}
   * @param {number} step 
   * @returns {TExtension}
   */

function isolationMode(extensionList, step=0) {
  console.log(`Isolation Mode running in step ${step}`)
  if (extensionList.length == 1) {
    return extensionList[0]
  }
  const halfIndex = Math.floor(extensionList.length / 2);
  const firstHalf = extensionList.slice(0, halfIndex);
  const secondHalf = extensionList.slice(halfIndex);
  console.log("---------------- All Extensions in this step. ---------------")
  console.log(getExtensionNames(extensionList))
  console.log("----------------- FIRST HALF -------------------")
  console.log(getExtensionNames(firstHalf))
  console.log("----------------- SECOND HALF -------------------")
  console.log(getExtensionNames(secondHalf))

  // Isolate and enable the first half of extensions.
  // enableExtensions(firstHalf)
  const response = getUserFeedback(firstHalf)
  // if true problematic extension is in firstHalf
  if (response) {
    return isolationMode(firstHalf, step+1)
  }
  else {
    return isolationMode(secondHalf, step+1)
  }
}


/**
 * Returns boolean based on whether one of the extensions in are problematic for the user
 * @param {TExtension[]} firstHalf
 * @returns {boolean}
 */

function getUserFeedback(firstHalf) { // possibly take in firstHalf parameter. 
  const formattedStrExt = getExtensionNames(firstHalf).join(", ")
  if (firstHalf.length === 1) {
    return confirm(`Is this extension causing you issues? Test it and come back.\n${formattedStrExt}`,)
  }

  return confirm(`Are one of these extensions still causing you issues?\nTest it and come back.\n${formattedStrExt}`)
}

function handlePageUnload() {
  // User unloaded the page before completing isolation, revert back to original extension state
  if (isRunning) {
    // enableExtensions(enabledExts)
    // disableExtensions(disabledExts)
  }
}

function getExtensionNames(extList) {
  return extList.map(ext => ext.shortName)
}
// window.addEventListener("beforeunload", handlePageUnload);