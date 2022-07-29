export interface PieSlice {
    value: NonNullable<number>;
    label: NonNullable<string>;
    color: NonNullable<string>;
}

export interface Pie {
    title: NonNullable<string>;
    slices: NonNullable<PieSlice[]>;
    threshold: NonNullable<number>;
    rotate: number;
}

export const pies: Pie[] = [
    {
        title: "Members by program",
        slices: [
            { value: 16, label: "Aerospace Engineering", color: "#3bdb84" },
            { value: 1, label: "Electronic & Communication Engineering", color: "#dd4991" },
            { value: 3, label: "Mechanical Engineering", color: "#dd0011" },
            { value: 1, label: "Physics Engineering", color: "#2479cf" },
            { value: 1, label: "Other non-Engineering", color: "#e1a463" },
        ],
        rotate: 255,
        threshold: 5,
    },
    {
        title: "Members by level",
        slices: [
            { value: 11, label: "Bachelor's", color: "#4e7bc1" },
            { value: 9, label: "Master's", color: "#e1a463" },
            { value: 1, label: "Ph.D.", color: "#3bdb84" },
        ],
        rotate: 0,
        threshold: 0,
    },
    {
        title: "International students rate",
        slices: [
            { value: 19, label: "Domestic", color: "#dd4991" },
            { value: 2, label: "International", color: "#e1a463" },
        ],
        rotate: 0,
        threshold: 0,
    }
]

/**
 * pastel colors
 * blue: #4e7bc1
 * green: #3bdb84
 * gold: #e1a463
 * pink: #dd4991
 */