
{
  "company": {
    "name": "DreamTech",
    "type": "Software Outsourcing",
    "layoutEngine": {
      "mode": "DYNAMIC_AUTO_SCALE",
      "tiers": {
        "S": { "minStaff": 1, "maxStaff": 4, "grid": "2x2", "tooltipLod": "FULL" },
        "M": { "minStaff": 5, "maxStaff": 8, "grid": "2x4", "tooltipLod": "COMPACT" },
        "L": { "minStaff": 9, "maxStaff": 16, "grid": "3x4_PAGINATED", "tooltipLod": "PRIORITY_ONLY" }
      }
    },
    "departments": [
      {
        "id": "DEV",
        "name": "Development",
        "buildingName": "Software Lab",
        "managerId": "DEV-001",
        "dynamicLayout": {
          "currentTier": "M",
          "activeDesks": 5,
          "hibernationLoungeSlots": 1,
          "ghostExpansionSlots": 1,
          "autoGroupBy": "project"
        },
        "employees": [
          {
            "id": "DEV-002",
            "name": "David Miller",
            "role": "Backend Developer",
            "status": "Working",
            "seatAllocation": {
              "zone": "ACTIVE_DESK",
              "podId": "POD-BOOKING",
              "slotIndex": 1,
              "isAnchorLead": false
            },
            "currentTask": {
              "id": "TASK-102",
              "title": "Google OAuth Authentication",
              "project": "Booking System",
              "progress": 65,
              "startedAt": "10:30",
              "lastUpdate": "10:42"
            },
            "previousTask": {
              "title": "Implement Login Feature",
              "status": "Completed"
            },
            "nextTask": {
              "title": "Fix Remember Me Issue",
              "status": "Queued"
            },
            "currentTools": [
              "Visual Studio",
              "GitHub"
            ],
            "blockers": []
          }
        ]
      }
    ]
  }
}
