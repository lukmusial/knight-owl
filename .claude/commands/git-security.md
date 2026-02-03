# Git Security Audit

Perform a comprehensive security audit of this repository to identify and remediate files that should not be in a public git repository.

## Audit Scope

Scan the entire project for:

1. **Secrets & Credentials**
   - API keys, tokens, passwords
   - OAuth client secrets
   - Firebase/cloud service configs with keys
   - `.env` files and environment configs

2. **Signing & Certificates**
   - iOS provisioning profiles (*.mobileprovision)
   - Certificates (*.p12, *.cer, *.pem)
   - Android keystores (*.keystore, *.jks)
   - Apple Development Team IDs in pbxproj files

3. **IDE & Editor Files**
   - `.idea/` directory (JetBrains IDEs)
   - `xcuserdata/` directories (Xcode user data)
   - `.vscode/` with personal settings
   - Workspace files with personal paths

4. **Build Artifacts**
   - `node_modules/`
   - `DerivedData/`
   - `build/` directories
   - Compiled binaries

5. **Personal Information**
   - Developer usernames in configs
   - Local machine paths
   - Email addresses in non-standard locations

## Actions

For each finding:
1. Report the file path, what sensitive data it contains, and risk level (high/medium/low)
2. Check if the file is tracked in git using `git ls-files`
3. If tracked and sensitive: remove from git with `git rm --cached <file>` (keeps file locally)
4. Ensure appropriate entries exist in `.gitignore`

## Output

Provide a summary report with:
- List of files removed from git tracking
- Updates made to .gitignore
- Files that remain tracked with justification (e.g., pbxproj needed for builds)
- Recommendations for any manual review needed

## Notes

- Never delete files locally, only remove from git tracking
- The `project.pbxproj` file is required for iOS builds but may contain Team IDs - flag but don't remove
- Create root `.gitignore` if it doesn't exist