---
alwaysApply: true
scene: git_message
---
# Generate a concise, complete English git commit message
Generate a concise, complete English git commit message that accurately describes the changes made.
- Output the commit message in English only, even if the user writes in Chinese or another language.
- Never output any Chinese characters in the subject, body, or footer.
- Prefer plain ASCII English unless a proper noun requires otherwise.
- Return only the final commit message.
- Do not add explanations, notes, labels, or bilingual output.
- Do not wrap the result with quotes or markdown.
- Keep it under 72 characters for the main subject line
- Use the imperative mood (e.g., "Add feature" not "Added feature")
- Focus on what and why the change was made, not internal implementation details
- Be specific but brief about the modification
- Write the entire commit message exclusively in English
- If a body is included, keep it short and fully in English.
- Do not translate the final commit message into the user's language.
- Good example: `Fix profile layout hook mismatch on account navigation`
