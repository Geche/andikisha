export const escalationRulesData=[
 {
    key: 1,
   Rule_ID: "#ER005",
   Trigger_Type : "SLA Breach",
   Priority: "Critical",
   Condition :"No resolution",
   Escalation_Level: "Level 1",
   Escalates_To: "Team Lead",
   Time_Threshold:"30 mins",
   Status:"Active"
  
 },
  {
     key: 2,
   Rule_ID: "#ER004",
   Trigger_Type : "SLA Breach",
   Priority: "High",
    Condition :"No resolution",
   Escalation_Level: "Level 1",
   Escalates_To: "Support Lead",
   Time_Threshold:"1 hour",
   Status:"Active",
  
 },
  {
     key: 3,
   Rule_ID: "#ER003",
   Trigger_Type : "Status Based",
   Priority: "Medium",
   Condition :"Ticket in Progress",
   Escalation_Level: "Level 1n",
   Escalates_To: "Supervisor",
   Time_Threshold: "4 hours",
   Status:"Active",
  
 },
  {
     key: 4,
   Rule_ID: "#ER002",
   Trigger_Type : "Priority Based",
   Priority: "Medium",
    Condition :"Ticket not assigned",
   Escalation_Level: "Level 1",
   Escalates_To: "Admin",
   Time_Threshold: "6 hours",
   Status: "Active",
  
 },
  {
     key: 5,
   Rule_ID: "#ER001",
   Trigger_Type : "Time Based",
   Priority: ">Low",
    Condition :"Pending too long",
   Escalation_Level: "Level 2",
   Escalates_To: "Support Lead",
   Time_Threshold: "8 hours",
   Status: "Active",
  
 },
 
 
]