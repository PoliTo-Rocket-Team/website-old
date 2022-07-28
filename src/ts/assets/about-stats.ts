export interface PieSlice {
    portion: number;
    label: string;
    color: number;
}

export interface Pie {
    title: NonNullable<string>;
    slices: NonNullable<PieSlice[]>;
    rotate: number;
}

export const pies: Pie[] = [
    {
        title: "Members distribution among courses",
        slices: [
            { portion: .727272, label: "Aerospace", color: 0x3bdb84 },
            { portion: .045454, label: "ECE", color: 0xdd4991 },
            { portion: .045454, label: "Mechanical", color: 0xdd0011 },
            { portion: .045454, label: "Physics", color: 0x2479cf },
            { portion: .136363, label: "Other", color: 0xb28c23 },
        ],
        rotate: 1.41*Math.PI,
    }
]