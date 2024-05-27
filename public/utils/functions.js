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
 * Disables all Extensions from a given Array of objects.
 * @param {Object[]} extensionsList 
 */
const disableExtensions = (extensionList) => {
  if (!extensionList?.length) {
    return
  }

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
  if (!extensionList?.length) {
    return
  }

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
  const enabledExts = []
  const disabledExts = []

  for (const ext of extensionList) {

      if (ext.type === "extension") {
          const {description, enabled, id, icons, name} = ext

          if (enabled) {
              enabledExts.push({description, enabled, id, icons, name})
          }

          else {
              disabledExts.push({description, enabled, id, icons, name})
          }
      }
  }
  return { enabledExts, disabledExts }
}


/**
* Updates to the relevant icons based on the applicationState
*/
const updateIconState = () => {

  chrome.storage.sync.get(["isDisablingOtherExts"], async ({isDisablingOtherExts}) => {
      if (isDisablingOtherExts) {
          await chrome.action.setIcon({path: {"16": "../public/images/appOn_16.png"}})
      }
      else {
          await chrome.action.setIcon({path: {"16": "../public/images/appOff_16.png"}})
      }
  })
}

/**
 * 
 * Debounce a function with certain amount of MS
 */

function debounce(func, delay) {
  let timerId;

  return function () {
    const context = this;
    const args = arguments;

    clearTimeout(timerId);
    timerId = setTimeout(function () {
      func.apply(context, args);
    }, delay);
  };
}



export {disableExtensions, enableExtensions, allExtensionInfo, updateIconState, debounce}