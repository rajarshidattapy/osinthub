# 🕵️‍♂️ OSINT Hub

> **The GitHub for Legal and Intelligence Operations.**
> *Collaborative, secure, and AI-powered investigations for the modern professional.*

---

## 🚀 Overview

**OSINT Hub** is a cutting-edge platform designed to bring the rigor of software version control to the world of Open Source Intelligence (OSINT). We're building the definitive workspace where analysts, journalists, and legal professionals can **collaborate on cases**, **track evidence**, and **generate insights** with the power of AI.

Think of it as **Git for Investigations**—but smarter, sleeker, and purpose-built for intelligence.

## ✨ Key Features

*   **📁 Case Management (Repositories):** Treat every investigation like a code repository. Version control your evidence, track changes, and never lose a lead.
*   **🤝 Collaborative Workflows (Joining Requests):** Work together seamlessly. Propose additions to cases via "Joining Requests" (our take on Pull Requests) and review changes before merging.
*   **🤖 AI-Powered Insights:** Leverage built-in AI to summarize data, find connections, and automate the tedious parts of your investigation.
*   **🔒 Secure & Auditable:** Role-based access control and a complete audit trail ensure your sensitive data remains secure and admissible.
*   **📊 Interactive Dashboards:** Visualize your case progress and team activity in real-time.
*   **⚖️ Legal Tech Integration:** Specialized tools for lawyers and judges to stay updated with AI-powered searches and legal trends.

## 🎯 Who is this for?

### 🛡️ For Cybersecurity Analysts
Map adversary infrastructure, catalog Indicators of Compromise (IoCs), and collaborate on threat intelligence in a secure environment.

### 📰 For Investigative Journalists
Build bulletproof stories. Collaboratively verify sources, maintain evidence integrity, and use AI to validate information.

### 🏢 For Corporate Security
Conduct internal investigations and due diligence with a structured workflow that ensures data privacy and discretion.

### ⚖️ For Lawyers and Judges
Navigate the complex legal landscape with AI-powered tools designed to explain regulations, track trends, and modernize legal research.

## 🛠️ Tech Stack

**Frontend:**
*   ⚛️ **React** + **Vite** (Blazing fast build tool)
*   🎨 **Tailwind CSS** (Utility-first styling)
*   ✨ **Framer Motion** (Smooth, professional animations)
*   🔐 **Clerk** (Secure authentication)

**Backend:**
*   🐍 **Python 3.11** + **FastAPI** (High-performance API)
*   🗄️ **SQLAlchemy** + **PostgreSQL** (Robust data management)
*   🧠 **Google Generative AI** (Intelligence engine)

## ⚡ Getting Started

### Prerequisites
*   Node.js & npm
*   Python 3.11 (Note: Python 3.14 is currently not supported due to dependency compatibility)
*   PostgreSQL

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/rajarshidattapy/osinthub.git
    cd osinthub
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    # Create virtual environment (Python 3.11 recommended)
    py -3.11 -m venv venv
    # Activate virtual environment
    .\venv\Scripts\activate
    # Install dependencies
    pip install -r requirements.txt
    # Run the server
    uvicorn main:app --reload
    ```

3.  **Frontend Setup**
    ```bash
    # Open a new terminal in the root directory
    npm install
    npm run dev
    ```

4.  **Explore**
    Open [http://localhost:5173](http://localhost:5173) to start your investigation!

---

*Built with ❤️ for the OSINT and Legal Community.*
