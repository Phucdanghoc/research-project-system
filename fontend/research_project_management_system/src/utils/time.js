export class TimeService {
    static getCurrentDate() {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}-${month}-${day}`;
    }
    static convertDateToString(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${day}-${month}-${year}`;
    }
    static convertDateStringToDDMMYYYY(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${day}-${month}-${year}`;
    }
    static convertDateToISO(date) {
        return date.toISOString().split("T")[0]; // YYYY-MM-DD
    }

    static getStartDateOfWeek(date) {
        const startOfWeek = new Date(date);
        const dayOfWeek = startOfWeek.getDay() || 7;
        startOfWeek.setDate(startOfWeek.getDate() - (dayOfWeek - 1));
        return startOfWeek;
    }
    static getEndDateOfWeek(date) {
        const endOfWeek = new Date(date);
        const dayOfWeek = endOfWeek.getDay() || 7;
        endOfWeek.setDate(endOfWeek.getDate() + (7 - dayOfWeek));
        return endOfWeek;
    }

}