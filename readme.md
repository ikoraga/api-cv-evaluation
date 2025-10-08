# 🧠 CV & Project Report Evaluation System

This system evaluates **CVs** and **Project Reports (PDF)** using a **Large Language Model (LLM)**, **RabbitMQ**, and **Prisma ORM**.  
The process runs asynchronously — uploaded files are sent to a message queue, processed by a worker, and the analysis results are stored in the database.

---

## 🚀 Features

- Upload CV & Project Report (PDF)
- Asynchronous evaluation via RabbitMQ
- Automated AI-based analysis with LLM
- Database storage using Prisma ORM
- Result endpoint for viewing analysis output

---

## ⚙️ Installation

### 1️⃣ Clone Repository

```bash
git clone https://github.com/username/cv-evaluation.git
cd cv-evaluation

npm install

Configure .env

PORT=3000
BASE_URL=http://localhost:3000

# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=admin
RABBITMQ_PASS=admin123

# LLM / AI Model
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_API_KEY=gsk_yourapikey
LLM_MODEL_NAME=openai/gpt-oss-20b

# Database (example: MySQL)
DATABASE_URL="mysql://root:password@localhost:3306/cv_evaluation"


🗄️ Database Setup (Prisma + MySQL)
1️⃣ Ensure MySQL is running
sudo service mysql start


Or via Docker:

docker run --name mysql -e MYSQL_ROOT_PASSWORD=password -p 3306:3306 -d mysql:8

2️⃣ Initialize Prisma
npx prisma init



4️⃣ Run Database Migration
npx prisma migrate dev --name init

5️⃣ Generate Prisma Client
npx prisma generate

🐇 Setup RabbitMQ

Use Docker:

docker run -d --name rabbitmq \
 -p 5672:5672 -p 15672:15672 \
 -e RABBITMQ_DEFAULT_USER=admin \
 -e RABBITMQ_DEFAULT_PASS=admin123 \
 rabbitmq:3-management


Dashboard: http://localhost:15672

Login: admin / admin123

▶️ Running the Application
Start API Server
npm run dev


The server will run at: http://localhost:3000

Start the Worker
node src/worker.js


The worker listens for new jobs in the evaluation queue.

📤 Upload Files (via Postman)

Endpoint:
POST /upload

Body → form-data

Key	        Type	Description
cv	        File	CV file (PDF)
report	    File	Project report (PDF)

Response (200 OK):

{
  "cv_id": "cv-1759670773762-724178361.pdf",
  "report_id": "report-1759670784029-351761821.pdf",
  "cv_url": "http://localhost:3000/uploads/cv-1759670773762-724178361.pdf",
  "report_url": "http://localhost:3000/uploads/report-1759670784029-351761821.pdf"
}


Uploaded files are stored locally in:

src/public/uploads/

⚙️ Evaluation Process

The worker reads both uploaded PDFs.

Text is extracted using pdf-parse.

The extracted text is sent to the LLM API (e.g., Groq, OpenAI).

The LLM responds with structured JSON feedback such as:

{
  "feedback": "Strong backend and AI foundation with clear structure.",
  "technicalCompetence": 88,
  "problemSolving": 82,
  "communication": 75,
  "relevance": 85,
  "overallScore": 82.5
}


The worker saves all feedback and scores in the database with status done.

Endpoint:
GET /evaluate

{
"id": "1759927098782",
"status": "queued"
}


📊 Retrieve Evaluation Result

Endpoint:
GET /result/:id

Example:

GET http://localhost:3000/result/cmgdj3lkf0000vbw85sgjhdqb


Response:

{
    "id": "1759927098782",
    "status": "completed",
    "result": {
        "cv_match_rate": 0.72,
        "cv_feedback": "Iko demonstrates a solid foundation in full‑stack development with a focus on JavaScript, Node.js, and PHP, and has experience deploying Python‑based search and expert systems. The project portfolio shows practical problem‑solving and system integration skills, especially in migration and healthcare contexts. However, the CV could benefit from clearer formatting, removal of duplicate entries, and more concise descriptions to improve readability and impact.",
        "project_score": 3.69,
        "project_feedback": "The report clearly outlines a relevant problem—network anomaly detection—and demonstrates a solid application of established machine learning models (Random Forest, XGBoost) with impressive accuracy. However, the technical depth could be enhanced by detailing the system architecture, feature engineering choices, hyperparameter tuning, and deployment pipeline. The novelty is moderate; incorporating continuous learning and real‑time integration adds value, but the approach remains within conventional bounds. Practical implementation is promising, yet scalability, performance under high traffic, and integration with SIEM systems deserve further elaboration. Overall, a competent foundation that could benefit from deeper technical exposition and broader system context.",
        "overall_summary": "Iko brings a solid full‑stack foundation, with strong JavaScript/Node.js and PHP skills and proven experience deploying Python‑based search and expert systems.
    }
}

```
