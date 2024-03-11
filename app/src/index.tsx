import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {loader} from '@monaco-editor/react';

import React from 'react'
import {createRoot} from 'react-dom/client';

import "@jangaroo/runtime/init";
import '@coremedia/studio-client.client-core-impl/init'
import '@coremedia/studio-client.cap-rest-client-impl/init'

import {App} from './App'
import studioApps from "@coremedia/studio-client.app-context-models/apps/studioApps";

loader.config({ monaco });

studioApps._.initAppServices();

const domNode = document.getElementById('monaco-markup-app');
const root = createRoot(domNode);
root.render(<App />);
