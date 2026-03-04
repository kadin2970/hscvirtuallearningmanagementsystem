// File Name: hsc-core.js
export class HSCEngine {
    constructor() {
        this.db = JSON.parse(localStorage.getItem('HSC_DATABASE')) || {
            users: [
                { id: "A-001", name: "Dr. Hudson", username: "admin", password: "123", role: "admin", finalGrade: "N/A" },
                { id: "S-001", name: "Student Alpha", username: "student", password: "123", role: "student", finalGrade: "0" }
            ],
            assignments: [
                { id: "T-101", title: "Logic 101", desc: "Intro to rhetoric.", points: 100 }
            ],
            submissions: [] // Tracks { studentId, assignmentId, score }
        };
    }

    sync() {
        localStorage.setItem('HSC_DATABASE', JSON.stringify(this.db));
    }

    // New: Create User
    addUser(name, username, password, role) {
        const id = (role === 'admin' ? 'A-' : 'S-') + Math.floor(Math.random() * 999);
        this.db.users.push({ id, name, username, password, role, finalGrade: "0" });
        this.sync();
    }

    // New: Grade an assignment
    gradeWork(studentId, assignmentId, score) {
        const subIndex = this.db.submissions.findIndex(s => s.studentId === studentId && s.assignmentId === assignmentId);
        if (subIndex > -1) this.db.submissions[subIndex].score = parseInt(score);
        else this.db.submissions.push({ studentId, assignmentId, score: parseInt(score) });
        
        this.calculateFinalGrade(studentId);
        this.sync();
    }

    calculateFinalGrade(studentId) {
        const user = this.db.users.find(u => u.id === studentId);
        const userSubs = this.db.submissions.filter(s => s.studentId === studentId);
        if (userSubs.length > 0) {
            const avg = userSubs.reduce((acc, curr) => acc + curr.score, 0) / userSubs.length;
            user.finalGrade = avg.toFixed(1) + "%";
        }
    }

    publishAssignment(title, desc, points) {
        this.db.assignments.push({ id: 'T-' + Date.now(), title, desc, points: parseInt(points) });
        this.sync();
    }
}
export const hsc = new HSCEngine();


