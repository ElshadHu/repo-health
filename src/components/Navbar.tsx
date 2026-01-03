"use client";

import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  Box,
  Container,
  HStack,
  Text,
  Button,
  Menu,
  Image,
} from "@chakra-ui/react";
import {
  FaGithub,
  FaSignInAlt,
  FaSignOutAlt,
  FaChevronDown,
  FaHome,
  FaCodeBranch,
  FaBug,
  FaBox,
  FaChartLine,
  FaExclamationTriangle,
} from "react-icons/fa";
import Link from "next/link";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Extract owner/repo from URL if on an analysis page
  const pathParts = pathname.split("/").filter(Boolean);
  const isAnalysisPage =
    pathParts.length >= 3 &&
    [
      "prs",
      "issues",
      "dependencies",
      "activity",
      "overview",
      "pitfalls",
    ].includes(pathParts[0]);
  const owner = isAnalysisPage ? pathParts[1] : null;
  const repo = isAnalysisPage ? pathParts[2] : null;

  const analysisLinks = [
    { href: "prs", label: "Pull Requests", icon: FaCodeBranch },
    { href: "issues", label: "Issues", icon: FaBug },
    { href: "dependencies", label: "Dependencies", icon: FaBox },
    { href: "activity", label: "Activity", icon: FaChartLine },
    { href: "pitfalls", label: "Insights", icon: FaExclamationTriangle },
  ];

  return (
    <Box
      bg="#010409"
      borderBottom="1px solid #30363d"
      py={4}
      position="sticky"
      top={0}
      zIndex={1000}
    >
      <Container maxW="container.xl">
        <HStack
          justify="space-between"
          align="center"
          overflow="hidden"
          minWidth={0}
        >
          {/* Left: Logo + Home */}
          <HStack
            gap={{ base: 2, md: 6 }}
            minWidth={0}
            flex={1}
            overflow="hidden"
          >
            <Link href={owner && repo ? `/?owner=${owner}&repo=${repo}` : "/"}>
              <HStack
                gap={2}
                _hover={{ opacity: 0.8 }}
                transition="opacity 0.2s"
              >
                <Text fontSize="2xl" fontWeight="bold" color="#c9d1d9">
                  🩺
                </Text>
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  color="#c9d1d9"
                  display={{ base: "none", md: "block" }}
                >
                  Repo Health
                </Text>
              </HStack>
            </Link>

            <Link href={owner && repo ? `/?owner=${owner}&repo=${repo}` : "/"}>
              <HStack
                gap={1}
                color={pathname === "/" ? "#58a6ff" : "#8b949e"}
                _hover={{ color: "#c9d1d9" }}
                transition="color 0.2s"
              >
                <FaHome size={16} />
                <Text
                  fontSize="md"
                  fontWeight="medium"
                  display={{ base: "none", sm: "block" }}
                >
                  Home
                </Text>
              </HStack>
            </Link>

            {/* Repo Context Menu - only shows when analyzing a repo */}
            {owner && repo && (
              <Menu.Root positioning={{ placement: "bottom-start" }}>
                <Menu.Trigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    bg="transparent"
                    color="#58a6ff"
                    _hover={{ bg: "rgba(88, 166, 255, 0.1)" }}
                  >
                    <HStack
                      gap={1}
                      minWidth={0}
                      maxWidth={{ base: "120px", sm: "200px", md: "none" }}
                    >
                      <FaGithub size={16} style={{ flexShrink: 0 }} />
                      <Text
                        fontSize="md"
                        fontWeight="medium"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                        minWidth={0}
                      >
                        {owner}/{repo}
                      </Text>
                      <FaChevronDown size={12} style={{ flexShrink: 0 }} />
                    </HStack>
                  </Button>
                </Menu.Trigger>
                <Menu.Positioner>
                  <Menu.Content
                    bg="#161b22"
                    border="1px solid #30363d"
                    borderRadius="md"
                    py={2}
                    minW="200px"
                  >
                    {analysisLinks.map((link) => {
                      const isActive = pathname.startsWith(`/${link.href}`);
                      return (
                        <Link
                          key={link.href}
                          href={`/${link.href}/${owner}/${repo}`}
                        >
                          <Menu.Item
                            value={link.href}
                            bg={
                              isActive
                                ? "rgba(88, 166, 255, 0.1)"
                                : "transparent"
                            }
                            _hover={{ bg: "rgba(88, 166, 255, 0.15)" }}
                            color={isActive ? "#58a6ff" : "#c9d1d9"}
                            px={4}
                            py={2}
                          >
                            <HStack gap={3}>
                              <link.icon size={14} />
                              <Text fontSize="sm">{link.label}</Text>
                            </HStack>
                          </Menu.Item>
                        </Link>
                      );
                    })}
                  </Menu.Content>
                </Menu.Positioner>
              </Menu.Root>
            )}
          </HStack>

          {/* Right: User Menu */}
          <HStack gap={4}>
            {status === "loading" ? (
              // Loading state - same on server and client
              <Box
                w="100px"
                h="32px"
                bg="#21262d"
                borderRadius="md"
                opacity={0.5}
              />
            ) : session?.user ? (
              <Menu.Root positioning={{ placement: "bottom-end" }}>
                <Menu.Trigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    bg="transparent"
                    _hover={{ bg: "rgba(88, 166, 255, 0.1)" }}
                  >
                    <HStack gap={2} minWidth={0}>
                      {session.user.image && (
                        <Image
                          src={session.user.image}
                          alt="Avatar"
                          boxSize="32px"
                          borderRadius="full"
                          flexShrink={0}
                        />
                      )}
                      <Text
                        fontSize="md"
                        color="#c9d1d9"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                        maxWidth={{ base: "80px", sm: "150px", md: "none" }}
                        display={{ base: "none", sm: "block" }}
                      >
                        {session.user.name?.split(" ")[0]}
                      </Text>
                      <FaChevronDown
                        size={12}
                        color="#8b949e"
                        style={{ flexShrink: 0 }}
                      />
                    </HStack>
                  </Button>
                </Menu.Trigger>
                <Menu.Positioner>
                  <Menu.Content
                    bg="#161b22"
                    border="1px solid #30363d"
                    borderRadius="md"
                    py={2}
                    minW="180px"
                  >
                    <Menu.Item
                      value="signout"
                      onClick={() => signOut()}
                      _hover={{ bg: "rgba(248, 81, 73, 0.15)" }}
                      color="#f85149"
                      px={4}
                      py={2}
                    >
                      <HStack gap={3}>
                        <FaSignOutAlt size={14} />
                        <Text fontSize="sm">Sign Out</Text>
                      </HStack>
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Menu.Root>
            ) : (
              <Button
                className="sign-in-btn"
                size="sm"
                bg="#238636"
                color="white"
                _hover={{ bg: "#2ea043" }}
                onClick={() => signIn("github")}
              >
                <HStack gap={2}>
                  <FaSignInAlt size={14} />
                  <Text>Sign In</Text>
                </HStack>
              </Button>
            )}
          </HStack>
        </HStack>
      </Container>
    </Box>
  );
}
