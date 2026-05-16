# FlexNest Integration Setup Guide

This guide outlines how to configure and manage the various integrations within the FlexNest platform. FlexNest bridges the gap between digital collaboration tools and physical workspace management using the following technical specifications.

## 1. Google & Outlook Calendar Sync

### Purpose
Calendar integration allows FlexNest to sync bookings to your work calendar and inform the **AI Workspace Advisor**.

### Technical Details
- **Google Calendar API (v3)**
  - **Endpoint**: `https://www.googleapis.com/calendar/v3/calendars/primary/events`
  - **Parameters**: 
    - `timeMin`: ISO 8601 start time.
    - `timeMax`: ISO 8601 end time.
    - `singleEvents`: `true` (to expand recurring events).
  - **Scopes**: `https://www.googleapis.com/auth/calendar.readonly`
- **Microsoft Graph API (Outlook)**
  - **Endpoint**: `https://graph.microsoft.com/v1.0/me/calendar/calendarView`
  - **Parameters**: 
    - `startDateTime`: ISO 8601 string.
    - `endDateTime`: ISO 8601 string.
  - **Scopes**: `Calendars.Read`

---

## 2. Slack & Microsoft Teams

### Purpose
Automates status updates and sends notifications for bookings.

### Technical Details
- **Slack API**
  - **Status Update**: `https://slack.com/api/users.profile.set`
  - **Parameters**: `profile` JSON object containing `status_text`, `status_emoji`, and `status_expiration`.
  - **Scopes**: `users.profile:write`
- **Microsoft Teams (Graph API)**
  - **Presence Update**: `https://graph.microsoft.com/v1.0/me/presence/setUserPreferredPresence`
  - **Parameters**: `availability`, `activity`, `expirationDuration`.
  - **Scopes**: `Presence.ReadWrite`

---

## 3. HRIS (Workday, SAP, BambooHR)

### Purpose
Syncs leave schedules and organization structure to validate office presence.

### Technical Details
- **Workday REST API**
  - **Endpoint**: `https://{tenant}.workday.com/ccx/api/v1/workers/{id}/timeOff`
  - **Parameters**: `effectiveDate` (to check specific day status).
- **BambooHR API**
  - **Endpoint**: `https://api.bamboohr.com/api/gateway.php/{company}/v1/time_off/requests/`
  - **Parameters**: `start`, `end`, `status=approved`.

---

## 4. Building Access (Lenel, HID, Genetec)

### Purpose
Validates check-ins and auto-releases unused resources.

### Technical Details
- **Lenel OpenAccess API**
  - **Endpoint**: `https://{server}/OpenAccess/Events`
  - **Parameters**: `event_type_id` (Filtered for "Access Granted"), `card_number`.
- **Genetec Web SDK**
  - **Endpoint**: `https://{server}/GSC/SDK/Events`
  - **Parameters**: `EventType=AccessGranted`.

---

## AI Advisor & Integrated Data
The `workspace-advisor-recommendation` flow uses the `getExternalCalendarMeetings` and `getEmployeeHRData` tools to poll these APIs. When active, a **"Integrated Data"** badge appears on the Dashboard, confirming the AI has considered these external parameters.