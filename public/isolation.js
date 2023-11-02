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
      // Set extensions back to original state.
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
  // Completed
  if (extensionList.length == 1) {
    isRunning = !isRunning
    return extensionList[0];
  }
  const halfIndex = Math.floor(extensionList.length / 2);
  // Split the extensions into two halves.
  const half1 = extensionList.slice(0, halfIndex);
  const half2 = extensionList.slice(halfIndex);

  const [biggerHalf, smallerHalf] = [half1, half2].sort((a, b) => b.length - a.length)
  console.log("---------------- All Extensions in this step. ---------------")
  console.log(getExtensionNames(extensionList))
  console.log("----------------- BIGGER HALF -------------------")
  console.log(getExtensionNames(biggerHalf))
  console.log("----------------- SMALLER HALF -------------------")
  console.log(getExtensionNames(smallerHalf))


  // Isolate and enable the biggerHalf of the extension list.
  // enableExtensions(biggerHalf)
  const response = getUserFeedback(biggerHalf)
  // if true problematic extension is in biggerHalf
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