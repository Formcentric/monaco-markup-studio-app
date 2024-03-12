import { editor } from "monaco-editor";
import IActionDescriptor = editor.IActionDescriptor;
import IStandaloneDiffEditor = editor.IStandaloneDiffEditor;
export declare enum ContentAction {
    Revert = "revert",
    Checkin = "checkIn",
    Checkout = "checkOut",
    Save = "save"
}
type ActionCallback = (event: ContentAction) => void;
export declare function addEditorActions(editor: IStandaloneDiffEditor, fn: ActionCallback): void;
export declare function revertAction(fn: ActionCallback): IActionDescriptor;
export declare function checkInAction(fn: ActionCallback): IActionDescriptor;
export declare function checkOutAction(fn: ActionCallback): IActionDescriptor;
export declare function saveAction(fn: ActionCallback): IActionDescriptor;
export {};
