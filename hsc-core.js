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

    // --- GRADING LOGIC (The Vanish Trigger) ---
    gradeWork(studentId, assignmentId, score) {
        let sub = this.db.submissions.find(s => s.studentId === studentId && s.assignmentId === assignmentId);
        if (sub) {
            sub.score = parseInt(score);
            sub.status = "Graded"; // This status hides the card from the student
        } else {
            this.db.submissions.push({ 
                studentId, 
                assignmentId, 
                score: parseInt(score), 
                status: "Graded", 
                timestamp: new Date().toLocaleString() 
            });
        }
        this.calculateFinalGrade(studentId);
        this.sync();
    }

    submitAssignment(studentId, assignmentId) {
        const sub = this.db.submissions.find(s => s.studentId === studentId && s.assignmentId === assignmentId);
        if (!sub) {
            this.db.submissions.push({ studentId, assignmentId, score: 0, status: "Turned In" });
        } else {
            sub.status = "Turned In";
        }
        this.sync();
    }

    calculateFinalGrade(studentId) {
        const user = this.db.users.find(u => u.id === studentId);
        const userSubs = this.db.submissions.filter(s => s.studentId === studentId);
        const earned = userSubs.reduce((acc, curr) => acc + (curr.score || 0), 0);
        const possible = this.db.assignments.reduce((acc, curr) => acc + curr.points, 0);
        user.finalGrade = possible > 0 ? ((earned / possible) * 100).toFixed(1) + "%" : "0%";
    }
}
export const hsc = new HSCEngine();
