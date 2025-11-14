export interface EditorProps {
    onChange?: any;
    onBlur?: any;
    value?: any;
    useUploadImage?: boolean;
    apiUrl?: string;
    imageUrl?: string;
    config?: any;
}
export type OnDeleteImage = (src: string) => void | Promise<void>;
