export const ticketAutomationData=[
 {
    key : 1,
   Rule_ID: "#ER005",
   Rule_Name :" Auto Assign IT Login Issues",
   Trigger_Event: "Ticket Created",
   Condition: "Category = Login Issue",
   Action: "Assign Ticket",
   Assigned_To: "Assigned Agent",
   Status: "Active",
   
 },
  {
     key : 2,
   Rule_ID: "#ER004",
   Rule_Name :" Auto Assign IT Login Issues",
   Trigger_Event: "Ticket Created",
   Condition: "Priority = Critical",
   Action: "Send Email Notification",
   Assigned_To: "Support Manager",
   Status: "Active",
   
 },
  {
     key : 3,
   Rule_ID: "#ER003",
   Rule_Name :"  SLA Breach Escalation",
   Trigger_Event: "SLA Breached",
   Condition: "Response Time &gt; SLA",
   Action: "Escalate Ticket",
   Assigned_To: "Team Lead",
   Status: "Active",
   
 },
  {
     key : 4,
   Rule_ID: "#ER002",
   Rule_Name :"Auto Close Inactive Tickets",
   Trigger_Event: "Time Based",
   Condition: "No Update for 7 Days",
   Action: "Close Ticket",
   Assigned_To: "System",
   Status: "Active",
   
 },
  {
     key : 5,
   Rule_ID: "#ER001",
   Rule_Name :"Priority Change Notification",
   Trigger_Event: "Priority Updated",
   Condition: "Priority = High",
   Action: "Assign Ticket",
   Assigned_To: "Assigned Agent",
   Status: "Active",
   
 },
]