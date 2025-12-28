export const toBool = (value) => {
    if (typeof value === 'boolean') return value
    if (typeof value === 'number') return value === 1
    if (typeof value === 'string') return value.toLocaleLowerCase() === "true" || value === "1"
    return !!value
}