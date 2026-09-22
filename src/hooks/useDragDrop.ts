
import { useEffect, useState } from "react";
import { ImageController } from "../utils/selector";

export const useDragDrop = () => {
    const [isHovered, setIsHovered] = useState<boolean>(false);

    useEffect(() => {
        
        const el = document.getElementById('drop-zone');
        if (!el) {
            return;
        };

        const onDragEnter = (e: DragEvent) => {
            e.preventDefault();

            const currentTarget = e.currentTarget as HTMLElement;
            const relatedTarget = e.relatedTarget as Node | null;
            if (relatedTarget && currentTarget && currentTarget.contains(relatedTarget)) {
                return;
            }
        };

        const onDragLeave = (e: DragEvent) => {
            e.preventDefault();
            const currentTarget = e.currentTarget as HTMLElement;
            const relatedTarget = e.relatedTarget as Node | null;
            if (relatedTarget && currentTarget && currentTarget.contains(relatedTarget)) {
                return;
            }

            setIsHovered(false);
        };

        const onDragOver = (e: DragEvent) => {
            e.preventDefault();
            setIsHovered((prev) => (prev ? prev : true));
        };

        const onDrop = (e: DragEvent) => {
            e.preventDefault();
            const dt = e.dataTransfer;
            const uri = dt.getData('text/html').match(/(file:\/\/[^\s"'<>]+|https?:\/\/[^\s"'<>]+)/i)[0];
            const files = Array.from(dt.files);
            if (files && files.length > 0) {
                const file = files[0];
                const localPath:string = (file as any).path || file.name;
                ImageController.fromDrop(localPath.replace('file://', ''));
                return;
            } else {
                console.log('No files!');
            }

            if (uri) {
                if (uri.startsWith('http')) {
                    ImageController.fromUrl(uri);
                } else if (uri.startsWith('file://')) {
                    ImageController.fromDrop(uri.replace('file://', ''));
                }
            }

            setIsHovered(false);
        };

        el.addEventListener('dragenter', onDragEnter);
        el.addEventListener('dragleave', onDragLeave);
        el.addEventListener('dragover', onDragOver);
        el.addEventListener('drop', onDrop);

		return () => {
            el.removeEventListener('dragenter', onDragEnter);
            el.removeEventListener('dragleave', onDragLeave);
            el.removeEventListener('dragover', onDragOver);
			el.removeEventListener('drop', onDrop);
		};
    },[]);
    
    return { isHovered }
};