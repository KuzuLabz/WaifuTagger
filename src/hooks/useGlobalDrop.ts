import { useEffect } from "react";

export const useGlobalDrop = () => {
    useEffect(() => {
        const handleDragOver = (event: DragEvent) => {
            event.preventDefault();
            event.stopPropagation();
        };

        const handleDrop = (event: DragEvent) => {
            event.preventDefault();
            event.stopPropagation();
        };

        const options = { capture: false } as AddEventListenerOptions;

        window.addEventListener('dragover', handleDragOver, options);
        window.addEventListener('drop', handleDrop, options);

        return () => {
            window.removeEventListener('dragover', handleDragOver, options);
            window.removeEventListener('drop', handleDrop, options);
        };
    }, []);
};