/**
 * Calculate the number of days since a given date
 * @param dateString - ISO date string
 * @returns Number of days between the date and now
 */
export function getDaysOld(dateString: string): number {
    const createdDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}
