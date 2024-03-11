import {Box, Heading, Text} from "@chakra-ui/react";
import React from 'react'

export const EmptyWorkAreaCard = () => {

  const bgColor = '#33268ab2';
  const textColor = '#FFF';

  const clickHandler = () => console.log('TODO: Open Main Studio');

  return (
          <Box p={5} shadow='md' borderWidth='1px' onClick={clickHandler} bg={bgColor} textColor={textColor} cursor='pointer'>
            <Heading fontSize='xl' fontStyle='italic'>Empty Workarea</Heading>
            <Text mt={2} fontStyle='italic'>Open a document in the Studio to get started.</Text>
          </Box>
  )
}
