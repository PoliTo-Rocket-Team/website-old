export interface PieSlice {
    portion: number;
    label: string;
    color?: number;
}

export interface Pie {
    title: string;
    slices: PieSlice[];
}

export const pies: Pie[] = [
    {
        title: "Courses of members",
        slices: [
            { portion: .6, label: "Aerospace", color: 0x3bdb84 },
            { portion: .3, label: "Mechanical", color: 0xdd4991 },
            { portion: .1, label: "Others", color: 0xdd0011 },
        ]
    }
]