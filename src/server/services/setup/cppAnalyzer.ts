import type { CriticalIssue, SetupFilesResult } from "../../types/setup";

type CppBuildSystem = "cmake" | "makefile" | "vcpkg" | "unknown";

function detectBuildSystem(files: SetupFilesResult): CppBuildSystem {
  if (files.cmakeLists) return "cmake";
  if (files.makefile) return "makefile";
  if (files.vcpkgJson) return "vcpkg";
  return "unknown";
}

export function analyzeCpp(files: SetupFilesResult): CriticalIssue[] {
  const issues: CriticalIssue[] = [];
  const buildSystem = detectBuildSystem(files);

  if (buildSystem === "unknown") return issues;

  // CMake analysis
  if (files.cmakeLists) {
    const cmakeVersionMatch = files.cmakeLists.match(
      /cmake_minimum_required\s*\(\s*VERSION\s+(\d+\.\d+(?:\.\d+)?)/i
    );
    if (cmakeVersionMatch) {
      issues.push({
        id: "cmake-version",
        type: "environment",
        severity: "critical",
        title: `CMake ${cmakeVersionMatch[1]}+ required`,
        description: `This project requires CMake version ${cmakeVersionMatch[1]} or higher`,
        solution: {
          command: "cmake --version",
        },
      });
    }

    // Check for C++ standard
    const cxxStandardMatch = files.cmakeLists.match(
      /set\s*\(\s*CMAKE_CXX_STANDARD\s+(\d+)\s*\)/i
    );
    if (cxxStandardMatch) {
      issues.push({
        id: "cpp-standard",
        type: "configuration",
        severity: "info",
        title: `C++${cxxStandardMatch[1]} standard`,
        description: `This project uses C++${cxxStandardMatch[1]} standard`,
        solution: {
          command: "g++ --version",
        },
      });
    }

    // Check for project name
    const projectMatch = files.cmakeLists.match(/project\s*\(\s*(\w+)/i);
    if (projectMatch) {
      issues.push({
        id: "cmake-project",
        type: "configuration",
        severity: "info",
        title: `CMake project: ${projectMatch[1]}`,
        description: "CMake-based build system detected",
        solution: {
          command: "cmake -B build",
        },
      });
    }
  }

  // Makefile analysis
  if (files.makefile && !files.cmakeLists) {
    issues.push({
      id: "cpp-makefile",
      type: "configuration",
      severity: "info",
      title: "Makefile detected",
      description: "This project uses Makefile for build automation",
      solution: {
        command: "make",
      },
    });
  }

  // vcpkg package manager detection
  if (files.vcpkgJson) {
    try {
      const vcpkgConfig = JSON.parse(files.vcpkgJson);
      const depCount = vcpkgConfig?.dependencies?.length || 0;

      issues.push({
        id: "vcpkg-deps",
        type: "dependency",
        severity: "warning",
        title: `${depCount} vcpkg dependencies`,
        description: "This project uses vcpkg for dependency management",
        solution: {
          command: "vcpkg install",
        },
      });
    } catch {
      issues.push({
        id: "vcpkg-detected",
        type: "dependency",
        severity: "info",
        title: "vcpkg package manager detected",
        description: "This project uses vcpkg for dependency management",
        solution: {
          command: "vcpkg install",
        },
      });
    }
  }

  return issues;
}

export function getCppQuickStartCommands(files: SetupFilesResult): string[] {
  const commands: string[] = [];
  const buildSystem = detectBuildSystem(files);

  // vcpkg install first if present
  if (files.vcpkgJson) {
    commands.push("vcpkg install");
  }

  // Build commands based on build system
  switch (buildSystem) {
    case "cmake":
      commands.push("cmake -B build");
      commands.push("cmake --build build");
      break;
    case "makefile":
      // Check for common make targets
      const makefile = files.makefile?.toLowerCase() || "";
      if (makefile.includes("all:")) {
        commands.push("make all");
      } else {
        commands.push("make");
      }
      break;
  }

  return commands;
}

export function getCppSetupSteps(files: SetupFilesResult): string[] {
  const steps: string[] = [];
  const buildSystem = detectBuildSystem(files);
  const issues = analyzeCpp(files);

  const cppStandardIssue = issues.find((i) => i.id === "cpp-standard");
  if (cppStandardIssue) {
    const standard =
      files.cmakeLists?.match(/CMAKE_CXX_STANDARD\s+(\d+)/i)?.[1] || "";
    steps.push(`Install C++ compiler supporting C++${standard}`);
  } else {
    steps.push("Install C++ compiler (g++, clang++, or MSVC)");
  }

  // CMake requirement
  if (files.cmakeLists) {
    const cmakeVersionIssue = issues.find((i) => i.id === "cmake-version");
    if (cmakeVersionIssue) {
      const version =
        files.cmakeLists.match(
          /cmake_minimum_required\s*\(\s*VERSION\s+(\d+\.\d+)/i
        )?.[1] || "";
      steps.push(`Install CMake ${version}+ (required)`);
    } else {
      steps.push("Install CMake");
    }
  }

  // vcpkg
  if (files.vcpkgJson) {
    steps.push("Install vcpkg and run vcpkg install");
  }

  // Build steps
  switch (buildSystem) {
    case "cmake":
      steps.push("Configure with cmake -B build");
      steps.push("Build with cmake --build build");
      break;
    case "makefile":
      steps.push("Build with make");
      break;
  }

  if (files.readme?.toLowerCase().includes("test")) {
    if (buildSystem === "cmake") {
      steps.push("Run tests with ctest --test-dir build");
    } else {
      steps.push("Run tests with make test");
    }
  }

  return steps;
}
