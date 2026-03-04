// File Name: hsc-core.js
export class HSCEngine {
    constructor() {
        this.db = JSON.parse(localStorage.getItem('HSC_DATABASE')) || {
            users: [
                { id: "A-001", name: "Dr. Hudson", username: "admin", password: "123", role: "admin", finalGrade: "N/A" },
                { id: "S-001", name: "Student Alpha", username: "student", password: "123", role: "student", finalGrade: "0%" }
            ],
            assignments: [],
            submissions: [],
            accessLogs: [] // New: Security Audit Trail
        };
    }

    isAdmin() {
        const session = JSON.parse(localStorage.getItem('HSC_CURRENT_USER'));
        const isAuth = session && session.role === 'admin';
        if (!isAuth && session) {
            this.logViolation(session.username, "Unauthorized Command Attempt");
        }
        return isAuth;
    }

    logViolation(username, action) {
        this.db.accessLogs.push({
            timestamp: new Date().toLocaleString(),
            username: username,
            incident: action
        });
        this.sync();
    }

    sync() {
        localStorage.setItem('HSC_DATABASE', JSON.stringify(this.db));
    }

    // ... (Existing addUser, deleteUser, gradeWork methods from previous steps)
}
export const hsc = new HSCEngine();
