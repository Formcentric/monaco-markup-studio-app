import {editor, KeyCode, KeyMod} from "monaco-editor";
import IActionDescriptor = editor.IActionDescriptor;
import IStandaloneDiffEditor = editor.IStandaloneDiffEditor;

export enum ContentAction {
  Revert = 'revert',
  Checkin = 'checkIn',
  Checkout = 'checkOut',
  Save = 'save',
}

type ActionCallback = (event: ContentAction) => void;

export function addEditorActions(editor: IStandaloneDiffEditor, fn: ActionCallback) {
  editor.addAction(revertAction(fn));
  editor.addAction(checkInAction(fn));
  editor.addAction(checkOutAction(fn));
  editor.addAction(saveAction(fn));
}

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

export function saveAction(fn: ActionCallback): IActionDescriptor {
  return {
    id: "save-changes",
    label: "Save changes",
    contextMenuOrder: 5,
    contextMenuGroupId: "1_modification",
    keybindings: [
      KeyMod.CtrlCmd | KeyCode.KeyS,
    ],
    run: () => fn(ContentAction.Save),
  }
}
