import React, { useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";

export default function RichTextEditor({ value, onChange, height = 500 }) {
  const editorRef = useRef(null);

  const imageUploadHandler = async (blobInfo, progress) => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("image", blobInfo.blob(), blobInfo.filename());

      progress(0);

      const xhr = new XMLHttpRequest();
      xhr.withCredentials = false;

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          progress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 403) {
          reject({ message: "HTTP Error: " + xhr.status, remove: true });
          return;
        }

        if (xhr.status < 200 || xhr.status >= 300) {
          reject("HTTP Error: " + xhr.status);
          return;
        }

        const json = JSON.parse(xhr.responseText);

        if (!json || typeof json.imageUrl != "string") {
          reject("Invalid JSON: " + xhr.responseText);
          return;
        }

        if (json.success) {
          resolve(json.imageUrl);
        } else {
          reject(json.message || "Image upload failed");
        }
      };

      xhr.onerror = () => {
        reject(
          "Image upload failed due to a XHR Transport error. Code: " +
            xhr.status
        );
      };

      xhr.open("POST", "http://localhost:8000/api/upload/image");
      xhr.send(formData);
    });
  };

  return (
    <Editor
      apiKey="r57z7qpiukxw2dgybheabhvqtuyla0n0io0luqgm8zta35gh"
      onInit={(evt, editor) => (editorRef.current = editor)}
      value={value}
      onEditorChange={onChange}
      init={{
        height: height,
        menubar: "file edit view insert format tools table help",
        plugins: [
          "advlist",
          "autolink",
          "lists",
          "link",
          "image",
          "charmap",
          "preview",
          "anchor",
          "searchreplace",
          "visualblocks",
          "code",
          "fullscreen",
          "insertdatetime",
          "media",
          "table",
          "code",
          "help",
          "wordcount",
          "imagetools",
        ],
        toolbar:
          "undo redo | blocks | bold italic underline strikethrough | " +
          "alignleft aligncenter alignright alignjustify | " +
          "bullist numlist outdent indent | link image media | " +
          "forecolor backcolor removeformat | table | code | fullscreen | " +
          "preview | help",
        content_style: `
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            font-size: 14px; 
            line-height: 1.6;
          }
          img { max-width: 100%; height: auto; }
          table { width: 100%; border-collapse: collapse; }
          table, th, td { border: 1px solid #ccc; }
          th, td { padding: 8px; text-align: left; }
        `,
        images_upload_handler: imageUploadHandler,
        paste_data_images: true,
        image_advtab: true,
        image_caption: true,
        image_dimensions: false,
        file_picker_types: "image",
        file_picker_callback: (callback, value, meta) => {
          if (meta.filetype === "image") {
            const input = document.createElement("input");
            input.setAttribute("type", "file");
            input.setAttribute("accept", "image/*");
            input.setAttribute("multiple", "multiple");

            input.onchange = function () {
              const files = Array.from(this.files);

              files.forEach((file) => {
                const reader = new FileReader();

                reader.onload = function () {
                  // Create a temporary image element to show in editor
                  const id = "blobid" + new Date().getTime();
                  const blobCache = editorRef.current.editorUpload.blobCache;
                  const base64 = reader.result.split(",")[1];
                  const blobInfo = blobCache.create(id, file, base64);
                  blobCache.add(blobInfo);

                  // Show temporary image
                  callback(blobInfo.blobUri(), { title: file.name });

                  // Upload to S3 and replace with permanent URL
                  const formData = new FormData();
                  formData.append("image", file);

                  fetch("http://localhost:8000/api/upload/image", {
                    method: "POST",
                    body: formData,
                  })
                    .then((response) => response.json())
                    .then((data) => {
                      if (data.success) {
                        // Replace temporary blob URL with permanent S3 URL
                        const img = editorRef.current.dom.select(
                          `img[src="${blobInfo.blobUri()}"]`
                        )[0];
                        if (img) {
                          editorRef.current.dom.setAttrib(
                            img,
                            "src",
                            data.imageUrl
                          );
                        }
                      }
                    })
                    .catch((error) => {
                      console.error("Upload failed:", error);
                    });
                };

                reader.readAsDataURL(file);
              });
            };

            input.click();
          }
        },
        templates: [
          {
            title: "Two Column Layout",
            description: "Adds a two column layout",
            content: `
              <div class="row" style="display: flex; gap: 20px;">
                <div class="column" style="flex: 1;">
                  <p>Left column content</p>
                </div>
                <div class="column" style="flex: 1;">
                  <p>Right column content</p>
                </div>
              </div>
            `,
          },
        ],
      }}
    />
  );
}
