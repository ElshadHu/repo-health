"use client";
import { Box, HStack, Text, Button, Code } from "@chakra-ui/react";
import { FaCopy, FaRocket } from "react-icons/fa";
import { useState } from "react";

interface QuickStartCommandProps {
  command: string;
}

export function QuickStartCommand({ command }: QuickStartCommandProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box bg="#161b22" border="1px solid #30363d" borderRadius="lg" p={4}>
      <HStack justify="space-between" mb={3}>
        <HStack gap={2}>
          <FaRocket color="#f0883e" size={14} />
          <Text color="#f0f6fc" fontWeight="600" fontSize="sm">
            Quick Start
          </Text>
        </HStack>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          colorPalette={copied ? "green" : "gray"}
        >
          {copied ? "Copied!" : <FaCopy />}
        </Button>
      </HStack>
      <Code
        fontFamily="mono"
        fontSize="13px"
        color="#79c0ff"
        bg="#0d1117"
        p={3}
        borderRadius="md"
        display="block"
        overflow="auto"
      >
        {command}
      </Code>
    </Box>
  );
}
