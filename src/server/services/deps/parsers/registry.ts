// Re-export all parsers with their configs

import * as npm from "./npm";
import * as pypi from "./pypi";
import * as go from "./go";
import * as cargo from "./cargo";
import * as conan from "./conan";
import * as nuget from "./nuget";
import type { Ecosystem } from "../../../types";

export type ParsedDep = {
  name: string;
  version: string;
};

export type ParserConfig = {
  ecosystem: Ecosystem;
  files: string[];
  parse: (content: string) => ParsedDep[];
};

export const parsers: ParserConfig[] = [
  { ecosystem: npm.ecosystem, files: npm.files, parse: npm.parse },
  { ecosystem: pypi.ecosystem, files: pypi.files, parse: pypi.parse },
  { ecosystem: go.ecosystem, files: go.files, parse: go.parse },
  { ecosystem: cargo.ecosystem, files: cargo.files, parse: cargo.parse },
  { ecosystem: conan.ecosystem, files: conan.files, parse: conan.parse },
  { ecosystem: nuget.ecosystem, files: nuget.files, parse: nuget.parse },
];
