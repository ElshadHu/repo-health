// GraphQL query strings for fetching setup-related files
// Batches multiple file fetches into ONE API call to save rate limits

export const SETUP_FILES_QUERY = `
  query GetSetupFiles($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      # CONTRIBUTING.md variants
      contributing: object(expression: "HEAD:CONTRIBUTING.md") {
        ... on Blob { text }
      }
      contributingLower: object(expression: "HEAD:contributing.md") {
        ... on Blob { text }
      }
      docsContributing: object(expression: "HEAD:docs/CONTRIBUTING.md") {
        ... on Blob { text }
      }

      # Node.js / JavaScript
      packageJson: object(expression: "HEAD:package.json") {
        ... on Blob { text }
      }
      nvmrc: object(expression: "HEAD:.nvmrc") {
        ... on Blob { text }
      }

      # Python
      requirementsTxt: object(expression: "HEAD:requirements.txt") {
        ... on Blob { text }
      }
      pyprojectToml: object(expression: "HEAD:pyproject.toml") {
        ... on Blob { text }
      }
      setupPy: object(expression: "HEAD:setup.py") {
        ... on Blob { text }
      }

      # Go
      goMod: object(expression: "HEAD:go.mod") {
        ... on Blob { text }
      }

      # Rust
      cargoToml: object(expression: "HEAD:Cargo.toml") {
        ... on Blob { text }
      }

      # C# / .NET
      globalJson: object(expression: "HEAD:global.json") {
        ... on Blob { text }
      }

      # C++
      cmakeLists: object(expression: "HEAD:CMakeLists.txt") {
        ... on Blob { text }
      }
      vcpkgJson: object(expression: "HEAD:vcpkg.json") {
        ... on Blob { text }
      }
      makefile: object(expression: "HEAD:Makefile") {
        ... on Blob { text }
      }

      # Environment
      envExample: object(expression: "HEAD:.env.example") {
        ... on Blob { text }
      }
      envSample: object(expression: "HEAD:.env.sample") {
        ... on Blob { text }
      }

      # Docker
      dockerCompose: object(expression: "HEAD:docker-compose.yml") {
        ... on Blob { text }
      }
      dockerComposeYaml: object(expression: "HEAD:docker-compose.yaml") {
        ... on Blob { text }
      }

      # Version managers
      toolVersions: object(expression: "HEAD:.tool-versions") {
        ... on Blob { text }
      }

      # README for setup instructions
      readme: object(expression: "HEAD:README.md") {
        ... on Blob { text }
      }

      # Primary language
      primaryLanguage {
        name
      }

      # Default branch info
      defaultBranchRef {
        name
        target {
          ... on Commit {
            oid
            committedDate
          }
        }
      }
    }
  }
`;
