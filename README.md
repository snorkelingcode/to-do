To-Do
Desktop Application
The simplest desktop task management application built with Electron.

Features
Sleek Modern Interface: Clean design with intuitive controls
Task Management: Create, edit, complete, and delete tasks
Date Navigation: Easily switch between different days
Calendar View: Select dates from a calendar interface
Task Rollover: Option to automatically move uncompleted tasks to the next day
Time Association: Assign specific times to tasks
Local Storage: All your tasks are saved locally on your computer
Cross-Platform: Works on Windows, macOS, and Linux

Installation
Download Pre-built Binaries
You can download the latest version for your operating system from the releases page.
Build from Source
If you prefer to build the application yourself, follow these steps:

Clone the repository:
git clone https://github.com/yourusername/todo-app.git
cd todo-app

Install dependencies:
npm install

Run the application:
npm start

Build the application for your platform:
npm run dist
This will create distributables in the dist folder.

Usage
Creating Tasks

Click the "Add Module" button
Enter a title for your task
Optionally, add a description, time, and select the rollover option
Click "Add Task"

Managing Tasks

Complete a task: Click the checkmark button on a task
Edit a task: Click the pencil icon on a task
Delete a task: Click the X button on a task
Restore a completed task: Click the undo button on a completed task

Date Navigation

Navigate to the next day: Click the right arrow
Navigate to the previous day: Click the left arrow
Open the calendar: Click the calendar icon

Development
Project Structure

main.js - The main Electron process
renderer.js - The renderer process for the UI
index.html - The main application HTML
styles.css - CSS styling
generate-icon.js - Script to generate application icons

Technologies Used

Electron
HTML/CSS/JavaScript
Font Awesome icons

Building for Distribution
The project includes configuration for electron-builder to package the application for different platforms.
To create distribution packages:
npm run dist
Publishing on Steam
This application can be published on Steam under the "Software" category. To publish:

Complete the Steam Direct submission process
Pay the $100 application fee
Prepare store assets (screenshots, description, etc.)
Follow Steam's guidelines for software submission

License
MIT License - See the LICENSE file for details.
Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

Fork the repository
Create your feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add some amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request

Acknowledgments

Font Awesome for the icons
Electron for the framework


Made with ❤️ by Dane Knudsen