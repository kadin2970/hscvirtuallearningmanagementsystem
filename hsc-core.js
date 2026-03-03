// File Name: hsc-core.js
export class HSCEngine {
    constructor() {
        this.db = JSON.parse(localStorage.getItem('HSC_DATABASE')) || {
            users: [
                { id: "A-001", name: "Dr. Hudson", username: "admin", password: "hsc-password-01", role: "admin", grade: "N/A" },
                { id: "S-999", name: "Student Alpha", username: "student", password: "hsc-password-02", role: "student", grade: "88%" }
            ],
            assignments: []
        };
    }

    sync() {
        localStorage.setItem('HSC_DATABASE', JSON.stringify(this.db));
    }

    // Comprehensive update method
    updateUser(id, updatedFields) {
        const index = this.db.users.findIndex(u => u.id === id);
        if (index !== -1) {
            this.db.users[index] = { ...this.db.users[index], ...updatedFields };
            this.sync();
        }
    }

    publishAssignment(title, desc, link) {
        const task = {
            id: 'TASK-' + Math.floor(Math.random() * 10000),
            title, desc, link,
            date: new Date().toLocaleDateString()
        };
        this.db.assignments.push(task);
        this.sync();
        return task;
    }
}
export const hsc = new HSCEngine();


