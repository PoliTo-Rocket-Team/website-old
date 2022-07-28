export interface PieSlice {
    portion: number;
    label: string;
    color: number;
}

export interface Pie {
    title: string;
    slices: PieSlice[];
}

export const pies: Pie[] = [
    {
        title: "Members distribution among courses",
        slices: [
            { portion: .727272, label: "Aerospace", color: 0x3bdb84 },
            { portion: .045454, label: "ECE", color: 0xdd4991 },
            { portion: .045454, label: "Mechanical", color: 0xdd0011 },
            { portion: .045454, label: "Physics", color: 0x2479cf },
            { portion: .136366, label: "Other", color: 0xb28c23 },
        ]
    }
]