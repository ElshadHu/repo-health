"use client";

import { useState, useMemo } from "react";
import {
  Box,
  Table,
  Flex,
  Text,
  HStack,
  Button,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { FaBan, FaExternalLinkAlt } from "react-icons/fa";
import { CategoryBadge } from "./CategoryBadge";
import type { PitfallAnalysis } from "@/server/types";

type Props = {
  analyses: PitfallAnalysis[];
  owner: string;
  repo: string;
};

const CATEGORIES = ["tests", "style", "scope", "setup", "breaking", "docs"];
const PER_PAGE_OPTIONS = [5, 10, 15, 20];

export function PitfallsTable({ analyses, owner, repo }: Props) {
  // Filter state - multi-select using Set
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Filtered data (memoized)
  const filteredData = useMemo(() => {
    if (selectedCategories.size === 0) return analyses;
    return analyses.filter((item) => selectedCategories.has(item.category));
  }, [analyses, selectedCategories]);

  // Smart pagination options - show options up to the one that covers all items
  const smartPerPageOptions = useMemo(() => {
    const total = filteredData.length;
    const options: number[] = [];
    for (const opt of PER_PAGE_OPTIONS) {
      options.push(opt);
      if (opt >= total) break;
    }
    return options;
  }, [filteredData.length]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, perPage]);

  // Total pages
  const totalPages = Math.ceil(filteredData.length / perPage);

  // Toggle category selection (multi-select)
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
    setCurrentPage(1);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedCategories(new Set());
    setCurrentPage(1);
  };

  const handlePerPageChange = (value: number) => {
    setPerPage(value);
    setCurrentPage(1);
  };

  // Category counts for filter pills
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of analyses) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, [analyses]);

  // Native select style
  const perPageSelectStyle: React.CSSProperties = {
    background: "#21262d",
    border: "1px solid #30363d",
    borderRadius: "6px",
    color: "#c9d1d9",
    padding: "6px 10px",
    fontSize: "14px",
    cursor: "pointer",
    minWidth: "70px",
  };

  return (
    <Box
      bg="#161b22"
      border="1px solid #30363d"
      borderRadius="lg"
      p={{ base: 4, md: 6 }}
    >
      {/* Header */}
      <Flex
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap={4}
        mb={5}
      >
        <HStack gap={3}>
          <FaBan color="#f85149" size={18} />
          <Text fontSize="lg" fontWeight="bold" color="#c9d1d9">
            Rejected PRs
          </Text>
          <Box
            bg="#21262d"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="xs"
            color="#8b949e"
          >
            {filteredData.length} total
          </Box>
        </HStack>
      </Flex>

      {/* Category Filter Pills */}
      <HStack gap={2} flexWrap="wrap" mb={5}>
        <Button
          size="xs"
          variant={selectedCategories.size === 0 ? "solid" : "outline"}
          bg={selectedCategories.size === 0 ? "#58a6ff" : "#21262d"}
          color={selectedCategories.size === 0 ? "white" : "#8b949e"}
          borderColor="#30363d"
          onClick={handleClearFilters}
          _hover={{ bg: selectedCategories.size === 0 ? "#58a6ff" : "#30363d" }}
        >
          All
        </Button>
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategories.has(cat);
          const count = categoryCounts[cat] || 0;
          if (count === 0) return null;
          return (
            <Button
              key={cat}
              size="xs"
              variant={isActive ? "solid" : "outline"}
              bg={isActive ? "#58a6ff" : "#21262d"}
              color={isActive ? "white" : "#8b949e"}
              borderColor="#30363d"
              onClick={() => handleCategoryToggle(cat)}
              _hover={{ bg: isActive ? "#58a6ff" : "#30363d" }}
            >
              {cat} ({count})
            </Button>
          );
        })}
      </HStack>

      {/* Table - Desktop */}
      <Box display={{ base: "none", lg: "block" }} overflowX="auto">
        <Table.Root size="sm">
          <Table.Header>
            <Table.Row bg="#0d1117">
              <Table.ColumnHeader color="#8b949e" py={3}>
                PR
              </Table.ColumnHeader>
              <Table.ColumnHeader color="#8b949e" py={3}>
                Category
              </Table.ColumnHeader>
              <Table.ColumnHeader color="#8b949e" py={3}>
                Mistake
              </Table.ColumnHeader>
              <Table.ColumnHeader color="#8b949e" py={3}>
                Advice
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {paginatedData.map((item) => (
              <Table.Row
                key={item.prNumber}
                bg="#161b22"
                _hover={{ bg: "#1c2128", transform: "translateX(4px)" }}
                borderBottom="1px solid #21262d"
                transition="all 0.2s ease"
                cursor="pointer"
              >
                <Table.Cell py={4}>
                  <ChakraLink
                    href={`https://github.com/${owner}/${repo}/pull/${item.prNumber}`}
                    target="_blank"
                    color="#58a6ff"
                    fontWeight="500"
                    display="flex"
                    alignItems="center"
                    gap={2}
                    transition="color 0.2s ease"
                    _hover={{ color: "#79c0ff", textDecoration: "none" }}
                    _focus={{ outline: "none", boxShadow: "none" }}
                    _active={{ outline: "none", boxShadow: "none" }}
                  >
                    #{item.prNumber}
                    <FaExternalLinkAlt size={10} />
                  </ChakraLink>
                </Table.Cell>
                <Table.Cell py={4}>
                  <CategoryBadge category={item.category} />
                </Table.Cell>
                <Table.Cell py={4} maxW="300px">
                  <Text color="#c9d1d9" fontSize="sm" lineHeight="1.5">
                    {item.mistake}
                  </Text>
                </Table.Cell>
                <Table.Cell py={4} maxW="300px">
                  <Text color="#3fb950" fontSize="sm" lineHeight="1.5">
                    {item.advice}
                  </Text>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      {/* Mobile Cards */}
      <Box display={{ base: "block", lg: "none" }}>
        {paginatedData.map((item) => (
          <Box
            key={item.prNumber}
            bg="#0d1117"
            border="1px solid #21262d"
            borderRadius="md"
            p={4}
            mb={3}
          >
            <Flex justify="space-between" align="center" mb={3}>
              <ChakraLink
                href={`https://github.com/${owner}/${repo}/pull/${item.prNumber}`}
                target="_blank"
                color="#58a6ff"
                fontWeight="500"
                display="flex"
                alignItems="center"
                gap={2}
                transition="color 0.2s ease"
                _hover={{ color: "#79c0ff" }}
                _focus={{ outline: "none", boxShadow: "none" }}
              >
                #{item.prNumber}
                <FaExternalLinkAlt size={10} />
              </ChakraLink>
              <CategoryBadge category={item.category} />
            </Flex>
            <Box mb={3}>
              <Text color="#8b949e" fontSize="xs" mb={1}>
                Mistake
              </Text>
              <Text color="#c9d1d9" fontSize="sm">
                {item.mistake}
              </Text>
            </Box>
            <Box>
              <Text color="#8b949e" fontSize="xs" mb={1}>
                Advice
              </Text>
              <Text color="#3fb950" fontSize="sm">
                {item.advice}
              </Text>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Empty State */}
      {paginatedData.length === 0 && (
        <Box textAlign="center" py={8}>
          <Text color="#8b949e">No pitfalls found matching your criteria</Text>
        </Box>
      )}

      {/* Pagination */}
      {filteredData.length > 0 && (
        <Flex
          justify="space-between"
          align={{ base: "stretch", sm: "center" }}
          direction={{ base: "column", sm: "row" }}
          gap={4}
          mt={5}
          pt={5}
          borderTop="1px solid #21262d"
        >
          <Text color="#8b949e" fontSize="sm">
            Showing {(currentPage - 1) * perPage + 1}-
            {Math.min(currentPage * perPage, filteredData.length)} of{" "}
            {filteredData.length}
          </Text>

          <Flex gap={2} align="center" flexWrap="wrap">
            <Button
              size="sm"
              variant="outline"
              bg="#21262d"
              color="#c9d1d9"
              borderColor="#30363d"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              _hover={{ bg: "#30363d" }}
            >
              ← Prev
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(0, 5)
              .map((page) => (
                <Button
                  key={page}
                  size="sm"
                  variant={currentPage === page ? "solid" : "outline"}
                  bg={currentPage === page ? "#58a6ff" : "#21262d"}
                  color={currentPage === page ? "white" : "#c9d1d9"}
                  borderColor="#30363d"
                  onClick={() => setCurrentPage(page)}
                  _hover={{
                    bg: currentPage === page ? "#58a6ff" : "#30363d",
                  }}
                >
                  {page}
                </Button>
              ))}

            <Button
              size="sm"
              variant="outline"
              bg="#21262d"
              color="#c9d1d9"
              borderColor="#30363d"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              _hover={{ bg: "#30363d" }}
            >
              Next →
            </Button>

            {/* Per Page Selector */}
            <HStack gap={2} ml={4}>
              <Text color="#8b949e" fontSize="sm">
                Show:
              </Text>
              <select
                value={perPage}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  handlePerPageChange(val);
                }}
                style={perPageSelectStyle}
              >
                {smartPerPageOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </HStack>
          </Flex>
        </Flex>
      )}
    </Box>
  );
}
