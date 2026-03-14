## 🧠 AI Agent Tool Execution Flow

```mermaid
flowchart TD

U[User Message] --> H[HumanMessage Created]

H --> A[AI Model / Agent]

A --> D{Does the task require a Tool?}

D -->|No| R[AI Generates Normal Response]

D -->|Yes| T[Select Appropriate Tool]

T --> P[Prepare Tool Parameters  
using Schema]

P --> F[Call Tool Function]

F --> E[Execute Tool Logic  
Example: sendEmail()]

E --> S[External Service  
SMTP / Email Provider]

S --> O[Tool Returns Result]

O --> M[AI Generates Final Message]

M --> U2[Response Sent to User]
```
What This Diagram Explains

Flow of your system:

User → HumanMessage → AI Agent
        ↓
Check if Tool Needed
        ↓
Select Tool → Prepare Parameters → Execute Tool
        ↓
Return Result → AI Responds to User
Example in Your Project

User input:

Send an email to ritam@gmail.com with subject Hello

AI Agent does:

Understands intent = send email

Selects Email Tool

Creates parameters:

{
  "to": "ritam@gmail.com",
  "subject": "Hello",
  "text": "..."
}

Calls:

sendEmail({to, subject, text})

Tool sends email using Nodemailer

AI responds:

Email sent successfully.