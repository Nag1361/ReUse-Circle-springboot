# Wrapper update verification — 13 November 2026

- Official Maven Wrapper 3.3.4 downloaded and launched Maven 3.9.11 successfully without a globally installed Maven command.
- Maven distribution SHA-512 checked against the official release digest; SHA-256 pinned in the wrapper properties.
- Node wrapper downloaded Node 22.23.5, verified its SHA-256 and ran it from the project .tools directory.
- npm 10.9.9 ran through the wrapper with PATH limited to /usr/bin:/bin (excluding global Node/npm).
- Frontend dependency installation and production build passed through that wrapper.
- Frontend root launcher installed dependencies and Vite reported ready on port 5173.
- Bash/POSIX shell syntax checks passed. Commands were run from a project path containing spaces.
- Backend package verification could not complete: this environment has a Java runtime but lacks a full JDK/compiler supporting release 17. Install a full JDK 17 or 21 on your machine, as the README requires. Maven dependency resolution here required a temporary environment-specific proxy configuration, which is not part of the delivered project.
- Windows and macOS launchers are included but were not executed on those operating systems. Linux x64 was tested.
- MySQL workflows were not rerun; no Java, React, API, database, or application dependency source was changed in this update.

The ZIP includes source, lockfile, launch scripts, wrappers and pinned Node checksums. It excludes downloaded tools, node_modules, generated builds, credentials and test-only configuration. First use needs internet to fetch tools and dependencies.

Wrapper sources: https://maven.apache.org/tools/wrapper/ and https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper-distribution/3.3.4/ . Node release and checksums: https://nodejs.org/dist/v22.23.5/ .
