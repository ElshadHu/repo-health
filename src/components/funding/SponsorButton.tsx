"use client";

import {
  Box,
  Text,
  HStack,
  Button,
  Menu,
  Portal,
  Link,
} from "@chakra-ui/react";
import { GoHeart, GoChevronDown } from "react-icons/go";
import type { FundingLink } from "@/server/types";

type Props = {
  links: FundingLink[];
};

// Platform-specific colors
const PLATFORM_COLORS: Record<string, string> = {
  github: "#db61a2",
  open_collective: "#7FADF2",
  ko_fi: "#FF5E5B",
  buy_me_a_coffee: "#FFDD00",
  patreon: "#FF424D",
  liberapay: "#F6C915",
  custom: "#8b949e",
};

export function SponsorButton({ links }: Props) {
  if (links.length === 0) return null;

  // Single sponsor - direct link
  if (links.length === 1) {
    const link = links[0];
    return (
      <Link
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        _hover={{ textDecoration: "none" }}
      >
        <Button
          size="sm"
          bg="#21262d"
          border="1px solid #30363d"
          color="#c9d1d9"
          _hover={{
            bg: "#30363d",
            borderColor: "#db61a2",
          }}
        >
          <HStack gap={2}>
            <GoHeart color="#db61a2" />
            <Text>{link.label}</Text>
          </HStack>
        </Button>
      </Link>
    );
  }

  // Multiple sponsors - dropdown
  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button
          size="sm"
          bg="#21262d"
          border="1px solid #30363d"
          color="#c9d1d9"
          _hover={{
            bg: "#30363d",
            borderColor: "#db61a2",
          }}
        >
          <HStack gap={2}>
            <GoHeart color="#db61a2" />
            <Text>Sponsor</Text>
            <GoChevronDown size={10} />
          </HStack>
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content
            bg="#161b22"
            border="1px solid #30363d"
            borderRadius="md"
            py={2}
            minW="200px"
          >
            {links.map((link, index) => (
              <Menu.Item key={index} value={link.platform}>
                <Link
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  _hover={{ textDecoration: "none" }}
                  w="100%"
                >
                  <HStack
                    px={2}
                    py={1}
                    gap={3}
                    color="#c9d1d9"
                    _hover={{ bg: "#21262d" }}
                    cursor="pointer"
                    w="100%"
                  >
                    <Box
                      w="8px"
                      h="8px"
                      borderRadius="full"
                      bg={PLATFORM_COLORS[link.platform] || "#8b949e"}
                    />
                    <Text fontSize="sm">{link.label}</Text>
                  </HStack>
                </Link>
              </Menu.Item>
            ))}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
