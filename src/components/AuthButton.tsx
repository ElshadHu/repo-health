"use client";

import { Box, Button, Text, HStack, Avatar } from "@chakra-ui/react";
import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Button loading colorPalette="purple" variant="ghost">
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
        <Text color="white" fontSize="sm">
          {session.user?.name}
        </Text>
        <Button
          onClick={() => signOut()}
          colorPalette="red"
          variant="outline"
          size="sm"
        >
          Sign Out
        </Button>
      </HStack>
    );
  }

  return (
    <Button
      onClick={() => signIn("github")}
      colorPalette="purple"
      variant="solid"
      size="md"
    >
      Sign in with GitHub
    </Button>
  );
}
