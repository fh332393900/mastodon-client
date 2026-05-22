## ADDED Requirements

### Requirement: Status with spoiler text hides content by default
When a status has a non-empty `spoilerText`, the system SHALL hide the body content, preview card, and poll from initial view.

#### Scenario: Status with spoiler text shows warning and hides body
- **WHEN** a StatusCard renders a status where `spoilerText` is a non-empty string
- **THEN** the spoiler text is displayed as a warning label
- **AND** the status body content (`MastodonContent`) is not rendered
- **AND** the preview card (`StatusPreviewCard`) is not rendered
- **AND** the poll (`StatusPoll`) is not rendered

#### Scenario: Status without spoiler text shows content normally
- **WHEN** a StatusCard renders a status where `spoilerText` is empty or null
- **THEN** the body content, preview card, and poll render normally

### Requirement: Media is blurred when status has spoiler text
When a status has a non-empty `spoilerText`, the system SHALL apply a visual blur effect to all media attachments.

#### Scenario: Media blurred with spoiler text present
- **WHEN** a StatusCard renders a status with `spoilerText` and media attachments
- **THEN** the media area is overlaid with a semi-transparent dark layer
- **AND** images/videos appear blurred using CSS filter
- **AND** a label "Click to view" is shown centered over the media

#### Scenario: Media renders clearly without spoiler text
- **WHEN** a StatusCard renders a status without `spoilerText` and with media attachments
- **THEN** media renders normally without blur or overlay

### Requirement: User can reveal hidden content
The system SHALL allow the user to click the spoiler warning area or blurred media to reveal the full content.

#### Scenario: Click spoiler warning reveals content and clears media blur
- **WHEN** user clicks on the spoiler warning area or blurred media
- **THEN** the body content, preview card, and poll become visible
- **AND** media blur and overlay are removed

#### Scenario: Revealed content can be hidden again
- **WHEN** a spoiler has been revealed
- **AND** user clicks the "Hide" toggle button
- **THEN** body content, preview card, and poll are hidden again
- **AND** media returns to blurred state with overlay
