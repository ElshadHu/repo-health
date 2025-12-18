"use client";

import { Button, Text, HStack, Avatar } from "@chakra-ui/react";
import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Button loading bg="#1f6feb" color="white" variant="solid">
        Loading...
      </Button>
    );
  }

  if (session) {
    return (
      <HStack>
        <Avatar.Root size="sm">
          <Avatar.Image src={session.user?.image || undefined} />
          <Avatar.Fallback>{session.user?.name?.[0] || "U"}</Avatar.Fallback>
        </Avatar.Root>
        <Text color="#c9d1d9" fontSize="sm">
          {session.user?.name}
        </Text>
        <Button
          onClick={() => signOut()}
          bg="#f85149"
          color="white"
          variant="solid"
          size="sm"
          _hover={{ bg: "#da3633" }}
        >
          Sign Out
        </Button>
      </HStack>
    );
  }

  return (
    <Button
      onClick={() => signIn("github")}
      bg="#1f6feb"
      color="white"
      variant="solid"
      size="md"
      _hover={{ bg: "#58a6ff" }}
    >
      Sign in with GitHub
    </Button>
  );
}
