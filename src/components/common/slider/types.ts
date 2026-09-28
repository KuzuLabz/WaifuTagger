export type NativeSliderProps = {
    value: number;
    step?: number;
    min: number;
    max: number;
    showValue?: boolean;
    fractionDigits?: number;
    hosted?: boolean;
    onValueChange: (val: number) => void;
};

export type ListSliderProps = {title: string} & NativeSliderProps;