import {Button, ButtonGroup, Divider, Flex, Heading, Image, Link, Spacer} from "@chakra-ui/react";
import {ExternalLinkIcon} from "@chakra-ui/icons";
import React from "react";

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
