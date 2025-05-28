# Problem Set 1 - Write a regex to extract all the numbers with orange color background from the below text in italics (Output should be a list).

{"orders":[{"id":1},{"id":2},{"id":3},{"id":4},{"id":5},{"id":6},{"id":7},{"id":8},{"id":9},{"id":10},{"id":11},{"id":648},{"id":649},{"id":650},{"id":651},{"id":652},{"id":653}],"errors":[{"code":3,"message":"[PHP Warning #2] count(): Parameter must be an array or an object that implements Countable (153)"}]}

```
import re
input = {"orders":[{"id":1},{"id":2},{"id":3},{"id":4},{"id":5},{"id":6},{"id":7},{"id":8},{"id":9},{"id":10},{"id":11},{"id":648},{"id":649},{"id":650},{"id":651},{"id":652},{"id":653}],"errors":[{"code":3,"message":"[PHP Warning #2] count(): Parameter must be an array or an object that implements Countable (153)"}]}
output = re.findall(r': \d+',str(input))
output = map(lambda x:x.replace(": ",""),output)
output = list(output)
print(output)
#Expected o/p: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '648', '649', '650', '651', '652', '653', '3']
```

# Problem Set 3  
A. Write and share a small note about your choice of system to schedule periodic tasks (such as downloading a list of ISINs every 24 hours). Why did you choose it? Is it reliable enough; Or will it scale? If not, what are the problems with it? And, what else would you recommend to fix this problem at scale in production?
* To schedule periodic tasks like downloading a list of ISINs every 24 hours, I chose to use Celery in Django. This setup works well with Django and makes it easy to create and manage background tasks using Python.
  Celery Beat allows us to run tasks on a schedule, similar to how cron jobs work. Celery also supports retrying tasks automatically if something goes wrong, such as a temporary network issue during the ISIN download.
  It is reliable for small to medium projects and has been used in many production systems. However, as the system grows, Celery can become harder to manage. Problems like slow task processing or delays can happen if too many tasks run at once or if the message broker (like Redis or RabbitMQ) gets overloaded.
  For larger systems or more complex workflows, I would suggest using  Apache airflow, AWS lambda.


B. In what circumstances would you use Flask instead of Django and vice versa?
* I would choose Django when building a larger application where I need a lot of features out of the box.
  Django comes with built-in support for user management, admin panels, database handling, and more.
  It follows a standard structure, which makes it easier to scale, maintain, and work on with a team.
  It’s a great choice for full-featured web apps, dashboards, and systems with complex backend logic.
  On the other hand, I would use Flask instead of Django when I need to build a small or simple web application quickly, or when I want full control over how everything is set up.
  Flask is lightweight and doesn’t come with too many built-in features, which makes it easier to start with and more flexible for custom setups.
  It’s a good choice for APIs, microservices, or projects where I want to choose my own tools for things like databases, authentication, and admin interfaces.



# Problem Set 2 - A functioning web app with API

This is a web application designed to incentivize users by allowing them to download and complete tasks (represented by "apps"), upload screenshots as proof, and earn points upon approval by a superuser. Superusers have administrative capabilities to manage apps and review submitted tasks.

## 🚀 Features

### User Features:

* **User Authentication:** Secure signup and login.

* **Dashboard:** View available apps with their points and icons.

* **Task Management:** Initiate a task for an app (simulating download).

* **Screenshot Upload:** Upload a screenshot as proof of task completion.

* **Task Status:** View the status of submitted tasks (Pending Review, Approved).

* **Profile Management:** View and update personal profile information.

* **Points Tracking:** See accumulated points.

### Superuser Features:

* **App Management:** Add and delete apps (including setting points).

* **Task Review:** View all submitted tasks.

* **Approve/Reject Tasks:** Approve or reject user-submitted screenshots, awarding or denying points accordingly.

## ⚙️ How It Works (Architecture)

The application follows a client-server architecture:

* **Frontend (React.js):**

    * Built with React for a dynamic and responsive user interface.

    * Manages user interactions, displays data fetched from the backend, and sends user inputs (e.g., login credentials, screenshots) to the backend APIs.

    * Uses `axios` for making HTTP requests to the Django backend.

    * Includes a polling mechanism on the Dashboard to periodically fetch updated task statuses from the backend, ensuring the UI reflects changes (like superuser approvals) without a manual refresh.

* **Backend (Django REST Framework):**

    * Developed with Django and Django REST Framework to provide robust API endpoints.

    * Handles user authentication (signup, login, token management).

    * Manages app data (creation, retrieval, deletion).

    * Manages user tasks, including screenshot uploads and tracking approval status.

    * Manages user profiles and points.

    * Stores data in a database (e.g., SQLite by default, but configurable for PostgreSQL, MySQL, etc.).

    * Handles static and media file serving (for app icons and screenshots).

## 💻 How to Run on Your PC

To get this project up and running on your local machine, follow these steps:

### Prerequisites

Before you begin, ensure you have the following installed:

* **Python 3.8+**: [Download Python](https://www.python.org/downloads/)

* **pip**: Python package installer (usually comes with Python).

* **Node.js & npm (or Yarn)**: [Download Node.js](https://nodejs.org/en/download/) (npm comes with Node.js, or install Yarn: `npm install -g yarn`)

* **Git**: [Download Git](https://git-scm.com/downloads)

### 1. Backend Setup (Django)

First, set up the Django backend.

```bash
# 1. Clone the repository 
git clone <your-repository-url>
cd <your-repository-name>

# 2. Create and activate a Python virtual environment
python -m venv venv
# On Windows
.\venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

# 3. Install backend dependencies
pip install -r requirements.txt 

# 4. Apply database migrations
python manage.py makemigrations
python manage.py migrate

# 5. Create a superuser (for admin access)
python manage.py createsuperuser
# Follow the prompts to create a username, email, and password.
# I have already created one with username: admin, password:admin

# 6. Run the Django development server
python manage.py runserver
```

The Django server will typically run on `http://localhost:8000`. Keep this terminal window open.

### 2. Frontend Setup (React)

Now, set up the React frontend.

```bash
# 1. Navigate to the frontend directory
cd \django_project\reward_platform\frontend

# 2. Install frontend dependencies
npm install react react-router-dom axios cors

# 3. Ensure API_BASE_URL is correct
# Open src/App.jsx (or your main React file)
# Verify that API_BASE_URL is set to your Django backend:
# const API_BASE_URL = 'http://localhost:8000/api';

# 4. Start the React development server
npm run dev
```

The React application will usually open in your browser at `http://localhost:5173` (or another available port).

## 🚀 Usage

1.  **Access the Application:** Open your web browser and go to `http://localhost:3000`.

2.  **Signup:** Create a new user account.

3.  **Login:** Log in with your new user credentials or the superuser credentials you created.

4.  **User Dashboard:**

    * As a regular user, you'll see "Available Apps" and "My Downloaded Apps".

    * Click "Download & Upload" for an available app to start a task.

    * You'll be redirected to the upload page to submit a screenshot.

    * Once uploaded, the task will appear in "My Downloaded Apps" with a "Pending Review" status.

    * After a superuser approves your task, the app will disappear from "Available Apps" and its status in "My Downloaded Apps" will change to "Approved".

5.  **Superuser Access:**

    * Log in with your superuser credentials.

    * Use the "Manage Apps (Superuser)" link in the navbar to add or delete apps.

    * Use the "Review Tasks (Superuser)" link to see all submitted tasks. You can filter by "Pending Tasks" and approve or reject them.

