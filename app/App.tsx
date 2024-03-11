import React, {useEffect, useRef, useState} from 'react'

import {
  Box,
  Button,
  ButtonGroup,
  ChakraProvider,
  Container,
  Divider,
  Flex,
  Heading,
  HStack,
  Image,
  Link,
  Select,
  Spacer, Text, useToast
} from '@chakra-ui/react'
import {ExternalLinkIcon} from '@chakra-ui/icons';
import {createWorkAreaServiceDescriptor} from "@coremedia/studio-client.form-services-api/WorkAreaServiceDescriptor";
import {ContentCard} from "./ContentCard";

import {DiffEditor} from '@monaco-editor/react';
import {editor} from "monaco-editor/esm/vs/editor/editor.api";
import {useService, getSession, loadRemoteBean} from "./cm-utils";
import ContentRepository from "@coremedia/studio-client.cap-rest-client/content/ContentRepository";
import Markup from "@coremedia/studio-client.client-core/data/Markup";
import Content from "@coremedia/studio-client.cap-rest-client/content/Content";
import {checkInAction, checkOutAction, ContentAction, revertAction} from "./EditorActions";
import IDiffEditor = editor.IDiffEditor;
import IDiffEditorConstructionOptions = editor.IDiffEditorConstructionOptions;
import IStandaloneDiffEditor = editor.IStandaloneDiffEditor;
import PropertyChangeEvent from "@coremedia/studio-client.client-core/data/PropertyChangeEvent";

export function Nav() {
  return (
          <>
          <Flex minWidth='max-content' alignItems='center' px='4' py='2' gap='2'>
            <Image
              boxSize='48px'
              objectFit='cover'
              src='appIcons/monaco-markup-96.png'
              alt='Monaco Markup App Icon'
            />
            <Heading size='md'>Monaco Markup App</Heading>
            <Spacer/>
            <ButtonGroup gap='2' p='2'>
              <Link href='https://formcentric.com' isExternal>
                <Button colorScheme='gray' rightIcon={<ExternalLinkIcon />}>Formcentric</Button>
              </Link>
              <Link href='https://github.com' isExternal>
                <Button colorScheme='gray' rightIcon={<ExternalLinkIcon />}>Monaco Markup on GitHub</Button>
              </Link>
            </ButtonGroup>
          </Flex>
          <Divider />
          </>
  );
}

const EDITOR_OPTIONS: IDiffEditorConstructionOptions = { wordWrap: 'on', diffWordWrap: 'on', glyphMargin: true };

export function App() {

  const [openedContents, setOpenedContents] = useState<string[]>();
  const [activeContentId, setActiveContentId] = useState<string>(null);

  const [activeContent, setActiveContent] = useState<Content>(null);
  const [checkedOut, setCheckedOut] = useState<boolean>(false);
  const [originalVersionNumber, setOriginalVersionNumber] = useState<number>(0);

  const [action, setAction] = useState<ContentAction>(null);

  const [markupProperties, setMarkupProperties] = useState<string[]>();
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
  }, [openedContents]);

  const editorRef = useRef<IDiffEditor>(null);
  function handleEditorDidMount(editor: IStandaloneDiffEditor, monaco) {
    console.log('editor did mount!')
    editorRef.current = editor;

    editor.addAction(revertAction(setAction));
    editor.addAction(checkInAction(setAction));
    editor.addAction(checkOutAction(setAction));
  }

  useEffect(() => {
    const errorMsg = () => toast({ title: 'Operation has failed.', status: 'error'});
    if (action && activeContent) {
      switch (action) {
        case ContentAction.Revert:
          activeContent.revert().then(() => setAction(null)).catch(errorMsg);
          break;
        case ContentAction.Checkin:
          activeContent.checkIn().then(() => setAction(null)).catch(errorMsg);
          break;
        case ContentAction.Checkout:
          activeContent.checkOut().then(() => setAction(null)).catch(errorMsg);
          break;
        default:
          setAction(null);
      }
    }
  }, [action, activeContent]);

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
    let s = await getSession();
    const contentRepository: ContentRepository = s.getConnection().getContentRepository()
    const content = contentRepository.getContent(contentPath)
    if (!content) {
      return;
    }

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

  return (
          <ChakraProvider>
            <Nav/>
            <Container maxWidth='100vw' p='16px' bgColor='#e9f3f7' shadow='sm'>
              <HStack spacing='16px'>
                {openedContents?.map(c =>
                        <ContentCard id={c} key={c} active={activeContentId === c} onClick={setActiveContentId} /> )}
              </HStack>
              <Select
                      onChange={(e) => setActiveProperty(e.target.value)}
                      value={activeProperty} mt='16px' bgColor='#FFF'
                      hidden={markupProperties?.length == 0}
              >
                {markupProperties?.map(m => <option key={m} value={m}>Markup Property: {m}</option>)}
              </Select>
            </Container>
            <Box py='2' />
            <Text>Links: {originalVersionNumber}     ----------     Rechts: {originalVersionNumber + 1} {checkedOut && '*'}</Text>
            <DiffEditor height="80vh" language="xml" keepCurrentOriginalModel={true}
                    onMount={handleEditorDidMount} options={EDITOR_OPTIONS} />
          </ChakraProvider>
  );
}
