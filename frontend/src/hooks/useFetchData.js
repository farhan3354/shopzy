import { useState } from "react";
import api from "../../utils/api";
import Swal from "sweetalert2";

export default function useFetchData(token) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (url, setter) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setter(response.data);
      } else {
        console.error("Fetch failed:", response.data.message);
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to fetch data";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateData = async (
    url,
    data = {},
    successMessage = "Operation completed successfully!"
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put(url, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        // alert(successMessage);
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error updating data:", error);
      const errorMessage = error.response?.data?.message || "Operation failed";
      setError(errorMessage);
      // alert(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add DELETE method
  const deleteData = async (
    url,
    successMessage = "Item deleted successfully!"
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        // alert(successMessage);
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting data:", error);
      const errorMessage =
        error.response?.data?.message || "Delete operation failed";
      setError(errorMessage);
      // alert(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteDataCart = async (url, data = null, successMessage = null) => {
    try {
      setLoading(true);
      setError(null);

      const config = data ? { data } : {};
      const response = await api.delete(url, config);

      if (response.data.success) {
        if (successMessage) {
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: successMessage,
            timer: 2000,
            showConfirmButton: false,
          });
        }
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting data:", error);
      const errorMessage =
        error.response?.data?.message || "Delete operation failed";
      setError(errorMessage);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text: errorMessage,
        timer: 3000,
      });

      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add POST method
  const postData = async (
    url,
    data = {},
    successMessage = "Operation completed successfully!"
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post(url, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        // alert(successMessage);
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error posting data:", error);
      const errorMessage = error.response?.data?.message || "Operation failed";
      setError(errorMessage);
      // alert(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (
    url,
    formData,
    successMessage = "File uploaded successfully!",
    onUploadProgress = null
  ) => {
    try {
      setLoading(true);
      setError(null);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      // Add progress callback if provided
      if (onUploadProgress) {
        config.onUploadProgress = onUploadProgress;
      }

      const response = await api.post(url, formData, config);

      if (response.data.success) {
        if (successMessage) {
          // alert(successMessage);
        }
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      const errorMessage =
        error.response?.data?.message || "File upload failed";
      setError(errorMessage);
      // alert(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add method for file upload with PUT
  const updateWithFile = async (
    url,
    formData,
    successMessage = "File updated successfully!",
    onUploadProgress = null
  ) => {
    try {
      setLoading(true);
      setError(null);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      // Add progress callback if provided
      if (onUploadProgress) {
        config.onUploadProgress = onUploadProgress;
      }

      const response = await api.put(url, formData, config);

      if (response.data.success) {
        if (successMessage) {
          // alert(successMessage);
        }
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error updating file:", error);
      const errorMessage =
        error.response?.data?.message || "File update failed";
      setError(errorMessage);
      // alert(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchData,
    updateData,
    deleteData,
    deleteDataCart,
    postData,
    loading,
    error,
    setError,
    uploadFile,
    updateWithFile,
  };
}

// import { useState } from "react";
// import api from "../../utils/api";

// export default function useFetchData(token) {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const fetchData = async (url, setter) => {
//     try {
//       setLoading(true);
//       setError(null);
//       const response = await api.get(url, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (response.data.success) {
//         setter(response.data);
//       } else {
//         console.error("Fetch failed:", response.data.message);
//         setError(response.data.message);
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       const errorMessage =
//         error.response?.data?.message || "Failed to fetch data";
//       setError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateData = async (
//     url,
//     data = {},
//     successMessage = "Operation completed successfully!"
//   ) => {
//     try {
//       setLoading(true);
//       setError(null);
//       const response = await api.put(url, data, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (response.data.success) {
//         alert(successMessage);
//         return response.data;
//       } else {
//         throw new Error(response.data.message);
//       }
//     } catch (error) {
//       console.error("Error updating data:", error);
//       const errorMessage = error.response?.data?.message || "Operation failed";
//       setError(errorMessage);
//       alert(errorMessage);
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   return { fetchData, updateData, loading, error, setError };
// }
