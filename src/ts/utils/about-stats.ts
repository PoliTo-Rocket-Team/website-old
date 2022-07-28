export interface PieSlice {
    value: number;
    label: string;
    color: number;
}

export interface Pie {
    title: NonNullable<string>;
    slices: NonNullable<PieSlice[]>;
    threshold: NonNullable<number>;
    rotate: number;
}

export const pies: Pie[] = [
    {
        title: "Members distribution among courses",
        slices: [
            { value: 16, label: "Aerospace", color: 0x3bdb84 },
            { value: 1, label: "ECE", color: 0xdd4991 },
            { value: 1, label: "Mechanical", color: 0xdd0011 },
            { value: 1, label: "Physics", color: 0x2479cf },
            { value: 3, label: "Other", color: 0xb28c23 },
        ],
        rotate: 255,
        threshold: 5,
    }
]