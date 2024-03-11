import {Center, Flex, Heading, Image, Text} from "@chakra-ui/react";
import React from 'react'

export const NoMarkupView = () => {
  return (
          <Center w='100vw' h='70vh'>
            <Flex alignItems='center' gap='2' direction='column'>
              <Image
                      boxSize='96px'
                      objectFit='cover'
                      src='appIcons/monaco-markup.svg'
                      alt='Monaco Markup App Icon'
              />
              <Heading fontSize='xl'>No Markup available</Heading>
              <Text fontSize='l'>Please select content with markup properties.</Text>
            </Flex>
          </Center>
  )
}
