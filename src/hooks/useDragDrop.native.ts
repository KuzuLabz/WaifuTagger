import { useState } from "react";

export const useDragDrop = () => {
    const [isHovered, setIsHovered] = useState<boolean>(false);
    
    return { isHovered }
};