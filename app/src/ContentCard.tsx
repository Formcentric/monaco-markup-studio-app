import {Box, Heading, Text} from "@chakra-ui/react";
import React, {useEffect, useState} from 'react'

import {getSession} from "./cm-utils";
import Content from '@coremedia/studio-client.cap-rest-client/content/Content'
import PropertyChangeEvent from "@coremedia/studio-client.client-core/data/PropertyChangeEvent";

type ContentCardProps = {
  id: string;
  active?: boolean;
  onClick?: Function;
};

export const ContentCard = ({id, active, onClick}: ContentCardProps) => {

  const [content, setContent] = useState<Content>();
  const [checkedOut, setCheckedOut] = useState<boolean>(false);

  const bgColor = active ? '#268ab2' : '#FFF';
  const textColor = active ? '#FFF' : '#000';

  useEffect(() => {

    const onCheckedOutChange = (event: PropertyChangeEvent) => setCheckedOut(event.newValue);

    const loadContent = async () => {
      const capSession = await getSession();
      const contentRepository = capSession.getConnection().getContentRepository();

      const content = contentRepository.getContent(id);

      content.addPropertyChangeListener('checkedOut', onCheckedOutChange);
      content.load().then(setContent)

      return () => content.removePropertyChangeListener('checkedOut', onCheckedOutChange)
    }
    loadContent();
  }, [id]);

  const clickHandler = () => onClick ? onClick(id) : null;

  return (
          <Box p={5} shadow='md' borderWidth='1px' onClick={clickHandler} bg={bgColor} textColor={textColor} cursor='pointer'>
            <Heading fontSize='xl'>{content?.getName()}{checkedOut && '*'}</Heading>
            <Text mt={2}>{content?.getType().getName()}</Text>
            <Text mt={0}>{id}</Text>
          </Box>
  )
}
