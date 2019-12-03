// This file was generated by Mendix Modeler.
//
// WARNING: Only the following code will be retained when actions are regenerated:
// - the code between BEGIN USER CODE and END USER CODE
// Other code you write will be lost the next time you deploy the project.

import { Clipboard } from "react-native";

/**
 * @returns {string}
 */
export async function GetClipboardContent(): Promise<string> {
    // BEGIN USER CODE
    // Documentation https://facebook.github.io/react-native/docs/clipboard#getstring

    return Clipboard.getString();

    // END USER CODE
}
