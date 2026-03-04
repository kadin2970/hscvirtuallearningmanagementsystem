// File Name: hsc-core.js
export class HSCEngine {
    constructor() {
        this.db = JSON.parse(localStorage.getItem('HSC_DATABASE')) || {
            users: [
                { id: "A-01", name: "Dr. Hudson", username: "admin", password: "123", role: "admin", finalGrade: "N/A" },
                { id: "S-01", name: "Student Alpha", username: "student", password: "123", role: "student", finalGrade: "0%" }
            ],
            assignments: [],
            submissions: [], 
            accessLogs: []
        };
    }

    sync() {
        localStorage.setItem('HSC_DATABASE', JSON.stringify(this.db));
    }

    // Security & Auth
    isAdmin() {
        const session = JSON.parse(localStorage.getItem('HSC_CURRENT_USER'));
        return session && session.role === 'admin';
    }

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
        if (!this.isAdmin()) return;
        const id = (role === 'admin' ? 'A-' : 'S-') + Math.floor(Math.random() * 999);
        this.db.users.push({ id, name, username, password, role, finalGrade: "0%" });
        this.sync();
    }

    deleteUser(id) {
        if (!this.isAdmin()) return;
        this.db.users = this.db.users.filter(u => u.id !== id);
        this.sync();
    }

    // Assignment Management
    publishAssignment(title, desc, points) {
        if (!this.isAdmin()) return;
        this.db.assignments.push({ id: 'T-' + Date.now(), title, desc, points: parseInt(points) });
        this.sync();
    }

    deleteAssignment(id) {
        if (!this.isAdmin()) return;
        this.db.assignments = this.db.assignments.filter(a => a.id !== id);
        this.db.submissions = this.db.submissions.filter(s => s.assignmentId !== id);
        this.sync();
    }

    // Turn In & Grade Management
    submitAssignment(studentId, assignmentId) {
        const subIndex = this.db.submissions.findIndex(s => s.studentId === studentId && s.assignmentId === assignmentId);
        const timestamp = new Date().toLocaleString();
        if (subIndex > -1) {
            this.db.submissions[subIndex].status = "Turned In";
            this.db.submissions[subIndex].timestamp = timestamp;
        } else {
            this.db.submissions.push({ studentId, assignmentId, score: 0, status: "Turned In", timestamp });
        }
        this.sync();
    }

    gradeWork(studentId, assignmentId, score) {
        if (!this.isAdmin()) return;
        const sub = this.db.submissions.find(s => s.studentId === studentId && s.assignmentId === assignmentId);
        if (sub) {
            sub.score = parseInt(score);
            this.calculateFinalGrade(studentId);
            this.sync();
        }
    }

    calculateFinalGrade(studentId) {
        const user = this.db.users.find(u => u.id === studentId);
        const userSubs = this.db.submissions.filter(s => s.studentId === studentId);
        const maxPoints = this.db.assignments.reduce((acc, curr) => acc + curr.points, 0);
        const earned = userSubs.reduce((acc, curr) => acc + curr.score, 0);
        user.finalGrade = maxPoints > 0 ? ((earned / maxPoints) * 100).toFixed(1) + "%" : "0%";
    }
}
export const hsc = new HSCEngine();
