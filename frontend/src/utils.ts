export function getChatTimestamp(date : Date, timezone : string) {
    let timestamp = date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: timezone
    });

    timestamp = timestamp.toLowerCase();
    const isMay = timestamp.includes("may");

    timestamp = timestamp.charAt(0).toUpperCase() + timestamp.slice(1,3) + (isMay ? "" : ".") + 
        timestamp.slice(3, timestamp.length - 3) + timestamp.slice(timestamp.length - 2);
    return timestamp;
}