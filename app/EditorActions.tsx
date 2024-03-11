import {editor, KeyCode, KeyMod} from "monaco-editor";
import IActionDescriptor = editor.IActionDescriptor;

export enum ContentAction {
  Revert = 'revert',
  Checkin = 'checkIn',
  Checkout = 'checkOut',
}

type ActionCallback = (event: ContentAction) => void;

export function revertAction(fn: ActionCallback): IActionDescriptor {
  return {
    id: "revert-changes",
    label: "Revert changes",
    contextMenuOrder: 2,
    contextMenuGroupId: "1_modification",
    keybindings: [
      KeyMod.CtrlCmd | KeyCode.Backspace,
    ],
    run: () => fn(ContentAction.Revert),
  }
}

export function checkInAction(fn: ActionCallback): IActionDescriptor {
  return {
    id: "checkin-changes",
    label: "Check-in content",
    contextMenuOrder: 3,
    contextMenuGroupId: "1_modification",
    run: () => fn(ContentAction.Checkin),
  }
}
export function checkOutAction(fn: ActionCallback): IActionDescriptor {
  return {
    id: "checkout-changes",
    label: "Check-out content",
    contextMenuOrder: 4,
    contextMenuGroupId: "1_modification",
    run: () => fn(ContentAction.Checkout),
  }
}
