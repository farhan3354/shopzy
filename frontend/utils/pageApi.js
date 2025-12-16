import api from "./api";

export const pageApi = {
  createPage: (pageData) => api.post("/pages/dynamic", pageData),
  getPages: () => api.get("/pages/dynamic"),
  getPageBySlug: (slug) => api.get(`/pages/dynamic/${slug}`),
  updatePage: (slug, pageData) => api.put(`/pages/dynamic/${slug}`, pageData),
  deletePage: (slug) => api.delete(`/pages/dynamic/${slug}`),
};
