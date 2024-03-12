import {Box, Heading, Text} from "@chakra-ui/react";
import React from 'react'
import {useService} from "./cm-utils";
import {createWorkAreaServiceDescriptor} from "@coremedia/studio-client.form-services-api/WorkAreaServiceDescriptor";

export const EmptyWorkAreaCard = () => {

  const bgColor = '#33268ab2';
  const textColor = '#FFF';

  const workAreaService = useService(createWorkAreaServiceDescriptor());
  const focusStudioHandler = () => {
    // Opening entities will focus the main studio
    workAreaService.openEntitiesInTabs([]);
  }

  return (
          <Box p={5} shadow='md' borderWidth='1px' onClick={focusStudioHandler} bg={bgColor} textColor={textColor} cursor='pointer'>
            <Heading fontSize='xl' fontStyle='italic'>Empty Workarea</Heading>
            <Text mt={2} fontStyle='italic'>Open a document in the Studio to get started.</Text>
          </Box>
  )
}
