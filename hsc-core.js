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

    isAdmin() {
        const session = JSON.parse(localStorage.getItem('HSC_CURRENT_USER'));
        return session && session.role === 'admin';
    }

    // --- User Management ---
    addUser(name, username, password, role) {
        if (!this.isAdmin()) return;
        const id = (role === 'admin' ? 'A-' : 'S-') + Math.floor(Math.random() * 999);
        this.db.users.push({ id, name, username, password, role, finalGrade: "0%" });
        this.sync();
    }

    editUser(id, n, u, p) {
        if (!this.isAdmin()) return;
        const user = this.db.users.find(x => x.id === id);
        if (user) {
            user.name = n;
            user.username = u;
            user.password = p;
            this.sync();
        }
    }

    deleteUser(id) {
        if (!this.isAdmin()) return;
        this.db.users = this.db.users.filter(u => u.id !== id);
        this.sync();
    }

    // --- Assignment Management ---
    publishAssignment(title, points, link) {
        if (!this.isAdmin()) return;
        this.db.assignments.push({ 
            id: 'T-' + Date.now(), 
            title, 
            points: parseInt(points), 
            link: link || "#" 
        });
        this.sync();
    }

    // --- Grading Logic ---
    gradeWork(studentId, assignmentId, score) {
        if (!this.isAdmin()) return;
        let sub = this.db.submissions.find(s => s.studentId === studentId && s.assignmentId === assignmentId);
        if (sub) {
            sub.score = parseInt(score);
        } else {
            this.db.submissions.push({ studentId, assignmentId, score: parseInt(score), status: "Graded", timestamp: new Date().toLocaleString() });
        }
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

    logViolation(username, action) {
        this.db.accessLogs.push({ timestamp: new Date().toLocaleString(), username, incident: action });
        this.sync();
    }
}
export const hsc = new HSCEngine();
