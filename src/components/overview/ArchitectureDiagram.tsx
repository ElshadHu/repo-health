"use client";
import type { FileIssueMapping } from "@/server/types";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  Box,
  Text,
  VStack,
  Input,
  HStack,
  Badge,
  IconButton,
} from "@chakra-ui/react";
import {
  FaSearch,
  FaSitemap,
  FaTimes,
  FaMapMarkerAlt,
  FaPlus,
  FaMinus,
  FaCompress,
} from "react-icons/fa";
import * as d3 from "d3";
import { FileDetailsPanel } from "./FileDetailsPanel";

interface FileNode {
  path: string;
  type: "blob" | "tree";
  size?: number;
}

interface HierarchyNode {
  name: string;
  path?: string;
  children?: HierarchyNode[];
  value?: number;
}

type Props = {
  fileTree: FileNode[];
  owner: string;
  repo: string;
  fileIssueMap?: FileIssueMapping;
};

function buildHierarchy(
  files: FileNode[],
  repoName: string,
  maxDepth = 3
): HierarchyNode {
  const root: HierarchyNode = { name: repoName, path: "", children: [] };

  // Limit files to avoid overcrowding
  const limitedFiles = files.slice(0, 100);

  limitedFiles.forEach((file) => {
    const parts = file.path.split("/");
    let current = root;
    let currentPath = "";

    // Limit depth
    const limitedParts = parts.slice(0, maxDepth + 1);

    limitedParts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isFile = index === limitedParts.length - 1 && file.type === "blob";
      let child = current.children?.find((c) => c.name === part);

      if (!child) {
        child = {
          name: part,
          // Use original file.path for files, currentPath for folders because files show wrong direction
          path: isFile ? file.path : currentPath,
          ...(isFile ? { value: file.size || 100 } : { children: [] }),
        };
        current.children = current.children || [];
        current.children.push(child);
      }

      if (!isFile) {
        current = child;
      }
    });
  });

  return root;
}

const FOLDER_COLORS: Record<string, string> = {
  src: "#58a6ff",
  app: "#a371f7",
  components: "#f778ba",
  server: "#7ee787",
  lib: "#ffa657",
  utils: "#ffc107",
  hooks: "#ff6b6b",
  types: "#79c0ff",
  api: "#7ee787",
  pages: "#a371f7",
  prisma: "#5a67d8",
  packages: "#58a6ff",
  routers: "#7ee787",
  services: "#7ee787",
};

export function ArchitectureDiagram({
  fileTree,
  owner,
  repo,
  fileIssueMap = {},
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [highlightedPath, setHighlightedPath] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleZoomIn = useCallback((): void => {
    if (!svgRef.current || !zoomRef.current) {
      return;
    }
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomRef.current.scaleBy, 1.3);
  }, []);

  const handleZoomOut = useCallback((): void => {
    if (!svgRef.current || !zoomRef.current) {
      return;
    }
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomRef.current.scaleBy, 0.7);
  }, []);

  const handleZoomReset = useCallback((): void => {
    if (!svgRef.current || !zoomRef.current) {
      return;
    }
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomRef.current.transform, d3.zoomIdentity);
  }, []);

  // Filter files for search suggestions
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const query = searchQuery.toLowerCase();
    return fileTree
      .filter((f) => f.path.toLowerCase().includes(query))
      .slice(0, 8);
  }, [fileTree, searchQuery]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || fileTree.length === 0)
      return;

    const width = Math.max(containerRef.current.clientWidth, 1200);
    const hierarchyData = buildHierarchy(fileTree, repo);
    const root = d3.hierarchy(hierarchyData);

    const nodeCount = root.descendants().length;
    const height = Math.max(600, nodeCount * 25);
    const treeLayout = d3
      .tree<HierarchyNode>()
      .size([height - 40, width - 250]);
    const treeRoot = treeLayout(root);

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg.append("g");

    const initialX = 100;
    const initialY = 20;

    // Calculate content bounds - the tree can be taller than the viewport
    const contentWidth = width;
    const contentHeight = height;
    const viewportHeight = Math.min(
      1200,
      containerRef.current.clientHeight || 600
    );

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .extent([
        [0, 0],
        [width, viewportHeight],
      ])
      .translateExtent([
        [-200, 0],
        [contentWidth + 200, contentHeight],
      ])
      .on("zoom", (event) => {
        // Apply zoom transform - keep initial offset fixed, only apply zoom transform
        const tx = event.transform.x + initialX;
        const ty = event.transform.y + initialY;
        g.attr(
          "transform",
          `translate(${tx}, ${ty}) scale(${event.transform.k})`
        );
        setZoomLevel(event.transform.k);
      })
      .filter((event) => {
        // Allow programmatic zoom (from buttons) to always work
        if (
          event.type === "start" ||
          event.type === "zoom" ||
          event.type === "end"
        ) {
          return true;
        }
        // For wheel events, only zoom if Ctrl/Cmd is held
        if (event.type === "wheel") {
          return event.ctrlKey || event.metaKey;
        }
        // Allow touch pinch zoom (2+ fingers)
        if (event.type === "touchstart" || event.type === "touchmove") {
          return event.touches && event.touches.length >= 2;
        }
        // Allow drag/pan with left mouse button
        if (event.type === "mousedown") {
          return event.button === 0;
        }
        // Block double-click zoom (can be confusing)
        if (event.type === "dblclick") {
          return false;
        }
        return true;
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    // Disable double-click zoom explicitly
    svg.on("dblclick.zoom", null);

    // Set initial transform
    g.attr("transform", `translate(${initialX}, ${initialY})`);
    svg.call(zoom.transform, d3.zoomIdentity);

    g.selectAll(".link")
      .data(treeRoot.links())
      .join("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#30363d")
      .attr("stroke-width", 1.5)
      .attr(
        "d",
        d3
          .linkHorizontal<
            d3.HierarchyPointLink<HierarchyNode>,
            d3.HierarchyPointNode<HierarchyNode>
          >()
          .x((d) => d.y)
          .y((d) => d.x)
      );

    const nodes = g
      .selectAll(".node")
      .data(treeRoot.descendants()) // Include root node (project name)
      .join("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.y},${d.x})`);

    const getDisplayName = (name: string): string => {
      return name.length > 16 ? name.slice(0, 13) + "..." : name;
    };

    const textElements = nodes
      .append("text")
      .attr("x", 14)
      .attr("y", 4)
      .attr("fill", (d) =>
        highlightedPath === d.data.path ? "#000" : "#c9d1d9"
      )
      .attr("font-size", 11)
      .attr("font-family", "monospace")
      .style("cursor", "pointer")
      .text((d) => getDisplayName(d.data.name));

    nodes.each(function () {
      const node = d3.select(this);
      const text = node.select("text");
      const textNode = text.node() as SVGTextElement;
      const bbox = textNode.getBBox();

      node
        .insert("rect", "text")
        .attr("x", -8)
        .attr("y", -10)
        .attr("width", bbox.width + 26) // 14px left offset + 12px right padding
        .attr("height", 20)
        .attr("rx", 4);
    });

    // Style the rects
    nodes
      .selectAll("rect")
      .attr("fill", (d) => {
        const data = (d as d3.HierarchyPointNode<HierarchyNode>).data;
        const isHighlighted = highlightedPath === data.path;
        if (isHighlighted) return "#ffc107";
        const hasChildren = (d as d3.HierarchyPointNode<HierarchyNode>)
          .children;
        const color =
          FOLDER_COLORS[data.name] || (hasChildren ? "#30363d" : "#21262d");
        return color + (hasChildren ? "44" : "88");
      })
      .attr("stroke", (d) => {
        const data = (d as d3.HierarchyPointNode<HierarchyNode>).data;
        const isHighlighted = highlightedPath === data.path;
        if (isHighlighted) return "#ffc107";
        const hasChildren = (d as d3.HierarchyPointNode<HierarchyNode>)
          .children;
        return (
          FOLDER_COLORS[data.name] || (hasChildren ? "#8b949e" : "#58a6ff")
        );
      })
      .attr("stroke-width", (d) => {
        const data = (d as d3.HierarchyPointNode<HierarchyNode>).data;
        return highlightedPath === data.path ? 2 : 1;
      })
      .style("cursor", "pointer")
      .on("click", (_, d) => {
        const data = (d as d3.HierarchyPointNode<HierarchyNode>).data;
        const hasChildren = (d as d3.HierarchyPointNode<HierarchyNode>)
          .children;
        if (!hasChildren && data.path) {
          if (fileIssueMap[data.path]) {
            setSelectedFile(data.path);
          } else {
            window.open(
              `https://github.com/${owner}/${repo}/blob/main/${data.path}`,
              "_blank"
            );
          }
        }
      });

    textElements.on("click", (_, d) => {
      if (!d.children && d.data.path) {
        if (fileIssueMap[d.data.path]) {
          setSelectedFile(d.data.path);
        } else {
          window.open(
            `https://github.com/${owner}/${repo}/blob/main/${d.data.path}`,
            "_blank"
          );
        }
      }
    });

    // Icons using SVG symbols instead of emojis (fixes hydration error)
    nodes
      .append("rect")
      .attr("class", "icon")
      .attr("x", -5)
      .attr("y", -6)
      .attr("width", 10)
      .attr("height", 10)
      .attr("rx", 2)
      .attr("fill", (d) => (d.children ? "#ffa657" : "#58a6ff"))
      .attr("opacity", 0.8);

    // Red badge for files with issues (positioned BEFORE the file icon)
    nodes.each(function (d) {
      if (!d.children && d.data.path && fileIssueMap[d.data.path]) {
        const node = d3.select(this);
        const issueCount = fileIssueMap[d.data.path].issues.length;

        // Red circle badge - positioned before the file icon
        node
          .append("circle")
          .attr("cx", -18)
          .attr("cy", 0)
          .attr("r", 7)
          .attr("fill", "#f85149");

        // Issue count text
        node
          .append("text")
          .attr("x", -18)
          .attr("y", 3)
          .attr("text-anchor", "middle")
          .attr("fill", "white")
          .attr("font-size", 8)
          .attr("font-weight", "bold")
          .text(issueCount);
      }
    });
  }, [fileTree, highlightedPath, owner, repo, fileIssueMap]);

  const handleSearchSelect = (path: string) => {
    setHighlightedPath(path);
    setSearchQuery("");
  };

  if (!fileTree || fileTree.length === 0) {
    return (
      <Box
        bg="#161b22"
        border="1px dashed #30363d"
        borderRadius="lg"
        p={8}
        textAlign="center"
      >
        <VStack gap={4}>
          <Text color="#8b949e">No file tree data available</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      bg="#161b22"
      border="1px solid #30363d"
      borderRadius="lg"
      p={4}
      position="relative"
    >
      {/* Header with Search and Zoom Controls */}
      <HStack justify="space-between" mb={4} flexWrap="wrap" gap={3}>
        <HStack gap={2}>
          <FaSitemap color="#58a6ff" size={18} />
          <Text fontSize="lg" fontWeight="600" color="#c9d1d9">
            File Structure
          </Text>
        </HStack>

        {/* Zoom Controls */}
        <HStack gap={2}>
          <HStack
            bg="#21262d"
            border="1px solid #30363d"
            borderRadius="md"
            px={2}
            py={1}
            gap={1}
          >
            <IconButton
              aria-label="Zoom out"
              title="Zoom out"
              size="xs"
              variant="ghost"
              color="#8b949e"
              _hover={{ bg: "#30363d", color: "#c9d1d9" }}
              onClick={handleZoomOut}
            >
              <FaMinus size={10} />
            </IconButton>
            <Text color="#8b949e" fontSize="xs" minW="40px" textAlign="center">
              {Math.round(zoomLevel * 100)}%
            </Text>
            <IconButton
              aria-label="Zoom in"
              title="Zoom in"
              size="xs"
              variant="ghost"
              color="#8b949e"
              _hover={{ bg: "#30363d", color: "#c9d1d9" }}
              onClick={handleZoomIn}
            >
              <FaPlus size={10} />
            </IconButton>
            <Box w="1px" h="16px" bg="#30363d" mx={1} />
            <IconButton
              aria-label="Reset zoom"
              title="Reset zoom"
              size="xs"
              variant="ghost"
              color="#8b949e"
              _hover={{ bg: "#30363d", color: "#c9d1d9" }}
              onClick={handleZoomReset}
            >
              <FaCompress size={10} />
            </IconButton>
          </HStack>
        </HStack>

        {/* Search Input */}
        <Box position="relative" w={{ base: "100%", md: "300px" }}>
          <HStack
            bg="#21262d"
            border="1px solid #30363d"
            borderRadius="md"
            px={3}
            py={2}
          >
            <FaSearch color="#8b949e" size={14} />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg="transparent"
              border="none"
              color="#c9d1d9"
              fontSize="sm"
              _placeholder={{ color: "#6e7681" }}
              _focus={{ boxShadow: "none" }}
            />
          </HStack>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <Box
              position="absolute"
              top="100%"
              left={0}
              right={0}
              mt={1}
              bg="#21262d"
              border="1px solid #30363d"
              borderRadius="md"
              zIndex={20}
              maxH="250px"
              overflowY="auto"
            >
              {searchResults.map((file) => (
                <Box
                  key={file.path}
                  px={3}
                  py={2}
                  cursor="pointer"
                  _hover={{ bg: "#30363d" }}
                  onClick={() => handleSearchSelect(file.path)}
                >
                  <Text color="#58a6ff" fontSize="sm" fontFamily="mono">
                    {file.path}
                  </Text>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </HStack>

      {/* Highlighted File Badge */}
      {highlightedPath && (
        <HStack mb={3}>
          <Badge bg="#ffc107" color="#000" px={3} py={1} borderRadius="full">
            <HStack gap={1}>
              <FaMapMarkerAlt size={10} />
              <Text>{highlightedPath}</Text>
            </HStack>
          </Badge>
          <HStack
            color="#8b949e"
            fontSize="xs"
            cursor="pointer"
            _hover={{ color: "#c9d1d9" }}
            onClick={() => setHighlightedPath(null)}
            gap={1}
          >
            <FaTimes size={10} />
            <Text>Clear</Text>
          </HStack>
        </HStack>
      )}

      {/* Legend */}
      <HStack mb={4} flexWrap="wrap" gap={3}>
        <HStack gap={1}>
          <Box w={3} h={3} borderRadius="sm" bg="#ffa657" />
          <Text color="#8b949e" fontSize="xs">
            Folder
          </Text>
        </HStack>
        <HStack gap={1}>
          <Box w={3} h={3} borderRadius="sm" bg="#58a6ff" />
          <Text color="#8b949e" fontSize="xs">
            File (click to open)
          </Text>
        </HStack>
        <HStack gap={1}>
          <Box w={3} h={3} borderRadius="full" bg="#f85149" />
          <Text color="#8b949e" fontSize="xs">
            Has related issues (click to view)
          </Text>
        </HStack>
      </HStack>

      {/* SVG Diagram */}
      <Box overflow="hidden" maxH="1200px">
        <svg
          ref={svgRef}
          style={{
            display: "block",
            minWidth: "100%",
            cursor: "grab",
          }}
          onMouseDown={(e) => {
            if (e.button === 0) {
              e.currentTarget.style.cursor = "grabbing";
            }
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.cursor = "grab";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.cursor = "grab";
          }}
        />
      </Box>

      {/* Help Text */}
      <Text color="#6e7681" fontSize="sm" mt={3} textAlign="center">
        Click and drag to pan • Ctrl/Cmd + scroll to zoom • Click files to open
        in GitHub
      </Text>

      {/* File Details Panel */}
      {selectedFile && fileIssueMap[selectedFile] && (
        <FileDetailsPanel
          filePath={selectedFile}
          description={fileIssueMap[selectedFile].description}
          issues={fileIssueMap[selectedFile].issues}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </Box>
  );
}
