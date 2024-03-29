import React, {useEffect, useRef, useState} from 'react'

import {ChakraProvider, Container, HStack, Select, useToast} from '@chakra-ui/react'
import {createWorkAreaServiceDescriptor} from "@coremedia/studio-client.form-services-api/WorkAreaServiceDescriptor";

import {ContentCard} from "./ContentCard";
import {DiffVersions} from "./DiffVersions";
import {EmptyWorkAreaCard} from "./EmptyWorkAreaCard";
import {Nav} from "./Nav";
import {NoMarkupView} from "./NoMarkupView";

import {DiffEditor} from '@monaco-editor/react';
import {editor} from "monaco-editor/esm/vs/editor/editor.api";
import {getSession, loadRemoteBean, useService} from "./cm-utils";
import ContentRepository from "@coremedia/studio-client.cap-rest-client/content/ContentRepository";
import Markup from "@coremedia/studio-client.client-core/data/Markup";
import Content from "@coremedia/studio-client.cap-rest-client/content/Content";
import {addEditorActions, ContentAction} from "./EditorActions";
import PropertyChangeEvent from "@coremedia/studio-client.client-core/data/PropertyChangeEvent";
import MarkupImpl from "@coremedia/studio-client.client-core-impl/data/impl/MarkupImpl";
import IDiffEditor = editor.IDiffEditor;
import IDiffEditorConstructionOptions = editor.IDiffEditorConstructionOptions;
import IStandaloneDiffEditor = editor.IStandaloneDiffEditor;
import RemoteError from "@coremedia/studio-client.client-core/data/error/RemoteError";

const EDITOR_OPTIONS: IDiffEditorConstructionOptions = { wordWrap: 'on', diffWordWrap: 'on', glyphMargin: true };

export function App() {

  const [openedContents, setOpenedContents] = useState<string[]>();
  const [activeContentId, setActiveContentId] = useState<string>(null);

  const [activeContent, setActiveContent] = useState<Content>(null);
  const [checkedOut, setCheckedOut] = useState<boolean>(false);
  const [originalVersionNumber, setOriginalVersionNumber] = useState<number>(0);

  const [action, setAction] = useState<ContentAction>(null);

  const [markupProperties, setMarkupProperties] = useState<string[]>([]);
  const [activeProperty, setActiveProperty] = useState<string>();

  const workAreaService = useService(createWorkAreaServiceDescriptor());

  const toast = useToast();

  useEffect(() => {

    // Listen to which contents are opened in the main Studio
    // For this purpose, use the workAreaService offered by the main Studio.
    if (workAreaService) {
      workAreaService.getActiveEntity().then(setActiveContentId);
      workAreaService.getOpenedEntities().then(setOpenedContents);

      const observeOpenedEntitiesObs = workAreaService.observe_openedEntities();
      const subscription = observeOpenedEntitiesObs.subscribe(setOpenedContents);

      return () => subscription.unsubscribe();
    } else {
      setOpenedContents(null);
    }
  }, [workAreaService])

  useEffect(() => {
    if (openedContents && !activeContentId) {
      setActiveContentId(openedContents[0]);
    }
    if (!openedContents || openedContents.length == 0) {
      setMarkupProperties([]);
      setActiveContentId(null);
      setActiveProperty(null);
    }
  }, [openedContents]);

  const editorRef = useRef<IDiffEditor>(null);
  function handleEditorDidMount(editor: IStandaloneDiffEditor, monaco) {
    console.log('editor did mount!')
    editorRef.current = editor;
    addEditorActions(editor, setAction);
  }

  useEffect(() => {
    if (action && activeContent) {
      const errorMsg = (e: RemoteError) => toast({ title: `Operation ${action} has failed.`, status: 'error',
        isClosable: true, description: e?.errorCode || ''});
      switch (action) {
        case ContentAction.Revert:
          activeContent.revert().catch(errorMsg);
          break;
        case ContentAction.Checkin:
          activeContent.checkIn().catch(errorMsg);
          break;
        case ContentAction.Checkout:
          activeContent.checkOut().catch(errorMsg);
          break;
        case ContentAction.Save:
          let markupValue = editorRef.current.getModifiedEditor().getModel().getValue();
          let markup = MarkupImpl.createLoadedMarkup(markupValue);

          const reloadContentAndFlush = (content: Content, markup: Markup) => {
            content.load().then(() => {
              content.getProperties().set(activeProperty, markup);
              content.flush().catch(errorMsg)
            });
          }
          (checkedOut ? Promise.resolve() : activeContent.checkOut())
                  .then(() => reloadContentAndFlush(activeContent, markup));
          break;
        default:
          console.error(`Unknown action '${action}'`);
      }
      setAction(null);
    }
  }, [action]);

  function isMarkup(markup: any): markup is Markup {
    return markup && markup.asXml;
  }

  function updateEditor(originalContent?: string, modifiedContent?: string) {
    originalContent !== null && editorRef?.current?.getOriginalEditor().setValue(originalContent);
    modifiedContent !== null && editorRef?.current?.getModifiedEditor().setValue(modifiedContent);
  }

  async function loadMarkupContent(content: Markup): Promise<string> {
    return await new Promise<string>(resolve => {
      content.loadData((markup) => resolve(markup.asXml()));
    });
  }

  async function loadContent(contentPath: string) {
    if (!contentPath) return;
    let s = await getSession();
    const contentRepository: ContentRepository = s.getConnection().getContentRepository()
    const content = contentRepository.getContent(contentPath)
    if (!content) return;

    const onCheckedOutChange = (event: PropertyChangeEvent) => setCheckedOut(event.newValue);
    content.addPropertyChangeListener('checkedOut', onCheckedOutChange);

    await loadRemoteBean(content)
    setActiveContent(content);

    const contentProperties = content.getProperties();
    const markupProperties: string[] = [];

    Object.entries(contentProperties.toObject()).map((value, index) => {
      if (isMarkup(value[1])) {
        markupProperties.push(value[0]);
      }
    });

    setMarkupProperties(markupProperties);
    if (markupProperties.length < 1) {
      setActiveProperty('');
      return;
    }

    const property = markupProperties.at(-1);
    setActiveProperty(property);
  }

  useEffect(() => {
    if (!activeContent || !activeProperty) {
      updateEditor('', '');
      return;
    }

    const contentProperties = activeContent.getProperties();
    let data: Markup = contentProperties.get(activeProperty);

    const updateFn = (originalMarkup?: Markup, modifiedMarkup?: Markup) => {
      const promises = [
        originalMarkup ? loadMarkupContent(originalMarkup) : Promise.resolve(null),
        modifiedMarkup ? loadMarkupContent(modifiedMarkup) : Promise.resolve(null),
      ];
      Promise.all(promises).then((markups) => updateEditor(markups[0], markups[1]));
    };

    contentProperties.addPropertyChangeListener(activeProperty, (event) => updateFn(null, event.newValue));

    (async () => {
      const versions = await activeContent.getVersionHistory().load().then(v => v.getItems());
      let original: Markup | null = null;
      if (versions.length > 1) {
        const idx = activeContent.isCheckedOut() ? -1 : -2;
        original = await versions.at(idx).load().then(v => {
          setOriginalVersionNumber(v.getVersionNumber());
          return v.getProperties().get(activeProperty);
        });
      } else {
        setOriginalVersionNumber(0);
      }
      updateFn(original || data, data);
    })();
  }, [activeContent, activeProperty, checkedOut]);

  useEffect(() => {
    loadContent(activeContentId);
    updateEditor('', '');
  }, [activeContentId]);

  const showEditor = !!(activeContent && activeProperty);

  return (
          <ChakraProvider>
            <Nav/>
            <Container maxWidth='100vw' p='16px' bgColor='#e9f3f7' shadow='sm'>
              <HStack spacing='16px'>
                {openedContents?.length > 0 ?
                  openedContents.map(c => <ContentCard id={c} key={c} active={activeContentId === c} onClick={setActiveContentId} /> )
                  : <EmptyWorkAreaCard />
                }
                </HStack>
              {markupProperties.length > 0 &&
                <Select
                        onChange={(e) => setActiveProperty(e.target.value)}
                        value={activeProperty} mt='16px' bgColor='#FFF'
                >
                  {markupProperties.map(m => <option key={m} value={m}>Markup Property: {m}</option>)}
                </Select>
              }
            </Container>
            <Container maxWidth='100vw' display={showEditor ? 'inherit' : 'none'}>
              <DiffVersions originalVersionNumber={originalVersionNumber} checkedOut={checkedOut} />
              <DiffEditor height="80vh" language="xml" keepCurrentOriginalModel={true}
                      onMount={handleEditorDidMount} options={EDITOR_OPTIONS} />
            </Container>
            {!showEditor && <NoMarkupView />}
          </ChakraProvider>
  );
}
