import {Flex, Spacer, Tag} from "@chakra-ui/react";
import React from 'react'

type DiffVersionsProps = {
  originalVersionNumber: number;
  checkedOut: boolean;
};

export const DiffVersions = ({originalVersionNumber, checkedOut}: DiffVersionsProps) => {

  let versionLeft = 1;
  let versionRight = 1;

  if (originalVersionNumber > 0) {
    versionLeft = originalVersionNumber;
    versionRight = versionLeft + 1;
  }

  return (
          <Flex minWidth='max-content' alignItems='center' py='4' gap='2'>
            <Tag variant='outline' colorScheme='blue'>Version {versionLeft}</Tag>
            <Spacer/>
            <Tag variant='outline' colorScheme='blue'>Version {versionRight} {checkedOut && '*'}</Tag>
          </Flex>
  )
}
