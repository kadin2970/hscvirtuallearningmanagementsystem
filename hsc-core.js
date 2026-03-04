// File Name: hsc-core.js
export class HSCEngine {
    constructor() {
        this.db = JSON.parse(localStorage.getItem('HSC_DATABASE')) || {
            users: [
                { id: "A-01", name: "Dr. Hudson", username: "admin", password: "123", role: "admin", finalGrade: "N/A" }
            ],
            assignments: [],
            submissions: [], 
            accessLogs: [] 
        };
    }

    sync() { localStorage.setItem('HSC_DATABASE', JSON.stringify(this.db)); }

    // Security Logging
    logViolation(username, action) {
        this.db.accessLogs.push({
            timestamp: new Date().toLocaleString(),
            username: username,
            incident: action
        });
        this.sync();
    }

    // User Management
    addUser(name, username, password, role) {
        const id = (role === 'admin' ? 'A-' : 'S-') + Math.floor(Math.random() * 9999);
        this.db.users.push({ id, name, username, password, role, finalGrade: "0%" });
        this.sync();
    }

    editUser(id, n, u, p) {
        const user = this.db.users.find(x => x.id === id);
        if (user) { 
            user.name = n; user.username = u; user.password = p; 
            this.sync(); 
        }
    }

    deleteUser(id) {
        this.db.users = this.db.users.filter(u => u.id !== id);
        this.sync();
    }

    // Assignment & Grading
    publishAssignment(title, points, link) {
        this.db.assignments.push({ id: 'T-'+Date.now(), title, points: parseInt(points), link: link || "#" });
        this.sync();
    }

    gradeWork(studentId, assignmentId, score) {
        let sub = this.db.submissions.find(s => s.studentId === studentId && s.assignmentId === assignmentId);
        if (sub) sub.score = parseInt(score);
        else this.db.submissions.push({ studentId, assignmentId, score: parseInt(score), status: "Graded" });
        this.calculateFinalGrade(studentId);
        this.sync();
    }

    calculateFinalGrade(studentId) {
        const user = this.db.users.find(u => u.id === studentId);
        const userSubs = this.db.submissions.filter(s => s.studentId === studentId);
        const earned = userSubs.reduce((acc, curr) => acc + curr.score, 0);
        const possible = this.db.assignments.reduce((acc, curr) => acc + curr.points, 0);
        user.finalGrade = possible > 0 ? ((earned / possible) * 100).toFixed(1) + "%" : "0%";
    }
}
export const hsc = new HSCEngine();
