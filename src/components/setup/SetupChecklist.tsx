"use client";
import { Box, VStack, Text, HStack } from "@chakra-ui/react";
import { FaCheckCircle, FaCheck } from "react-icons/fa";
import { useState } from "react";

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

interface SetupChecklistProps {
  steps: string[];
}

export function SetupChecklist({ steps }: SetupChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>(
    steps.map((step, idx) => ({
      id: `step-${idx}`,
      label: step,
      completed: false,
    }))
  );

  const handleToggle = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const completedCount = items.filter((item) => item.completed).length;
  const progress = Math.round((completedCount / items.length) * 100);

  return (
    <Box bg="#161b22" border="1px solid #30363d" borderRadius="lg" p={4}>
      <HStack justify="space-between" mb={3}>
        <HStack gap={2}>
          <FaCheckCircle color="#3fb950" size={14} />
          <Text color="#f0f6fc" fontWeight="600" fontSize="sm">
            Setup Checklist
          </Text>
        </HStack>
        <Text color="#8b949e" fontSize="xs">
          {completedCount}/{items.length}
        </Text>
      </HStack>

      {/* Progress Bar */}
      <Box h="4px" bg="#0d1117" borderRadius="full" overflow="hidden" mb={3}>
        <Box
          h="100%"
          bg="#3fb950"
          transition="width 0.3s"
          style={{ width: `${progress}%` }}
        />
      </Box>

      <VStack
        align="stretch"
        gap={1.5}
        maxH={items.length > 7 ? "320px" : "none"}
        overflowY={items.length > 7 ? "auto" : "visible"}
        pr={items.length > 7 ? 2 : 0}
      >
        {items.map((item) => (
          <HStack
            key={item.id}
            p={2}
            bg={item.completed ? "#3fb95011" : "transparent"}
            borderRadius="md"
            transition="all 0.2s"
            _hover={{ bg: item.completed ? "#3fb95011" : "#0d1117" }}
            cursor="pointer"
            onClick={() => handleToggle(item.id)}
          >
            <Box
              w="16px"
              h="16px"
              border="2px solid"
              borderColor={item.completed ? "#3fb950" : "#8b949e"}
              borderRadius="sm"
              bg={item.completed ? "#3fb950" : "transparent"}
              display="flex"
              alignItems="center"
              justifyContent="center"
              transition="all 0.2s"
              flexShrink={0}
            >
              {item.completed && <FaCheck size={8} color="white" />}
            </Box>
            <Text
              color={item.completed ? "#8b949e" : "#f0f6fc"}
              fontSize="sm"
              textDecoration={item.completed ? "line-through" : "none"}
              flex="1"
            >
              {item.label}
            </Text>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}
