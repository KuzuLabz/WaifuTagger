import { CircularWavyProgressIndicator, LinearProgressIndicator, LinearWavyProgressIndicator } from "@expo/ui/jetpack-compose";
import { useAppTheme } from "../../../providers/theme";
import { ProgressBarProps } from "./types";
import { fillMaxSize } from "@expo/ui/jetpack-compose/modifiers";
import { ReactNode } from "react";
import { Host } from "@expo/ui";

export const ProgressBar = ({value, max, indeterminate, variant = 'wavy', hosted = false, ...props}: ProgressBarProps) => {
    const { colors } = useAppTheme();
    
    const Parent = ({children}: {children: ReactNode}) =>  
        hosted 
        ? <Host matchContents={false} {...props} style={{width: '100%', height: 8, ...props.style}}>{children}</Host>
        : <>{children}</>;

    const Progress = variant === 'wavy' ? LinearWavyProgressIndicator : LinearProgressIndicator;

    return(
        <Parent>
            <Progress
                progress={indeterminate ? undefined : (max ? value / max : value)} 
                modifiers={[fillMaxSize()]}
                color={colors.primary}
                trackColor={colors.secondaryContainer}
            />
        </Parent>
    );
};

export const CircularProgress = ({value, max, indeterminate, hosted = false, ...props}: ProgressBarProps) => {
    const { colors } = useAppTheme();

    const Parent = ({children}: {children: ReactNode}) =>  
        hosted 
        ? <Host {...props}>{children}</Host>
        : <>{children}</>;

    return(
        <Parent>
            <CircularWavyProgressIndicator
                progress={indeterminate ? undefined : (max ? value / max : value)} 
                color={colors.primary}
                trackColor={colors.secondaryContainer}
            />
        </Parent>
    );
};