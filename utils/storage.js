export function setStorage(key, value) {
    if (typeof window === "undefined") return null
    localStorage.setItem(key, JSON.stringify(value));
}

export function getStorage(key) {
    if (typeof window === "undefined") return null
    const value = localStorage.getItem(key);
    if (value) {
        return JSON.parse(value);
    }
    return null
}