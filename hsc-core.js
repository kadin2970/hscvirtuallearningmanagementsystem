// File Name: hsc-core.js
export class HSCEngine {
    constructor() {
        // Initialize from local storage or defaults
        this.db = JSON.parse(localStorage.getItem('HSC_DATABASE')) || {
            users: [
                { id: "A-001", name: "Dr. Alistair Hudson", role: "admin", email: "a.hudson@hudson.edu", grade: "N/A" },
                { id: "S-999", name: "Student Alpha", role: "student", email: "s.alpha@hudson.edu", grade: "88%" }
            ],
            assignments: []
        };
    }

    sync() {
        localStorage.setItem('HSC_DATABASE', JSON.stringify(this.db));
    }

    updateUserGrade(id, newGrade) {
        const user = this.db.users.find(u => u.id === id);
        if (user) {
            user.grade = newGrade;
            this.sync();
        }
    }

    publishAssignment(title, desc, link) {
        const task = {
            id: 'TASK-' + Math.floor(Math.random() * 10000),
            title,
            desc,
            link,
            date: new Date().toLocaleDateString()
        };
        this.db.assignments.push(task);
        this.sync();
        return task;
    }
}

export const hsc = new HSCEngine();
