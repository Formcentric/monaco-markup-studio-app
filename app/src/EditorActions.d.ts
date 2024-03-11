import { editor } from "monaco-editor";
import IActionDescriptor = editor.IActionDescriptor;
export declare enum ContentAction {
    Revert = "revert",
    Checkin = "checkIn",
    Checkout = "checkOut"
}
type ActionCallback = (event: ContentAction) => void;
export declare function revertAction(fn: ActionCallback): IActionDescriptor;
export declare function checkInAction(fn: ActionCallback): IActionDescriptor;
export declare function checkOutAction(fn: ActionCallback): IActionDescriptor;
export {};
