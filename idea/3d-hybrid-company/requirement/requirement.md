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

## 6.1. Dynamic Office Layout (Auto-Scaling Room & Seating Engine)

To support departments with varying and dynamically changing staff/agent counts without manual map redesign or visual clutter, each department interior must implement a **Dynamic Office Layout** mechanism:

1. **Automatic Room Tier Scaling (`Room Tier Auto-Scaling`)**:
   - **Tier S (`Compact Studio` — 1 to 4 staff):** Renders a compact `2x2` isometric desk cluster with priority space for wall KPI boards and a strategy table, plus 1 dashed `+ Auto-Scale Slot` ghost desk.
   - **Tier M (`Standard Lab` — 5 to 8 staff):** Automatically expands the isometric floor depth to `2x4` (two symmetric desk clusters with a central glowing walkway).
   - **Tier L (`Mega Floor / Multi-Pod` — 9 to 16+ staff):** Groups desks into specialized **Project/Role Sub-Pods** and activates a **Floor / Wing Switcher (`Floor 1`, `Floor 2`)** so the isometric viewport never becomes overcrowded.

2. **Smart Seat Allocation & Status Zoning**:
   - **Anchor Lead Seat:** The Department Manager / Lead is automatically placed at the head/center desk closest to the main planning board.
   - **Project Affinity Clustering:** Employees/Agents collaborating on the same project or in a `Dev <-> Reviewer` pair are seated in adjacent slots.
   - **Active Desks vs. 0-Token Hibernation Lounge:** Only active states (`Working`, `Reviewing`, `Blocked`) occupy main computer desks. Staff/Agents in `Idle` or long `Waiting` states automatically transition to the room's **Sofa Lounge / 0-Token Hibernation Pods**, visually freeing up workspace and indicating `$0` token consumption.

3. **Adaptive Tooltip Level-of-Detail (`Adaptive LOD`)**:
   - **1–4 staff:** Full speech bubbles (`Status Dot + Task Name + Progress %`).
   - **5–8 staff:** Compact action pills on active workers.
   - **9+ staff:** Priority Exception mode — only `Blocked` and `Waiting Approval` bubbles stay pinned open; normal `Working` desks show a subtle floor ring + monitor progress bar and expand on hover.

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