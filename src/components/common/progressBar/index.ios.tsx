import { Host } from "@expo/ui";
import { ProgressView } from "@expo/ui/swift-ui";
import { progressViewStyle } from "@expo/ui/swift-ui/modifiers";
import { ProgressBarProps } from "./types";
import { ReactNode } from "react";

export const ProgressBar = ({value, indeterminate, hosted = false, ...props}: ProgressBarProps) => {
    const Parent = ({children}: {children: ReactNode}) =>  
            hosted 
            ? <Host {...props}>{children}</Host>
            : <>{children}</>;

    return(
        <Parent>
            <ProgressView
                modifiers={[progressViewStyle('linear')]}
                value={indeterminate ? undefined : value} 
            />
        </Parent>
    );
};

export const CircularProgress = ({value, indeterminate, hosted = false, ...props}: ProgressBarProps) => {
    const Parent = ({children}: {children: ReactNode}) =>  
            hosted 
            ? <Host {...props}>{children}</Host>
            : <>{children}</>;
    return(
        <Parent>
            <ProgressView value={indeterminate ? undefined : value}  modifiers={[progressViewStyle('circular')]} />
        </Parent>
    );
};