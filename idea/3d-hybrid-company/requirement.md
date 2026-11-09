# Product Brief: Virtual Software Company

## 1. Product Vision

Build an interactive Virtual Software Company interface that simulates a real software outsourcing company's internal operations.

The application should feel like a management simulation game combined with a professional project management dashboard.

Users should be able to explore departments, inspect employees, monitor AI agents, and understand what everyone is currently working on.

This is NOT a realistic 3D office visualization and NOT a traditional admin dashboard.

## 2. Visual Direction

- 2D Isometric / 2.5D management simulation.
- Game-like virtual office environment.
- Small character avatars representing employees.
- Clearly separated department rooms.
- Modern, clean, playful but professional.
- Dark navy or charcoal UI with purple accents.
- Smooth hover, selection, and transition animations.
- Avoid photorealistic office renders.
- Avoid excessive game mechanics such as coins, XP, levels, or combat.

## 3. Main Screens

### Screen A: Company Overview

Display the entire virtual company.

Each department room must show:
- Department name.
- Department manager.
- Employee avatars.
- Employee names and job titles.
- Number of active tasks.
- Department operational status.

Clicking a department opens its employee list.

### Screen B: Department Overview

Display all employees belonging to the selected department.

Each employee card shows:
- Avatar.
- Employee ID.
- Full name.
- Job title.
- Current status.
- Current task.
- Task progress.

### Screen C: Employee Activity Dashboard

Every employee must have:

1. Previous Task
   - Task title.
   - Completion status.
   - Completion timestamp.

2. Now Task
   - Current task title.
   - Project name.
   - Progress.
   - Start time.
   - Last activity.
   - Current tools.
   - Current output.

3. Next Task
   - Upcoming task title.
   - Queue status.
   - Dependencies.

4. Employee Status
   - Working.
   - Idle.
   - Waiting.
   - Reviewing.
   - Blocked.
   - Completed.
   - Failed.
   - Offline.

### Screen D: Employee Detail

Tabs:
- Overview
- Tasks
- Activity Log
- Output / Files
- Tools & Permissions
- Performance

### Screen E: CEO Command Center

Display:
- Company health.
- Total employees.
- Active agents.
- Completed tasks.
- Blocked tasks.
- Projects in progress.
- Department performance.
- Pending approvals.
- Critical alerts.

## 4. Initial Departments

- Management
- Business Development
- Project Management
- Software Development
- Quality Assurance
- DevOps / Cloud Engineering
- UI/UX Design
- HR & Administration
- Finance & Accounting

## 5. Important Interaction Rules

- Clicking a room opens its department.
- Clicking an employee opens their detailed profile.
- Hovering over an employee shows a compact activity tooltip.
- Clicking a task opens task details.
- Status changes should be reflected throughout the UI.
- Employee activity should update from backend events, not fabricated random activity.
- The interface must support both AI agents and human employees.

## 6. Design Requirements

- Responsive desktop-first application.
- Persistent navigation.
- Clear visual hierarchy.
- Reusable employee cards.
- Reusable department components.
- Real-time status indicators.
- Loading, empty, error, and disconnected states.
- Mock data for initial prototyping.

## 7. Non-Goals

- No realistic architectural 3D office.
- No traditional HR-only dashboard.
- No unnecessary gamification.
- No fake productivity scores.
- No simulated task completion without actual execution evidence.

## 8. Core Experience

The user should feel like the CEO of a virtual software company.

At any moment, the user should be able to answer:

- Who is working?
- Which department are they in?
- What did they do previously?
- What are they doing now?
- What will they do next?
- Are they blocked?
- What output have they produced?

The UI must prioritize visibility of employee activity and company operations over decorative visuals.