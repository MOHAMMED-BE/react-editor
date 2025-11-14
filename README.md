# @mbs-dev/react-editor

A lightweight, typed React wrapper around **Jodit** rich‑text editor, designed for real‑world CRUD forms (blogs, products, CMS pages, etc.).

It provides:

- A **simple React component** `<ReactEditor />`
- A reusable **`config()` helper** for configuration
- A reusable **`uploaderConfig()` helper**
- A new **`onDeleteImage` callback** to delete images on server when removed from editor

---

[![npm version](https://img.shields.io/npm/v/@mbs-dev/react-editor.svg)](https://www.npmjs.com/package/@mbs-dev/react-editor)
[![npm downloads](https://img.shields.io/npm/dm/@mbs-dev/react-editor.svg)](https://www.npmjs.com/package/@mbs-dev/react-editor)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@mbs-dev/react-editor.svg)](https://bundlephobia.com/package/@mbs-dev/react-editor)

---

## ✨ Features

- 🧩 Simple React API
- ⚙️ Powerful config builder (`config()`)
- 🖼️ Image upload support
- 🗑️ **New: Server‑side image delete support (`onDeleteImage`)**
- 🔥 Fully typed (TS/TSX)
- 📦 Built for npm libraries

---

## 📦 Installation

```bash
npm install @mbs-dev/react-editor
```

---

## 🚀 Quick Start

```tsx
import React, { useMemo, useState } from "react";
import ReactEditor, { config } from "@mbs-dev/react-editor";

const MyPage = () => {
  const [content, setContent] = useState("");

  const editorConfig = useMemo(() => config({}), []);

  return (
    <ReactEditor
      config={editorConfig}
      value={content}
      onChange={setContent}
    />
  );
};
```

---

# 🔧 Configuration (Full API)

## `config(params: ConfigParams)`

```ts
type ConfigParams = {
  includeUploader?: boolean;
  apiUrl?: string;
  imageUrl?: string;
  onDeleteImage?: (imageUrl: string) => void | Promise<void>;
};
```

### Example

```tsx
const editorConfig = useMemo(
  () =>
    config({
      includeUploader: true,
      apiUrl: `${apiUrl}/upload`,
      imageUrl: blogPostImgUrl,
      onDeleteImage: handleDeleteImage,
    }),
  []
);
```

---

# 🖼️ Image Uploading

The backend must return:

```json
{
  "success": true,
  "data": {
    "files": ["uploaded.webp"],
    "messages": []
  },
  "msg": "Upload successful"
}
```

Images get inserted automatically:

```html
<img src="https://domain.com/uploads/images/filename.webp" />
```

---

# 🗑️ NEW — Image Delete (Server Sync)

The editor detects removed `<img>` tags and calls your function:

### **TSX Implementation**

```tsx
const handleDeleteImage = async (imageSrc: string) => {
  const filename = imageSrc.split("/").pop();
  if (!filename) return;

  await axios.delete(`${apiUrl}/delete/${filename}`);
};
```

---

# 🧩 Full TSX Example (Add Blog)

```tsx
const AddBlog = () => {
  const [description, setDescription] = useState("");

  const handleDeleteImage = async (imageSrc: string) => {
    const filename = imageSrc.split("/").pop();
    if (!filename) return;
    await axios.delete(`${apiUrl}/delete/${filename}`);
  };

  const editorConfig = useMemo(
    () =>
      config({
        includeUploader: true,
        apiUrl: `${apiUrl}/upload`,
        imageUrl: blogPostImgUrl,
        onDeleteImage: handleDeleteImage,
      }),
    []
  );

  return (
    <ReactEditor
      config={editorConfig}
      value={description}
      onChange={setDescription}
    />
  );
};
```

---

# 🧩 Symfony API Platform Full Example

## **1. Upload base directory**

`config/services.yaml`

```yaml
parameters:
    blog_post_images: '%kernel.project_dir%/public/uploads/images_dir'
```

---

## **2. Symfony Upload & Delete Service**

```php
<?php

final class UploaderService
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly ParameterBagInterface $params
    ) {}

    public function uploadBlogPostImages(array $uploadedFiles): array
    {
        if ($uploadedFiles === []) {
            throw new BadRequestHttpException('Les fichiers sont requis.');
        }

        $uploadedFileNames = [];

        foreach ($uploadedFiles as $file) {
            if (!$file instanceof UploadedFile) {
                continue;
            }

            $image = new BlogPostImages();
            $image->setImageFile($file);

            $this->entityManager->persist($image);
            $uploadedFileNames[] = $image->getImage();
        }

        if ($uploadedFileNames === []) {
            throw new BadRequestHttpException('Aucun fichier valide n’a été fourni.');
        }

        $this->entityManager->flush();

        return $uploadedFileNames;
    }

    public function deleteBlogPostImage(string $filename): void
    {
        $cleanName = basename($filename);

        $imageEntity = $this->entityManager
            ->getRepository(BlogPostImages::class)
            ->findOneBy(['image' => $cleanName]);

        if (!$imageEntity) {
            throw new NotFoundHttpException("L'image demandée n'existe pas.");
        }

        $fileDir = str_replace('\\', '/', $this->params->get('blog_post_images'));
        $filePath = rtrim($fileDir, '/') . '/' . $cleanName;

        if (is_file($filePath)) {
            unlink($filePath);
        }

        $this->entityManager->remove($imageEntity);
        $this->entityManager->flush();
    }
}
```

---

## **3. Delete endpoint**

```php
public function deleteImage(string $filename): JsonResponse
{
    $this->uploaderService->deleteBlogPostImage($filename);

    return new JsonResponse([
        'success' => true,
        'message' => "L'image a été supprimée avec succès.",
    ]);
}
```

---

## **4. React Integration**

```ts
export const blogPostImgUrl = `${apiUrl}/uploads/post`;
```

```tsx
const handleDeleteImage = async (src: string) => {
  const filename = src.split("/").pop();
  if (filename)
    await axios.delete(`${apiUrl}/post/delete/${filename}`);
};
```

---

# 📘 API Summary

| Feature            | Supported |
|-------------------|-----------|
| Image upload       | ✅ |
| Image delete sync  | ✅ |
| TypeScript ready   | ✅ |
| Config builder     | ✅ |

---

# 📝 License

MIT — free for commercial and private use.
