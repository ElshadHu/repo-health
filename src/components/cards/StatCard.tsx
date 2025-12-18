import { Box, Text } from "@chakra-ui/react";

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <Box
      bg="#000000"
      border="1px solid #333333"
      p={6}
      borderRadius="lg"
      boxShadow="0 4px 6px rgba(0, 0, 0, 0.3)"
      transition="all 0.2s"
      _hover={{
        transform: "translateY(-2px)",
        borderColor: "#666666",
        boxShadow: "0 8px 12px rgba(0, 0, 0, 0.4)",
      }}
    >
      {/* Icon */}
      <Text fontSize="2xl" mb={3}>
        {icon}
      </Text>

      {/* Big number */}
      <Text
        fontSize="4xl"
        fontWeight="bold"
        color="#FFFFFF"
        mb={2}
        letterSpacing="tight"
      >
        {value}
      </Text>

      {/* Label */}
      <Text
        fontSize="xs"
        color="#999999"
        textTransform="uppercase"
        fontWeight="semibold"
        letterSpacing="wide"
      >
        {label}
      </Text>
    </Box>
  );
}
