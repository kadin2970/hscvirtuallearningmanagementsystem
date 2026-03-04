// File Name: hsc-core.js
export class HSCEngine {
    constructor() {
        this.db = JSON.parse(localStorage.getItem('HSC_DATABASE')) || {
            users: [{ id: "A-01", name: "Dr. Hudson", username: "admin", password: "123", role: "admin", finalGrade: "N/A" }],
            assignments: [],
            submissions: [], 
            accessLogs: []
        };
    }

    sync() { localStorage.setItem('HSC_DATABASE', JSON.stringify(this.db)); }

    publishAssignment(title, points, link, dueDate) {
        this.db.assignments.push({ 
            id: 'T-' + Date.now(), title, points: parseInt(points), 
            link: link || "#", dueDate: dueDate || "No Date" 
        });
        this.sync();
    }

    editAssignment(id, title, points, link, dueDate) {
        const task = this.db.assignments.find(a => a.id === id);
        if (task) {
            task.title = title;
            task.points = parseInt(points);
            task.link = link || "#";
            task.dueDate = dueDate || "No Date";
            this.db.users.filter(u => u.role === 'student').forEach(s => this.calculateFinalGrade(s.id));
            this.sync();
        }
    }

    submitAssignment(studentId, assignmentId) {
        const sub = this.db.submissions.find(s => s.studentId === studentId && s.assignmentId === assignmentId);
        const ts = new Date().toLocaleString();
        if (sub) { sub.status = "Turned In"; sub.timestamp = ts; } 
        else { this.db.submissions.push({ studentId, assignmentId, score: 0, status: "Turned In", timestamp: ts }); }
        this.sync();
    }

    gradeWork(studentId, assignmentId, score) {
        let sub = this.db.submissions.find(s => s.studentId === studentId && s.assignmentId === assignmentId);
        if (sub) { sub.score = parseInt(score); sub.status = "Graded"; } 
        else { this.db.submissions.push({ studentId, assignmentId, score: parseInt(score), status: "Graded", timestamp: new Date().toLocaleString() }); }
        this.calculateFinalGrade(studentId);
    }

    calculateFinalGrade(studentId) {
        const user = this.db.users.find(u => u.id === studentId);
        if (!user) return;
        const graded = this.db.submissions.filter(s => s.studentId === studentId && s.status === "Graded");
        const earned = graded.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0);
        const possible = graded.reduce((acc, curr) => {
            const task = this.db.assignments.find(a => a.id === curr.assignmentId);
            return acc + (task ? (Number(task.points) || 0) : 0);
        }, 0);
        user.finalGrade = possible > 0 ? ((earned / possible) * 100).toFixed(1) + "%" : "N/A";
        this.sync();
    }
}
export const hsc = new HSCEngine();
