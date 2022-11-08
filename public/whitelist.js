import { allExtensionInfo } from "../src/utils/functions.js"


const handleClick = () => {
    // extensionbutton.onclick set extension id in alwaysOn
    // alwaysOn: [{name: "U-Block Origin", id: ksjbsbuisbsiuvsuibsivubsvnsnskdskjvnsdnk}] set using chrome storage
}


(async () => {
    const extensionList = await chrome.management.getAll()
    const {enabledExts, disabledExts} = allExtensionInfo(extensionList)
    
    console.log(enabledExts)
})() 


